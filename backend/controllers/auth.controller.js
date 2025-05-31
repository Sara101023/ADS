const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const jwtSecret = process.env.JWT_SECRET || 'secret_key';

const authController = {
    login: async (req, res) => {
        try {
            const { numero_trabajador, contrasena } = req.body;
            
            if (!numero_trabajador || !contrasena) {
                return res.status(400).json({ error: 'Número de trabajador y contraseña son requeridos' });
            }
            
            // Buscar usuario
            const user = await User.findByNumeroTrabajador(numero_trabajador);
            if (!user) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Verificar contraseña
            const isMatch = await bcrypt.compare(contrasena, user.contrasena);
            if (!isMatch) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Generar token
            const token = jwt.sign(
                {
                    id: user.id_usuario,
                    role: user.nombre_rol,
                    nombre: user.nombre,
                    id_rol: user.id_rol
                },
                jwtSecret,
                { expiresIn: '8h' }
            );

            res.json({
                token,
                user: {
                    id: user.id_usuario,
                    nombre: user.nombre,
                    numero_trabajador: user.numero_trabajador,
                    rol: user.nombre_rol
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    logout: (req, res) => {
        res.json({ message: 'Sesión cerrada correctamente' });
    },

    getCurrentUser: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({
                id: user.id_usuario,
                nombre: user.nombre,
                numero_trabajador: user.numero_trabajador,
                rol: user.nombre_rol
            });
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
};

module.exports = authController;
