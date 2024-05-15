import React, { useState } from 'react';
import { auth } from '@/config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function isValidEmail(email: string): boolean {
        // Regular expression pattern for validating email addresses
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    }

    const handleSignIn = async () => {
        if (!email || !password) return setError('Email and password required');
        if (password.length < 6) return setError('Password must be at least 6 characters');
        if (!isValidEmail(email)) return setError('Invalid email address');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setError('Signed in');
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password) return setError('Email and password required');
        if (password.length < 6) return setError('Password must be at least 6 characters');
        if (!isValidEmail(email)) return setError('Invalid email address');

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setError('Account created');
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setError('Signed out');
        } catch (error: any) {
            setError(error.message);
        }
    }

    return (
        <div className='flex flex-col border p-10 m-10 rounded-xl gap-4 bg-slate-200 '>
            {auth?.currentUser && (
                <div>
                    <h1>Signed In</h1>
                    <p>Email: {auth?.currentUser?.email}</p>
                </div>
            )}

            <h1>Sign In</h1>
            <input
                className='p-2 rounded-md bg-slate-100 text-slate-900 max-w-md w-full'
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className='p-2 rounded-md bg-slate-100 text-slate-900 max-w-md w-full'
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleSignIn} className='bg-blue-500 p-2 rounded-md'>
                Sign In
            </button>

            <button onClick={handleSignUp} className='bg-blue-500 p-2 rounded-md'>
                Sign Up
            </button>

            <button onClick={handleSignOut} className='bg-blue-500 p-2 rounded-md'>
                Sign Out
            </button>
            {error && <p>{error}</p>}
        </div>
    );
};

export default SignIn;
