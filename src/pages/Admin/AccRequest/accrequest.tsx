import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { IoIosArrowDown, IoIosSearch } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { auth, db } from '@/config/firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast"
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
import { onAuthStateChanged } from 'firebase/auth';
import { MdPersonAddDisabled } from "react-icons/md";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import  useDebounce  from '@/lib/debounce';

interface User {
  id: string;
  email: string;
  category: string;
  name: string;
  role: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
  events?: string[];
}

function AccountRequest() {
  const [searchName, setSearchName] = useState('')
  const [loading, setLoading] = useState(true);
  const [Users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(Users);
  const { toast } = useToast()
  const UserCollectionRef = collection(db, 'users');
  const [token, setToken] = useState<string>('');
  const APIURL = import.meta.env.VITE_API_URL;
  const [parent , ] = useAutoAnimate();
  const debouncedSearchTerm = useDebounce(searchName, 300);

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

  async function onSubmit(values: any, ) {
    try {
      const data = {
        email: values.email,
        password: values.password,
        category: values.category,
        name: values.name,
        Head_name: values.Head_name,
        role: values.role,
        status: values.status,
        createdAt: Timestamp.now(),
      }
      const response = await fetch(`${APIURL}/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('responseData', responseData);
      if (response.ok) {
        toast({
          variant: 'success',
          description: responseData.message,
        });
        getUsers();
      } else {
        toast({
          variant: 'destructive',
          description: responseData.message,
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        description: error.message,
      })
    }
  }

  const DeleteUser = async (id: string) => {
    try {
      const response = await fetch(`${APIURL}/delete-user/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        toast({
          variant: 'success',
          description: data.message,
        });
        getUsers();
      } else {
        toast({
          variant: 'destructive',
          description: data.message,
        });
      }
    }
    catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        description: error.message,
      });
    }
  }

  const Fields = [
    { label: "No", value: "col-id" },
    { label: "Name", value: "col-name" },
    { label: "Category", value: "col-category" },
    { label: "Email", value: "col-email" },
    { label: "Action", value: "col-action" },
  ];

  const [selectedItems, setSelectedItems] = useState<string[]>([
    "col-id",
    "col-name",
    "col-category",
    "col-email",
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

  const getUsers = async () => {
    try {
      const usersSnapshot = await getDocs(UserCollectionRef);
      const filteredUsers = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
      const filteredUserRoleUsers = filteredUsers.filter((user) => user.role === 'user');
      console.log('filteredUserRoleUsers', filteredUserRoleUsers);
      setUsers(filteredUserRoleUsers);
      setLoading(false);
      filterAndSortStudents();
    } catch (error: any) {
      console.error(error);

    }
  }


  function filterAndSortStudents() {
    let filtered = Users;
    if (searchName !== '') {
      filtered = filtered.filter((user) => user.name.toLowerCase().includes(searchName.toLowerCase()));
    } else {
      filtered = Users;
    }
    return setFilteredUsers(filtered);
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    updateSelectedItems(selectedItems);
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [Users, debouncedSearchTerm]);



  return (
    <div className='flex flex-col gap-10 justify-start items-center h-full mt-20  mx-auto' >

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
                  {Fields.map((item, index) => (
                    <DropdownMenuCheckboxItem
                      key={index}
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
                  <th className="col-name tracking-wider">Name</th>
                  <th className="col-category tracking-wider">Category</th>
                  <th className="col-email tracking-wider">Email</th>
                  <th className="col-action tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className='' ref={parent}>
                {loading && loading ? (
                  <tr>
                    <td colSpan={6} className='text-center '>
                      <div className='flex items-center justify-center'>
                        <ImSpinner6 className='animate-spin h-8 w-8 text-gray-400 text-lg mx-2' /> Loading...
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={index + 1}>
                        <td className="col-id whitespace-nowrap">{index + 1}</td>
                        <td className="col-name whitespace-nowrap">{user.name}</td>
                        <td className="col-category whitespace-nowrap">{user.category}</td>
                        <td className="col-email whitespace-nowrap">{user.email}</td>
                        <td className='col-action whitespace-nowrap flex gap-1 items-center justify-center h-full w-full'>
                        <AiFillEdit className='col-action mx-auto text-emerald-700 cursor-pointer hover:text-emerald-600 transition-all ease-in-out' onClick={() => toast({ description: 'this feature on process' })} />
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <AiFillDelete className='col-action mx-auto text-red-500 cursor-pointer hover:text-red-600 transition-all ease-in-out' />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className='dark:text-white'>
                                  Are you sure you want to delete this user?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. it will delete the user permanently.
                                  so be sure before you continue. the user & user all data will be lost.
                                  you can disable the user if you want to keep the data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className='dark:text-white'>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => DeleteUser(user.id)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <MdPersonAddDisabled className='col-action mx-auto text-emerald-700 cursor-pointer hover:text-gray-500 transition-all ease-in-out' onClick={() => toast({ description: 'this disable feature on working' })} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className='text-center'>No data found</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AccountRequest;
