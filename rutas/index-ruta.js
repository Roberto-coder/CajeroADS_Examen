import  express  from "express";

const router = express.Router();


router.get('/', (req, res) => {
    res.render('index', { title: '¡Hola, Mundo!', message: 'Bienvenido a mi aplicación Express con Pug' });
  });

  export default router;

