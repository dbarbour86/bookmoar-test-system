/**
 * Inbound Halt Logic Service
 * 
 * Automatically terminates automated workflow sequences for contacts
 * as soon as an inbound SMS response is detected in the system.
 */

const Redis = require('ioredis');

const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

const redis = new Redis(redisConfig);

/**
 * Registers an inbound response halt flag in Redis for a specific contact.
 * This immediately prevents any queued or delayed workflow steps from executing.
 *
 * @param {string} contactId - ID of the contact who replied
 * @param {string} tenantId - Tenant context ID
 * @param {string} messageContent - Content of inbound SMS
 */
async function registerInboundHalt(contactId, tenantId, messageContent) {
    console.log(`[INBOUND HALT SERVICE] Inbound SMS received from Contact ${contactId} on Tenant ${tenantId}.`);
    console.log(`[INBOUND HALT SERVICE] Message: "${messageContent}"`);

    const haltKey = `halt:contact:${tenantId}:${contactId}`;
    
    // Set halt flag in Redis with a 30-day expiration window
    await redis.set(haltKey, JSON.stringify({
        haltedAt: new Date().toISOString(),
        reason: 'INBOUND_SMS_RESPONSE',
        lastMessage: messageContent
    }), 'EX', 86400 * 30);

    console.log(`[INBOUND HALT SERVICE] Successfully registered halt flag: ${haltKey}. All pending delayed jobs for this contact will be aborted.`);
    return { halted: true, haltKey };
}

/**
 * Checks if a contact has replied and has an active halt flag in Redis.
 *
 * @param {string} tenantId - Tenant ID
 * @param {string} contactId - Contact ID
 * @returns {Promise<boolean>} True if sequence should be halted immediately
 */
async function isContactHalted(tenantId, contactId) {
    const haltKey = `halt:contact:${tenantId}:${contactId}`;
    const exists = await redis.get(haltKey);
    return !!exists;
}

/**
 * Clears the halt flag (e.g. if business owner manually restarts sequence).
 */
async function clearInboundHalt(tenantId, contactId) {
    const haltKey = `halt:contact:${tenantId}:${contactId}`;
    await redis.del(haltKey);
    console.log(`[INBOUND HALT SERVICE] Cleared halt flag for contact ${contactId}.`);
}

module.exports = {
    registerInboundHalt,
    isContactHalted,
    clearInboundHalt
};
