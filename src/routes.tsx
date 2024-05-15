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
        path: "/home",
        element: <Home />
      },
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
        path: '/users',
        element: <Users />
      },
    ]
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [

      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/signin",
        element: <SignIn />
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