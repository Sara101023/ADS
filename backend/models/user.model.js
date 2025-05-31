
const pool = require('../config/database');

class User {
    static async findByNumeroTrabajador(numero_trabajador) {
        const [rows] = await pool.query(`
            SELECT u.id_usuario, u.nombre, u.numero_trabajador, u.contrasena, u.id_rol, r.nombre_rol
            FROM usuario u
            JOIN rol r ON u.id_rol = r.id_rol
            WHERE u.numero_trabajador = ?
        `, [numero_trabajador]);

        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.query(`
            SELECT u.id_usuario, u.nombre, u.numero_trabajador, u.id_rol, r.nombre_rol
            FROM usuario u
            JOIN rol r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = ?
        `, [id]);

        return rows[0];
    }

    static async create({ nombre, contrasena, id_rol, numero_trabajador }) {
        const [result] = await pool.query(`
            INSERT INTO usuario (nombre, contrasena, id_rol, numero_trabajador)
            VALUES (?, ?, ?, ?)
        `, [nombre, contrasena, id_rol, numero_trabajador]);

        return result.insertId;
    }

    static async update(id_usuario, { nombre, contrasena, id_rol, numero_trabajador }) {
        await pool.query(`
            UPDATE usuario
            SET nombre = ?, contrasena = ?, id_rol = ?, numero_trabajador = ?
            WHERE id_usuario = ?
        `, [nombre, contrasena, id_rol, numero_trabajador, id_usuario]);
    }

    static async delete(id_usuario) {
        await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario]);
    }

    static async getAll() {
        const [rows] = await pool.query(`
            SELECT u.id_usuario, u.nombre, u.numero_trabajador, u.id_rol, r.nombre_rol
            FROM usuario u
            JOIN rol r ON u.id_rol = r.id_rol
        `);
        return rows;
    }
}

module.exports = User;
