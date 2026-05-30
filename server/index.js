const express = require('express');
const cors = require('cors');
const config = require('./config');

const { sendNotification } = require('./services/email.service');
const { generateOtp, verifyOtp } = require('./services/otp.service');

const app = express();

// ---- CORS ----
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    config.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. curl, Postman, same-origin)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow any origin in development
        if (config.NODE_ENV === 'development') return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// ---- Body Parsing (Express 5 built-in — no body-parser needed) ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Request Logger Middleware ----
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    if (req.method === 'POST' && Object.keys(req.body || {}).length > 0) {
        console.log(`  Payload keys: [${Object.keys(req.body).join(', ')}]`);
    }
    next();
});

// ---- API ROUTES ----

// 0. Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// 1. Generic Form Submission Route
app.post('/api/forms/submit', async (req, res) => {
    try {
        const formData = req.body;

        console.log('----------------------------------------------------');
        console.log('[FORM] New form submission received');
        console.log('[FORM] Body:', JSON.stringify(formData, null, 2));

        if (!formData || Object.keys(formData).length === 0) {
            console.warn('[FORM] Warning: Empty payload received.');
            return res.status(400).json({
                success: false,
                message: 'No form data received. Please check that form fields have name attributes.'
            });
        }

        const formType = formData.formName || formData.formType || 'Contact Form';
        const name = formData['cb-name'] || formData.FirstName || formData.name || formData.fname || 'User';
        const subject = `New ${formType} Submission – ${name}`;

        // Build full data payload with metadata
        const dataPayload = {
            ...formData,
            'Submission Timestamp': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            'Source URL': req.headers.referer || req.headers.origin || 'Unknown',
            'User Agent': req.headers['user-agent'] || 'Unknown'
        };

        // Remove internal markers from email
        delete dataPayload.formName;
        delete dataPayload.formType;

        console.log(`[FORM] Sending email notification: "${subject}"`);
        const success = await sendNotification(subject, dataPayload);

        if (success) {
            console.log('[FORM] ✅ Submission processed successfully.');
            return res.status(200).json({
                success: true,
                message: 'Thank you! Your request has been submitted successfully. Our team will contact you shortly.'
            });
        } else {
            console.error('[FORM] ❌ Email sending failed.');
            return res.status(500).json({
                success: false,
                message: 'Your request was received but we could not send a confirmation. Please try again or call us directly.'
            });
        }
    } catch (error) {
        console.error('[FORM] ❌ Unexpected error during form submission:', error.message);
        console.error(error.stack);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});

// 2. OTP Generation Route
app.post('/api/auth/otp/generate', async (req, res) => {
    try {
        const { identifier } = req.body;

        console.log(`[OTP] Generate request for identifier: ${identifier}`);

        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: 'Identifier (phone/email) is required.'
            });
        }

        const success = await generateOtp(identifier);

        if (success) {
            return res.status(200).json({ success: true, message: 'OTP generated and sent.' });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to generate OTP.' });
        }
    } catch (error) {
        console.error('[OTP] Generation error:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// 3. OTP Verification Route
app.post('/api/auth/otp/verify', async (req, res) => {
    try {
        const { identifier, otp } = req.body;

        console.log(`[OTP] Verify request for identifier: ${identifier}`);

        if (!identifier || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Identifier and OTP are required.'
            });
        }

        const result = await verifyOtp(identifier, otp);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        console.error('[OTP] Verification error:', error.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// ---- 404 Fallback ----
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ---- Start Server ----
app.listen(config.PORT, () => {
    console.log('================================================');
    console.log(` 🚗 Nissan Backend Server Started`);
    console.log(`    Port        : ${config.PORT}`);
    console.log(`    Environment : ${config.NODE_ENV}`);
    console.log(`    Health URL  : http://localhost:${config.PORT}/api/health`);
    console.log(`    Forms API   : http://localhost:${config.PORT}/api/forms/submit`);
    console.log('================================================');
});
