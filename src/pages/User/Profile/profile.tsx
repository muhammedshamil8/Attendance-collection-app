import { auth, db } from '@/config/firebase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { FaRegUser } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useToast } from '@/components/ui/use-toast';
import { Edit } from 'lucide-react';
import { Badge } from "@/components/ui/badge"

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
        if (!formState.email || !formState.team_name || !formState.Nodal_Officer) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill all the fields',
            })
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
            } else {
                setError('Failed to update profile');
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to update profile'
                });
            }
        } catch (error) {
            setError('Failed to update profile');
        }
    }

    async function onUpdatePass(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (!token) return;
        if (!formStatePass.newPass || !formStatePass.confirmPass) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill all the fields',
            })
            return;
        } else if (formStatePass.newPass.length < 6) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Password must be at least 6 characters',
            })
            return;
        } else if (formStatePass.newPass !== formStatePass.confirmPass) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'New Password and Confirm Password does not match',
            })
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
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to update password'
                });
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message
            });
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
                <div className="bg-white rounded-lg shadow-md p-8 min-w-[360px] overflow-hidden relative">
                    <div>
                        <Edit onClick={handleEdit} className="absolute top-4 right-4 cursor-pointer" />
                    </div>
                    <div className='absolute top-4 left-4 '>
                        <Badge variant={'active'} style={{ overflowWrap: 'anywhere' }}> {user?.status ? 'active' : 'status'}</Badge>
                    </div>
                    <div className="flex items-center justify-center mb-4">
                        <Avatar className='h-40 w-40'>
                            {user1.photoURL ? (
                                <AvatarImage src={user1.photoURL} alt="Profile Avatar" className="w-16 h-16 rounded-full  " />
                            ) : (
                                <AvatarFallback>
                                    <FaRegUser className='w-16 h-16 dark:text-white' />
                                </AvatarFallback>
                            )}
                        </Avatar>
                    </div>
                    <div className='flex flex-col w-full ' ref={parent}>
                        <p>

                            <Input
                                type="text"
                                placeholder="Enter Team Name"
                                className={`font-bold mb-2  h-[50px] text-wrap ${edit ? 'border-b-2 border-emerald-400' : 'border-none text-center'}`}
                                value={formState.team_name}
                                onChange={(e) => setFormState({ ...formState, team_name: e.target.value })}
                                disabled={!edit} />
                        </p>
                        <p>
                            <Input
                                type="text"
                                placeholder="Enter Nodal Officer"
                                value={formState.Nodal_Officer}
                                onChange={(e) => setFormState({ ...formState, Nodal_Officer: e.target.value })}
                                className={`my-4 h-[50px] ${edit ? 'border-b-2 border-emerald-400' : 'border-none '}`}
                                disabled={!edit} />
                        </p>
                        <p>
                            <Input
                                type="email"
                                placeholder="Enter Email"
                                className={`my-4 h-[50px] ${edit ? 'border-b-2 border-emerald-400' : 'border-none '}`}
                                value={formState.email}
                                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                disabled={!edit} />
                        </p>
                        {edit && (
                            <Button className="w-full my-4 mb-8 dark:bg-emerald-600 bg-emerald-600 font-semibold  dark:text-white text-white hover:bg-emerald-900  dark:hover:bg-emerald-900 transition-all ease-in-out mt-4" onClick={(e: React.MouseEvent<HTMLButtonElement>) => onSubmit(e)}>
                                Save Changes
                            </Button>
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
                                <Button className="w-full dark:bg-gray-900 font-semibold  dark:text-white  dark:hover:bg-emerald-700 transition-all ease-in-out mt-4"
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => onUpdatePass(e)}>
                                    Submit Password
                                </Button>
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