const pool = require('../config/db');

class Promotion {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM promociones WHERE fecha_fin >= CURDATE()');
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM promociones WHERE id = ?', [id]);
        return rows[0];
    }

    static async create({ nombre, tipo, descripcion, fecha_inicio, fecha_fin, parametros }) {
        const [result] = await pool.query(
            'INSERT INTO promociones (nombre, tipo, descripcion, fecha_inicio, fecha_fin, parametros) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, tipo, descripcion, fecha_inicio, fecha_fin, JSON.stringify(parametros)]
        );
        return result.insertId;
    }

    static async update(id, { nombre, tipo, descripcion, fecha_inicio, fecha_fin, parametros }) {
        await pool.query(
            'UPDATE promociones SET nombre = ?, tipo = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, parametros = ? WHERE id = ?',
            [nombre, tipo, descripcion, fecha_inicio, fecha_fin, JSON.stringify(parametros), id]
        );
    }

    static async delete(id) {
        await pool.query('DELETE FROM promociones WHERE id = ?', [id]);
    }

    static async getActivePromotionsForProduct(productId) {
        const [rows] = await pool.query(
            `SELECT p.* FROM promociones p 
             JOIN promocion_producto pp ON p.id = pp.promocion_id 
             WHERE pp.producto_id = ? AND p.fecha_inicio <= CURDATE() AND p.fecha_fin >= CURDATE()`,
            [productId]
        );
        return rows;
    }

    static async addProductToPromotion(promotionId, productId) {
        await pool.query(
            'INSERT INTO promocion_producto (promocion_id, producto_id) VALUES (?, ?)',
            [promotionId, productId]
        );
    }

    static async removeProductFromPromotion(promotionId, productId) {
        await pool.query(
            'DELETE FROM promocion_producto WHERE promocion_id = ? AND producto_id = ?',
            [promotionId, productId]
        );
    }
}

module.exports = Promotion;