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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene todos los usuarios (Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.checkAdmin,
  userController.getAllUsers
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crea un nuevo usuario (Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUser'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos o faltantes
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       409:
 *         description: Número de trabajador ya existe
 */
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.checkAdmin,
  userController.createUser
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualiza un usuario existente (Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Número de trabajador ya existe
 */
router.put(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.checkAdmin,
  userController.updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Elimina un usuario (Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.checkAdmin,
  userController.deleteUser
);

/**
 * @swagger
 * /users/{id}/reset-password:
 *   post:
 *     summary: Restablece la contraseña de un usuario (Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nuevaPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Contraseña restablecida
 *       400:
 *         description: Contraseña no válida o faltante
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.post(
  '/:id/reset-password',
  authMiddleware.verifyToken,
  authMiddleware.checkAdmin,
  userController.resetPassword
);

/**
 * @swagger
 * /users/roles:
 *   get:
 *     summary: Obtiene todos los roles disponibles (Admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 */
router.get(
  '/roles',
  authMiddleware.verifyToken,
  authMiddleware.checkAdmin,
  userController.getRoles
);

module.exports = router;