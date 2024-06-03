import React, { useState } from "react";
import { auth } from "@/config/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useToast } from "@/components/ui/use-toast";
// import { doc, collection, getDoc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton } from "@/components/ui/loading-button";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});
import { useAutoAnimate } from "@formkit/auto-animate/react";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [parent] = useAutoAnimate();

  // const UserCollectionRef = collection(db, 'users');

  // useEffect(() => {
  //     const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //         if (user) {
  //             toast({
  //                 title: 'Already signed in',
  //                 description: 'You are already signed in',
  //             });
  //             const userDocRef = doc(UserCollectionRef, user.uid);
  //             const userDocSnap = await getDoc(userDocRef);
  //             const role = userDocSnap.data()?.role;

  //             if (role === 'admin') {
  //                 navigate('/dashboard');
  //             } else if (role === 'user') {
  //                 navigate('/');
  //             }
  //         }
  //     });
  //     return () => unsubscribe();
  // }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );
      const user = userCredential.user;

      const idTokenResult = await user.getIdTokenResult();

      const role = idTokenResult.claims.role;
      // Get the user's role
      // const userDocRef = doc(collection(db, 'users'), user.uid);
      // const userDocSnap = await getDoc(userDocRef);
      // // console.log('userDocSnap', userDocSnap.data());
      // const role = userDocSnap.data()?.role;

      // Verify the user's role
      if (role === "admin") {
        // console.log('Admin signed in:', user);
        toast({
          variant: "success",
          title: "Signed in",
          description: "You have successfully signed in",
          duration: 2000,
        });
        navigate("/dashboard");
      } else if (role === "user") {
        // Grant access to user features
        // console.log('User signed in:', user);
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "Admin can only login to admin dashboard",
        });

        await signOut(auth);
        navigate("/signin");
      } else {
        // Handle unknown role
        console.error("Unknown role:", user);
        toast({
          variant: "destructive",
          title: "Error signing in",
          description: "Unknown role detected",
          duration: 2000,
        });
        navigate("/contact");
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message,
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFilldata = () => {
    form.setValue("email", "admin@gmail.com");
    form.setValue("password", "password");
  };

  return (
    <div className="flex h-full max-h-screen min-h-[600px] flex-col items-center justify-around gap-10">
      <div className="text-center">
        <h1 className="text-[35px] font-bold dark:text-white">Welcome!</h1>
        <p className="-mt-2 text-sm text-gray-600 dark:text-gray-300">
          Sign to your admin account
        </p>
      </div>
      <div className="m-0 rounded-md px-0 py-0 dark:text-white">
        <p className="text-center underline">For testing</p>
        <Button
          onClick={handleFilldata}
          className="my-2 w-full font-semibold text-white"
        >
          Click to Fill{" "}
        </Button>
      </div>
      <div className="flex w-full max-w-[320px] flex-col gap-5">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
            ref={parent}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="h-[50px]"
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  {/* <FormDescription>
                                        This is your public display name.
                                    </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem ref={parent}>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="h-[50px]"
                        placeholder="Password"
                        {...field}
                      />
                      <div
                        className="absolute right-4 top-4 cursor-pointer dark:text-white"
                        onClick={toggleShowPassword}
                      >
                        {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <div>
                    <p className="mt-1 text-sm font-medium text-emerald-600 underline">
                      Forgot password?
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <LoadingButton
              className="mt-6 w-full !bg-emerald-600 font-bold !text-white"
              loading={loading}
              type="submit"
            >
              Login
            </LoadingButton>
          </form>
        </Form>
      </div>
      <div className="text-center">
        <h1 className="text-[32px] font-bold text-emerald-600">MARK !T</h1>
        <span className="text-[12px] dark:text-white">By IEDC EMEA</span>
      </div>
      <p className="text-sm dark:text-white">
        Are you a user?{" "}
        <button
          onClick={() => navigate("/signin")}
          className="text-emerald-700 underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default Login;
