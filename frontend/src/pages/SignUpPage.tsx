import RegisterForm from "@/components/forms/RegisterForm";
import NavBar from "@/components/common/NavBar";
import PageBackground from "@/components/Background";

const SignUpPage = () => {
    return (
        <>
            <PageBackground>
                <NavBar />
                <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-sm">
                        <RegisterForm />
                    </div>
                </div>
            </PageBackground>  
        </>
    )
};

export default SignUpPage;