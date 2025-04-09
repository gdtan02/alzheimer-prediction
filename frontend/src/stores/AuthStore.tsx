import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase"

// Define the auth context type
interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isLoading: boolean) => void;
}

// Create the context
const AuthStore = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {}
});

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthenticated(user != null);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    setUser: setCurrentUser,
    setIsAuthenticated: setIsAuthenticated
  };

  return <AuthStore.Provider value={value}>{children}</AuthStore.Provider>;
};

// Create a hook for using the auth context
export const useAuth = () => useContext(AuthStore);