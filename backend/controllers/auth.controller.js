const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = process.env;

const authController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            
            // Validar campos
            if (!username || !password) {
                return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
            }
            
            // Buscar usuario
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            // Verificar contraseña
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            // Generar token JWT
            const token = jwt.sign(
                { id: user.id, role: user.role },
                JWT_SECRET || 'secret_key',
                { expiresIn: '8h' }
            );
            
            // Responder con token y datos básicos del usuario
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    employeeNumber: user.employee_number
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    logout: (req, res) => {
        // En un sistema JWT stateless, el logout se maneja en el cliente eliminando el token
        res.json({ message: 'Sesión cerrada correctamente' });
    },

    getCurrentUser: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            res.json({
                id: user.id,
                username: user.username,
                role: user.role,
                employeeNumber: user.employee_number
            });
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    // Funciones de administrador para gestión de usuarios
    createUser: async (req, res) => {
        if (req.user.role !== 'administrador') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        
        try {
            const { username, password, role, employeeNumber } = req.body;
            
            // Validar campos
            if (!username || !password || !role) {
                return res.status(400).json({ error: 'Usuario, contraseña y rol son requeridos' });
            }
            
            // Verificar si el usuario ya existe
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }
            
            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Crear usuario
            const userId = await User.create({
                username,
                password: hashedPassword,
                role,
                employeeNumber: role === 'cajero' ? employeeNumber : null
            });
            
            res.status(201).json({ id: userId, message: 'Usuario creado exitosamente' });
        } catch (error) {
            console.error('Error al crear usuario:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    getAllUsers: async (req, res) => {
        if (req.user.role !== 'administrador') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        
        try {
            const users = await User.getAll();
            res.json(users);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    updateUser: async (req, res) => {
        if (req.user.role !== 'administrador') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        
        try {
            const { id } = req.params;
            const { username, password, role, employeeNumber } = req.body;
            
            // Obtener usuario actual
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            // Preparar datos para actualización
            const updateData = {
                username: username || user.username,
                password: user.password,
                role: role || user.role,
                employeeNumber: role === 'cajero' ? (employeeNumber || user.employee_number) : null
            };
            
            // Si se proporciona una nueva contraseña, encriptarla
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }
            
            // Actualizar usuario
            await User.update(id, updateData);
            
            res.json({ message: 'Usuario actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    },

    deleteUser: async (req, res) => {
        if (req.user.role !== 'administrador') {
            return res.status(403).json({ error: 'No autorizado' });
        }
        
        try {
            const { id } = req.params;
            
            // Verificar que el usuario existe
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            // No permitir eliminar el propio usuario administrador
            if (req.user.id === parseInt(id)) {
                return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
            }
            
            // Eliminar usuario
            await User.delete(id);
            
            res.json({ message: 'Usuario eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
};

module.exports = authController;