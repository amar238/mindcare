const passport = require('passport');
const bcrypt = require('bcrypt');
const Patient = require('../models/patient');
const LocalStrategy = require("passport-local").Strategy;

// passport local strategy
passport.use(new LocalStrategy({
        usernameField: 'email',
    },
    async (email, password, done) => {
        try {
            const user = await Patient.findOne({ email: email});  
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            // Compare hashed password
            const result =await bcrypt.compare(password, user.password);
            if (result) {
                return done(null, user);
            } else {
                  return done(null, false, { message: 'Incorrect password.' });
            }
        } catch (error) {
            console.log(error)
}}));

// seializer
passport.serializeUser((user, done) => {
    return done(null, user.id);
});

// deserializer
passport.deserializeUser(async (id, done) => {
    try {
        const user =await Patient.findById(id);
        return done(null, user);
    } catch (error) {
        console.log("Error in finding user ---> passport");
        return done(error);
    }
});

// check if user is logged in
passport.checkAuthentication = (req,res,next)=>{
    // if user is authenticated send to next page
    if(req.isAuthenticated()){
        return next();
    }
    // sending user back to sign in 
    return res.redirect('/sign-in');
}

// set logged in user
passport.setAuthenticatedUser = (req,res,next)=>{
    // req.user contains current signed in user from session cookie -> forwarding it to locals for view
    if(req.isAuthenticated()){
        res.locals.user = req.user;
    }
    return next();
}
  
module.exports = passport;