// Importar Express y el pool de conexiones a la base de datos
import express from "express";
import pool from '../config/database.js'; // Importar configuración de la base de datos
import loginControllers  from "../controllers/loginControllers.js"; // Importar controladores de inicio de sesión
const router = express.Router(); // Crear un enrutador Express

// Manejar la solicitud POST para depositar dinero en la cuenta del usuario
router.post('/depositar', (req, res) => {
    // Obtener la cantidad y el concepto de la solicitud
    const { cantidad, concepto } = req.body;
    // Obtener el saldo actual del usuario desde la sesión
    const saldoactual = req.user.saldo;
    // Calcular el nuevo saldo sumando la cantidad depositada al saldo actual
    const nsaldo = parseInt(cantidad, 10) + parseInt(saldoactual, 10);

    // Obtener una conexión del pool de conexiones a la base de datos
    pool.getConnection((err, connection) => {
        if (err) {
            // Manejar errores al obtener la conexión
            console.error('Error al obtener la conexión:', err);
            return res.redirect('index');
        }

        // Iniciar una transacción
        connection.beginTransaction((err) => {
            if (err) {
                // Manejar errores al iniciar la transacción
                console.error('Error al iniciar la transacción:', err);
                connection.release();
                return res.redirect('index');
            }

            // Actualizar el saldo en la base de datos
            connection.query("UPDATE tarjetadebito SET saldo = ? WHERE id = ?;", [nsaldo, req.user.idDebito], (error, results) => {
                if (error) {
                    // Revertir la transacción en caso de error
                    return connection.rollback(() => {
                        console.error('Error en la consulta UPDATE:', error);
                        connection.release();
                        return res.redirect('index');
                    });
                }

                // Insertar una nueva transacción en la base de datos
                connection.query("INSERT INTO transaccion (idCliente, idBanco, monto, idEstado, concepto, fecha) VALUES (?, 4, ?, 1, ?, DATE_FORMAT(CURRENT_DATE(), '%d/%m/%Y'));", 
                [req.user.id, cantidad, concepto], (error) => {
                    if (error) {
                        // Revertir la transacción en caso de error
                        return connection.rollback(() => {
                            console.error('Error en la consulta INSERT:', error);
                            connection.release();
                            return res.redirect('index');
                        });
                    }

                    // Confirmar la transacción
                    connection.commit((err) => {
                        if (err) {
                            // Revertir la transacción en caso de error
                            return connection.rollback(() => {
                                console.error('Error al confirmar la transacción:', err);
                                connection.release();
                                return res.redirect('index');
                            });
                        }

                        // Transacción completada con éxito
                        console.log('Transacción completada con éxito');
                        connection.release();
                        return res.redirect('index');
                    });
                });
            });
        });
    });
});

// Manejar la solicitud GET para la página de depósito
router.get('/depositar', loginControllers.ensureAuthenticated, (req, res) => {
    res.render('depositar', { user: req.user });
});

// Manejar la solicitud POST para retirar dinero de la cuenta del usuario
router.post('/retirar', (req, res) => {
    // Obtener la cantidad y el concepto de la solicitud
    const { cantidad, concepto } = req.body;
    // Obtener el saldo actual del usuario desde la sesión
    const saldoactual = req.user.saldo;
    // Calcular el nuevo saldo restando la cantidad retirada al saldo actual
    const nsaldo = parseInt(saldoactual, 10) - parseInt(cantidad, 10);

    // Verificar si el nuevo saldo sería negativo
    if (nsaldo < 0) {
        req.flash('error', 'Saldo insuficiente');
        return res.redirect('index');
    }

    // Obtener una conexión del pool de conexiones a la base de datos
    pool.getConnection((err, connection) => {
        if (err) {
            // Manejar errores al obtener la conexión
            console.error('Error al obtener la conexión a la base de datos:', err);
            req.flash('error', 'Ocurrió un error durante la transacción');
            return res.redirect('/index');
        }

        // Iniciar una transacción
        connection.beginTransaction((err) => {
            if (err) {
                // Manejar errores al iniciar la transacción
                connection.release();
                console.error('Error al iniciar la transacción:', err);
                req.flash('error', 'Ocurrió un error durante la transacción');
                return res.redirect('/index');
            }

            // Actualizar el saldo en la base de datos
            connection.query('UPDATE tarjetadebito SET saldo = ? WHERE id = ?;', [nsaldo, req.user.idDebito], (error, results) => {
                if (error) {
                    // Revertir la transacción en caso de error
                    return connection.rollback(() => {
                        console.error('Error en la consulta UPDATE:', error);
                        connection.release();
                        req.flash('error', 'Ocurrió un error durante la transacción');
                        return res.redirect('index');
                    });
                }

                // Insertar una nueva transacción en la base de datos
                const insertQuery = 'INSERT INTO transaccion (idCliente, idBanco, monto, idEstado, concepto, fecha) VALUES (?, 4, ?, 2, ?, DATE_FORMAT(CURRENT_DATE(), "%d/%m/%Y"));';
                connection.query(insertQuery, [req.user.id, cantidad, concepto], (error) => {
                    if (error) {
                        // Revertir la transacción en caso de error
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
                            // Revertir la transacción en caso de error
                            return connection.rollback(() => {
                                console.error('Error al confirmar la transacción:', err);
                                connection.release();
                                req.flash('error', 'Ocurrió un error durante la transacción');
                                return res.redirect('/index');
                            });
                        }

                        // Transacción completada con éxito
                        console.log('Transacción completada con éxito');
                        connection.release();
                        res.redirect('/index');
                    });
                });
            });
        });
    });
});

// Manejar la solicitud GET para la página de retiro
router.get('/retirar', loginControllers.ensureAuthenticated, (req, res) => {
    res.render('retirar', { user: req.user });
});

// Manejar
export default router;