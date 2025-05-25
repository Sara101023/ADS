const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas públicas (solo para productos)
router.get('/products', inventoryController.getAllProducts);
router.get('/products/:id', inventoryController.getProductById);
router.get('/products/barcode/:barcode', inventoryController.getProductByBarcode);

// Rutas protegidas (administrador)
router.post('/products', authMiddleware.verifyToken, authMiddleware.checkAdmin, inventoryController.createProduct);
router.put('/products/:id', authMiddleware.verifyToken, authMiddleware.checkAdmin, inventoryController.updateProduct);
router.delete('/products/:id', authMiddleware.verifyToken, authMiddleware.checkAdmin, inventoryController.deactivateProduct);

// Ruta para verificar stock bajo
router.get('/low-stock', authMiddleware.verifyToken, authMiddleware.checkAdmin, inventoryController.checkLowStock);

module.exports = router;