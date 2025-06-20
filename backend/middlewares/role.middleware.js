const checkRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.nombre_rol)) {
      return res.status(403).json({ error: 'Acceso denegado: rol no permitido' });
    }
    next();
  };
};

module.exports = { checkRoles };
