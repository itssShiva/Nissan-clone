const otpGenerator = require('otp-generator');
const { sendNotification } = require('./email.service');
const config = require('../config');
const twilio = require('twilio');

// Initialize Twilio Client only if credentials exist
let twilioClient = null;
if (config.TWILIO.ACCOUNT_SID && config.TWILIO.ACCOUNT_SID !== 'your_twilio_account_sid' && config.TWILIO.AUTH_TOKEN) {
    twilioClient = twilio(config.TWILIO.ACCOUNT_SID, config.TWILIO.AUTH_TOKEN);
}

// Simple in-memory mock database for OTPs. 
// In production, this should be Redis or a Database with a TTL.
const otpStore = new Map();

/**
 * Generate and store an OTP
 */
const generateOtp = async (identifier) => {
    const otp = otpGenerator.generate(6, { 
        upperCaseAlphabets: false, 
        specialChars: false,
        lowerCaseAlphabets: false,
        digits: true
    });
    
    // Store OTP with an expiry time (e.g., 5 minutes)
    const expiry = Date.now() + 5 * 60 * 1000;
    otpStore.set(identifier, { otp, expiry });

    // Format phone number, default to India (+91) if 10 digits
    let formattedNumber = identifier.trim();
    if (/^\d{10}$/.test(formattedNumber)) {
        formattedNumber = '+91' + formattedNumber;
    }

    try {
        if (twilioClient) {
            const message = await twilioClient.messages.create({
                body: `Your Nissan login OTP is: ${otp}. It is valid for 5 minutes.`,
                from: config.TWILIO.PHONE_NUMBER,
                to: formattedNumber
            });
            console.log(`✅ [SMS SENT] OTP sent to ${formattedNumber}. Twilio SID: ${message.sid}`);
        } else {
            console.log("⚠️ [WARNING] Twilio not configured. Printing OTP to console:");
            console.log(`[MOCK SMS] OTP for ${formattedNumber} is: ${otp}`);
        }
    } catch (error) {
        console.error("----------------------------------------------------");
        console.error("❌ FAILED TO SEND SMS VIA TWILIO");
        console.error("Error details:", error.message);
        console.error("Please check your Twilio credentials and registered test numbers.");
        console.error("----------------------------------------------------");
        return false;
    }

    return true;
};

/**
 * Verify an OTP
 */
const verifyOtp = async (identifier, submittedOtp) => {
    const record = otpStore.get(identifier);

    if (!record) {
        return { success: false, message: 'OTP not found or expired.' };
    }

    if (Date.now() > record.expiry) {
        otpStore.delete(identifier);
        return { success: false, message: 'OTP has expired.' };
    }

    if (record.otp === submittedOtp) {
        // Clear OTP after successful use
        otpStore.delete(identifier);
        
        // Send success notification to Admin
        await sendNotification(`OTP Verification Completed – ${identifier}`, {
            'User Identifier': identifier,
            'Verification Status': 'Successful',
            'Time': new Date().toLocaleString()
        });

        return { success: true, message: 'OTP verified successfully.' };
    }

    return { success: false, message: 'Invalid OTP.' };
};

module.exports = {
    generateOtp,
    verifyOtp
};
