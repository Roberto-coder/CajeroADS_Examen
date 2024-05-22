function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    // Redirigir al usuario a la página de login si no está autenticado
    req.flash('error', 'Logeate para tener acceso a la página');
    res.redirect('/');
}
function notensureAuthenticated(req, res, next) {
    if (req.isUnauthenticated()) {
        return next();
    }
    // Redirigir al usuario a la página de login si no está autenticado
    req.flash('error', 'Acceso denegado');
    res.redirect('/');
}

export default { ensureAuthenticated, notensureAuthenticated};