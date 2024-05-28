import { createBrowserRouter, Navigate } from "react-router-dom";

// layoutes
import AdminLayout from "@/layouts/adminLayout";
import AuthLayout from "@/layouts/authLayout";
import UserLayout from "@/layouts/userLayout";

// admin routes
import Dashboard from "@/pages/Admin/Dashboard/dashboard";
import Users from "@/pages/Admin/Users/users";


// user routes
import Home from "@/pages/User/Home/home";

// auth routes
import Login from "@/pages/Auth/admin/login";
import SignIn from "@/pages/Auth/user/sigin";

// error routes
import NotFound from "@/pages/Errors/NotFound";
import UnAuth from "@/pages/Errors/unAuth";
import Contact from "./pages/Auth/contact";
import Event from "./pages/User/Event/event";
import Students from "./pages/Admin/Students/students";
import About from "./pages/Auth/about";
import ProfilePage from "./pages/User/Profile/profile";


const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: '/home/contact',
        element: <Contact />
      },
      {
        path: '/event/:id',
        element: <Event />
      },
      {
        path: '/about',
        element: <About />
      },
      {
        path: '/profile',
        element: <ProfilePage />
      }
    ]
  },
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" />
      },
      {
        path: "/dashboard",
        element: <Dashboard />
      },
      {
        path: '/dashboard/users',
        element: <Users />
      },
      {
        path: '/dashboard/students',
        element: <Students />
      }
    ]
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "/signin",
        element: <SignIn />
      },
      {
        path: "/admin/login",
        element: <Login />
      },
      {
        path: '/contact',
        element: <Contact />
      },
      {
        path: '/about',
        element: <About />
      }
    ]
  },
  {
    path: "/403",
    element: <UnAuth />
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

export default router;