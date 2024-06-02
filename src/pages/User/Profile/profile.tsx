import { auth, db } from '@/config/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
// import { FaRegUser } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useToast } from '@/components/ui/use-toast';
import { Edit } from 'lucide-react';
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from '@/components/ui/loading-button';
import UserImage from '@/assets/user.jpg';
interface FormDataType {
    email: string;
    team_name: string;
    Nodal_Officer: string;
}


const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [user1, setUser1] = useState<any>(null);
    const [, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [updatePass, setUpdatePass] = useState(false);
    const [edit, setEdit] = useState(false);
    const Navigate = useNavigate();
    const [parent] = useAutoAnimate({});
    const { toast } = useToast();
    const [token, setToken] = useState<string | null>(null);
    const APIURL = import.meta.env.VITE_API_URL;
    const [Submitloading, setSubmitLoading] = useState(false);
    const [submitPassLoading, setSubmitPassLoading] = useState(false);

    // form state for profile
    const [formState, setFormState] = useState<FormDataType>({
        email: user?.email || '',
        team_name: user?.team_name || '',
        Nodal_Officer: user?.Nodal_Officer || '',
    });
    // form state for password
    const [formStatePass, setFormStatePass] = useState({
        // oldPass: '',
        newPass: '',
        confirmPass: '',
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser1(user);
                setUser(user);
                user.getIdToken().then((idToken) => {
                    setToken(idToken);
                }
                );
            } else {
                setUser(null);
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        fetchUser();
    }, [user]);

    const fetchUser = async () => {
        if (!user) return;
        try {
            const userDataRef = doc(db, 'users', user.uid);
            const userData = await getDoc(userDataRef);
            const userDataData = userData.data();
            if (userDataData) {
                const { team_name, email, Nodal_Officer, status } = userDataData;
                setUser({
                    team_name,
                    email,
                    Nodal_Officer,
                    status,
                });
                setFormState({
                    email: userDataData?.email || '',
                    team_name: userDataData?.team_name || '',
                    Nodal_Officer: userDataData?.Nodal_Officer || '',
                })
            } else {
                setError('Failed to fetch user data');
            }
        } catch (error) {
            setError('Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    };

    async function onSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        // console.log(formState);
        e.preventDefault();
        if (!token) return;
        setSubmitLoading(true);
        if (!formState.email || !formState.team_name || !formState.Nodal_Officer) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill all the fields',
            })
            setSubmitLoading(false);
            return;
        }
        try {
            const response = await fetch(`${APIURL}/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formState),
            });
            if (response.ok) {
                toast({
                    variant: 'success',
                    title: 'Success',
                    description: 'Profile updated successfully'
                });
                fetchUser();
                setSubmitLoading(false);
            } else {
                setError('Failed to update profile');
                setSubmitLoading(false);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to update profile'
                });
            }
        } catch (error) {
            setSubmitLoading(false);
            setError('Failed to update profile');
        }
    }

    async function onUpdatePass(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (!token) return;
        setSubmitPassLoading(true);
        if (!formStatePass.newPass || !formStatePass.confirmPass) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill all the fields',
            })
            setSubmitPassLoading(false);
            return;
        } else if (formStatePass.newPass.length < 6) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Password must be at least 6 characters',
            })
            setSubmitPassLoading(false);
            return;
        } else if (formStatePass.newPass !== formStatePass.confirmPass) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'New Password and Confirm Password does not match',
            })
            setSubmitPassLoading(false);
            return;
        }
        //  else if (formStatePass.oldPass === formStatePass.newPass) {
        //     toast({
        //         variant: 'destructive',
        //         title: 'Error',
        //         description: 'New password must be different from old password',
        //     })
        //     return;
        // }
        try {
            const response = await fetch(`${APIURL}/update-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    // oldPassword: formStatePass.oldPass,
                    newPassword: formStatePass.newPass,
                }),
            });
            if (response.ok) {
                toast({
                    variant: 'success',
                    title: 'Success',
                    description: 'Password updated successfully'
                });
                setSubmitPassLoading(false);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to update password'
                });
                setSubmitPassLoading(false);
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message
            });
            setSubmitPassLoading(false);
        }
    }

    const handleUpdatePass = () => {
        setUpdatePass(!updatePass);
    }
    const handleEdit = () => {
        setEdit(!edit);
        setFormState({
            email: user?.email || '',
            team_name: user?.team_name || '',
            Nodal_Officer: user?.Nodal_Officer || '',

        })
    }

    return (
        <div className="flex flex-col items-center justify-start mt-20 min-h-screen ">
            {loading && loading ? (
                <div className="bg-slate-300 animate-pulse h-[460px] w-[360px]  rounded-lg shadow-md p-8" />
            ) : (
                <div className=" rounded-2xl p-8 min-w-[360px] overflow-hidden relative">
                    <div className="absolute top-[120px] right-6 z-20 cursor-pointer" onClick={handleEdit}  >
                        <Edit />
                    </div>
                    <div className='absolute top-[120px] z-20 left-6 '>
                        <Badge variant={'active'} style={{ overflowWrap: 'anywhere' }}> {user?.status ? 'active' : 'status'}</Badge>
                    </div>
                    <div className="flex items-center justify-center mb-4">
                        <Avatar className='h-40 w-40 z-20 border-2 border-slate-200 dark:border-slate-900 '>
                            {user1.photoURL ? (
                                <AvatarImage src={user1.photoURL} alt="Profile Avatar" className="w-16 h-16 rounded-full  " />
                            ) : (
                                <AvatarFallback>
                                    {/* <FaRegUser className='w-16 h-16 dark:text-white' /> */}
                                    <img src={UserImage} className='object-cover w-full h-full' alt='user' />
                                </AvatarFallback>
                            )}
                        </Avatar>
                    </div>
                    <div className='bg-white absolute bottom-0 top-[100px] left-0 right-0 rounded-t-[60px]' />
                    <div className='flex flex-col w-full  ' ref={parent}>
                        <p>

                            <Input
                                type="text"
                                placeholder="Enter Team Name"
                                className={`font-bold mb-2 dark:bg-slate-100 dark:text-black h-[50px] text-wrap ${edit ? 'border-b-1 border-emerald-400' : 'border-none text-center'}`}
                                value={formState.team_name}
                                onChange={(e) => setFormState({ ...formState, team_name: e.target.value })}
                                disabled={!edit} />
                        </p>
                        <p>
                            <label className='text-sm font-semibold text-gray-500 dark:text-gray-400' htmlFor='nodalOfficer'>Nodal Officer</label>
                            <Input
                                id='nodalOfficer'
                                type="text"
                                placeholder="Enter Nodal Officer"
                                value={formState.Nodal_Officer}
                                onChange={(e) => setFormState({ ...formState, Nodal_Officer: e.target.value })}
                                className={`my-4 h-[50px] dark:bg-slate-100 dark:text-black ${edit ? 'border-b-1 border-emerald-400' : 'border-none '}`}
                                disabled={!edit} />
                        </p>
                        <label className='text-sm font-semibold text-gray-500 dark:text-gray-400' htmlFor='email'>Email</label>
                        <p>
                            <Input  
                                id='email'
                                type="email"
                                placeholder="Enter Email"
                                className={`my-4 h-[50px] dark:bg-slate-100 dark:text-black ${edit ? 'border-b-1  border-emerald-400' : 'border-none '}`}
                                value={formState.email}
                                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                disabled={!edit} />
                        </p>
                        {edit && (
                            <LoadingButton className='bg-emerald-600 font-bold my-4 mb-8  mt-4 !text-white w-full transition-all ease-in-out hover:bg-emerald-700' loading={Submitloading} onClick={(e: React.MouseEvent<HTMLButtonElement>) => onSubmit(e)}> Save Changes</LoadingButton>
                        )}
                        <p>

                            <Button className="w-full dark:bg-gray-900 font-semibold  dark:text-white  dark:hover:bg-emerald-700 transition-all ease-in-out" onClick={handleUpdatePass} >
                                {updatePass ? 'Cancel Update' : 'Update Password'}
                            </Button>
                        </p>

                        {updatePass && (
                            <div>
                                {/* <Input
                                    type="password"
                                    placeholder="Enter Old Password"
                                    className="mt-4 h-[50px]"
                                    value={formStatePass.oldPass}
                                    onChange={(e) => setFormStatePass({ ...formStatePass, oldPass: e.target.value })}
                                /> */}
                                <Input
                                    type="password"
                                    placeholder="Enter New Password"
                                    className="mt-4 h-[50px]"
                                    value={formStatePass.newPass}
                                    onChange={(e) => setFormStatePass({ ...formStatePass, newPass: e.target.value })}
                                />
                                <Input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    className="mt-4 h-[50px]"
                                    value={formStatePass.confirmPass}
                                    onChange={(e) => setFormStatePass({ ...formStatePass, confirmPass: e.target.value })}
                                />
                                <LoadingButton className='bg-emerald-600 font-bold mt-4 !text-white w-full transition-all ease-in-out hover:bg-emerald-700' loading={submitPassLoading} onClick={(e: React.MouseEvent<HTMLButtonElement>) => onUpdatePass(e)}>Submit Password</LoadingButton>
                            </div>
                        )}

                        <div className="mt-8">
                            <Button className="w-full dark:bg-gray-900 font-semibold  dark:text-white  dark:hover:bg-emerald-700 transition-all ease-in-out" onClick={() => Navigate('/home/contact')}>
                                Contact Admin
                            </Button>
                        </div>
                    </div>

                </div>
            )}

        </div>
    );
};

export default ProfilePage;