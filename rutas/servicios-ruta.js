import express, { request } from "express";
import pool from '../config/database.js';
const router = express.Router();

router.get('/pagar',loginControllers.ensureAuthenticated, (req, res) => {
    res.render('servicios',{ user: req.user });
});

router.post('/pagar', (req, res) => {
    const { cantidad } = req.body;
    
    res.send(`Pago realizado por la cantidad de ${cantidad}`);
});
router.get('/pagarform/:servicio',loginControllers.ensureAuthenticated,(req,res) => {
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

                const insertQuery = 'INSERT INTO transaccion (idCliente, idBanco, monto, idEstado, concepto, fecha) VALUES (?, 4, ?, 2, ?, DATE_FORMAT(CURRENT_DATE(), "%d/%m/%Y"));';

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

router.get('/pagartarjeta',loginControllers.ensureAuthenticated, (req, res) => {
    res.render('tarjeta',{ user: req.user});
});
router.post('/pagartarjeta', (req, res) => {
    const idCliente = req.user.id;
    const { cantidad } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error al obtener la conexión:', err);
            return res.redirect('index');
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error('Error al iniciar la transacción:', err);
                connection.release();
                return res.redirect('index');
            }

            // Consulta para obtener el crédito disponible y el límite de crédito del cliente
            const selectQuery = 'SELECT t.id, t.limiteCredito, t.credito FROM tarjetacredito AS t JOIN cliente AS c ON t.id = c.idCredito WHERE c.id = ?';
            connection.query(selectQuery, [idCliente], (error, results) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error('Error en la consulta SELECT:', error);
                        connection.release();
                        req.flash('error', 'Ocurrió un error durante la transacción');
                        return res.redirect('/index');
                    });
                }

                if (results.length === 0) {
                    connection.release();
                    req.flash('error', 'Tarjeta de crédito no encontrada');
                    return res.redirect('/index');
                }

                const creditoDisponible = results[0].credito;
                const limiteCredito = results[0].limiteCredito;
                const nuevoCreditoDisponible = Math.min(limiteCredito, parseInt(creditoDisponible, 10) + parseInt(cantidad, 10));

                // Actualización del crédito disponible de la tarjeta de crédito
                const updateQuery = 'UPDATE tarjetacredito SET credito = ? WHERE id = ?';
                connection.query(updateQuery, [nuevoCreditoDisponible, results[0].id], (error) => {
                    if (error) {
                        return connection.rollback(() => {
                            console.error('Error en la consulta UPDATE:', error);
                            connection.release();
                            req.flash('error', 'Ocurrió un error durante la transacción');
                            return res.redirect('/index');
                        });
                    }

                    // Registro de la transacción
                    const insertQuery = 'INSERT INTO transaccion (idCliente, idBanco, monto, idEstado, concepto, fecha) VALUES (?, 4, ?, 2, "Pago de crédito", DATE_FORMAT(CURRENT_DATE(), "%d/%m/%Y"))';
                    connection.query(insertQuery, [idCliente, cantidad], (error) => {
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
});


export default router;
