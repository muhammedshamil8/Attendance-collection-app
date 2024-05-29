import React, { useState , useEffect } from 'react';
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

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';


const Contact: React.FC = () => {
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setEmail(user.email ? user.email : '')
            } 
        });

        return unsubscribe;
    }, []);
    
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
        setSubject('')
        setMessage('')
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
                <div>
                    <label htmlFor="email" className='font-semibold text-sm dark:text-white'>Email</label>
                    <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className='h-[50px]' />
                </div>

                <div>
                    <label htmlFor="subject" className='font-semibold text-sm dark:text-white'>
                        Select Subject
                    </label>
                    <Select 
                    value={subject}
                    onValueChange={(value) => setSubject(value)}>
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
