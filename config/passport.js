import passport from "passport";
import bcrypt from "bcrypt";
import pool from './database.js';
import { Strategy as LocalStrategy } from 'passport-local';
passport.use(new LocalStrategy({
    usernameField: 'tarjeta',
    passwordField: 'clave'
    },
    function(username, password, done){
        pool.query('SELECT cliente.*,tarjetacredito.*, tarjetadebito.* FROM cliente JOIN tarjetadebito ON cliente.idDebito = tarjetadebito.id JOIN tarjetacredito ON cliente.idCredito = tarjetacredito.id WHERE cliente.cuenta = ?;', [username], (error, results, fields) => {
            if (error) {
                return done(error);
            }
            if (results.length === 0) {
                return done(null, false, { message: 'Usuario o contraseña incorrectos' }); // Usuario no encontrado
            }
            const user = results[0];
            
            if(password == user.clave) {
                return done(null, { id: user.id, name: user.nombre, saldo: user.saldo, tarjeta: user.idDebito});
            }else {
                return done(null, false, { message: 'Usuario o contraseña incorrectos' });
            }
        });
    }
));

// Serialización del usuario
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
  // Deserialización del usuario
passport.deserializeUser(function(id, done) {
    pool.getConnection((err, connection) => {
        if (err) { return done(err); }
        // Seleccionar solo los campos necesarios para la sesión
        connection.query('SELECT cliente.*,tarjetacredito.*, tarjetadebito.* FROM cliente JOIN tarjetadebito ON cliente.idDebito = tarjetadebito.id JOIN tarjetacredito ON cliente.idCredito = tarjetacredito.id WHERE cliente.id = ?;', [id], (error, results) => {
            
            connection.release();
            if (error) { return done(error); }
            done(null, results[0]); // Asegúrate de que esto no incluye información sensible
        });
    });
});
export default passport;