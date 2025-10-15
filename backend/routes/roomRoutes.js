const express = require('express');
const router = express.Router();
const { createRoom, getRooms, getRoomById, updateRoom, deleteRoom } = require('../controllers/roomController');
const { validateRoomMiddleware, validateUpdateRoomMiddleware } = require('../middleware/validate');
const auth = require('../middleware/auth');

// Assume you mount at /api/rooms in app.js/server.js
router.post('/', auth, validateRoomMiddleware, createRoom);
router.get('/', auth, getRooms);
router.get('/:id', auth, getRoomById);
router.put('/:id', auth, validateUpdateRoomMiddleware, updateRoom); // Partial validation (ignores required in update)
router.delete('/:id', auth, deleteRoom);

module.exports = router;