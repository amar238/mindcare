const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Patient', 
        required: true 
    },
    doctor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Doctor', 
        required: true 
    },
    sessionType: { 
        type: String, required: true 
    }, // e.g., Consultation, Counselling, etc.
    sessionMode:{
        type:String,
        required: true
    },//in-person tele therapy
    date: { 
        type: Date, 
        required: true 
    },
    timeSlot: { 
        type: String, 
        required: true 
    }, // e.g., '09:00'
    status: { 
        type: String, 
        default: 'booked' 
    }, // booked, available

});


const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;