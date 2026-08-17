import Settings, { DEFAULT_EVENT_TYPES } from "../models/Settings.js";

const seedEventTypes = () => DEFAULT_EVENT_TYPES.map((name) => ({ name }));

export const getOrCreateSettings = async (userId) => {
    let settings = await Settings.findOne({ createdBy: userId });

    if (!settings) {
        settings = await Settings.create({
            createdBy: userId,
            systemName: 'Event Manager',
            eventTypes: seedEventTypes()
        });
    } else if (!settings.eventTypes || settings.eventTypes.length === 0) {
        settings.eventTypes = seedEventTypes();
        await settings.save();
    }

    return settings;
}

export const getSettings = async (req, res, next) => {
    try {
        const settings = await getOrCreateSettings(req.user._id);
        res.json(settings)
    } catch (error) {
        next(error)
    }
}

export const updateSettings = async (req, res, next) => {
    try {
        const settings = await getOrCreateSettings(req.user._id);

        const fields = ['systemName'];
        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        });

        await settings.save();
        res.json(settings)
    } catch (error) {
        next(error)
    }
}

export const addEventType = async (req, res, next) => {
    try {
        const settings = await getOrCreateSettings(req.user._id);
        const name = req.body.name.trim();

        const exists = settings.eventTypes.some(
            (type) => type.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            return res.status(400).json({ message: 'Event type already exists' });
        }

        settings.eventTypes.push({ name });
        await settings.save();
        res.status(201).json(settings)
    } catch (error) {
        next(error)
    }
}

export const updateEventType = async (req, res, next) => {
    try {
        const settings = await getOrCreateSettings(req.user._id);
        const eventType = settings.eventTypes.id(req.params.id);

        if (!eventType) return res.status(404).json({ message: 'Event type not found' });

        eventType.name = req.body.name.trim();
        await settings.save();
        res.json(settings)
    } catch (error) {
        next(error)
    }
}

export const deleteEventType = async (req, res, next) => {
    try {
        const settings = await getOrCreateSettings(req.user._id);
        const eventType = settings.eventTypes.id(req.params.id);

        if (!eventType) return res.status(404).json({ message: 'Event type not found' });

        eventType.deleteOne();
        await settings.save();
        res.json(settings)
    } catch (error) {
        next(error)
    }
}
