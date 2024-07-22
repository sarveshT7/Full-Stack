import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema = new Schema({

    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }
},
    { timestamps: true });

userSchema.pre("save", async function () {
    if (!this.password.isModified("password")) return next()

    this.password = bcrypt.hash(this.password, 10)
    next()
})
userSchema.methods.isPasswordCorrect = async function () {
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessTokens = function () {
    jwt.sign(
        {
            _id: this._id,
            userName: this.userName,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshTokens = function () {
    jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)