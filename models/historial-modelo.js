// Importa el objeto `pool` desde el archivo de configuración
import pool from '../config/database.js';

export const mostrarTransacciones=(callback) => {

    const sqlTransacciones = 'select * from transaccion;';

    pool.query(sqlTransacciones, (errorTransacciones, resultadosTransacciones) => {
        if (errorTransacciones) {
            console.error('Error al ejecutar la consulta de transacciones:', errorAutores);
            callback(errorTransacciones, null);
        } else {
            callback(null, [resultadosTransacciones]);

        }
    });

}
