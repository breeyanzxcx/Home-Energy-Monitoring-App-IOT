const express = require('express');
const router = express.Router();
const { createHome, getHomes, getHomeById, updateHome, deleteHome } = require('../controllers/homeController');
const { validateHomeMiddleware } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/', auth, validateHomeMiddleware, createHome);
router.get('/', auth, getHomes);
router.get('/:id', auth, getHomeById);
router.put('/:id', auth, validateHomeMiddleware, updateHome);
router.delete('/:id', auth, deleteHome);

module.exports = router;