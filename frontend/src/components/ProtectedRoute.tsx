import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { useAuth } from "@/stores/authStore";

// A wrapper component to restrict unauthorized access 
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => { 
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth()

    useEffect(() => {

        if (!isAuthenticated) {

            // Automatically navigate
            const timer = setTimeout(() => { navigate("/") }, 2000);

            return () => clearTimeout(timer);
        };
    })


    if (!isAuthenticated) {
        return (
            <div className="flex min-h-svh w-full items-center justify-center">
                <div className="w-full max-w-sm">
                    <Alert>
                        <AlertTitle>Unauthorized Access</AlertTitle>
                        <AlertDescription>Please login to the system first.</AlertDescription>
                        <AlertDescription>You will be navigated back to Login page automatically.</AlertDescription>
                    </Alert>  
                </div>
            </div>
        );
    }

    return (<>{children}</>);
};

export default ProtectedRoute