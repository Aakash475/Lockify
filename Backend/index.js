import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectDB, User, Password } from './database_conn.js';
import { verifyToken } from './authMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(cors());

connectDB();

// Registration of User
app.post('/register', async (req, res) => {
    try {
        const { firstName, email, password, gender } = req.body
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ firstName, email, password: hashedPassword, gender })
        await newUser.save();
        res.status(201).json({ message: "User Registered Successfully", newEntry: newUser })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
})

// Login User
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            res.status(404).json({ message: "User not found" })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid Credentials" })
        }

        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                firstName: user.firstName,
                email: user.email,
                gender: user.gender
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})

// Delete the User
app.delete('/user/delete/:email', verifyToken, async (req, res) => {
    try {
        const existingUser = await User.findOneAndDelete({ email: req.params.email })
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        await Password.deleteMany({ userEmail: req.userEmail });
        res.status(200).json({ message: "User and associated passwords deleted successfully", existingUser });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})

// Registering a new password entry
app.post(('/add'), verifyToken, async (req, res) => {
    try {
        const { url, password, description, fileUpload } = req.body
        const newEntry = new Password({ userEmail: req.userEmail, url, password, description, fileUpload });
        await newEntry.save();
        res.status(201).json({ message: "Password added successfully", entry: newEntry });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})

// Fetching all password entries
app.get('/find', verifyToken, async (req, res) => {
    try {
        const entries = await Password.find({ userEmail: req.userEmail });
        res.status(200).json({ message: "Password entries fetched successfully", entries });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})

// Fetching a specific password entry by username
app.get('/find/:userEmail', verifyToken, async (req, res) => {
    try {
        const entry = await Password.findOne(req.params.userEmail, { userEmail: req.userEmail });
        if (!entry) {
            return res.status(404).json({ message: "Password entry not found" });
        }
        res.status(200).json({ message: "Password entry fetched successfully", entry });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})

// Updating a password entry by username
app.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const { url, password, description, fileUpload } = req.body;
        const entry = await Password.findByIdAndUpdate(req.params.id, { url, password, description, fileUpload, userEmail: req.userEmail }, { new: true });
        if (!entry) {
            return res.status(404).json({ message: "Password entry not found" });
        }
        res.status(200).json({ message: "Password entry updated successfully", entry });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})

// Deleting all password entries
app.delete('/delete', verifyToken, async (req, res) => {
    try {
        await Password.deleteMany({ userEmail: req.userEmail });
        res.status(200).json({ message: "All password entries deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})

// Deleting a password entry by username
app.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const entry = await Password.findOneAndDelete(req.params.id, { userEmail: req.userEmail });
        if (!entry) {
            return res.status(404).json({ message: "Password entry not found" });
        }
        res.status(200).json({ message: "Password entry deleted successfully", entry });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})

app.listen(port, () => {
    console.log(`Password Manager Application listening on port http://localhost:${port}`)
})