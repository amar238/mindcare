const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Prescription Schema
const PrescriptionSchema = new Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',  // Reference to the Patient model
        required: true
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',  // Reference to the Doctor model
        required: true
    },
    date: {
        type: Date,
        default: Date.now,  // Sets default to the current date
        required: true
    },
    medicineName: {
        type: String,
        required: true,
        trim: true
    },
    typeOfMedicine: {
        type: String,
        enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Other'],  // Example types of medicine
        required: true
    },
    dosage: {
        type: String,
        required: true,
        trim: true  // Example: "2 tablets daily"
    },
    note: {
        type: String,
        trim: true
    }
});

// Export the model
module.exports = mongoose.model('Prescription', PrescriptionSchema);
