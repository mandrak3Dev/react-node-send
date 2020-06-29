const Enlace = require("../models/Enlace");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });
const multer = require("multer");
const shortid = require("shortid");
const fs = require("fs");

exports.subirArchivo = async (req, res, next) => {
  const configuracionMulter = {
    limits: { fileSize: req.usuario ? 1024 * 1024 * 10 : 1024 * 1024 },
    storage: (fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, __dirname + "/../uploads");
      },
      filename: (req, file, cb) => {
        const extension = file.originalname.substring(
          file.originalname.lastIndexOf("."),
          file.originalname.length
        );
        cb(null, `${shortid.generate()}${extension}`);
      },
    })),
  };

  const upload = multer(configuracionMulter).single("archivo");
  // Subida de Archivos
  upload(req, res, async (error) => {
    console.log(req.file);
    if (!error) {
      res.json({ archivo: req.file.filename });
    } else {
      console.log(error);
      return next();
    }
  });
};

exports.eliminarArchivo = async (req, res) => {
  console.log(req.archivo);
  try {
    fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`);
    console.log("eliminado");
  } catch (error) {
    console.log(error);
  }
};

exports.descargar = async (req, res, next) => {
  // Obtiene el enlace
  const { archivo } = req.params;
  const enlace = await Enlace.findOne({nombre: archivo });

  const archivoDescarga = __dirname + '/../uploads/' + archivo;
  res.download(archivoDescarga);
  // Eliminar archivo y entrada de db
  // Verificar descargas < 1 || > 1
  const { descargas, nombre } = enlace;
  if (descargas === 1) {
    // Eliminar el archivo
    req.archivo = nombre;
    // Eliminar la entrada de la db
    await Enlace.findOneAndRemove(enlace.id);
    next();
  } else {
    enlace.descargas--;
    await enlace.save();
  }
}