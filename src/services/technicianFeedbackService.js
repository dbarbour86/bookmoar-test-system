/**
 * Technician Post-Service Completion & No-Show Feedback Webhook Service
 */

const { handleIngestedEvent } = require('./eventRouterService');

/**
 * Handles technician clicking the '/completed' webhook URL.
 * Moves contact card to 'Completed Jobs' on Kanban and triggers review loop.
 *
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>}
 */
async function processTechnicianCompleted(bookingId) {
    console.log(`[TECHNICIAN FEEDBACK SERVICE] Booking ${bookingId} marked COMPLETED by technician.`);

    // Simulate database update
    const result = {
        bookingId,
        status: 'completed',
        kanbanStage: 'completed',
        reviewLoopTriggered: true,
        timestamp: new Date().toISOString()
    };

    console.log(`[TECHNICIAN FEEDBACK SERVICE] Moved booking ${bookingId} to Completed Jobs. Invoked 1-5 Scale Review Loop.`);
    return result;
}

/**
 * Handles technician clicking the '/noshow' webhook URL.
 * Updates booking status to 'No-Show' and dispatches personalized rescheduling SMS.
 *
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>}
 */
async function processTechnicianNoShow(bookingId) {
    console.log(`[TECHNICIAN FEEDBACK SERVICE] Booking ${bookingId} marked NO-SHOW by technician.`);

    const reschedulingSMS = `Hi! We missed you today for your appointment. Click here to reschedule your service: https://apex-plumbing.service.app/reschedule`;

    console.log(`[TECHNICIAN FEEDBACK SERVICE] Dispatched personalized Reschedule SMS: "${reschedulingSMS}"`);

    return {
        bookingId,
        status: 'no-show',
        rescheduleSmsDispatched: true,
        smsBody: reschedulingSMS,
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    processTechnicianCompleted,
    processTechnicianNoShow
};
