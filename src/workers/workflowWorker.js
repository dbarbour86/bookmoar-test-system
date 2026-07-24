const { Worker, Queue } = require('bullmq');
const Redis = require('ioredis');
const { isContactHalted } = require('../services/inboundHaltService');

// Redis Connection Configuration
const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
};

const redisConnection = new Redis(redisConfig);
const WORKFLOW_QUEUE_NAME = 'workflow-execution';
const workflowQueue = new Queue(WORKFLOW_QUEUE_NAME, { connection: redisConnection });

function isWithinExecutionWindow(executionWindow) {
    if (!executionWindow || !executionWindow.enabled) return true;
    const now = new Date();
    const currentDay = now.getDay();
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const daysMatch = executionWindow.allowed_days?.includes(currentDay);
    const startMatch = currentHourMin >= (executionWindow.start_time || '00:00');
    const endMatch = currentHourMin <= (executionWindow.end_time || '23:59');
    return daysMatch && startMatch && endMatch;
}

function matchesMultiTriggerArray(triggerNode, incomingEvent) {
    if (!triggerNode || !incomingEvent) return false;
    const config = triggerNode.config || {};
    if (Array.isArray(config.event_triggers) && config.event_triggers.length > 0) {
        return config.event_triggers.includes(incomingEvent) || config.event_triggers.includes('*');
    }
    if (config.eventFilter) {
        return config.eventFilter === incomingEvent || config.eventFilter === '*';
    }
    return true;
}

/**
 * Advanced Execution Worker processing mindmap flows with parallel path splits,
 * rating gates, and automated rebooking actions.
 */
async function processWorkflowStep(job) {
    const { tenantId, workflowId, contactId, nodeIndex, nodes, edges = [], contextData, workflowMeta, incomingEvent } = job.data;

    console.log(`[WorkflowWorker Mindmap Engine] Job ${job.id} | Tenant: ${tenantId} | NodeIndex: ${nodeIndex}`);

    // Inbound Response Halt Check
    const halted = await isContactHalted(tenantId, contactId);
    if (halted) {
        console.warn(`[SAFEGUARD TRIGGERED: INBOUND HALT] Contact ${contactId} replied. Halting sequence.`);
        return { status: 'HALTED_INBOUND_RESPONSE', contactId, workflowId };
    }

    if (!nodes || nodeIndex >= nodes.length) {
        console.log(`[WorkflowWorker] Workflow ${workflowId} complete for contact ${contactId}.`);
        return { status: 'COMPLETED', nodeIndex };
    }

    const currentNode = nodes[nodeIndex];
    console.log(`[WorkflowWorker] Executing Node [${currentNode.type}] (ID: ${currentNode.id})`);

    // Helper to find and queue all outgoing branches (parallel split support)
    const queueAllOutgoingBranches = async (currentNodeId, sourceHandleId = null, delayMs = 0) => {
        // Find matching edges from this node
        const outgoingEdges = edges.filter(e => {
            if (sourceHandleId) {
                return e.source === currentNodeId && e.sourceHandle === sourceHandleId;
            }
            return e.source === currentNodeId;
        });

        if (outgoingEdges.length === 0) {
            // If no explicit edges, try sequential index fallback
            if (nodeIndex + 1 < nodes.length) {
                await queueNextStep(job.data, nodeIndex + 1, delayMs);
            }
            return;
        }

        for (const edge of outgoingEdges) {
            const targetNodeIdx = nodes.findIndex(n => n.id === edge.target);
            if (targetNodeIdx !== -1) {
                console.log(`[PARALLEL SPLIT] Queueing branch: ${currentNodeId} -> ${edge.target} (NodeIndex: ${targetNodeIdx})`);
                await queueNextStep(job.data, targetNodeIdx, delayMs);
            }
        }
    };

    switch (currentNode.type) {
        case 'trigger': {
            const eventToTest = incomingEvent || contextData?.event || 'form_submission';
            const isMatch = matchesMultiTriggerArray(currentNode, eventToTest);
            if (!isMatch) {
                return { status: 'TRIGGER_MISMATCH', incomingEvent: eventToTest };
            }
            // Queue all parallel split paths originating from the trigger
            await queueAllOutgoingBranches(currentNode.id, null, 0);
            break;
        }

        case 'sentiment_split': {
            // 1-5 Scale Review Gating split
            const rawInput = contextData?.feedback_score || contextData?.messageContent || '5';
            const score = parseInt(String(rawInput).replace(/[^\d]/g, ''), 10) || 5;

            console.log(`[SENTIMENT SPLIT] Parsed feedback score: ${score}/5 for Contact ${contactId}`);

            if (score >= 4) {
                // Route to True output branch (Google Review link SMS)
                await queueAllOutgoingBranches(currentNode.id, 'true_output', 0);
            } else {
                // Route to False output branch (Private Alert & Suppress link)
                const alertKey = `alert:feedback:${tenantId}:${contactId}`;
                await redisConnection.set(alertKey, JSON.stringify({
                    contactId,
                    score,
                    text: contextData?.messageContent || 'Customer left low feedback score',
                    flaggedAt: new Date().toISOString()
                }), 'EX', 86400 * 30);
                await queueAllOutgoingBranches(currentNode.id, 'false_output', 0);
            }
            break;
        }

        case 'send_sms': {
            const { messageText } = currentNode.config || {};
            console.log(`[SMS ACTION] To ${contactId}: "${messageText || 'SMS Message dispatched'}"`);
            await queueAllOutgoingBranches(currentNode.id, null, 0);
            break;
        }

        case 'send_email': {
            const { subject, body } = currentNode.config || {};
            console.log(`[EMAIL ACTION] Subject: "${subject || 'Email Notification'}" to ${contactId}`);
            await queueAllOutgoingBranches(currentNode.id, null, 0);
            break;
        }

        case 'communication': {
            const { channel, templateBody } = currentNode.data || currentNode.config || {};
            console.log(`[COMMUNICATION ACTION] Channel: ${channel || 'SMS'} | Message: "${templateBody || 'Hello'}"`);
            await queueAllOutgoingBranches(currentNode.id, null, 0);
            break;
        }

        case 'delay': {
            const duration = currentNode.data?.duration || currentNode.config?.durationSeconds || 60;
            const unit = currentNode.data?.unit || 'Seconds';
            
            let delayMs = duration * 1000;
            if (unit === 'Minutes') delayMs = duration * 60 * 1000;
            if (unit === 'Hours') delayMs = duration * 3600 * 1000;
            if (unit === 'Days') delayMs = duration * 86400 * 1000;

            console.log(`[DELAY STEP] Holding execution for ${duration} ${unit} (${delayMs}ms)`);
            await queueAllOutgoingBranches(currentNode.id, null, delayMs);
            break;
        }

        default:
            await queueAllOutgoingBranches(currentNode.id, null, 0);
            break;
    }

    return { status: 'STEP_PROCESSED', executedNode: currentNode.id };
}

async function queueNextStep(jobData, nextNodeIndex, delayMs = 0) {
    const payload = {
        ...jobData,
        nodeIndex: nextNodeIndex
    };
    const options = {};
    if (delayMs > 0) {
        options.delay = delayMs;
    }
    await workflowQueue.add(`step-${jobData.workflowId}-${nextNodeIndex}`, payload, options);
}

const workflowWorker = new Worker(
    WORKFLOW_QUEUE_NAME,
    async (job) => processWorkflowStep(job),
    { connection: redisConnection, concurrency: 10 }
);

module.exports = { workflowQueue, workflowWorker, processWorkflowStep };
