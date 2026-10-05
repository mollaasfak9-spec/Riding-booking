const mongoose = require("mongoose");
const crypto = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name must be at most 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false
        },
        phone: {
            type: String,
            trim: true,
            maxlength: 15
        },
        role: {
            type: String,
            enum: ["rider", "driver"],
            default: "rider"
        }
    },
    {
        timestamps: true
    }
);

// Hash password whenever it is set or changed
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hashed = await scrypt(this.password, salt, 64);

    this.password = `${salt}:${hashed.toString("hex")}`;
});

// Compare a plain text password with the stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password || typeof candidatePassword !== "string") {
        return false;
    }

    const [salt, storedHash] = this.password.split(":");

    if (!salt || !storedHash) {
        return false;
    }

    const hashed = await scrypt(candidatePassword, salt, 64);
    const stored = Buffer.from(storedHash, "hex");

    return hashed.length === stored.length && crypto.timingSafeEqual(hashed, stored);
};

// Never leak the password hash in API responses
userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
