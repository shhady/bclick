import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
     // This ensures that the strictQuery option is set correctly
     mongoose.set('strictQuery', true);

    // If already connected, log a message and return
    if (isConnected) {
        console.log('Already connected to MongoDB');
        return;
    }

    try {
        // Connect to the MongoDB database using the environment variable for the connection string
        await mongoose.connect(process.env.DATABASE_URL, {
            dbName: 'sapakim',        // Name of the database
        });
        isConnected = true;
        console.log('MongoDB connection established');
    } catch (error) {
        console.log('Error connecting to MongoDB:', error);
    }
};
