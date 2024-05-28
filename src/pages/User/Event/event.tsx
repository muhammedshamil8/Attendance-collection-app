"use client"
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { IoMdArrowDropdown, IoIosArrowDown, IoIosSearch } from "react-icons/io";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useParams } from 'react-router-dom';
import { Timestamp, collection, doc, getDoc, getDocs, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/config/firebase';

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
import { toast } from '@/components/ui/use-toast';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const formSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  admissionNo: z.string().nonempty({ message: "Admission no is required" }),
  rollNo: z.string().nonempty({ message: "Roll no is required" }),
  department: z.string().nonempty({ message: "Department is required" }),
  joinedYear: z.string().nonempty({ message: "Joined Year is required" }).length(4, { message: "Year must be 4 digits" }),
  id: z.string().optional(),
  // email: z.string().email({ message: "Invalid email" }).optional(),
  // phone: z.string()
  //   .refine((val) => val.length === 10, { message: "Phone number must be 10 digits" })
  //   .optional(),
});

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  rollNo: string;
  department: string;
  year: string;
  email?: string;
  phone?: string;
}

function Event() {
  const [handleCreateStudent, setHandleCreateStudent] = useState(false);
  const [open, setOpen] = useState(false)
  const [searchAdmNo, setSearchAdmNo] = useState('')
  const [searchName, setSearchName] = useState('')
  const [loading, setLoading] = useState(true);
  const [sortBox, setSortBox] = useState(false);
  const departmentCollectionRef = collection(db, 'departments');
  const studentCollectionRef = collection(db, 'students');
  const eventCollectionRef = collection(db, 'events');
  const [Department, setDepartment] = useState<string[]>([]);
  const [students, setStudnets] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);
  const [filteredAttendedStudents, setFilteredAttendedStudents] = useState<Student[]>(students);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [attendedStudents, setAttendedStudents] = useState<string[]>([]);
  const [AttendedStudentsObj, setAttendedStudentsObj] = useState<Student[]>([]);
  const { id } = useParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      admissionNo: "",
      rollNo: "",
      department: "",
      joinedYear: "",
      id: "",
      // email: "",
      // phone: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const docRef = doc(studentCollectionRef, values.admissionNo);
      await setDoc(docRef, {
        ...values,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        active: true,
      });
      toast({
        variant: "success",
        description: "Student added successfully",
      })
      getStudents();
      setSelectedStudents([...selectedStudents, values.admissionNo]);
      AddStudenttoList([values.admissionNo]);
      setHandleCreateStudent(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      })
    }
  }

  const AddStudenttoList = async (ids: string[]) => {
    if (!ids.length) {
      return toast({
        variant: "destructive",
        description: "Please select a student",
      });
    }
    try {
      const updateDoc = doc(eventCollectionRef, id);
      await setDoc(updateDoc, {
        attendees: arrayUnion(...ids)
      }, { merge: true });
      toast({
        variant: "success",
        description: "Student added successfully",
      });
      getAttendedStudents();
      closeModal();
      setSelectedStudents([]);
      setSearchAdmNo('');
      console.log('Student added successfully');
    } catch (error: any) {
      console.error(error);
    }
  }

  const RemoveStudentFromList = async (id: string) => {
    try {
      const updateDoc = doc(eventCollectionRef, id);
      await setDoc(updateDoc, {
        attendees: arrayRemove(id)
      }, { merge: true });
      toast({
        variant: "success",
        description: "Student removed successfully",
      });
      getAttendedStudents();
      console.log('Student removed successfully');
    } catch (error: any) {
      console.error(error);
    }
  }

  const handleClearAttendedStudents = async () => {
    try {
      const updateDoc = doc(eventCollectionRef, id);
      await setDoc(updateDoc, {
        attendees: []
      }, { merge: true });
      toast({
        variant: "success",
        description: "All students removed successfully",
      });
      getAttendedStudents();
      console.log('All students removed successfully');
    } catch (error: any) {
      console.error(error);
    }
  }

  const getAttendedStudents = async () => {
    try {
      const eventDoc = await getDoc(doc(eventCollectionRef, id));
      const event = eventDoc.data();
      if (event) {
        const attendedStudents = event.attendees;
        setAttendedStudents(attendedStudents);
        const attendedStudentObjects = students.filter((student) => attendedStudents.includes(student.admissionNo));
        setAttendedStudentsObj(attendedStudentObjects);
        setFilteredAttendedStudents(attendedStudentObjects)
        setLoading(false);
      }
    } catch (error: any) {
      console.error(error);
    }
  }


  const Fields = [
    { label: "No", value: "col-no" },
    { label: "Name", value: "col-name" },
    { label: "Admission No", value: "col-admissionNo" },
    { label: "Roll No", value: "col-rollNo" },
    { label: "Department", value: "col-department" },
    { label: "Year", value: "col-year" },
    { label: "Action", value: "col-action" },
  ];

  const SortFields = [
    { label: "Year Desc", value: "year-desc" },
    { label: "Year Asc", value: "year-asc" },
    { label: "Department", value: "department" },
  ];

  const [selectedItems, setSelectedItems] = useState<string[]>([
    "col-no",
    "col-name",
    "col-admissionNo",
    "col-rollNo",
    "col-department",
    "col-year",
    "col-action",
  ]);
  const [selectedItems2, setSelectedItems2] = useState<string>('');

  const handleItemSelect = (item: { label: string, value: string }) => {
    let updatedItems;
    if (selectedItems.includes(item.value)) {
      updatedItems = selectedItems.filter((value) => value !== item.value);
    } else {
      updatedItems = [...selectedItems, item.value];
    }
    setSelectedItems(updatedItems);
    updateSelectedItems(updatedItems);
  }

  const updateSelectedItems = (selectedItems: string[]) => {
    const allItems = Fields.map(item => item.value);
    const unselectedItems = allItems.filter(item => !selectedItems.includes(item));

    // Hide unselected columns
    unselectedItems.forEach((item) => {
      const elements = document.querySelectorAll(`.${item}`);
      elements.forEach(element => {
        (element as HTMLElement).classList.add('hidden-column');
      });
    });

    // Show selected columns
    selectedItems.forEach((item) => {
      const elements = document.querySelectorAll(`.${item}`);
      elements.forEach(element => {
        (element as HTMLElement).classList.remove('hidden-column');
      });
    });
  }

  const getDepartment = async () => {
    try {
      const departmentSnapshot = await getDocs(departmentCollectionRef);
      const departments = departmentSnapshot.docs.map((doc) => {
        const data = doc.data();
        return data.department;
      });
      // departments.sort((a, b) => a.department.localeCompare(b.department));
      setDepartment(departments);
    } catch (error: any) {
      console.error(error);
    }
  };

  const getStudents = async () => {
    try {
      const usersSnapshot = await getDocs(studentCollectionRef);
      const filteredUsers = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Student[];
      setStudnets(filteredUsers);
      setFilteredStudents(filteredUsers);
      // filterAndSortStudents();
    } catch (error: any) {
      console.error(error);

    }
  }

  useEffect(() => {
    updateSelectedItems(selectedItems);
  }, []);

  const closeModal = () => {
    setHandleCreateStudent(false);
  }
  const openModal = () => {
    setHandleCreateStudent(true);
  }

  const filteredStudentsAdmNo = students.filter((student) => {
    if (searchAdmNo === '') return null;
    return student.admissionNo.toLowerCase().includes(searchAdmNo.toLowerCase())
  })


  function filterAndSortStudents() {
    let filtered = AttendedStudentsObj;
    if (searchName !== '') {
      filtered = filtered.filter((student) => student.name.toLowerCase().includes(searchName.toLowerCase()));
    } else {
      filtered = AttendedStudentsObj;
    }
    return setFilteredAttendedStudents(filtered.sort((a, b) => {
      if (selectedItems2 === 'department') {
        return a.department.localeCompare(b.department);
      } else if (selectedItems2 === 'year-desc') {
        return b.year.localeCompare(a.year);
      } else if (selectedItems2 === 'year-asc') {
        return a.year.localeCompare(b.year);
      } else {
        return 0;
      }
    }));
  };

  useEffect(() => {
    filterAndSortStudents();
  }, [searchName, selectedItems2]);

  const handleSortBox = () => {
    setSortBox(!sortBox);
  }

  useEffect(() => {
    getDepartment();
    getStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      getAttendedStudents();
    }
  }, [students]);
  return (
    <div className='flex flex-col gap-10 justify-start items-center h-full mt-20  mx-auto' >
      <div>
        <h1 className='font-bold text-green-900 text-[30px]'>
          Event Name
        </h1>
        <p>
          This is the event page
        </p>
      </div>

      <div className='w-full'>
        <Button className='!bg-slate-300 w-full flex justify-between items-center gap-4 font-bold h-[50px] rounded-xl' onClick={openModal}>
          <p className='text-emerald-700'>
            Select Student
          </p>
          <IoMdArrowDropdown className='text-emerald-700' />
        </Button>
      </div>

      <div className='w-full flex flex-col gap-4 pb-8'>
        <div className="overflow-x-auto">
          <div className='flex items-center justify-between gap-4 py-4'>
            <div className='w-full relative max-w-[300px]'>
              <IoIosSearch className='absolute bottom-4 right-2 text-lg text-emerald-700' />
              <Input type="search" placeholder="Filter Students..." className='h-[50px]  bg-slate-300 pr-8 pl-4' value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>
            <div className='flex gap-2'>

              <DropdownMenu open={sortBox} onOpenChange={handleSortBox}>
                <DropdownMenuTrigger className='outline-none border-none '>
                  <div className='p-2 bg-emerald-700 flex gap-2 items-center justify-center text-white rounded-lg px-4' onClick={() => setSortBox(!sortBox)}>Sort <IoIosArrowDown /></div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={selectedItems2} onValueChange={setSelectedItems2}>
                    {SortFields.map((item) => (
                      <DropdownMenuRadioItem key={item.value} value={item.value}>
                        {item.label}
                      </DropdownMenuRadioItem>
                    ))}

                  </DropdownMenuRadioGroup>
                  <Button onClick={() => { setSelectedItems2(''); setSortBox(!sortBox) }} className=' font-bold mt-4 border bg-white text-gray-700 dark:text-white dark:bg-gray-900 w-full p-0 hover:text-white dark:hover:bg-gray-800'>Clear</Button>

                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className='outline-none border-none'>
                  <div className='p-2 bg-emerald-700 flex gap-2 items-center justify-center text-white rounded-lg px-4'>Columns <IoIosArrowDown /></div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                  <DropdownMenuSeparator />
                  {Fields.map((item) => (
                    <DropdownMenuCheckboxItem
                      key={item.value}
                      checked={selectedItems.includes(item.value)}
                      onCheckedChange={() => handleItemSelect(item)}
                    >
                      {item.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {/* <DropdownMenuItem>Subscription</DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>


          <div className='border border-emerald-700 rounded-[20px] overflow-auto '>
            <table className="min-w-full rounded-xl  " id='custom-table'>
              <thead className=''>
                <tr >
                  <th className="col-no tracking-wider">No</th>
                  <th className="col-name tracking-wider">Student Name</th>
                  <th className="col-admissionNo tracking-wider">Admission no:</th>
                  <th className="col-rollNo tracking-wider">Roll No:</th>
                  <th className="col-department tracking-wider">Department</th>
                  <th className="col-year tracking-wider">Year</th>
                  <th className="col-action tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className=''>
                {loading && loading ? (
                  <tr>
                    <td colSpan={7} className='text-center'>Loading...</td>
                  </tr>
                ) : (
                  filteredAttendedStudents.length ? (
                    filteredAttendedStudents.map((student, index) => (
                      <tr key={index + 1}>
                        <td className="col-no whitespace-nowrap">{index + 1}</td>
                        <td className="col-name whitespace-nowrap">{student.name}</td>
                        <td className="col-admissionNo whitespace-nowrap">{student.admissionNo}</td>
                        <td className="col-rollNo whitespace-nowrap">{student.rollNo}</td>
                        <td className="col-department whitespace-nowrap">{student.department}</td>
                        <td className="col-year whitespace-nowrap">{student.year}</td>
                        <td className='col-action whitespace-nowrap'>
                          <AiFillDelete className='col-action mx-auto text-red-500 cursor-pointer hover:text-red-600 transition-all ease-in-out' onClick={() => RemoveStudentFromList(student.id)} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className='text-center'>No data found</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

        </div>
        <div className='flex gap-2 items-center justify-center'>
          <Button onClick={() => handleClearAttendedStudents} className='!bg-slate-300 font-bold mt-6 !text-emerald-600'>Clear</Button>
          <Button onClick={closeModal} className='!bg-emerald-600 font-bold mt-6 !text-white'>Export</Button>
        </div>
      </div>

      <Dialog open={handleCreateStudent} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className='!text-[30px] !font-bold mx-auto text-center my-8 dark:text-white'>
                Choose Student
              </div>
            </DialogTitle>
            {/* <DialogDescription>
                            you can create an event here
                        </DialogDescription> */}
          </DialogHeader>
          <div className='flex flex-col gap-5 w-full  mx-auto'>
            <Tabs defaultValue="addStudent" className="w-full mx-auto flex items-center flex-col justify-center">
              <TabsList >
                <TabsTrigger value="addStudent">Add Student</TabsTrigger>
                <TabsTrigger value="createStudent">Create Studnet</TabsTrigger>
              </TabsList>
              <TabsContent value="addStudent" className='w-full'>
                <div className='flex flex-col gap-5 w-full max-w-[320px] mx-auto mt-4'>
                  <div className='w-full relative mb-4'>
                    <IoIosSearch className='absolute bottom-4 right-2 text-lg text-emerald-700' />
                    <Input type="text" placeholder="Search Admission No" name="title" className='h-[50px]' value={searchAdmNo} onChange={(e) => setSearchAdmNo(e.target.value)} />
                  </div>

                  <div className='min-h-[450px] max-h-[450px] overflow-auto p-4 border w-full my-2 rounded-md flex flex-col gap-3'>
                    {filteredStudentsAdmNo.length ? (
                      filteredStudentsAdmNo.map((student) => (
                        <div key={student.admissionNo} className='bg-slate-100 p-2 px-4 rounded-md flex items-center justify-between hover:bg-slate-200 transition-all ease-in-out cursor-default'>
                          <div>
                            <p>{student.name}</p>
                            <p>{student.admissionNo}</p>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Checkbox
                                  id={`student-${student.admissionNo}`}
                                  checked={selectedStudents.includes(student.admissionNo)}
                                  disabled={attendedStudents.includes(student.admissionNo)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedStudents((prevStudents) => [...prevStudents, student.admissionNo]);
                                    } else {
                                      setSelectedStudents((prevStudents) => prevStudents.filter((admNo) => admNo !== student.admissionNo));
                                    }
                                  }}
                                />
                              </TooltipTrigger>
                              {attendedStudents.includes(student.admissionNo) && (
                                <TooltipContent>
                                  <p>Already added</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))
                    ) : (
                      <div className='text-center text-black'>No data found</div>
                    )}
                  </div>
                  <div className='flex gap-2 items-center justify-end'>
                    <Button onClick={closeModal} className='!bg-slate-200 font-bold mt-4 !text-emerald-600'>Cancel</Button>
                    <Button onClick={() => AddStudenttoList(selectedStudents)} className='!bg-emerald-600 font-bold mt-4 !text-white'>Submit</Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="createStudent" className='w-full'>
                <div className='flex flex-col gap-5 w-full max-w-[320px] mx-auto mt-4'>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel >Student Name</FormLabel>
                            <FormControl>
                              <Input className='h-[50px]' placeholder="eg: - NSS" {...field} />
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
                        name="department"
                        render={({ field: { onChange, value } }) => (
                          <FormItem>
                            <FormLabel>Select Department</FormLabel>
                            <FormControl>
                              <Popover open={open} onOpenChange={setOpen} >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between h-[50px] dark:text-white bg-slate-100"
                                  >
                                    {value ? Department.find((item) => item === value) : "Select Department..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="!w-full p-0 min-w-[300px]">
                                  <Command>
                                    <CommandInput placeholder="Search Department..." />
                                    <CommandEmpty>No Department found.</CommandEmpty>
                                    <CommandGroup>
                                      <CommandList className='max-h-[200px]'>
                                        {
                                          Department.map((item, index) => (
                                            <CommandItem
                                              key={index}
                                              value={item}
                                              onSelect={(currentValue) => {
                                                onChange(currentValue);
                                                setOpen(false);
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  value === item ? "opacity-100" : "opacity-0"
                                                )}
                                              />
                                              {item}
                                            </CommandItem>
                                          ))
                                        }
                                      </CommandList>
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="admissionNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel >Admission No</FormLabel>
                            <FormControl>
                              <Input className='h-[50px]' placeholder="eg: - ABSC123" {...field} />
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
                        name="rollNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel >Roll No</FormLabel>
                            <FormControl>
                              <Input className='h-[50px]' placeholder="eg: - 7" {...field} />
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
                        name="joinedYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel >Joined Year</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                aria-disabled={true}
                                pattern="[0-9]{4}"
                                inputMode="numeric"
                                maxLength={4}
                                placeholder="Joined Year"
                                className='h-[50px] '
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
                      <div className='flex gap-2 items-center justify-end'>
                        <Button type='button' onClick={closeModal} className='!bg-slate-200 font-bold mt-6 !text-emerald-600'>Cancel</Button>
                        <Button type='submit' className='!bg-emerald-600 font-bold mt-6 !text-white'>Submit</Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
          </div>

        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Event
