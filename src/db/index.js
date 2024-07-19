import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const dbConnect = async () => {
    try {
        const connectionString = `${process.env.MONGODB_URI}/${DB_NAME}`;
        console.log(`Connecting to MongoDB with connection string: ${connectionString}`);

        // Check if connection string is correctly formed
        if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
            throw new Error('Invalid connection string format');
        }

        const connectionInstance = await mongoose.connect(connectionString);
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default dbConnect;