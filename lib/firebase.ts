import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCCNINQEW8Jb4i_TAvp2goqNhplMEUV0hs",
  authDomain: "whome-c5ac3.firebaseapp.com",
  projectId: "whome-c5ac3",
  storageBucket: "whome-c5ac3.firebasestorage.app",
  messagingSenderId: "796455732910",
  appId: "1:796455732910:web:b9542151ca93f5def98f3f",
  measurementId: "G-E0FNTB53B1"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, db, storage, analytics };
