import express from "express";

const router = express.Router();

router.get('/pagar', (req, res) => {
    res.render('servicios');
});

router.post('/pagar', (req, res) => {
    const { cantidad } = req.body;
    
    res.send(`Pago realizado por la cantidad de ${cantidad}`);
});

export default router;
