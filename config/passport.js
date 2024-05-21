import passport from "passport";
import bcrypt from "bcrypt";
import pool from './database.js';
import { Strategy as LocalStrategy } from 'passport-local';
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
    },
    function(username, password, done){
        pool.query('SELECT id, nombre, user_password, user_role FROM cliente WHERE user_email = ?', [username], (error, results, fields) => {
            if (error) {
                return done(error);
            }
            if (results.length === 0) {
                return done(null, false, { message: 'Usuario o contraseña incorrectos' }); // Usuario no encontrado
            }
            const user = results[0];
            if(password == user_password) {
                return done(null, { id: user.user_id, name: user.user_name, role: user.user_role});
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
        connection.query('SELECT user_id, user_name, user_lastname, user_email, user_role FROM users WHERE user_id = ?', [id], (error, results) => {
            connection.release();
            if (error) { return done(error); }
            done(null, results[0]); // Asegúrate de que esto no incluye información sensible
        });
    });
});
export default passport;