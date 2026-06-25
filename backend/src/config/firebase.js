const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const googleClient = new OAuth2Client();

const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: [
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      ].filter(Boolean),
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Invalid Google token');
  }
};

// Keep the old name for backwards compatibility
const initFirebase = () => {
  console.log('Firebase not used - using Google OAuth directly');
  return null;
};

const verifyFirebaseToken = verifyGoogleToken;

module.exports = { initFirebase, verifyFirebaseToken, verifyGoogleToken };
