const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otp_verifications_controller');

//outes for sending and verifying otp during signup
router.post('/send-otp-signup',otpController.SendSignUpOtp);
router.post('/verify-otp-signup',otpController.verifySignUpOtp);

module.exports = router;