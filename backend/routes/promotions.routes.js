const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // Asegúrate de que esta sea tu conexión a MySQL

// Obtener todas las promociones
router.get('/api/promociones', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM promocion ORDER BY fecha_inicio DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener promociones:', error.message);
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

// Guardar una nueva promoción
router.post('/api/promociones', async (req, res) => {
  try {
    const {
      nombre, tipo, descuento, buyX, getY,
      aplicacion, categoria, fecha_inicio, fecha_fin, descripcion
    } = req.body;

    await pool.query(
      `INSERT INTO promocion 
       (nombre, tipo, descuento, buy_x, get_y, aplicacion, categoria, fecha_inicio, fecha_fin, descripcion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, tipo, descuento, buyX, getY, aplicacion, categoria, fecha_inicio, fecha_fin, descripcion]
    );

    res.status(201).json({ message: 'Promoción guardada correctamente' });
  } catch (error) {
    console.error('Error al guardar promoción:', error.message);
    res.status(500).json({ error: 'Error al guardar promoción' });
  }
});

module.exports = router;
