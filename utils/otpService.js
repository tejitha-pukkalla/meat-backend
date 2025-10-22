const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send OTP via Twilio Verify Service
const sendOTPViaTwilio = async (phoneNumber) => {
  try {
    console.log(`Sending OTP to phone: +91${phoneNumber}`); //can command this line

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: `+91${phoneNumber}`, 
        channel: 'sms',
      });

    console.log('OTP sent via Twilio. Status:', verification.status); // can command this line
 
    return {
      success: true,
      status: verification.status,
      message: 'OTP sent successfully',
    };
  } catch (error) {
    console.error('Twilio Send OTP Error:', error.message);
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

// Verify OTP via Twilio Verify Service
const verifyOTPViaTwilio = async (phoneNumber, otp) => {
  try {
    console.log(`Verifying OTP for phone: +91${phoneNumber}`);  // can command 

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${phoneNumber}`, 
        code: otp,
      });

    console.log('OTP verification response. Status:', verificationCheck.status); // can command thi sline also 

    if (verificationCheck.status === 'approved') {
      return {
        success: true,
        status: verificationCheck.status,
        message: 'OTP verified successfully',
      };
    } else {
      return {
        success: false,
        status: verificationCheck.status,
        message: 'OTP verification failed',
      };
    }
  } catch (error) {
    console.error('Twilio Verify OTP Error:', error.message);
    throw new Error(`Failed to verify OTP: ${error.message}`);
  }
};

module.exports = { sendOTPViaTwilio, verifyOTPViaTwilio };
