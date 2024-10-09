const Doctor = require('../models/doctor');
const Availability = require('../models/availability');
const moment = require('moment');

// Fetch availability for a specific doctor
exports.getDoctorAvailability = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;

        // Check if doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Fetch available slots for the doctor from today onwards
        const today = moment().startOf('day');
        const availableSlots = await Availability.find({
            doctor: doctorId,
            date: { $gte: today.toDate() },
            isAvailable: true
        }).sort('date startTime');

        // Send the slots as JSON response
        res.json(availableSlots);
    } catch (error) {
        console.error("Error fetching doctor's availability:", error);
        res.status(500).json({ message: 'Failed to fetch doctor availability.' });
    }
};

// Get Doctor Availability
exports.getDoctorAvailabilityPage = async (req, res) => {
    try {
        const doctorId = req.user._id;
        if (!doctorId) {
            return res.status(400).send("Doctor ID is missing.");
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).send("Doctor not found.");
        }

        const today = moment().startOf('day');

        const availableSlots = await Availability.find({
            doctor: doctorId,
            date: { $gte: today.toDate() },
            isAvailable: true
        }).sort({ date: 1, startTime: 1 });

        // Format startTime and endTime as ISO strings for the frontend
        const formattedSlots = availableSlots.map(slot => ({
            type: slot.type,
            startTime: slot.startTime.toISOString(),
            endTime: slot.endTime.toISOString()
        }));


        return res.render('doctorAvailability', {
            doctorId: doctor._id,
            availableSlots: formattedSlots
        });
    } catch (error) {
        console.error('Error fetching doctor availability page:', error);
        return res.status(500).send("An error occurred while fetching the doctor's availability page.");
    }
};


// Helper function to generate slots for a week (with half-hour slots)
const generateWeeklySlots = async (doctorId) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = moment(); // Current date
    const nextMonday = today.clone().day(1).startOf('day'); // Move to the next Monday

    const promises = [];

    try {
        // Delete existing slots for the week before generating new ones
        await Availability.deleteMany({
            doctor: doctorId,
        });
        // Check if slots for the week already exist
        const existingSlots = await Availability.find({
            doctor: doctorId,
            date: {
                $gte: nextMonday.toDate(), // From next Monday
                $lt: nextMonday.clone().add(6, 'days').endOf('day').toDate() // To Saturday (end of the week)
            }
        });

        if (existingSlots.length > 0) {
            console.log('Slots already exist for the week, skipping generation.');
            return; // Exit if slots already exist
        }

        // Generate half-hour slots for each day of the week
        for (let i = 0; i < daysOfWeek.length; i++) {
            const currentDay = nextMonday.clone().add(i, 'days');

            // Morning Tele-consultation (9:00 - 10:00)
            let morningStartTime = currentDay.clone().set({ hour: 9, minute: 0 });
            let morningEndTime = currentDay.clone().set({ hour: 10, minute: 0 });

            while (morningStartTime.isBefore(morningEndTime)) {
                let slotEndTime = morningStartTime.clone().add(15, 'minutes'); // 30-minute slots
                promises.push(new Availability({
                    doctor: doctorId,
                    day: daysOfWeek[i],
                    date: currentDay.toDate(),
                    startTime: morningStartTime.toDate(),
                    endTime: slotEndTime.toDate(),
                    type: 'Tele-consultation',
                    isAvailable: true
                }).save());

                morningStartTime = slotEndTime; // Move to the next 30-minute slot
            }

            // Evening Tele-consultation (17:00 - 18:00)
            let eveningStartTimeTele = currentDay.clone().set({ hour: 17, minute: 0 });
            let eveningEndTimeTele = currentDay.clone().set({ hour: 18, minute: 0 });

            while (eveningStartTimeTele.isBefore(eveningEndTimeTele)) {
                let slotEndTime = eveningStartTimeTele.clone().add(15, 'minutes'); // 30-minute slots
                promises.push(new Availability({
                    doctor: doctorId,
                    day: daysOfWeek[i],
                    date: currentDay.toDate(),
                    startTime: eveningStartTimeTele.toDate(),
                    endTime: slotEndTime.toDate(),
                    type: 'Tele-consultation',
                    isAvailable: true
                }).save());

                eveningStartTimeTele = slotEndTime; // Move to the next 30-minute slot
            }

            // Evening In-person (18:00 - 21:00)
            let eveningStartTimeInPerson = currentDay.clone().set({ hour: 18, minute: 0 });
            let eveningEndTimeInPerson = currentDay.clone().set({ hour: 21, minute: 0 });

            while (eveningStartTimeInPerson.isBefore(eveningEndTimeInPerson)) {
                let slotEndTime = eveningStartTimeInPerson.clone().add(15, 'minutes'); // 30-minute slots
                promises.push(new Availability({
                    doctor: doctorId,
                    day: daysOfWeek[i],
                    date: currentDay.toDate(),
                    startTime: eveningStartTimeInPerson.toDate(),
                    endTime: slotEndTime.toDate(),
                    type: 'In-person',
                    isAvailable: true
                }).save());

                eveningStartTimeInPerson = slotEndTime; // Move to the next 30-minute slot
            }

            // Evening Tele-consultation (overlapping) (18:00 - 21:00)
            let eveningStartTimeTeleOverlap = currentDay.clone().set({ hour: 18, minute: 0 });
            let eveningEndTimeTeleOverlap = currentDay.clone().set({ hour: 21, minute: 0 });

            while (eveningStartTimeTeleOverlap.isBefore(eveningEndTimeTeleOverlap)) {
                let slotEndTime = eveningStartTimeTeleOverlap.clone().add(15, 'minutes'); // 30-minute slots
                promises.push(new Availability({
                    doctor: doctorId,
                    day: daysOfWeek[i],
                    date: currentDay.toDate(),
                    startTime: eveningStartTimeTeleOverlap.toDate(),
                    endTime: slotEndTime.toDate(),
                    type: 'Tele-consultation',
                    isAvailable: true
                }).save());

                eveningStartTimeTeleOverlap = slotEndTime; // Move to the next 30-minute slot
            }
        }

        await Promise.all(promises);
        console.log('Half-hour slots generated successfully for the week');
    } catch (error) {
        console.error('Error generating slots:', error);
    }
};



// Generate availability for the next week (Run this after a doctor signs up or every Sunday)
exports.createWeeklyAvailability = async (req, res) => {
    const { doctorId } = req.body;

    try {
        await generateWeeklySlots(doctorId);
        res.status(201).json({ message: 'Weekly slots created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create weekly slots.' });
    }
};

// // Mark or unmark a doctor as on holiday
// exports.toggleHoliday = async (req, res) => {
//     const { doctorId, date, action } = req.body;

//     try {
//         if (action === 'mark') {
//             // Mark all slots on this date as unavailable
//             await Availability.updateMany(
//                 { doctor: doctorId, date: new Date(date) },
//                 { isAvailable: false }
//             );
//             res.status(200).json({ message: 'Doctor marked as on holiday.' });
//         } else if (action === 'unmark') {
//             // Unmark holiday (make slots available again)
//             await Availability.updateMany(
//                 { doctor: doctorId, date: new Date(date) },
//                 { isAvailable: true }
//             );
//             res.status(200).json({ message: 'Holiday unmarked. Doctor is available.' });
//         } else {
//             res.status(400).json({ message: 'Invalid action.' });
//         }
//     } catch (error) {
//         console.error('Error toggling holiday:', error);
//         res.status(500).json({ message: 'Failed to process holiday.' });
//     }
// };


// Toggle Holiday Controller
exports.toggleHoliday = async (req, res) => {
    const { doctorId, slotId, isAvailable, startTime, endTime } = req.body;

    try {
        if (slotId) {
            // If slotId is provided, toggle the specific slot
            await Availability.findByIdAndUpdate(slotId, { isAvailable });
        } else if (startTime && endTime) {
            // If no slotId is provided, find the slot by startTime and endTime
            await Availability.findOneAndUpdate(
                { doctor: doctorId, startTime, endTime },
                { isAvailable: true }
            );
        }

        res.status(200).json({
            message: `Slot successfully ${isAvailable ? 'unmarked as holiday' : 'marked as holiday'}.`,
        });
    } catch (error) {
        console.error('Error toggling holiday:', error);
        res.status(500).json({ message: 'Failed to toggle holiday.' });
    }
};