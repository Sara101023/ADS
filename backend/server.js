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

/* RUTA para envío de correos
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
});*/

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

const PDFDocument = require('pdfkit');
const moment = require('moment');
const fs = require('fs');


function generarTicketPDF({ nombre, resumen, total, metodoPago, correo }, callback) {
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, 'temp_ticket.pdf');
  const stream = fs.createWriteStream(filePath);
  const folio = `A-001-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  const fechaHora = moment().format('DD/MMM/YYYY HH:mm:ss');
  const iva = (parseFloat(total) * 0.16 / 1.16).toFixed(2);
  const subtotal = (parseFloat(total) - iva).toFixed(2);

  const totalEnLetras = `${Number(total).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} ( ${convertirNumeroALetras(total)} M.N. )`;

  doc.fontSize(14).text('ESCOMercio', { align: 'center' });
  doc.fontSize(10).text(`Folio: ${folio}`);
  doc.text(`Fecha: ${fechaHora}`);
  doc.text('---------------------------------------------');
  doc.fontSize(12).text('Detalles de la compra:\n');

  resumen.split('\n').forEach(linea => {
    if (linea.trim()) doc.text(linea);
  });

  doc.text('---------------------------------------------');
  doc.fontSize(10);
  doc.text(`Subtotal: $${subtotal}`);
  doc.text(`IVA (16%): $${iva}`);
  doc.text(`Total: $${total}`);
  doc.text(`Total en letras: ${totalEnLetras}`);
  doc.text(`Método de pago: ${metodoPago}`);
  doc.moveDown();
  doc.text('Este documento es una representación impresa de un CFDI.', { italics: true });
  doc.moveDown();
  doc.text('Política de devoluciones: Sujeta al reglamento en nuestro sitio web.');
  doc.text('Contacto: ercioescom@gmail.com | www.veremos');
  doc.moveDown();
  doc.fontSize(12).text('¡Gracias por tu compra!', { align: 'center' });

  doc.pipe(stream);
  doc.end();

  stream.on('finish', () => callback(filePath));
}

// ✉️ Enviar el correo
app.post("/enviar-correo", (req, res) => {
  const { nombre, correo, resumen, total, metodoPago } = req.body;

  generarTicketPDF({ nombre, resumen, total, metodoPago, correo }, (pdfPath) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ercioescom@gmail.com',
        pass: 'fuqiyuriauaimhzw'
      }
    });

    const mailOptions = {
      from: 'ercioescom@gmail.com',
      to: correo,
      subject: 'Tu recibo de compra',
      text: `Hola ${nombre}, gracias por tu compra. Te adjuntamos tu ticket;D`,
      attachments: [{
        filename: 'ticket.pdf',
        path: pdfPath
      }]
    };

    transporter.sendMail(mailOptions, (err, info) => {
      fs.unlinkSync(pdfPath); // elimina el PDF temporal
      if (err) {
        console.error(err);
        res.json({ status: 'error' });
      } else {
        console.log('Correo enviado:', info.response);
        res.json({ status: 'ok' });
      }
    });
  });
});


function convertirNumeroALetras(numero) {
  const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
  return formatter.formatToParts(numero).find(part => part.type === 'integer').value + ' Pesos';
}

