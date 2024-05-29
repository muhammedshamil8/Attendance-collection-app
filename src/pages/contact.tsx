import React, { useState } from 'react';
// import { auth } from '@/config/firebase';
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
} from "@/components/ui/dialog"
import  ErrorImg  from "@/assets/error.svg"
import { useToast } from '@/components/ui/use-toast';
// import SuccessImg from "@/assets/succes.svg"



const Contact: React.FC = () => {
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    // const [password, setPassword] = useState('');
    // const [showPassword, setShowPassword] = useState(false);
    // const [error, setError] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const { toast } = useToast();

    // function isValidEmail(email: string): boolean {
    //     // Regular expression pattern for validating email addresses
    //     const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     return pattern.test(email);
    // }

    // const handleSignIn = async () => {
    //     if (!email || !password) return setError('Email and password required');
    //     if (password.length < 6) return setError('Password must be at least 6 characters');
    //     if (!isValidEmail(email)) return setError('Invalid email address');
    //     try {
    //         await signInWithEmailAndPassword(auth, email, password);
    //         setError('Signed in');
    //     } catch (error: any) {
    //         setError(error.message);
    //     }
    // };

    // const handleSignUp = async () => {
    //     setShowDialog(true);
    //     if (!email || !password) return setError('Email and password required');
    //     if (password.length < 6) return setError('Password must be at least 6 characters');
    //     if (!isValidEmail(email)) return setError('Invalid email address');

    //     try {
    //         await createUserWithEmailAndPassword(auth, email, password);
    //         setError('Account created');
    //     } catch (error: any) {
    //         setError(error.message);
    //     }
    // };

    // const handleSignOut = async () => {
    //     try {
    //         await signOut(auth);
    //         setError('Signed out');
    //     } catch (error: any) {
    //         setError(error.message);
    //     }
    // }

    // const handleContact = () => {
    //     setError('Contact admin');
    // }

    // const toggleShowPassword = () => {
    //     setShowPassword(!showPassword);
    // };
    const handleDialogClose = () => {
        setShowDialog(false);
      };

      const handleClick = () => {
        toast({
            title: 'Feature not available',
            description: 'This feature is not available at the moment',
            duration: 2000,
        });
    }
    const handleClear = () => {
        setEmail('')
        setCategory('')
        setMessage('')
    }

    return (
        <div className='flex flex-col gap-10 justify-around items-center h-full min-h-[600px] max-h-screen '>
            <div className='text-center '>
                <h1 className='text-[30px] font-bold dark:text-white'>
                    Send your request
                </h1>
                <p className='text-gray-600 -mt-2 text-sm dark:text-gray-300'>Send to your account request</p>
            </div>
            <div className='flex flex-col gap-5 w-full max-w-[340px]'>
                <div>
                    <label htmlFor="email" className='font-semibold text-sm dark:text-white'>Email</label>
                    <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className='h-[50px]' />
                </div>

                <div>
                    <label htmlFor="password" className='font-semibold text-sm dark:text-white'>Select Category</label>
                    <Select 
                    value={category}
                    onValueChange={(value) => setCategory(value)}>
                        <SelectTrigger className="w-full  h-[50px] border dark:border-slate-900 focus:border-emerald-400 dark:focus:border-emerald-400">
                            <SelectValue placeholder="Your Category" 
                             />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Club</SelectItem>
                            <SelectItem value="dark">Union</SelectItem>
                            <SelectItem value="system">Department</SelectItem>
                        </SelectContent>
                    </Select>

                </div>
                <div>
                    <label htmlFor="message" className='font-semibold text-sm dark:text-white'>Your Message</label>
                    <Textarea placeholder="Type your message here..." className='dark:text-white border dark:border-slate-900 focus:border-emerald-400 dark:focus:border-emerald-400 p-3' 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}/>
                </div>
                <div className='flex gap-2 items-center justify-end'>
                    <Button  className='!bg-slate-200 font-bold mt-6 !text-emerald-600 min-w-[120px]' onClick={handleClear}>Clear</Button>
                    <Button onClick={handleClick} className='!bg-emerald-600 font-bold mt-6 !text-white min-w-[120px]'>Submit</Button>
                </div>

            </div>

            <Dialog open={showDialog} onOpenChange={handleDialogClose}>
                <DialogContent>
                    <DialogHeader>
                        {/* <DialogTitle>Are you absolutely sure?</DialogTitle> */}
                        <img src={ErrorImg} alt="delete" className="w-36 h-36 mx-auto mt-4" />
                        {/* <img src={SuccessImg} alt="delete" className="w-36 h-36 mx-auto mt-4" /> */}
                        <DialogDescription>
                            Submission Error
                        </DialogDescription>
                        <DialogFooter>
                            <Button onClick={handleDialogClose} className='!bg-red-600 font-bold mt-6 !text-white w-fit mx-auto h-[30px] px-10'>oops!</Button>
                        </DialogFooter>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Contact;
