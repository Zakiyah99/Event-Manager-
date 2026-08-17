import Event from "../models/Event.js";
import Client from "../models/Client.js";

export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const [
            totalEvents,
            upcomingEvents,
            completedEvents,
            cancelledEvents,
            totalClients,
            recentEvents
        ] = await Promise.all([
            Event.countDocuments({ createdBy: userId }),
            Event.countDocuments({ createdBy: userId, status: 'Upcoming' }),
            Event.countDocuments({ createdBy: userId, status: 'Completed' }),
            Event.countDocuments({ createdBy: userId, status: 'Cancelled' }),
            Client.countDocuments({ createdBy: userId }),
            Event.find({ createdBy: userId })
                .populate('client', 'fullName phone')
                .sort({ date: -1, createdAt: -1 })
                .limit(6)
        ]);

        res.json({
            totalEvents,
            upcomingEvents,
            completedEvents,
            cancelledEvents,
            totalClients,
            recentEvents
        })
    } catch (error) {
        next(error)
    }
}
