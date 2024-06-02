import React, { useEffect, useRef, useState } from 'react';
import { db, auth } from '@/config/firebase';
import { collection, getDocs, addDoc, doc, getDoc, DocumentReference, updateDoc, documentId, query, where, Timestamp, orderBy, deleteDoc } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast"
// import { AiFillEdit, } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { Button } from '@/components/ui/button';
import { LuPlus } from "react-icons/lu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useNavigate } from 'react-router-dom';
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
import { IoIosSearch } from 'react-icons/io';
import { LoadingButton } from '@/components/ui/loading-button';

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }).max(25, {
        message: "Title must be at most 25 characters.",
    }),
    description: z.string().min(2, {
        message: "Description must be at least 2 characters.",
    }).max(500, {
        message: "Description must be at most 500 characters.",
    }),
    eventDate: z.date({
        message: "Please select a valid date.",
    }),
    id: z.string().optional(),
})


interface Event {
    id: string;
    attendees: [];
    description: string;
    eventDate: Timestamp;
    title: string;
    userID: string;
    team_name: string;
    createdAt: Timestamp;
}

const Home: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [search, setSearch] = useState<string>('');
    const [handleCreateEvent, setHandleCreateEvent] = useState<boolean>(false);
    const eventsCollectionRef = collection(db, 'events');
    const UserCollectionRef = collection(db, 'users');
    const [method, setMethod] = useState<string>("POST");
    const { toast } = useToast()
    const formRef = useRef<any>(null);
    const navigate = useNavigate();
    const [userID, setUserID] = useState<string | null>(auth.currentUser ? auth.currentUser.uid : null);
    const [loading, setLoading] = useState<boolean>(true);
    const [Submitloading, setSubmitLoading] = useState<boolean>(false);
    const [DeleteLoading, setDeleteLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            eventDate: new Date(),
            id: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitLoading(true);
        try {
            method === "POST" ? await createEvent(values) : await updateEvent(values);
        } catch (error) {
            setSubmitLoading(false);
            console.error(error);
        }
    }
    const createEvent = async (values: any) => {
        if (!userID) {
            console.error('User ID missing.');
            toast({
                variant: 'destructive',
                description: "User ID missing.",
            })
            setSubmitLoading(false);
            return;
        }
        const userDocRef = doc(UserCollectionRef, userID);
        const userDocSnap = await getDoc(userDocRef);
        const team_name = userDocSnap.data()?.team_name;
        const data = {
            userID: userID,
            team_name,
            title: values.title,
            description: values.description,
            eventDate: values.eventDate,
            attendees: [],
            createdAt: Timestamp.now(),
            updateAt: Timestamp.now(),
        }
        try {
            const eventRef = await addDoc(eventsCollectionRef, data);
            const eventID = eventRef.id;
            await addEventToUser(userID, eventID, UserCollectionRef);
            toast({
                variant: 'success',
                description: "Event created successfully",
            })
            setSubmitLoading(false);
            closeModal();
            form.reset();
        } catch (error: any) {
            setSubmitLoading(false);
            console.error(error);
        }
    }


    const addEventToUser = async (userID?: string, eventID?: string, UserCollectionRef?: any) => {
        // console.log("Adding event to user's events...");
        // console.log("User ID:", userID, "Event ID:", eventID, "User Collection Ref:", UserCollectionRef);
        if (!userID || !eventID) {
            console.error("User ID or Event ID missing.");
            return;
        }
        try {
            const userRef: DocumentReference = doc(UserCollectionRef, userID);
            const userDocSnap = await getDoc(userRef);

            if (userDocSnap.exists()) {
                const eventRef = doc(eventsCollectionRef, eventID);
                const updatedEvents = [...userDocSnap.data()?.events, eventRef];
                await updateDoc(userRef, { events: updatedEvents });
                // console.log("Event added to user's events successfully.");
                getEvents();
            } else {
                console.error("User not found.");
            }
        } catch (error: any) {
            console.error("Error adding event to user's events:", error);
        }
    };

    const deleteEvent = async (id: string) => {
        setDeleteLoading(true);
        try {
            // console.log('Deleting movie:', id);
            // Delete movie from Firestore
            await deleteDoc(doc(db, 'events', id));
            toast({
                variant: 'success',
                description: "Event deleted successfully",
            })
            getEvents();
            setDeleteLoading(false);
        } catch (error: any) {
            setDeleteLoading(false);
            console.error(error);
        }
    }

    const EditEvent = async (id: string, event: any) => {
        form.setValue('title', event.title);
        form.setValue('description', event.description);
        form.setValue('eventDate', new Date(event.eventDate.seconds * 1000));
        form.setValue('id', id);
        openModal('PUT');
        // console.log('Updating event:', id, event);
        formRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    const updateEvent = async (values: any) => {
        if (!values.id) {
            console.error('Event ID missing.');
            toast({
                variant: 'destructive',
                description: "Event ID missing.",
            })
            setSubmitLoading(false);
            return;
        }
        // Update Event in Firestore
        await updateDoc(doc(eventsCollectionRef, values.id), { ...values, updateAt: Timestamp.now() });
        getEvents();
        // console.log('Updating event:', values);
        closeModal();
        setSubmitLoading(false);
    }

    useEffect(() => {
        if (userID) {
            // console.log('User ID:', userID);
            getEvents();
        }
    }, [userID]);

    useEffect(() => {
        setFilteredEvents(events.filter((event) => event.title.toLowerCase().includes(search.toLowerCase())));
    }, [search]);

    const getEvents = async () => {
        try {
            const userDocRef = doc(UserCollectionRef, userID!);
            const userDocSnap = await getDoc(userDocRef);
            const userEvents = userDocSnap.data()?.events || [];

            const eventIDs = userEvents ? userEvents
                .filter((ref: DocumentReference | undefined | null) => ref !== undefined && ref !== null)
                .map((ref: DocumentReference) => ref.id) : [];

            if (eventIDs.length === 0) {
                setLoading(false);
                return;
            }
            const q = query(
                eventsCollectionRef,
                where(documentId(), "in", eventIDs),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);

            const filteredData: Event[] = querySnapshot.docs.map((doc) => {
                const eventData = doc.data();
                return {
                    id: doc.id,
                    attendees: eventData.attendees || [],
                    description: eventData.description || "",
                    eventDate: eventData.eventDate || "",
                    title: eventData.title || "",
                    userID: eventData.userID || "",
                    team_name: eventData.team_name || "",
                    createdAt: eventData.createdAt || "",
                };
            });
            setEvents(filteredData);
            setFilteredEvents(filteredData);
            setLoading(false);
            // console.log("Events:", filteredData);
        } catch (error: any) {
            console.error(error);
        }
    };

    const closeModal = () => {
        setHandleCreateEvent(false);
    }
    const openModal = (method: string) => {
        setMethod(method);
        if (method === "POST") {
            form.reset();
        }
        setHandleCreateEvent(true);
    }
    function handleOpenEvent(id: string) {
        // console.log('Event clicked');
        navigate(`/event/${id}`);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserID(user.uid);
            } else {
                setUserID(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className='flex flex-col gap-10 justify-start items-center h-full mt-20 max-w-[360px] mx-auto mb-10 min-h-screen' ref={formRef}>

            {DeleteLoading && (
                <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
                    <div className='bg-white p-4 rounded-lg shadow-md flex flex-col gap-4'>
                        <div className='w-full flex items-center justify-center gap-4'>
                            <ImSpinner6 className="animate-spin h-6 w-6 text-emerald-600" />
                            <h1 className='text-emerald-600 font-bold'>Deleting Event...</h1>
                        </div>
                    </div>
                </div>
            )}
            <div>
                <h1 className='font-bold text-green-900 dark:text-emerald-400 text-[30px]'>
                    Select Event
                </h1>
            </div>

            <div className='w-full'>
                <Button className='!bg-emerald-700 w-full flex gap-4 font-bold h-[50px] !text-white' onClick={() => openModal('POST')}>
                    <div className='bg-white rounded-full w-6 h-6 flex items-center justify-center'>
                        <LuPlus className='text-emerald-700' />
                    </div>
                    Add Event
                </Button>
            </div>

            <div className='w-full relative mb-4'>
                <IoIosSearch className='absolute bottom-4 right-2 text-lg text-emerald-700' />
                <Input type="search" placeholder="Search Event..." name="title" className='h-[50px] pr-8' value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className='w-full flex flex-col gap-4 '>
                {loading && loading ? (
                    <>
                        {Array.from({ length: 4 }, (_, index) => (
                            <div key={index} className='w-full rounded-md bg-gray-300 p-2 flex flex-col text-center gap-2 min-h-36 animate-pulse' >
                            </div>
                        ))}
                    </>
                ) : (filteredEvents.length > 0 ? (
                    filteredEvents.map((event: Event) => (
                        <div className="bg-emerald-600/10 dark:bg-emerald-200/20 rounded-xl shadow-md p-4 flex flex-col gap-3 overflow-hidden " key={event.id}>
                            <div className="flex justify-between  flex-col ">
                                <h2 className="text-xl font-bold text-emerald-600 dark:text-slate-100 truncate mt-2 text-center" style={{ overflow: 'hidden', overflowWrap: 'anywhere', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                                    {event.title}
                                </h2>

                            </div>
                            <p className="text-emerald-600 text-center font-medium dark:text-slate-300">
                                ( {event.eventDate?.toDate().toDateString()} )
                            </p>
                            <p className="text-gray-600 max-w-full text-wrap text-center font-medium dark:text-slate-200" style={{ overflow: 'hidden', overflowWrap: 'anywhere', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                                {event.description}
                            </p>

                            <div className="flex gap-3 justify-center w-full">
                                <button
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl transition-all ease-in-out"
                                    onClick={() => handleOpenEvent(event.id)}
                                >
                                    <div className='flex items-center justify-center gap-2 text-sm'>
                                        View Details
                                        {/* <Eye
                                    className="text-white cursor-pointer h-5"
                                /> */}
                                    </div>
                                </button>
                                <button
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2  px-4 rounded-xl transition-all ease-in-out"
                                    onClick={() => EditEvent(event.id, event)}
                                >
                                    <div className='flex items-center justify-center gap-2 text-sm'>
                                        Edit Event
                                        {/* <AiFillEdit
                                    className="text-white cursor-pointer"
                                /> */}
                                    </div>

                                </button>


                                <AlertDialog>
                                    <AlertDialogTrigger>
                                        <RiDeleteBinLine className="text-emerald-500 cursor-pointer transition-all ease-in-out hover:text-red-500" />
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className='dark:text-white'>
                                                Are you sure you want to delete this Event?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. it will delete the Event permanently.
                                                so be sure before you continue.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className='dark:text-white'>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteEvent(event.id)}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                        </div>
                    ))
                ) : (
                    <div className='w-full rounded-md bg-emerald-600/10 p-2 flex flex-col text-center gap-2 min-h-28 animate-pulse justify-center items-center'>
                        <h2 className='text-lg  text-emerald-700 font-semibold'>
                            No Events
                        </h2>
                    </div>
                ))}


            </div>

            <Dialog open={handleCreateEvent} onOpenChange={closeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <div className='!text-[30px] !font-bold mx-auto text-center my-4 dark:text-white'>
                                Create Event
                            </div>
                        </DialogTitle>
                        {/* <DialogDescription>
                            you can create an event here
                        </DialogDescription> */}
                    </DialogHeader>
                    <div className='flex flex-col gap-5 w-full max-w-[320px] mx-auto'>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel >Event Name</FormLabel>
                                            <FormControl>
                                                <Input maxLength={25} className='h-[50px]' placeholder="title" {...field} />
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
                                    name="eventDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Event Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full h-[50px] justify-start text-left font-normal bg-slate-100 dark:text-white",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date < new Date("2024-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel >Event Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    maxLength={500}
                                                    placeholder="About Event..." className='dark:text-white border dark:border-slate-900 focus:border-emerald-400 dark:focus:border-emerald-400 p-3' {...field} />
                                            </FormControl>
                                            {/* <FormDescription>
                                        This is your public display name.
                                    </FormDescription> */}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className='flex gap-2 items-center justify-center pb-4'>
                                    <Button type='button' onClick={closeModal} className='!bg-slate-200 font-bold mt-6 !text-emerald-600 w-full'>Cancel</Button>
                                    <LoadingButton className='bg-emerald-600 font-bold mt-6 !text-white w-full transition-all ease-in-out hover:bg-emerald-700' loading={Submitloading} type="submit">Submit</LoadingButton>
                                </div>

                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>

        </div>

    );
};

export default Home;