const express = require('express');
const path = require('path');
const app = express();
const port = 4000;

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../front')));

// Middleware para APIs (simuladas o reales)
app.use(express.json());

// Ejemplo de API simulada
app.get('/api/productos', (req, res) => {
  res.json([
    { id: 1, nombre: "Producto Demo", precio: 100 }
  ]);
});

// Todas las rutas no-API redirigen al frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/index.html'));
});

app.listen(port, () => {
  console.log(`Backend corriendo en http://localhost:${port}`);
  console.log(`Frontend accesible en http://localhost:${port}/index.html`);
});