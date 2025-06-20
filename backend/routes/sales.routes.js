const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 🛒 Venta accesible como invitado o usuario autenticado
router.post(
  '/',
  authMiddleware.optionalToken, // Permite token o modo invitado
  salesController.processSale
);

// 📄 Cajeros pueden ver todas sus ventas
router.get(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.checkCajero,
  salesController.getAllSales
);

// 🔍 Cajero puede consultar una venta específica
router.get(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.checkCajero,
  salesController.getSaleById
);

/*
// 🔁 Procesar devolución solo por cajero
router.post(
  '/:saleId/returns',
  authMiddleware.verifyToken,
  authMiddleware.checkCajero,
  salesController.processReturn
);
*/

module.exports = router;
