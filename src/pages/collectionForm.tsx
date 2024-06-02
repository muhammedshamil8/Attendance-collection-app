import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Timestamp, collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useAutoAnimate } from '@formkit/auto-animate/react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import ErrorImg from "@/assets/error.svg"
import SuccessImg from "@/assets/succes.svg"
import { ImSpinner6 } from "react-icons/im";
import { LoadingButton } from '@/components/ui/loading-button';

const formSchema = z.object({
    name: z.string().nonempty({ message: "Name is required" }),
    admissionNo: z.string().nonempty({ message: "Admission no is required" }),
    rollNo: z.string().nonempty({ message: "Roll no is required" }),
    department: z.string().nonempty({ message: "Department is required" }),
    joinedYear: z.string().nonempty({ message: "Joined Year is required" }).length(4, { message: "Year must be 4 digits" }),
    section: z.string().nonempty({ message: "Section is required" }),
    id: z.string().optional(),
});

interface Student {
    id: string;
    name: string;
    admissionNo: string;
    active: boolean;
}

function CollectionForm() {
    const [open, setOpen] = useState(false);
    const departmentCollectionRef = collection(db, 'departments');
    const studentCollectionRef = collection(db, 'students');
    const [Department, setDepartment] = useState<string[]>([]);
    const [students, setStudnets] = useState<Student[]>([]);
    const [openResultBox, setOpenResultBox] = useState(false);
    const [loading, setLoading] = useState(true);
    const [Submitloading, setSubmitLoading] = useState(false);
    const [loadingDepartment, setLoadingDepartment] = useState(true);
    const [done, setDone] = useState<boolean | null>(null);
    const { toast } = useToast();
    const [parent,] = useAutoAnimate();

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
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setOpenResultBox(true);
        toast({
            title: 'The feature is not turn on',
            description: 'Please contact the admin to turn on the feature',
        });
        return;
        setSubmitLoading(true);
        try {
            if (values.id === '') {
                values.id = values.admissionNo;
            }
            const alreadyAdded = students.some(student => student.admissionNo === values.admissionNo);
            if (alreadyAdded) {
                return toast({
                    variant: "destructive",
                    description: "Student admission no already added",
                });
            }
            const docRef = doc(studentCollectionRef, values.admissionNo);
            await setDoc(docRef, {
                id: values.admissionNo,
                ...values,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                active: true,
            }).then(() => {
                setDone(true);
                toast({
                    variant: "success",
                    description: "Student added successfully",
                })
                form.reset();
            });
        } catch (error: any) {
            setDone(false);
            toast({
                variant: "destructive",
                description: error.message,
            })
        } finally {
            setLoading(false);
            setSubmitLoading(false);
        }
    }

    const getStudents = async () => {
        try {
            const usersSnapshot = await getDocs(studentCollectionRef);
            const filteredUsers = usersSnapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name,
                admissionNo: doc.data().admissionNo,
                active: doc.data().active,
            })) as Student[];
            setStudnets(filteredUsers);
            setLoading(false);
            // filterAndSortStudents();
        } catch (error: any) {
            console.error(error);

        }
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
        } finally {
            setLoadingDepartment(false);
        }
    };

    useEffect(() => {
        getStudents();
        getDepartment();
    }, []);

    const handleClearForm = () => {
        form.reset();
    }

    const handleResultBox = () => {
        setOpenResultBox(!openResultBox);
    }

    return (
        <div className='flex flex-col gap-10 justify-start items-center  min-h-screen pt-10' >
            <div className='w-full'>
                <div className='text-center '>
                    <h1 className='text-[30px] font-bold dark:text-white'>
                        Fill your details
                    </h1>
                    <p className='text-gray-600 -mt-2 text-sm dark:text-gray-300'>
                        Send account request to admin
                    </p>
                </div>
            </div>

            <div className='flex flex-col gap-5 w-full  mx-auto mb-10 h-full'>
                <div className='w-full'>
                    <div className='flex flex-col gap-5 w-full max-w-[340px] mx-auto mt-4'>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem ref={parent}>
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
                                    name="admissionNo"
                                    render={({ field }) => (
                                        <FormItem ref={parent}>
                                            <FormLabel >Admission No</FormLabel>
                                            <FormControl>
                                                <Input className='h-[50px]' placeholder="eg: - ABSC123" {...field} onChange={(e) => field.onChange(
                                                    e.target.value.toUpperCase())} />
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
                                            <FormLabel>
                                                Select Section
                                            </FormLabel>
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
                                                        <FormLabel className="font-normal text-white">PG</FormLabel>
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
                                                            {loadingDepartment && loadingDepartment ? (
                                                                <CommandEmpty>Loading...</CommandEmpty>
                                                            ) : (
                                                                <CommandEmpty>No Department found.</CommandEmpty>
                                                            )}
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
                                    name="rollNo"
                                    render={({ field }) => (
                                        <FormItem ref={parent}>
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
                                        <FormItem ref={parent}>
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
                                <div className='flex gap-2 items-center justify-center pb-4'>
                                    <Button type='button' onClick={() => handleClearForm()} className='!bg-slate-200 font-bold mt-6 !text-emerald-600 w-full'>Clear</Button>
                                    <LoadingButton type="submit" className='bg-emerald-600 font-bold mt-6  !text-white w-full transition-all ease-in-out hover:bg-emerald-700' loading={Submitloading}>Submit</LoadingButton>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>

            <Dialog open={openResultBox} onOpenChange={handleResultBox}>
                <DialogContent >
                    <div className='flex flex-col gap-5 w-full max-w-[320px] mx-auto' ref={parent}>
                        {loading && loading ? (
                            <div className='flex flex-col gap-5 w-full max-w-[320px] mx-auto'>
                                <DialogHeader>
                                    <DialogTitle>
                                        <div className='!text-[30px] !font-bold mx-auto text-center my-8 dark:text-white flex items-center justify-center'>
                                            <ImSpinner6 className='animate-spin h-10 w-10 text-gray-400 text-lg mx-2' />
                                        </div>
                                    </DialogTitle>
                                </DialogHeader>
                                <DialogDescription className='text-center'>
                                    Please wait...
                                </DialogDescription>
                            </div>
                        ) : (
                            done ? (
                                <div className='flex flex-col gap-5 w-full max-w-[320px] mx-auto'>
                                    <DialogHeader>
                                        <DialogTitle>
                                            <div className='!text-[30px] !font-bold mx-auto text-center my-8 dark:text-white'>
                                                Success
                                            </div>
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className='flex items-center justify-center'>
                                        <img src={SuccessImg} alt="success" className='w-[100px] h-[100px]' />
                                    </div>
                                    <DialogDescription>
                                        Student added successfully
                                    </DialogDescription>
                                    <div className='flex gap-2 items-center justify-center pb-4'>
                                        <Button type='button' onClick={() => handleResultBox()} className='!bg-slate-200 font-bold mt-6 !text-emerald-600 w-full'>Close</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className='flex flex-col gap-5 w-full max-w-[320px] mx-auto'>
                                    <DialogHeader>
                                        <DialogTitle>
                                            <div className='!text-[30px] !font-bold mx-auto text-center my-8 dark:text-white'>
                                                Error
                                            </div>
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className='flex items-center justify-center'>
                                        <img src={ErrorImg} alt="success" className='w-[100px] h-[100px]' />
                                    </div>
                                    <DialogDescription>

                                    </DialogDescription>
                                    <div className='flex gap-2 items-center justify-center pb-4'>
                                        <Button type='button' onClick={() => handleResultBox()} className='!bg-slate-200 font-bold mt-6 !text-emerald-600 w-full'>Close</Button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </DialogContent >
            </Dialog>

        </div >
    )
}

export default CollectionForm


