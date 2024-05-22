import express from "express";
import path from "path";
import session from "express-session";
import flash from "connect-flash";
import passport from "./config/passport.js";

import indexruta from "./rutas/index-ruta.js";
import loginruta from "./rutas/login-ruta.js";
import cajeroruta from "./rutas/cajero-ruta.js";
const __dirname = (process.platform === "win32")
        ? path.resolve()
        : path.dirname(new URL(import.meta.url).pathname);

// Crear una instancia de la aplicación Express
const app = express();
// Configuración de express-session
const expressSession = session({
    secret: 'tu_secreto', // Reemplaza 'tu_secreto' con una cadena secreta real
    resave: false,
    saveUninitialized: false
});
app.use(expressSession);
// Middleware
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Otros middleware que necesites...

// Inicializaciones
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// Definir más rutas y controladores según sea necesario...
app.use('/', indexruta);
app.use('/', loginruta);
app.use('/', cajeroruta);
// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});