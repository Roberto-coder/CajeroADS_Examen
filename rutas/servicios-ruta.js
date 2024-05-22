import express, { request } from "express";
import pool from '../config/database.js';
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
});
router.post('/pagar/:formapago', (req, res) => {
    const { cantidad, concepto } = req.body;
    const { formapago } = req.params;
    const saldoactual = req.user.saldo;
    const creditoactual = req.user.credito;
    console.log(creditoactual);
    const nsaldo = parseInt(saldoactual, 10) - parseInt(cantidad, 10);
    const ncredito = parseInt(creditoactual, 10) - parseInt(cantidad, 10);

    if ((formapago === 'debito' && nsaldo < 0) || (formapago === 'credito' && ncredito < 0)) {
        req.flash('error', 'Fondos insuficientes');
        return res.redirect('/index');
    }

    let query;
    let nuevoSaldo;
    if (formapago === 'debito') {
        nuevoSaldo = nsaldo;
        query = 'UPDATE tarjetadebito SET saldo = ? WHERE id = ?;';
    } else if (formapago === 'credito') {
        nuevoSaldo = ncredito;
        query = 'UPDATE tarjetacredito SET credito = ? WHERE id = ?;';
    } else {
        req.flash('error', 'Forma de pago inválida');
        return res.redirect('/index');
    }

    pool.query(query, [nuevoSaldo, req.user.id], (error, results, fields) => {
        if (error) {
            console.log(error);
            req.flash('error', 'Ocurrió un error durante la transacción');
            return res.redirect('/index');
        }
        res.redirect('/index');
    });
});
export default router;
