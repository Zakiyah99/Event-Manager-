import Client from "../models/Client.js";
import Event from "../models/Event.js";

export const createClient = async (req, res, next) => {
    try {
        const client = await Client.create({ ...req.body, createdBy: req.user._id });
        res.status(201).json(client)
    } catch (error) {
        next(error)
    }
}

export const getMyClients = async (req, res, next) => {
    try {
        const { search } = req.query;
        const query = { createdBy: req.user._id };

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }

        const clients = await Client.find(query).sort({ createdAt: -1 });
        res.json(clients)
    } catch (error) {
        next(error)
    }
}

export const getClientById = async (req, res, next) => {
    try {
        const client = await Client.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!client) return res.status(404).json("Client not found")

        const events = await Event.find({ client: client._id, createdBy: req.user._id }).sort({ date: 1 });
        res.json({ ...client.toObject(), events })
    } catch (error) {
        next(error)
    }
}

export const updateClient = async (req, res, next) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true }
        );

        if (!client) return res.status(404).json("Client not found")
        res.json(client)
    } catch (error) {
        next(error)
    }
}

export const deleteClient = async (req, res, next) => {
    try {
        const relatedEvents = await Event.countDocuments({
            client: req.params.id,
            createdBy: req.user._id
        });

        if (relatedEvents > 0) {
            return res.status(400).json({
                message: "Cannot delete client with existing events. Remove or reassign those events first."
            });
        }

        const client = await Client.findOneAndDelete(
            { _id: req.params.id, createdBy: req.user._id }
        );
        if (!client) return res.status(404).json("Client not found")

        res.json({ message: "Client deleted" })
    } catch (error) {
        next(error)
    }
}
