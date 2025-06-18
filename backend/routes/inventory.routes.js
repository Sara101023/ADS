const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: Gestión de productos del inventario
 */

// Rutas públicas
/**
 * @swagger
 * /api/inventory/products:
 *   get:
 *     summary: Obtiene todos los productos activos
 *     tags: [Inventario]
 *     responses:
 *       200:
 *         description: Lista de productos
 */
//router.get('/products', inventoryController.getAllProducts);
const auth = require('../middlewares/auth.middleware');

router.get('/products', auth.optionalAuth, inventoryController.getAllProducts);



/**
 * @swagger
 * /api/inventory/products/{id}:
 *   get:
 *     summary: Obtiene un producto por ID
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/products/:id', inventoryController.getProductById);

/**
 * @swagger
 * /api/inventory/products/barcode/{barcode}:
 *   get:
 *     summary: Obtiene un producto por código de barras
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/products/barcode/:barcode', inventoryController.getProductByBarcode);

// Rutas protegidas (requieren autenticación y rol de administrador)
/**
 * @swagger
 * /api/inventory/products:
 *   post:
 *     summary: Crea un nuevo producto (Admin)
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos
 */
router.post(
    '/products',
    authMiddleware.verifyToken,
    authMiddleware.checkAdmin,
    inventoryController.createProduct
);

/**
 * @swagger
 * /api/inventory/products/{id}:
 *   put:
 *     summary: Actualiza un producto existente (Admin)
 *     tags: [Inventario]
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Producto no encontrado
 */
router.put(
    '/products/:id',
    authMiddleware.verifyToken,
    authMiddleware.checkAdmin,
    inventoryController.updateProduct
);

/**
 * @swagger
 * /api/inventory/products/{id}:
 *   delete:
 *     summary: Desactiva un producto (Admin)
 *     tags: [Inventario]
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
 *         description: Producto desactivado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Producto no encontrado
 */
router.delete(
    '/products/:id',
    authMiddleware.verifyToken,
    authMiddleware.checkAdmin,
    inventoryController.deactivateProduct
);

/**
 * @swagger
 * /api/inventory/low-stock:
 *   get:
 *     summary: Obtiene productos con stock bajo (Admin)
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos con stock bajo
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos
 */
router.get(
    '/low-stock',
    authMiddleware.verifyToken,
    authMiddleware.checkAdmin,
    inventoryController.checkLowStock
);

// Eliminé las rutas duplicadas y el código de servidor que no pertenecía aquí

module.exports = router;