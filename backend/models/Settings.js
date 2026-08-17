import mongoose from "mongoose";

export const DEFAULT_EVENT_TYPES = [
    'Wedding',
    'Birthday',
    'Graduation',
    'Conference',
    'Meeting',
    'Seminar',
    'Workshop',
    'Corporate Event',
    'Engagement',
    'Other'
];

const eventTypeSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

const settingsSchema = new mongoose.Schema(
    {
        systemName: { type: String, default: 'Event Manager' },
        eventTypes: {
            type: [eventTypeSchema],
            default: []
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        }
    }, { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
