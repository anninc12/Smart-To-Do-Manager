import express from "express";
import User from "../models/User.js";
import PasswordReset from "../models/PasswordReset.js";

const router = express.Router();

//Register
router.post("/register", async (req, res) => {

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({
            user: { name: newUser.name, email: newUser.email }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

//Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({
            user: { name: user.name, email: user.email }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

//Reset Password
router.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const resetLog = new PasswordReset({
            email,
            oldPassword: user.password,
            newPassword
        });
        await resetLog.save();

        user.password = newPassword;
        await user.save();
        res.json({ message: "Password Reset  successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
export default router;