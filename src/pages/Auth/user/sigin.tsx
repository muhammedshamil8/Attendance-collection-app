import React, { useEffect, useState } from 'react';
import { auth, db } from '@/config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
    email: z.string().email({
        message: "Invalid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
})

const SignIn: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const UserCollectionRef = collection(db, 'users');
    const [newLogin, setNewLogin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (!newLogin) {
                    toast({
                        title: 'Already signed in',
                        description: 'You are already signed in',
                    });
                    const userDocRef = doc(UserCollectionRef, user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    const role = userDocSnap.data()?.role;
    
                    if (role === 'admin') {
                        navigate('/dashboard');
                    } else if (role === 'user') {
                        navigate('/');
                    }
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const handleContact = () => {
        navigate('/contact');
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "password",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setNewLogin(true);
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            // Get the user's role
            const userDocRef = doc(collection(db, 'users'), user.uid);
            const userDocSnap = await getDoc(userDocRef);
            // console.log('userDocSnap', userDocSnap.data());
            const role = userDocSnap.data()?.role;
            localStorage.setItem('ID', user.uid);

            // Verify the user's role
            if (role === 'admin') {
                // Grant access to admin features
                // console.log('Admin signed in:', user);
                toast({
                    variant: 'destructive',
                    title: 'User login session',
                    description: 'Admin can only login to admin dashboard',
                });
                await signOut(auth);
                navigate('/admin/login');
            } else if (role === 'user') {
                // Grant access to user features
                // console.log('User signed in:', user);
                toast({
                    variant: 'success',
                    title: 'Signed in',
                    description: 'You have successfully signed in',
                    duration: 2000,
                });
                navigate('/');
            } else {
                // Handle unknown role
                // console.error('Unknown role:', user);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Unknown role',
                    duration: 2000,
                });
                navigate('/contact');
            }
        } catch (error: any) {
            console.error('Error signing in:', error);
            toast({
                variant: 'destructive',
                title: 'Error signing in',
                description: error.message,
                duration: 2000,
            });
        }
    }

    return (
        <div className='flex flex-col gap-10 justify-around items-center h-full min-h-[600px] max-h-screen '>


            <div className='text-center '>
                <h1 className='text-[35px] font-bold dark:text-white'>
                    Welcome!
                </h1>
                <p className='text-gray-600 -mt-2 text-sm dark:text-gray-300'>Sign to your account</p>
            </div>
            <div className='flex flex-col gap-5 w-full max-w-[320px]'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel >Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" className='h-[50px]' placeholder="Email" {...field} />
                                    </FormControl>
                                    {/* <FormDescription>
                                        This is your public display name.
                                    </FormDescription> */}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className='relative'>
                                            <Input type={showPassword ? 'text' : 'password'} className='h-[50px]' placeholder="Password" {...field} />
                                            <div className='absolute right-4 top-4 cursor-pointer dark:text-white' onClick={toggleShowPassword}>
                                                {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    <div>
                                        <p className='text-emerald-600 underline text-sm font-medium mt-1'>Forgot password?</p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className='!bg-emerald-600 font-bold mt-6 !text-white w-full'>Login</Button>

                    </form>
                </Form>
            </div>

            <p className='text-sm dark:text-white'>
                Don't have an account? <button onClick={handleContact} className='underline text-emerald-700'>contact admin</button>
            </p>

        </div>
    );
};

export default SignIn;
