/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { AuthService } from "@/services/authService";
import { toast } from "sonner";
import { auth } from "@/config/firebase";
import { updateCurrentUser } from "firebase/auth";
import { useAuth } from "@/stores/authStore";


const formSchema = z.object({
    email: z.string()
        .nonempty({ message: "Email address should not be empty." })
        .email({ message: "Invalid email address." }),
    password: z.string()
        .nonempty({message: "Password should not be empty."})
});

const LoginForm = () => {

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            navigate("/dashboard");
        }
    }, [currentUser, navigate]);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const submitForm = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            const user = await AuthService.loginWithEmailAndPassword({
                email: values.email,
                password: values.password
            });
            console.log("user id: ", user.uid);

            if (user) { updateCurrentUser(auth, user); };
            
            toast.success("Login Successful", {
                description: "Welcome to Alzheimer's Prediction App!"
            });

            navigate("/dashboard");

        } catch (error: any) {
            console.log(error.message)
            toast.error("Login Failed", {
                description: error.message || "An error occurred during login."
            });
            updateCurrentUser(auth, null);
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true);

        const timer = setTimeout(() => {setIsLoading(false)}, 30000); // 30 seconds timeout
        
        try {
            const user = await AuthService.loginWithGoogle();


            clearTimeout(timer);  // If successful
            if (user) {
                updateCurrentUser(auth, user);
            }

            toast.success("Login Successful", {
                description: "Welcome to Alzheimer's Prediction App!"
            });

            navigate("/dashboard");
        } catch (error: any) {
            console.log(error.message)
            clearTimeout(timer);  // If error
            toast.error("Login Failed", {
                description: error.message || "An error occurred during login."
            });
            updateCurrentUser(auth, null);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="flex flex-col gap-6 h-full w-full items-center justify-center px-4">
                <Card className="mx-auto min-w-md max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>Enter your email and password to login to your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(submitForm)} className="space-y-8">
                                <div className="grid gap-4">
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem className="grid gap-2">
                                            <FormLabel htmlFor="email">Email</FormLabel>
                                            <FormControl>
                                                <Input id="email" placeholder="Enter your email here" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem className="grid gap-2">
                                            <div className="flex justify-between items-center">
                                                <FormLabel htmlFor="password">Password</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input id="password" placeholder="Enter your password here" type="password" autoComplete="current-password" {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Logging in..." : "Login"}</Button>
                                    <Button variant="outline" className="w-full" disabled={isLoading} onClick={handleGoogleLogin}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                            />
                                        </svg>
                                        Login with Google
                                    </Button>
                                </div>
                            </form>
                        </Form>
                        <div className="mt-4 text-center text-sm">
                            Don't have an account? {' '}
                            <Link to="/register" className="underline">
                                Sign up here
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>   
    )
};

export default LoginForm;