import  express  from "express";
import transaccionControllers from '../controllers/transaccionControllers.js';

const router = express.Router();

router.post('/depositar', (req, res) =>{
    const { cantidad } = req.body;
});

router.get('/depositar', (req, res) =>{
    res.render('depositar');
});

router.post('/retirar', (req, res) =>{
    const { cantidad } = req.body;
});

router.get('/retirar', (req, res) =>{
    res.render('retirar');
});

router.post('/transferir', (req, res) =>{
    const { cuenta } = req.body;
});

router.get('/transferir', (req, res) =>{
    res.render('transferir');
});

router.get('/transacciones',transaccionControllers.mostrarTransacciones);
export default router;

