// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config({
    path: './.env'
});

import dbConnect from "./db/index.js";
import app from "./app.js";

console.log('Environment Variables from index:', {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
});

dbConnect()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Application is running on port ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log(`Mongo DB connection failed!! ${error}`)
    })