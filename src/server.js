const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API Routes
const webhooksRouter = require('./routes/public/webhooks');
const twilioRouter = require('./routes/public/twilioRoutes');
const technicianRouter = require('./routes/public/technicianRoutes');

app.use('/api/v1', webhooksRouter);
app.use('/api/v1/twilio', twilioRouter);
app.use('/api/v1', technicianRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', engine: 'Booking Test System Architecture' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[Express Backend] Running on http://localhost:${PORT}`);
        console.log(`[Twilio Webhook Endpoint] http://localhost:${PORT}/api/v1/twilio/inbound-call`);
        console.log(`[Ingestion Webhook Endpoint] http://localhost:${PORT}/api/v1/ingest/:tenant_id`);
        console.log(`[Technician Feedback Endpoint] http://localhost:${PORT}/api/v1/status/:booking_id/completed`);
    });
}

module.exports = app;
