const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const jwtSecret = process.env.JWT_SECRET || 'secret_key';

// Verifica que el token JWT sea válido
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1]; // Formato: Bearer <token>

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Error al verificar token:', err.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para permitir acceso opcionalmente autenticado
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id);
    req.user = user || null;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

// Middleware para verificar si el usuario es administrador
const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
  checkAdmin
};
