const Enlace = require("../models/Enlace");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const shortid = require("shortid");

exports.nuevoEnlance = async (req, res, next) => {
  // Mensajes de error de express validator
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  // Objeto de enlace
  const { nombre_original } = req.body;
  const enlace = new Enlace();
  enlace.url = shortid.generate();
  enlace.nombre = shortid.generate();
  enlace.nombre_original = nombre_original;

  // Si el usuario esta autenticado
  if (req.usuario) {
    const { password, descargas } = req.body;
    // Asignar al enlace el numero de descargas
    if (descargas) {
      enlace.descargas = descargas;
    }
    // Asignar password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      enlace.password = await bcrypt.hash(password, salt);
    }
    // Asignar autor
    enlace.autor = req.usuario.id;
  }

  // Guardar enlace en db
  try {
    await enlace.save();
    return res.json({ msg: `${enlace.url}` });
  } catch (error) {
    res.json(error);
  }
};
