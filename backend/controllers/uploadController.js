import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";

const uploadBuffer = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "dugsiiye_uploads", resource_type: "auto" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });

export const uploadFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
    }

    try {
        const result = await uploadBuffer(req.file.buffer);
        await User.findByIdAndUpdate(req.user._id, { profile: result.secure_url })

        return res.status(201).json({
            success: true,
            fileUrl: result.secure_url
        })
    } catch (error) {
        next(error)
    }
}

export const uploadImage = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
    }

    try {
        const result = await uploadBuffer(req.file.buffer);

        return res.status(201).json({
            success: true,
            fileUrl: result.secure_url
        })
    } catch (error) {
        next(error)
    }
}
