// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app"; // Added getApps, getApp
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZ2uueufL3iXjyY2q-p1YT4III3xsZfgY",
  authDomain: "realdel-f964c.firebaseapp.com",
  projectId: "realdel-f964c",
  storageBucket: "realdel-f964c.firebasestorage.app",
  messagingSenderId: "118715949536",
  appId: "1:118715949536:web:9d37749a6c6e2346548b85",
  measurementId: "G-XGFZJKTF9D"
};

// Initialize Firebase (Next.js friendly check)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize and Export Storage
export const storage = getStorage(app);