/**
 * Twilio TwiML Routing & Human Confirmation Gate Endpoints
 */

const express = require('express');
const router = express.Router();
const {
    generateInboundDialTwiML,
    generateWhisperTwiML,
    handleGatherResponse,
    handleDialStatus
} = require('../../services/twilioRoutingService');

// 1. Inbound Phone Call Webhook
router.post('/inbound-call', (req, res) => {
    const tenantId = req.query.tenant_id || req.body.tenant_id || 't-001';
    const forwardingPhone = req.body.forwarding_phone || process.env.OWNER_CELL_PHONE || '+15550192834';

    const twiml = generateInboundDialTwiML({ tenantId, forwardingPhone });
    res.type('text/xml');
    return res.send(twiml);
});

// 2. Whisper Screen Webhook (Played to owner when they pick up)
router.post('/whisper', (req, res) => {
    const tenantId = req.query.tenant_id || req.body.tenant_id || 't-001';

    const twiml = generateWhisperTwiML(tenantId);
    res.type('text/xml');
    return res.send(twiml);
});

// 3. Gather Response Webhook (Evaluates pressed digit)
router.post('/gather-response', async (req, res) => {
    try {
        const tenantId = req.query.tenant_id || req.body.tenant_id || 't-001';
        const digits = req.body.Digits || req.body.digits || null;
        const fromPhone = req.body.From || req.body.Caller || '+15552345678';

        const { twiml } = await handleGatherResponse({ tenantId, digits, fromPhone });

        res.type('text/xml');
        return res.send(twiml);
    } catch (error) {
        console.error('[Twilio Gather Webhook Error]', error);
        res.type('text/xml');
        return res.send('<Response><Hangup/></Response>');
    }
});

// 4. Dial Status Webhook
router.post('/dial-status', async (req, res) => {
    try {
        const tenantId = req.query.tenant_id || req.body.tenant_id || 't-001';
        const dialCallStatus = req.body.DialCallStatus || req.body.CallStatus || 'no-answer';
        const fromPhone = req.body.From || req.body.Caller || '+15552345678';

        await handleDialStatus({ tenantId, dialCallStatus, fromPhone });

        res.type('text/xml');
        return res.send('<Response/>');
    } catch (error) {
        console.error('[Twilio Dial Status Webhook Error]', error);
        res.type('text/xml');
        return res.send('<Response/>');
    }
});

module.exports = router;
