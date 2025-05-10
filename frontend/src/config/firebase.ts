import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/* REPLACE ME */
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);