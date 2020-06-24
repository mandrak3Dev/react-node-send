const Usuario = require("../models/Usuario");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });

exports.autenticarUsuario = async (req, res, next) => {
  // Mensajes de error de express validator
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  // Verificar si usuario existe
  const { email, nombre, password } = req.body;

  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    res.status(401).json({ msg: "El usuario no existe" });
    return next();
  }

  // verficar usuario
  if (bcrypt.compareSync(password, usuario.password)) {
    // Crear JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
      process.env.SECRET,
      {
        expiresIn: "8h",
      }
    );
    res.json({ token });
  } else {
    res.status(401).json({ msg: "Password incorrecto" });
    return next();
  }
};

exports.usuarioAutenticado = async (req, res) => {
  res.json({usuario: req.usuario});
};
