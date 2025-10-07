const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, updateUser, deleteUser, uploadProfilePicture, deleteProfilePicture, requestPasswordReset, verifyPasswordReset, refreshToken, logout } = require('../controllers/userController');
const { validateRegisterMiddleware, validateLoginMiddleware, validateUpdateProfileMiddleware, validatePasswordResetRequestMiddleware, validatePasswordResetVerifyMiddleware } = require('../middleware/validate');
const auth = require('../middleware/auth');
const upload = require('../utils/upload');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes'
});

const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many OTP requests, please try again after 1 hour'
});

router.post('/register', validateRegisterMiddleware, register);
router.post('/login', loginLimiter, validateLoginMiddleware, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', auth, logout);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, validateUpdateProfileMiddleware, updateProfile);
router.put('/', auth, updateUser);
router.delete('/', auth, deleteUser);
router.post('/profile/picture', auth, upload.single('profilePicture'), uploadProfilePicture);
router.delete('/profile/picture', auth, deleteProfilePicture);
router.post('/password/reset/request', otpRequestLimiter, validatePasswordResetRequestMiddleware, requestPasswordReset);
router.post('/password/reset/verify', otpRequestLimiter, validatePasswordResetVerifyMiddleware, verifyPasswordReset);

module.exports = router;