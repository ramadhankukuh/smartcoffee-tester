// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyBMjmAGq6e-WxIs8MiHhqn3bLS3-aHADgM",
  authDomain: "smartcoffee-be6b1.firebaseapp.com",
  projectId: "smartcoffee-be6b1",
  storageBucket: "smartcoffee-be6b1.firebasestorage.app",
  messagingSenderId: "94291554177",
  appId: "1:94291554177:web:c7721cb9bcc0642107c280",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
