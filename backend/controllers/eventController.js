const Event = require('../models/Event');

// @desc    Create an event
// @route   POST /api/events
// @access  Private (Faculty/Admin)
const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, capacity, category } = req.body;

        const event = await Event.create({
            title,
            description,
            date,
            location,
            capacity: capacity || 100,
            category,
            createdBy: req.user._id,
        });

        const populatedEvent = await Event.findById(event._id).populate('createdBy', 'name role');

        res.status(201).json(populatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
    try {
        const { status, category } = req.query;

        let filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;

        const events = await Event.find(filter)
            .populate('createdBy', 'name role')
            .sort({ date: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private (Student)
const registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if already registered
        if (event.registeredUsers.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already registered for this event' });
        }

        // Check capacity
        if (event.registeredUsers.length >= event.capacity) {
            return res.status(400).json({ message: 'Event is full' });
        }

        event.registeredUsers.push(req.user._id);
        await event.save();

        res.json({ message: 'Registered successfully', event });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get event registrations (creator only)
// @route   GET /api/events/:id/registrations
// @access  Private
const getRegistrations = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate(
            'registeredUsers',
            'name email department year'
        );

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Only event creator or admin can view registrations
        if (
            event.createdBy.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(event.registeredUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Creator or Admin)
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Only creator or admin can update
        if (
            event.createdBy.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createEvent,
    getEvents,
    registerForEvent,
    getRegistrations,
    updateEvent,
};
