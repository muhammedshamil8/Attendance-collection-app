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
        { title: 'The Ant and The Grasshopper', showStory: false, story: "The ant and the grasshopper were good friends..." },
        { title: 'The Boy Who Cried Wolf', showStory: false, story: "There was once a shepherd boy who liked to play tricks..." },
    ]);

    return (
        <div className="bg-gray-900 text-white p-8 pb-2 m-4 flex flex-col justify-between">
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