import React, { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { AiFillDelete, AiFillEye } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { LuPlus } from "react-icons/lu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImSpinner6 } from "react-icons/im";

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
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { LoadingButton } from "@/components/ui/loading-button";

const formSchema2 = z.object({
  department: z.string().nonempty("Department is required"),
});

interface Department {
  id: string;
  department: string;
  createdAt: Timestamp;
}

const Dashboard: React.FC = () => {
  const [department, setDepartment] = useState<Department[]>([]);
  const [handlecreateDepartment, setHandlecreateDepartment] =
    useState<boolean>(false);
  const departmentCollectionRef = collection(db, "departments");
  const { toast } = useToast();
  const [DepartmentLoading, setDepartmentLoading] = useState<boolean>(true);
  const [parent] = useAutoAnimate();
  const [SubmitLoading, setSubmitLoading] = useState<boolean>(false);
  const [DeleteLoading, setDeleteLoading] = useState<boolean>(false);
  const Departmentform = useForm<z.infer<typeof formSchema2>>({
    resolver: zodResolver(formSchema2),
    defaultValues: {
      department: "",
    },
  });

  async function onSubmitDepartment(values: z.infer<typeof formSchema2>) {
    // console.log(values);
    setSubmitLoading(true);
    const data = {
      department: values.department,
      createdAt: Timestamp.now(),
    };
    try {
      const department = await addDoc(departmentCollectionRef, data);
      // console.log('Department created successfully', department);
      getDepartment();
      toast({
        variant: "success",
        description: "Department created successfully",
      });
      setSubmitLoading(false);
      if (department) {
        setHandlecreateDepartment(false);
        Departmentform.reset();
      }
    } catch (error: any) {
      setSubmitLoading(false);
      console.error(error);
    }
  }

  const deleteDepartment = async (id: string) => {
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, "departments", id));
      toast({
        variant: "success",
        description: "Department item deleted successfully",
      });
      getDepartment();
      setDeleteLoading(false);
    } catch (error: any) {
      setDeleteLoading(false);
      console.error(error);
    }
  };

  const getDepartment = async () => {
    try {
      const departmentSnapshot = await getDocs(departmentCollectionRef);
      const departments = departmentSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          department: data.department,
          createdAt: data.createdAt,
        };
      });
      // console.log(departments);
      departments.sort((a, b) => a.department.localeCompare(b.department));
      setDepartment(departments);
      setDepartmentLoading(false);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    getDepartment();
  }, []);

  const closeDepartmentModal = () => {
    setHandlecreateDepartment(false);
  };
  const openDepartmentModal = () => {
    setHandlecreateDepartment(true);
  };

  return (
    <div className="mx-auto mb-10 mt-20 flex h-full min-w-[250px] max-w-[380px] flex-col items-center justify-start gap-10 sm:max-w-[600px]">
      {DeleteLoading && (
        <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/50">
          <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
            <div className="flex w-full items-center justify-center gap-4">
              <ImSpinner6 className="h-6 w-6 animate-spin text-emerald-600" />
              <h1 className="font-bold text-emerald-600">
                Deleting Students from list...
              </h1>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-[30px] font-bold text-green-900 dark:text-emerald-400">
          Admin Dashboard
        </h1>
      </div>

      <div className="w-full">
        <Button
          className="flex h-[50px] w-full gap-4 !bg-emerald-700 font-bold !text-white"
          onClick={() => openDepartmentModal()}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
            <LuPlus className="text-emerald-700" />
          </div>
          Add Department
        </Button>
      </div>

      <div className="mx-auto flex w-full flex-col gap-5">
        <h2 className="text-center text-xl font-bold dark:text-white">
          Departments
        </h2>
        <div
          className="mx-auto flex w-full flex-col flex-wrap justify-center gap-5 sm:flex-row"
          ref={parent}
        >
          {DepartmentLoading && DepartmentLoading ? (
            Array.from({ length: 4 }, (_, index) => (
              <p
                className="flex h-20 w-full animate-pulse items-center justify-center rounded-md bg-slate-200 text-center dark:text-white sm:w-[45%]"
                key={index}
              >
                <ImSpinner6 className="mx-2 h-8 w-8 animate-spin text-lg text-white" />{" "}
                Loading
              </p>
            ))
          ) : department.length > 0 ? (
            department.map((item) => (
              <div
                key={item.id}
                className="mx-auto flex w-full items-center justify-between rounded-md bg-gray-400 p-4 dark:bg-gray-100 sm:w-[48%]"
              >
                <div className="flex items-center gap-2">
                  <AiFillEye className="text-slate-100 dark:text-gray-500" />
                  <span className="font-semibold text-white dark:text-gray-700">
                    {item.department}
                  </span>
                  {/* <span className="text-gray-500 text-xs">({item.createdAt.toDate().toDateString()}) </span> */}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <AiFillDelete className="text-red-500" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="dark:text-white">
                        Are you sure you want to delete this department?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. it will delete the
                        department permanently. so be sure before you continue.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="dark:text-white">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteDepartment(item.id)}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          ) : (
            <p className="text-center dark:text-white">No Department Found</p>
          )}
        </div>
      </div>

      <Dialog open={handlecreateDepartment} onOpenChange={closeDepartmentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="mx-auto my-8 text-center !text-[30px] !font-bold dark:text-white">
                Create Department
              </div>
            </DialogTitle>
            {/* <DialogDescription>
                            you can create an event here
                        </DialogDescription> */}
          </DialogHeader>
          <div className="mx-auto flex w-full max-w-[320px] flex-col gap-5">
            <Form {...Departmentform}>
              <form
                onSubmit={Departmentform.handleSubmit(onSubmitDepartment)}
                className="space-y-4"
              >
                <FormField
                  control={Departmentform.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem ref={parent}>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input
                          className="h-[50px]"
                          placeholder="ex: Bsc Computer Science"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is department when students create.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-end gap-2 pb-4">
                  <Button
                    type="button"
                    onClick={closeDepartmentModal}
                    className="mt-6 min-w-[110px] !bg-slate-200 font-bold !text-emerald-600"
                  >
                    Cancel
                  </Button>
                  <LoadingButton
                    className="mt-6 min-w-[110px] bg-emerald-600 font-bold !text-white transition-all ease-in-out hover:bg-emerald-700"
                    loading={SubmitLoading}
                    type="submit"
                  >
                    Submit
                  </LoadingButton>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
