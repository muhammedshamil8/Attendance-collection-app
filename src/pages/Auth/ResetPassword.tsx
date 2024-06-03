import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/config/firebase"; // Ensure the correct path to your firebase.ts file
import { useToast } from "@/components/ui/use-toast";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import ErrorImg from "@/assets/error.svg";
// import SuccessImg from "@/assets/success.svg"
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ResetPassword: React.FC = () => {
  const { oobCode } = useParams<{ oobCode: string }>();
  const query = useQuery();
  const mode = query.get("mode");
  const apiKey = query.get("apiKey");
  const lang = query.get("lang");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const navigate = useNavigate();
  const [message, setError] = useState<string>("");
  const { toast } = useToast();
  const [parent] = useAutoAnimate();
  const [showDialog, setShowDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDialogClose = () => {
    setShowDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPassword) {
      setError("Password is required");
      return;
    } else if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    } else if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      if (!oobCode) {
        toast({
          variant: "destructive",
          description: "Invalid reset link",
        });
        return;
      }
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast({
        title: "Password reset successful",
        variant: "success",
        description: "You will be redirected to the login page",
      });
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-10 pt-10">
      <pre>
        <h1>Reset Password</h1>
        <p>OOB Code: {oobCode}</p>
        <p>Mode: {mode}</p>
        <p>API Key: {apiKey}</p>
        <p>Language: {lang}</p>
      </pre>
      <h1 className="text-3xl font-bold dark:text-white">Reset Password</h1>
      <form
        onSubmit={handleSubmit}
        ref={parent}
        className="flex min-w-full flex-col"
      >
        <div className="text-center text-sm text-red-500">{message}</div>
        <div
          className="mx-auto cursor-pointer text-2xl dark:text-white"
          onClick={toggleShowPassword}
        >
          {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
        </div>
        <div className="mx-auto w-full max-w-[360px]">
          <Input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="my-3 h-[50px] w-full"
          />
          <Input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="my-3 h-[50px] w-full"
          />

          <Button type="submit" className="w-full">
            Reset Password
          </Button>

          <p className="mt-6 text-center text-sm dark:text-white">
            Remember your password ?
            <span
              onClick={() => navigate("/signin")}
              className="cursor-pointer px-2 transition-all ease-in-out hover:underline"
            >
              Sign in
            </span>
          </p>
        </div>
      </form>

      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            {/* <DialogTitle>Are you absolutely sure?</DialogTitle> */}
            <img
              src={ErrorImg}
              alt="delete"
              className="mx-auto mt-4 h-36 w-36"
            />
            {/* <img src={SuccessImg} alt="delete" className="w-36 h-36 mx-auto mt-4" /> */}
            <DialogDescription>Submission Error</DialogDescription>
            <DialogFooter>
              <Button
                onClick={handleDialogClose}
                className="mx-auto mt-6 h-[30px] w-fit !bg-red-600 px-10 font-bold !text-white"
              >
                oops!
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResetPassword;
