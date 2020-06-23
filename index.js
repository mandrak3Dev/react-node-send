const express = require("express");
const conectarDB = require("./config/db");

//Servidor
const app = express();
// DB
conectarDB();

//Puerto
const port = process.env.PORT || 4000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Escuchando en el puerto ${port}`);
});
