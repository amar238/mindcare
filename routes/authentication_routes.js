const express = require('express')
const router = express.Router();
const passport = require('passport');
const authenticationController = require('../controllers/authentication_controller');
const otpController = require('../controllers/otp_verifications_controller');

// router.post('/patient-sign-up',authenticationController.verifyRecaptcha,otpController.checkOtpVerified,authenticationController.createPatient);
// router.post('/create-patient-session',authenticationController.verifyRecaptcha,passport.authenticate('local',{failureRedirect:"/sign-in"}),authenticationController.createPatientSession);
router.get('/sign-out',authenticationController.destroySession);


module.exports = router;