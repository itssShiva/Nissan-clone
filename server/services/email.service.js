const nodemailer = require('nodemailer');
const config = require('../config');

// ---- Create Nodemailer transporter ----
const transporter = nodemailer.createTransport({
    host: config.SMTP.HOST || 'smtp.gmail.com',
    port: parseInt(config.SMTP.PORT) || 587,
    secure: parseInt(config.SMTP.PORT) === 465, // true for 465 (SSL), false for 587 (TLS/STARTTLS)
    auth: {
        user: config.SMTP.USER,
        pass: config.SMTP.PASS
    },
    tls: {
        // Do not fail on invalid certs (useful for some hosting providers)
        rejectUnauthorized: false
    }
});

// ---- Verify SMTP connection at startup ----
transporter.verify(function (error, success) {
    console.log('----------------------------------------------------');
    if (error) {
        console.error('❌ [SMTP] Connection verification FAILED:');
        console.error(`   Error Code : ${error.code || 'N/A'}`);
        console.error(`   Message    : ${error.message}`);
        if (error.code === 'EAUTH') {
            console.error('   ➜ Fix: Make sure SMTP_PASS is a valid Gmail App Password (not your regular password).');
            console.error('   ➜ Generate at: https://myaccount.google.com/apppasswords');
        } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
            console.error('   ➜ Fix: Check your SMTP_HOST and SMTP_PORT in server/.env');
        }
    } else {
        console.log('✅ [SMTP] Connection verified — server is ready to send emails.');
        console.log(`   Host : ${config.SMTP.HOST}`);
        console.log(`   Port : ${config.SMTP.PORT}`);
        console.log(`   User : ${config.SMTP.USER}`);
        console.log(`   To   : ${config.ADMIN_RECEIVER_EMAIL}`);
    }
    console.log('----------------------------------------------------');
});

/**
 * Generates a clean HTML email body from a key-value data object.
 */
const generateHtmlBody = (title, data) => {
    const rows = Object.entries(data)
        .map(([key, value]) => `
            <tr>
                <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-weight:600;color:#555;width:38%;vertical-align:top;font-size:13px;">
                    ${escapeHtml(String(key))}
                </td>
                <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;color:#222;font-size:13px;">
                    ${escapeHtml(String(value || 'N/A'))}
                </td>
            </tr>`)
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#c3002f;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">
                Nissan India — Form Submission
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                ${escapeHtml(title)}
              </p>
            </td>
          </tr>
          <!-- Table body -->
          <tr>
            <td style="padding:24px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee;border-radius:4px;overflow:hidden;">
                ${rows}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:16px 32px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0;color:#999;font-size:11px;">
                This is an automated notification from <strong>Nissan India</strong>.<br/>
                Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/** Basic HTML escaping to prevent XSS in email content */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Send an HTML email notification to the admin receiver.
 * @param {string} subject - Email subject line
 * @param {object} data    - Key-value object of form fields to display
 * @returns {boolean} true if sent, false if failed
 */
const sendNotification = async (subject, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [EMAIL] Attempting to send: "${subject}"`);
    console.log(`[EMAIL] To: ${config.ADMIN_RECEIVER_EMAIL}`);

    try {
        const html = generateHtmlBody(subject, data);

        const info = await transporter.sendMail({
            from: `"Nissan India Website" <${config.SMTP.USER}>`,
            to: config.ADMIN_RECEIVER_EMAIL,
            replyTo: data['Email'] || data['email_id'] || data['Email ID'] || config.SMTP.USER,
            subject: subject,
            html: html
        });

        console.log(`[EMAIL] ✅ Sent successfully.`);
        console.log(`[EMAIL]    Message ID : ${info.messageId}`);
        console.log(`[EMAIL]    Response   : ${info.response}`);
        return true;

    } catch (error) {
        console.error(`[EMAIL] ❌ FAILED to send email.`);
        console.error(`[EMAIL]    Code    : ${error.code || 'N/A'}`);
        console.error(`[EMAIL]    Message : ${error.message}`);

        if (error.code === 'EAUTH') {
            console.error('[EMAIL]    ➜ Authentication failed. Verify SMTP_USER and SMTP_PASS in server/.env');
            console.error('[EMAIL]    ➜ For Gmail, use an App Password: https://myaccount.google.com/apppasswords');
        } else if (error.code === 'EENVELOPE') {
            console.error('[EMAIL]    ➜ Invalid sender/recipient email address. Check SMTP_USER and ADMIN_RECEIVER_EMAIL.');
        } else if (error.responseCode >= 500) {
            console.error('[EMAIL]    ➜ SMTP server rejected the message (5xx error). Check your Gmail sending limits.');
        }

        return false;
    }
};

module.exports = { sendNotification };
