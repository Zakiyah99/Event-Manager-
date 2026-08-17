import Guest from "../models/Guest.js";
import Event from "../models/Event.js";

const assertOwnedEvent = async (eventId, userId) => {
    const event = await Event.findOne({ _id: eventId, createdBy: userId });
    if (!event) {
        const error = new Error('Event not found');
        error.statusCode = 400;
        throw error;
    }
    return event;
}

export const createGuest = async (req, res, next) => {
    try {
        await assertOwnedEvent(req.body.event, req.user._id);

        const guest = await Guest.create({ ...req.body, createdBy: req.user._id });
        const populated = await Guest.findById(guest._id).populate('event', 'name date status venue');
        res.status(201).json(populated)
    } catch (error) {
        next(error)
    }
}

export const getMyGuests = async (req, res, next) => {
    try {
        const { search, event, status } = req.query;
        const query = { createdBy: req.user._id };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        if (event) {
            query.event = event;
        }

        if (status) {
            query.invitationStatus = status;
        }

        const guests = await Guest.find(query)
            .populate('event', 'name date status venue')
            .sort({ createdAt: -1 });
        res.json(guests)
    } catch (error) {
        next(error)
    }
}

export const updateGuest = async (req, res, next) => {
    try {
        if (req.body.event) {
            await assertOwnedEvent(req.body.event, req.user._id);
        }

        const guest = await Guest.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true }
        ).populate('event', 'name date status venue');

        if (!guest) return res.status(404).json("Guest not found")
        res.json(guest)
    } catch (error) {
        next(error)
    }
}

export const deleteGuest = async (req, res, next) => {
    try {
        const guest = await Guest.findOneAndDelete(
            { _id: req.params.id, createdBy: req.user._id }
        );
        if (!guest) return res.status(404).json("Guest not found")

        res.json({ message: "Guest deleted" })
    } catch (error) {
        next(error)
    }
}
