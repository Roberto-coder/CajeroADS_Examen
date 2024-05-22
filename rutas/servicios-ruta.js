import express, { request } from "express";

const router = express.Router();

router.get('/pagar', (req, res) => {
    res.render('servicios',{ user: req.user });
});

router.post('/pagar', (req, res) => {
    const { cantidad } = req.body;
    
    res.send(`Pago realizado por la cantidad de ${cantidad}`);
});
router.get('/pagarform/:servicio',(req,res) => {
    const servicio =req.params.servicio;
    res.render('pagar',{ user: req.user, servicio:servicio});
})
export default router;
