import { Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { FormLabel } from "../ui/form";
import { Input } from "../ui/input";


const formSchema = z.object({
    email: z.string()
        .nonempty({ message: "Email address should not be empty." })
        .email({ message: "Invalid email address." }),
    password: z.string()
        .nonempty({message: "Password should not be empty."})
        .min(8, { message: "Password should be at least 8 characters long." })
        .regex(/[a-zA-Z0-9]/, { message: "Password should be alphanumeric." }),
});

const LoginForm = () => {

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const submitForm = async (values: z.infer<typeof formSchema>) => {
        console.log("Submit Login: ", values)
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
                                    <Button type="submit" className="w-full">Login</Button>
                                    <Button variant="outline" className="w-full">
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