import  express  from "express";
import pool from '../config/database.js';
const router = express.Router();

router.post('/depositar', (req, res) =>{
    const { cantidad, concepto } = req.body;
    const saldoactual = req.user.saldo;
    const nsaldo = parseInt(cantidad, 10) + parseInt(saldoactual, 10);
    pool.query('UPDATE tarjetadebito SET saldo = ? WHERE id = ?;', [nsaldo, req.user.idDebito], (error, results, fields) => {
        if(error){
            console.log(error);
            res.redirect('index');
        }
        res.redirect('index');
    });
});

router.get('/depositar', (req, res) =>{
    res.render('depositar', { user: req.user });
});

router.post('/retirar', (req, res) =>{
    const { cantidad, concepto } = req.body;
    const saldoactual = req.user.saldo;
    const nsaldo = parseInt(saldoactual, 10) - parseInt(cantidad, 10);
    if(nsaldo < 0){
        req.flash('error', 'Saldo insuficiente');
        res.redirect('index');
    }else{
        pool.query('UPDATE tarjetadebito SET saldo = ? WHERE id = ?;', [nsaldo, req.user.idDebito], (error, results, fields) => {
            if(error){
                console.log(error);
            }
            res.redirect('index');
        });
    }
    
});

router.get('/retirar', (req, res) =>{
    res.render('retirar', { user: req.user });
});

router.get('/transacciones', (req, res) =>{
    res.render('transacciones',{ user: req.user });
});
export default router;

