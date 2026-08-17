import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// REGISTER NEW USER

export const register = async (req, res, next) => {

    let { name, password, email, role } = req.body;

    try {
        email = email.toLowerCase();
        const exists = await User.findOne({ email });

        if (exists) return res.status(400).json({ message: 'Email already in use' });

        const user = await User.create({ name, password, email, role });

        const token = generateToken(user._id)

        res.status(201).json({ "success": true, message: "User registered successfully" })

    } catch (err) {
        console.log("error", err)
        next(err)
    }
}

export const login = async (req, res, next) => {

    let { email, password } = req.body;

    try {

        email = email.toLowerCase();

        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const token = generateToken(user._id);

        user.password = undefined

        res.json({ token, user })

    } catch (err) {
        next(err)
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (email && email.toLowerCase() !== user.email) {
            const exists = await User.findOne({ email: email.toLowerCase() });
            if (exists) return res.status(400).json({ message: 'Email already in use' });
            user.email = email.toLowerCase();
        }

        if (name) user.name = name;
        if (password) user.password = password;

        await user.save();
        user.password = undefined;
        res.json(user)
    } catch (err) {
        next(err)
    }
}