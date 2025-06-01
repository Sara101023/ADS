const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const jwtSecret = process.env.JWT_SECRET || 'secreto123';

const authMiddleware = {
  verifyToken: async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // El token debe venir como "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    try {
      // Verificar y decodificar token
      const decoded = jwt.verify(token, jwtSecret);

      // Opcional: cargar datos completos del usuario desde DB si quieres más info
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Adjuntar datos de usuario a req
      req.user = {
        id: user.id_usuario,
        nombre: user.nombre,
        role: user.nombre_rol.toLowerCase(),
      };

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Unauthorized' });
    }
  },

  // Middleware para checar si el usuario es admin
  checkAdmin: (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }

    next();
  },
};

module.exports = authMiddleware;
