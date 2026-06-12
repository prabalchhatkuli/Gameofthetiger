const admin = require('../firebaseAdmin');

/**/
/*
requireAuth()

NAME
        requireAuth - Express middleware verifying a Firebase ID token

SYNOPSIS
        requireAuth(req, res, next)
            req     -> must carry "Authorization: Bearer <idToken>"
            res     -> 401 JSON response on missing/invalid token
            next    -> called when the token verifies

DESCRIPTION
        Verifies the Firebase ID token with the Admin SDK and attaches the
        decoded token (uid, email, ...) to req.user.

RETURNS
        no return; either responds 401 or calls next()

AUTHOR
        Prabal Chhatkuli
*/
/**/
async function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer (.+)$/);
    if (!match) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }
    try {
        req.user = await admin.auth().verifyIdToken(match[1]);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = requireAuth;
