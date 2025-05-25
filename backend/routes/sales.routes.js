const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas protegidas (cajero y admin)
router.post('/', authMiddleware.verifyToken, authMiddleware.checkCashier, salesController.processSale);
router.get('/', authMiddleware.verifyToken, authMiddleware.checkCashier, salesController.getAllSales);
router.get('/:id', authMiddleware.verifyToken, authMiddleware.checkCashier, salesController.getSaleById);
router.post('/:saleId/returns', authMiddleware.verifyToken, authMiddleware.checkCashier, salesController.processReturn);

module.exports = router;