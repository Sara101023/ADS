const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Middleware para logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../front')));

// Rutas de API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/usuarios', require('./routes/user.routes'));

// 🔔 RUTA para envío de correos
app.post('/enviar-correo', async (req, res) => {
  const { nombre, correo, resumen, total } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ercioescom@gmail.com',         
        pass: 'fuqiyuriauaimhzw'  
      }
    });

    await transporter.sendMail({
      from: '"ESCOMercio" <ercioescom@gmail.com>',
      to: correo,
      subject: 'Resumen de tu compra',
      text: `Hola ${nombre}, gracias por tu compra.\n\nResumen:\n${resumen}\n\nTotal: $${total}`
    });

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Middleware de errores
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).send('Algo salió mal!');
});

// Catch-all para rutas no encontradas
app.get('*', (req, res) => {
  res.status(404).send('Página no encontrada');
});

app.listen(port, () => {
  console.log(`✅ Backend corriendo en: http://localhost:${port}`);
  console.log(`✅ Frontend visible en: http://localhost:${port}/index.html`);
});

