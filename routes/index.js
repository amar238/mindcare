const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home_controller');


router.get('/',homeController.home);
router.get('/sign_up',homeController.signUp);
router.get('/sign_in',homeController.signIn);
router.get('forgot_password',homeController.forgotPassword);


router.use('/otp',require('./otp.routes'));//use otp routes
router.use('/authentication',require('./authentication_routes'));

module.exports = router;
