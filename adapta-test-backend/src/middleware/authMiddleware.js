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
      // 1. Extraer el token
      token = req.headers.authorization.split(" ")[1];

      // 2. Decodificar el token para obtener los IDs
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Buscar el usuario y popular su institución
      req.user = await User.findById(decoded.id)
        .select("-password")
        .populate("institution");

      // 4. Validar que el usuario y su institución existan
      if (!req.user || !req.user.institution) {
        res.status(401);
        throw new Error("No autorizado, usuario o institución no encontrados");
      }

      // 5. Verificación de seguridad CLAVE: la institución en el token debe coincidir con la del usuario en la BD
      if (req.user.institution._id.toString() !== decoded.institution) {
        res.status(401);
        throw new Error("Conflicto de token, la institución no coincide");
      }

      // 6. Hacemos que el objeto completo de la institución esté disponible en `req`
      req.institution = req.user.institution;

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("No autorizado, el token falló");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("No autorizado, no se encontró un token");
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
