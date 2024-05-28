import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { auth, db } from '@/config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc } from 'firebase/firestore';
import { ImSpinner6 } from "react-icons/im";

const LandingPage: React.FC = () => {
    const [user, setUser] = useState(auth.currentUser);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const UserCollectionRef = collection(db, 'users');
    const [role, setRole] = useState('');

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
            navigate('/signin');
            return;
        }
        try {
            const userDocRef = doc(UserCollectionRef, userID);
            const userDocSnap = await getDoc(userDocRef);
            const Userrole = userDocSnap.data()?.role;
            setRole(Userrole);
            if (Userrole === 'admin') {
                navigate('/dashboard')
            } else if (Userrole === 'user') {
                navigate('/')
            } else {
                navigate('/signin')
            }
        } catch (error: any) {
            console.error(error.message);
        }
    }, [UserCollectionRef, navigate]);

    if (loading) {
        return <div className='fixed top-0 left-0 w-full h-full bg-white dark:bg-slate-900 flex items-center justify-center z-50'>
            <p className='text-center dark:text-white flex items-center justify-center'><ImSpinner6 className='animate-spin h-8 w-8 text-white text-lg mx-2' /> Loading...</p>
        </div>;
    }

    return user ? (role === 'admin' ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />) : <Navigate to="/signin" replace />;
};

export default LandingPage;
