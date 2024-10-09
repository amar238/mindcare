const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const passport = require('passport')

// Availability Routes
router.post('/weekly', passport.checkDoctorAuthentication,availabilityController.createWeeklyAvailability);
router.put('/toggle-holiday', passport.checkDoctorAuthentication, availabilityController.toggleHoliday);
router.get('/doctor-availability', passport.checkDoctorAuthentication, availabilityController.getDoctorAvailabilityPage);
router.get('/:doctorId/availability', passport.checkAuthentication, availabilityController.getDoctorAvailability);
module.exports = router;