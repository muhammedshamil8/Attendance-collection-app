import React, { useState, useEffect } from "react";
// import { auth } from '@/config/firebase';
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ErrorImg from "@/assets/error.svg";
import { useToast } from "@/components/ui/use-toast";
import SuccessImg from "@/assets/succes.svg";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";

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
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { LoadingButton } from "@/components/ui/loading-button";

const formSchema = z.object({
  email: z.string().optional(),
  subject: z.string().nonempty({ message: "Subject is required" }),
  message: z.string().nonempty({ message: "Message is required" }),
});

const Contact: React.FC = () => {
  const [email, setEmail] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const [parent] = useAutoAnimate({});
  const [Submitloading, setSubmitLoading] = useState(false);
  const APIURL = import.meta.env.VITE_API_URL;
  // const [token, setToken] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email ? user.email : "");
        // user.getIdToken().then((idToken) => {
        //     setToken(idToken);
        // });
      }
    });

    return unsubscribe;
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email,
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setSubmitLoading(true);
    try {
      if (
        values.email === "" ||
        values.subject === "" ||
        values.message === ""
      ) {
        toast({
          variant: "destructive",
          title: "Message Not Sent",
          description: "Please fill all the required fields",
          duration: 2000,
        });
        setSubmitLoading(false);
        return;
      }
      setShowDialog(true);
      const response = await fetch(`${APIURL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setDone(true);
        setSubmitLoading(false);

        setLoading(false);
        toast({
          variant: "success",
          title: "Message Sent",
          description: "Your message has been sent successfully",
          duration: 2000,
        });
      } else {
        setSubmitLoading(false);

        setDone(false);
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Message Not Sent",
          description: "Your message could not be sent. Please try again later",
          duration: 2000,
        });
      }
      form.reset();
    } catch (error) {
      setSubmitLoading(false);

      setLoading(false);

      toast({
        variant: "destructive",
        title: "Message Not Sent",
        description: "Your message could not be sent. Please try again later",
        duration: 2000,
      });
      console.error(error);
    } finally {
      setSubmitLoading(false);

      setLoading(false);
      setTimeout(() => {
        handleDialogClose();
      }, 5000);
    }
  }

  const handleDialogClose = () => {
    setShowDialog(false);
  };

  const handleClear = () => {
    form.reset();
  };

  const Subjects = [
    "Issue Facing",
    "Bug detected",
    "Feature Request",
    "Feedback",
    "Suggestion",
    "Other",
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-10 pt-20">
      <div className="text-center">
        <h1 className="text-[35px] font-bold dark:text-white">
          Connect with us
        </h1>
        <p className="-mt-2 text-sm text-gray-600 dark:text-gray-300">
          Send us a message and we will get back to you
        </p>
      </div>
      <div className="mt-10 flex w-full max-w-[360px] flex-col gap-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              disabled
              render={({ field }) => (
                <FormItem ref={parent}>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      className="h-[50px]"
                      placeholder="Email"
                      {...field}
                      value={email}
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
              name="subject"
              render={({ field }) => (
                <FormItem ref={parent}>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="h-[50px] w-full border focus:border-emerald-400 dark:border-slate-900 dark:focus:border-emerald-400">
                        <SelectValue placeholder="Subject..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Subjects.map((item, index) => (
                          <SelectItem key={index} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              name="message"
              render={({ field }) => (
                <FormItem ref={parent}>
                  <FormLabel>Your Message</FormLabel>
                  <FormControl>
                    <Textarea
                      className="border p-3 focus:border-emerald-400 dark:border-slate-900 dark:text-white dark:focus:border-emerald-400"
                      placeholder="Type your message here..."
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
            <div className="flex items-center justify-end gap-2">
              <Button
                className="mt-6 min-w-[120px] !bg-slate-300 font-bold !text-emerald-600"
                onClick={handleClear}
              >
                Clear
              </Button>
              <LoadingButton
                type="submit"
                className="mt-6 min-w-[120px] bg-emerald-600 font-bold !text-white transition-all ease-in-out hover:bg-emerald-700"
                loading={Submitloading}
              >
                Submit
              </LoadingButton>
            </div>
          </form>
        </Form>
      </div>

      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="min-h-[300px]">
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
                    Message Sent Successfully
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

export default Contact;
