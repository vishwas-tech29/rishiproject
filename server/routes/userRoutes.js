const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.use(protect);

router.get('/me', userController.getMe);
router.put('/me', userController.updateProfile);
router.put('/password', userController.updatePassword);

module.exports = router;
