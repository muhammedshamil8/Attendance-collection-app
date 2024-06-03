import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AiFillDelete } from "react-icons/ai";
import { IoMdArrowDropdown, IoIosArrowDown, IoIosSearch } from "react-icons/io";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronsUpDown, SmileIcon } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useParams } from "react-router-dom";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { auth, db } from "@/config/firebase";

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
import { toast } from "@/components/ui/use-toast";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

import PrintTable from "@/components/Pdf";
import getStudentYear from "@/lib/Year";
import exportToExcel from "@/lib/Excel";
import BarcodeReader from "@/components/BarcodeReader";
import { onAuthStateChanged } from "firebase/auth";
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
}
interface PdfData {
  No: number;
  AdmissionNo: string;
  Name: string;
  section: string;
  RollNo: string;
  Department: string;
  JoinedYear: string;
}

function Event() {
  const [handleCreateStudent, setHandleCreateStudent] = useState(false);
  const [open, setOpen] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [searchAdmNo, setSearchAdmNo] = useState("");
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBox, setSortBox] = useState(false);
  const departmentCollectionRef = collection(db, "departments");
  const studentCollectionRef = collection(db, "students");
  const eventCollectionRef = collection(db, "events");
  const [Department, setDepartment] = useState<string[]>([]);
  const [students, setStudnets] = useState<Student[]>([]);
  const [, setFilteredStudents] = useState<Student[]>(students);
  const [filteredAttendedStudents, setFilteredAttendedStudents] =
    useState<Student[]>(students);
  const [PdfData, setPdfData] = useState<PdfData[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [attendedStudents, setAttendedStudents] = useState<string[]>([]);
  const [AttendedStudentsObj, setAttendedStudentsObj] = useState<Student[]>([]);
  const { id } = useParams();
  const [event, setEvent] = useState<any>({});
  const [token, setToken] = useState<string>("");
  const APIURL = import.meta.env.VITE_API_URL;
  const [eventLoading, setEventLoading] = useState(true);
  const [scanModal, setScanModal] = useState(false);
  const [barcode, setBarcode] = useState<string>("");
  const [CreateSubmitLoading, setCreateSubmitLoading] = useState(false);
  const [AddSubmitLoading, setAddSubmitLoading] = useState(false);
  const [ClearSubmitLoading, setClearSubmitLoading] = useState(false);
  const [DeleteLoading, setDeleteLoading] = useState(false);

  const handleDetected = (result: string) => {
    setBarcode(result);
  };

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
    if (values.id === "") {
      values.id = values.admissionNo;
    }
    setCreateSubmitLoading(true);
    const alreadyAdded = students.some(
      (student) => student.admissionNo === values.admissionNo,
    );
    if (alreadyAdded) {
      setCreateSubmitLoading(false);
      return toast({
        variant: "destructive",
        description: "Student admission no already added",
      });
    }
    try {
      const response = await fetch(
        `${APIURL}/user/create-student/add-to-event`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...values,
            event_id: id,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            active: true,
          }),
        },
      );
      const data = await response.json();
      // console.log(data);
      if (response.ok) {
        toast({
          variant: "success",
          description: "Student added successfully",
        });
        await getStudents();
        setCreateSubmitLoading(false);
        setHandleCreateStudent(false);
        form.reset();
      } else {
        toast({
          variant: "destructive",
          description: data.message,
        });
        setCreateSubmitLoading(false);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message,
      });
      setCreateSubmitLoading(false);
    }
  }

  const AddStudenttoList = async (ids: string[]) => {
    setAddSubmitLoading(true);
    if (!ids.length) {
      setAddSubmitLoading(false);
      return toast({
        variant: "destructive",
        description: "Please select a student",
      });
    } else if (!id) {
      setAddSubmitLoading(false);
      return toast({
        variant: "destructive",
        description: "Event not found",
      });
    } else if (ids.includes("")) {
      setAddSubmitLoading(false);
      return toast({
        variant: "destructive",
        description: "Student ID cannot be empty",
      });
    }
    const alreadyAdded = ids.some((id) => attendedStudents.includes(id));
    if (alreadyAdded) {
      setAddSubmitLoading(false);
      return toast({
        variant: "destructive",
        description: "Student admission no already added",
      });
    }
    // console.log(ids);
    // console.log(students);
    const validStudents = ids.filter((id) =>
      students.some((student) => student.id === id),
    );
    // console.log(validStudents);
    if (validStudents.length !== ids.length) {
      setAddSubmitLoading(false);
      return toast({
        variant: "destructive",
        title: "Student not found",
        description:
          "The student you are trying to add is not found in the our storage. Please check the student admission no and try again.",
        duration: 6000,
      });
    }
    try {
      const updateDoc = doc(eventCollectionRef, id);
      await setDoc(
        updateDoc,
        {
          attendees: arrayUnion(...ids),
        },
        { merge: true },
      );
      toast({
        variant: "success",
        description: "Student added successfully",
      });
      getAttendedStudents();
      closeModal();
      setSelectedStudents([]);
      setSearchAdmNo("");
      setAddSubmitLoading(false);
      // console.log('Student added successfully');
    } catch (error: any) {
      setAddSubmitLoading(false);
      console.error(error);
    }
  };

  const RemoveStudentFromList = async (Studnetid: string) => {
    setDeleteLoading(true);
    if (!Studnetid) {
      setDeleteLoading(false);
      return toast({
        variant: "destructive",
        description: "Please select a student",
      });
    }
    try {
      const updateDoc = doc(eventCollectionRef, id);
      await setDoc(
        updateDoc,
        {
          attendees: arrayRemove(Studnetid),
        },
        { merge: true },
      );
      toast({
        variant: "success",
        description: "Student removed successfully",
      });
      getAttendedStudents();
      setDeleteLoading(false);
      // console.log('Student removed successfully');
    } catch (error: any) {
      setDeleteLoading(false);

      console.error(error);
    }
  };

  const handleClearAttendedStudents = async () => {
    setClearSubmitLoading(true);
    setDeleteLoading(false);
    try {
      const updateDoc = doc(eventCollectionRef, id);
      await setDoc(
        updateDoc,
        {
          attendees: [],
        },
        { merge: true },
      );
      toast({
        variant: "success",
        description: "All students removed successfully",
      });
      getAttendedStudents();
      setClearSubmitLoading(false);
      setDeleteLoading(false);
      // console.log('All students removed successfully');
    } catch (error: any) {
      setClearSubmitLoading(false);
      setDeleteLoading(false);
      console.error(error);
    }
  };

  const getAttendedStudents = async () => {
    setLoading(true);
    try {
      const eventDoc = await getDoc(doc(eventCollectionRef, id));
      const event = eventDoc.data();
      setEvent(event);
      setEventLoading(false);
      // console.log(event);

      if (event) {
        const attendedStudents = event.attendees;
        setAttendedStudents(attendedStudents);

        const attendedStudentObjects = students.filter((student) =>
          attendedStudents.includes(student.admissionNo),
        );

        // Sort attendedStudentObjects by department and then by joined year
        attendedStudentObjects.sort((a, b) => {
          // First, sort by department
          const departmentComparison = a.department.localeCompare(b.department);
          if (departmentComparison !== 0) {
            return departmentComparison;
          }
          // If departments are the same, sort by joined year
          return a.joinedYear.localeCompare(b.joinedYear);
        });

        setAttendedStudentsObj(attendedStudentObjects);

        const newFilteredAttendedStudents = attendedStudentObjects
          .map((student, index) => {
            const { admissionNo } = student;
            const studentData = students.find(
              (s) => s.admissionNo === admissionNo,
            );
            if (studentData) {
              return {
                No: index + 1,
                AdmissionNo: studentData.admissionNo,
                Name: studentData.name,
                section: studentData.section,
                RollNo: studentData.rollNo,
                Department: studentData.department,
                JoinedYear: getStudentYear(studentData.joinedYear),
              };
            }
            return null;
          })
          .filter((s) => s !== null) as Array<{
          No: number;
          AdmissionNo: string;
          Name: string;
          section: string;
          RollNo: string;
          Department: string;
          JoinedYear: string;
        }>;
        setPdfData(newFilteredAttendedStudents);
        setFilteredAttendedStudents(attendedStudentObjects);
        setLoading(false);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
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
      // filterAndSortStudents();
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    updateSelectedItems(selectedItems);
  }, []);

  const closeModal = () => {
    setHandleCreateStudent(false);
  };
  const openModal = () => {
    setHandleCreateStudent(true);
  };
  const handleExport = () => {
    setOpenExport(!openExport);
  };
  const openScanModal = () => {
    setScanModal(true);
  };
  const closeScanModal = () => {
    setScanModal(false);
  };

  const filteredStudentsAdmNo = students.filter((student) => {
    if (searchAdmNo === "") return null;
    return student.admissionNo
      .toLowerCase()
      .includes(searchAdmNo.toLowerCase());
  });

  function filterAndSortStudents() {
    let filtered = AttendedStudentsObj;

    // Apply search filter if searchName is provided
    if (searchName !== "") {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchName.toLowerCase()) ||
          student?.admissionNo
            .toLowerCase()
            .includes(searchName.toLowerCase()) ||
          student?.department.toLowerCase().includes(searchName.toLowerCase()),
      );
    }

    // Sort the filtered array
    filtered.sort((a, b) => {
      if (selectedItems2 === "department") {
        // Sort by department
        return (
          a.department.localeCompare(b.department) ||
          a.joinedYear.localeCompare(b.joinedYear)
        );
      } else if (selectedItems2 === "year-desc") {
        // Sort by year descending
        return b.joinedYear.localeCompare(a.joinedYear);
      } else if (selectedItems2 === "year-asc") {
        // Sort by year ascending
        return a.joinedYear.localeCompare(b.joinedYear);
      } else {
        return 0;
      }
    });

    setFilteredAttendedStudents(filtered);
  }

  useEffect(() => {
    filterAndSortStudents();
  }, [searchName, selectedItems2]);

  const handleSortBox = () => {
    setSortBox(!sortBox);
  };

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
    <div className="mx-auto mt-20 flex h-full min-h-screen min-w-[250px] flex-col items-center justify-start gap-10">
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

      <div className="flex max-w-[500px] flex-col items-center justify-center overflow-hidden text-center">
        {eventLoading && eventLoading ? (
          <div className="my-2 h-12 w-60 animate-pulse rounded-md bg-slate-400 dark:bg-slate-200" />
        ) : (
          <h1
            className="max-w-[350px] text-wrap text-[35px] font-bold text-green-900 dark:text-emerald-400"
            style={{ overflowWrap: "anywhere" }}
          >
            {event?.title || "Event Name"}
          </h1>
        )}

        {eventLoading && eventLoading ? (
          <div className="my-2 h-8 w-60 animate-pulse rounded-md bg-slate-400 dark:bg-slate-200" />
        ) : (
          <p
            className="max-w-[500px] text-wrap dark:text-slate-100"
            style={{ overflowWrap: "anywhere" }}
          >
            {event?.description || "Event Not Found"}
          </p>
        )}

        {event?.eventDate && (
          <p className="text-sm text-slate-400">
            ( {new Date(event?.eventDate?.toDate()).toDateString()} )
          </p>
        )}
      </div>

      <div className="flex w-full flex-col gap-4">
        <Button
          className="flex h-[50px] w-full items-center justify-between gap-4 rounded-xl !bg-slate-300 font-bold"
          onClick={openModal}
        >
          <p className="text-emerald-700">Select Student</p>
          <IoMdArrowDropdown className="text-emerald-700" />
        </Button>

        <Button
          className="flex h-[50px] w-full items-center justify-between gap-4 rounded-xl !bg-slate-300 font-bold"
          onClick={openScanModal}
        >
          <p className="text-emerald-700">Scan Student</p>
          <IoMdArrowDropdown className="text-emerald-700" />
        </Button>
      </div>

      <div className="flex w-full flex-col gap-4 pb-8">
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="relative w-full max-w-[300px]">
              <IoIosSearch className="absolute bottom-4 right-2 text-lg text-emerald-700" />
              <Input
                type="search"
                placeholder="Search Students..."
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
                    {SortFields.map((item) => (
                      <DropdownMenuRadioItem
                        key={item.value}
                        value={item.value}
                      >
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

          <div className="overflow-auto rounded-[20px] border border-emerald-700">
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
              <tbody className="">
                {loading && loading ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      <div className="flex items-center justify-center">
                        <ImSpinner6 className="mx-2 h-8 w-8 animate-spin text-lg text-gray-400" />{" "}
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : filteredAttendedStudents.length ? (
                  filteredAttendedStudents.map((student, index) => (
                    <tr key={index + 1}>
                      <td className="col-no whitespace-nowrap">{index + 1}</td>
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
                      <td className="col-action whitespace-nowrap">
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <AiFillDelete className="col-action mx-auto cursor-pointer text-red-500 transition-all ease-in-out hover:text-red-600" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="dark:text-white">
                                Are you sure you want to delete this studnet?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                The student will be removed from the list. You
                                can add them again. so be sure to continue.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="dark:text-white">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  RemoveStudentFromList(
                                    student.id
                                      ? student.id
                                      : student.admissionNo,
                                  )
                                }
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
        <div className="flex items-center justify-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <LoadingButton
                className="mt-6 min-w-[120px] !bg-slate-300 font-bold !text-emerald-600"
                loading={ClearSubmitLoading}
              >
                Clear
              </LoadingButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="dark:text-white">
                  Are you sure you want to delete all students from this table?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  The All students will be removed from the list. You can add
                  them again.The table will be clear and empty. so be careful.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAttendedStudents}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={() => handleExport()}
            className="mt-6 min-w-[120px] !bg-emerald-600 font-bold !text-white"
          >
            Export
          </Button>
        </div>
        <Dialog open={openExport} onOpenChange={handleExport}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <div className="mx-auto my-8 text-center !text-[30px] !font-bold dark:text-white">
                  Choose Export Type{" "}
                  <SmileIcon
                    className="mx-2 h-8 w-8 text-emerald-600"
                    style={{ display: "inline-block" }}
                  />
                </div>
              </DialogTitle>
              <DialogDescription>
                <p className="text-center">
                  you can export the data to excel or pdf. Choose the type of
                  export you want. use the button below to export the data.
                  {/* <SmileIcon className='text-emerald-600 mx-2 h-6 w-5' style={{ display: 'inline-block' }} /> */}
                </p>
              </DialogDescription>
            </DialogHeader>
            {eventLoading && eventLoading ? (
              <div className="mx-auto mt-4 h-16 w-[80%] animate-pulse rounded-md bg-slate-300" />
            ) : PdfData.length > 0 ? (
              <div
                className="flex w-full flex-col items-center justify-center md:flex-row md:gap-4"
                onClick={() => setTimeout(handleExport, 300)}
              >
                <PrintTable
                  data={PdfData}
                  heading={event?.name || "Event Data"}
                />
                <Button
                  onClick={() =>
                    exportToExcel(PdfData, event?.title || "EventData")
                  }
                  className="mt-6 w-full !bg-emerald-600 font-bold !text-white md:my-3"
                >
                  Export to Excel
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleExport}
                className="text-center font-semibold dark:text-black"
              >
                No data found
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={handleCreateStudent} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="mx-auto my-4 text-center !text-[30px] !font-bold dark:text-white">
                Choose Student
              </div>
            </DialogTitle>
            {/* <DialogDescription>
                            you can create an event here
                        </DialogDescription> */}
          </DialogHeader>
          <div className="mx-auto flex w-full flex-col gap-5">
            <Tabs
              defaultValue="addStudent"
              className="mx-auto flex w-full flex-col items-center justify-center"
            >
              <TabsList>
                <TabsTrigger value="addStudent">Add Student</TabsTrigger>
                <TabsTrigger value="createStudent">Create Student</TabsTrigger>
              </TabsList>
              <TabsContent value="addStudent" className="w-full">
                <div className="mx-auto mt-4 flex w-full max-w-[320px] flex-col gap-5">
                  <div className="relative mb-4 w-full">
                    <IoIosSearch className="absolute bottom-4 right-2 text-lg text-emerald-700" />
                    <Input
                      type="text"
                      placeholder="Search Admission No"
                      name="title"
                      className="h-[50px]"
                      value={searchAdmNo}
                      onChange={(e) => setSearchAdmNo(e.target.value)}
                    />
                  </div>

                  <div className="my-2 flex max-h-[450px] min-h-[415px] w-full flex-col gap-3 overflow-auto rounded-md border p-4">
                    {filteredStudentsAdmNo.length ? (
                      filteredStudentsAdmNo.map((student) => (
                        <div
                          key={student.admissionNo}
                          className="flex cursor-default items-center justify-between rounded-md bg-slate-100 p-2 px-4 transition-all ease-in-out hover:bg-slate-200"
                        >
                          <div>
                            <p>{student.name}</p>
                            <p>{student.admissionNo}</p>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Checkbox
                                  id={`student-${student.admissionNo}`}
                                  checked={selectedStudents.includes(
                                    student.admissionNo,
                                  )}
                                  // disabled={attendedStudents.includes(student.admissionNo)}
                                  onCheckedChange={(checked) => {
                                    if (
                                      attendedStudents.includes(
                                        student.admissionNo,
                                      )
                                    ) {
                                      toast({
                                        variant: "destructive",
                                        description: "Student already added",
                                      });
                                      return;
                                    } else if (checked) {
                                      setSelectedStudents((prevStudents) => [
                                        ...prevStudents,
                                        student.admissionNo,
                                      ]);
                                    } else {
                                      setSelectedStudents((prevStudents) =>
                                        prevStudents.filter(
                                          (admNo) =>
                                            admNo !== student.admissionNo,
                                        ),
                                      );
                                    }
                                  }}
                                />
                              </TooltipTrigger>
                              {attendedStudents.includes(
                                student.admissionNo,
                              ) && (
                                <TooltipContent>
                                  <p>Already added</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))
                    ) : (
                      <div className="text-center font-semibold text-black dark:text-white">
                        No data found
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 pb-6">
                    <Button
                      onClick={closeModal}
                      className="mt-4 w-full !bg-slate-200 font-bold !text-emerald-600"
                    >
                      Cancel
                    </Button>
                    <LoadingButton
                      onClick={() => AddStudenttoList(selectedStudents)}
                      className="mt-4 w-full bg-emerald-600 font-bold !text-white transition-all ease-in-out hover:bg-emerald-700"
                      loading={AddSubmitLoading}
                    >
                      Submit
                    </LoadingButton>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="createStudent" className="w-full">
                <div className="mx-auto mt-4 flex w-full max-w-[320px] flex-col gap-5">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-3"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student Name</FormLabel>
                            <FormControl>
                              <Input
                                className="h-[50px]"
                                placeholder="eg: - Saleel"
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
                          <FormItem>
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
                                  <FormLabel className="font-normal dark:text-white">
                                    UG
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="PG" />
                                  </FormControl>
                                  <FormLabel className="font-normal dark:text-white">
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
                          <FormItem>
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
                                      ? Department.find(
                                          (item) => item === value,
                                        )
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
                          <FormItem>
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
                          <FormItem>
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
                      <div className="flex items-center justify-center gap-2 pb-6">
                        <Button
                          type="button"
                          onClick={closeModal}
                          className="mt-6 w-full !bg-slate-200 font-bold !text-emerald-600"
                        >
                          Cancel
                        </Button>
                        <LoadingButton
                          type="submit"
                          className="mt-6 w-full bg-emerald-600 font-bold !text-white transition-all ease-in-out hover:bg-emerald-700"
                          loading={CreateSubmitLoading}
                        >
                          Submit
                        </LoadingButton>
                      </div>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={scanModal} onOpenChange={closeScanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="mx-auto my-4 text-center !text-[30px] !font-bold dark:text-white">
                Scan Student Barcode
              </div>
            </DialogTitle>
            <DialogDescription>
              The barcode will be scanned and the studnet admission number will
              be detected and you can add the student to the list.
            </DialogDescription>
          </DialogHeader>
          <div>
            <BarcodeReader onDetected={handleDetected} />
            <Input
              type="text"
              placeholder="Search Admission No"
              name="title"
              className="mt-4 h-[50px] w-full"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value.toUpperCase())}
            />
            <div className="flex items-center justify-center gap-2 pb-6">
              <Button
                onClick={closeScanModal}
                className="mt-4 w-full !bg-slate-200 font-bold !text-emerald-600"
              >
                Cancel
              </Button>
              <LoadingButton
                onClick={() => AddStudenttoList([barcode])}
                className="mt-4 w-full bg-emerald-600 font-bold !text-white transition-all ease-in-out hover:bg-emerald-700"
                loading={AddSubmitLoading}
              >
                Submit
              </LoadingButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Event;
