/**
 * Event Router Service for Missed Calls & Lead Nurture Loops
 */

const { workflowQueue } = require('../workers/workflowWorker');
const { registerInboundHalt, isContactHalted } = require('./inboundHaltService');

/**
 * Handles incoming webhooks, missed calls, and contact SMS replies.
 * 
 * @param {Object} eventPayload
 * @param {string} eventPayload.tenantId - Target tenant UUID or subdomain
 * @param {string} eventPayload.eventType - E.g. 'missed_call', 'form_submission', 'inbound_sms'
 * @param {Object} eventPayload.contactData - { id, phone, first_name, last_name, email }
 * @param {Object} eventPayload.payload - Additional metadata (e.g. call_status: 'no-answer')
 */
async function handleIngestedEvent({ tenantId, eventType, contactData, payload = {} }) {
    console.log(`[EventRouter] Ingested Event: "${eventType}" for Tenant: ${tenantId}`);

    // 1. Inbound SMS Reply Handler: Instantly deactivate lead nurture queue
    if (eventType === 'inbound_sms') {
        console.log(`[EventRouter] Inbound SMS detected from contact ${contactData.id || contactData.phone}. Halting lead_nurture loop.`);
        await registerInboundHalt(contactData.id, tenantId, payload.messageContent || '');
        return {
            success: true,
            action: 'LEAD_NURTURE_DEACTIVATED',
            contactId: contactData.id,
            status: 'inactive'
        };
    }

    // 2. Missed-Call Event Handler (phone status = 'no-answer')
    if (eventType === 'missed_call' && (payload.call_status === 'no-answer' || payload.phone_status === 'no-answer')) {
        console.log(`[EventRouter] Missed Call ('no-answer') registered for Contact ${contactData.phone}.`);

        const missedCallWorkflowId = `wf-missed-call-${tenantId}`;
        const delaySeconds = 30; // 30-second delay requirement

        const missedCallJobData = {
            tenantId,
            workflowId: missedCallWorkflowId,
            contactId: contactData.id || `c-call-${Date.now()}`,
            nodeIndex: 0,
            incomingEvent: 'missed_call',
            status: 'active',
            nodes: [
                {
                    id: 'node-mc-trigger',
                    type: 'trigger',
                    config: { event_triggers: ['missed_call'], label: 'Missed Call Event' }
                },
                {
                    id: 'node-mc-delay',
                    type: 'delay',
                    config: { durationSeconds: 30, label: '30-Second Buffer' }
                },
                {
                    id: 'node-mc-sms',
                    type: 'communication',
                    config: {
                        channel: 'SMS',
                        templateBody: 'Sorry we missed your call from {{business_name}}! How can we assist you today?',
                        senderConfig: 'Twilio Missed-Call Gateway'
                    }
                }
            ],
            contextData: {
                phone: contactData.phone,
                first_name: contactData.first_name || 'Valued',
                last_name: contactData.last_name || 'Customer',
                call_status: 'no-answer'
            }
        };

        // Queue job with explicit 30-second delay offset
        await workflowQueue.add(
            `missed-call-${contactData.phone}-${Date.now()}`,
            missedCallJobData,
            { delay: delaySeconds * 1000 }
        );

        console.log(`[EventRouter] Successfully queued 30-second Missed-Call Auto-SMS for ${contactData.phone}.`);
        return {
            success: true,
            action: 'MISSED_CALL_SMS_QUEUED',
            delaySeconds,
            phone: contactData.phone
        };
    }

    // 3. Lead Nurture / Form Submission Flow Handler
    if (eventType === 'form_submission' || eventType === 'lead_nurture') {
        // Verify contact is not already halted
        const halted = await isContactHalted(tenantId, contactData.id);
        if (halted) {
            console.log(`[EventRouter] Contact ${contactData.id} is marked inactive/halted. Skipping lead_nurture trigger.`);
            return { success: false, action: 'SKIPPED_CONTACT_INACTIVE' };
        }

        const leadNurtureJobData = {
            tenantId,
            workflowId: `wf-nurture-${tenantId}`,
            contactId: contactData.id,
            nodeIndex: 0,
            incomingEvent: eventType,
            status: 'active',
            nodes: payload.nodes || [],
            contextData: contactData
        };

        await workflowQueue.add(
            `nurture-${contactData.id}-${Date.now()}`,
            leadNurtureJobData,
            { delay: 0 }
        );

        return { success: true, action: 'LEAD_NURTURE_QUEUED' };
    }

    return { success: true, action: 'EVENT_INGESTED_NO_MATCH' };
}

module.exports = {
    handleIngestedEvent
};
