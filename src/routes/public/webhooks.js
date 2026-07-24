/**
 * Webhooks & Ingestion API Routes
 * Endpoint: /api/v1/ingest/:tenant_id
 */

const express = require('express');
const router = express.Router();
const { handleIngestedEvent } = require('../../services/eventRouterService');

router.post('/ingest/:tenant_id', async (req, res) => {
    try {
        const { tenant_id } = req.params;
        const { event_type, contact, payload, call_status, phone_status } = req.body;

        const effectiveEventType = event_type || (call_status ? 'missed_call' : 'form_submission');
        const effectivePayload = payload || { call_status: call_status || phone_status };

        const result = await handleIngestedEvent({
            tenantId: tenant_id,
            eventType: effectiveEventType,
            contactData: contact || { id: req.body.contact_id, phone: req.body.phone, first_name: req.body.first_name },
            payload: effectivePayload
        });

        return res.status(200).json({
            status: 'success',
            tenant_id,
            result
        });
    } catch (error) {
        console.error('[Webhooks Endpoint Error]', error);
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
