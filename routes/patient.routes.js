const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Routes for patient profile
router.get('/profile', patientController.getProfile); // Get patient profile
router.post('/profile/update', patientController.updateProfile); // Update patient profile

module.exports = router;