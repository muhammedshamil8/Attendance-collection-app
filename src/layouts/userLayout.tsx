import { ModeToggle } from '@/components/mode-toggle';
import React, { useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { FaHome , FaUser , FaGrinStars , FaEnvelope } from "react-icons/fa";
import { LogOut } from 'lucide-react';
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



const UserLayout: React.FC = ({ }) => {
    const [sidebar, setSidebar] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;
    const { toast } = useToast();
    const UserProfile = auth.currentUser?.photoURL ? auth.currentUser?.photoURL : undefined;
    const [userDp] = useState<string | undefined>('Me');


    const closeSideBar = () => {
        setSidebar(false);
        setIsOpen(false);
    }
    const openSidebar = () => {
        setIsOpen(!isOpen);
        setTimeout(() => {
            setSidebar(true);
        }, 300);
    }

    const handleNavigate = (route: string) => {
        setIsOpen(!isOpen);
        setSidebar(false);
        navigate(route);
    }
    
    const NavItems = [
        {
            name: 'Home',
            icon: <FaHome />,
            route: '/'
        },
        {
            name: 'Profile',
            icon: <FaUser />,
            route: '/profile'
        },
        {
            name: 'About',
            icon: <FaGrinStars />,
            route: '/about'
        },
        {
            name: 'Contact',
            icon: <FaEnvelope />,
            route: '/contact'
        }
    ]

    const handleSignOut = useCallback(async () => {
        try {
            setIsOpen(!isOpen);
            setSidebar(false);
            await signOut(auth);
            toast({
                variant: 'success',
                title: 'Signed out',
                description: 'You have successfully signed out',
                duration: 2000,
            });
            navigate('/signin');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            });
        }
    }, [navigate, toast]);

    return (
        <AuthRoleRequire role='user'>
            <div className='bg-slate-200 dark:bg-slate-900 min-h-screen overflow-auto'>
                {/* Add your header component here */}
                <header className='border-b border-slate-200   flex items-center justify-around p-2 shadow-lg dark:shadow-black/30 dark:border-slate-950'>
                    {/* Add your header content */}
                    <button className='flex items-center justify-center h-full w-fit ' onClick={openSidebar}>
                        <div className={`nav-icon ${isOpen ? 'open' : ''}`} >
                            <div className='line line-1 bg-emerald-600'></div>
                            <div className='line line-2 bg-emerald-600'></div>
                            <div className='line line-3 bg-emerald-600'></div>
                        </div>
                    </button>

                    <Avatar onClick={() => navigate('/profile')} className='cursor-pointer'>
                        <AvatarImage src={UserProfile} />
                        <AvatarFallback className='dark:text-white p-2 text-sm'>{userDp}</AvatarFallback>
                    </Avatar>

                </header>

                {/* sidebar */}
                <aside>
                    <Sheet open={sidebar} onOpenChange={closeSideBar}>
                        <SheetContent className='flex flex-col h-full justify-between'>
                            <SheetHeader>
                                <SheetTitle>App Name!</SheetTitle>
                                {/* <SheetDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                            </SheetDescription> */}
                            </SheetHeader>
                            <nav className='flex-1 flex flex-col items-center justify-start  w-full gap-1'>
                                <ul className='w-full mt-8 '>
                                    {NavItems.map((item, index) => (
                                        <li key={index} className={`p-2 font-semibold text-gray-500 flex items-center gap-2 justify-center rounded-md  w-full hover:bg-slate-100  hover:text-black/80 dark:hover:text-black/80 transition-all ease-in-out cursor-pointer my-2 ${pathname === item.route ? 'bg-slate-100 text-black/80 dark:text-black/80' : ''}`} onClick={() => handleNavigate(item.route)} >
                                            {item.icon}
                                            <span>
                                                {item.name}
                                            </span>
                                        </li>
                                    ))}


                                </ul>
                            </nav>
                            {/* <SheetTrigger>
                            <Button onClick={closeSideBar}>Close</Button>
                        </SheetTrigger> */}
                            <SheetFooter>
                                <div className='w-full flex flex-col gap-2'>
                                    <ModeToggle icon={false} text='theme' />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant='outline' className='w-full border border-gray-300 dark:text-white flex items-center gap-2'>
                                                <LogOut className='w-[18px]' />
                                                <span>
                                                    Log Out
                                                </span>
                                            </Button>
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
                                                <AlertDialogAction onClick={() => handleSignOut()}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                </div>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </aside>



                {/* Add your main content */}
                <main className='custom-container'>
                    <Outlet />
                </main>

                {/* Add your footer component here */}
                <footer>
                    {/* Add your footer content */}
                </footer>
            </div>
        </AuthRoleRequire>
    );
};

export default UserLayout;