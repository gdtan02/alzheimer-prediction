import { createContext, useContext } from "react";
import { User } from "firebase/auth";

interface AuthStore {
    currentUser: User | null;    // Store current logged in user
    isLoading: boolean;         // Store the status of ongoing authentication process
    setUser: (user: User | null) => void;
    setLoading: (isLoading: boolean | null) => void;
};

const authStore = createContext<AuthStore>({
    currentUser: null,  // Initially no user logged in
    isLoading: true,
    setUser: () => { },
    setLoading: () => { }
});

export const useAuth = () => useContext(authStore);