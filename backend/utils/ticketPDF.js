const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

function convertirNumeroALetras(numero) {
  const partes = numero.toFixed(2).split('.');
  const unidades = Number(partes[0]);
  const centavos = partes[1];
  return `${unidades} Pesos ${centavos}/100 M.N.`;
}

function generarTicketPDF(venta, nombreCliente, callback) {
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, '../temp_ticket.pdf');
  const stream = fs.createWriteStream(filePath);

  const folio = `A-001-${venta.id.toString().padStart(6, '0')}`;
  const fechaHora = moment(venta.fecha).format('DD/MMM/YYYY HH:mm:ss');

  const subtotal = venta.subtotal.toFixed(2);
  const iva = venta.iva.toFixed(2);
  const total = venta.total.toFixed(2);
  const totalLetras = convertirNumeroALetras(Number(total));

  doc.fontSize(14).text('ESCOMercio', { align: 'center' });
  doc.fontSize(10).text(`Folio: ${folio}`);
  doc.text(`Fecha: ${fechaHora}`);
  doc.text('---------------------------------------------');
  doc.fontSize(12).text('Detalles de la compra:\n');

  venta.items.forEach(item => {
    const nombre = item.nombre || 'Producto';
    const cantidad = item.cantidad;
    const precio = `$${item.precio_unitario.toFixed(2)}`;
    const importe = `$${(item.precio_unitario * item.cantidad).toFixed(2)}`;
    doc.text(`${cantidad} x ${nombre} - ${precio} -> ${importe}`);
  });

  doc.text('---------------------------------------------');
  doc.fontSize(10);
  doc.text(`Subtotal: $${subtotal}`);
  doc.text(`IVA (16%): $${iva}`);
  doc.text(`Total: $${total}`);
  doc.text(`Total en letras: ${totalLetras}`);
  doc.text(`Método de pago: ${venta.metodo_pago}`);
  doc.moveDown();
  doc.text('Este documento es una representación impresa de un CFDI.', { italics: true });
  doc.moveDown();
  doc.text('Política de devoluciones: Sujeta al reglamento en nuestro sitio web.');
  doc.text('Contacto: ercioescom@gmail.com | www.escomercio.com');
  doc.moveDown();
  doc.fontSize(12).text('¡Gracias por su compra!', { align: 'center' });

  doc.pipe(stream);
  doc.end();

  stream.on('finish', () => callback(filePath));
}

module.exports = { generarTicketPDF };
