import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { auth, db } from '@/config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc } from 'firebase/firestore';
import { useToast } from '../ui/use-toast';

interface AuthRoleRequireProps {
    role: 'admin' | 'user';
    children: JSX.Element;
}

const AuthRoleRequire: React.FC<AuthRoleRequireProps> = ({ role, children }) => {
    const [user, setUser] = useState(auth.currentUser);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();
    const UserCollectionRef = collection(db, 'users');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                isAuthenticated(user.uid);
            } else {
                isAuthenticated('');
            }
        });

        return () => unsubscribe();
    }, []);

    const isAuthenticated = useCallback(async (userID: string) => {
        if (!userID) {
            await signOut(auth);
            toast({
                variant: 'destructive',
                title: 'Session expired',
                description: 'You need to login to access this page',
            });
            navigate('/admin/login');
            return;
        }

        try {
            const userDocRef = doc(UserCollectionRef, userID);
            const userDocSnap = await getDoc(userDocRef);
            const Userrole = userDocSnap.data()?.role;
            if (role === 'user') {
                if (Userrole === 'admin') {
                    toast({
                        variant: 'destructive',
                        title: 'Access denied',
                        description: 'You dont have permission to access this page',
                    });
                    navigate('/dashboard')
                } else if (Userrole !== 'user') {
                    await signOut(auth);
                    toast({
                        variant: 'destructive',
                        title: 'Access denied',
                        description: 'You need to login to access this page',
                    });
                    navigate('/signin');
                }
            } else if (role === 'admin') {
                if (Userrole === 'user') {
                    toast({
                        variant: 'destructive',
                        title: 'Access denied',
                        description: 'You dont have permission to access this page',
                    });
                    navigate('/')
                } else if (Userrole !== 'admin') {
                    await signOut(auth);
                    toast({
                        variant: 'destructive',
                        title: 'Access denied',
                        description: 'You need to login as an admin to access this page',
                    });
                    navigate('/signin');
                }
            }
        } catch (error: any) {
            console.error(error.message);
        }
    }, [UserCollectionRef, navigate, toast, role]);

    if (loading) {
        return <div className='fixed top-0 left-0 w-full h-full bg-white dark:bg-slate-900 flex items-center justify-center z-50'>
            <p className='text-center dark:text-white'>Loading...</p>
        </div>;
    }

    return user ? children : <Navigate to="/signin" replace />;
};

export default AuthRoleRequire;
