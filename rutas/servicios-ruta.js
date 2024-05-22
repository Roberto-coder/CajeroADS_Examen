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
    const idCliente = req.user.id;

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

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error al obtener la conexión a la base de datos:', err);
            req.flash('error', 'Ocurrió un error durante la transacción');
            return res.redirect('/index');
        }

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                console.error('Error al iniciar la transacción:', err);
                req.flash('error', 'Ocurrió un error durante la transacción');
                return res.redirect('/index');
            }

            connection.query(query, [nuevoSaldo, idCliente], (error, results) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error('Error en la consulta UPDATE:', error);
                        connection.release();
                        req.flash('error', 'Ocurrió un error durante la transacción');
                        return res.redirect('/index');
                    });
                }

                const insertQuery = 'INSERT INTO transaccion (idCliente, idBanco, monto, idEstado, concepto, fecha) VALUES (?, 4, ?, 1, ?, DATE_FORMAT(CURRENT_DATE(), "%d/%m/%Y"));';

                connection.query(insertQuery, [idCliente, cantidad, concepto], (error) => {
                    if (error) {
                        return connection.rollback(() => {
                            console.error('Error en la consulta INSERT:', error);
                            connection.release();
                            req.flash('error', 'Ocurrió un error durante la transacción');
                            return res.redirect('/index');
                        });
                    }

                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error('Error al confirmar la transacción:', err);
                                connection.release();
                                req.flash('error', 'Ocurrió un error durante la transacción');
                                return res.redirect('/index');
                            });
                        }

                        console.log('Transacción completada con éxito');
                        connection.release();
                        res.redirect('/index');
                    });
                });
            });
        });
    });
});


export default router;
