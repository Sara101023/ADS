const Sale = require('../models/sale.model');
const Product = require('../models/product.model');
const Promotion = require('../models/promotion.model');

const salesController = {
    processSale: async (req, res) => {
        if (req.user.role !== 'cajero' && req.user.role !== 'administrador') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        
        try {
            const { items, metodo_pago } = req.body;
            
            // Validar campos obligatorios
            if (!items || !Array.isArray(items) || items.length === 0 || !metodo_pago) {
                return res.status(400).json({ error: 'Items y método de pago son requeridos' });
            }
            
            // Verificar stock y aplicar promociones
            let subtotal = 0;
            let iva = 0;
            const processedItems = [];
            
            for (const item of items) {
                // Obtener producto
                const product = await Product.getById(item.producto_id);
                if (!product) {
                    return res.status(400).json({ error: `Producto con ID ${item.producto_id} no encontrado` });
                }
                
                // Verificar stock
                if (product.stock < item.cantidad) {
                    return res.status(400).json({ 
                        error: `Stock insuficiente para ${product.nombre} (disponible: ${product.stock}, solicitado: ${item.cantidad})`
                    });
                }
                
                // Obtener promociones activas para este producto
                const promotions = await Promotion.getActivePromotionsForProduct(item.producto_id);
                let discount = 0;
                let finalPrice = product.precio;
                let finalQuantity = item.cantidad;
                
                // Aplicar promociones si existen
                if (promotions.length > 0) {
                    for (const promo of promotions) {
                        if (promo.tipo === '3x1' && item.cantidad >= 3) {
                            const groups = Math.floor(item.cantidad / 3);
                            discount += (product.precio * 2) * groups;
                            finalQuantity = item.cantidad - groups;
                        } else if (promo.tipo === '3x2' && item.cantidad >= 3) {
                            const groups = Math.floor(item.cantidad / 3);
                            discount += product.precio * groups;
                            finalQuantity = item.cantidad;
                        } else if (promo.tipo === 'Nx$' && item.cantidad >= promo.parametros.N) {
                            const groups = Math.floor(item.cantidad / promo.parametros.N);
                            discount += (product.precio * promo.parametros.N - promo.parametros.precio) * groups;
                            finalQuantity = item.cantidad;
                        }
                    }
                }
                
                // Calcular precio final del item
                const itemSubtotal = finalPrice * finalQuantity;
                const itemIva = product.tiene_iva ? itemSubtotal * 0.16 : 0;
                
                subtotal += itemSubtotal;
                iva += itemIva;
                
                processedItems.push({
                    producto_id: item.producto_id,
                    cantidad: item.cantidad,
                    precio_unitario: product.precio,
                    descuento: discount
                });
            }
            
            // Calcular total
            const total = subtotal + iva;
            
            // Crear objeto de venta
            const saleData = {
                fecha: new Date(),
                total,
                subtotal,
                iva,
                metodo_pago,
                usuario_id: req.user.id,
                items: processedItems
            };
            
            // Registrar la venta en la base de datos
            const saleId = await Sale.create(saleData);
            
            // Obtener la venta completa para respuesta
            const completeSale = await Sale.getById(saleId);
            
            res.status(201).json({
                message: 'Venta registrada exitosamente',
                sale: completeSale
            });
        } catch (error) {
            console.error('Error al procesar venta:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    getSaleById: async (req, res) => {
        try {
            const { id } = req.params;
            const sale = await Sale.getById(id);
            
            if (!sale) {
                return res.status(404).json({ error: 'Venta no encontrada' });
            }
            
            // Solo administradores pueden ver ventas de otros usuarios
            if (req.user.role !== 'administrador' && sale.usuario_id !== req.user.id) {
                return res.status(403).json({ error: 'No autorizado' });
            }
            
            res.json(sale);
        } catch (error) {
            console.error('Error al obtener venta:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    getAllSales: async (req, res) => {
        try {
            let sales;
            
            // Administradores ven todas las ventas, cajeros solo las suyas
            if (req.user.role === 'administrador') {
                sales = await Sale.getAll();
            } else {
                const [rows] = await pool.query('SELECT * FROM ventas WHERE usuario_id = ? ORDER BY fecha DESC', [req.user.id]);
                sales = rows;
            }
            
            res.json(sales);
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    processReturn: async (req, res) => {
        if (req.user.role !== 'cajero' && req.user.role !== 'administrador') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        
        try {
            const { saleId } = req.params;
            const { items } = req.body;
            
            // Validar campos obligatorios
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Items son requeridos' });
            }
            
            // Verificar que la venta existe y obtener sus detalles
            const sale = await Sale.getById(saleId);
            if (!sale) {
                return res.status(404).json({ error: 'Venta no encontrada' });
            }
            
            // Verificar que los items a devolver pertenecen a la venta
            const saleItems = sale.items.map(item => item.producto_id);
            
            for (const item of items) {
                if (!saleItems.includes(item.producto_id)) {
                    return res.status(400).json({ error: `El producto con ID ${item.producto_id} no pertenece a esta venta` });
                }
                
                // Verificar que no se devuelva más de lo comprado
                const saleItem = sale.items.find(i => i.producto_id === item.producto_id);
                if (item.cantidad > saleItem.cantidad) {
                    return res.status(400).json({ 
                        error: `Cantidad a devolver (${item.cantidad}) excede la cantidad comprada (${saleItem.cantidad})`
                    });
                }
            }
            
            // Procesar la devolución
            const returnId = await Sale.processReturn(saleId, items);
            
            res.status(201).json({
                message: 'Devolución procesada exitosamente',
                returnId
            });
        } catch (error) {
            console.error('Error al procesar devolución:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
};

module.exports = salesController;