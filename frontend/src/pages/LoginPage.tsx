import React from "react";
import LoginForm from "@/components/forms/LoginForm";
import NavBar from "@/components/NavBar";

const LoginPage = () => {
    
    return (
        <>
            <NavBar />
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-lg">
                    <LoginForm />
                </div>
            </div>
        </>
    )
};

export default LoginPage;