
const bcrypt = require('bcryptjs');

const pool = require('../config/database');

exports.getAllUsers = async (req, res) => {
  const [users] = await pool.query(`
    SELECT u.id_usuario, u.nombre, u.numero_trabajador, r.nombre AS rol
    FROM usuario u
    LEFT JOIN rol r ON u.id_rol = r.id_rol
  `);
  res.json(users);
};

exports.getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT id_rol, nombre_rol FROM rol');
    res.json(roles);
  } catch (err) {
    console.error('Error al obtener roles:', err);
    res.status(500).json({ mensaje: 'Error al obtener los roles' });
  }
};


exports.createUser = async (req, res) => {
  const { nombre, contrasena, numero_trabajador, id_rol } = req.body;
  const hash = await bcrypt.hash(contrasena, 10);
  await pool.query(`
    INSERT INTO usuario (nombre, contrasena, numero_trabajador, id_rol)
    VALUES (?, ?, ?, ?)`,
    [nombre, hash, numero_trabajador, id_rol]);
  res.json({ mensaje: 'Usuario creado exitosamente' });
};

exports.updateUser = async (req, res) => {
  const { nombre, numero_trabajador, id_rol } = req.body;
  await pool.query(`
    UPDATE usuario SET nombre = ?, numero_trabajador = ?, id_rol = ?
    WHERE id_usuario = ?`,
    [nombre, numero_trabajador, id_rol, req.params.id]);
  res.json({ mensaje: 'Usuario actualizado' });
};

exports.deleteUser = async (req, res) => {
  await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [req.params.id]);
  res.json({ mensaje: 'Usuario eliminado' });
};

exports.resetPassword = async (req, res) => {
  const { nuevaPassword } = req.body;
  const hash = await bcrypt.hash(nuevaPassword, 10);
  await pool.query('UPDATE usuario SET contrasena = ? WHERE id_usuario = ?', [hash, req.params.id]);
  res.json({ mensaje: 'Contraseña restablecida' });
};
