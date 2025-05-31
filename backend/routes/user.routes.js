const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const { auth } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');

router.get('/', auth, isAdmin, userCtrl.getAllUsers);
router.post('/', auth, isAdmin, userCtrl.createUser);
router.put('/:id', auth, isAdmin, userCtrl.updateUser);
router.delete('/:id', auth, isAdmin, userCtrl.deleteUser);
router.post('/:id/reset-password', auth, isAdmin, userCtrl.resetPassword);

module.exports = router;


const { verifyToken, checkAdmin } = require('../middleware/auth.middleware');

router.get('/roles', verifyToken, checkAdmin, userCtrl.getRoles);
