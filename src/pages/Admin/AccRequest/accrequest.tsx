import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { AiFillDelete } from "react-icons/ai";
import { IoIosArrowDown, IoIosSearch } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { auth, db } from '@/config/firebase';
import { collection, getDocs, Timestamp, doc, deleteDoc } from 'firebase/firestore';
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
import { useAutoAnimate } from '@formkit/auto-animate/react'
import useDebounce from '@/lib/debounce';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { FaEye } from "react-icons/fa";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from '@/components/ui/loading-button';
import { FaWhatsapp } from "react-icons/fa";

interface User {
  id: string;
  email: string;
  team_name: string;
  Nodal_Officer: string;
  password: string;
  role: string;
  message: string;
  status: string;
  subject: string;
  Verification: string;
  contact_number: string;
  phone_number: string;
  createdAt: string;
}

function AccountRequest() {
  const [searchName, setSearchName] = useState('')
  const [loading, setLoading] = useState(true);
  const [ReqUsers, setRequsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(ReqUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast()
  const RequestCollectionRef = collection(db, 'NewAccountReq');
  const [token, setToken] = useState<string>('');
  const APIURL = import.meta.env.VITE_API_URL;
  const [parent,] = useAutoAnimate();
  const debouncedSearchTerm = useDebounce(searchName, 300);
  const [sheet, setSheet] = useState(false);
  const [sortBox, setSortBox] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [SubmitLoadingR, setSubmitLoadingR] = useState(false);
  const [SubmitLoadingA, setSubmitLoadingA] = useState(false);
  const [DeleteLoading, setDeleteLoading] = useState(false);

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

  const DeleteUser = async (id: string) => {
    setDeleteLoading(true);
    try {
      //  by client sdk firebase and firesote delete user from collection 
      await deleteDoc(doc(db, 'NewAccountReq', id));
      toast({
        variant: 'success',
        description: 'User deleted successfully',
      });
      getUsers();
      setDeleteLoading(false);
    }
    catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        description: 'There was an error deleting the user',
      });
      setDeleteLoading(false);
    }
  }

  const SortFields = [
    'pending',
    'verified',
  ];

  const SortData = (field: string) => {
    if (field === 'pending') {
      setFilteredUsers(ReqUsers.filter((user) => user.status === 'pending'));
      return;
    } else if (field === 'verified') {
      setFilteredUsers(ReqUsers.filter((user) => user.status === 'verified'));
      return;
    } else {
      setSortBox(false);
      setSelectedItem('');
      setFilteredUsers(ReqUsers);
    }
  };

  const getUsers = async () => {
    try {
      const usersSnapshot = await getDocs(RequestCollectionRef);
      const Requsers = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
      setRequsers(Requsers);
      setLoading(false);
      filterAndSortStudents();
    } catch (error: any) {
      console.error(error);
    }
  }

  function filterAndSortStudents() {
    let filtered = ReqUsers;
    if (searchName !== '') {
      filtered = filtered.filter((user) => user.team_name.toLowerCase().includes(searchName.toLowerCase()));
    } else {
      filtered = ReqUsers;
    }
    return setFilteredUsers(filtered);
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [ReqUsers, debouncedSearchTerm]);

  useEffect(() => {
    if (selectedItem) {
      SortData(selectedItem);
    }
  }, [selectedItem]);

  const handleSheet = () => {
    setSheet(!sheet);
  }

  const handleView = (user: User) => {
    setSheet(!sheet);
    setSelectedUser(user);
    // console.log(user);
  }

  const handleSortBox = () => {
    setSortBox(!sortBox);
  }

  const handleReject = async (user: User | null) => {
    if (!user) return;
    setSubmitLoadingR(true);
    try {
      const response = await fetch(`${APIURL}/admin/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: user.email }),
      });
      const responseData = await response.json();
      if (responseData) {
        // console.log('responseData', responseData);
      }
      setSheet(false);
      toast({
        variant: 'success',
        description: 'User Rejected Successfully',
      });
      setSubmitLoadingR(false);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        description: 'There was an error rejecting the user',
      });
      setSubmitLoadingR(false);
    }
  }

  const handleAccept = async (user: User | null) => {
    if (!user) return;
    setSubmitLoadingA(true);
    try {
      const data = {
        email: user.email,
        password: user.password,
        team_name: user.team_name,
        Nodal_Officer: user.Nodal_Officer,
        phone_number: user.phone_number,
        role: user.role,
        status: 'verified',
        createdAt: Timestamp.now(),
      }
      const response = await fetch(`${APIURL}/admin/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      // console.log('responseData', responseData);
      if (response.ok) {
        setSubmitLoadingA(false);
        // await DeleteUser(user.id);
        setSheet(false);
        toast({
          variant: 'success',
          description: responseData.message,
        });
        getUsers();
      } else {
        setSubmitLoadingA(false);
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
      setSubmitLoadingA(false);
    }
  }

  const getVerificationVariant = (verification: string) => {
    if (verification === 'Rejected') {
      return 'destructive';
    } else if (verification === 'pending') {
      return 'pending';
    } else if (verification === 'verified') {
      return 'active';
    } else {
      return 'default';
    }
  }
  return (
    <div className='flex flex-col gap-10 justify-start items-center h-full mt-20  mx-auto' >

      {DeleteLoading && (
        <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
            <div className='w-full flex items-center justify-center gap-4'>
              <ImSpinner6 className="animate-spin h-6 w-6 text-emerald-600" />
              <h1 className='text-emerald-600 font-bold'>Deleting Students from list...</h1>
            </div>
          </div>
        </div>
      )}

      <div className='w-full flex flex-col gap-4 pb-8'>
        <div className="overflow-x-auto">
          <div className='flex items-center justify-between gap-4 py-4'>
            <div className='w-full relative max-w-[360px]'>
              <IoIosSearch className='absolute bottom-4 right-2 text-lg text-emerald-700' />
              <Input type="search" placeholder="Filter Users..." className='h-[50px]  bg-slate-300 pr-8 pl-4' value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>
            <div className='flex gap-2'>
              <DropdownMenu open={sortBox} onOpenChange={handleSortBox}>
                <DropdownMenuTrigger className='outline-none border-none '>
                  <div className='p-2 bg-emerald-700 flex gap-2 items-center justify-center text-white rounded-lg px-4' onClick={() => setSortBox(!sortBox)}>Sort <IoIosArrowDown /></div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={selectedItem} onValueChange={setSelectedItem}>
                    {SortFields.map((item) => (
                      <DropdownMenuRadioItem key={item} value={item}>
                        {item}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <Button onClick={() => SortData('')} className=' font-bold mt-4 border bg-white text-gray-700 dark:text-white dark:bg-gray-900 w-full p-0 hover:text-white dark:hover:bg-gray-800'>Clear</Button>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>


          <div className='border border-emerald-700 rounded-[20px] overflow-auto '>
            <table className="min-w-full rounded-xl  " id='custom-table'>
              <thead className=''>
                <tr >
                  <th className="col-id tracking-wider">No</th>
                  <th className="col-name tracking-wider">Team Name</th>
                  <th className="col-category tracking-wider">Nodal Officer</th>
                  <th className="col-email tracking-wider">status</th>
                  <th className="col-email tracking-wider">Verification</th>
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
                        <td className="col-name whitespace-nowrap">{user.team_name}</td>
                        <td className="col-category whitespace-nowrap">{user.Nodal_Officer}</td>
                        <td className="col-email whitespace-nowrap ">
                          <Badge variant={`${getVerificationVariant(user.Verification)}`}>
                            {user.Verification}
                          </Badge>
                        </td>
                        <td className={`col-email whitespace-nowrap text-medium ${user.status === 'pending' ? 'text-amber-400' : 'text-green-600'} `}>
                          <Badge variant={`${user.status === 'pending' ? 'pending' : 'active'}`} style={{ overflowWrap: 'anywhere' }}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className='col-action whitespace-nowrap flex gap-1 items-center justify-center h-full w-full'>
                          <FaEye className='col-action mx-auto text-emerald-700 cursor-pointer hover:text-emerald-600 transition-all ease-in-out' onClick={() => handleView(user)} />
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <AiFillDelete className='col-action mx-auto text-red-500 cursor-pointer hover:text-red-600 transition-all ease-in-out' />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className='dark:text-white'>
                                  Are you sure you want to delete this account request?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  The user will be deleted from the system and will not be able to login.
                                  and also not sent any email to the user.you can't undo this action.
                                  So be sure before you continue.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className='dark:text-white'>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => DeleteUser(user.email)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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


      <Sheet open={sheet} onOpenChange={handleSheet}>
        <SheetContent side={'right'}>
          <SheetHeader>
            <SheetTitle>
              Account Request Details
            </SheetTitle>
            <SheetDescription>
              View the details of the user account request and accept or reject the request.
            </SheetDescription>
          </SheetHeader>
          <div className='px-4 py-4'>

            <dl className='grid grid-cols-1 gap-4 my-6'>
              <div className='flex items-center'>
                <dt className='text-gray-600 dark:text-gray-400'>Team Name</dt>
                <dd className='ml-2 text-gray-800 dark:text-gray-200'>{selectedUser?.team_name}</dd>
              </div>
              <div className='flex items-center'>
                <dt className='text-gray-600 dark:text-gray-400'>Nodal Officer</dt>
                <dd className='ml-2 text-gray-800 dark:text-gray-200'>{selectedUser?.Nodal_Officer}</dd>
              </div>
              <div className='flex items-center'>
                <dt className='text-gray-600 dark:text-gray-400'>Request Date</dt>
                <dd className='ml-2 text-gray-800 dark:text-gray-200'>{selectedUser?.createdAt}</dd>
              </div>
              <div className='flex items-center'>
                <dt className='text-gray-600 dark:text-gray-400'>Email</dt>
                <dd className='ml-2 text-gray-800 dark:text-gray-200'>{selectedUser?.email}</dd>
              </div>
              <div className='flex items-center'>
                <dt className='text-gray-600 dark:text-gray-400'>Phone Number</dt>
                <dd className='ml-2 text-gray-800 dark:text-gray-200'>{selectedUser?.phone_number}

                </dd>
              </div>
              {selectedUser?.contact_number && (
                <div className='flex items-center'>
                  <dt className='text-gray-600 dark:text-gray-400'>Contact number</dt>
                  <dd className='ml-2 text-gray-800 dark:text-gray-200'>{selectedUser?.contact_number}</dd>
                </div>
              )}
              <div className='flex items-center'>
                <dt className='text-gray-600 dark:text-gray-400'>Password</dt>
                <dd className='ml-2 text-gray-800 dark:text-gray-200'>{
                  selectedUser?.password.split('').map((_char, index) => {
                    return <span key={index}>*</span>
                  })
                }</dd>
              </div>
              <div className='flex items-center'>
                <dt className='text-gray-600 dark:text-gray-400'>Verification</dt>
                <dd className='ml-2 text-gray-800 dark:text-gray-200'>{selectedUser?.Verification}</dd>
              </div>
              <div className='flex items-center'>
                <dt className='text-gray-600 dark:text-gray-400'>Message</dt> :<br />
                <dd className='ml-2 text-gray-800 dark:text-gray-200 text-left'>{selectedUser?.message}</dd>
              </div>
            </dl>
            <div className='flex items-center justify-around'>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <LoadingButton className='bg-emerald-700 text-white dark:text-white dark:bg-emerald-700 min-w-[120px] hover:bg-emerald-800 dark:hover:bg-emerald-800' loading={SubmitLoadingA} >Accept</LoadingButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className='dark:text-white'>
                      Are you sure you want to accept this user?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      The user will be added to the system and will be able to login.
                      and also sent a accept email to the user. So be sure before you continue.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className='dark:text-white'>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleAccept(selectedUser)}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <LoadingButton className='bg-red-500 text-white dark:text-white dark:bg-red-500 min-w-[120px] hover:bg-red-700 dark:hover:bg-red-700' loading={SubmitLoadingR} >Reject</LoadingButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className='dark:text-white'>
                      Are you sure you want to Reject this user?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      The user will be rejected and will not be able to login.
                      and also sent a reject email to the user. So be sure before you continue.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className='dark:text-white'>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleReject(selectedUser)}>Continue</AlertDialogAction>
                  </AlertDialogFooter>

                </AlertDialogContent>
              </AlertDialog>

            </div>
          </div>
          <p className='text-gray-600 dark:text-gray-300 p-4 border-l-4 border-blue-500 bg-blue-100 dark:bg-slate-900'>
            If you need clarification on the user request, you can contact the user by email or phone number.
            If you are sure that the user is genuine, you can accept the request. <br />
            if your are not sure <div onClick={() => window.open(`https://wa.me/${selectedUser?.phone_number}`)} className='cursor-pointer'> <FaWhatsapp className='text-green-500 dark:text-green-500' /></div> contact the user.
          </p>
        </SheetContent>
      </Sheet>
      <p className='text-gray-600 dark:text-gray-300 p-4 border-l-4 border-blue-500 bg-blue-100 dark:bg-slate-800'>
        The Status is when user request sent , we sent a verification code to their email and when they verify the code then the status is changed to verified. Others are pending.
        So before accepting pending request be sure that the user is genuine.
      </p>
    </div >
  )
}

export default AccountRequest;
