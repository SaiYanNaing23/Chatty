import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateJWTToken } from '../lib/utils.js'
import { createClient } from '@supabase/supabase-js'
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const signup = async(req,res) => {
    const { username, email, password } = req.body;
    try {
        if( !username && !email && !password ){
            return res.status(400).json({ message : "All fields are required", success : false });
        }
        if(password.length < 6){
            return res.status(400).json({ message : "Password must be at least 6 characters long", success : false });
        }

        const exitingUser = await User.findOne({ email });

        if(exitingUser) return res.status(400).json({ message : "User already exists", success : false });

        const salt = await bcrypt.genSalt(10)
        console.log(" salt ", salt );

        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password : hashedPassword,
        })

        if(!newUser) {
            return res.status(400).json({ message : "Invalid User.", success : false });
        }else{
            generateJWTToken(newUser._id, res)
            await newUser.save();

            res.status(200).json({
                id : newUser._id,
                username : newUser.username,
                email : newUser.email,
            });
        }

        
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message : "Internal Server Error", success : false });
    }
}

export const login = async(req,res) => {
    const { email, password } = req.body;
    try {
        if(!email && !password) return res.status(400).json({ message : "All fields are requried.", success : false });

        const user = await User.findOne({ email });

        if(!user) return res.status(400).json({ message : "User Not Found", success : false });

        const isCorrectPassword = await bcrypt.compare(password, user.password)

        if(!isCorrectPassword) return res.status(400).json({ message : "Invalid Credentials", success : false });

        generateJWTToken(user._id, res)

        res.status(200).json({
            user : {
                id : user._id,
                username : user.username,
                email : user.email,
            },
            success : true,
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message : "Internal Server Error", success : false });
    }
}

export const logout = async(req,res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message : "Logged Out Successfully", success : true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message : "Internal Server Error", success : false });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        if (!req.file) {
            return res.status(400).json({ message: "Profile picture is required.", success: false });
        }

        const file = req.file;
       
        const { data, error } = await supabase.storage
            .from('Chatty_images')
            .upload(`user_${userId}/${Date.now()}_${file.originalname}`, file.buffer, {
                contentType: file.mimetype,
            });

        if (error) {
            console.error('Error uploading to Supabase:', error);
            return res.status(500).json({ message: "Failed to upload profile picture.", success: false });
        }
       
        const response = supabase.storage.from('Chatty_images').getPublicUrl(data.path);
     
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: response.data.publicUrl },
            { new: true }
        );

        return res.status(200).json({ message: "Profile updated successfully.", success: true, user: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}

export const uploadMiddleware = upload.single('profilePic');


export const authCheck = async(req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message : "Internal Server Error", success : false });
    }
}