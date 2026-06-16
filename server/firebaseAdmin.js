const admin = require('firebase-admin');

// Initialized once at startup; FIREBASE_SERVICE_ACCOUNT holds the service
// account JSON as a single-line string (set in server/.env locally).
if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');
    }
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = admin;
