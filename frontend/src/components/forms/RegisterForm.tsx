import { Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Form, FormControl, FormField, FormMessage, FormItem, FormLabel } from "../ui/form";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

const formSchema = z.object({
    name: z.string()
        .nonempty({ message: "Name should not be empty." }),
    email: z.string()
        .nonempty({ message: "Email address should not be empty." })
        .email({ message: "Invalid email address." }),
    password: z.string()
        .nonempty({message: "Password should not be empty."})
        .min(8, { message: "Password should be at least 8 characters long." })
        .regex(/[a-zA-Z0-9]/, { message: "Password should be alphanumeric." }),
    confirmPassword: z.string()
        .nonempty({ message: "Password should not be empty." }),
}).refine(
        (data) => data.password === data.confirmPassword, {
            path: ["confirmPassword"],
            message: "Passwords must be matched."
});


const RegisterForm = () => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const submitForm = async (values: z.infer<typeof formSchema>) => {
        console.log("Registered successfully: ", values)
    }

    return (
        <>
            <div className="flex min-h-[60vh] h-full w-full items-center justify-center px-4">
                <Card className="mx-auto min-w-md max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">Register</CardTitle>
                        <CardDescription>Create a new account by filling out the form below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(submitForm)} className="space-y-8">
                                <div className="grid gap-4">
                                    {/* Name Field */}
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem className="grid gap-2">
                                            <FormLabel htmlFor="name">Full Name</FormLabel>
                                            <FormControl>
                                                <Input id="name" placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    {/* Email Field */}
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem className="grid gap-2">
                                            <FormLabel htmlFor="email">Email</FormLabel>
                                            <FormControl>
                                                <Input id="email" placeholder="johndoe@mail.com" autoComplete="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    {/* Password Field */}
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem className="grid gap-2">
                                            <FormLabel htmlFor="password">Password</FormLabel>
                                            <FormControl>
                                                <Input id="password" type="password" autoComplete="new-password"  {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    {/* Confirm Password Field */}
                                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                        <FormItem className="grid gap-2">
                                            <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input id="confirmPassword" type="password" autoComplete="new-password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />

                                    <Button type="submit" className="w-full">Create Account</Button>
                                    <div className="mt-4 text-center text-sm">
                                        Already have an account?{" "}
                                        <Link to="/login" className="underline">Login</Link>
                                    </div>
                                    
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    )
};

export default RegisterForm;