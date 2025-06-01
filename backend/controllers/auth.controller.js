const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'secreto123';

const authController = {
  login: async (req, res) => {
    const { nombre, contrasena } = req.body;

    if (!nombre || !contrasena) {
      return res.status(400).json({ error: 'Nombre de usuario y contraseña son requeridos' });
    }

    try {
      const user = await User.findByNombre(nombre);

      if (!user) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      const payload = {
        id: user.id_usuario,
        nombre: user.nombre,
        role: user.nombre_rol?.toLowerCase() || 'usuario'
      };

      const token = jwt.sign(payload, jwtSecret, { expiresIn: '8h' });

      return res.json({
        token,
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          role: user.nombre_rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ error: 'Error del servidor' });
    }
  },

  logout: (req, res) => {
    res.json({ message: 'Logout exitoso' });
  },

  getCurrentUser: (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    res.json({ user: req.user });
  }
};

module.exports = authController;
