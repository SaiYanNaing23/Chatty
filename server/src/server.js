import express from 'express';
import { connectDB } from './lib/db.js';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { app, server } from "../src/lib/socket.js"
import path from "path";

// Routers
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';

// Configuration
dotenv.config()
const PORT = process.env.PORT
const __dirname = path.resolve();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true,
}))

// Increase payload size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes Definition
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, "../client" , "dist", "index.html"));
    });
}


server.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
    connectDB()
})