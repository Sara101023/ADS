const pool = require('../config/database');

const User = {
  // Buscar por número de trabajador (opcional, aún disponible si lo necesitas)
  findByNumeroTrabajador: async (numero_trabajador) => {
    try {
      const [rows] = await pool.query(`
        SELECT u.id_usuario, u.nombre, u.contrasena, u.numero_trabajador, r.nombre_rol
        FROM usuario u
        LEFT JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.numero_trabajador = ?
      `, [numero_trabajador]);

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error en findByNumeroTrabajador:', error);
      throw error;
    }
  },

  // Buscar por nombre de usuario (para login)
  findByNombre: async (nombre) => {
    try {
      const [rows] = await pool.query(`
        SELECT u.id_usuario, u.nombre, u.contrasena, u.numero_trabajador, r.nombre_rol
        FROM usuario u
        LEFT JOIN rol r ON u.id_rol = r.id_rol
        WHERE u.nombre = ?
      `, [nombre]);

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error en findByNombre:', error);
      throw error;
    }
  }
};

module.exports = User;
