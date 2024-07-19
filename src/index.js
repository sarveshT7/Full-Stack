// require('dotenv').config({path:'./env'})
import dbConnect from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";

// Load environment variables from .env file
dotenv.config();

dbConnect()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Application is running on port ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log(`Mongo DB connection failed!! ${error}`)
    })