const admin = require('firebase-admin');
const createAdminUser = require('./created-admin-user.js');

const app = admin.initializeApp({
    credential: applicationDefault(),
});

createAdminUser(app);