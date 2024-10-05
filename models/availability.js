const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    doctor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Doctor', 
        required: true 
    },
    day: { 
        type: String, 
        required: true 
    }, // e.g., 'Monday'
    date: { 
        type: Date, 
        required: true 
    }, // The actual date of the slot
    startTime: { 
        type: Date, 
        required: true 
    }, // Start time with both date and time
    endTime: { 
        type: Date, 
        required: true 
    }, // End time with both date and time
    isAvailable: { 
        type: Boolean, 
        default: true 
    }, // Indicates if the doctor is available or on holiday
    type: { 
        type: String, 
        required: true 
    } // e.g., 'Tele-consultation', 'In-person'
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Optionally add an index to optimize queries on doctor and date
availabilitySchema.index({ doctor: 1, date: 1, startTime: 1 });

const Availability = mongoose.model('Availability', availabilitySchema);
module.exports = Availability;
