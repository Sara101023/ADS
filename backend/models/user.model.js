const pool = require('../config/db');

class User {
    static async findByUsername(username) {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        return rows[0];
    }

    static async create({ username, password, role, employeeNumber = null }) {
        const [result] = await pool.query(
            'INSERT INTO usuarios (username, password, role, employee_number) VALUES (?, ?, ?, ?)',
            [username, password, role, employeeNumber]
        );
        return result.insertId;
    }

    static async update(id, { username, password, role, employeeNumber }) {
        await pool.query(
            'UPDATE usuarios SET username = ?, password = ?, role = ?, employee_number = ? WHERE id = ?',
            [username, password, role, employeeNumber, id]
        );
    }

    static async delete(id) {
        await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    }

    static async getAll() {
        const [rows] = await pool.query('SELECT id, username, role, employee_number FROM usuarios');
        return rows;
    }
}

module.exports = User;