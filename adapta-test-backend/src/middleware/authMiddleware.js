const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Institution = require("../models/institutionModel");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id)
        .select("-password")
        .populate("institution");

      if (!req.user) {
        res.status(401);
        throw new Error("No autorizado, usuario no encontrado");
      }

      // --- CAMBIO AQUÍ ---
      // Si es Superadmin, nos saltamos la validación de institución
      if (req.user.role === "superadmin") {
        // El superadmin no tiene institución, así que no validamos contra el token
        req.institution = null; 
        return next(); // Pase directo VIP
      }

      // Validación para mortales (usuarios normales)
      if (!req.user.institution) {
         res.status(401);
         throw new Error("Usuario sin institución asignada (y no es superadmin).");
      }

      // Verificar que el token pertenezca a la misma institución del usuario actual
      // (Evita que uses un token de la Institución A para pedir datos de la Institución B si cambiaste de uni)
      if (decoded.institution && req.user.institution._id.toString() !== decoded.institution) {
        res.status(401);
        throw new Error("Conflicto de token: La institución no coincide.");
      }

      req.institution = req.user.institution;
      next();
      // -------------------

    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("No autorizado, token fallido");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("No autorizado, no hay token");
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // Si el usuario es superadmin, tiene acceso a todo. ¡Pase VIP!
    if (req.user && req.user.role === "superadmin") {
      return next();
    }

    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        "El usuario no tiene los permisos necesarios para realizar esta acción."
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
