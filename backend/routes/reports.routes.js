const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas protegidas (solo admin)
router.get('/sales', authMiddleware.verifyToken, authMiddleware.checkAdmin, reportsController.getSalesReport);
router.get('/products/most-sold', authMiddleware.verifyToken, authMiddleware.checkAdmin, reportsController.getMostSoldProducts);
router.get('/payment-methods', authMiddleware.verifyToken, authMiddleware.checkAdmin, reportsController.getPaymentMethodsReport);

module.exports = router;