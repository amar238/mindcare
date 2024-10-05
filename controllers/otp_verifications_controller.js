const queue = require('../middlewares/bull');
const signUpOTPWorker = require('../workers/signUpOTPWorker');
const otps = new Map();
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');

// generate time bound otp for email
function generateOTP(email) {
  const otp = Math.floor(100000 + Math.random() * 900000);; // Function to generate a random OTP
  const otpValidityDuration = 5 * 60 * 1000;
  const otpData = {
    otp: otp,
    isVerified: false, // Initially, the OTP is not verified
  };

  otps.set(email, otpData); // Store OTP data in the Map
  setTimeout(() => {
    otps.delete(email);
  }, otpValidityDuration);
  console.log(otp);
  return otp;
}

// send generated otp for Sign Up process
module.exports.SendSignUpOtp = async (req, res) => {
  try {
    // console.log("Sending sign up OTP");
    const { email, license_num } = req.body;
    // Check if the request is for a doctor or patient
    let existingUser;

    if (license_num) {
      existingUser = await Doctor.findOne({ email });
      if (existingUser) {
        return res.status(409).send("Doctor already exists");
      }
    } else {
      existingUser = await Patient.findOne({ email });
      if (existingUser) {
        return res.status(409).send("Patient already exists");
      }
    }

    // Generate OTP and send it
    const otp = generateOTP(email);
    const OTP = {
      otp: otp,
      to: email
    };
    await queue.add(OTP, { removeOnComplete: true });
    res.status(200).send('OTP sent successfully');

  } catch (error) {
    console.log(error);
    res.status(500).send('Failed to send OTP');
  }
};

// get otp from user and validate 
module.exports.verifySignUpOtp = async (req, res) => {

  try {
    console.log("verify sign up otp")
    var { email, otp } = req.body;
    const otpData = otps.get(email);
    if (otpData && otpData.otp == otp) {
      otpData.isVerified = true; // Mark OTP as verified
      otps.set(email, otpData); // Re-store updated OTP data
      res.status(200).send('OTP verified successfully');
    } else {
      res.status(400).send('Invalid OTP, Try Again');
    }

  } catch (error) {
    res.status(400).send('Invalid OTP, Try Again');
  }

}

// Middleware to check OTP verification
module.exports.checkOtpVerified = (req, res, next) => {
  console.log("check otp")
  const { email } = req.body;
  const otpData = otps.get(email);

  if (otpData && otpData.isVerified) {
    otps.delete(email);
    next(); // Proceed with the sign-up process
  } else {
    res.status(400).send('OTP not verified before signup');
  }
}
