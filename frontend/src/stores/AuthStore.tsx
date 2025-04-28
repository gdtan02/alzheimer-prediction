import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase"
import { AuthService } from "@/services/authService";

// Define the auth context type
interface AuthContextType {
  currentUser: User | null;
  userRole: "admin" | "clinician" | null
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setUserRole: (role: "admin" | "clinician" | null) => void;
  setIsAuthenticated: (isLoading: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

// Create the context
const AuthStore = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  isAuthenticated: false,
  isAdmin: false,
  setUser: () => { },
  setIsAuthenticated: () => { },
  setUserRole: () => { },
  setIsAdmin: () => { },
});

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<'admin' | 'clinician' | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthenticated(user != null);

      if (user) {
        try {
          const role = await AuthService.getUserRole(user.uid);
          setUserRole(role);
          setIsAdmin('admin' == role)
        } catch (error) {
          console.error("Error fetching user role: ", error);
          setUserRole("clinician");
          setIsAdmin(false)
        }
      } else {
        setUserRole(null);
        setIsAdmin(false);
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Context value
  const value = {
    currentUser,
    userRole,
    isAuthenticated,
    isAdmin,
    setUser: setCurrentUser,
    setUserRole,
    setIsAuthenticated: setIsAuthenticated,
    setIsAdmin: setIsAdmin,
  };

  return <AuthStore.Provider value={value}>{children}</AuthStore.Provider>;
};

// Create a hook for using the auth context
export const useAuth = () => useContext(AuthStore);