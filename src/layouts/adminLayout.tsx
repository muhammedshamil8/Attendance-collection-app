import { ModeToggle } from "@/components/mode-toggle";
import React, { useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaHome, FaUserPlus, FaUsers } from "react-icons/fa";
import { PiStudentBold } from "react-icons/pi";
import { LogOut } from "lucide-react";
import ActiveBadge from "@/components/ActiveBadge";
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

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { toast } = useToast();

  const NavItems = [
    {
      name: "Dashboard",
      icon: <FaHome />,
      route: "/dashboard",
    },
    {
      name: "Users",
      icon: <FaUsers />,
      route: "/dashboard/users",
    },
    {
      name: "Students",
      icon: <PiStudentBold />,
      route: "/dashboard/students",
    },
    {
      name: "Account Request",
      icon: <FaUserPlus />,
      route: "/dashboard/account-request",
    },
  ];

  const handleNavigate = useCallback(
    (route: string) => {
      navigate(route);
    },
    [navigate],
  );

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        variant: "success",
        title: "Signed out",
        description: "You have successfully signed out",
        duration: 2000,
      });
      navigate("/admin/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <AuthRoleRequire role="admin">
      <div className="flex min-h-screen w-full flex-col items-center overflow-auto bg-zinc-100 dark:bg-slate-900">
        <header className="relative flex w-full items-center justify-center py-10">
          <div className="absolute right-2 top-2">
            <ModeToggle />
          </div>
          <div className="mx-auto my-4 flex w-full flex-wrap items-center justify-center gap-3">
            {NavItems.map((item) => (
              <div key={item.route} className="relative">
                <Button
                  className={`flex min-w-[130px] items-center justify-center gap-2 font-semibold transition-all duration-300 ease-in-out hover:bg-emerald-700 hover:text-white dark:hover:bg-emerald-700 dark:hover:text-white ${pathname === item.route ? "bg-emerald-700 text-white dark:bg-emerald-700 dark:text-white" : "bg-slate-300 text-emerald-700 dark:bg-slate-300 dark:text-emerald-700"}`}
                  onClick={() => handleNavigate(item.route)}
                >
                  {item.icon} {item.name}
                </Button>
                {pathname === item.route && <ActiveBadge />}
              </div>
            ))}
          </div>
          <AlertDialog>
            <AlertDialogTrigger>
              <div className="absolute left-2 top-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border bg-white outline-none hover:bg-slate-100 dark:border-gray-800 dark:bg-black dark:hover:bg-gray-900">
                <LogOut className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="dark:text-white">
                  Are you sure you want to sign out?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You will be redirected to the sign in page. You will have to
                  sign in again to access your account. so make sure you have
                  saved your work before signing out.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOut}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </header>

        <main className="custom-container px-2 pt-1">
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

        <footer>{/* Add your footer content */}</footer>
      </div>
    </AuthRoleRequire>
  );
};

export default AdminLayout;
