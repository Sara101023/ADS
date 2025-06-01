const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../front')));

// Rutas de API (deben ir ANTES del catch-all)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/usuarios', require('./routes/user.routes'));

app.get('*', (req, res) => {
  // Solo responde con index.html si NO es una ruta de API
  res.sendFile(path.join(__dirname, '../front/index.html'));
});



// Middleware para loggear todas las peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Manejo de errores con más detalle
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).send('Algo salió mal!');
});







// Iniciar servidor
app.listen(port, () => {
  console.log(`✅ Backend corriendo en: http://localhost:${port}`);
  console.log(`✅ Frontend visible en: http://localhost:${port}/index.html`);
});
