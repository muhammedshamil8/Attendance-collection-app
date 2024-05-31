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

// interface UserData {
//     name: string;
//     email: string;
//     avatarUrl: string;
//     category: string;
// }
interface FormStateData {
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

    // form state
    let FormState: FormStateData = {
        email: user?.email ? user.email : '',
        team_name: user?.team_name ? user.team_name : '',
        Nodal_Officer: user ? user.Nodal_Officer : '',
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser1(user);
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            if (!user) return;
            try {
                const userDataRef = doc(db, 'users', user.uid);
                const userData = await getDoc(userDataRef);
                const userDataData = userData.data();
                if (userDataData) {
                    const { team_name, email, Nodal_Officer, status } = userDataData;
                    setUser({ team_name, email, Nodal_Officer, status });
                    FormState = {
                        email: userDataData.email,
                        team_name: userDataData.team_name,
                        Nodal_Officer: userDataData.Nodal_Officer,
                    }
                } else {
                    setError('Failed to fetch user data');
                }
            } catch (error) {
                setError('Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [user]);

    const handleUpdatePass = () => {
        setUpdatePass(!updatePass);
    }
    const handleEdit = () => {
        setEdit(!edit);
    }

    return (
        <div className="flex flex-col items-center justify-start mt-20 min-h-screen ">
            {loading && loading ? (
                <div className="bg-slate-300 animate-pulse h-[400px] w-[360px]  rounded-lg shadow-md p-8" />
            ) : (
                <div className="bg-white rounded-lg shadow-md p-8 min-w-[360px] overflow-hidden relative">
                    <div>
                        <Edit onClick={handleEdit} className="absolute top-4 right-4 cursor-pointer" />
                    </div>
                    <div className='absolute top-4 left-4 '>
                        <Badge className="" style={{ overflowWrap: 'anywhere' }}> {user?.status ? 'active' : 'status'}</Badge>
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
                        <h1 className="" style={{ overflowWrap: 'anywhere' }}>
                            {user?.team_name}
                        </h1>
                        <Input
                            type="text"
                            placeholder="Enter Team Name"
                            className={`font-bold mb-2  text-wrap ${edit ? 'border-b-2 border-emerald-400' : 'border-none text-center'}`}
                            value={edit ? FormState.team_name : user.team_name} onChange={(e) => e.target.value = FormState.team_name}
                            disabled={!edit} />
                        <p>
                            <Input
                                type="text"
                                placeholder="Enter Nodal Officer"
                                value={edit ? FormState.Nodal_Officer : user.Nodal_Officer} onChange={(e) => e.target.value = FormState.Nodal_Officer}
                                className={`my-4 ${edit ? 'border-b-2 border-emerald-400' : 'border-none '}`}
                                disabled={!edit} />
                        </p>
                        <p>
                            <Input
                                type="email"
                                placeholder="Enter Email"
                                className={`my-4 ${edit ? 'border-b-2 border-emerald-400' : 'border-none '}`}
                                value={edit ? FormState.email : user.email} onChange={(e) => e.target.value = FormState.email}
                                disabled={!edit} />
                        </p>
                        {edit && (
                        <Button className="w-full my-4 mb-8 dark:bg-gray-900 font-semibold  dark:text-white  dark:hover:bg-emerald-700 transition-all ease-in-out mt-4" onClick={() => toast({ description: 'This feature on working' })}>
                            Save Changes
                        </Button>
                        )}

                        <Button className="w-full dark:bg-gray-900 font-semibold  dark:text-white  dark:hover:bg-emerald-700 transition-all ease-in-out" onClick={handleUpdatePass} >
                            {updatePass ? 'Cancel Update' : 'Update Password'}
                        </Button>
                        {updatePass && (
                            <div>
                                <Input
                                    type="password"
                                    placeholder="Enter Old Password"
                                    className="mt-4"
                                />
                                <Input
                                    type="password"
                                    placeholder="Enter New Password"
                                    className="mt-4"
                                />
                                <Input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    className="mt-4"
                                />
                                <Button className="w-full dark:bg-gray-900 font-semibold  dark:text-white  dark:hover:bg-emerald-700 transition-all ease-in-out mt-4" onClick={() => toast({ description: 'This feature on working' })}>
                                    Submit
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