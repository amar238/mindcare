const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');


// Availability Routes
router.post('/weekly', availabilityController.createWeeklyAvailability);
router.put('/toggle-holiday', availabilityController.toggleHoliday);
router.get('/doctor-availability', availabilityController.getDoctorAvailabilityPage);
router.get('/:doctorId/availability', availabilityController.getDoctorAvailability);
module.exports = router;