import React, { useState, useEffect } from 'react';
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
import ErrorImg from "@/assets/error.svg"
import { useToast } from '@/components/ui/use-toast';
// import SuccessImg from "@/assets/succes.svg"

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

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
import { useAutoAnimate } from '@formkit/auto-animate/react'

const formSchema = z.object({
    email: z.string().optional(),
    subject: z.string().nonempty({ message: 'Subject is required' }),
    message: z.string().nonempty({ message: 'Message is required' }),
})


const Contact: React.FC = () => {
    const [email, setEmail] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const { toast } = useToast();
    const [parent] = useAutoAnimate({});
    const APIURL = import.meta.env.VITE_API_URL;
    const [token, setToken] = useState('');


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setEmail(user.email ? user.email : '')
                user.getIdToken().then((idToken) => {
                    setToken(idToken);
                });
            }
        });

        return unsubscribe;
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: email,
            subject: '',
            message: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await fetch(`${APIURL}/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(values),
            });
            setShowDialog(true);
            if (response.ok) {
                setDone(true);
                toast({
                    variant: 'success',
                    title: 'Message Sent',
                    description: 'Your message has been sent successfully',
                    duration: 2000,
                });
                form.reset();
            } else {
                setDone(false);
                toast({
                    variant: 'destructive',
                    title: 'Message Not Sent',
                    description: 'Your message could not be sent. Please try again later',
                    duration: 2000,
                });
            }
        } catch (error: any) {
            setDone(false);
            toast({
                variant: 'destructive',
                title: 'Message Not Sent',
                description: 'Your message could not be sent. Please try again later',
                duration: 2000,
            });
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDialogClose = () => {
        setShowDialog(false);
    };

    const handleClear = () => {
        form.reset()
    }

    const Subjects = [
        'Issue Facing',
        'Bug detected',
        'Feature Request',
        'Feedback',
        'Suggestion',
        'Other'
    ]

    return (
        <div className='flex flex-col gap-10 justify-start items-center  min-h-screen pt-20'>
            <div className='text-center '>
                <h1 className='text-[35px] font-bold dark:text-white'>
                    Connect with us
                </h1>
                <p className='text-gray-600 -mt-2 text-sm dark:text-gray-300'>
                    Send us a message and we will get back to you
                </p>
            </div>
            <div className='flex flex-col gap-5 w-full max-w-[340px] mt-10'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            disabled
                            render={({ field }) => (
                                <FormItem ref={parent}>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input className='h-[50px]' placeholder="Email" {...field}
                                            value={email}
                                        />
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
                            name="subject"
                            render={({ field }) => (
                                <FormItem ref={parent}>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange} defaultValue={field.value}
                                        >
                                            <SelectTrigger className="w-full  h-[50px] border dark:border-slate-900 focus:border-emerald-400 dark:focus:border-emerald-400">
                                                <SelectValue placeholder="Subject..."
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Subjects.map((item, index) => (
                                                    <SelectItem key={index} value={item}>{item}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                            name="message"
                            render={({ field }) => (
                                <FormItem ref={parent}>
                                    <FormLabel>Your Message</FormLabel>
                                    <FormControl>
                                        <Textarea className='dark:text-white border dark:border-slate-900 focus:border-emerald-400 dark:focus:border-emerald-400 p-3' placeholder="Type your message here..." {...field} />
                                    </FormControl>
                                    {/* <FormDescription>
                                        This is your public display name.
                                    </FormDescription> */}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='flex gap-2 items-center justify-end'>
                            <Button className='!bg-slate-200 font-bold mt-6 !text-emerald-600 min-w-[120px]' onClick={handleClear}>Clear</Button>
                            <Button type="submit" className='!bg-emerald-600 font-bold mt-6 !text-white min-w-[120px]'>Submit</Button>
                        </div>
                    </form>
                </Form>
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
