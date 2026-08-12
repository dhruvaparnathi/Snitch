import userModel from "../models/user.model.js";
import config from "../config/config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const generateToken = (req, res, userId, userRole) => {
    const tokenResponse = jwt.sign({ _id: userId, role: userRole }, config.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", tokenResponse, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return tokenResponse;
}

export const registerController = async (req, res, next) => {
    try {
        const { email, mobile, fullName, password, role } = req.body;
        if(!email || !mobile || !fullName || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const alreadyUser = await userModel.findOne({ email });
        if(alreadyUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await userModel.create({ email, mobile, fullName, password, role });

        generateToken(req, res, user._id, user.role);

        res.status(200).json({ message: "User registered successfully", user });

    } catch (error) {
        next(error);
    }
}

export const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await userModel.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.password) {
            return res.status(400).json({ message: "This account was created with Google. Please sign in with Google." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        generateToken(req, res, user._id, user.role);

        res.status(200).json({ message: "User logged in successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const googleCallbackController = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.redirect("http://localhost:5174/login?error=GoogleAuthFailed");
        }
        generateToken(req, res, req.user._id, req.user.role);

        // Redirect user back to Frontend after successful Google login
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
        return res.redirect(`${frontendUrl}/`);
    } catch (error) {
        next(error);
    }
}