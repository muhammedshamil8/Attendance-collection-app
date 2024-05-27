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

// import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
// import QrReader from '@types/react-qr-reader'
interface Student {
  name: string;
  admissionNo: string;
  rollNo: string;
  department: string;
  year: string;
  email?: string;
  phone?: string;
}

function Event() {
  const [handleCreateEvent, setHandleCreateEvent] = useState(false);
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [searchAdmNo, setSearchAdmNo] = useState('')
  const [searchName, setSearchName] = useState('')
  const [sortBox, setSortBox] = useState(false);
  const { id } = useParams();
  console.log(id);

  const Fields = [
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
  useEffect(() => {
    updateSelectedItems(selectedItems);
  }, []);

  const Department = [
    {
      value: "bsc_computer_science",
      label: "Bsc Computer Science",
    },
    {
      value: "bsc_biochemistry",
      label: "Bsc Biochemistry",
    },
    {
      value: 'bsc_microbiology',
      label: 'Bsc Microbiology',
    },
    {
      value: 'bsc_biotecnology',
      label: 'Bsc Biotecnology',
    },
    {
      value: 'bsc_maths&pysics',
      label: 'Bsc Maths & Pysics',
    },
    {
      value: 'ba_west_asia',
      label: 'BA West Asia',
    },
    {
      value: 'ba_economics',
      label: 'BA Economics',
    },
  ] as const;

  const students = [
    {
      name: 'John Doe',
      admissionNo: '123456789',
      rollNo: '12',
      department: 'A Computer Science',
      year: '1st year',
      email: 'johndoe@example.com',
      phone: '555-555-3434',
    },
    {
      name: 'Jane Doe',
      admissionNo: '987654321',
      rollNo: '25',
      department: 'Electrical Engineering',
      year: '2nd year',
    },
    {
      name: 'Jim Smith',
      admissionNo: '456123789',
      rollNo: '36',
      department: 'AA Mechanical Engineering',
      year: '3rd year',
    },
    {
      name: 'Jill Johnson',
      admissionNo: '789456123',
      rollNo: '47',
      department: 'AB Chemical Engineering',
      year: '4th year',
    },
    {
      name: 'Bob Brown',
      admissionNo: '135791357',
      rollNo: '58',
      department: 'Civil Engineering',
      year: '1st year',
    },
    {
      name: 'Alice White',
      admissionNo: '246810246',
      rollNo: '69',
      department: 'Mathematics',
      year: '2nd year',
    },
    {
      name: 'Charlie Green',
      admissionNo: '579135791',
      rollNo: '70',
      department: 'Physics',
      year: '3rd year',
    },
  ];
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);


  const closeModal = () => {
    setHandleCreateEvent(false);
  }
  const openModal = () => {
    setHandleCreateEvent(true);
  }
  // const [result, setResult] = useState('No result');
  // const [scan, setScan] = useState(false);

  // const handleQrReade = () => {
  //   setScan(!scan);
  // }

  // const handleScan = (data: string) => {
  //   setResult(data);
  //   console.log(result);
  // };

  // const handleError = (err: Error) => {
  //   console.error(err);
  // };

  // const previewStyle = {
  //   height: 240,
  //   width: 320,
  // };

  const filteredStudentsAdmNo = students.filter((student) => {
    if (searchAdmNo === '') return null;
    return student.admissionNo.toLowerCase().includes(searchAdmNo.toLowerCase())
  })


  function filterAndSortStudents() {
    let filtered = students;
    if (searchName !== '') {
      filtered = filtered.filter((student) => student.name.toLowerCase().includes(searchName.toLowerCase()));
    } else {
      filtered = students;
    }
    return setFilteredStudents(filtered.sort((a, b) => {
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
      {/*
      <Button onClick={handleQrReade} className='!bg-emerald-600 font-bold !text-white'>{scan ? 'Stop Scan':'Scan Qr code'}</Button>
      {scan ? <QrReader
        delay={100}
        style={previewStyle}
        onError={handleError}
        onScan={handleScan}
      /> : null}
      <QRCodeSVG value="111112344343" />
      <QRCodeSVG value="https://zamil.me/" />
      <QRCodeCanvas value="https://reactjs.org/" />
      */}

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
                  <th className="col-name tracking-wider">Student Name</th>
                  <th className="col-admissionNo tracking-wider">Admission no:</th>
                  <th className="col-rollNo tracking-wider">Roll No:</th>
                  <th className="col-department tracking-wider">Department</th>
                  <th className="col-year tracking-wider">Year</th>
                  <th className="col-action tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className=''>
                {filteredStudents.length ? (
                  filteredStudents.map((student, index) => (
                    <tr key={index}>
                      <td className="col-name whitespace-nowrap">{student.name}</td>
                      <td className="col-admissionNo whitespace-nowrap">{student.admissionNo}</td>
                      <td className="col-rollNo whitespace-nowrap">{student.rollNo}</td>
                      <td className="col-department whitespace-nowrap">{student.department}</td>
                      <td className="col-year whitespace-nowrap">{student.year}</td>
                      <td className='col-action whitespace-nowrap'>
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
        <div className='flex gap-2 items-center justify-center'>
          <Button onClick={closeModal} className='!bg-slate-300 font-bold mt-6 !text-emerald-600'>Clear</Button>
          <Button onClick={closeModal} className='!bg-emerald-600 font-bold mt-6 !text-white'>Export</Button>
        </div>
      </div>

      <Dialog open={handleCreateEvent} onOpenChange={closeModal}>
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
            <Tabs defaultValue="account" className="w-full mx-auto flex items-center flex-col justify-center">
              <TabsList >
                <TabsTrigger value="account">Add Student</TabsTrigger>
                <TabsTrigger value="password">Create Studnet</TabsTrigger>
              </TabsList>
              <TabsContent value="account" className='w-full'>
                <div className='flex flex-col gap-5 w-full max-w-[320px] mx-auto mt-4'>
                  <div className='w-full relative'>
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
                          <Checkbox id="terms2" />
                        </div>
                      ))
                    ) : (
                      <div className='text-center text-black'>No data found</div>
                    )}

                  </div>
                  <div className='flex gap-2 items-center justify-end'>
                    <Button onClick={closeModal} className='!bg-slate-200 font-bold mt-4 !text-emerald-600'>Cancel</Button>
                    <Button onClick={closeModal} className='!bg-emerald-600 font-bold mt-4 !text-white'>Submit</Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="password" className='w-full'>
                <div className='flex flex-col gap-5 w-full max-w-[320px] mx-auto mt-4'>
                  <label htmlFor="title" className='font-semibold text-sm dark:text-white'>Student Name</label>
                  <Input type="text" placeholder="Title" name="title" className='h-[50px]' />

                  <label htmlFor="title" className='font-semibold text-sm dark:text-white '>Select Department</label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-[50px] dark:text-white bg-slate-100"
                      >
                        {value
                          ? Department.find((item) => item.value === value)?.label
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
                              Department.map((item) => (
                                <CommandItem
                                  key={item.value}
                                  value={item.value}
                                  onSelect={(currentValue) => {
                                    setValue(currentValue === value ? "" : currentValue)
                                    setOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      value === item.value ? "opacity-100" : "opacity-0"
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

                  <label htmlFor="title" className='font-semibold text-sm dark:text-white'>Admission No</label>
                  <Input type="text" placeholder="Title" name="title" className='h-[50px]' />

                  <label htmlFor="title" className='font-semibold text-sm dark:text-white'>Roll No</label>
                  <Input type="text" placeholder="Title" name="title" className='h-[50px]' />


                  <label htmlFor="JoinYear" className='font-semibold text-sm dark:text-white'>Joined Year</label>
                  <Input
                    type='number'
                    aria-disabled={true}
                    pattern="[0-9]{4}"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Joined Year"
                    name="JoinYear"
                    className='h-[50px] '
                    onChange={(event) => {
                      if (event.target.value.length > 4) {
                        event.target.value = event.target.value.slice(0, 4);
                      }
                    }}
                  />
                  <div className='flex gap-2 items-center justify-end'>
                    <Button onClick={closeModal} className='!bg-slate-200 font-bold mt-6 !text-emerald-600'>Cancel</Button>
                    <Button onClick={closeModal} className='!bg-emerald-600 font-bold mt-6 !text-white'>Submit</Button>
                  </div>
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
