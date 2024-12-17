import express from 'express';
import { signup, login, logout, updateProfile, authCheck, uploadMiddleware } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, uploadMiddleware, updateProfile);

router.get("/auth-check", protectRoute, authCheck);

export default router;