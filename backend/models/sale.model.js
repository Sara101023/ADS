const pool = require('../config/db');

class Sale {
    static async create(saleData) {
        const { fecha, total, subtotal, iva, metodo_pago, usuario_id } = saleData;
        const conn = await pool.getConnection();
        
        try {
            await conn.beginTransaction();
            
            // Insertar la venta
            const [saleResult] = await conn.query(
                'INSERT INTO ventas (fecha, total, subtotal, iva, metodo_pago, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
                [fecha, total, subtotal, iva, metodo_pago, usuario_id]
            );
            const saleId = saleResult.insertId;
            
            // Insertar detalles de la venta y actualizar stock
            for (const item of saleData.items) {
                await conn.query(
                    'INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, descuento) VALUES (?, ?, ?, ?, ?)',
                    [saleId, item.producto_id, item.cantidad, item.precio_unitario, item.descuento || 0]
                );
                
                await conn.query(
                    'UPDATE productos SET stock = stock - ? WHERE id = ?',
                    [item.cantidad, item.producto_id]
                );
            }
            
            await conn.commit();
            return saleId;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    static async getById(id) {
        const [saleRows] = await pool.query('SELECT * FROM ventas WHERE id = ?', [id]);
        if (saleRows.length === 0) return null;
        
        const [detailRows] = await pool.query(
            'SELECT dv.*, p.nombre as producto_nombre FROM detalle_venta dv JOIN productos p ON dv.producto_id = p.id WHERE dv.venta_id = ?',
            [id]
        );
        
        return {
            ...saleRows[0],
            items: detailRows
        };
    }

    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM ventas ORDER BY fecha DESC');
        return rows;
    }

    static async getByDateRange(startDate, endDate) {
        const [rows] = await pool.query(
            'SELECT * FROM ventas WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC',
            [startDate, endDate]
        );
        return rows;
    }

    static async processReturn(saleId, items) {
        const conn = await pool.getConnection();
        
        try {
            await conn.beginTransaction();
            
            // Verificar que la venta existe
            const [sale] = await conn.query('SELECT * FROM ventas WHERE id = ?', [saleId]);
            if (sale.length === 0) throw new Error('Venta no encontrada');
            
            // Registrar la devolución
            const [returnResult] = await conn.query(
                'INSERT INTO devoluciones (venta_id, fecha, motivo) VALUES (?, NOW(), "Devolución de cliente")',
                [saleId]
            );
            const returnId = returnResult.insertId;
            
            // Registrar items devueltos y actualizar stock
            for (const item of items) {
                await conn.query(
                    'INSERT INTO detalle_devolucion (devolucion_id, producto_id, cantidad) VALUES (?, ?, ?)',
                    [returnId, item.producto_id, item.cantidad]
                );
                
                await conn.query(
                    'UPDATE productos SET stock = stock + ? WHERE id = ?',
                    [item.cantidad, item.producto_id]
                );
            }
            
            await conn.commit();
            return returnId;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
}

module.exports = Sale;