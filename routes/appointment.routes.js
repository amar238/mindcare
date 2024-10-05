const express = require('express')
const router = express.Router();
const appointmentController = require('../controllers/appointment_controller');
const passport = require('passport');

router.get('/get-appointment',passport.checkPatientAuthentication,appointmentController.getAppointment);
router.get('/get-set-calendar',passport.checkDoctorAuthentication,appointmentController.getSetCalender);

router.post('/', passport.checkPatientAuthentication, appointmentController.bookAppointment);
router.put('/reschedule', passport.checkAuthentication, appointmentController.rescheduleAppointment);
router.get('/book-appointment', passport.checkAuthentication, appointmentController.bookAppointmentPage );
module.exports = router;