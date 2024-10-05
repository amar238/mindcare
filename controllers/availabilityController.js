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
        console.log("returning")

        return res.render('doctorAvailability', {
            doctorId: doctor._id,
            availableSlots: formattedSlots
        });
    } catch (error) {
        console.error('Error fetching doctor availability page:', error);
        return res.status(500).send("An error occurred while fetching the doctor's availability page.");
    }
};

// Helper function to generate slots for a week
const generateWeeklySlots = async (doctorId) => {
    const startTimeMorning = moment().set({ hour: 9, minute: 0 });
    const endTimeMorning = moment().set({ hour: 10, minute: 0 });
    const startTimeEveningTele = moment().set({ hour: 17, minute: 0 });
    const endTimeEveningTele = moment().set({ hour: 18, minute: 0 });
    const startTimeEveningInPerson = moment().set({ hour: 18, minute: 0 });
    const endTimeEveningInPerson = moment().set({ hour: 21, minute: 0 });

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = moment(); // Current date
    const nextMonday = today.clone().day(1).startOf('day'); // Move to the next Monday

    const promises = [];

    try {
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

        // If no slots exist, proceed with generation
        for (let i = 0; i < daysOfWeek.length; i++) {
            const currentDay = nextMonday.clone().add(i, 'days');

            // Morning Tele-consultation
            promises.push(new Availability({
                doctor: doctorId,
                day: daysOfWeek[i],
                date: currentDay.toDate(),
                startTime: currentDay.clone().set({ hour: 9, minute: 0 }).toDate(),
                endTime: currentDay.clone().set({ hour: 10, minute: 0 }).toDate(),
                type: 'Tele-consultation',
                isAvailable: true
            }).save());

            // Evening Tele-consultation
            promises.push(new Availability({
                doctor: doctorId,
                day: daysOfWeek[i],
                date: currentDay.toDate(),
                startTime: currentDay.clone().set({ hour: 17, minute: 0 }).toDate(),
                endTime: currentDay.clone().set({ hour: 18, minute: 0 }).toDate(),
                type: 'Tele-consultation',
                isAvailable: true
            }).save());

            // Evening In-person (overlapping with tele-therapy)
            promises.push(new Availability({
                doctor: doctorId,
                day: daysOfWeek[i],
                date: currentDay.toDate(),
                startTime: currentDay.clone().set({ hour: 18, minute: 0 }).toDate(),
                endTime: currentDay.clone().set({ hour: 21, minute: 0 }).toDate(),
                type: 'In-person',
                isAvailable: true
            }).save());

            // Evening Tele-consultation (overlapping with in-person)
            promises.push(new Availability({
                doctor: doctorId,
                day: daysOfWeek[i],
                date: currentDay.toDate(),
                startTime: currentDay.clone().set({ hour: 18, minute: 0 }).toDate(),
                endTime: currentDay.clone().set({ hour: 21, minute: 0 }).toDate(),
                type: 'Tele-consultation',
                isAvailable: true
            }).save());
        }

        await Promise.all(promises);
        console.log('Slots generated successfully for the week');
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
    const { doctorId, slotId, isAvailable } = req.body;

    try {
        if (slotId) {
            // If slotId is provided, toggle the specific slot
            await Availability.findByIdAndUpdate(slotId, { isAvailable });
            const message = isAvailable ? 'Slot is now available for booking.' : 'Slot is marked as holiday.';
            return res.status(200).json({ message });
        } else {
            // Here you would need logic to find the corresponding slot based on the time.
            // This would typically involve looking up the start and end times.
            return res.status(400).json({ message: 'Slot ID must be provided.' });
        }
    } catch (error) {
        console.error('Error toggling holiday:', error);
        res.status(500).json({ message: 'Failed to toggle holiday.' });
    }
};