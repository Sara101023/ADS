const pool = require('../config/db');

class Return {
    static async getById(id) {
        const [rows] = await pool.query(
            `SELECT d.*, dv.producto_id, dv.cantidad, p.nombre as producto_nombre 
             FROM devoluciones d
             JOIN detalle_devolucion dv ON d.id = dv.devolucion_id
             JOIN productos p ON dv.producto_id = p.id
             WHERE d.id = ?`,
            [id]
        );
        
        if (rows.length === 0) return null;
        
        const returnData = {
            id: rows[0].id,
            venta_id: rows[0].venta_id,
            fecha: rows[0].fecha,
            motivo: rows[0].motivo,
            items: rows.map(row => ({
                producto_id: row.producto_id,
                producto_nombre: row.producto_nombre,
                cantidad: row.cantidad
            }))
        };
        
        return returnData;
    }

    static async getAll() {
        const [rows] = await pool.query(
            `SELECT d.*, COUNT(dv.id) as items_count 
             FROM devoluciones d
             LEFT JOIN detalle_devolucion dv ON d.id = dv.devolucion_id
             GROUP BY d.id
             ORDER BY d.fecha DESC`
        );
        return rows;
    }

    static async getByDateRange(startDate, endDate) {
        const [rows] = await pool.query(
            `SELECT d.*, COUNT(dv.id) as items_count 
             FROM devoluciones d
             LEFT JOIN detalle_devolucion dv ON d.id = dv.devolucion_id
             WHERE d.fecha BETWEEN ? AND ?
             GROUP BY d.id
             ORDER BY d.fecha DESC`,
            [startDate, endDate]
        );
        return rows;
    }
}

module.exports = Return;