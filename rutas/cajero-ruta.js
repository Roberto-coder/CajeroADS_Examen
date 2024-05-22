import  express  from "express";
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

