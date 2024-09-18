const Patient = require('../models/patient');
const axios = require('axios');
const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.saltRounds);

const recaptchaSecretKey = process.env.RECAPTCHA_SECRET;

module.exports.createPatient = async (req, res) => {
    try {
        console.log("create patient")
        const {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            dob: dateOfBirth,
            gender,
            password,
            confirm_password:confirmPassword,
            street,
            city,
            state,
            zip_code: zipCode,
            country,
            emergency_name: emergencyName,
            relation,
            emergency_phone: emergencyPhone,
            recaptchaToken
        } = req.body;

        // Validate names
        if (!/^[a-zA-Z]{2,}$/.test(firstName)) {
            return res.status(400).json({ success: false, error: 'First Name should contain only alphabets and be at least 2 characters long!' });
        }
        if (!/^[a-zA-Z]{2,}$/.test(lastName)) {
            return res.status(400).json({ success: false, error: 'Last Name should contain only alphabets and be at least 2 characters long!' });
        }

        // Validate password
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, error: 'Passwords do not match!' });
        }

        // Validate phone number
        if (phone && !/^[1-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ success: false, error: 'Phone number should be 10 digits and not start with 0!' });
        }

        // Validate date of birth
        if (!dateOfBirth || new Date(dateOfBirth) > new Date()) {
            return res.status(400).json({ success: false, error: 'Invalid Date of Birth!' });
        }

        // Validate address
        if (!/^[a-zA-Z0-9\s,.'-]{2,}$/.test(street) ||
            !/^[a-zA-Z\s]{2,}$/.test(city) ||
            !/^[a-zA-Z\s]{2,}$/.test(state) ||
            !/^[1-9]\d{5}$/.test(zipCode) ||
            !/^[a-zA-Z\s]{2,}$/.test(country)) {
            return res.status(400).json({ success: false, error: 'Invalid address details!' });
        }

        // Validate emergency contact
        if (!emergencyName || !relation || !/^[1-9]\d{9}$/.test(emergencyPhone)) {
            return res.status(400).json({ success: false, error: 'Invalid emergency contact details!' });
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        // existingPatient = await Patient.findOne({email:email});
        // if(existingPatient){
        //     return res.status(500).json({ success: false, error: 'Failed to create patient. The email might already be in use.' });
        // }
        
        // Create a new patient record
        await Patient.create({
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            address: {
                street,
                city,
                state,
                zipCode,
                country
            },
            emergencyContact: {
                name: emergencyName,
                relation,
                contactNumber: emergencyPhone
            },
            password: hashedPassword
        });

        return res.status(200).json({ success: true, message: 'Patient created successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Failed to create patient. The email might already be in use.' });
    }
};

module.exports.verifyRecaptcha = async (req, res, next) => {
    try {
        
        const recaptchaToken = req.body.recaptchaToken;
        const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaToken}`);

        if (!recaptchaResponse.data.success || recaptchaResponse.data.score < 0.5) {
            return res.status(400).json({ success: false, error: 'reCAPTCHA validation failed! Refresh page n proceed!' });
        }
        next();
    }
    catch (error) {
        return res.status(400).json({ success: false, error: 'Unknown error during reCAPTCHA validation! Refresh page n proceed!' });
    }
}

// after sign in user
module.exports.createPatientSession = async(req,res,next)=>{
    return res.status(200).json({ success:true, message:'User created successfully!'});
}

// logout user
module.exports.destroySession = (req,res)=>{
    req.logout(()=>{});
    res.redirect('/sign_in');
}