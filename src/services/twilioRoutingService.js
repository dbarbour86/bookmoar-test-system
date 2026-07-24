/**
 * Twilio Inbound Call Routing & Human Confirmation Gate Service
 */

const { handleIngestedEvent } = require('./eventRouterService');

/**
 * Generates initial TwiML to dial business owner's cell phone with a Whisper Screen URL.
 *
 * @param {Object} params
 * @param {string} params.tenantId - Tenant UUID/subdomain
 * @param {string} params.forwardingPhone - Owner's cell phone number (E.164)
 * @returns {string} TwiML XML string
 */
function generateInboundDialTwiML({ tenantId, forwardingPhone }) {
    const whisperUrl = `/api/v1/twilio/whisper?tenant_id=${encodeURIComponent(tenantId)}`;
    const dialStatusUrl = `/api/v1/twilio/dial-status?tenant_id=${encodeURIComponent(tenantId)}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial timeout="20" action="${dialStatusUrl}" method="POST">
        <Number url="${whisperUrl}">${forwardingPhone}</Number>
    </Dial>
</Response>`;
}

/**
 * Generates TwiML for the Whisper Screen played when owner picks up.
 * Prompts user to press '1' to confirm human presence.
 *
 * @param {string} tenantId - Tenant context ID
 * @returns {string} TwiML XML string
 */
function generateWhisperTwiML(tenantId) {
    const gatherActionUrl = `/api/v1/twilio/gather-response?tenant_id=${encodeURIComponent(tenantId)}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather numDigits="1" timeout="5" action="${gatherActionUrl}" method="POST">
        <Say voice="alice">New Book Moar lead. Press 1 to accept.</Say>
    </Gather>
    <Say voice="alice">No input received. Connecting to missed call auto text.</Say>
    <Hangup/>
</Response>`;
}

/**
 * Processes digit pressed by business owner during Whisper Gather step.
 * If '1', connects the call. If timeout / machine / declined, triggers missed-call ingestion.
 *
 * @param {Object} params
 * @param {string} params.tenantId
 * @param {string} params.digits - Digit pressed ('1' or null)
 * @param {string} params.fromPhone - Lead's incoming phone number
 * @returns {Promise<{ twiml: string, action: string }>}
 */
async function handleGatherResponse({ tenantId, digits, fromPhone }) {
    console.log(`[Twilio Routing Gate] Tenant: ${tenantId} | Digits Received: "${digits}" | Lead Phone: ${fromPhone}`);

    if (digits === '1') {
        console.log(`[Twilio Routing Gate] Human confirmation SUCCESS (Digit '1' pressed). Linking call legs.`);
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Connecting you to your Book Moar lead now.</Say>
</Response>`;
        return { twiml, action: 'HUMAN_CONFIRMED_CALL_CONNECTED' };
    }

    // If no digit pressed or incorrect digit (Carrier Voicemail detected)
    console.warn(`[Twilio Routing Gate] Human confirmation FAILED (Voicemail machine or timeout detected). Terminating call leg & triggering missed-call text.`);

    // Trigger internal missed-call ingestion engine
    await handleIngestedEvent({
        tenantId,
        eventType: 'missed_call',
        contactData: {
            phone: fromPhone || '+15550009999',
            first_name: 'Incoming',
            last_name: 'Caller'
        },
        payload: {
            call_status: 'no-answer',
            reason: 'CARRIER_VOICEMAIL_DETECTED'
        }
    });

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Call declined. Automated text response queued.</Say>
    <Hangup/>
</Response>`;

    return { twiml, action: 'MISSED_CALL_INGESTED_TWIML_HANGUP' };
}

/**
 * Handles dial status webhook when call completes or fails.
 */
async function handleDialStatus({ tenantId, dialCallStatus, fromPhone }) {
    console.log(`[Twilio Dial Status] Tenant: ${tenantId} | Status: "${dialCallStatus}"`);

    if (dialCallStatus !== 'completed') {
        console.log(`[Twilio Dial Status] Call status "${dialCallStatus}" != completed. Fire missed-call handler.`);
        await handleIngestedEvent({
            tenantId,
            eventType: 'missed_call',
            contactData: { phone: fromPhone || '+15550009999', first_name: 'Missed', last_name: 'Caller' },
            payload: { call_status: 'no-answer' }
        });
    }
}

module.exports = {
    generateInboundDialTwiML,
    generateWhisperTwiML,
    handleGatherResponse,
    handleDialStatus
};
