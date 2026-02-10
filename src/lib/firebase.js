import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-vza4_VR-IVcxcPkqV1FcS1ocuVJ5_zs",
  authDomain: "tine-len-38edb.firebaseapp.com",
  projectId: "tine-len-38edb",
  storageBucket: "tine-len-38edb.firebasestorage.app",
  messagingSenderId: "874903621742",
  appId: "1:874903621742:web:6e3211c4917485bdc4167f",
  measurementId: "G-K5FV1Y7GXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
