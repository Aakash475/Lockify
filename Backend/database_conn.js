import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("Connected to Database Successfully"))
        .catch((err) => console.log("Error connecting to Database: ", err));
};

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    }
});

const passwordSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    fileUpload: {
        type: String
    },
    userEmail: {
        type: String, ref: "User", required: true
    }
});

const User = mongoose.model("user",userSchema);

const Password = mongoose.model("password", passwordSchema);

export {connectDB, Password, User};