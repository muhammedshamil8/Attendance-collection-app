import { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { IoIosArrowDown, IoIosSearch } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { auth, db } from "@/config/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";

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
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
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
import { onAuthStateChanged } from "firebase/auth";
import { MdPerson, MdPersonAddDisabled } from "react-icons/md";
import { LoadingButton } from "@/components/ui/loading-button";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import useDebounce from "@/lib/debounce";

interface User {
  id: string;
  email: string;
  team_name: string;
  role: string;
  Nodal_Officer: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
  events?: string[];
}

function users() {
  const [handleCreateUser, setHandleCreateUser] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [Users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(Users);
  const { toast } = useToast();
  const UserCollectionRef = collection(db, "users");
  const [token, setToken] = useState<string>("");
  const APIURL = import.meta.env.VITE_API_URL;
  const [parent] = useAutoAnimate();
  const debouncedSearchTerm = useDebounce(searchName, 300);
  const [method, setMethod] = useState("POST");
  const [updateuserId, setUpdateUserId] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [DeleteLoading, setDeleteLoading] = useState(false);
  const [EnableDisableLoading, setEnableDisableLoading] = useState(false);
  const [EnableDisableText, setEnableDisableText] =
    useState("Disabling User...");

  const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password:
      method === "POST"
        ? z
            .string()
            .min(6, { message: "Password must be at least 6 characters" })
        : z.string().optional(),
    team_name: z
      .string()
      .min(3, { message: "Name must be at least 3 characters" }),
    role: z.string(),
    status: z.boolean(),
    Nodal_Officer: z.string().nonempty({ message: "Head name required" }),
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken().then((idToken) => {
          setToken(idToken);
        });
      } else {
      }
    });

    return () => unsubscribe();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      team_name: "",
      Nodal_Officer: "",
      role: "user",
      status: true,
    },
  });

  const EditUser = (id: string, user: User) => {
    setUpdateUserId(id);
    form.setValue("email", user.email);
    form.setValue("team_name", user.team_name);
    form.setValue("Nodal_Officer", user.Nodal_Officer);
    openModal("PUT");
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitLoading(true);
    if (method === "POST") {
      CreateUser(values);
    } else if (method === "PUT") {
      if (updateuserId) UpdateUser(updateuserId, values);
    } else {
      setSubmitLoading(false);
      // console.log('User ID not found');
    }
  }

  const CreateUser = async (values: z.infer<typeof formSchema>) => {
    try {
      const data = {
        email: values.email,
        password: values.password,
        team_name: values.team_name,
        Nodal_Officer: values.Nodal_Officer,
        role: values.role,
        status: values.status,
        createdAt: Timestamp.now(),
      };
      const response = await fetch(`${APIURL}/admin/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      // console.log('responseData', responseData);
      if (response.ok) {
        toast({
          variant: "success",
          description: responseData.message,
        });
        getUsers();
        setSubmitLoading(false);
        form.reset();
        closeModal();
      } else {
        toast({
          variant: "destructive",
          description: responseData.message,
        });
        setSubmitLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        description: error.message,
      });
      closeModal();
      setSubmitLoading(false);
      form.reset();
    }
  };

  const DeleteUser = async (id: string) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`${APIURL}/admin/delete-user/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      // console.log(data);
      if (response.ok) {
        toast({
          variant: "success",
          description: data.message,
        });
        getUsers();
        setDeleteLoading(false);
      } else {
        toast({
          variant: "destructive",
          description: data.message,
        });
        setDeleteLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        description: error.message,
      });
      setDeleteLoading(false);
    }
  };

  const DisableUser = async (id: string) => {
    setEnableDisableText("Disabling User...");
    setEnableDisableLoading(true);
    try {
      const response = await fetch(`${APIURL}/admin/disable-user/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      // console.log(data);
      if (response.ok) {
        toast({
          variant: "success",
          description: data.message,
        });
        getUsers();
        setEnableDisableLoading(false);
      } else {
        toast({
          variant: "destructive",
          description: data.message,
        });
        setEnableDisableLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        description: error.message,
      });
      setEnableDisableLoading(false);
    }
  };

  const EnableUser = async (id: string) => {
    setEnableDisableText("Enabling User...");
    setEnableDisableLoading(true);
    try {
      const response = await fetch(`${APIURL}/admin/enable-user/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      // console.log(data);
      if (response.ok) {
        toast({
          variant: "success",
          description: data.message,
        });
        getUsers();
        setEnableDisableLoading(false);
      } else {
        toast({
          variant: "destructive",
          description: data.message,
        });
        setEnableDisableLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        description: error.message,
      });
      setEnableDisableLoading(false);
    }
  };

  const UpdateUser = async (id: string, values: z.infer<typeof formSchema>) => {
    try {
      const Datas = {
        email: values.email,
        team_name: values.team_name,
        Nodal_Officer: values.Nodal_Officer,
        role: values.role,
        status: values.status,
        updatedAt: Timestamp.now(),
      };
      const response = await fetch(`${APIURL}/admin/update-user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(Datas),
      });
      const data = await response.json();
      // console.log(data);
      if (response.ok) {
        toast({
          variant: "success",
          description: data.message,
        });
        getUsers();
        setSubmitLoading(false);
      } else {
        toast({
          variant: "destructive",
          description: data.message,
        });
        setSubmitLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        description: error.message,
      });
      setSubmitLoading(false);
    } finally {
      setSubmitLoading(false);
      form.reset();
      closeModal();
    }
  };

  const Fields = [
    { label: "No", value: "col-id" },
    { label: "Name", value: "col-name" },
    { label: "officer", value: "col-officer" },
    { label: "Email", value: "col-email" },
    { label: "Action", value: "col-action" },
  ];

  const [selectedItems, setSelectedItems] = useState<string[]>([
    "col-id",
    "col-name",
    "col-officer",
    "col-email",
    "col-action",
  ]);

  const handleItemSelect = (item: { label: string; value: string }) => {
    let updatedItems;
    if (selectedItems.includes(item.value)) {
      updatedItems = selectedItems.filter((value) => value !== item.value);
    } else {
      updatedItems = [...selectedItems, item.value];
    }
    setSelectedItems(updatedItems);
    updateSelectedItems(updatedItems);
  };

  const updateSelectedItems = (selectedItems: string[]) => {
    const allItems = Fields.map((item) => item.value);
    const unselectedItems = allItems.filter(
      (item) => !selectedItems.includes(item),
    );

    // Hide unselected columns
    unselectedItems.forEach((item) => {
      const elements = document.querySelectorAll(`.${item}`);
      elements.forEach((element) => {
        (element as HTMLElement).classList.add("hidden-column");
      });
    });

    // Show selected columns
    selectedItems.forEach((item) => {
      const elements = document.querySelectorAll(`.${item}`);
      elements.forEach((element) => {
        (element as HTMLElement).classList.remove("hidden-column");
      });
    });
  };

  const getUsers = async () => {
    try {
      const usersSnapshot = await getDocs(UserCollectionRef);
      const filteredUsers = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      const filteredUserRoleUsers = filteredUsers.filter(
        (user) => user.role === "user",
      );
      // console.log('filteredUserRoleUsers', filteredUserRoleUsers);
      setUsers(filteredUserRoleUsers);
      setLoading(false);
      filterAndSortStudents();
    } catch (error: any) {
      console.error(error);
    }
  };

  const closeModal = () => {
    setHandleCreateUser(false);
  };
  const openModal = (method: string) => {
    setMethod(method);
    if (method === "POST") {
      form.setValue("email", "");
      form.setValue("password", "");
      form.setValue("team_name", "");
      form.setValue("Nodal_Officer", "");
      form.setValue("role", "user");
      form.setValue("status", true);
    }
    setHandleCreateUser(true);
  };

  function filterAndSortStudents() {
    let filtered = Users;
    if (searchName !== "") {
      filtered = filtered.filter((user) =>
        user.team_name.toLowerCase().includes(searchName.toLowerCase()),
      );
    } else {
      filtered = Users;
    }
    return setFilteredUsers(filtered);
  }

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    updateSelectedItems(selectedItems);
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [Users, debouncedSearchTerm]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mx-auto mt-20 flex h-full flex-col items-center justify-start gap-10">
      {DeleteLoading && (
        <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/50">
          <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
            <div className="flex w-full items-center justify-center gap-4">
              <ImSpinner6 className="h-6 w-6 animate-spin text-emerald-600" />
              <h1 className="font-bold text-emerald-600">Deleting User...</h1>
            </div>
          </div>
        </div>
      )}

      {EnableDisableLoading && (
        <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/50">
          <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
            <div className="flex w-full items-center justify-center gap-4">
              <ImSpinner6 className="h-6 w-6 animate-spin text-emerald-600" />
              <h1 className="font-bold text-emerald-600">
                {EnableDisableText}
              </h1>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        <Button
          className="flex h-[50px] w-full items-center justify-between gap-4 rounded-xl !bg-slate-300 font-bold"
          onClick={() => openModal("POST")}
        >
          <p className="text-emerald-700">Add User</p>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700">
            <LuPlus className="text-white" />
          </div>
        </Button>
      </div>

      <div className="flex w-full flex-col gap-4 pb-8">
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="relative w-full max-w-[360px]">
              <IoIosSearch className="absolute bottom-4 right-2 text-lg text-emerald-700" />
              <Input
                type="search"
                placeholder="Filter Users..."
                className="h-[50px] bg-slate-300 pl-4 pr-8"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="border-none outline-none">
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-700 p-2 px-4 text-white">
                    Columns <IoIosArrowDown />
                  </div>
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

          <div className="overflow-auto rounded-[20px] border border-emerald-700">
            <table className="min-w-full rounded-xl" id="custom-table">
              <thead className="">
                <tr>
                  <th className="col-id tracking-wider">No</th>
                  <th className="col-name tracking-wider">Name</th>
                  <th className="col-officer tracking-wider">Nodal Officer</th>
                  <th className="col-email tracking-wider">Email</th>
                  <th className="col-action tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody ref={parent}>
                {loading && loading ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      <div className="flex items-center justify-center">
                        <ImSpinner6 className="mx-2 h-8 w-8 animate-spin text-lg text-gray-400" />{" "}
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={index + 1}>
                      <td className="col-id whitespace-nowrap">{index + 1}</td>
                      <td className="col-name whitespace-nowrap">
                        {user.team_name}
                      </td>
                      <td className="col-officer whitespace-nowrap">
                        {user.Nodal_Officer}
                      </td>
                      <td className="col-email whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="col-action flex h-full w-full items-center justify-center gap-1 whitespace-nowrap">
                        <AiFillEdit
                          className="col-action mx-auto cursor-pointer text-emerald-700 transition-all ease-in-out hover:text-emerald-600"
                          onClick={() => EditUser(user.id, user)}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <>
                              <AiFillDelete className="col-action mx-auto cursor-pointer text-red-500 transition-all ease-in-out hover:text-red-600" />
                            </>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="dark:text-white">
                                Are you sure you want to delete this user?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. it will delete the
                                user permanently. so be sure before you
                                continue. the user & user all data will be lost.
                                you can disable the user if you want to keep the
                                data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="dark:text-white">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => DeleteUser(user.id)}
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        {user.status ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <>
                                <MdPerson className="col-action mx-auto cursor-pointer text-emerald-700 transition-all ease-in-out hover:text-gray-500" />
                              </>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-white">
                                  Are you sure you want to disable this user?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will disable the user. the user
                                  will not be able to login. you can enable the
                                  user again if you want to.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="dark:text-white">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => DisableUser(user.id)}
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <MdPersonAddDisabled className="col-action mx-auto cursor-pointer text-emerald-700 transition-all ease-in-out hover:text-gray-500" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-white">
                                  Are you sure you want to enable this user?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will enable the user. the user
                                  will be able to login. you can disable the
                                  user again if you want to.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="dark:text-white">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => EnableUser(user.id)}
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No data found
                    </td>
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

      <Dialog open={handleCreateUser} onOpenChange={closeModal}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              <div className="mx-auto my-4 text-center !text-[30px] !font-bold dark:text-white">
                Create User
              </div>
            </DialogTitle>
            {/* <DialogDescription>
                            you can create an event here
                        </DialogDescription> */}
          </DialogHeader>
          <div className="mx-auto flex w-full max-w-[320px] flex-col gap-5">
            <div className="w-full">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="team_name"
                    render={({ field }) => (
                      <FormItem ref={parent}>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl>
                          <Input
                            className="h-[50px]"
                            placeholder="eg: - IEDC"
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
                  <FormField
                    control={form.control}
                    name="Nodal_Officer"
                    render={({ field }) => (
                      <FormItem ref={parent}>
                        <FormLabel>Nodal Officer</FormLabel>
                        <FormControl>
                          <Input
                            className="h-[50px]"
                            placeholder="Faisal Sir"
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
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem ref={parent}>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            className="h-[50px]"
                            placeholder="Email"
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
                  {method === "POST" && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem ref={parent}>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                className="h-[50px]"
                                placeholder="Password"
                                {...field}
                              />
                              <div
                                className="absolute right-4 top-4 cursor-pointer dark:text-white"
                                onClick={toggleShowPassword}
                              >
                                {showPassword ? (
                                  <IoEyeOutline />
                                ) : (
                                  <IoEyeOffOutline />
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="flex items-center justify-center gap-2 pb-4">
                    <Button
                      type="button"
                      onClick={closeModal}
                      className="mt-6 w-full !bg-slate-200 font-bold !text-emerald-600"
                    >
                      Cancel
                    </Button>
                    <LoadingButton
                      className="mt-6 w-full bg-emerald-600 font-bold !text-white transition-all ease-in-out hover:bg-emerald-700"
                      loading={submitLoading}
                      type="submit"
                    >
                      Submit
                    </LoadingButton>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default users;
