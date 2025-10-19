import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';

dotenv.config();

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        res.status(401).json({ message: "Access Denied" })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userEmail = decoded.email;
        console.log(req.userEmail);
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
}
export {verifyToken};