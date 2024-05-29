import { ModeToggle } from '@/components/mode-toggle';
import React, { useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FaHome , FaUsers } from "react-icons/fa";
import { PiStudentBold } from "react-icons/pi";
import { LogOut } from 'lucide-react';
import ActiveBadge from '@/components/ActiveBadge';
import { auth } from '@/config/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/components/ui/use-toast';
import AuthRoleRequire from '@/components/router/AuthRoleRequire';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;
    const { toast } = useToast();

    const NavItems = [
        {
            name: 'Dashboard',
            icon: <FaHome />,
            route: '/dashboard'
        },
        {
            name: 'Users',
            icon: <FaUsers />,
            route: '/dashboard/users'
        },
        {
            name: 'Students',
            icon: <PiStudentBold />,
            route: '/dashboard/students'
        },
    ];

    const handleNavigate = useCallback((route: string) => {
        navigate(route);
    }, [navigate]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            toast({
                variant: 'success',
                title: 'Signed out',
                description: 'You have successfully signed out',
                duration: 2000,
            });
            navigate('/admin/login');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        }
    };

    return (
        <AuthRoleRequire role='admin'>
            <div className='bg-zinc-100 dark:bg-slate-900 min-h-screen overflow-auto flex flex-col items-center w-full '>

                <header className='w-full flex items-center justify-center  py-10 relative'>
                    <div className='absolute right-2 top-2'>
                        <ModeToggle />
                    </div>
                    <div className='my-4 flex items-center justify-center gap-3 flex-wrap mx-auto w-full'>
                    {NavItems.map((item) => (
                        <div key={item.route} className='relative'>
                            <Button
                                className={`min-w-[130px] hover:text-white hover:bg-emerald-700 dark:hover:bg-emerald-700 dark:hover:text-white font-semibold transition-all ease-in-out duration-300
                                flex items-center justify-center gap-2 
                                ${pathname === item.route ? 'bg-emerald-700 dark:bg-emerald-700 dark:text-white text-white' : 'bg-slate-300 text-emerald-700 dark:bg-slate-300 dark:text-emerald-700'}`}
                                onClick={() => handleNavigate(item.route)}
                            >
                                {item.icon} {item.name}
                            </Button>
                            {pathname === item.route && <ActiveBadge />}
                        </div>
                    ))}
                    </div>
                        <AlertDialog>
                            <AlertDialogTrigger >
                            <div className='absolute border left-2 top-2 bg-white dark:bg-black rounded-md h-10 w-10 flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-900'>
                                <LogOut className='h-4 w-4 text-black dark:text-white' />
                                </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className='dark:text-white'>
                                        Are you sure you want to sign out?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You will be redirected to the sign in page. You will have to sign in again to access your account.
                                        so make sure you have saved your work before signing out.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className='dark:text-white'>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleSignOut}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                </header>

                <main className='custom-container'>
                    <Outlet />
                </main>

                <footer>
                    {/* Add your footer content */}
                </footer>
            </div>
        </AuthRoleRequire>
    );
};

export default AdminLayout;
