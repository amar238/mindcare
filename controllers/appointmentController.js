const Appointment = require('../models/appointment');
const Availability = require('../models/availability');
const Doctor = require('../models/doctor');
const moment = require('moment');

exports.getBookingPage = async (req, res) => {
    try {
        const doctors = await Doctor.find(); // Fetch the list of doctors
        // Render the booking page with the list of doctors
        return res.render('book_appointment', { doctors, patientId: req.user._id }); // Assuming patient ID comes from the logged-in user
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
        }

        // Fetch available 15-minute slots for the selected doctor and therapy type
        let availability = await Availability.find({
            doctor: doctorId,
            type: therapyType,
            isAvailable: true,
        }).sort({ startTime: 1 }); // Sort by start time for consecutive slots

        const formattedSlots = [];

        // Loop through the available slots and handle combining for session types
        for (let i = 0; i < availability.length; i++) {
            const slot = availability[i];
            const startTime = moment(slot.startTime);
            const endTime = moment(slot.endTime);
            let totalDuration = 15; // Each slot is 15 minutes by default

            // Handle combining slots for 30-minute sessions
            if (slotDuration === 30) {
                if (i + 1 < availability.length) {
                    const nextSlot = availability[i + 1];
                    const nextSlotStartTime = moment(nextSlot.startTime);

                    // Check if the next slot is consecutive (no gap between slots)
                    if (nextSlotStartTime.diff(endTime, 'minutes') === 0) {
                        const combinedEndTime = moment(nextSlot.endTime);
                        totalDuration += 15; // Add another 15 minutes for a 30-minute session

                        if (totalDuration === 30) {
                            const formattedSlot = `${startTime.format('HH:mm')} - ${combinedEndTime.format('HH:mm')}, ${startTime.format('DD-MM-YY')}, ${startTime.format('dddd')}`;
                            formattedSlots.push({
                                _id: slot._id,
                                doctor: slot.doctor,
                                type: slot.type,
                                isAvailable: slot.isAvailable,
                                formattedSlot: formattedSlot,
                            });
                            i++; // Skip the next slot as it's combined
                        }
                    }
                }
            }

            // Handle combining slots for 45-minute sessions
            if (slotDuration === 45) {
                if (i + 2 < availability.length) {
                    const nextSlot = availability[i + 1];
                    const nextNextSlot = availability[i + 2];
                    const nextSlotStartTime = moment(nextSlot.startTime);
                    const nextNextSlotStartTime = moment(nextNextSlot.startTime);

                    // Check if the next two slots are consecutive (no gap between slots)
                    if (nextSlotStartTime.diff(endTime, 'minutes') === 0 && nextNextSlotStartTime.diff(nextSlot.endTime, 'minutes') === 0) {
                        const combinedEndTime = moment(nextNextSlot.endTime);
                        totalDuration += 30; // Add two 15-minute slots for a 45-minute session

                        if (totalDuration === 45) {
                            const formattedSlot = `${startTime.format('HH:mm')} - ${combinedEndTime.format('HH:mm')}, ${startTime.format('DD-MM-YY')}, ${startTime.format('dddd')}`;
                            formattedSlots.push({
                                _id: slot._id,
                                doctor: slot.doctor,
                                type: slot.type,
                                isAvailable: slot.isAvailable,
                                formattedSlot: formattedSlot,
                            });
                            i += 2; // Skip the next two slots as they're combined
                        }
                    }
                }
            }

            // Add single 15-minute slots without combination if no consecutive slots are needed
            if (slotDuration === 15) {
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
            date: availableSlots[0].date, // Set appointment date based on the first slot
            timeSlot: `${startTime.getHours()}:${startTime.getMinutes()}`, // Use start time from parsed data

        });
        console.log(newAppointment)
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

// Reschedule an appointment
exports.rescheduleAppointment = async (req, res) => {
    
};

// Get all appointments for a patient
exports.getPatientAppointments = async (req, res) => {
    const { patientId } = req.params;

    try {
        const appointments = await Appointment.find({ patient: patientId }).populate('doctor');
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
};
    