import React, { useEffect, useState } from 'react';
import { db, auth } from '@/config/firebase';
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
import { onAuthStateChanged } from 'firebase/auth';
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


const formSchema = z.object({
  category: z.string().nonempty('Category is required'),
})
const formSchema2 = z.object({
  department: z.string().nonempty('Department is required'),
})


interface Category {
  id: string;
  category: string;
  createdAt: Timestamp;
}
interface Department {
  id: string;
  department: string;
  createdAt: Timestamp;
}

const Dashboard: React.FC = () => {
  const [category, setCategory] = useState<Category[]>([]);
  const [department, setDepartment] = useState<Department[]>([]);
  const [handlecreateCategory, setHandlecreateCategory] = useState<boolean>(false);
  const [handlecreateDepartment, setHandlecreateDepartment] = useState<boolean>(false);
  const catergoryCollectionRef = collection(db, 'category');
  const departmentCollectionRef = collection(db, 'departments');
  const { toast } = useToast()
  const [CategoryLoading, setCategoryLoading] = useState<boolean>(true);
  const [DepartmentLoading, setDepartmentLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string>('');
  const APIURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken().then((idToken) => {
          setToken(idToken);
        }
        );
      } else {
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${APIURL}/todos`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      console.log(data);
    } catch (error: any) {
      console.error(error);
    }


  }


  const Categoryform = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
    },
  })

  const Departmentform = useForm<z.infer<typeof formSchema2>>({
    resolver: zodResolver(formSchema2),
    defaultValues: {
      department: '',
    },
  })

  async function onSubmitCategory(values: z.infer<typeof formSchema>) {
    console.log(values);
    const data = {
      category: values.category,
      createdAt: Timestamp.now(),
    }
    try {
      await addDoc(catergoryCollectionRef, data);
      console.log('Category created successfully');
      getCategory();
      toast({
        variant: "success",
        description: "Category created successfully",
      })
      setHandlecreateCategory(false);
    } catch (error: any) {
      console.error(error);
    }
  }
  async function onSubmitDepartment(values: z.infer<typeof formSchema2>) {
    console.log(values);
    const data = {
      department: values.department,
      createdAt: Timestamp.now(),
    }
    try {
      const department = await addDoc(departmentCollectionRef, data);
      console.log('Department created successfully', department);
      getDepartment();
      toast({
        variant: "success",
        description: "Department created successfully",
      })
      setHandlecreateDepartment(false);
    } catch (error: any) {
      console.error(error);
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'category', id));
      toast({
        variant: "success",
        description: "Category item deleted successfully",
      })
      getCategory();
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


  const getCategory = async () => {
    try {
      const categorySnapshot = await getDocs(catergoryCollectionRef);
      setCategory(categorySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          category: data.category,
          createdAt: data.createdAt,
        }
      }
      ));
      console.log(category);
      setCategoryLoading(false);
    } catch (error: any) {
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
        }
      });
      console.log(departments);
      departments.sort((a, b) => a.department.localeCompare(b.department));
      setDepartment(departments);
      setDepartmentLoading(false);
    } catch (error: any) {
      console.error(error);
    }
  };


  useEffect(() => {
    getCategory();
    getDepartment();
  }, []);



  const closeCategoryModal = () => {
    setHandlecreateCategory(false);
  }
  const openCategoryModal = () => {
    setHandlecreateCategory(true);
  }
  const closeDepartmentModal = () => {
    setHandlecreateDepartment(false);
  }
  const openDepartmentModal = () => {
    setHandlecreateDepartment(true);
  }


  return (
    <div className='flex flex-col gap-10 justify-start items-center h-full mt-20 max-w-[320px] mx-auto'>
      <div>
        <h1 className='font-bold text-green-900 text-[30px]'>
          Select Event
        </h1>
      </div>

      <div className='w-full'>
        <Button className='!bg-emerald-700 w-full flex gap-4 font-bold h-[50px] !text-white' onClick={() => openCategoryModal()}>
          <div className='bg-white rounded-full w-6 h-6 flex items-center justify-center'>
            <LuPlus className='text-emerald-700' />
          </div>
          Add Category
        </Button>
        &nbsp;
        <Button className='!bg-emerald-700 w-full flex gap-4 font-bold h-[50px] !text-white' onClick={() => openDepartmentModal()}>
          <div className='bg-white rounded-full w-6 h-6 flex items-center justify-center'>
            <LuPlus className='text-emerald-700' />
          </div>
          Add Department
        </Button>
      </div>

      <div className="flex flex-col gap-5 w-full max-w-[320px] mx-auto">
        <h2 className="text-xl font-bold text-center dark:text-white">Categories</h2>
        {CategoryLoading && CategoryLoading ? (
          Array.from({ length: 2 }, (_, index) => (
            <p className="text-center dark:text-white bg-slate-200 animate-pulse h-20 rounded-md flex items-center justify-center" key={index}>
              <ImSpinner6 className='animate-spin h-8 w-8 text-white text-lg mx-2' />   Loading
            </p>
          ))
        ) : (category.length > 0 ? (
          category.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-gray-400  dark:bg-gray-100 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <AiFillEye className="dark:text-gray-500 text-slate-100 " />
                <span className="dark:text-gray-700 text-white font-semibold">{item.category}</span>
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
                    <AlertDialogAction onClick={() => deleteCategory(item.id)}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <p className="text-center dark:text-white">No Category Found</p>
        )
        )}


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


      <Dialog open={handlecreateCategory} onOpenChange={closeCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className='!text-[30px] !font-bold mx-auto text-center my-8 dark:text-white'>
                Create Category
              </div>
            </DialogTitle>
            {/* <DialogDescription>
                            you can create an event here
                        </DialogDescription> */}
          </DialogHeader>
          <div className='flex flex-col gap-5 w-full max-w-[320px] mx-auto'>
            <Form {...Categoryform}>
              <form onSubmit={Categoryform.handleSubmit(onSubmitCategory)} className="space-y-8">
                <FormField
                  control={Categoryform.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel >Category</FormLabel>
                      <FormControl>
                        <Input className='h-[50px]' placeholder="eg: Club" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is user creation category.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex gap-2 items-center justify-end'>
                  <Button type='button' onClick={closeCategoryModal} className='!bg-slate-200 font-bold mt-6 !text-emerald-600'>Cancel</Button>
                  <Button type='submit' className='!bg-emerald-600 font-bold mt-6 !text-white'>Submit</Button>
                </div>

              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>



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
              <form onSubmit={Departmentform.handleSubmit(onSubmitDepartment)} className="space-y-8">
                <FormField
                  control={Departmentform.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
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
                <div className='flex gap-2 items-center justify-end'>
                  <Button type='button' onClick={closeDepartmentModal} className='!bg-slate-200 font-bold mt-6 !text-emerald-600'>Cancel</Button>
                  <Button type='submit' className='!bg-emerald-600 font-bold mt-6 !text-white'>Submit</Button>
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