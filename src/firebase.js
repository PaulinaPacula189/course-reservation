import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB4NA1a6kRmVJGIO98vcXmRNF_plPuqxJE",
  authDomain: "coursereservation-4701b.firebaseapp.com",
  projectId: "coursereservation-4701b",
  storageBucket: "coursereservation-4701b.firebasestorage.app",
  messagingSenderId: "567845872879",
  appId: "1:567845872879:web:47af62d2fe49a17029e71a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);