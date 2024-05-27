import React, { useEffect, useState } from 'react';
import { LuPlus } from "react-icons/lu";
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
import { IoIosArrowDown, IoIosSearch } from "react-icons/io";
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

import { auth, db } from '@/config/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, addDoc, setDoc } from 'firebase/firestore';
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"


// import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
// import QrReader from '@types/react-qr-reader'
interface User {
  email: string;
  category: string;
}
interface NewUser {
  email: string;
  password: string;
  category: string;
  role: string;
  status: boolean;
}

function users() {
  const [handleCreateEvent, setHandleCreateEvent] = useState(false);
  const [open, setOpen] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast()

  const [formData, setFormData] = useState<NewUser>({
    email: '',
    password: '',
    category: '',
    role: 'user',
    status: true,
  });


  function isValidEmail(email: string): boolean {
    // Regular expression pattern for validating email addresses
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  const Fields = [
    { label: "Name", value: "col-name" },
    { label: "Admission No", value: "col-admissionNo" },
    { label: "Roll No", value: "col-rollNo" },
    { label: "Department", value: "col-department" },
    { label: "Year", value: "col-year" },
    { label: "Action", value: "col-action" },
  ];



  const [selectedItems, setSelectedItems] = useState<string[]>([
    "col-category",
    "col-email",
    "col-id",
    "col-action",
  ]);


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
  useEffect(() => {
    updateSelectedItems(selectedItems);
  }, []);

  const Category = [
    {
      label: 'Department',
      value: 'Department'
    },
    {
      label: 'Club',
      value: 'Club'
    },
    {
      label: 'union',
      value: 'union'
    },
    {
      label: 'Other',
      value: 'Other'
    },
  ] as const;

  const users = [
    {
      email: 'johndoe@example.com',
      category: 'Department',
    },
    {
      email: 'jahnluis@example.com',
      category: 'Department',
    },
    {
      email: 'janesmith@example.com',
      category: 'Admin',
    },
    {
      email: 'jimbrown@example.com',
      category: 'Student',
    },
    {
      email: 'jakewhite@example.com',
      category: 'Faculty',
    },
  ];
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);


  const closeModal = () => {
    setHandleCreateEvent(false);
  }
  const openModal = () => {
    setHandleCreateEvent(true);
  }


  function filterAndSortStudents() {
    let filtered = users;
    if (searchName !== '') {
      filtered = filtered.filter((user) => user.email.toLowerCase().includes(searchName.toLowerCase()));
    } else {
      filtered = users;
    }
    return setFilteredUsers(filtered);
  };

  useEffect(() => {
    filterAndSortStudents();
  }, [searchName]);



  const UserCollectionRef = collection(db, 'users');
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('formData', formData);
    e.preventDefault();
    if (!formData.email || !formData.password) return setError('Email and password required');
    if (formData.category === '') return setError('Category required');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    if (!isValidEmail(formData.email)) return setError('Invalid email address');

    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      console.log('user', user);
      await setDoc(doc(UserCollectionRef, user.uid), { ...formData });
      toast({
        description: "User created",
      })
      setFormData({
        email: '',
        password: '',
        category: '',
        role: 'user',
        status: true,
      });
      setError('Account created');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseInt(value) : value;
    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  return (
    <div className='flex flex-col gap-10 justify-start items-center h-full mt-20  mx-auto' >
      <div className='w-full'>
        <Button className='!bg-slate-300 w-full flex justify-between items-center gap-4 font-bold h-[50px] rounded-xl' onClick={openModal}>
          <p className='text-emerald-700'>
            Add User
          </p>
          <div className='bg-emerald-700 rounded-full w-6 h-6 flex items-center justify-center'>
            <LuPlus className='text-white' />
          </div>
        </Button>
      </div>

      <div className='w-full flex flex-col gap-4 pb-8'>
        <div className="overflow-x-auto">
          <div className='flex items-center justify-between gap-4 py-4'>
            <div className='w-full relative max-w-[300px]'>
              <IoIosSearch className='absolute bottom-4 right-2 text-lg text-emerald-700' />
              <Input type="search" placeholder="Filter Users..." className='h-[50px]  bg-slate-300 pr-8 pl-4' value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>
            <div className='flex gap-2'>


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
                  <th className="col-id tracking-wider">No</th>
                  <th className="col-category tracking-wider">Category</th>
                  <th className="col-email tracking-wider">Email</th>
                  <th className="col-action tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className=''>
                {filteredUsers.length ? (
                  filteredUsers.map((user, index) => (
                    <tr key={index}>
                      <td className="col-id whitespace-nowrap">{index + 1}</td>
                      <td className="col-category whitespace-nowrap">{user.category}</td>
                      <td className="col-email whitespace-nowrap">{user.email}</td>
                      <td className='col-action whitespace-nowrap flex gap-1 items-center justify-center'>
                        <AiFillEdit className='col-action mx-auto text-emerald-700 cursor-pointer hover:text-emerald-600 transition-all ease-in-out' />
                        <AiFillDelete className='col-action mx-auto text-red-500 cursor-pointer hover:text-red-600 transition-all ease-in-out' />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className='text-center'>No data found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
        {/* <div className='flex gap-2 items-center justify-center'>
          <Button onClick={closeModal} className='!bg-slate-300 font-bold mt-6 !text-emerald-600'>Clear</Button>
          <Button onClick={closeModal} className='!bg-emerald-600 font-bold mt-6 !text-white'>Export</Button>
        </div> */}
      </div>

      <Dialog open={handleCreateEvent} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className='!text-[30px] !font-bold mx-auto text-center my-8 dark:text-white'>
                Create User
              </div>
            </DialogTitle>
            {/* <DialogDescription>
                            you can create an event here
                        </DialogDescription> */}
          </DialogHeader>
          <div className='flex flex-col gap-5 w-full  mx-auto'>
            <div className='w-full'>
              <form onSubmit={handleSignUp} className='flex flex-col gap-5 w-full max-w-[320px] mx-auto mt-4'>

                <label htmlFor="email" className='font-semibold text-sm dark:text-white'>Email</label>
                <Input type="email" placeholder="Email" name="email" className='h-[50px]' value={formData.email} onChange={handleChange} />
                <label htmlFor="password" className='font-semibold text-sm dark:text-white'>Password</label>
                <Input type={showPassword ? 'text' : 'password'} placeholder="Password" name="password" className='h-[50px]' value={formData.password} onChange={handleChange} />

                <label htmlFor="title" className='font-semibold text-sm dark:text-white '>Select Category</label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between h-[50px] dark:text-white bg-slate-100"
                    >
                      {formData.category
                        ? Category.find((item) => item.value === formData.category)?.label
                        : "Select Department..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search Department..." />
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup>
                        <CommandList className='max-h-[200px]'>
                          {
                            Category.map((item) => (
                              <CommandItem
                                key={item.value}
                                value={item.value}
                                onSelect={(currentValue) => {
                                  formData.category = currentValue;
                                  setOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.category === item.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {item.label}
                              </CommandItem>
                            ))
                          }
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>



                <div className='flex gap-2 items-center justify-end'>
                  <Button onClick={closeModal} className='!bg-slate-200 font-bold mt-6 !text-emerald-600'>Cancel</Button>
                  <Button type="submit" className='!bg-emerald-600 font-bold mt-6 !text-white'>Submit</Button>
                </div>
              </form>
            </div>
          </div>

        </DialogContent>
      </Dialog>
    </div>
  )
}

export default users
