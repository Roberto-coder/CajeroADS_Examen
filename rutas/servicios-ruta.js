// Importar Express y el pool de conexiones a la base de datos
import express, { request } from "express";
import pool from '../config/database.js'; // Importar configuración de la base de datos
import loginControllers from "../controllers/loginControllers.js"; // Importar controladores de inicio de sesión
const router = express.Router(); // Crear un enrutador Express

// Ruta para mostrar la página de servicios que se pueden pagar
router.get('/pagar', loginControllers.ensureAuthenticated, (req, res) => {
    res.render('servicios', { user: req.user });
});

// Ruta para procesar el pago de un servicio
router.post('/pagar', (req, res) => {
    const { cantidad } = req.body;
    res.send(`Pago realizado por la cantidad de ${cantidad}`);
});

// Ruta para mostrar el formulario de pago de un servicio específico
router.get('/pagarform/:servicio', loginControllers.ensureAuthenticated, (req, res) => {
    const servicio = req.params.servicio;
    res.render('pagar', { user: req.user, servicio: servicio });
});

// Ruta para procesar el pago de un servicio mediante débito o crédito
router.post('/pagar/:formapago', (req, res) => {
    const { cantidad, concepto } = req.body;
    const { formapago } = req.params;
    const saldoactual = req.user.saldo;
    const creditoactual = req.user.credito;
    const idCliente = req.user.id;

    // Calcular el nuevo saldo y crédito después del pago
    const nsaldo = parseInt(saldoactual, 10) - parseInt(cantidad, 10);
    const ncredito = parseInt(creditoactual, 10) - parseInt(cantidad, 10);

    // Verificar si hay suficientes fondos para el pago
    if ((formapago === 'debito' && nsaldo < 0) || (formapago === 'credito' && ncredito < 0)) {
        req.flash('error', 'Fondos insuficientes');
        return res.redirect('/index');
    }

    let query;
    let nuevoSaldo;

    // Determinar la consulta SQL y el nuevo saldo dependiendo de la forma de pago
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

     // Obtener una conexión del pool de conexiones a la base de datos
     pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error al obtener la conexión a la base de datos:', err);
            req.flash('error', 'Ocurrió un error durante la transacción');
            return res.redirect('/index');
        }

        // Iniciar una transacción
        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                console.error('Error al iniciar la transacción:', err);
                req.flash('error', 'Ocurrió un error durante la transacción');
                return res.redirect('/index');
            }

           // Actualizar el saldo o crédito en la base de datos
           connection.query(query, [nuevoSaldo, idCliente], (error, results) => {
            if (error) {
                return connection.rollback(() => {
                    console.error('Error en la consulta UPDATE:', error);
                    connection.release();
                    req.flash('error', 'Ocurrió un error durante la transacción');
                    return res.redirect('/index');
                });
            }

              // Insertar una nueva transacción en la base de datos
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

                     // Confirmar la transacción
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
// Ruta para mostrar el formulario de pago con tarjeta  
router.get('/pagartarjeta',loginControllers.ensureAuthenticated, (req, res) => {
    res.render('tarjeta',{ user: req.user});
});
// Ruta para procesar el pago con tarjeta
router.post('/pagartarjeta', (req, res) => {
    const idCliente = req.user.id;
    const { cantidad } = req.body;
    // Obtener una conexión del pool de conexiones a la base de datos
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
