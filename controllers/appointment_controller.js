const Appointment = require('../models/appointment');
const Availability = require('../models/availability');

"use strict"

module.exports.getAppointment = async(req,res)=>{
    return res.render('book_appointment');
}

exports.bookAppointmentPage=(req, res) => {
    res.render('book_appointment');
}

module.exports.getSetCalender = async(req,res)=>{
    return res.render('set_calendar');
}


// return res.status(200).json({ success: true, message: 'Patient created successfully!' });

// return res.status(500).json({ success: false, error: 'Failed to create patient. The email might already be in use.' });


// Book an appointment
exports.bookAppointment = async (req, res) => {
    const { patientId, doctorId, sessionType, date, timeSlot } = req.body;

    try {
        // Check if the slot is available
        const availability = await Availability.findOne({
            doctor: doctorId,
            date,
            startTime: timeSlot,
            isAvailable: true
        });

        if (!availability) {
            return res.status(400).json({ message: 'Time slot is not available.' });
        }

        // Book the appointment
        const appointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            sessionType,
            date,
            timeSlot
        });

        await appointment.save();

        // Mark the slot as unavailable
        availability.isAvailable = false;
        await availability.save();

        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Failed to book appointment.' });
    }
};

// Reschedule an appointment
exports.rescheduleAppointment = async (req, res) => {
    const { appointmentId, newDate, newTimeSlot } = req.body;

    try {
        // Find the existing appointment
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Check availability of the new slot
        const availability = await Availability.findOne({
            doctor: appointment.doctor,
            date: newDate,
            startTime: newTimeSlot,
            isAvailable: true
        });

        if (!availability) {
            return res.status(400).json({ message: 'New time slot is not available.' });
        }

        // Reschedule the appointment
        appointment.date = newDate;
        appointment.timeSlot = newTimeSlot;
        await appointment.save();

        // Mark the old slot as available again
        const oldAvailability = await Availability.findOne({
            doctor: appointment.doctor,
            date: appointment.date,
            startTime: appointment.timeSlot
        });

        if (oldAvailability) {
            oldAvailability.isAvailable = true;
            await oldAvailability.save();
        }

        // Mark the new slot as unavailable
        availability.isAvailable = false;
        await availability.save();

        res.status(200).json(appointment);
    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        res.status(500).json({ message: 'Failed to reschedule appointment.' });
    }
};
