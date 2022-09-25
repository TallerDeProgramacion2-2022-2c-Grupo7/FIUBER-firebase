const admin = require('firebase-admin');
const createAdminUser = require('./createAdminUser');

const app = admin.initializeApp({
    credential: applicationDefault(),
});

createAdminUser(app);