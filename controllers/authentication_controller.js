const Patient = require('../models/patient');
const axios = require('axios');

const recaptchaSecretKey = process.env.RECAPTCHA_SECRET;

module.exports.patientSignUp = async (req, res) => {
    // console.log(req.body)
};

module.exports.verifyRecaptcha = async (req, res, next) => {
    try {
        
        const recaptchaToken = req.body.recaptchaToken;
        const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaToken}`);

        if (!recaptchaResponse.data.success || recaptchaResponse.data.score < 0.5) {
            return res.status(400).json({ success: false, error: 'reCAPTCHA validation failed' });
        }
        console.log("captch verified")
        next();
    }
    catch (error) {
        console.log(error);
    }
}