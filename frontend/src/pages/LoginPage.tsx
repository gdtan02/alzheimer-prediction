import React from "react";
import LoginForm from "@/components/forms/LoginForm";
import NavBar from "@/components/common/NavBar";
import PageBackground from "@/components/Background";

const LoginPage = () => {
    
    return (
        <>
            <PageBackground>
                <NavBar />
                <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-lg">
                        <LoginForm />
                    </div>
                </div>
            </PageBackground>
        </>
    )
};

export default LoginPage;