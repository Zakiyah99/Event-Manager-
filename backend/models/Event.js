import mongoose from "mongoose";

const EVENT_STATUSES = ['Draft', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'];

const eventSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        eventType: { type: String, required: true },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            default: null
        },
        date: { type: Date, required: true },
        startTime: { type: String, default: '' },
        endTime: { type: String, default: '' },
        venue: { type: String, required: true },
        numberOfGuests: { type: Number, default: 0 },
        contactName: { type: String, default: '' },
        contactPhone: { type: String, default: '' },
        status: {
            type: String,
            enum: EVENT_STATUSES,
            default: 'Draft'
        },
        description: { type: String, default: '' },
        poster: { type: String, default: '' },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }, { timestamps: true }
);

export { EVENT_STATUSES };
export default mongoose.model('Event', eventSchema);
