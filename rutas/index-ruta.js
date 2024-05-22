import  express  from "express";
import loginControllers from '../controllers/loginControllers.js'
const router = express.Router();


router.get('/index', loginControllers.ensureAuthenticated, (req, res) => {
    const error_msg = req.flash('error'); // Obtiene el mensaje de error
    res.render('index', { title: '¡Hola, Mundo!', error_msg: error_msg,  user: req.user });
});

  export default router;

