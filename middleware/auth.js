function ensureLoggedIn(options) {
    if (typeof options == 'string') {
        options = { redirectTo: options }
    }
    options = options || {};

    var url = options.redirectTo || '/login';
    var setReturnTo = (options.setReturnTo === undefined) ? false : options.setReturnTo;
    var usernameCheck = (options.usernameCheck === undefined) ? true : options.usernameCheck;

    return function (req, res, next) {
        if (!req.isAuthenticated || !req.isAuthenticated() || (usernameCheck && (req.user.username === ""))) {
            if (setReturnTo && req.session) {
                req.session.returnTo = req.originalUrl || req.url;
            }
            return res.redirect(url);
        }
        next();
    }
}
function ensureLoggedOut(options) {
    if (typeof options == 'string') {
        options = { redirectTo: options }
    }
    options = options || {};

    var url = options.redirectTo || '/home';

    return function (req, res, next) {
        if (req.isAuthenticated && req.isAuthenticated() && req.user.username !== "") {
            return res.redirect(url);
        }
        next();
    }
}
module.exports = { ensureLoggedIn, ensureLoggedOut };