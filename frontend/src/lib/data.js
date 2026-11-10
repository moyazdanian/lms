// fakeData.js

import { AVATAR_PLACEHOLDER } from "@/lib/avatar";

export const categories = [
  { id: 1, name: "Web Development", slug: "web-development" },
  { id: 2, name: "Mobile Development", slug: "mobile-development" },
  { id: 3, name: "Data Science", slug: "data-science" },
  { id: 4, name: "UI/UX Design", slug: "ui-ux" },
];

export const teachers = [
  {
    id: 1,
    name: "John Doe",
    avatar: AVATAR_PLACEHOLDER,
    bio: "web dev in america and very expert on evrything",
    specialty: "web development",
    courseCount: 1,
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: AVATAR_PLACEHOLDER,
    bio: "ai engeener on google i learn ai very good",
    specialty: "ai engeener",
    courseCount: 1,
  },
  {
    id: 3,
    name: "Michael Johnson",
    avatar: AVATAR_PLACEHOLDER,
    bio: "data sciense on meta i am very good on data",
    specialty: "Data Science",
    courseCount: 1,
  },
  {
    id: 4,
    name: "Sara Williams",
    avatar: AVATAR_PLACEHOLDER,
    bio: "iam sara i am a python programmer",
    specialty: "pythone",
    courseCount: 2,
  },
];

export const courses = [
  {
    id: 1,
    title: "React for Beginners",
    description:
      "Learn React from scratch with hands-on projects and build your first apps step by step.",
    price: 49,
    students: 1200,
    rating: 4.5,
    status: "Ongoing",
    category: "Web Development",
    image: "https://picsum.photos/300/200?random=21",
    teacher: teachers[0],
    sections: [
      {
        id: 1,
        title: "Introduction",
        lessons: [
          {
            id: 101,
            title: "Welcome & Setup",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          },
          {
            id: 102,
            title: "Why React?",
            videoUrl: "https://www.w3schools.com/html/movie.mp4",
          },
        ],
      },
      {
        id: 2,
        title: "Core Concepts",
        lessons: [
          {
            id: 201,
            title: "Components & Props",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          },
          {
            id: 202,
            title: "State & Events",
            videoUrl: "https://www.w3schools.com/html/movie.mp4",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Advanced Laravel",
    description:
      "Master Laravel framework with real-world applications and advanced concepts.",
    price: 79,
    students: 850,
    rating: 4.7,
    status: "Upcoming",
    category: "Web Development",
    image: "https://picsum.photos/300/200?random=22",
    teacher: teachers[1],
    sections: [
      {
        id: 1,
        title: "Getting Started",
        lessons: [
          {
            id: 301,
            title: "Setup & Installation",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          },
          {
            id: 302,
            title: "MVC Basics",
            videoUrl: "https://www.w3schools.com/html/movie.mp4",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Python for Data Science",
    description:
      "Learn Python essentials for data science, including Pandas, Numpy, and visualization.",
    price: 59,
    students: 1500,
    rating: 4.8,
    status: "Ongoing",
    category: "Data Science",
    image: "https://picsum.photos/300/200?random=23",
    teacher: teachers[2],
    sections: [
      {
        id: 1,
        title: "Introduction to Python",
        lessons: [
          {
            id: 401,
            title: "Variables & Data Types",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          },
          {
            id: 402,
            title: "Control Flow",
            videoUrl: "https://www.w3schools.com/html/movie.mp4",
          },
        ],
      },
      {
        id: 2,
        title: "Data Analysis",
        lessons: [
          {
            id: 403,
            title: "Pandas Basics",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          },
          {
            id: 404,
            title: "Numpy Arrays",
            videoUrl: "https://www.w3schools.com/html/movie.mp4",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    description:
      "Understand the basics of user interface and user experience design with practical projects.",
    price: 39,
    students: 600,
    rating: 4.3,
    status: "Completed",
    category: "UI/UX Design",
    image: "https://picsum.photos/300/200?random=24",
    teacher: teachers[3],
    sections: [
      {
        id: 1,
        title: "Introduction",
        lessons: [
          {
            id: 501,
            title: "What is UI/UX?",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          },
          {
            id: 502,
            title: "Design Principles",
            videoUrl: "https://www.w3schools.com/html/movie.mp4",
          },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "UI/UX Design professional",
    description:
      "Understand the basics of user interface and user experience design with practical projects.",
    price: 55,
    students: 1100,
    rating: 4.3,
    status: "Completed",
    category: "UI/UX Design",
    image: "https://picsum.photos/300/200?random=25",
    teacher: teachers[3],
    sections: [
      {
        id: 1,
        title: "Introduction",
        lessons: [
          {
            id: 501,
            title: "What is UI/UX?",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          },
          {
            id: 502,
            title: "Design Principles",
            videoUrl: "https://www.w3schools.com/html/movie.mp4",
          },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "UI/UX Design addvance",
    description:
      "Understand the basics of user interface and user experience design with practical projects.",
    price: 55,
    students: 1333,
    rating: 4.3,
    status: "ongoing",
    category: "UI/UX Design",
    image: "https://picsum.photos/300/200?random=26",
    teacher: teachers[3],
    sections: [
      {
        id: 1,
        title: "Introduction",
        lessons: [
          {
            id: 501,
            title: "What is UI/UX?",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          },
          {
            id: 502,
            title: "Design Principles",
            videoUrl: "https://www.w3schools.com/html/movie.mp4",
          },
        ],
      },
    ],
  },
];
