const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'secreto123';

const authMiddleware = {
  // Verifica si el token JWT es válido
  verifyToken: (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded; // Guarda la info del usuario (incluye el rol) en la request
      next();
    } catch (error) {
      console.error('Error al verificar token:', error);
      return res.status(401).json({ error: 'Token inválido' });
    }
  },

  // Verifica si el usuario tiene un rol permitido (admin, cajero, etc.)
  checkRole: (roles) => {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'No autorizado' });
      }
      next();
    };
  },

  // Acceso exclusivo para administradores
  checkAdmin: (req, res, next) => {
    if (req.user?.role !== 'administrador') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  },

  // Acceso para cajeros y administradores
  checkCashier: (req, res, next) => {
    if (!['cajero', 'administrador'].includes(req.user?.role)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  }
};

module.exports = authMiddleware;
