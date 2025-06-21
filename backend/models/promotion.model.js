const db = require('../config/database');

async function getActivePromotionsForProduct(productoId) {
  const [rows] = await db.query(`
    SELECT p.id_promocion, p.descripcion, p.tipo_promocion, 
           p.fecha_inicio, p.fecha_fin, 
           pp.precio_promocional, pp.cantidad_minima
    FROM promocion p
    JOIN promocion_producto pp ON p.id_promocion = pp.id_promocion
    WHERE pp.id_producto = ? 
      AND p.fecha_inicio <= CURDATE()
      AND p.fecha_fin >= CURDATE()
  `, [productoId]);

  return rows;
}

module.exports = {
  getActivePromotionsForProduct
};
