import { useAuth } from "@/stores/auth_store";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
// import { Toaster } from "./ui/sonner";
// import { toast } from 'sonner';
// A wrapper component to restrict unauthorized access 
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => { 
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    if (!currentUser) {

        // toast("Unauthorized Access", {
        //     description: "You must login to the system first.",
        //     action: {
        //         label: "Back to Login",
        //         onClick: () => { navigate("/") }
        //     }
        // });

        // Automatically navigate
        setTimeout(() => { navigate("/") }, 2000);

        return (
            <>
                <div className="flex min-h-svh w-full items-center justify-center">
                    <div className="w-full max-w-sm">
                        <Alert>
                            <AlertTitle>Unauthorized Access</AlertTitle>
                            <AlertDescription>Please login to the system first.</AlertDescription>
                            <AlertDescription>You will be navigated back to Login page automatically.</AlertDescription>
                        </Alert>  
                    </div>
                </div>  
  
        </>)
    };

    return (<>{children}</>);
};

export default ProtectedRoute