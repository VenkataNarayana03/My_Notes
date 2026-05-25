import express from 'express';
import { loginUser, registerUser, requestLoginOtp, verifyLoginOtp } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/request-otp', requestLoginOtp);
router.post('/verify-otp', verifyLoginOtp);

export default router;
