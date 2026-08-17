import Event from "../models/Event.js";
import Client from "../models/Client.js";
import Guest from "../models/Guest.js";

const emptyToNull = (value) => (value ? value : null);

const assertOwnedClient = async (clientId, userId) => {
    if (!clientId) return null;
    const client = await Client.findOne({ _id: clientId, createdBy: userId });
    if (!client) {
        const error = new Error('Client not found');
        error.statusCode = 400;
        throw error;
    }
    return client;
}

export const createEvent = async (req, res, next) => {
    try {
        await assertOwnedClient(req.body.client, req.user._id);

        const event = await Event.create({
            ...req.body,
            client: emptyToNull(req.body.client),
            createdBy: req.user._id
        });

        const populated = await Event.findById(event._id).populate('client', 'fullName phone email');
        res.status(201).json(populated)
    } catch (error) {
        next(error)
    }
}

export const getMyEvents = async (req, res, next) => {
    try {
        const { search, filter, status, type, client, date } = req.query;
        const query = { createdBy: req.user._id };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { venue: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { eventType: { $regex: search, $options: 'i' } },
                { contactName: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        if (type) {
            query.eventType = type;
        }

        if (client) {
            query.client = client;
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(endOfToday.getDate() + 1);

        if (date) {
            const selected = new Date(date);
            selected.setHours(0, 0, 0, 0);
            const nextDay = new Date(selected);
            nextDay.setDate(nextDay.getDate() + 1);
            query.date = { $gte: selected, $lt: nextDay };
        } else if (filter === 'upcoming') {
            query.date = { $gte: startOfToday };
            query.status = query.status || { $in: ['Draft', 'Upcoming', 'In Progress'] };
        } else if (filter === 'past') {
            query.date = { $lt: startOfToday };
        } else if (filter === 'today') {
            query.date = { $gte: startOfToday, $lt: endOfToday };
        }

        const events = await Event.find(query)
            .populate('client', 'fullName phone email')
            .sort({ date: 1 });
        res.json(events)
    } catch (error) {
        next(error)
    }
}

export const getEventById = async (req, res, next) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, createdBy: req.user._id })
            .populate('client', 'fullName phone email address');

        if (!event) return res.status(404).json("Event not found")
        res.json(event)
    } catch (error) {
        next(error)
    }
}

export const updateEvent = async (req, res, next) => {
    try {
        if (req.body.client !== undefined) {
            await assertOwnedClient(req.body.client, req.user._id);
            req.body.client = emptyToNull(req.body.client);
        }

        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true }
        ).populate('client', 'fullName phone email');

        if (!event) return res.status(404).json("Event not found")
        res.json(event)
    } catch (error) {
        next(error)
    }
}

export const deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findOneAndDelete(
            { _id: req.params.id, createdBy: req.user._id }
        );
        if (!event) return res.status(404).json("Event not found")

        await Guest.deleteMany({ event: event._id, createdBy: req.user._id });

        res.json({ message: "Event deleted" })
    } catch (error) {
        next(error)
    }
}
