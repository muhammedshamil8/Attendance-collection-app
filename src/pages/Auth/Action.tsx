import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAuth,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ErrorImg from "@/assets/error.svg";
import SuccessImg from "@/assets/succes.svg";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};
import { LoadingButton } from "@/components/ui/loading-button";

const Action: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);
  const query = useQuery();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const mode = query.get("mode");
    const oobCode = query.get("oobCode");
    // console.log(mode);
    // console.log(oobCode);
    // console.log(query);
    if (mode && oobCode) {
      handleAction(mode, oobCode);
    } else {
      setStatus("Invalid action link.");
    }
  }, [auth, query]);

  const handleAction = async (mode: string, oobCode: string) => {
    setOobCode(oobCode);
    setLoading(true);
    switch (mode) {
      case "resetPassword":
        try {
          await verifyPasswordResetCode(auth, oobCode);
          setStatus("Please enter your new password.");
        } catch (error) {
          setStatus(`Error verifying reset code: ${(error as Error).message}`);
        }
        break;
      case "verifyEmail":
        try {
          await applyActionCode(auth, oobCode);
          setDone(true);
          setLoading(false);
          setStatus("Email verified successfully!");
          setTimeout(() => {
            navigate("/signin");
          }, 3000);
        } catch (error) {
          setStatus(`Error verifying email: ${(error as Error).message}`);
        }
        break;
      case "recoverEmail":
        try {
          await applyActionCode(auth, oobCode);
          setDone(true);
          setLoading(false);
          setStatus("Email recovery successful!");
          setTimeout(() => {
            navigate("/signin");
          }, 3000);
        } catch (error) {
          setStatus(`Error recovering email: ${(error as Error).message}`);
        }
        break;
      default:
        setStatus("Invalid action.");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setStatus("Please enter your new password.");
      return;
    } else if (newPassword.length < 6) {
      setStatus("Password must be at least 6 characters.");
      return;
    } else if (newPassword !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }
    if (oobCode) {
      try {
        await confirmPasswordReset(auth, oobCode, newPassword);
        setLoading(false);
        setDone(true);
        setStatus("Password reset successfully!");
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } catch (error) {
        setStatus(`Error resetting password: ${(error as Error).message}`);
      }
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-10 pt-10 dark:text-white">
      <h1>Action Handler</h1>
      {status ? <p>{status}</p> : <p>Processing your request...</p>}
      {status === "Please enter your new password." && (
        <div className="w-ful">
          <h1 className="py-4 text-center text-2xl font-semibold">
            Reset Your Password
          </h1>
          <form
            onSubmit={handlePasswordReset}
            className="mx-auto max-w-[360px] space-y-4 py-10"
          >
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                required
                className="my-2 h-[50px] w-full"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                className="my-2 h-[50px] w-full"
              />
            </div>
            <LoadingButton
              type="submit"
              className="w-full bg-emerald-600 font-bold !text-white transition-all ease-in-out hover:bg-emerald-700"
              loading={loading}
            >
              Reset Password
            </LoadingButton>
          </form>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
          {loading && loading ? (
            <DialogHeader>
              <DialogTitle className="text-center">Loading...</DialogTitle>
              <DialogDescription className="text-center">
                Sending your message...
              </DialogDescription>
            </DialogHeader>
          ) : (
            <>
              {done && done ? (
                <DialogHeader>
                  <img
                    src={SuccessImg}
                    alt="delete"
                    className="mx-auto mt-4 h-36 w-36"
                  />
                  <DialogDescription className="text-center">
                    Submission Successful
                  </DialogDescription>
                  <DialogFooter>
                    <Button
                      onClick={handleDialogClose}
                      className="mx-auto mt-6 h-[30px] w-fit !bg-emerald-600 px-10 font-bold !text-white"
                    >
                      Done
                    </Button>
                  </DialogFooter>
                </DialogHeader>
              ) : (
                <DialogHeader>
                  <DialogTitle>
                    <img
                      src={ErrorImg}
                      alt="delete"
                      className="mx-auto mt-4 h-36 w-36"
                    />
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    Submission Error
                  </DialogDescription>
                  <DialogFooter>
                    <Button
                      onClick={handleDialogClose}
                      className="mx-auto mt-6 h-[30px] w-fit !bg-red-600 px-10 font-bold !text-white"
                    >
                      oops!
                    </Button>
                  </DialogFooter>
                </DialogHeader>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Action;
