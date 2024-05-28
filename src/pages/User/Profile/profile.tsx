import { auth, db } from '@/config/firebase';
import { Avatar , AvatarImage , AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { FaRegUser } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

// interface UserData {
//     name: string;
//     email: string;
//     avatarUrl: string;
//     category: string;
// }

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const Navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                console.log(user);
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
                    const { name, email,  category } = userDataData;
                    setUser({ name, email,  category });
                    setLoading(false);
                } else {
                    setError('Failed to fetch user data');
                }
            } catch (error) {
                setError('Failed to fetch user data');
            }
        };
        fetchUser();
    }, [user]);


    return (
        <div className="flex flex-col items-center justify-start mt-20 h-screen ">
            {loading && loading ? (
                 <div className="bg-slate-300 animate-pulse h-60 w-[300px]  rounded-lg shadow-md p-8" />
            ) : (
                <div className="bg-white rounded-lg shadow-md p-8 min-w-[300px]">
                <div className="flex items-center justify-center mb-4">
                    <Avatar className='h-40 w-40'>
                        {user.photoURL ? (
                            <AvatarImage src={user.photoURL} alt="Profile Avatar" className="w-16 h-16 rounded-full" />
                        ) : (
                            <AvatarFallback>
                               <FaRegUser  className='w-16 h-16'/>
                            </AvatarFallback>
                        )}
                    </Avatar>
                </div>
                <h1 className="text-2xl font-bold mb-2">{user?.name ?? 'Loading...'}</h1>
                <p className="text-gray-500">{user?.email ?? ''}</p>
                <div className="mt-8">
                    <Button  className="w-full" onClick={() => Navigate('/home/contact')}>
                        Contact Admin
                    </Button>
                </div>
            </div>
            )}
           
        </div>
    );
};

export default ProfilePage;