const Patient = require('../models/patient');

// Controller to get patient profile
exports.getProfile = async (req, res) => {
    try {
        // Assuming req.user._id contains the logged-in patient's ID
        const patient = await Patient.findById(req.user._id);

        if (!patient) {
            return res.status(404).send('Patient not found');
        }

        // Render the profile page with patient data
        res.render('profile', { patient });
    } catch (error) {
        console.error('Error fetching patient profile:', error);
        res.status(500).send('Server Error');
    }
};

// Controller to update patient profile
exports.updateProfile = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phone,
            dateOfBirth,
            gender,
            street,
            city,
            state,
            zipCode,
            country,
            emergencyName,
            relation,
            emergencyPhone,
        } = req.body;
        console.log(req.body)
        // Find the patient and update their information
        const patient = await Patient.findByIdAndUpdate(
            req.user._id,
            {
                firstName,
                lastName,
                phone,
                dateOfBirth,
                gender,
                emergencyContact: {
                    name: emergencyName,
                    relation,
                    contactNumber: emergencyPhone
                },
                address: {
                    street,
                    city,
                    state,
                    zipCode,
                    country
                },
            },
            { new: true, runValidators: true }
        );

        if (!patient) {
            return res.status(404).send('Patient not found');
        }

        // Redirect back to the profile page after update
        res.redirect('/patient/profile');
    } catch (error) {
        console.error('Error updating patient profile:', error);
        res.status(500).send('Failed to update profile.');
    }
};