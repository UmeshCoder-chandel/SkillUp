const admin = require('firebase-admin');

let firebaseApp = null;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn('Firebase not configured - Google login disabled');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.warn('Firebase init failed:', error.message);
  }

  return firebaseApp;
};

const verifyFirebaseToken = async (idToken) => {
  initFirebase();
  if (!firebaseApp) {
    throw new Error('Firebase not configured');
  }
  return admin.auth().verifyIdToken(idToken);
};

module.exports = { initFirebase, verifyFirebaseToken };
