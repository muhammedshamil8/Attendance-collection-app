import React, { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { auth, db } from "@/config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc } from "firebase/firestore";
import { ImSpinner6 } from "react-icons/im";

const LandingPage: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const UserCollectionRef = collection(db, "users");
  const [role, setRole] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        isAuthenticated(user.uid);
      } else {
        isAuthenticated("");
      }
    });

    return () => unsubscribe();
  }, []);

  const isAuthenticated = useCallback(
    async (userID: string) => {
      if (!userID) {
        await signOut(auth);
        navigate("/signin");
        return;
      }
      try {
        const userDocRef = doc(UserCollectionRef, userID);
        const userDocSnap = await getDoc(userDocRef);
        const Userrole = userDocSnap.data()?.role;
        setRole(Userrole);
        if (Userrole === "admin") {
          navigate("/dashboard");
        } else if (Userrole === "user") {
          navigate("/");
        } else {
          navigate("/signin");
        }
      } catch (error: any) {
        console.error(error.message);
      }
    },
    [UserCollectionRef, navigate],
  );

  if (loading) {
    return (
      <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-white dark:bg-slate-900">
        <p className="flex items-center justify-center text-center dark:text-white">
          <ImSpinner6 className="mx-2 h-8 w-8 animate-spin text-lg text-white" />{" "}
          Loading...
        </p>
      </div>
    );
  }

  return user ? (
    role === "admin" ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <Navigate to="/" replace />
    )
  ) : (
    <Navigate to="/signin" replace />
  );
};

export default LandingPage;
