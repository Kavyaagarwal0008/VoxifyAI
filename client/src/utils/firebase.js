// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth, GoogleAuthProvider } from "firebase/auth"
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "shifraai-643cb.firebaseapp.com",
    projectId: "shifraai-643cb",
    storageBucket: "shifraai-643cb.firebasestorage.app",
    messagingSenderId: "127695646338",
    appId: "1:127695646338:web:cc8c9e8e3c3bf2e9cb4e9b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)


const provider = new GoogleAuthProvider

export { auth, provider }