const Sale = require('../models/sale.model');
const Product = require('../models/product.model');
const Promotion = require('../models/promotion.model');
const { generarTicketPDF } = require('../utils/ticketPDF');
const nodemailer = require('nodemailer');
const fs = require('fs');

const salesController = {
    processSale: async (req, res) => {
        try {
            const { productos: items, metodo_pago, cliente } = req.body;
            const nombreCliente = cliente?.nombre || 'Invitado';
            const correoCliente = cliente?.correo || 'noreply@ventas.com';

            // Validación inicial
            if (!items || !Array.isArray(items) || items.length === 0 || !metodo_pago) {
                return res.status(400).json({ error: 'Items y método de pago son requeridos' });
            }

            const metodoPagoId = parseInt(metodo_pago);
if (![1, 2].includes(metodoPagoId)) {
    return res.status(400).json({ error: 'Método de pago inválido' });
}

          

            let subtotal = 0;
            let iva = 0;
            const processedItems = [];

            for (const item of items) {
                const product = await Product.getById(item.id_producto);
                if (!product) {
                    return res.status(400).json({ error: `Producto con ID ${item.id_producto} no encontrado` });
                }

                if (product.stock < item.cantidad) {
                    return res.status(400).json({
                        error: `Stock insuficiente para ${product.nombre} (disponible: ${product.stock}, solicitado: ${item.cantidad})`
                    });
                }

                const promotions = await Promotion.getActivePromotionsForProduct(item.id_producto);
                let discount = 0;
                let finalPrice = product.precio;
                let finalQuantity = item.cantidad;

                if (promotions.length > 0) {
                    for (const promo of promotions) {
                        if (promo.tipo_promocion === '3x1' && item.cantidad >= 3) {
                            const groups = Math.floor(item.cantidad / 3);
                            discount += (product.precio * 2) * groups;
                            finalQuantity = item.cantidad - groups;
                        } else if (promo.tipo_promocion === '3x2' && item.cantidad >= 3) {
                            const groups = Math.floor(item.cantidad / 3);
                            discount += product.precio * groups;
                        } else if (promo.tipo_promocion === 'Nx$' && item.cantidad >= promo.cantidad_minima) {
                            const groups = Math.floor(item.cantidad / promo.cantidad_minima);
                            discount += (product.precio * promo.cantidad_minima - promo.precio_promocional) * groups;
                        }
                    }
                }

                const itemSubtotal = finalPrice * finalQuantity;
const itemIva = product.tiene_iva ? product.precio * item.cantidad * 0.16 : 0;

                subtotal += itemSubtotal;
                iva += itemIva;

                processedItems.push({
                    producto_id: item.id_producto,
                    cantidad: item.cantidad,
                    precio_unitario: product.precio,
                    descuento: discount,
                    nombre: product.nombre
                });
            }

            const total = subtotal + iva;

            const saleData = {
                fecha: new Date(),
                total,
                subtotal,
                iva,
                id_metodo_pago: metodoPagoId, // ✅ CORREGIDO
                usuario_id: req.user?.id || null,
                items: processedItems
            };

            console.log('🧾 Venta lista para insertar:', saleData);

            const saleId = await Sale.create(saleData);
            const completeSale = await Sale.getById(saleId);

            generarTicketPDF({
                id: saleId,
                fecha: saleData.fecha,
                subtotal,
                iva,
                total,
                metodo_pago, // aquí puede mantenerse como texto para mostrar en el ticket
                items: processedItems
            }, nombreCliente, (pdfPath) => {
                if (!pdfPath || !fs.existsSync(pdfPath)) {
                    console.error('❌ No se generó el PDF correctamente');
                    return;
                }

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'ercioescom@gmail.com',
                        pass: 'fuqiyuriauaimhzw'
                    }
                });

                const mailOptions = {
                    from: 'ercioescom@gmail.com',
                    to: correoCliente,
                    subject: 'Tu ticket de compra',
                    text: `Hola ${nombreCliente}, gracias por tu compra. Adjuntamos tu ticket en formato PDF.`,
                    attachments: [{
                        filename: 'ticket.pdf',
                        path: pdfPath
                    }]
                };

                transporter.sendMail(mailOptions, (err, info) => {
                    try { fs.unlinkSync(pdfPath); } catch (e) {}
                    if (err) console.error('❌ Error al enviar ticket PDF:', err);
                    else console.log('✅ Ticket PDF enviado a:', correoCliente);
                });
            });

            res.status(201).json({
                message: 'Venta registrada exitosamente',
                sale: completeSale
            });
        } catch (error) {
            console.error('❌ Error al procesar venta:', error);
            res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
        }
    },

    getAllSales: async (req, res) => {
        try {
            const sales = await Sale.getAll();
            res.json(sales);
        } catch (error) {
            console.error('❌ Error al obtener ventas:', error);
            res.status(500).json({ error: 'Error al obtener ventas' });
        }
    },

    getSaleById: async (req, res) => {
        try {
            const { id } = req.params;
            const sale = await Sale.getById(id);
            if (!sale) {
                return res.status(404).json({ error: 'Venta no encontrada' });
            }
            res.json(sale);
        } catch (error) {
            console.error('❌ Error al obtener venta:', error);
            res.status(500).json({ error: 'Error al obtener venta' });
        }
    }
};

module.exports = salesController;
