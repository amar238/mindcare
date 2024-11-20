const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authentication_controller');
const otpController = require('../controllers/otp_verifications_controller');
const drAdminController = require('../controllers/dr_admin_controller');
const passport = require('passport');

router.get('/admin_page',drAdminController.drLandingPage);

router.post('/create',authenticationController.verifyRecaptcha,otpController.checkOtpVerified,drAdminController.create);
router.post('/create-dr-session',authenticationController.verifyRecaptcha,passport.authenticate('local',{failureRedirect:"/dr-sign-in"}),drAdminController.createDrSession);

module.exports = router;