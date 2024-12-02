import express from 'express';
import authRoutes from './routes/auth.route.js';
import { connectDB } from './lib/db.js';
import dotenv from 'dotenv'

// Configuration
const app = express();
dotenv.config()
const PORT = process.env.PORT

// Routes Definition
app.use("/api/auth", authRoutes);


app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
    connectDB()
})