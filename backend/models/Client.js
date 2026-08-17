import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, default: '' },
        address: { type: String, default: '' },
        notes: { type: String, default: '' },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }, { timestamps: true }
);

export default mongoose.model('Client', clientSchema);
