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
import { useState } from "react";
import { AuthService } from "@/services/authService";
import { toast } from "sonner";
import { auth } from "@/config/firebase";
import { updateCurrentUser } from "firebase/auth";


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
                description: "Welcome to Alzheimer Prediction App!"
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
        console.log("Google Login");
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