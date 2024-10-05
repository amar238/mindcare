const mongoose = require('mongoose');

const appointmentSlotSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g., '09:00'
    sessionType: { type: String, required: true }, // e.g., Consultation, Counselling, etc.
    isBooked: { type: Boolean, default: false }
});

module.exports = mongoose.model('AppointmentSlot', appointmentSlotSchema);