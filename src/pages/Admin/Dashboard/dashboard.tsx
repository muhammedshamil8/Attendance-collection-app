import React, { useEffect, useState } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, addDoc, doc, Timestamp, deleteDoc } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast"
import { AiFillDelete, AiFillEye } from "react-icons/ai";
import { Button } from '@/components/ui/button';
import { LuPlus } from "react-icons/lu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
} from "@/components/ui/alert-dialog"
import { useAutoAnimate } from '@formkit/auto-animate/react'

const formSchema2 = z.object({
  department: z.string().nonempty('Department is required'),
})

interface Department {
  id: string;
  department: string;
  createdAt: Timestamp;
}

const Dashboard: React.FC = () => {
  const [department, setDepartment] = useState<Department[]>([]);
  const [handlecreateDepartment, setHandlecreateDepartment] = useState<boolean>(false);
  const departmentCollectionRef = collection(db, 'departments');
  const { toast } = useToast()
  const [DepartmentLoading, setDepartmentLoading] = useState<boolean>(true);
  const [parent] = useAutoAnimate();

  const Departmentform = useForm<z.infer<typeof formSchema2>>({
    resolver: zodResolver(formSchema2),
    defaultValues: {
      department: '',
    },
  })

  async function onSubmitDepartment(values: z.infer<typeof formSchema2>) {
    // console.log(values);
    const data = {
      department: values.department,
      createdAt: Timestamp.now(),
    }
    try {
      const department = await addDoc(departmentCollectionRef, data);
      // console.log('Department created successfully', department);
      getDepartment();
      toast({
        variant: "success",
        description: "Department created successfully",
      })
      if (department) {
        setHandlecreateDepartment(false);
        Departmentform.reset();
      }
    } catch (error: any) {
      console.error(error);
    }
  }

  const deleteDepartment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'departments', id));
      toast({
        variant: "success",
        description: "Department item deleted successfully",
      })
      getDepartment();
    } catch (error: any) {
      console.error(error);
    }
  }


  const getDepartment = async () => {
    try {
      const departmentSnapshot = await getDocs(departmentCollectionRef);
      const departments = departmentSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          department: data.department,
          createdAt: data.createdAt,
        }
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
  }
  const openDepartmentModal = () => {
    setHandlecreateDepartment(true);
  }


  return (
    <div className='flex flex-col gap-10 justify-start items-center h-full mt-20 mb-10 max-w-[320px] mx-auto'>
      <div>
        <h1 className='font-bold text-green-900 dark:text-emerald-400 text-[30px]'>
          Admin Dashboard
        </h1>
      </div>

      <div className='w-full'>
        <Button className='!bg-emerald-700 w-full flex gap-4 font-bold h-[50px] !text-white' onClick={() => openDepartmentModal()}>
          <div className='bg-white rounded-full w-6 h-6 flex items-center justify-center'>
            <LuPlus className='text-emerald-700' />
          </div>
          Add Department
        </Button>
      </div>

      <div className="flex flex-col gap-5 w-full max-w-[320px] mx-auto" ref={parent}>

        <h2 className="text-xl font-bold text-center dark:text-white">Departments</h2>
        {DepartmentLoading && DepartmentLoading ? (
          Array.from({ length: 4 }, (_, index) => (
            <p className="text-center dark:text-white bg-slate-200 animate-pulse h-20 rounded-md flex items-center justify-center" key={index}>
              <ImSpinner6 className='animate-spin h-8 w-8 text-white text-lg mx-2' />   Loading
            </p>
          ))
        ) : (department.length > 0 ? (
          department.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-gray-400  dark:bg-gray-100 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <AiFillEye className="dark:text-gray-500 text-slate-100" />
                <span className="dark:text-gray-700 text-white font-semibold">{item.department}</span>
                {/* <span className="text-gray-500 text-xs">({item.createdAt.toDate().toDateString()}) </span> */}
              </div>
              <AlertDialog>
                <AlertDialogTrigger>
                  <AiFillDelete className="text-red-500" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className='dark:text-white'>
                      Are you sure you want to delete this department?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. it will delete the department permanently.
                      so be sure before you continue.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className='dark:text-white'>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteDepartment(item.id)}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <p className="text-center dark:text-white">No Department Found</p>
        )
        )}
      </div>




      <Dialog open={handlecreateDepartment} onOpenChange={closeDepartmentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className='!text-[30px] !font-bold mx-auto text-center my-8 dark:text-white'>
                Create Department
              </div>
            </DialogTitle>
            {/* <DialogDescription>
                            you can create an event here
                        </DialogDescription> */}
          </DialogHeader>
          <div className='flex flex-col gap-5 w-full max-w-[320px] mx-auto'>
            <Form {...Departmentform}>
              <form onSubmit={Departmentform.handleSubmit(onSubmitDepartment)} className="space-y-4">
                <FormField
                  control={Departmentform.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem ref={parent}>
                      <FormLabel >Department</FormLabel>
                      <FormControl>
                        <Input className='h-[50px]' placeholder="ex: Bsc Computer Science" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is department when students create.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex gap-2 items-center justify-end pb-4'>
                  <Button type='button' onClick={closeDepartmentModal} className='!bg-slate-200 font-bold mt-6 !text-emerald-600 min-w-[110px]'>Cancel</Button>
                  <Button type='submit' className='!bg-emerald-600 font-bold mt-6 !text-white min-w-[110px]'>Submit</Button>
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