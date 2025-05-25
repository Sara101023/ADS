const Product = require('../models/Product');

const inventoryController = {
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.getAll();
            res.json(products);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    getProductById: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.getById(id);
            
            if (!product) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            
            res.json(product);
        } catch (error) {
            console.error('Error al obtener producto:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    getProductByBarcode: async (req, res) => {
        try {
            const { barcode } = req.params;
            const product = await Product.getByBarcode(barcode);
            
            if (!product) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            
            res.json(product);
        } catch (error) {
            console.error('Error al obtener producto por código de barras:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    createProduct: async (req, res) => {
        if (req.user.role !== 'administrador') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        
        try {
            const {
                nombre,
                categoria = null,
                precio,
                stock,
                codigo_barras,
                unidad_medida = 'pieza',
                stock_minimo = 5,
                tiene_iva = true,
                proveedor_id = null
            } = req.body;
            
            // Validar campos obligatorios
            if (!nombre || !precio || !stock || !codigo_barras) {
                return res.status(400).json({ error: 'Nombre, precio, stock y código de barras son requeridos' });
            }
            
            // Validar que el precio y stock sean números positivos
            if (isNaN(precio) || precio <= 0 || isNaN(stock) || stock < 0) {
                return res.status(400).json({ error: 'Precio y stock deben ser números válidos' });
            }
            
            // Verificar si el código de barras ya existe
            const existingProduct = await Product.getByBarcode(codigo_barras);
            if (existingProduct) {
                return res.status(400).json({ error: 'El código de barras ya está en uso' });
            }
            
            // Crear producto
            const productId = await Product.create({
                nombre,
                categoria,
                precio,
                stock,
                codigo_barras,
                unidad_medida,
                stock_minimo,
                tiene_iva,
                proveedor_id
            });
            
            res.status(201).json({ id: productId, message: 'Producto creado exitosamente' });
        } catch (error) {
            console.error('Error al crear producto:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    updateProduct: async (req, res) => {
        if (req.user.role !== 'administrador') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        
        try {
            const { id } = req.params;
            const {
                nombre,
                categoria,
                precio,
                stock,
                codigo_barras,
                unidad_medida,
                stock_minimo,
                tiene_iva,
                proveedor_id
            } = req.body;
            
            // Validar que el producto existe
            const existingProduct = await Product.getById(id);
            if (!existingProduct) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            
            // Validar que el precio y stock sean números positivos si se proporcionan
            if (precio && (isNaN(precio) || precio <= 0)) {
                return res.status(400).json({ error: 'Precio debe ser un número válido' });
            }
            
            if (stock && (isNaN(stock) || stock < 0)) {
                return res.status(400).json({ error: 'Stock debe ser un número válido' });
            }
            
            // Verificar si el nuevo código de barras ya existe (si se está cambiando)
            if (codigo_barras && codigo_barras !== existingProduct.codigo_barras) {
                const productWithBarcode = await Product.getByBarcode(codigo_barras);
                if (productWithBarcode) {
                    return res.status(400).json({ error: 'El código de barras ya está en uso' });
                }
            }
            
            // Actualizar producto
            await Product.update(id, {
                nombre: nombre || existingProduct.nombre,
                categoria: categoria || existingProduct.categoria,
                precio: precio || existingProduct.precio,
                stock: stock || existingProduct.stock,
                codigo_barras: codigo_barras || existingProduct.codigo_barras,
                unidad_medida: unidad_medida || existingProduct.unidad_medida,
                stock_minimo: stock_minimo || existingProduct.stock_minimo,
                tiene_iva: tiene_iva !== undefined ? tiene_iva : existingProduct.tiene_iva,
                proveedor_id: proveedor_id || existingProduct.proveedor_id
            });
            
            res.json({ message: 'Producto actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    deactivateProduct: async (req, res) => {
        if (req.user.role !== 'administrador') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        
        try {
            const { id } = req.params;
            
            // Verificar que el producto existe
            const product = await Product.getById(id);
            if (!product) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            
            // Desactivar producto
            await Product.deactivate(id);
            
            res.json({ message: 'Producto desactivado exitosamente' });
        } catch (error) {
            console.error('Error al desactivar producto:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    checkLowStock: async (req, res) => {
        try {
            const lowStockProducts = await Product.checkLowStock();
            res.json(lowStockProducts);
        } catch (error) {
            console.error('Error al verificar stock bajo:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
};

module.exports = inventoryController;