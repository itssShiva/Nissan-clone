const { generateOtp } = require('./services/otp.service');
const { sendNotification } = require('./services/email.service');

async function test() {
   console.log("Testing OTP...");
   await generateOtp("6306496474");
   console.log("Testing Email...");
   await sendNotification("Test Subject", { test: "data" });
}
test();
