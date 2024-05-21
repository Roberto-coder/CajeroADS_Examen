import  express  from "express";

const router = express.Router();




router.get('/', (req,res)=>{
    res.render('login');
});
router.get('/signup', (req,res)=>{
    res.render('signup');
});

// Ruta para autenticar y redirigir basada en el rol del usuario
router.post('/signin', passport.authenticate('local', {
    failureRedirect: '/login', // Redirigir en caso de falla de autenticación
    failureFlash: true // Opcional: para mensajes de flash
}), (req, res) => {
    // Verificar el rol del usuario después de la autenticación
    res.redirect('/index');
});
export default router;