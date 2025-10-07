const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, updateUser, deleteUser } = require('../controllers/userController');
const { validateRegisterMiddleware, validateLoginMiddleware, validateUpdateProfileMiddleware } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/register', validateRegisterMiddleware, register);
router.post('/login', validateLoginMiddleware, login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, validateUpdateProfileMiddleware, updateProfile);
router.put('/', auth, updateUser);
router.delete('/', auth, deleteUser);

module.exports = router;