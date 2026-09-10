import userModel from "../models/user.model.js";
import config from "../config/config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const generateToken = (req, res, userId, userRole) => {
    const tokenResponse = jwt.sign({ _id: userId, role: userRole }, config.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", tokenResponse, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return tokenResponse;
}

export const getMeController = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decodedToken._id);
        req.user = user;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User fetched successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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

export const logoutController = async (req, res, next) => {
    try {
        // 1. Clear the auth cookie with matching cross-site attributes
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
        });

        // 2. Extra fail-safe: overwrite with immediately expired epoch cookie
        res.cookie("token", "", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            expires: new Date(0),
        });

        // 3. Clean up Passport OAuth session if active
        if (req.logout && typeof req.logout === "function") {
            req.logout((err) => {
                if (err) console.error("Passport logout error:", err);
            });
        }
        if (req.session && typeof req.session.destroy === "function") {
            req.session.destroy();
        }

        // 4. Set strict anti-caching security headers to prevent browser back-button cache leaks
        res.set({
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
            "Surrogate-Control": "no-store"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        next(error);
    }
}

export const googleCallbackController = async (req, res, next) => {
    try {
        const targetOrigin = req.query.state || config.FRONTEND_URL || process.env.FRONTEND_URL || "http://localhost:5173";
        const cleanFrontendUrl = String(targetOrigin).replace(/\/$/, '');
        if (!req.user) {
            return res.redirect(`${cleanFrontendUrl}/login?error=GoogleAuthFailed`);
        }
        generateToken(req, res, req.user._id, req.user.role);

        // Redirect user back to Frontend after successful Google login
        return res.redirect(`${cleanFrontendUrl}/`);
    } catch (error) {
        next(error);
    }
}