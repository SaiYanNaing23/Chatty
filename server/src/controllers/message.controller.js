import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import dotenv from 'dotenv';
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import { getRecieverSocketId, io } from "../lib/socket.js";

dotenv.config()
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const getUsersForSidebar = async(req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id : {$ne : loggedInUserId}}).select("-password");

        return res.status(200).json(filteredUsers);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message : "Internal Server Error", success : false });
    }
}

export const getMessages = async(req, res) => {
    try {
        const { id : userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or : [
                { senderId : myId, receiverId : userToChatId },
                { senderId : userToChatId, receiverId : myId },
            ]
        })

        return res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message : "Internal Server Error", success : false });
    }
}

export const sendMessages = async(req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
     
        const file = image;

        let publicUrl = "";
        if(file){
            // const { data, error } = await supabase.storage
            //     .from('Chatty_images')
            //     .upload(`user_${senderId}/${Date.now()}_${file.originalname}`, file.buffer, {
            //         contentType: file.mimetype,
            //     });

            // Extract the base64 part and content type
            const matches = file.match(/^data:(.*);base64,(.*)$/);
            if (!matches) {
                throw new Error("Invalid base64 format");
            }

            const contentType = matches[1]; // "image/png"
            const base64Data = matches[2]; // Base64 data
            const buffer = Buffer.from(base64Data, "base64"); // Convert base64 to Buffer

            // Construct a file name
            const fileName = `user_${senderId}/${Date.now()}_profile.png`;

            // Upload to Supabase
            const { data, error } = await supabase.storage
                .from("Chatty_images")
                .upload(fileName, buffer, {
                    contentType, // Pass extracted content type
                });

    
            if (error) {
                console.error('Error uploading to Supabase:', error);
                return res.status(500).json({ message: "Failed to upload profile picture.", success: false });
            }
           
            const response = supabase.storage.from('Chatty_images').getPublicUrl(data.path);
            console.log("response.data.publicUrl", response.data.publicUrl)
            publicUrl = response.data.publicUrl;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image : publicUrl ? publicUrl : "",
        });

        await newMessage.save();

        // socket.io
        const receiverSocketId = getRecieverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDelivery", newMessage);
        }else{
            console.log("reciever is not online.")
        }

        res.status(201).json(newMessage);
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message : "Internal Server Error", success : false });
    }
}

export const uploadImageMiddleware = upload.single('image');