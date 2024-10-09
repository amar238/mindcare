const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const passport = require('passport');

// Get booking page
router.get('/book', appointmentController.getBookingPage);



// Get availability by doctorId
router.get('/availability/:doctorId', appointmentController.getAvailability);

// Book an appointment
router.post('/create', appointmentController.bookAppointment);

// Reschedule an appointment
router.put('/appointments/:appointmentId/reschedule', appointmentController.rescheduleAppointment);

// Get patient appointments
router.get('/appointments/:patientId', appointmentController.getPatientAppointments);

module.exports = router;
