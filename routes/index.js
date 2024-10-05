const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home_controller');
const drAdminController = require('../controllers/dr_admin_controller');

router.get('/',homeController.home);
router.get('/sign_up',homeController.signUp);
router.get('/sign_in',homeController.signIn);
router.get('forgot_password',homeController.forgotPassword);
router.get('/dr-sign-up',drAdminController.signUp);
router.get('/dr-sign-in',drAdminController.signIn);

router.use('/otp',require('./otp.routes'));//use otp routes
router.use('/authentication',require('./authentication_routes'));
router.use('/dr',require('./dr_admin_routes'));
router.use('/appointment',require('./appointment.routes'));
router.use('/availability',require('./availability.routes'));
module.exports = router;
