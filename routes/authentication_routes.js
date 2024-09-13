const express = require('express')
const router = express.Router();
const authenticationController = require('../controllers/authentication_controller');
const otpController = require('../controllers/otp_verifications_controller')
router.post('/patient-sign-up',authenticationController.verifyRecaptcha,authenticationController.patientSignUp);

module.exports = router;