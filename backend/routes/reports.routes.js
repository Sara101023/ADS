const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas protegidas (solo admin)
router.get('/sales', authMiddleware.verifyToken, authMiddleware.checkAdmin, reportsController.getSalesReport);
router.get('/products/most-sold', authMiddleware.verifyToken, authMiddleware.checkAdmin, reportsController.getMostSoldProducts);
router.get('/payment-methods', authMiddleware.verifyToken, authMiddleware.checkAdmin, reportsController.getPaymentMethodsReport);

module.exports = router;