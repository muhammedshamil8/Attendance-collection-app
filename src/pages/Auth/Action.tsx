import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import ErrorImg from "@/assets/error.svg";
import SuccessImg from "@/assets/succes.svg";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Action: React.FC = () => {
    const [status, setStatus] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [oobCode, setOobCode] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [done, setDone] = useState<boolean>(false);
    const query = useQuery();
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        const mode = query.get('mode');
        const oobCode = query.get('oobCode');
        // console.log(mode);
        // console.log(oobCode);
        // console.log(query);
        if (mode && oobCode) {
            handleAction(mode, oobCode);
        } else {
            setStatus('Invalid action link.');
        }
    }, [auth, query]);

    const handleAction = async (mode: string, oobCode: string) => {
        setOobCode(oobCode);
        switch (mode) {
            case 'resetPassword':
                try {
                    await verifyPasswordResetCode(auth, oobCode);
                    setStatus('Please enter your new password.');
                } catch (error) {
                    setStatus(`Error verifying reset code: ${(error as Error).message}`);
                }
                break;
            case 'verifyEmail':
                try {
                    await applyActionCode(auth, oobCode);
                    setStatus('Email verified successfully!');
                    setTimeout(() => {
                        navigate('/signin');
                    }, 3000);
                } catch (error) {
                    setStatus(`Error verifying email: ${(error as Error).message}`);
                }
                break;
            case 'recoverEmail':
                try {
                    await applyActionCode(auth, oobCode);
                    setStatus('Email recovery successful!');
                    setTimeout(() => {
                        navigate('/signin');
                    }, 3000);
                } catch (error) {
                    setStatus(`Error recovering email: ${(error as Error).message}`);
                }
                break;
            default:
                setStatus('Invalid action.');
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            setStatus('Please enter your new password.');
            return;
        } else if (newPassword.length < 6) {
            setStatus('Password must be at least 6 characters.');
            return;
        } else if (newPassword !== confirmPassword) {
            setStatus('Passwords do not match.');
            return;
        }
        if (oobCode) {
            try {
                await confirmPasswordReset(auth, oobCode, newPassword);
                setStatus('Password reset successfully!');
                setTimeout(() => {
                    navigate('/signin');
                }, 3000);
            } catch (error) {
                setStatus(`Error resetting password: ${(error as Error).message}`);
            }
        }
    };

    const handleDialogClose = () => {
        setShowDialog(false);
    };

    return (
        <div className='flex flex-col gap-10 justify-start items-center min-h-screen pt-10 dark:text-white'>
            <h1>Action Handler</h1>
            {status ? <p>{status}</p> : <p>Processing your request...</p>}
            {status === 'Please enter your new password.' && (
                <div className='w-ful'>
                    <h1 className='text-center py-4 font-semibold text-2xl'>Reset Your Password</h1>
                    <form onSubmit={handlePasswordReset} className='max-w-[360px] mx-auto space-y-4 py-10'>
                        <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                required
                                className='w-full h-[50px] my-2'
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id='confirmPassword'
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                required
                                className='w-full h-[50px] my-2'
                            />
                        </div>
                        <Button type="submit" className='w-full'>Reset Password</Button>
                    </form>

                </div>
            )}


            <Dialog open={showDialog} onOpenChange={handleDialogClose} >
                <DialogContent className='min-h-[300px] flex flex-col items-center justify-center text-center'>
                    {loading && loading ? (
                        <DialogHeader>
                            <DialogTitle>
                                Loading...
                            </DialogTitle>
                            <DialogDescription>
                                Sending your message...
                            </DialogDescription>
                        </DialogHeader>
                    ) : (
                        <>
                            {done && done ? (
                                <DialogHeader>
                                    <img src={SuccessImg} alt="delete" className="w-36 h-36 mx-auto mt-4" />
                                    <DialogDescription>
                                        Submission Successful
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
                                    <DialogDescription>
                                        Submission Error
                                    </DialogDescription>
                                    <DialogFooter>
                                        <Button onClick={handleDialogClose} className='!bg-red-600 font-bold mt-6 !text-white w-fit mx-auto h-[30px] px-10'>oops!</Button>
                                    </DialogFooter>
                                </DialogHeader>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default Action;