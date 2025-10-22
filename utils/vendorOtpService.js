// const twilio = require('twilio');

// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// // Send Reset OTP via Twilio Verify Service (FOR ADMIN PASSWORD RESET)
// const sendAdminResetOTPViaTwilio = async (phoneNumber) => {
//   try {
//     console.log(`Sending Admin Reset OTP to phone: +91${phoneNumber}`);

//     const verification = await client.verify.v2
//       .services(process.env.TWILIO_VERIFY_SERVICE_SID)
//       .verifications.create({
//         to: `+91${phoneNumber}`,
//         channel: 'sms',
//       });

//     console.log('Admin Reset OTP sent via Twilio. Status:', verification.status);

//     return {
//       success: true,
//       status: verification.status,
//       message: 'OTP sent successfully',
//     };
//   } catch (error) {
//     console.error('Twilio Send Admin Reset OTP Error:', error.message);
//     throw new Error(`Failed to send OTP: ${error.message}`);
//   }
// };

// // Verify Reset OTP via Twilio Verify Service (FOR ADMIN PASSWORD RESET)
// const verifyAdminResetOTPViaTwilio = async (phoneNumber, otp) => {
//   try {
//     console.log(`Verifying Admin Reset OTP for phone: +91${phoneNumber}`);

//     const verificationCheck = await client.verify.v2
//       .services(process.env.TWILIO_VERIFY_SERVICE_SID)
//       .verificationChecks.create({
//         to: `+91${phoneNumber}`,
//         code: otp,
//       });

//     console.log('Admin Reset OTP verification response. Status:', verificationCheck.status);

//     if (verificationCheck.status === 'approved') {
//       return {
//         success: true,
//         status: verificationCheck.status,
//         message: 'OTP verified successfully',
//       };
//     } else {
//       return {
//         success: false,
//         status: verificationCheck.status,
//         message: 'OTP verification failed',
//       };
//     }
//   } catch (error) {
//     console.error('Twilio Verify Admin Reset OTP Error:', error.message);
//     throw new Error(`Failed to verify OTP: ${error.message}`);
//   }
// };

// module.exports = { 
//   sendAdminResetOTPViaTwilio, 
//   verifyAdminResetOTPViaTwilio 
// };
// THIS IS CHNAGED FORADMIN TO VENDOR FILE 

const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send Reset OTP via Twilio (FOR VENDOR PASSWORD RESET)
const sendVendorResetOTPViaTwilio = async (phoneNumber) => {
  try {
    console.log(`Sending Vendor Reset OTP to phone: +91${phoneNumber}`);

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: `+91${phoneNumber}`,
        channel: 'sms',
      });

    console.log('Vendor Reset OTP sent via Twilio. Status:', verification.status);

    return {
      success: true,
      status: verification.status,
      message: 'OTP sent successfully',
    };
  } catch (error) {
    console.error('Twilio Send Vendor Reset OTP Error:', error.message);
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

// Verify Reset OTP via Twilio (FOR VENDOR PASSWORD RESET)
const verifyVendorResetOTPViaTwilio = async (phoneNumber, otp) => {
  try {
    console.log(`Verifying Vendor Reset OTP for phone: +91${phoneNumber}`);

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: otp,
      });

    console.log('Vendor Reset OTP verification response. Status:', verificationCheck.status);

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
    console.error('Twilio Verify Vendor Reset OTP Error:', error.message);
    throw new Error(`Failed to verify OTP: ${error.message}`);
  }
};

module.exports = { 
  sendVendorResetOTPViaTwilio, 
  verifyVendorResetOTPViaTwilio 
};