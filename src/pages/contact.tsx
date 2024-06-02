import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useAutoAnimate } from '@formkit/auto-animate/react';
import Stepper from '@/components/Stepper';
import ErrorImg from "@/assets/error.svg";
import SuccessImg from "@/assets/succes.svg";
import { LoadingButton } from '@/components/ui/loading-button';


const FormSchemacode = z.object({
    code: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
})


const Contact: React.FC = () => {
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [Submitloading, setSubmitLoading] = useState(false);
    const [SubmitCodeLoading, setSubmitCodeLoading] = useState(false);
    const [done, setDone] = useState(false);
    const { toast } = useToast();
    const [parent] = useAutoAnimate({});
    const [AccReq, setAccReq] = useState(false);
    const APIURL = import.meta.env.VITE_API_URL;
    const [currentStep, setCurrentStep] = useState(0);
    const steps = ['Step 1', 'Step 2'];
    const [codeSent, setCodeSented] = useState(false);
    const [emailid, setEmailid] = useState('');

    const formSchema = z.object({
        email: z.string().email({ message: 'Invalid email address' }),
        subject: z.string().nonempty({ message: 'Subject is required' }),
        message: z.string().nonempty({ message: 'Message is required' }),
        team_name: AccReq ? z.string().nonempty({ message: 'Team Name is required' }).min(3, { message: 'Team Name must be at least 3 characters' }) : z.string().optional(),
        password: AccReq ? z.string().min(6, { message: 'Password must be at least 6 characters' }) : z.string().optional(),
        Nodal_Officer: AccReq ? z.string().nonempty({ message: 'Head name required' }) : z.string().optional(),
        phone_number: z.string().regex(/^\d{10}$/, { message: 'Phone number must be 10 digits and only contain numbers' }).optional(),
        contact_number: z.string().regex(/^\d{10}$/, { message: 'Contact number must be 10 digits and only contain numbers' }).optional(),
    });

    const formcode = useForm<z.infer<typeof FormSchemacode>>({
        resolver: zodResolver(FormSchemacode),
        defaultValues: {
            code: "",
        },
    })
    //  Handle the Verify Code form submission
    function onSubmitCode(data: z.infer<typeof FormSchemacode>) {
        setSubmitCodeLoading(true);
        try {

            // toast({
            //     title: "You submitted the following values:",
            //     description: (
            //         <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            //             <code className="text-white">{JSON.stringify(data, null, 2)}</code>
            //         </pre>
            //     ),
            // })
            if (data.code) {
                handleVerifyCode(data.code);
            }
        } catch (error: any) {
            setSubmitCodeLoading(false);
            toast({
                variant: 'destructive',
                title: 'Message Not Sent',
                description: 'Your message could not be sent. Please try again later',
                duration: 2000,
            });
            console.error(error);
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        // resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            subject: '',
            message: '',
            team_name: '',
            password: '',
            Nodal_Officer: '',
            phone_number: '',
            contact_number: '',
        },
    });
    // Handle the form submission
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setSubmitLoading(true);
        // console.log(values);
        try {
            if (values.subject === 'Account Request') {
                handleAccountRequest(values);
            } else {
                handleContact(values);
            }
        } catch (error: any) {
            setDone(false);
            toast({
                variant: 'destructive',
                title: 'Message Not Sent',
                description: 'Your message could not be sent. Please try again later',
                duration: 2000,
            });
            setSubmitLoading(false);
            console.error(error);
        }
    }


    //  Call the API to send the verification email
    const handleAccountRequest = async (values: z.infer<typeof formSchema>) => {
        try {
            if (values.email === '' || values.subject === '' || values.message === '' || values.team_name === '' || values.password === '' || values.Nodal_Officer === '') {
                toast({
                    variant: 'destructive',
                    title: 'Message Not Sent',
                    description: 'Please fill all the required fields',
                    duration: 2000,
                });
                setSubmitLoading(false);
                return;
            } else if (values.phone_number === '' || values.phone_number?.length !== 10 || Number.isNaN(Number(values.phone_number))) {
                toast({
                    variant: 'destructive',
                    title: 'Message Not Sent',
                    description: 'Please enter a valid phone number',
                })
                setSubmitLoading(false);
                return;
            } else if (values.contact_number && values.contact_number?.length !== 10) {
                toast({
                    variant: 'destructive',
                    title: 'Message Not Sent',
                    description: 'Please enter a valid contact number',
                })
                setSubmitLoading(false);
                return;
            } else {
                setShowDialog(true);
            }
            // console.log(values);
            setEmailid(values.email);
            // Send verification email if it's an account request
            const response = await fetch(`${APIURL}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    Verification: 'pending',
                    createdAt: new Date().toISOString(),
                }),
            });

            const data = await response.json();
            if (data) {
                // console.log(data);
            }

            if (response.ok) {
                setLoading(false);
                setSubmitLoading(false);
                setCodeSented(true);
                toast({
                    variant: 'success',
                    title: 'Verification Email Sent',
                    description: 'A verification code has been sent to your email. Please check your email and verify your account.',
                    duration: 2000,
                });
            } else {
                setLoading(false);
                setSubmitLoading(false);
                toast({
                    variant: 'destructive',
                    title: 'Account Request Not Sent',
                    description: 'Your account request could not be sent. Please try again later',
                    duration: 2000,
                });
            }
        } catch (error) {
            setDone(false);
            setLoading(false);
            setSubmitLoading(false);
            console.error(error);
        }
    }
    //  Call the API to verify the code
    const handleVerifyCode = async (code: string) => {
        try {
            if (code === '') {
                toast({
                    variant: 'destructive',
                    title: 'Message Not Sent',
                    description: 'Please fill all the required fields',
                    duration: 2000,
                });
                setSubmitCodeLoading(false);
                return;
            } else if (emailid === '') {
                toast({
                    variant: 'destructive',
                    title: 'Message Not Sent',
                    description: 'Please fill all the required fields',
                    duration: 2000,
                });
                setSubmitCodeLoading(false);
                return;
            }
            const result = await fetch(`${APIURL}/auth/verify-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verificationCode: code,
                    email: emailid
                }),
            });
            const data = await result.json();
            if (data) {
                // console.log(data);
            }
            if (result.ok) {
                setSubmitCodeLoading(false);
                setDone(true);
                toast({
                    variant: 'success',
                    title: 'Account Request Sented',
                    description: 'Your account request has been sent successfully. Please wait for the admin to verify your account.',
                    duration: 2000,
                });
                setDone(false);
                setCodeSented(false);
                setTimeout(() => {
                    handleDialogClose();
                }, 5000);
            } else {
                setSubmitCodeLoading(false);
                toast({
                    variant: 'destructive',
                    title: 'The code is invalid',
                    description: 'Please enter the correct code sent to your email.',
                    duration: 2000,
                });
            }
        } catch (error) {
            setSubmitCodeLoading(false);
            console.error(error);
        }
    }

    // Call the API to send the contact message
    const handleContact = async (values: z.infer<typeof formSchema>) => {
        try {
            if (values.email === '' || values.subject === '' || values.message === '') {
                toast({
                    variant: 'destructive',
                    title: 'Message Not Sent',
                    description: 'Please fill all the required fields',
                    duration: 2000,
                });
                setSubmitLoading(false);

                return;
            }
            setShowDialog(true);
            const response = await fetch(`${APIURL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });
            if (response.ok) {
                setSubmitLoading(false);

                setLoading(false);
                setDone(true);
                toast({
                    variant: 'success',
                    title: 'Message Sent',
                    description: 'Your message has been sent successfully',
                    duration: 2000,
                });
                form.reset();
            } else {
                setSubmitLoading(false);

                setLoading(false);
                setDone(false);
                toast({
                    variant: 'destructive',
                    title: 'Message Not Sent',
                    description: 'Your message could not be sent. Please try again later',
                    duration: 2000,
                });
            }
            form.reset();
        } catch (error) {
            setSubmitLoading(false);

            setLoading(false);
            toast({
                variant: 'destructive',
                title: 'Message Not Sent',
                description: 'Your message could not be sent. Please try again later',
                duration: 2000,
            });
            console.error(error);
        }
    }


    const Subjects = [
        'Issue Facing',
        'Bug detected',
        'Feature Request',
        'Feedback',
        'Suggestion',
        'Account Request',
        'Other'
    ];
    // Handle the dialog close
    const handleDialogClose = () => {
        form.setValue('subject', '');
        setCurrentStep(0);
        form.reset();
        formcode.reset();
        setDone(false);
        setCodeSented(false);
        setLoading(true);
        setShowDialog(false);
    };
    const handleClear = () => {
        form.reset();
    };

    useEffect(() => {
        if (form.watch('subject') === 'Account Request') {
            setAccReq(true);
        } else {
            setAccReq(false);
        }
    }, [form.watch('subject')]);

    return (
        <div className='flex flex-col gap-10 justify-start items-center  min-h-screen pt-10 '>
            <div className='text-center '>
                <h1 className='text-[30px] font-bold dark:text-white'>
                    Send your request
                </h1>
                <p className='text-gray-600 -mt-2 text-sm dark:text-gray-300'>Send account request to admin</p>
            </div>
            <div className='flex flex-col gap-5 w-full max-w-[340px] mt-4 min-h-fit' ref={parent}>
                {AccReq &&
                    <Stepper steps={steps} currentStep={currentStep} />}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" ref={parent}>
                        {currentStep < steps.length - 1 && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem ref={parent}>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input className='h-[50px]' placeholder="Email" {...field}
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
                                {AccReq && AccReq ? (
                                    <div className='flex gap-2 items-center justify-end'>
                                        <Button
                                            type='button'
                                            className="bg-emerald-600 text-white px-4 py-2 rounded min-w-[120px] "
                                            onClick={() => setCurrentStep(currentStep + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                ) : (
                                    <div className='flex gap-2 items-center justify-end'>
                                        <Button className='!bg-slate-200 font-bold mt-6 !text-emerald-600 min-w-[120px]' onClick={handleClear}>Clear</Button>
                                        <LoadingButton type="submit" className='bg-emerald-600 font-bold mt-6 !text-white min-w-[120px] transition-all ease-in-out hover:bg-emerald-700' loading={Submitloading}>Submit</LoadingButton>
                                    </div>
                                )
                                }
                            </>
                        )}
                        {currentStep > 0 && (

                            <>
                                {AccReq && (
                                    <>
                                        <FormField
                                            control={form.control}
                                            name="team_name"
                                            render={({ field }) => (
                                                <FormItem ref={parent}>
                                                    <FormLabel>Team Name</FormLabel>
                                                    <FormControl>
                                                        <Input className='h-[50px]' placeholder="Team Name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="Nodal_Officer"
                                            render={({ field }) => (
                                                <FormItem ref={parent}>
                                                    <FormLabel>Nodal Officer</FormLabel>
                                                    <FormControl>
                                                        <Input className='h-[50px]' placeholder="Nodal Officer" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone_number"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input className='h-[50px]' placeholder="Phone Number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="contact_number"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contact Number</FormLabel>
                                                    <FormControl>
                                                        <Input className='h-[50px]' placeholder="Contact Number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem ref={parent}>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input className='h-[50px]' placeholder="Password" type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}

                                <div className='flex gap-2 items-center justify-between'>
                                    <Button type='button' className='bg-gray-500 text-white px-4 py-2 rounded ml-2 min-w-[120px]' onClick={() => setCurrentStep(currentStep - 1)}>Previous</Button>
                                    <LoadingButton type="submit" className='bg-emerald-600 font-bold px-4 py-2 !text-white min-w-[120px] transition-all ease-in-out hover:bg-emerald-700' loading={Submitloading}>Submit</LoadingButton>
                                </div>
                            </>
                        )}



                    </form>
                </Form>
            </div>

            <Dialog open={showDialog} onOpenChange={handleDialogClose} >
                <DialogContent className='min-h-[300px]'>
                    {loading && loading ? (
                        <DialogHeader>
                            <DialogTitle className='text-center dark:text-white'>
                                Loading...
                            </DialogTitle>
                            <DialogDescription className='text-center dark:text-white'>
                                Sending your message...
                            </DialogDescription>
                        </DialogHeader>
                    ) : (
                        <>
                            {codeSent && codeSent ? (
                                <div className='flex items-center justify-center flex-col'>
                                    <DialogHeader>
                                        <DialogTitle className='dark:text-white text-xl text-center my-2'>
                                            Verify Your Account
                                        </DialogTitle>
                                        <DialogDescription>
                                            A verification code has been sent to your email. Please check your email and verify your account.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Form {...formcode}>
                                        <form onSubmit={formcode.handleSubmit(onSubmitCode)} className="w-2/3 space-y-6 flex flex-col items-center justify-center my-4">
                                            <FormField
                                                control={formcode.control}
                                                name="code"
                                                render={({ field }) => (
                                                    <FormItem >
                                                        <FormLabel className='text-center w-full'>One-Time Password</FormLabel>
                                                        <FormControl className='mx-auto flex'>
                                                            <InputOTP maxLength={6} {...field} className='mx-auto flex'>
                                                                <InputOTPGroup className='mx-auto flex dark:text-white'>
                                                                    <InputOTPSlot index={0} />
                                                                    <InputOTPSlot index={1} />
                                                                    <InputOTPSlot index={2} />
                                                                    <InputOTPSlot index={3} />
                                                                    <InputOTPSlot index={4} />
                                                                    <InputOTPSlot index={5} />
                                                                </InputOTPGroup>
                                                            </InputOTP>
                                                        </FormControl>
                                                        <FormDescription>
                                                            Please enter the one-time password sent to your email.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <LoadingButton type="submit" className='bg-emerald-600 font-bold  !text-white w-full transition-all ease-in-out hover:bg-emerald-700' loading={SubmitCodeLoading}>Verify</LoadingButton>
                                        </form>
                                    </Form>
                                </div>
                            ) : (
                                <>
                                    {done && done ? (
                                        <DialogHeader>
                                            <DialogTitle>
                                                <img src={SuccessImg} alt="delete" className="w-36 h-36 mx-auto mt-4" />
                                            </DialogTitle>
                                            <DialogDescription className='text-center'>
                                                Submit Successfully
                                            </DialogDescription>
                                            <DialogFooter>
                                                <Button onClick={handleDialogClose} className='!bg-emerald-600 font-bold mt-6 !text-white w-fit mx-auto h-[30px] px-10'>Done</Button>
                                            </DialogFooter>
                                        </DialogHeader>
                                    ) : (
                                        <DialogHeader>
                                            <DialogTitle>
                                                <img src={ErrorImg} alt="delete" className="w-36 h-36 mx-auto mt-4" />
                                            </DialogTitle>
                                            <DialogDescription className='text-center'>
                                                Submission failed. Please try again later.
                                            </DialogDescription>
                                            <DialogFooter>
                                                <Button onClick={handleDialogClose} className='!bg-red-600 font-bold mt-6 !text-white w-fit mx-auto h-[30px] px-10'>oops!</Button>
                                            </DialogFooter>
                                        </DialogHeader>
                                    )}
                                </>
                            )}

                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default Contact;
