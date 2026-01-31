import admin from 'firebase-admin';

// prevent re-initialization
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines if using env var
                privateKey: process.env.FIREBASE_PRIVATE_KEY
                    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                    : undefined,
            }),
        });
        console.log("Firebase Admin Initialized");
    } catch (error) {
        console.error("Firebase Admin Initialization Error:", error.stack);
    }
}

export default admin;
