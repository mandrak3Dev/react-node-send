const express = require("express");
const conectarDB = require("./config/db");

//Servidor
const app = express();
// DB
conectarDB();
//Puerto
const port = process.env.PORT || 4000;
// Body parser
app.use(express.json());
// Rutas
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/enlaces", require("./routes/enlaces"));
app.use("/api/archivos", require("./routes/archivos"));

app.listen(port, "0.0.0.0", () => {
  console.log(`Escuchando en el puerto ${port}`);
});
