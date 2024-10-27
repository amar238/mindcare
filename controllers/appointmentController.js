const Appointment = require('../models/appointment');
const Availability = require('../models/availability');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const moment = require('moment');

exports.getBookingPage = async (req, res) => {
    try {
        const doctors = await Doctor.find(); // Fetch the list of doctors
        // Render the booking page with the list of doctors
        return res.render('./patient/appointment/book_appointment', { doctors, patientId: req.user._id }); // Assuming patient ID comes from the logged-in user
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking page', error });
    }
};


// Fetch availability for a doctor by doctorId
exports.getAvailability = async (req, res) => {
    const { doctorId } = req.params;
    const { therapyType, sessionType } = req.query;

    try {
        let slotDuration;

        // Determine the total slot duration based on session type
        if (sessionType === 'Consultation') {
            slotDuration = 30; // 30 minutes (needs 2 consecutive 15-minute slots)
        } else if (sessionType === 'Counselling' || sessionType === 'Couple Therapy') {
            slotDuration = 45; // 45 minutes (needs 3 consecutive 15-minute slots)
        } else if (sessionType === 'Group Therapy') {
            slotDuration = 30; // 30 minutes (needs 2 consecutive 15-minute slots)
        } else {
            slotDuration = 15; // Default to 15 minutes if no session type matches
        }

        // Fetch only future slots where startTime >= current time
        const currentTime = moment().toISOString();

        let availability = await Availability.find({
            doctor: doctorId,
            type: therapyType,
            isAvailable: true,
            startTime: { $gte: currentTime } // Only future slots
        }).sort({ startTime: 1 }); // Sort by start time for consecutive slots

        const formattedSlots = [];

        // Loop through the available slots and handle combining for session types
        for (let i = 0; i < availability.length; i++) {
            const slot = availability[i];
            const startTime = moment(slot.startTime);
            const endTime = moment(slot.endTime);
            let totalDuration = 15; // Each slot is 15 minutes by default

            // Handle combining slots for 30-minute sessions
            if (slotDuration === 30 && i + 1 < availability.length) {
                const nextSlot = availability[i + 1];
                const nextSlotStartTime = moment(nextSlot.startTime);

                if (nextSlotStartTime.diff(endTime, 'minutes') === 0) {
                    const combinedEndTime = moment(nextSlot.endTime);
                    totalDuration += 15;

                    if (totalDuration === 30) {
                        formattedSlots.push({
                            _id: slot._id,
                            doctor: slot.doctor,
                            type: slot.type,
                            isAvailable: slot.isAvailable,
                            formattedSlot: `${startTime.format('HH:mm')} - ${combinedEndTime.format('HH:mm')}, ${startTime.format('DD-MM-YY')}, ${startTime.format('dddd')}`
                        });
                        i++; // Skip the next slot
                    }
                }
            }

            // Handle combining slots for 45-minute sessions
            else if (slotDuration === 45 && i + 2 < availability.length) {
                const nextSlot = availability[i + 1];
                const nextNextSlot = availability[i + 2];
                const nextSlotStartTime = moment(nextSlot.startTime);
                const nextNextSlotStartTime = moment(nextNextSlot.startTime);

                if (nextSlotStartTime.diff(endTime, 'minutes') === 0 &&
                    nextNextSlotStartTime.diff(nextSlot.endTime, 'minutes') === 0) {
                    const combinedEndTime = moment(nextNextSlot.endTime);
                    totalDuration += 30;

                    if (totalDuration === 45) {
                        formattedSlots.push({
                            _id: slot._id,
                            doctor: slot.doctor,
                            type: slot.type,
                            isAvailable: slot.isAvailable,
                            formattedSlot: `${startTime.format('HH:mm')} - ${combinedEndTime.format('HH:mm')}, ${startTime.format('DD-MM-YY')}, ${startTime.format('dddd')}`
                        });
                        i += 2; // Skip the next two slots
                    }
                }
            }

            // Add single 15-minute slots if no combination is needed
            else if (slotDuration === 15) {
                formattedSlots.push({
                    _id: slot._id,
                    doctor: slot.doctor,
                    type: slot.type,
                    isAvailable: slot.isAvailable,
                    formattedSlot: `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}, ${startTime.format('DD-MM-YY')}, ${startTime.format('dddd')}`
                });
            }
        }

        // Return the formatted slots to the frontend
        res.status(200).json(formattedSlots);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching availability', error });
    }
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
    const { patientId, doctorId, sessionType, therapyType:sessionMode, slotDetails } = req.body;
   
    // Extract date and time from slotDetails
    const [time, dateStr] = slotDetails.split(', ');
    const [startTimeStr, endTimeStr] = time.split(' - ');
    const [day, month, year] = dateStr.split('-');
    const date = new Date(`20${year}-${month}-${day}`);
    const datePart = date.toISOString().split('T')[0];
    const startTime = new Date(`${datePart}T${startTimeStr}`);
    const endTime = new Date(`${datePart}T${endTimeStr}`);

    try {
        // Find all available slots matching the specified date and time range
        const availableSlots = await Availability.find({
            doctor: doctorId,
            startTime: {
                $gte: startTime, // Greater than or equal to the requested start time
            },
            endTime:{
                $lte:endTime
            },
            isAvailable: true  // Only fetch slots that are available
        });
       
        // Check if any available slots were found
        if (availableSlots.length === 0) {
            return res.status(400).json({ message: 'No available slots found for the selected time.' });
        }
        // Create new appointment
        const newAppointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            sessionType,
            sessionMode: sessionMode,
            date: datePart, // Set appointment date based on the first slot
            timeSlot: `${startTime.getHours()}:${startTime.getMinutes()}`, // Use start time from parsed data

        });
        // Save appointment
        await newAppointment.save();
        // Mark slots as unavailable
        await Availability.updateMany(
            { _id: { $in: availableSlots.map(slot => slot._id) } },
            { isAvailable: false }
        );

        return res.status(201).json({ message: 'Appointment successfully booked!', appointment: newAppointment });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Error booking appointment', error });
    }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
    const { appointmentId } = req.body;

    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Construct start and end time for the availability query
        const appointmentDate = new Date(appointment.date); // Date from appointment
        const appointmentTime = appointment.timeSlot.split(':'); // Extract hours and minutes
        const startTime = new Date(appointmentDate.setHours(appointmentTime[0], appointmentTime[1]));
        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Assuming 30 minutes for session duration

        // Debugging output
        console.log(`Canceling appointment on ${appointmentDate}, startTime: ${startTime}, endTime: ${endTime}`);

        // Find the associated slots and mark them as available again
        await Availability.updateMany(
            {
                doctor: appointment.doctor,
                startTime: { $gte: startTime },
                endTime: { $lte: endTime }
            },
            { isAvailable: true }
        );

        // Use deleteOne or findOneAndDelete instead of remove
        await Appointment.deleteOne({ _id: appointmentId }); // Remove the appointment

        return res.status(200).json({ message: 'Appointment cancelled successfully!' });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'Error cancelling appointment', error });
    }
};
// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
    const { appointmentId, newSlot } = req.body;
  
    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Extract new date and time from newSlot
        const [time, dateStr] = newSlot.split(', ');
        const [startTimeStr, endTimeStr] = time.split(' - ');
        const [day, month, year] = dateStr.split('-');
        const date = new Date(`20${year}-${month}-${day}`);
        const datePart = date.toISOString().split('T')[0];
        const startTime = new Date(`${datePart}T${startTimeStr}`);
        const endTime = new Date(`${datePart}T${endTimeStr}`);

        // Check for available slots
        const availableSlots = await Availability.find({
            doctor: appointment.doctor,
            startTime: { $gte: startTime },
            endTime: { $lte: endTime },
            isAvailable: true
        });

        if (availableSlots.length === 0) {
            return res.status(400).json({ message: 'No available slots for the new time.' });
        }

        // Update appointment with new slot details
        appointment.date = datePart;
        appointment.timeSlot = `${startTime.getHours()}:${startTime.getMinutes()}`;
        await appointment.save();

        return res.status(200).json({ message: 'Appointment rescheduled successfully!', appointment });
    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        res.status(500).json({ message: 'Error rescheduling appointment', error });
    }
};


// Get all appointments for a patient
exports.getPatientAppointments = async (req, res) => {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patient: patientId }).populate('doctor');
    try {
        const appointments = await Appointment.find({ 
            patient: patientId,
            date: {$gte:new Date()} 
        }).populate('doctor');

        res.render('./patient/appointment/upcomingpt',{appointments})
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
};

//only for doc
exports.getPatientPastAppointments = async (req, res) => {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patient: patientId }).populate('doctor');
    try {
        const appointments = await Appointment.find({ 
            patient: patientId,
            date: {$lte:new Date()} 
        }).populate('doctor');
        res.render('./patient/appointment/past_appointments',{appointments})
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
};

// Fetch upcoming appointments for a specific doctor
exports.getUpcomingAppointments = async (req, res) => {
    try {
        const doctorId = req.params.doctorId; // Get doctorId from the request

        // Fetch upcoming appointments (greater than or equal to current date)
        const upcomingAppointments = await Appointment.find({
            doctor: doctorId,
            date: { $gte: new Date() }, // Fetch appointments from today onward
        }).populate('patient', 'firstName lastName'); // Populate patient name
       res.render('./doctor/appointment/upcomingdr',{upcomingAppointments})
    } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
