import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Eita must

const firebaseConfig = {
  apiKey: "AIzaSyAOri-vA5DTGKgTSunsVqT3XNRzQiZtg1A",
  authDomain: "oindrila-official-site.firebaseapp.com",
  projectId: "oindrila-official-site",
  storageBucket: "oindrila-official-site.firebasestorage.app", // Check if this matches your console
  messagingSenderId: "267117394081",
  appId: "1:267117394081:web:7db20f9607527ecd7f98e0",
  measurementId: "G-CHV374PX96"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);