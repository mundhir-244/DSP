const dotenv = require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require("../social-aebf8-firebase-adminsdk-9s96n-f60a306884.json");

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
};

module.exports = {
    firebaseConfig,
    admin
}


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.STORAGE_BUCKET,
});