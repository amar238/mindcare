const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const passport = require('passport');

// Get booking page
router.get('/book', appointmentController.getBookingPage);
// doctors upcoming appointments
router.get('/upcomingdr/:doctorId', appointmentController.getUpcomingAppointments);

// Get availability by doctorId
router.get('/availability/:doctorId', appointmentController.getAvailability);

// Book an appointment
router.post('/create', appointmentController.bookAppointment);

// Reschedule an appointment
router.put('/appointments/:appointmentId/reschedule', appointmentController.rescheduleAppointment);

// Get patient appointments
router.get('/upcomingpt/:patientId', appointmentController.getPatientAppointments);
// cancel appointment by patient
router.post('/cancel', appointmentController.cancelAppointment);
// Reschedule appointment by patient
router.post('/reschedule', appointmentController.rescheduleAppointment);
router.get('/pastpt/:patientId',appointmentController.getPatientPastAppointments);
module.exports = router;
