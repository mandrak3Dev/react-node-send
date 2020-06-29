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
  const { nombre_original, nombre } = req.body;
  const enlace = new Enlace();
  enlace.url = shortid.generate();
  enlace.nombre = nombre;
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
// Obtener listados de todos los enlaces
exports.todosEnlaces = async (req, res) => {
  try {
    const enlaces = await Enlace.find({}).select("url -_id");
    res.json({ enlaces });
  } catch (error) {
    console.log(error);
  }
};

// Verificar password
exports.tienePassword = async (req, res, next) => {
  const { url } = req.params;
  // Verificar si existe el enlace
  const enlace = await Enlace.findOne({ url });
  
  if (!enlace) {
    res.status(404).json({ msg: "Ese enlace no existe" });
    return next();
  }
  if (enlace.password) {
    return res.json({ password: true, enlace: enlace.url, archivo: enlace.nombre });
  }
  next();
};
// Revisa si el password es correcto
exports.verificarPassword = async (req, res, next) => {
  const { password } = req.body;
  const { url } = req.params;

  // Consultar por el enlace
  const enlace = await Enlace.findOne({ url });
  if (bcrypt.compareSync(password, enlace.password)) {
    next();
  } else {
    return res.status(401).json({msg: 'El password es incorrecto'})
  }
};

// Obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {
  const { url } = req.params;
  // Verificar si existe en enlace
  const enlace = await Enlace.findOne({ url });
  
  if (!enlace) {
    res.status(404).json({ msg: "Ese enlace no existe" });
    return next();
  }
  // Si existe
  res.json({ archivo: enlace.nombre, password: false });
  next();
};
