function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect('/login');
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.user_type === 'admin') return next();
    res.status(403).send('Forbidden: Admins only. <a href="/">Go back</a>');
}

module.exports = { isAuthenticated, isAdmin };