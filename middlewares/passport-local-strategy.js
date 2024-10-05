const passport = require('passport');
const bcrypt = require('bcrypt');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor'); // Fixed import for Doctor model
const LocalStrategy = require("passport-local").Strategy;

// passport local strategy for handling both patients and doctors
passport.use(new LocalStrategy({
        usernameField: 'email',
    },
    async (email, password, done) => {
        try {
            // First, check if the user is a patient
            let user = await Doctor.findOne({ email: email });
            
            // If not found in patients, check doctors
            if (!user) {
                user = await Patient.findOne({ email: email });
                if (!user) {
                    return done(null, false, { message: 'Incorrect email.' });
                }
            }

            // Compare hashed password
            const result = await bcrypt.compare(password, user.password);
            if (result) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        } catch (error) {
            console.log(error);
            return done(error);
        }
}));

// Serializer
passport.serializeUser((user, done) => {
    return done(null, { id: user.id, type: user instanceof Patient ? 'patient' : 'doctor' });
});

// Deserializer: Check if the user is a patient or doctor and fetch accordingly
passport.deserializeUser(async (data, done) => {
    try {
        let user;
        if (data.type === 'patient') {
            user = await Patient.findById(data.id);
        } else {
            user = await Doctor.findById(data.id);
        }

        if (user) {
            return done(null, user);
        } else {
            return done(new Error('User not found'));
        }
    } catch (error) {
        console.log("Error in finding user ---> passport");
        return done(error);
    }
});

// Check if user is logged in
passport.checkAuthentication = (req, res, next) => {
    // If user is authenticated, pass to next middleware
    if (req.isAuthenticated()) {
        return next();
    }
    // If not authenticated, redirect to sign-in
    return res.redirect('/sign_in');
}

// Set authenticated user in locals for views
passport.setAuthenticatedUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    return next();
}

passport.checkDoctorAuthentication = (req, res, next) => {
    if (req.isAuthenticated() && req.user instanceof Doctor) {
        return next(); // If the user is authenticated and a doctor, proceed
    }
    // If not a doctor, redirect to a suitable page or show a 403 forbidden message
    return res.status(403).send('Access denied. Only doctors can access this page.');
};

passport.checkPatientAuthentication = (req, res, next) => {
    if (req.isAuthenticated() && req.user instanceof Patient) {
        return next(); // If the user is authenticated and a doctor, proceed
    }
    // If not a doctor, redirect to a suitable page or show a 403 forbidden message
    return res.status(403).send('Access denied. Only doctors can access this page.');
};

module.exports = passport;
