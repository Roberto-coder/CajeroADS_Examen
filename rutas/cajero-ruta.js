import express from "express";
import pool from '../config/database.js';
const router = express.Router();

router.post('/depositar', (req, res) => {
    const { cantidad, concepto } = req.body;
    const saldoactual = req.user.saldo;
    const nsaldo = parseInt(cantidad, 10) + parseInt(saldoactual, 10);

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

            connection.query("UPDATE tarjetadebito SET saldo = ? WHERE id = ?;", [nsaldo, req.user.idDebito], (error, results) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error('Error en la consulta UPDATE:', error);
                        connection.release();
                        return res.redirect('index');
                    });
                }

                connection.query("INSERT INTO transaccion (idCliente, idBanco, monto, idEstado, concepto, fecha) VALUES (?, 4, ?, 1, ?, DATE_FORMAT(CURRENT_DATE(), '%d/%m/%Y'));", 
                [req.user.id, cantidad, concepto], (error) => {
                    if (error) {
                        return connection.rollback(() => {
                            console.error('Error en la consulta INSERT:', error);
                            connection.release();
                            return res.redirect('index');
                        });
                    }

                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error('Error al confirmar la transacción:', err);
                                connection.release();
                                return res.redirect('index');
                            });
                        }

                        console.log('Transacción completada con éxito');
                        connection.release();
                        return res.redirect('index');
                    });
                });
            });
        });
    });
});

router.get('/depositar', (req, res) => {
    res.render('depositar', { user: req.user });
});

router.post('/retirar', (req, res) => {
    const { cantidad, concepto } = req.body;
    const saldoactual = req.user.saldo;
    const nsaldo = parseInt(saldoactual, 10) - parseInt(cantidad, 10);

    if (nsaldo < 0) {
        req.flash('error', 'Saldo insuficiente');
        return res.redirect('index');
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

            connection.query('UPDATE tarjetadebito SET saldo = ? WHERE id = ?;', [nsaldo, req.user.idDebito], (error, results) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error('Error en la consulta UPDATE:', error);
                        connection.release();
                        req.flash('error', 'Ocurrió un error durante la transacción');
                        return res.redirect('index');
                    });
                }

                const insertQuery = 'INSERT INTO transaccion (idCliente, idBanco, monto, idEstado, concepto, fecha) VALUES (?, 4, ?, 2, ?, DATE_FORMAT(CURRENT_DATE(), "%d/%m/%Y"));';
                connection.query(insertQuery, [req.user.id, cantidad, concepto], (error) => {
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

router.get('/retirar', (req, res) => {
    res.render('retirar', { user: req.user });
});

router.get('/transacciones', (req, res) => {
    const idCliente = req.user.id;

    pool.query('SELECT * FROM transaccion WHERE idCliente = ?;', [idCliente], (error, results) => {
        if (error) {
            console.error('Error al obtener los datos:', error);
            return res.status(500).send('Error interno del servidor');
        }
        res.render('transacciones', { user: req.user, transacciones: results });
    });
});

export default router;
