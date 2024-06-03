import { ModeToggle } from "@/components/mode-toggle";
import React, { useState, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { RiMessage3Line } from "react-icons/ri";
import { GoHome } from "react-icons/go";
import { HiOutlineUser } from "react-icons/hi2";
import { LogOut } from "lucide-react";
import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/components/ui/use-toast";
import AuthRoleRequire from "@/components/router/AuthRoleRequire";
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
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

const UserLayout: React.FC = ({}) => {
  const [sidebar, setSidebar] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { toast } = useToast();
  const UserProfile = auth.currentUser?.photoURL
    ? auth.currentUser?.photoURL
    : undefined;
  const [userDp] = useState<string | undefined>("Me");

  const closeSideBar = () => {
    setSidebar(false);
    setIsOpen(false);
  };
  const openSidebar = () => {
    setIsOpen(!isOpen);
    setTimeout(() => {
      setSidebar(true);
    }, 300);
  };

  const handleNavigate = (route: string) => {
    setIsOpen(!isOpen);
    setSidebar(false);
    navigate(route);
  };

  const NavItems = [
    {
      name: "Home",
      icon: <GoHome className="text-xl font-black" />,
      route: "/",
    },
    {
      name: "Profile",
      icon: <HiOutlineUser className="text-xl font-black" />,
      route: "/profile",
    },
    {
      name: "About",
      icon: <AiOutlineInfoCircle className="text-xl font-black" />,
      route: "/home/about",
    },
    {
      name: "Contact",
      icon: <RiMessage3Line className="text-xl font-black" />,
      route: "/home/contact",
    },
  ];

  const handleSignOut = useCallback(async () => {
    try {
      setIsOpen(!isOpen);
      setSidebar(false);
      await signOut(auth);
      toast({
        variant: "success",
        title: "Signed out",
        description: "You have successfully signed out",
        duration: 2000,
      });
      navigate("/signin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }, [navigate, toast]);

  return (
    <AuthRoleRequire role="user">
      <div className="min-h-screen overflow-auto bg-slate-200 dark:bg-slate-900">
        {/* Add your header component here */}
        <header className="flex items-center justify-between border-b border-emerald-800/20 p-2 px-4 dark:border-slate-600/20">
          {/* Add your header content */}
          <button
            className="flex h-full w-fit items-center justify-center"
            onClick={openSidebar}
          >
            <div className={`nav-icon ${isOpen ? "open" : ""}`}>
              <div className="line line-1 bg-emerald-600"></div>
              <div className="line line-2 bg-emerald-600"></div>
              <div className="line line-3 bg-emerald-600"></div>
            </div>
          </button>
          <h1
            className="text-xl font-bold text-emerald-600"
            onClick={() => navigate("/")}
          >
            MARK !T
          </h1>

          <Avatar
            onClick={() => navigate("/profile")}
            className="cursor-pointer border border-slate-100 bg-white dark:border-gray-600"
          >
            <AvatarImage src={UserProfile} />
            <AvatarFallback className="p-2 text-sm text-emerald-600">
              {userDp}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* sidebar */}
        <aside>
          <Sheet open={sidebar} onOpenChange={closeSideBar}>
            <SheetContent className="flex h-full flex-col justify-between">
              <SheetHeader>
                <SheetTitle className="text-emerald-600">MARK !T</SheetTitle>
                {/* <SheetDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove your data from our servers.
                            </SheetDescription> */}
              </SheetHeader>
              <nav className="flex w-full flex-1 flex-col items-center justify-start gap-1">
                <ul className="mt-8 flex w-full flex-col gap-3">
                  {NavItems.map((item, index) => (
                    <li
                      key={index}
                      className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-4 py-2 font-semibold text-gray-600 transition-all ease-in-out hover:bg-emerald-400/20 dark:text-gray-300 ${pathname === item.route ? "bg-emerald-400/20 text-emerald-700 dark:text-emerald-600" : ""}`}
                      onClick={() => handleNavigate(item.route)}
                    >
                      <span
                        className={`mr-4 font-extrabold text-black dark:text-white ${pathname === item.route ? "text-emerald-600 dark:text-emerald-600" : ""}`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`${pathname === item.route ? "text-emerald-600 dark:text-emerald-600" : ""}`}
                      >
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
                <div className="flex w-full flex-col gap-2">
                  <ModeToggle icon={false} text="theme" />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex w-full items-center gap-2 border border-gray-300 dark:text-white"
                      >
                        <LogOut className="w-[18px]" />
                        <span>Log Out</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-white">
                          Are you sure you want to sign out?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          You will be redirected to the sign in page. You will
                          have to sign in again to access your account. so make
                          sure you have saved your work before signing out.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:text-white">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleSignOut()}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </aside>

        {/* Add your main content */}
        <main className="custom-container mb-10 px-2 pt-1">
          <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={{
              initial: { opacity: 0, x: -50 },
              enter: { opacity: 1, x: 0, transition: { duration: 0.5 } },
              exit: { opacity: 0, x: 50, transition: { duration: 0.5 } },
            }}
            key={pathname}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Add your footer component here */}
        <footer className="">
          {/* Add your footer content */}
          <div className="p-2 text-center">
            <p
              className="mx-auto w-fit text-sm text-gray-500 dark:text-gray-300"
              onClick={() => window.open("https://iedc-emea.vercel.app/#/")}
            >
              IEDC EMEA &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </AuthRoleRequire>
  );
};

export default UserLayout;
