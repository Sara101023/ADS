const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Middleware para logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Archivos estáticos (aquí es donde debe encontrar ventas.html)
app.use(express.static(path.join(__dirname, '../front')));

// Rutas de API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/usuarios', require('./routes/user.routes'));

// Middleware de errores
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).send('Algo salió mal!');
});

// ⚠️ Esta debe ir al final y solo para SPA routing (como React)
// Si no usas React/Vue, puedes incluso eliminarla:
app.get('*', (req, res) => {
  res.status(404).send('Página no encontrada');
});

app.listen(port, () => {
  console.log(`✅ Backend corriendo en: http://localhost:${port}`);
  console.log(`✅ Frontend visible en: http://localhost:${port}/index.html`);
});
