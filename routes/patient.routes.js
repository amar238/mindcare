const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.post('/create',patientController.create); //store patient
router.get('/add-patient',patientController.addPatient); //add patient page
router.get('/records',patientController.getRecords);
router.get('/view/:id',patientController.viewPatient);
module.exports = router;