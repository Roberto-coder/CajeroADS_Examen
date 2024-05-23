// Importar Express y Passport (configuración de autenticación)
import express from "express";
import passport from "../config/passport.js"; // Importar la configuración de Passport
const router = express.Router(); // Crear un enrutador Express

// Ruta para mostrar el formulario de inicio de sesión
router.get('/', (req, res) => {
    const error_msg = req.flash('error'); // Obtener el mensaje de error de la sesión
    // Renderizar la página de inicio de sesión con el mensaje de error
    res.render('login', { error_msg });
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    const id = req.user.id; // Obtener el ID del usuario
    req.logOut(function(err){
        if(err){
            return next(err);
        }
        // Destruir la sesión y redirigir al inicio
        req.session.destroy(() => {
            res.redirect('/');
        });
    });
});

// Ruta para mostrar el formulario de registro de usuario
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Ruta para autenticar al usuario y redirigir basada en el resultado
router.post('/signin', passport.authenticate('local', {
    failureRedirect: '/', // Redirigir en caso de falla de autenticación
    failureFlash: true // Mostrar mensajes de error
}), (req, res) => {
    // Redirigir al usuario a la página de inicio después de una autenticación exitosa
    res.redirect('/index');
});

// Exportar el enrutador para su uso en otras partes de la aplicación
export default router;
