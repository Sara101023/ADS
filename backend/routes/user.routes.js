const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const { verifyToken, checkAdmin } = require('../middlewares/auth.middleware');

// Rutas protegidas solo para administradores
router.get('/', verifyToken, checkAdmin, userCtrl.getAllUsers);
router.post('/', verifyToken, checkAdmin, userCtrl.createUser);
router.put('/:id', verifyToken, checkAdmin, userCtrl.updateUser);
router.delete('/:id', verifyToken, checkAdmin, userCtrl.deleteUser);
router.post('/:id/reset-password', verifyToken, checkAdmin, userCtrl.resetPassword);

// Obtener roles disponibles (para desplegarlos en el frontend)
router.get('/roles', verifyToken, checkAdmin, userCtrl.getRoles);

module.exports = router;
