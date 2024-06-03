import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { GoHome } from "react-icons/go";
import { IoHeartCircleOutline } from "react-icons/io5";
import { motion } from "framer-motion";

const AuthLayout: React.FC = ({}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="auth-layout relative min-h-screen overflow-auto bg-white pb-20 dark:bg-gray-800">
      <header className="mb-10 flex w-full items-end justify-center gap-4 p-2">
        <div
          className="cursor-pointer rounded-md border p-2.5 transition-all ease-in-out hover:bg-slate-100 dark:border-none dark:bg-gray-950 dark:hover:bg-gray-800"
          onClick={() => handleNavigation("/")}
        >
          <GoHome className="cursor-pointer text-xl text-emerald-500 dark:text-emerald-500 dark:hover:text-gray-200" />
        </div>
        <div
          className="cursor-pointer rounded-md border p-2.5 transition-all ease-in-out hover:bg-slate-100 dark:border-none dark:bg-gray-950 dark:hover:bg-gray-800"
          onClick={() => handleNavigation("/about")}
        >
          <IoHeartCircleOutline className="cursor-pointer text-xl text-emerald-500 dark:text-emerald-500 dark:hover:text-gray-200" />
        </div>
        <ModeToggle />
      </header>
      {/* md:border-x */}
      <div className="auth-layout__content custom-container mb-10 min-h-full pt-2">
        <motion.div
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0, y: 0 },
            enter: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            exit: { opacity: 0, y: 0, transition: { duration: 0.5 } },
          }}
          key={pathname}
        >
          <Outlet />
        </motion.div>
      </div>
      <footer className="absolute bottom-0 h-auto w-full">
        {/* Add your footer content */}
        <div className="mx-auto w-fit p-2 text-center">
          <p
            className="text-sm text-gray-500 dark:text-gray-300"
            onClick={() => window.open("https://iedc-emea.vercel.app/#/")}
          >
            IEDC EMEA &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
