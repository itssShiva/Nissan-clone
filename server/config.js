require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    ADMIN_RECEIVER_EMAIL: process.env.ADMIN_RECEIVER_EMAIL || 'shiva262architect@gmail.com',
    SMTP: {
        HOST: process.env.SMTP_HOST,
        PORT: process.env.SMTP_PORT,
        USER: process.env.SMTP_USER,
        PASS: process.env.SMTP_PASS
    },
    TWILIO: {
        ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER
    }
};
