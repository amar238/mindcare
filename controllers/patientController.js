const Patient = require('../models/patient');


// Route to get patient by ID for viewing
exports.viewPatient =  async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).send('Patient not found');
        }
        res.render('./patient/data/profile', { patient });  // Render detailed view
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
}

// Patients records 
exports.getRecords = async (req, res) => {
    try {
        const patients = await Patient.find();

        return res.render('./patient/data/records', { patients });  // Assuming you're using EJS or similar templating engine
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
}

// add patient page
exports.addPatient = async(req,res)=>{
    try {
        const patientCounts = await Patient.countDocuments({});
        return res.render('./patient/data/add_patient',{patientCounts});
    } catch (error) {
        res.redirect('/')
    }
    const patientCounts = await Patient.countDocuments({});
    console.log(patientCounts)
    return res.render('./patient/data/add_patient')
}

//store patient
exports.create = async(req,res)=>{
    try {
        const {
            firstName,
            lastName,
            email,
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
            contactNumber,
        } = req.body;

        // Validate names
        if (!/^[a-zA-Z]{2,}$/.test(firstName)) {
            return res.status(400).json({ success: false, error: 'First Name should contain only alphabets and be at least 2 characters long!' });
        }
        if (!/^[a-zA-Z]{2,}$/.test(lastName)) {
            return res.status(400).json({ success: false, error: 'Last Name should contain only alphabets and be at least 2 characters long!' });
        }

        // Validate phone number
        if (phone && !/^[1-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ success: false, error: 'Phone number should be 10 digits and not start with 0!' });
        }

        // Validate date of birth
        if (!dateOfBirth || new Date(dateOfBirth) > new Date()) {
            return res.status(400).json({ success: false, error: 'Invalid Date of Birth!' });
        }

        // Validate emergency contact
        if (!emergencyName || !relation || !/^[1-9]\d{9}$/.test(contactNumber)) {
            return res.status(400).json({ success: false, error: 'Invalid emergency contact details!' });
        }
        
        // Create a new patient record
        const pt =await Patient.create({
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
                contactNumber
            },
        });
        return res.status(200).json({ success: true, message: 'Patient created successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Failed to create patient. The email might already be in use.' });
    }

}
