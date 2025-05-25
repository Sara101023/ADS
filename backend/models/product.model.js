const pool = require('../config/db');

class Product {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM productos WHERE estado = "activo"');
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
        return rows[0];
    }

    static async getByBarcode(barcode) {
        const [rows] = await pool.query('SELECT * FROM productos WHERE codigo_barras = ?', [barcode]);
        return rows[0];
    }

    static async create({ nombre, categoria, precio, stock, codigo_barras, unidad_medida, stock_minimo, tiene_iva, proveedor_id }) {
        const [result] = await pool.query(
            'INSERT INTO productos (nombre, categoria, precio, stock, codigo_barras, unidad_medida, stock_minimo, tiene_iva, proveedor_id, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "activo")',
            [nombre, categoria, precio, stock, codigo_barras, unidad_medida, stock_minimo, tiene_iva, proveedor_id]
        );
        return result.insertId;
    }

    static async update(id, { nombre, categoria, precio, stock, codigo_barras, unidad_medida, stock_minimo, tiene_iva, proveedor_id }) {
        await pool.query(
            'UPDATE productos SET nombre = ?, categoria = ?, precio = ?, stock = ?, codigo_barras = ?, unidad_medida = ?, stock_minimo = ?, tiene_iva = ?, proveedor_id = ? WHERE id = ?',
            [nombre, categoria, precio, stock, codigo_barras, unidad_medida, stock_minimo, tiene_iva, proveedor_id, id]
        );
    }

    static async deactivate(id) {
        await pool.query('UPDATE productos SET estado = "inactivo" WHERE id = ?', [id]);
    }

    static async checkLowStock() {
        const [rows] = await pool.query('SELECT * FROM productos WHERE stock <= stock_minimo AND estado = "activo"');
        return rows;
    }

    static async updateStock(id, quantity) {
        await pool.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [quantity, id]);
    }
}

module.exports = Product;