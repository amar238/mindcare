
const Doctor = require('../models/doctor');
const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.saltRounds);


module.exports.drLandingPage = async(req,res)=>{
    return res.render('dr_landing_page');
}

module.exports.signUp = async(req,res)=>{
    return res.render('dr_sign_up');
}

module.exports.signIn = async(req,res)=>{
    return res.render('dr_login');
}

module.exports.create = async (req, res) => {
    try {
        console.log("create doctor")
        const {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            license_num:licenseNumber,
            password,
            specialization,
            confirm_password:confirmPassword,
            street,
            city,
            state,
            zip_code: zipCode,
            country
        } = req.body;

        // Validate names
        if (!/^[a-zA-Z]{2,}$/.test(firstName)) {
            return res.status(400).json({ success: false, error: 'First Name should contain only alphabets and be at least 2 characters long!' });
        }
        if (!/^[a-zA-Z]{2,}$/.test(lastName)) {
            return res.status(400).json({ success: false, error: 'Last Name should contain only alphabets and be at least 2 characters long!' });
        }
        if (!/^[a-zA-Z ]{2,}$/.test(specialization)) {
            return res.status(400).json({ success: false, error: 'First Name should contain only alphabets and be at least 2 characters long!' });
        }
        // Validate password
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, error: 'Passwords do not match!' });
        }

        // Validate phone number
        if (phone && !/^[1-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ success: false, error: 'Phone number should be 10 digits and not start with 0!' });
        }

        // Validate phone number
        if (licenseNumber && !/^[1-9]\d{9}$/.test(licenseNumber)) {
            return res.status(400).json({ success: false, error: 'License number should be 10 digits and not start with 0!' });
        }



        // Validate address
        if (!/^[a-zA-Z0-9\s,.'-]{2,}$/.test(street) ||
            !/^[a-zA-Z\s]{2,}$/.test(city) ||
            !/^[a-zA-Z\s]{2,}$/.test(state) ||
            !/^[1-9]\d{5}$/.test(zipCode) ||
            !/^[a-zA-Z\s]{2,}$/.test(country)) {
            return res.status(400).json({ success: false, error: 'Invalid address details!' });
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create a new doctor record
        await Doctor.create({
            firstName,
            lastName,
            email,
            phone,
            specialization,
            licenseNumber,
            officeAddress: {
                street,
                city,
                state,
                zipCode,
                country
            },
            password: hashedPassword
        });

        return res.status(200).json({ success: true, message: 'You have joined Mindstory!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Failed to join. The email might already be in use.' });
    }
};

// after sign in user
module.exports.createDrSession = async(req,res,next)=>{
    return res.status(200).json({ success:true, message:'Dr login successfull!'});
}
