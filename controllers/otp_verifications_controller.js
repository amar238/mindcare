const queue = require('../middlewares/bull');
const signUpOTPWorker = require('../workers/signUpOTPWorker');
const otps = new Map();

// generate time bound otp for email
function generateOTP(email) {
    const otp = Math.floor(100000 + Math.random() * 900000);; // Function to generate a random OTP
    const otpValidityDuration = 5 * 60 * 1000;
    otps.set(email,otp );
    setTimeout(() => {
        otps.delete(email); 
    }, otpValidityDuration);
    return otp;
}

// send generated otp for Sign Up process
module.exports.SendSignUpOtp = async(req,res)=>{
  try {
    console.log(req.body.email)
    const { email }= req.body;
    const otp = generateOTP(email);  
    const OTP = {
      otp:otp,
      to:email
    }
    // console.log(OTP)
    await queue.add(OTP);

    res.status(200).send('OTP sent successfully');
  } catch (error) {
    console.log(error);
    res.status(500).send('Failed to send OTP');
  }  
}

// get otp from user and validate 
module.exports.verifySignUpOtp=(req,res)=>{
    var { email, otp } = req.body;
 
    if (otps.has(email) && otps.get(email) == otp) {
      otps.delete(email);
      res.status(200).send('OTP verified successfully');
    } else {
      res.status(400).send('Invalid OTP');
    }
}