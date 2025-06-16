const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { checkRoles } = require('../middlewares/role.middleware');

// 🔐 Solo cajeros pueden procesar ventas y devoluciones
router.post(
  '/',
  authMiddleware.verifyToken,
  checkRoles(['cajero']),
  salesController.processSale
);

// 🔍 Cajeros pueden ver sus propias ventas
router.get(
  '/',
  authMiddleware.verifyToken,
  checkRoles(['cajero']),
  salesController.getAllSales
);

router.get(
  '/:id',
  authMiddleware.verifyToken,
  checkRoles(['cajero']),
  salesController.getSaleById
);

// 🔁 Procesar devolución solo por cajero
router.post(
  '/:saleId/returns',
  authMiddleware.verifyToken,
  checkRoles(['cajero']),
  salesController.processReturn
);

module.exports = router;