import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJxr3RWiqeYiWSzHLvmXiwYNMZF5vNR3g",
  authDomain: "alzheimer-prediction-web.firebaseapp.com",
  projectId: "alzheimer-prediction-web",
  storageBucket: "alzheimer-prediction-web.firebasestorage.app",
  messagingSenderId: "33445577756",
  appId: "1:33445577756:web:b114cc3967414779b30bd9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);