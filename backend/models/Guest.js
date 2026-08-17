import mongoose from "mongoose";

const INVITATION_STATUSES = ['Invited', 'Confirmed', 'Declined', 'Attended'];

const guestSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, default: '' },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        numberOfPeople: { type: Number, default: 1 },
        invitationStatus: {
            type: String,
            enum: INVITATION_STATUSES,
            default: 'Invited'
        },
        notes: { type: String, default: '' },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }, { timestamps: true }
);

export { INVITATION_STATUSES };
export default mongoose.model('Guest', guestSchema);
