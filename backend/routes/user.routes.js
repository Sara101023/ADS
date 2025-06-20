const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios del sistema
 */

// 📋 Obtener todos los usuarios (Admin)
router.get(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.checkAdmin,
  userController.getAllUsers
);

// ➕ Crear nuevo usuario (Admin)
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.checkAdmin,
  userController.createUser
);

// ✏️ Actualizar usuario (Admin)
router.put(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.checkAdmin,
  userController.updateUser
);

// ❌ Eliminar usuario (Admin)
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.checkAdmin,
  userController.deleteUser
);

// 🔐 Restablecer contraseña (Admin)
router.post(
  '/:id/reset-password',
  authMiddleware.verifyToken,
  authMiddleware.checkAdmin,
  userController.resetPassword
);

// 🧾 Obtener lista de roles (Admin)
router.get(
  '/roles',
  authMiddleware.verifyToken,
  authMiddleware.checkAdmin,
  userController.getRoles
);

module.exports = router;
