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

// Obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {
  const url = req.params.url;
  // Verificar si existe en enlace
  const enlace = await Enlace.findOne({ url });
  if (!enlace) {
    res.status(404).json({ msg: "Ese enlace no existe" });
    return next();
  }
  // Si existe
  res.json({ archivo: enlace.nombre });
  // Verificar descargas < 1 || > 1
  const { descargas, nombre } = enlace;
  if (descargas === 1) {
    // Eliminar el archivo
    req.archivo = nombre;
    // Eliminar la entrada de la db
    await Enlace.findOneAndRemove(req.params.url);
    next();
  } else {
    enlace.descargas--;
    await enlace.save();
  }
};
