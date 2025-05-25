const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = {
    verifyToken: (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
            req.user = decoded;
            next();
        } catch (error) {
            console.error('Error al verificar token:', error);
            return res.status(401).json({ error: 'Token inválido' });
        }
    },

    checkRole: (roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ error: 'No autorizado' });
            }
            next();
        };
    },

    checkAdmin: (req, res, next) => {
        if (req.user.role !== 'administrador') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        next();
    },

    checkCashier: (req, res, next) => {
        if (req.user.role !== 'cajero' && req.user.role !== 'administrador') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        next();
    }
};

module.exports = authMiddleware;