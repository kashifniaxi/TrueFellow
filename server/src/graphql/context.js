import { verifyToken } from "../utils/token.js";
import User from "../models/User.model.js";

export const context = async ({ req }) => {
    const authHeader = req.headers.authorization || '';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: null };
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id).select('name email role isVerified');
        
        if (!user) {
            return { user: null };
        }
        
        return { user };
    } catch (err) {
        console.error("Token verification failed:", err.message || err); // Better error logging
        return { user: null };
    }
};