import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCbxAPOpGcFApqEWalSbI4YDa1x9tSKkr4",
  authDomain: "insigneeventos2026.firebaseapp.com",
  projectId: "insigneeventos2026",
  storageBucket: "insigneeventos2026.firebasestorage.app",
  messagingSenderId: "431680701150",
  appId: "1:431680701150:web:cd435be8bf6bbbb442b84f",
  measurementId: "G-WRMMXV2P1W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export default app;
