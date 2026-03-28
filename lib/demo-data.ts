// ====================================================
// SKILLSYNC – IT TRAINING DEMO DATA
// ====================================================

export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export interface DemoUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatar: string;
  city: string;
  xp: number;
  level: number;
  streak: number;
  coins: number;
  joinedAt: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 1,
    name: "Arjun Subramanian",
    email: "student@demo.com",
    password: "demo123",
    role: "STUDENT",
    avatar: "AS",
    city: "Chennai",
    xp: 3420,
    level: 7,
    streak: 12,
    coins: 850,
    joinedAt: "2024-06-10",
  },
  {
    id: 2,
    name: "Divya Narayanan",
    email: "teacher@demo.com",
    password: "demo123",
    role: "TEACHER",
    avatar: "DN",
    city: "Bangalore",
    xp: 12000,
    level: 25,
    streak: 45,
    coins: 3200,
    joinedAt: "2023-08-01",
  },
  {
    id: 3,
    name: "Karthik Murugan",
    email: "admin@demo.com",
    password: "demo123",
    role: "ADMIN",
    avatar: "KM",
    city: "Madurai",
    xp: 25000,
    level: 50,
    streak: 120,
    coins: 9999,
    joinedAt: "2023-01-01",
  },
  {
    id: 8,
    name: "Meena Balaji",
    email: "meena@demo.com",
    password: "demo123",
    role: "TEACHER",
    avatar: "MB",
    city: "Hyderabad",
    xp: 9500,
    level: 20,
    streak: 60,
    coins: 2400,
    joinedAt: "2023-11-15",
  },
];

export interface DemoCourse {
  id: number;
  title: string;
  description: string;
  subject: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  instructor: string;
  instructorId: number;
  duration: string;
  lessons: number;
  enrolled: number;
  rating: number;
  image: string;
  tags: string[];
  progress?: number;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export const DEMO_COURSES: DemoCourse[] = [
  { id: 1, title: "Java Programming Mastery", description: "Core Java, OOP, Collections, and Multithreading.", subject: "Programming", difficulty: "EASY", instructor: "Divya Narayanan", instructorId: 2, duration: "15 hours", lessons: 5, enrolled: 520, rating: 4.8, image: "/images/java.png", tags: ["Java","OOP"], status: "IN_PROGRESS", progress: 60 },
  { id: 2, title: "Advanced Data Structures", description: "Stacks, Queues, Trees, Graphs, and Complexity Analysis.", subject: "DSA", difficulty: "HARD", instructor: "Divya Narayanan", instructorId: 2, duration: "18 hours", lessons: 5, enrolled: 430, rating: 4.9, image: "/images/dsa.png", tags: ["DSA","Algorithms"], status: "NOT_STARTED", progress: 0 },
  { id: 3, title: "Full Stack Web Development", description: "HTML, CSS, JS, React, Node & MongoDB.", subject: "Web Development", difficulty: "MEDIUM", instructor: "Meena Balaji", instructorId: 8, duration: "25 hours", lessons: 5, enrolled: 780, rating: 4.9, image: "/images/fullstack.png", tags: ["React","Node"], status: "IN_PROGRESS", progress: 40 },
  { id: 4, title: "SQL & Database Optimization", description: "Joins, Indexing, Transactions, Query Optimization.", subject: "Database", difficulty: "MEDIUM", instructor: "Meena Balaji", instructorId: 8, duration: "12 hours", lessons: 5, enrolled: 510, rating: 4.7, image: "/images/sql.png", tags: ["SQL","PostgreSQL"], status: "NOT_STARTED", progress: 0 },
  { id: 5, title: "Machine Learning Foundations", description: "Regression, Classification, Model Evaluation.", subject: "AI", difficulty: "HARD", instructor: "Divya Narayanan", instructorId: 2, duration: "20 hours", lessons: 5, enrolled: 390, rating: 4.8, image: "/images/ml.png", tags: ["ML","Python"], status: "NOT_STARTED", progress: 0 },
  { id: 6, title: "Cloud Computing with AWS", description: "EC2, S3, IAM, Deployment & Scaling.", subject: "Cloud", difficulty: "MEDIUM", instructor: "Meena Balaji", instructorId: 8, duration: "16 hours", lessons: 5, enrolled: 460, rating: 4.7, image: "/images/aws.png", tags: ["AWS","Cloud"], status: "NOT_STARTED", progress: 0 },
  { id: 7, title: "Cybersecurity Essentials", description: "Network Security, Encryption, Ethical Hacking Basics.", subject: "Security", difficulty: "MEDIUM", instructor: "Divya Narayanan", instructorId: 2, duration: "14 hours", lessons: 5, enrolled: 340, rating: 4.6, image: "/images/default-course.png", tags: ["Cybersecurity"], status: "NOT_STARTED", progress: 0 },
  { id: 8, title: "DevOps & CI/CD Pipeline", description: "Docker, Kubernetes, GitHub Actions.", subject: "DevOps", difficulty: "HARD", instructor: "Meena Balaji", instructorId: 8, duration: "22 hours", lessons: 5, enrolled: 310, rating: 4.8, image: "/images/devops.png", tags: ["Docker","CI/CD"], status: "NOT_STARTED", progress: 0 },
  { id: 9, title: "Python for Data Science", description: "NumPy, Pandas, Matplotlib, Data Analysis.", subject: "Data Science", difficulty: "MEDIUM", instructor: "Divya Narayanan", instructorId: 2, duration: "18 hours", lessons: 5, enrolled: 600, rating: 4.9, image: "/images/datascience.png", tags: ["Python","Pandas"], status: "IN_PROGRESS", progress: 55 },
  { id: 10, title: "System Design & Architecture", description: "Scalability, Microservices, Distributed Systems.", subject: "Architecture", difficulty: "HARD", instructor: "Meena Balaji", instructorId: 8, duration: "20 hours", lessons: 5, enrolled: 280, rating: 4.8, image: "/images/dsa.png", tags: ["Microservices"], status: "NOT_STARTED", progress: 0 }
];

export const STUDENT_ENROLLED_IDS = [1, 3, 9];

export type LessonParagraph = {
  content: string;
  reference_web: string;
  animation: string;
};

export type LessonContent = {
  text: LessonParagraph[];
  youtubeLinks?: string[];
  referenceLinks?: string[];
  animation: string;
};

export interface DemoLesson {
  id: number;
  courseId: number;
  title: string;
  duration: string;
  type: "VIDEO" | "INTERACTIVE" | "TEXT" | "QUIZ";
  completed: boolean;
  xpReward: number;
  content?: LessonContent;
}

export const DEMO_LESSONS: DemoLesson[] = [
  // Course 1: Java
  { 
    id: 1, 
    courseId: 1, 
    title: "Introduction to Java", 
    type: "INTERACTIVE", 
    duration: "10m", 
    completed: true, 
    xpReward: 50,
    content: {
      text: [
        {
          content: "Java is a popular, class-based, object-oriented programming language. It is designed to have as few implementation dependencies as possible, meaning that compiled Java code can run on all platforms that support Java without the need for recompilation.",
          reference_web: "https://en.wikipedia.org/wiki/Java_(programming_language)",
          animation: "fade-in"
        },
        {
          content: "One of Java's most significant features is its platform independence. This is achieved through the use of the Java Virtual Machine (JVM), which executes Java bytecode. This 'Write Once, Run Anywhere' (WORA) philosophy has made Java a staple in enterprise environments.",
          reference_web: "https://www.oracle.com/java/technologies/java-platform-overview.html",
          animation: "slide-up"
        }
      ],
      youtubeLinks: ["https://www.youtube.com/watch?v=eIrMbLywjGU"],
      referenceLinks: ["https://docs.oracle.com/javase/tutorial/"],
      animation: "zoom-in"
    }
  },
  { 
    id: 2, 
    courseId: 1, 
    title: "Variables & Data Types", 
    type: "INTERACTIVE", 
    duration: "15m", 
    completed: true, 
    xpReward: 50,
    content: {
      text: [
        {
          content: "In Java, every variable has a data type. Data types in Java are divided into two main categories: primitive types (like int, double, boolean) and reference types (like String, Array, and Objects).",
          reference_web: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html",
          animation: "fade-in"
        },
        {
          content: "Primitive data types are the building blocks of data manipulation. For example, 'int' is used for storing integers, while 'boolean' is used for true/false values. Understanding these is crucial for efficient memory management in Java.",
          reference_web: "https://www.w3schools.com/java/java_data_types.asp",
          animation: "slide-up"
        }
      ],
      youtubeLinks: ["https://www.youtube.com/watch?v=8mG_956J-7E"],
      animation: "fade-in"
    }
  },
  { 
    id: 3, 
    courseId: 1, 
    title: "Control Flow Statements", 
    type: "INTERACTIVE", 
    duration: "20m", 
    completed: true, 
    xpReward: 75,
    content: {
      text: [
        {
          content: "Control flow statements allow you to control the flow of execution in your program. Java provides several types of control flow statements, including decision-making (if-then, switch), looping (for, while, do-while), and branching (break, continue).",
          reference_web: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/flow.html",
          animation: "fade-in"
        }
      ],
      animation: "slide-up"
    }
  },
  { id: 4, courseId: 1, title: "Classes & Objects", type: "INTERACTIVE", duration: "25m", completed: false, xpReward: 75 },
  { id: 5, courseId: 1, title: "Inheritance & Polymorphism", type: "INTERACTIVE", duration: "30m", completed: false, xpReward: 100 },
  // Course 2: DSA
  { id: 6, courseId: 2, title: "Time Complexity & Big O", type: "INTERACTIVE", duration: "12m", completed: false, xpReward: 50 },
  { id: 7, courseId: 2, title: "Arrays & Linked Lists", type: "INTERACTIVE", duration: "20m", completed: false, xpReward: 75 },
  { id: 8, courseId: 2, title: "Stacks & Queues", type: "INTERACTIVE", duration: "18m", completed: false, xpReward: 75 },
  { id: 9, courseId: 2, title: "Binary Trees Deep Dive", type: "INTERACTIVE", duration: "35m", completed: false, xpReward: 100 },
  { id: 10, courseId: 2, title: "Graph Algorithms", type: "INTERACTIVE", duration: "40m", completed: false, xpReward: 100 },
  // Course 3: Full Stack
  { 
    id: 11, 
    courseId: 3, 
    title: "React Hooks in Depth", 
    type: "INTERACTIVE", 
    duration: "25m", 
    completed: true, 
    xpReward: 75,
    content: {
      text: [
        {
          content: "React Hooks are functions that let you 'hook into' React state and lifecycle features from function components. They were introduced in React 16.8 and have since become the standard way to manage state and side effects.",
          reference_web: "https://reactjs.org/docs/hooks-intro.html",
          animation: "fade-in"
        },
        {
          content: "The most common hooks are useState for local state management and useEffect for handling side effects like data fetching or manual DOM manipulations. Hooks allow you to use state without writing a class.",
          reference_web: "https://reactjs.org/docs/hooks-reference.html",
          animation: "slide-up"
        }
      ],
      youtubeLinks: ["https://www.youtube.com/watch?v=dpw9EHDh2bM"],
      animation: "zoom-in"
    }
  },
  { id: 12, courseId: 3, title: "State Management", type: "INTERACTIVE", duration: "15m", completed: true, xpReward: 50 },
  { id: 13, courseId: 3, title: "Node.js Architecture", type: "INTERACTIVE", duration: "20m", completed: false, xpReward: 75 },
  { id: 14, courseId: 3, title: "Mongoose Schemas", type: "INTERACTIVE", duration: "30m", completed: false, xpReward: 100 },
  { id: 15, courseId: 3, title: "Deploying to Vercel", type: "INTERACTIVE", duration: "15m", completed: false, xpReward: 50 },
];

export interface DemoQuiz {
  id: number;
  courseId: number;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questions: DemoQuestion[];
  timeLimit: number;
  xpReward: number;
  lastScore?: number;
  attempted: boolean;
}

export interface DemoQuestion {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const DEMO_QUIZZES: DemoQuiz[] = [
  {
    id: 1,
    courseId: 1,
    title: "Java Fundamentals Quiz",
    difficulty: "EASY",
    timeLimit: 600,
    xpReward: 200,
    lastScore: 80,
    attempted: true,
    questions: [
      {
        id: 1,
        text: "Which of these is not a Java features?",
        options: ["Dynamic", "Architecture Neutral", "Use of pointers", "Object-oriented"],
        correctIndex: 2,
        explanation: "Java does not support explicit pointers for security and simplicity.",
      },
    ],
  },
];

export interface DemoAssignment {
  id: number;
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
  status: "PENDING" | "SUBMITTED" | "GRADED";
  score?: number;
  maxScore: number;
  xpReward: number;
}

export const DEMO_ASSIGNMENTS: DemoAssignment[] = [
  {
    id: 1,
    courseId: 1,
    title: "Java Interface Implementation",
    description: "Implement a set of interfaces for a library management system.",
    dueDate: "2025-04-05",
    status: "SUBMITTED",
    score: 8,
    maxScore: 10,
    xpReward: 150,
  },
];

export interface DemoAchievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  xpBonus: number;
}

export const DEMO_ACHIEVEMENTS: DemoAchievement[] = [
  { id: 1, title: "Code Ninja", description: "Complete your first IT lesson", icon: "Brain", earned: true, earnedAt: "2024-06-11", xpBonus: 50 },
  { id: 2, title: "Architecture Ace", description: "Score 100% on any System Design quiz", icon: "Trophy", earned: false, xpBonus: 200 },
];

export const TEACHER_ACHIEVEMENTS: DemoAchievement[] = [
  { id: 101, title: "Tech Mentor", description: "Publish 5 high-quality IT courses", icon: "BookOpen", earned: true, earnedAt: "2024-11-20", xpBonus: 500 },
];

export const AI_STUDENT_TIPS = [
  "Complete 3 more modules in Java to maintain your streak and earn bonus XP!",
  "Revision is key! Revisit the 'OOP Principles' module to solidify your understanding.",
];

export const AI_TEACHER_TIPS = [
  "Arjun Subramanian is excelling in Java. Consider assigning advanced multithreading material.",
  "Student engagement in 'Full Stack Development' is up by 18% this week!",
];

export interface DemoNotification {
  id: number;
  type: "MODULE_UNLOCKED" | "ACHIEVEMENT_EARNED" | "AI_RECOMMENDATION" | "QUIZ_COMPLETED" | "ENROLLMENT" | "ASSIGNMENT_GRADED" | "COURSE_PUBLISHED" | "STUDENT_ENROLLED" | "SYSTEM_ALERT" | "MEMBER_JOINED";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  icon: string;
  role: Role;
}

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  { id: 1, type: "ACHIEVEMENT_EARNED", title: "Achievement Unlocked!", message: "You earned 'Code Ninja' – 50 XP bonus added!", isRead: false, createdAt: "2025-02-27T10:30:00", icon: "Brain", role: "STUDENT" },
];

export interface DailyActivity {
  date: string;
  xp: number;
  lessons: number;
}

export const DEMO_DAILY_ACTIVITY: DailyActivity[] = [
  { date: "Mar 01", xp: 120, lessons: 2 },
  { date: "Mar 02", xp: 250, lessons: 4 },
];

export interface StudentPerformance {
  id: number;
  name: string;
  city: string;
  avatar: string;
  course: string;
  progress: number;
  quizAvg: number;
  streak: number;
  xp: number;
  lastActive: string;
}

export const TEACHER_STUDENT_DATA: StudentPerformance[] = [
  { id: 1, name: "Arjun Subramanian", city: "Chennai", avatar: "AS", course: "Java Programming Mastery", progress: 65, quizAvg: 80, streak: 12, xp: 3420, lastActive: "Today" },
];

export const ADMIN_STATS = {
  totalUsers: 1284,
  totalStudents: 1150,
  totalTeachers: 124,
  totalAdmins: 10,
  totalCourses: 10,
  totalEnrollments: 6820,
  courseCompletionRate: 68,
  avgQuizScore: 74,
  activeThisMonth: 892,
  newThisMonth: 143,
};

export const ADMIN_MONTHLY_DATA = [
  { month: "Jan", users: 1190, enrollments: 6200 },
  { month: "Feb", users: 1284, enrollments: 6820 },
];

export const LEVEL_XP_THRESHOLDS = [
  0, 200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400, 6500, 7700, 9000, 10400, 11900, 13500, 15200, 17000, 19000, 21000, 23200, 25500, 28000, 30600, 33300, 36100,
];

export function getXpForNextLevel(level: number): number {
  return LEVEL_XP_THRESHOLDS[level] || LEVEL_XP_THRESHOLDS[level - 1] + 3000;
}

export function getXpForCurrentLevel(level: number): number {
  return LEVEL_XP_THRESHOLDS[level - 1] || 0;
}
