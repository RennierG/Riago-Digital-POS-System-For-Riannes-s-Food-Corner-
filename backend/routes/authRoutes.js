import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController.js';

const authRoutes = express.Router();

const limiter = (limit) => rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please wait a few minutes and try again.' }
});

authRoutes.use(limiter(30));
authRoutes.post('/register/request-otp', authController.requestOtp);
authRoutes.post('/register/verify-otp', authController.verifyOtp);

export default authRoutes;
