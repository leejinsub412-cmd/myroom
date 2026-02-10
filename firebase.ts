
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration from the prompt
const firebaseConfig = {
  apiKey: "AIzaSyB3nGWJ53LCzZ6WAwYQMqsUPClmSD1NVNY",
  authDomain: "myproject-276be.firebaseapp.com",
  projectId: "myproject-276be",
  storageBucket: "myproject-276be.firebasestorage.app",
  messagingSenderId: "485108352464",
  appId: "1:485108352464:web:1ced865569d8d4d7e0a5d5",
  measurementId: "G-R11NE8JC2F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics if supported in this environment
isSupported().then(supported => {
  if (supported) getAnalytics(app);
});

export { auth, db, storage };
