const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas públicas
router.post('/login', authController.login);
router.get('/logout', authMiddleware.verifyToken, authController.logout);
router.get('/me', authMiddleware.verifyToken, authController.getCurrentUser);

// Rutas de administrador (gestión de usuarios)
//router.post('/users', authMiddleware.verifyToken, authMiddleware.checkAdmin, authController.createUser);
//router.get('/users', authMiddleware.verifyToken, authMiddleware.checkAdmin, authController.getAllUsers);
//router.put('/users/:id', authMiddleware.verifyToken, authMiddleware.checkAdmin, authController.updateUser);
//router.delete('/users/:id', authMiddleware.verifyToken, authMiddleware.checkAdmin, authController.deleteUser);

module.exports = router;
