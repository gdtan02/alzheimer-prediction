import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateCurrentUser
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebase";

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterNewUserCredentials {
    name: string;
    email: string;
    password: string;
}


// Service to handle authentication using Firebase
export const AuthService = {

    // Email and password-based login
    async loginWithEmailAndPassword({ email, password }: LoginCredentials) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.log("Login error: ", error)
            throw error;
        }
    },

    // Register new user
    async registerNewUser({ name, email, password }: RegisterNewUserCredentials) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log(userCredential)

            if (userCredential) {
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    name,
                    email,
                    createdAt: serverTimestamp()
                });
            };

            return userCredential.user;
        } catch (error) {
            console.log("Registration error: ", error)
            throw error;
        }
    },

    // Sign out
    async signOutUser() {
        try {
            await signOut(auth);
        } catch (error) {
            console.log("Sign out error: ", error)
            throw error;
        }
    }
};
