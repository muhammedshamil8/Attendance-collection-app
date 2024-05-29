import React, { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

interface Story {
    title: string;
    showStory: boolean;
    story: string;
}

const About: React.FC = () => {
    const [parent] = useAutoAnimate();
    const [Accordion, setAccordion] = useState<Story[]>([
        { title: 'For What this App developed?', showStory: false, story: "This app is developed for collecting students data much faster for an  each event conducting EMEA college" },
        { title: 'How to use this App?', showStory: false, story: "This app is very simple to use. Just click on the 'Add, Student' button and fill the form with the student's details. Then click on the 'Submit' button to save the student's details."},
        { title: 'How to delete a student?', showStory: false, story: "To delete a student, click on the 'Delete' button on the student's card."},
        { title: 'Can i add any student?', showStory: false, story: "No, you can't add any student. You can only add students who are studying in EMEA college."},
        { title: 'Who can use this App?', showStory: false, story: "This app is only for the EMEA college staff. They can use this app to collect students' data for each event."},
        { title: 'How to contact the developer?', showStory: false, story: "You can contact the developer by clicking on the '...Me...' link at the bottom of the page." },
        {
            title: 'Who developed this App?',
            showStory: false,
            story: "This app is developed by Zamil. He is a full-stack developer with 3 years of experience in web development. He is passionate about learning new technologies and building web applications."
        },
        {
            title: 'Who desined this App?',
            showStory: false,
            story: "This app is designed by dayyan. He is a UI/UX designer with 2 years of experience in designing web applications. He is passionate about creating user-friendly interfaces and designing beautiful websites."
        },
        {
            title: 'whose idea is this App?',
            showStory: false,
            story: "This app is an idea of the IEDC CCO Hasil. He is a creative thinker with 5 years of experience in entrepreneurship. He is passionate about creating innovative solutions and building successful businesses."
        }


    ]);

    return (
        <div className="bg-gray-900 text-white p-8 pb-2 m-4 flex flex-col justify-between min-h-screen">
            <div>
            <h1 className="text-4xl font-bold mb-4">About This App</h1>
            <p className="text-lg mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod
                justo et nunc tincidunt, in tristique tellus consectetur. Nullam
                aliquet, mauris ac lacinia tincidunt, est ex aliquet nunc, id
                ullamcorper mauris nisl ac libero.
            </p>
            <p className="text-lg mb-4">
                Fusce auctor, nunc id aliquet fringilla, nisl nunc ultrices mi, eu
                tincidunt mauris ex nec nunc. Sed id enim auctor, sollicitudin leo
                vitae, pharetra nunc. Sed at justo id nunc lacinia viverra.
            </p>
            <p className="text-lg mb-4">
                Donec euismod, nunc et consequat tincidunt, nunc nunc aliquam nunc, id
                consectetur felis nunc vel nunc. Sed euismod, nunc et consequat
                tincidunt, nunc nunc aliquam nunc, id consectetur felis nunc vel nunc.
            </p>
            <p className="text-lg mb-4">
                Duis vel semper nunc. Nullam euismod, nunc et consequat tincidunt,
                nunc nunc aliquam nunc, id consectetur felis nunc vel nunc.
            </p>
            <div className='mt-10'>
                <h3 className='text-left text-white font-semibold text-lg'>FAQs</h3>
                {Accordion.map((item, index) => (
                    <div key={index} className="">
                        <h2 className='p-2 font-semibold cursor-pointer hover:underline transition-all ease-in-out flex items-center justify-between border-b border-gray-300 dark:border-b dark:border-gray-700'
                            onClick={() => setAccordion(Accordion.map((s, i) => i === index ? { ...s, showStory: !s.showStory } : s))}>
                            {item.title}?
                            {item.showStory ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </h2>
                        <div ref={parent}>{item.showStory ? <div>{item.story}</div> : null}</div>
                    </div>
                ))}
            </div>
            </div>

            <p className='text-center mt-20'>
                crafted with <span className='text-red-600'>❤</span> by <a href="https://zamil.me" className='hover:underline'>...Me...</a>
            </p>
        </div>
    );
};

export default About;