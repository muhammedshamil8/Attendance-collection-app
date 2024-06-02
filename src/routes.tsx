import { createBrowserRouter, Navigate } from "react-router-dom";

// layoutes
import AdminLayout from "@/layouts/adminLayout";
import AuthLayout from "@/layouts/authLayout";
import UserLayout from "@/layouts/userLayout";

// admin routes
import Dashboard from "@/pages/Admin/Dashboard/dashboard";
import Users from "@/pages/Admin/Users/users";
import Students from "./pages/Admin/Students/students";
import AccountRequest from "./pages/Admin/AccRequest/accrequest";


// user routes
import Home from "@/pages/User/Home/home";
import Event from "./pages/User/Event/event";
import ProfilePage from "./pages/User/Profile/profile";
import AuthContact from "./pages/User/Contact/contact";

// auth routes
import Login from "@/pages/Auth/admin/login";
import SignIn from "@/pages/Auth/user/sigin";
import Action from "./pages/Auth/Action";

// error routes
import NotFound from "@/pages/Errors/NotFound";
import UnAuth from "@/pages/Errors/unAuth";

// other routes
import Contact from "./pages/contact";
import About from "./pages/about";
import Test from "./pages/test";
import CollectionForm from "./pages/collectionForm";
// import LandingPage from "./pages/landingPage";


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
        element: <AuthContact />
      },
      {
        path: '/event/:id',
        element: <Event />
      },
      {
        path: '/home/about',
        element: <About />
      },
      {
        path: '/profile',
        element: <ProfilePage />
      },
    ]
  },
  {
    path: "/dashboard",
    element: <AdminLayout />,
    children: [
      {
        path: ".",
        element: <Navigate to="" />
      },
      {
        path: "",
        element: <Dashboard />
      },
      {
        path: 'users',
        element: <Users />
      },
      {
        path: 'students',
        element: <Students />
      },
      {
        path: 'account-request',
        element: <AccountRequest />
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
      },
      {
        path: "/test",
        element: <Test />
      },
      {
        path: "/emeastudents-form",
        element: <CollectionForm />
      },
      {
        path: "/action",
        element: <Action />
      },
    ]
  },
  {
    path: 'offline.html',
    element: <Navigate to='/' />
  },
  {
    path: "/401",
    element: <UnAuth />
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

export default router;