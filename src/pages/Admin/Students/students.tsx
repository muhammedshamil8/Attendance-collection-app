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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { IoIosArrowDown, IoIosSearch } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useToast } from "@/components/ui/use-toast";
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
import getStudentYear from "@/lib/Year";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import useDebounce from "@/lib/debounce";
import { LoadingButton } from "@/components/ui/loading-button";

const formSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  admissionNo: z.string().nonempty({ message: "Admission no is required" }),
  rollNo: z.string().nonempty({ message: "Roll no is required" }),
  department: z.string().nonempty({ message: "Department is required" }),
  joinedYear: z
    .string()
    .nonempty({ message: "Joined Year is required" })
    .length(4, { message: "Year must be 4 digits" }),
  section: z.string().nonempty({ message: "Section is required" }),
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
  section: string;
  joinedYear: string;
  email?: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  active: boolean;
}

interface StudentForm {
  id?: string;
  name: string;
  admissionNo: string;
  rollNo: string;
  section: string;
  department: string;
  joinedYear: string;
  email?: string;
  phone?: string;
}

function Students() {
  const [handleCreateStudent, setHandleCreateStudent] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [sortBox, setSortBox] = useState(false);
  const departmentCollectionRef = collection(db, "departments");
  const studentCollectionRef = collection(db, "students");
  const [loading, setLoading] = useState(true);
  const [students, setStudnets] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [Department, setDepartment] = useState<string[]>([]);
  const [method, setMethod] = useState<string>("POST");
  const { toast } = useToast();
  const [parent] = useAutoAnimate();
  const debouncedSearchTerm = useDebounce(searchName, 300);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [DeleteLoading, setDeleteLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      admissionNo: "",
      rollNo: "",
      section: "",
      department: "",
      joinedYear: "",
      id: "",
      // email: "",
      // phone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitLoading(true);
    method === "POST" ? createStudent(values) : updateStudent(values);
  }

  const createStudent = async (values: StudentForm) => {
    if (values.id === "") {
      values.id = values.admissionNo;
    }
    const alreadyAdded = students.some(
      (student) => student.admissionNo === values.admissionNo,
    );
    if (alreadyAdded) {
      setSubmitLoading(false);
      return toast({
        variant: "destructive",
        description: "Student admission no already added",
      });
    }
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
      });
      getStudents();
      setSubmitLoading(false);
      setHandleCreateStudent(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
      setSubmitLoading(false);
    }
  };

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
  const [selectedItems2, setSelectedItems2] = useState<string>("");

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

  useEffect(() => {
    updateSelectedItems(selectedItems);
  }, []);

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
      const filteredUsers = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[];
      setStudnets(filteredUsers);
      setFilteredStudents(filteredUsers);
      setLoading(false);
      // filterAndSortStudents();
    } catch (error: any) {
      console.error(error);
    }
  };

  const closeModal = () => {
    setHandleCreateStudent(false);
  };
  const openModal = (method: string) => {
    setMethod(method);
    setHandleCreateStudent(true);
  };

  function filterAndSortStudents() {
    let filtered = students;
    // console.log('filtered', filtered);
    // console.log(students);
    if (searchName !== "") {
      filtered = filtered.filter(
        (student) =>
          student?.name.toLowerCase().includes(searchName.toLowerCase()) ||
          student?.admissionNo
            .toLowerCase()
            .includes(searchName.toLowerCase()) ||
          student?.department.toLowerCase().includes(searchName.toLowerCase()),
      );
    } else {
      filtered = students;
      // console.log('no search value');
    }
    return setFilteredStudents(
      filtered.sort((a, b) => {
        if (selectedItems2 === "department") {
          // console.log('department');
          return a.department.localeCompare(b.department);
        } else if (selectedItems2 === "year-desc") {
          // console.log('year-desc');
          return b.joinedYear.localeCompare(a.joinedYear);
        } else if (selectedItems2 === "year-asc") {
          return a.joinedYear.localeCompare(b.joinedYear);
        } else {
          // console.log('no sort value');
          return 0;
        }
      }),
    );
  }

  useEffect(() => {
    filterAndSortStudents();
  }, [debouncedSearchTerm, selectedItems2]);

  useEffect(() => {
    getDepartment();
    getStudents();
  }, []);

  const handleSortBox = () => {
    setSortBox(!sortBox);
  };

  const handleDeleteStudnet = async (id: string) => {
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(studentCollectionRef, id));
      // console.log('id', id);
      toast({
        variant: "success",
        description: "Student deleted successfully",
      });
      getStudents();
      setDeleteLoading(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
      setDeleteLoading(false);
    }
  };
  const handleEditStudent = (student: Student) => {
    // console.log('student', student);
    try {
      form.setValue("name", student.name);
      form.setValue("admissionNo", student.admissionNo);
      form.setValue("rollNo", student.rollNo);
      form.setValue("department", student.department);
      form.setValue("joinedYear", student.joinedYear);
      form.setValue("id", student.id);
      // form.setValue('email', student.email);
      // form.setValue('phone', student.phone);
      openModal("PUT");
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
    }
  };

  const updateStudent = async (student: StudentForm) => {
    try {
      if (!student.id) {
        setSubmitLoading(false);
        throw new Error("Student id is missing");
      }
      await updateDoc(doc(studentCollectionRef, student.id), {
        ...student,
        updatedAt: Timestamp.now(),
      });
      toast({
        variant: "success",
        description: "Student updated successfully",
      });
      setHandleCreateStudent(false);
      getStudents();
      setSubmitLoading(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-20 flex h-full flex-col items-center justify-start gap-10">
      {DeleteLoading && (
        <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/50">
          <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
            <div className="flex w-full items-center justify-center gap-4">
              <ImSpinner6 className="h-6 w-6 animate-spin text-emerald-600" />
              <h1 className="font-bold text-emerald-600">
                Deleting Students from Our Storage...
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
          <p className="text-emerald-700">Add Student</p>
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
                placeholder="Filter Students..."
                className="h-[50px] bg-slate-300 pl-4 pr-8"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu open={sortBox} onOpenChange={handleSortBox}>
                <DropdownMenuTrigger className="border-none outline-none">
                  <div
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-700 p-2 px-4 text-white"
                    onClick={() => setSortBox(!sortBox)}
                  >
                    Sort <IoIosArrowDown />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedItems2}
                    onValueChange={setSelectedItems2}
                  >
                    {SortFields.map((item, index) => (
                      <DropdownMenuRadioItem key={index} value={item.value}>
                        {item.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <Button
                    onClick={() => {
                      setSelectedItems2("");
                      setSortBox(!sortBox);
                    }}
                    className="mt-4 w-full border bg-white p-0 font-bold text-gray-700 hover:text-white dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                  >
                    Clear
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="border-none outline-none">
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-700 p-2 px-4 text-white">
                    Columns <IoIosArrowDown />
                  </div>
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

          <div className="overflow-auto overflow-y-hidden rounded-[20px] border border-emerald-700">
            <table className="min-w-full rounded-xl" id="custom-table">
              <thead className="">
                <tr>
                  <th className="col-no tracking-wider">No</th>
                  <th className="col-name tracking-wider">Student Name</th>
                  <th className="col-admissionNo tracking-wider">
                    Admission No
                  </th>
                  <th className="col-rollNo tracking-wider">Roll No</th>
                  <th className="col-department tracking-wider">Department</th>
                  <th className="col-year tracking-wider">Year</th>
                  <th className="col-action tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="" ref={parent}>
                {loading && loading ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      <div className="flex items-center justify-center">
                        <ImSpinner6 className="mx-2 h-8 w-8 animate-spin text-lg text-gray-400" />{" "}
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr key={index}>
                      <td className="col-no whitespace-nowrap">
                        {index + 1}
                        {/* <pre>
                            {JSON.stringify(student)}
                          </pre> */}
                      </td>
                      <td className="col-name whitespace-nowrap">
                        {student.name}
                      </td>
                      <td className="col-admissionNo whitespace-nowrap">
                        {student.admissionNo}
                      </td>
                      <td className="col-rollNo whitespace-nowrap">
                        {student.rollNo}
                      </td>
                      <td className="col-department whitespace-nowrap">
                        {student.department}
                      </td>
                      <td className="col-year whitespace-nowrap">
                        {getStudentYear(student.joinedYear)}
                      </td>
                      <td className="col-action flex items-center justify-center gap-1 whitespace-nowrap">
                        <AiFillEdit
                          className="col-action mx-auto cursor-pointer text-emerald-700 transition-all ease-in-out hover:text-emerald-600"
                          onClick={() => handleEditStudent(student)}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <AiFillDelete className="col-action mx-auto cursor-pointer text-red-500 transition-all ease-in-out hover:text-red-600" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="dark:text-white">
                                Are you sure you want to delete this student?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. it will delete the
                                student permanently. so be sure before you
                                continue.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="dark:text-white">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteStudnet(student.id)}
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">
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

      <Dialog open={handleCreateStudent} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="mx-auto my-4 text-center !text-[30px] !font-bold dark:text-white">
                Create New Student
              </div>
            </DialogTitle>
            {/* <DialogDescription>
                            you can create an event here
                        </DialogDescription> */}
          </DialogHeader>
          <div className="mx-auto flex w-full flex-col gap-5">
            <div className="w-full">
              <div className="mx-auto mt-4 flex w-full max-w-[320px] flex-col gap-5">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem ref={parent}>
                          <FormLabel>Student Name</FormLabel>
                          <FormControl>
                            <Input
                              className="h-[50px]"
                              placeholder="eg: - NSS"
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
                      name="admissionNo"
                      render={({ field }) => (
                        <FormItem ref={parent}>
                          <FormLabel>Admission No</FormLabel>
                          <FormControl>
                            <Input
                              className="h-[50px]"
                              placeholder="eg: - ABSC123"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
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
                      name="section"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Select Section</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-row gap-10 space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="UG" />
                                </FormControl>
                                <FormLabel className="font-normal text-white">
                                  UG
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="PG" />
                                </FormControl>
                                <FormLabel className="font-normal text-white">
                                  PG
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field: { onChange, value } }) => (
                        <FormItem ref={parent}>
                          <FormLabel>Select Department</FormLabel>
                          <FormControl>
                            <Popover open={open} onOpenChange={setOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={open}
                                  className="h-[50px] w-full justify-between bg-slate-100 dark:text-white"
                                >
                                  {value
                                    ? Department.find((item) => item === value)
                                    : "Select Department..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="!w-full min-w-[300px] p-0">
                                <Command>
                                  <CommandInput placeholder="Search Department..." />
                                  <CommandEmpty>
                                    No Department found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    <CommandList className="max-h-[200px]">
                                      {Department.map((item, index) => (
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
                                              value === item
                                                ? "opacity-100"
                                                : "opacity-0",
                                            )}
                                          />
                                          {item}
                                        </CommandItem>
                                      ))}
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
                      name="rollNo"
                      render={({ field }) => (
                        <FormItem ref={parent}>
                          <FormLabel>Roll No</FormLabel>
                          <FormControl>
                            <Input
                              className="h-[50px]"
                              placeholder="eg: - 7"
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
                      name="joinedYear"
                      render={({ field }) => (
                        <FormItem ref={parent}>
                          <FormLabel>Joined Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              aria-disabled={true}
                              pattern="[0-9]{4}"
                              inputMode="numeric"
                              maxLength={4}
                              placeholder="Joined Year"
                              className="h-[50px]"
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Students;
