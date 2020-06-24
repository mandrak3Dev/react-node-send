const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (authHeader) {
    // Obtener Token
    const token = authHeader.split(" ")[1];
    // Comprobar jwt
    try {
      const usuario = jwt.verify(token, process.env.SECRET);
      req.usuario = usuario;
    } catch (error) {
      console.log(error);
    }
  }

  return next();
};
