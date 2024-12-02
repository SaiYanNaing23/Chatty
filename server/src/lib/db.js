import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Mongo DB is Connected ${conn.connection.host}`)
    } catch (error) {
        console.log(error);
    }
}