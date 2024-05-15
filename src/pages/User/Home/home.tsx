import React, { useEffect, useRef, useState } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { AiFillEdit , AiFillDelete } from "react-icons/ai";



const Home: React.FC = () => {
    const [movies, setMovies] = useState<any>([]);
    const moviesCollectionRef = collection(db, 'movies');
    const { toast } = useToast()
    const formRef = useRef<any>(null);

    interface FormData {
        title: string;
        ReleaseDate: number; // Change releaseDate to number
        receivedAnOscar: boolean;
    }

    const [formData, setFormData] = useState<FormData>({
        title: '',
        ReleaseDate: 0, // Initialize releaseDate as 0 or another default year
        receivedAnOscar: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value;
        setFormData({
            ...formData,
            [name]: name === 'ReleaseDate' ? (newValue === '' ? 0 : newValue) : newValue
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.title || !formData.ReleaseDate) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill out all fields.",
                // action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
            return;
        } else if (formData.ReleaseDate?.toString().length !== 4) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter a valid year.",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
            return;
        } else if (formData.title.length < 2) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Title must be at least 2 characters.",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
            return;
        } else {
            createMovie(formData);
        }
    };


    const createMovie = async (movie: any) => {
        console.log('Creating movie:', movie);
        console.log(typeof movie.title, typeof movie.ReleaseDate, typeof movie.receivedAnOscar)
        try {
            await addDoc(moviesCollectionRef, movie);
            toast({
                description: "Movie created successfully",
            })
            getMovies();
            setFormData({
                title: '',
                ReleaseDate: 0,
                receivedAnOscar: false
            });
        } catch (error) {
            console.error(error);
        }
    }

    const deleteMovie = async (id: string) => {
        try {
            console.log('Deleting movie:', id);
            // Delete movie from Firestore
            // await deleteDoc(doc(db, 'movies', id));
            // console.log('Movie deleted:', id);
            // getMovies();
        } catch (error: any) {
            console.error(error);
        }
    }

    const updateMovie = async (id: string, movie: any) => {
        try {
            console.log('Updating movie:', id, movie);
            setFormData({
                title: movie.title,
                ReleaseDate: movie.ReleaseDate,
                receivedAnOscar: movie.receivedAnOscar
            });
                formRef.current.scrollIntoView({ behavior: 'smooth'});
            // Update movie in Firestore
            // await updateDoc(doc(db, 'movies', id), movie);
            // console.log('Movie updated:', id, movie);
            // getMovies();
        } catch (error: any) {
            console.error(error);
        }
    }

    useEffect(() => {
        getMovies();
    }, []);
    const getMovies = async () => {
        try {
            const data = await getDocs(moviesCollectionRef);
            const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setMovies(filteredData);
        } catch (error: any) {
            console.error(error);
        }
    };

    return (
        <div className='m-10' ref={formRef}>

            <div className='text-black dark:text-white border p-10 m-10 rounded-lg flex items-center justify-center flex-col mx-auto '>
                <h1>Welcome to the Home Page</h1>
                <p>This is a simple home page.</p>

                <div className="border rounded-lg p-8 m-4 border-slate-900 dark:border-slate-200 w-full max-w-[400px]">
                    <h2 className='text-xl font-bold'>Create Movies</h2>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-8 py-4' >
                        <div>
                            <label htmlFor="title">Title</label>
                            <input
                                className='p-2 rounded-md bg-slate-100 text-slate-900 max-w-md w-full'
                                type="text"
                                name="title"
                                id="title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="ReleaseDate">Release Year</label>
                            <input
                                className='p-2 rounded-md bg-slate-100 text-slate-900 max-w-md w-full'
                                type="number" // Use type "number" for releaseDate input
                                name="ReleaseDate"
                                id="ReleaseDate"
                                value={formData.ReleaseDate?.toString()} // Convert number to string for input value
                                onChange={handleChange}
                            />
                        </div>

                        <div className='flex justify-between'>
                            <label htmlFor="receivedAnOscar">Received an Oscar</label>
                            <input
                                className='mx-4 h-5 w-5'
                                type="checkbox"
                                name="receivedAnOscar"
                                id="receivedAnOscar"
                                checked={formData.receivedAnOscar}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className='bg-blue-500 p-2 rounded-md'>Create Movie</button>
                    </form>

                </div>


                <div className="w-full max-w-[400px]">
                    <h2 className='text-xl font-bold'>Movies List</h2>
                    <ul>
                        {movies.map((movie: any) => (
                            <li key={movie.id} className="border rounded-lg p-8 m-4 border-slate-900 dark:border-slate-200 relative">
                                <div className='flex gap-4 absolute top-4 right-4'>
                                <AiFillEdit className='cursor-pointer' onClick={ () => updateMovie(movie.id , movie)}/>
                                <AiFillDelete className='cursor-pointer' onClick={() => deleteMovie(movie.id)}/>
                                </div>

                                <p>
                                    Title :  {movie.title}
                                </p>
                                <p>
                                    Released Year : {movie.ReleaseDate}
                                </p>
                                <p>
                                    Oscar Recevied : {movie.receivedAnOscar ? 'Yes' : 'No'}
                                </p>
                            </li>

                        ))}
                    </ul>
                </div>
            </div>


        </div>

    );
};

export default Home;