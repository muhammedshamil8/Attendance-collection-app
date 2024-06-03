import React, { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FaInstagram } from "react-icons/fa";
import { IoMailOutline } from "react-icons/io5";
import { SlSocialLinkedin } from "react-icons/sl";
import AboutImage from "@/assets/amico.png";
interface FAQ {
  question: string;
  isOpen: boolean;
  answer: string | React.ReactNode;
}

const About: React.FC = () => {
  const [parent] = useAutoAnimate();

  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: "What is the purpose of this app?",
      isOpen: false,
      answer:
        "MARK !T is designed to streamline the process of collecting student data during events organized by EMEA College clubs and departments. It allows volunteers to quickly add students to event lists by entering their admission numbers, reducing the time and effort required for data collection.",
    },
    {
      question: "How do I use this app?",
      isOpen: false,
      answer:
        "Using MARK !T is a breeze. Begin by creating an event and opening it. Then, effortlessly add the attending students to the list. Finally, you can easily export the sorted list for your convenience.",
    },
    {
      question: "How can I delete a student?",
      isOpen: false,
      answer:
        "While you cannot delete a student from our overall storage, you can remove a student from your selected event by simply clicking on the delete icon next to their name.",
    },
    {
      question: "Can I add any student?",
      isOpen: false,
      answer:
        "No, you can only add students who are currently studying at EMEA College.",
    },
    {
      question: "If my data is incorrect, how can I update it?",
      isOpen: false,
      answer:
        "If you find that your data is incorrect, please reach out to us through the contact page or by sending an email to IEDC EMEA. You can also connect with the IEDC EMEA core team for assistance with updating your information.",
    },
    {
      question: "How can I export the data?",
      isOpen: false,
      answer:
        "You can export the data in PDF or Excel format, sorted by department and year. This feature ensures that the data is organized and easily accessible for further processing.",
    },
    {
      question: "Who can use this app?",
      isOpen: false,
      answer:
        "This app is intended for use by EMEA College Clubs, specifically for collecting student data during events.",
    },
    {
      question: "How can I contact the developer?",
      isOpen: false,
      answer:
        "You can reach out to the developer by clicking on the '...Me...' link at the bottom of the page.",
    },
    {
      question: "Who developed and designed this app?",
      isOpen: false,
      answer:
        "MARK !T was meticulously developed by Muhammed Shamil, the Chief Technology Officer (CTO) of IEDC and a dedicated second-year BSc Computer Science student at EMEA College. The innovative design was crafted by Dayyan Ali, also a second-year BSc Computer Science student and a valued member of the IEDC technical team. This visionary app was conceptualized by Hasil, the Chief Creative Officer (CCO) of IEDC and a Bcom student, and brought to life through the collaborative efforts of the entire IEDC technical team.",
    },
    {
      question: "How can a New Club Core team connect with us?",
      isOpen: false,
      answer:
        "New club core teams can connect with us through the contact section of the app. They can request an account, which will be verified by the admin. Once verified, they will receive an email with login credentials. Using their account, they can create, edit, and delete events, add students to events, scan IDs, export data, and more. If a student does not exist in the system, they can create a new student entry.",
    },
    {
      question: "How can I get in touch with the IEDC EMEA team?",
      isOpen: false,
      answer:
        "You can easily reach out to the IEDC EMEA team by visiting the contact page on our app or by sending an email to IEDC EMEA. Additionally, you can connect with the IEDC EMEA team, including our CEO Sunain, a third-year BSc Computer Science student, and other members, both offline and through our various social media platforms.",
    },
    {
      question: "How can I get in touch with the Contributers?",
      isOpen: false,
      answer: (
        <div>
          You can reach out to the contributors through their LinkedIn profiles.
          Click to reach
          <span
            className="cursor-pointer px-1 text-emerald-600 hover:underline"
            onClick={() =>
              window.open("https://www.linkedin.com/in/dayyan-ali/")
            }
          >
            Dayyan Ali
          </span>
          , to reach
          <span
            className="cursor-pointer px-1 text-emerald-600 hover:underline"
            onClick={() => window.open("https://www.linkedin.com/in/hasil-k/")}
          >
            Hasil K
          </span>
          , to reach
          <span
            className="mx-1 cursor-pointer text-emerald-600 hover:underline"
            onClick={() =>
              window.open(
                "https://www.linkedin.com/in/muhammed-shamil-65878227a/",
              )
            }
          >
            Muhammed Shamil
          </span>
          .
        </div>
      ),
    },
  ]);

  return (
    <div className="m-2 mb-20 flex min-h-screen flex-col justify-between p-2 text-black dark:text-white">
      <div>
        <h1 className="mt-4 flex flex-col">
          <span className="text-2xl font-black tracking-wider text-emerald-600">
            MARK !T
          </span>
          <span className="text-sm text-gray-300">By IEDC EMEA</span>
        </h1>

        <div className="mb-10 flex items-center justify-start">
          <img
            src={AboutImage}
            alt="About"
            className="rounded-lg object-cover"
          />
        </div>
        <h1 className="mb-4 text-[34px] font-bold">About Us!</h1>
        <p className="mb-4 text-lg">
          The Innovation and Entrepreneurship Development Centre{" "}
          <span className="text-emerald-600">( IEDC )</span> at EMEA College is
          a dynamic hub that fosters innovation, creativity, and entrepreneurial
          spirit among students. Our mission is to empower students by providing
          them with opportunities to experiment, innovate, and develop their
          creative capabilities. We aim to inspire and incubate student-led
          startups and innovations, paving the way for their international
          success. Our vision is to create a streamlined and transparent
          platform that promotes and supports student innovations, helping them
          grow into global powerhouses. Our goal is to continue our track record
          of success and develop a new wave of student startups and innovations
          that can compete with established players in the entrepreneurial
          landscape. Join us at IEDC to innovate, inspire, and incubate your
          ideas into reality. For more information, visit our website{" "}
          <span
            className="cursor-pointer text-emerald-600"
            onClick={() => window.open("https://iedc-emea.vercel.app/#/")}
          >
            here
          </span>
          .
        </p>

        <h1 className="mb-4 text-[32px] font-bold">
          About <span className="text-emerald-600">MARK !T</span>
        </h1>
        <p className="mb-4 text-lg">
          <span className="text-emerald-600">MARK !T</span> is a solution
          developed for EMEA College to streamline the process of collecting
          student data during events organized by clubs and other departments.
          Previously, volunteers had to manually write down details such as
          admission number, name, roll number, department, and whether they are
          undergraduate or postgraduate students. This manual process was not
          only time-consuming but also prone to errors, especially during data
          sorting and entry into the attendance software.
        </p>
        <p className="mb-4 text-lg">
          With <span className="text-emerald-600">MARK !T</span>, volunteers can
          easily add students to the event list by entering their admission
          numbers. This significantly reduces the time and effort required for
          data collection. Additionally, multiple volunteers can simultaneously
          access a live table displaying student data, making coordination more
          efficient. The app also features a scan ID card functionality,
          allowing for even faster entry of admission numbers.
        </p>
        <p className="mb-4 text-lg">
          One of the key features of{" "}
          <span className="text-emerald-600">MARK !T</span> is its ability to
          export student data to PDF or Excel format, sorted by department and
          year. This feature ensures that the data is organized and easily
          accessible for further processing. Overall,{" "}
          <span className="text-emerald-600">MARK !T</span> provides a
          user-friendly and efficient solution for managing student data during
          college events, enhancing the experience for both volunteers and the
          core team of the clubs.
        </p>
        <p className="mb-4 text-lg">
          In addition to its event management capabilities,{" "}
          <span className="text-emerald-600">MARK !T</span> also includes an
          admin panel for managing students and users. This panel allows
          administrators to control access, monitor activity, and perform
          various CRUD operations to maintain the system.
        </p>

        <div className="mt-10">
          <h3 className="text-left text-lg font-semibold dark:text-white">
            FAQs
          </h3>
          {faqs.map((item, index) => (
            <div key={index} className="">
              <h2
                className="flex cursor-pointer items-center justify-between border-b border-gray-300 p-2 text-lg font-semibold transition-all ease-in-out hover:underline dark:border-b dark:border-gray-700"
                onClick={() =>
                  setFaqs(
                    faqs.map((s, i) =>
                      i === index ? { ...s, isOpen: !s.isOpen } : s,
                    ),
                  )
                }
              >
                {item.question}?
                {item.isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </h2>
              <div ref={parent}>
                {item.isOpen ? (
                  <div className="py-2 !text-sm">{item.answer}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-10 flex gap-2">
        <SlSocialLinkedin
          className="m-1.5 cursor-pointer text-xl text-gray-500 transition-all ease-in-out hover:text-gray-700"
          onClick={() =>
            window.open("https://www.linkedin.com/company/iedcemea")
          }
        />
        <FaInstagram
          className="m-2 cursor-pointer text-xl text-gray-500 transition-all ease-in-out hover:text-gray-700"
          onClick={() => window.open("https://www.instagram.com/iedcemea/")}
        />
        <IoMailOutline
          className="m-2 cursor-pointer text-xl text-gray-500 transition-all ease-in-out hover:text-gray-700"
          onClick={() => window.open("mailto:emeaiedc@gmail.com")}
        />
      </p>

      <p className="mt-10 text-center">
        crafted with <span className="text-red-600">❤</span> by{" "}
        <a href="https://zamil.me" className="hover:underline">
          {" "}
          ...Me...{" "}
        </a>
      </p>
    </div>
  );
};

export default About;
