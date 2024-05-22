
import * as modeloHistorial from '../models/historial-modelo.js';

function mostrarTransacciones(req, res) {
    modeloHistorial.mostrarTransacciones((error, datos) => {
         
        if (error) {
            console.error('Error al obtener los datos:', error);
            res.status(500).send('Error interno del servidor');
            return;
        }
  
        // Extraer los usuarios y los libros de los datos
        const transacciones = datos[0];

        // Renderizar la plantilla Pug y pasar los datos de usuarios y libros
        res.render('transacciones', { user: req.user, transacciones: transacciones });

    });
    
  }


  export default { 
    mostrarTransacciones
    };