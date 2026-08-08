import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    const tokenResponse = jwt.sign({ _id: userId }, config.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", tokenResponse, {
        httpOnly: true,
        secure: true,
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

        generateToken(user._id);

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

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        generateToken(user._id);

        res.status(200).json({ message: "User logged in successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}