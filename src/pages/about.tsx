import React, { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FaLinkedinIn, FaInstagram, } from "react-icons/fa";
import { IoMailOutline } from "react-icons/io5";

interface FAQ {
    question: string;
    isOpen: boolean;
    answer: string;
}

const About: React.FC = () => {
    const [parent] = useAutoAnimate();
    const [faqs, setFaqs] = useState<FAQ[]>([
        { question: 'What is the purpose of this app?', isOpen: false, answer: "MARK !T is designed to streamline the process of collecting student data during events organized by EMEA College clubs and departments. It allows volunteers to quickly add students to event lists by entering their admission numbers, reducing the time and effort required for data collection." },
        { question: 'How do I use this app?', isOpen: false, answer: "Using MARK !T is simple. Just click on the 'Add Student' button and fill in the student's details. Then, click 'Submit' to save the student's information." },
        { question: 'How can I delete a student?', isOpen: false, answer: "To delete a student, simply click on the 'Delete' button on the student's card." },
        { question: 'Can I add any student?', isOpen: false, answer: "No, you can only add students who are currently studying at EMEA College." },
        { question: 'Who can use this app?', isOpen: false, answer: "This app is intended for use by EMEA College staff, specifically for collecting student data during events." },
        { question: 'How can I contact the developer?', isOpen: false, answer: "You can reach out to the developer by clicking on the '...Me...' link at the bottom of the page." },
        {
            question: 'Who developed and designed this app?',
            isOpen: false,
            answer: "MARK !T was developed by Muhammed Shamil, a BSc Computer Science 2nd year student at EMEA College, with design by Dayyan Ali, also a student at EMEA College. The app was conceptualized by Hasil, the IEDC CCO, and implemented with the support of the IEDC technical team."
        },
        {
            question: 'How can new club core teams connect with us?',
            isOpen: false,
            answer: "New club core teams can connect with us through the contact section of the app. They can request an account, which will be verified by the admin. Once verified, they will receive an email with login credentials. Using their account, they can create, edit, and delete events, add students to events, scan IDs, export data, and more. If a student does not exist in the system, they can create a new student entry."
        }
    ]);
    

    return (
        <div className="text-black dark:text-white p-8 pb-2 m-4 flex flex-col justify-between min-h-screen mb-20">
            <div>
                <h1 className="text-4xl font-bold mb-4">About MARK !T</h1>
                <p className="text-lg mb-4">
                    MARK !T is a solution developed for EMEA College to streamline the process of collecting student data during events organized by clubs and other departments. Previously, volunteers had to manually write down details such as admission number, name, roll number, department, and whether they are undergraduate or postgraduate students. This manual process was not only time-consuming but also prone to errors, especially during data sorting and entry into the attendance software.
                </p>
                <p className="text-lg mb-4">
                    With MARK !T, volunteers can easily add students to the event list by entering their admission numbers. This significantly reduces the time and effort required for data collection. Additionally, multiple volunteers can simultaneously access a live table displaying student data, making coordination more efficient. The app also features a scan ID card functionality, allowing for even faster entry of admission numbers.
                </p>
                <p className="text-lg mb-4">
                    One of the key features of MARK !T is its ability to export student data to PDF or Excel format, sorted by department and year. This feature ensures that the data is organized and easily accessible for further processing. Overall, MARK !T provides a user-friendly and efficient solution for managing student data during college events, enhancing the experience for both volunteers and the core team of the clubs.
                </p>
                <p className="text-lg mb-4">
                    In addition to its event management capabilities, MARK !T also includes an admin panel for managing students and users. This panel allows administrators to control access, monitor activity, and perform various CRUD operations to maintain the system.
                </p>

                <div className='mt-10'>
                    <h3 className='text-left dark:text-white font-semibold text-lg'>FAQs</h3>
                    {faqs.map((item, index) => (
                        <div key={index} className="">
                            <h2 className='p-2 font-semibold cursor-pointer hover:underline transition-all ease-in-out flex items-center justify-between border-b border-gray-300 dark:border-b dark:border-gray-700 text-lg'
                                onClick={() => setFaqs(faqs.map((s, i) => i === index ? { ...s, isOpen: !s.isOpen } : s))}>
                                {item.question}?
                                {item.isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                            </h2>
                            <div ref={parent}>{item.isOpen ? <div className='text-md py-2'>{item.answer}</div> : null}</div>
                        </div>
                    ))}
                </div>
            </div>



            <p className='flex gap-2 mx-auto mt-10'>
                <FaLinkedinIn className='text-xl m-2 text-gray-500 cursor-pointer hover:text-gray-700 transition-all ease-in-out' onClick={() => window.open('https://www.linkedin.com/company/iedcemea')} />
                <FaInstagram className='text-xl m-2 text-gray-600 cursor-pointer hover:text-gray-700 transition-all ease-in-out' onClick={() => window.open('https://www.instagram.com/iedcemea/')} />
                <IoMailOutline className='text-xl m-2 text-gray-600 cursor-pointer hover:text-gray-700 transition-all ease-in-out' onClick={() => window.open('mailto:emeaiedc@gmail.com')} />
            </p>

            <p className='text-center mt-10'>
                crafted with <span className='text-red-600'>❤</span> by <a href="https://zamil.me" className='hover:underline'> ...Me... </a>
            </p>
        </div>
    );
};

export default About;