const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const indexRouter = require('./routes/index');

// Configura la carpeta "public" para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Usa las rutas definidas
app.use('/', indexRouter);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
