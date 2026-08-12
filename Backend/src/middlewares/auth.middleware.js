import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const authenticateSeller = async (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        res.status(401).json({ message: "Unauthorized" });
    }

    try{
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        
        if(req.user.role !== "seller") {
            return res.status(403).json({ req: req.user ,message: "Forbidden: Only sellers allowed" });
        }
        next();
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}