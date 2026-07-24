/**
 * Technician Status Feedback Webhook Routes
 * Endpoints:
 * - GET/POST /api/v1/status/:booking_id/completed
 * - GET/POST /api/v1/status/:booking_id/noshow
 */

const express = require('express');
const router = express.Router();
const { processTechnicianCompleted, processTechnicianNoShow } = require('../../services/technicianFeedbackService');

// Completed Status Webhook
router.all('/status/:booking_id/completed', async (req, res) => {
    try {
        const { booking_id } = req.params;
        const result = await processTechnicianCompleted(booking_id);

        return res.status(200).json({
            status: 'success',
            action: 'BOOKING_MARKED_COMPLETED',
            message: `Booking ${booking_id} marked COMPLETED. Moved to Completed Jobs lane on Kanban. 1-5 Star Review Loop triggered.`,
            result
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

// No-Show Status Webhook
router.all('/status/:booking_id/noshow', async (req, res) => {
    try {
        const { booking_id } = req.params;
        const result = await processTechnicianNoShow(booking_id);

        return res.status(200).json({
            status: 'success',
            action: 'BOOKING_MARKED_NOSHOW',
            message: `Booking ${booking_id} marked NO-SHOW. Personalized rescheduling SMS dispatched to client.`,
            result
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
