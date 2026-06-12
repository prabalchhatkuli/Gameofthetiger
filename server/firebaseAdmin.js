const admin = require('firebase-admin');

// Initialized once at startup; FIREBASE_SERVICE_ACCOUNT holds the service
// account JSON as a single-line string (set in server/.env locally).
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = admin;
