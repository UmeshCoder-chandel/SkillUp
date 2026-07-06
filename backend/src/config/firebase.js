const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
);

const verifyGoogleToken = async (idToken) => {
  console.log('=== Verifying Google Token ===');
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: [
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      ].filter(Boolean),
    });
    const payload = ticket.getPayload();
    console.log('Google token verified:', payload.email);
    return payload;
  } catch (error) {
    console.error('Google token verification failed:', error);
    console.error('Error details:', error.message, error.stack);
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
