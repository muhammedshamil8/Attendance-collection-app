import React, { useEffect, useState } from 'react';
import { auth } from '@/config/firebase';
import { getAuth, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
// import { collection, doc, getDoc } from 'firebase/firestore';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { LoadingButton } from '@/components/ui/loading-button';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const formSchema = z.object({
    email: z.string().email({
        message: "Invalid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
})

const formSchemaRest = z.object({
    email: z.string().email({
        message: "Invalid email address.",
    }),
})

const SignIn: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    // const UserCollectionRef = collection(db, 'users');
    const [loading, setLoading] = useState(false);
    const [isNewUser, setIsNewUser] = useState(true);
    const [restForm, setRestForm] = useState(false);
    const [message, setMessage] = useState('');
    const [parent] = useAutoAnimate();


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const idTokenResult = await user.getIdTokenResult();
                const role = idTokenResult.claims.role;
                if (isNewUser) {
                    // New user signing in for the first time, don't show "Already signed in" message
                    setIsNewUser(false);
                } else {
                    // User is already signed in, show "Already signed in" message
                    // const userDocRef = doc(UserCollectionRef, user.uid);
                    // const userDocSnap = await getDoc(userDocRef);
                    // const role = userDocSnap.data()?.role;

                    if (form.getValues('email') === '' && form.getValues('password') === '') {
                        toast({
                            title: 'Already signed in',
                            description: 'You are already signed in',
                        });
                    }

                    if (role === 'admin') {
                        navigate('/dashboard');
                    } else if (role === 'user') {
                        navigate('/');
                    } else {
                        navigate('/contact');
                    }
                }
            }
        });
        return () => unsubscribe();
    }, [isNewUser]);

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
            password: "",
        },
    })
    const formRest = useForm<z.infer<typeof formSchemaRest>>({
        resolver: zodResolver(formSchemaRest),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmitReset(values: z.infer<typeof formSchemaRest>) {
        try {
            setLoading(true);
            const auth = getAuth();
            await sendPasswordResetEmail(auth, values.email)
                .then(() => {
                    toast({
                        variant: 'success',
                        title: 'Password reset email sent',
                        description: 'Check your email to reset your password',
                    });
                    setMessage('Check your email to reset your password');
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error('Error sending password reset email:', errorMessage);
                    console.error('Error code:', errorCode);
                });
        } catch (error: any) {
            console.error('Error sending password reset email:', error);
            toast({
                variant: 'destructive',
                title: 'Error sending password reset email',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            const idTokenResult = await user.getIdTokenResult();

            const role = idTokenResult.claims.role;

            // Get the user's role
            // const userDocRef = doc(collection(db, 'users'), user.uid);
            // const userDocSnap = await getDoc(userDocRef);
            // // console.log('userDocSnap', userDocSnap.data());
            // const role = userDocSnap.data()?.role;
            // localStorage.setItem('ID', user.uid);

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
        } finally {
            setLoading(false);
        }
    }

    const handleFilldata = () => {
        form.setValue('email', 'user@gmail.com');
        form.setValue('password', 'password');
    }

    const handleResetForm = () => {
        setRestForm(!restForm);
    }
    return (
        <div className='flex flex-col gap-10 justify-around items-center h-full min-h-[600px] max-h-screen '>


            <div className='text-center '>
                <h1 className='text-[35px] font-bold dark:text-white'>
                   Welcome!
                </h1>
                <p className='text-gray-600 -mt-2 text-sm dark:text-gray-300'>Sign to your account</p>
            </div>
            <div className='bg-slate-200 rounded-md py-3 px-6'>
                <p className='underline text-center'>For testing</p>
                <Button onClick={handleFilldata} className='w-full my-2 text-white font-semibold'>Click to Fill </Button>
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
                                        <p className='text-emerald-600 underline text-sm font-medium mt-1 cursor-pointer' onClick={handleResetForm}>Forgot password?</p>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <LoadingButton className='bg-emerald-600 font-bold mt-6 !text-white w-full transition-all ease-in-out hover:bg-emerald-700' loading={loading} type="submit">Login</LoadingButton>
                    </form>
                </Form>


            </div>
            <div className='text-center'>
                <h1 className='text-[32px] font-bold text-emerald-600'>
                    MARK !T
                </h1>
                <span className='text-[12px] dark:text-white'>By IEDC EMEA</span>
            </div>


            <p className='text-sm dark:text-white'>
                Don't have an account? <button onClick={handleContact} className='underline text-emerald-700'>contact admin</button>
            </p>

            <Dialog open={restForm} onOpenChange={handleResetForm}>
                <DialogContent >
                    <DialogHeader className='text-center mx-auto'>
                        <div ref={parent}>
                            <DialogTitle className='dark:text-white text-center'>Forgot Password</DialogTitle>
                            <DialogDescription>Enter your email address to reset your password</DialogDescription>
                            {message && <p className='text-emerald-500'>{message}</p>}
                        </div>

                    </DialogHeader>
                    <div>
                        <Form {...formRest}>
                            <form className="space-y-8" onSubmit={formRest.handleSubmit(onSubmitReset)}>
                                <FormField
                                    control={formRest.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" className='h-[50px]' placeholder="Email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <LoadingButton className='!bg-emerald-600 font-bold mt-6 !text-white w-full' loading={loading} type="submit">Reset Password</LoadingButton>
                                <p onClick={handleResetForm} className='w-full text-center'>
                                    <span className='underline dark:text-white cursor-pointer '>
                                        I remember my password
                                    </span>
                                </p>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default SignIn;
