// Importar Express y el controlador de inicio de sesión
import express from "express";
import loginControllers from '../controllers/loginControllers.js'; // Importar controladores de inicio de sesión
const router = express.Router(); // Crear un enrutador Express

// Manejar la solicitud GET para la página de inicio
router.get('/index', loginControllers.ensureAuthenticated, (req, res) => {
    const error_msg = req.flash('error'); // Obtener el mensaje de error de la sesión
    // Renderizar la página de inicio con el título, mensaje de error, y datos del usuario
    res.render('index', { title: '¡Hola, Mundo!', error_msg: error_msg,  user: req.user });
});

// Exportar el enrutador para su uso en otras partes de la aplicación
export default router;
