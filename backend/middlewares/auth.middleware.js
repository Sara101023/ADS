const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Configuración y constantes
const JWT_CONFIG = {
    SECRET: process.env.JWT_SECRET || 'secreto123',
    ERROR_MESSAGES: {
        NO_TOKEN: 'No se proporcionó token de autenticación',
        INVALID_TOKEN: 'Formato de token inválido',
        USER_NOT_FOUND: 'Usuario no encontrado',
        UNAUTHORIZED: 'No autorizado',
        FORBIDDEN: 'No tienes permisos para esta acción'
    }
};

const authMiddleware = {
    /**
     * Verifica y valida el token JWT
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     * @param {Function} next - Función para continuar con el siguiente middleware
     */
    verifyToken: async (req, res, next) => {
        try {
            const authHeader = req.headers['authorization'] || req.headers['Authorization'];
            
            if (!authHeader) {
                return res.status(401).json({ 
                    success: false,
                    message: JWT_CONFIG.ERROR_MESSAGES.NO_TOKEN 
                });
            }

            // Extraer token del header "Bearer <token>"
            const tokenParts = authHeader.split(' ');
            if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
                return res.status(401).json({ 
                    success: false,
                    message: JWT_CONFIG.ERROR_MESSAGES.INVALID_TOKEN 
                });
            }

            const token = tokenParts[1];
            const decoded = jwt.verify(token, JWT_CONFIG.SECRET);

            // Verificar existencia del usuario en la base de datos
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ 
                    success: false,
                    message: JWT_CONFIG.ERROR_MESSAGES.USER_NOT_FOUND 
                });
            }

            // Adjuntar información del usuario a la solicitud
            req.user = {
                id: user.id_usuario,
                nombre: user.nombre,
                role: user.nombre_rol.toLowerCase(),
                // Agregar más campos si son necesarios
                numero_trabajador: user.numero_trabajador
            };

            next();
        } catch (error) {
            console.error('Error en verificación de token:', error);
            
            let message = JWT_CONFIG.ERROR_MESSAGES.UNAUTHORIZED;
            if (error.name === 'TokenExpiredError') {
                message = 'Token expirado';
            } else if (error.name === 'JsonWebTokenError') {
                message = 'Token inválido';
            }

            return res.status(401).json({ 
                success: false,
                message 
            });
        }
    },

    /**
     * Verifica si el usuario tiene rol de administrador
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     * @param {Function} next - Función para continuar con el siguiente middleware
     */
    checkAdmin: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: JWT_CONFIG.ERROR_MESSAGES.UNAUTHORIZED 
            });
        }

        if (req.user.role !== 'administrador') {
            return res.status(403).json({ 
                success: false,
                message: JWT_CONFIG.ERROR_MESSAGES.FORBIDDEN 
            });
        }

        next();
    },

    /**
     * Verifica si el usuario tiene rol de cajero o administrador
     */
    checkCashierOrAdmin: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: JWT_CONFIG.ERROR_MESSAGES.UNAUTHORIZED 
            });
        }

        if (!['administrador', 'cajero'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: JWT_CONFIG.ERROR_MESSAGES.FORBIDDEN 
            });
        }

        next();
    }
};

module.exports = authMiddleware;