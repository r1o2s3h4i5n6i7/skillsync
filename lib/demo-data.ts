// ====================================================
// INTELLIXLEARN – DEMO DATA (Tamil Nadu, India)
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
    name: "Priya Ramasamy",
    email: "teacher@demo.com",
    password: "demo123",
    role: "TEACHER",
    avatar: "PR",
    city: "Coimbatore",
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
    id: 4,
    name: "Ananya Krishnamurthy",
    email: "ananya@demo.com",
    password: "demo123",
    role: "STUDENT",
    avatar: "AK",
    city: "Trichy",
    xp: 1890,
    level: 4,
    streak: 5,
    coins: 420,
    joinedAt: "2024-09-15",
  },
  {
    id: 5,
    name: "Vikram Natarajan",
    email: "vikram@demo.com",
    password: "demo123",
    role: "STUDENT",
    avatar: "VN",
    city: "Salem",
    xp: 5600,
    level: 11,
    streak: 22,
    coins: 1380,
    joinedAt: "2024-03-20",
  },
  {
    id: 6,
    name: "Deepa Sundaram",
    email: "deepa@demo.com",
    password: "demo123",
    role: "STUDENT",
    avatar: "DS",
    city: "Tirunelveli",
    xp: 780,
    level: 2,
    streak: 3,
    coins: 180,
    joinedAt: "2025-01-05",
  },
  {
    id: 7,
    name: "Suresh Pandian",
    email: "suresh@demo.com",
    password: "demo123",
    role: "STUDENT",
    avatar: "SP",
    city: "Erode",
    xp: 4100,
    level: 9,
    streak: 18,
    coins: 960,
    joinedAt: "2024-05-12",
  },
  {
    id: 8,
    name: "Meena Balaji",
    email: "meena@demo.com",
    password: "demo123",
    role: "TEACHER",
    avatar: "MB",
    city: "Vellore",
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
  {
    id: 1,
    title: "Mathematics – Algebra Fundamentals",
    description:
      "Master algebraic expressions, equations, and functions with step-by-step visual explanations tailored for Class 9–10 students.",
    subject: "Mathematics",
    difficulty: "EASY",
    instructor: "Priya Ramasamy",
    instructorId: 2,
    duration: "8 hours",
    lessons: 24,
    enrolled: 342,
    rating: 4.8,
    image: "/images/course-math.jpg",
    tags: ["Algebra", "Equations", "Class 9"],
    progress: 65,
    status: "IN_PROGRESS",
  },
  {
    id: 2,
    title: "Physics – Light & Optics",
    description:
      "Explore the behaviour of light through animations, real-life examples, and interactive experiments on reflection, refraction, and lenses.",
    subject: "Physics",
    difficulty: "MEDIUM",
    instructor: "Meena Balaji",
    instructorId: 8,
    duration: "6 hours",
    lessons: 18,
    enrolled: 215,
    rating: 4.6,
    image: "/images/course-physics.jpg",
    tags: ["Optics", "Light", "Class 10"],
    progress: 30,
    status: "IN_PROGRESS",
  },
  {
    id: 3,
    title: "Chemistry – Periodic Table & Bonding",
    description:
      "Understand the periodic table, chemical bonding, and reactions through engaging activities and memory aids.",
    subject: "Chemistry",
    difficulty: "MEDIUM",
    instructor: "Priya Ramasamy",
    instructorId: 2,
    duration: "7 hours",
    lessons: 20,
    enrolled: 198,
    rating: 4.7,
    image: "/images/course-chemistry.jpg",
    tags: ["Periodic Table", "Bonding", "Class 10"],
    progress: 0,
    status: "NOT_STARTED",
  },
  {
    id: 4,
    title: "Biology – Cell Structure & Division",
    description:
      "Dive deep into cell biology with 3D animations, quiz challenges, and concept maps covering mitosis and meiosis.",
    subject: "Biology",
    difficulty: "EASY",
    instructor: "Meena Balaji",
    instructorId: 8,
    duration: "5 hours",
    lessons: 15,
    enrolled: 278,
    rating: 4.9,
    image: "/images/course-biology.jpg",
    tags: ["Cells", "Division", "Class 9"],
    progress: 100,
    status: "COMPLETED",
  },
  {
    id: 5,
    title: "Computer Science – Python Basics",
    description:
      "Learn Python programming from scratch with hands-on coding exercises, games, and real-world mini-projects.",
    subject: "Computer Science",
    difficulty: "EASY",
    instructor: "Priya Ramasamy",
    instructorId: 2,
    duration: "10 hours",
    lessons: 30,
    enrolled: 512,
    rating: 4.9,
    image: "/images/course-cs.jpg",
    tags: ["Python", "Programming", "Beginner"],
    progress: 45,
    status: "IN_PROGRESS",
  },
  {
    id: 6,
    title: "Physics – Mechanics & Motion",
    description:
      "Master Newton's laws, kinematics, and dynamics through interactive simulations and challenge problems.",
    subject: "Physics",
    difficulty: "HARD",
    instructor: "Meena Balaji",
    instructorId: 8,
    duration: "9 hours",
    lessons: 27,
    enrolled: 156,
    rating: 4.5,
    image: "/images/course-mechanics.jpg",
    tags: ["Mechanics", "Newton's Laws", "Class 11"],
    progress: 0,
    status: "NOT_STARTED",
  },
  {
    id: 7,
    title: "Mathematics – Trigonometry",
    description:
      "Build a strong trigonometry foundation with animated unit circles, identities, and application problems.",
    subject: "Mathematics",
    difficulty: "MEDIUM",
    instructor: "Priya Ramasamy",
    instructorId: 2,
    duration: "7 hours",
    lessons: 21,
    enrolled: 290,
    rating: 4.7,
    image: "/images/course-trig.jpg",
    tags: ["Trigonometry", "Identities", "Class 10"],
    progress: 0,
    status: "NOT_STARTED",
  },
  {
    id: 8,
    title: "Environmental Science – Ecosystems",
    description:
      "Explore Tamil Nadu's rich biodiversity through field-study simulations, food chains, and sustainability topics.",
    subject: "Environmental Science",
    difficulty: "EASY",
    instructor: "Meena Balaji",
    instructorId: 8,
    duration: "4 hours",
    lessons: 12,
    enrolled: 324,
    rating: 4.8,
    image: "/images/course-env.jpg",
    tags: ["Ecosystems", "Biodiversity", "Sustainability"],
    progress: 80,
    status: "IN_PROGRESS",
  },
];

export const STUDENT_ENROLLED_IDS = [1, 2, 4, 5, 8];

export interface DemoLesson {
  id: number;
  courseId: number;
  title: string;
  duration: string;
  type: "VIDEO" | "TEXT" | "INTERACTIVE";
  completed: boolean;
  xpReward: number;
}

export const DEMO_LESSONS: DemoLesson[] = [
  { id: 1, courseId: 1, title: "Introduction to Algebra", duration: "12 min", type: "VIDEO", completed: true, xpReward: 50 },
  { id: 2, courseId: 1, title: "Variables and Expressions", duration: "15 min", type: "TEXT", completed: true, xpReward: 50 },
  { id: 3, courseId: 1, title: "Solving Linear Equations", duration: "20 min", type: "INTERACTIVE", completed: true, xpReward: 75 },
  { id: 4, courseId: 1, title: "Quadratic Equations", duration: "18 min", type: "VIDEO", completed: false, xpReward: 75 },
  { id: 5, courseId: 1, title: "Polynomials", duration: "22 min", type: "TEXT", completed: false, xpReward: 100 },
  { id: 6, courseId: 2, title: "Nature of Light", duration: "14 min", type: "VIDEO", completed: true, xpReward: 50 },
  { id: 7, courseId: 2, title: "Reflection of Light", duration: "16 min", type: "INTERACTIVE", completed: false, xpReward: 75 },
  { id: 8, courseId: 2, title: "Refraction and Snell's Law", duration: "20 min", type: "VIDEO", completed: false, xpReward: 75 },
  { id: 9, courseId: 4, title: "Cell Structure Overview", duration: "10 min", type: "VIDEO", completed: true, xpReward: 50 },
  { id: 10, courseId: 4, title: "Organelles and Functions", duration: "18 min", type: "INTERACTIVE", completed: true, xpReward: 75 },
  { id: 11, courseId: 4, title: "Mitosis Process", duration: "20 min", type: "VIDEO", completed: true, xpReward: 100 },
  { id: 12, courseId: 5, title: "Python Installation & Setup", duration: "8 min", type: "TEXT", completed: true, xpReward: 30 },
  { id: 13, courseId: 5, title: "Variables and Data Types", duration: "15 min", type: "INTERACTIVE", completed: true, xpReward: 50 },
  { id: 14, courseId: 5, title: "Conditionals (if/else)", duration: "18 min", type: "VIDEO", completed: false, xpReward: 75 },
  { id: 15, courseId: 8, title: "What is an Ecosystem?", duration: "12 min", type: "VIDEO", completed: true, xpReward: 50 },
  { id: 16, courseId: 8, title: "Food Chains in TN Forests", duration: "16 min", type: "INTERACTIVE", completed: true, xpReward: 75 },
  { id: 17, courseId: 8, title: "Conservation Practices", duration: "14 min", type: "TEXT", completed: false, xpReward: 60 },
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
    title: "Algebra Basics Quiz",
    difficulty: "EASY",
    timeLimit: 600,
    xpReward: 200,
    lastScore: 80,
    attempted: true,
    questions: [
      {
        id: 1,
        text: "What is the value of x in: 2x + 6 = 14?",
        options: ["2", "4", "6", "8"],
        correctIndex: 1,
        explanation: "2x = 14 - 6 = 8, so x = 4.",
      },
      {
        id: 2,
        text: "Simplify: 3a + 2b + 5a - b",
        options: ["8a + b", "8a - b", "8a + 3b", "2a + b"],
        correctIndex: 0,
        explanation: "3a + 5a = 8a and 2b - b = b, so 8a + b.",
      },
      {
        id: 3,
        text: "Which is a quadratic equation?",
        options: ["2x + 3 = 0", "x² + 4x + 4 = 0", "x³ - 1 = 0", "5x = 10"],
        correctIndex: 1,
        explanation: "A quadratic equation has degree 2. x² + 4x + 4 = 0 qualifies.",
      },
      {
        id: 4,
        text: "Evaluate 5² - 3²",
        options: ["16", "25", "4", "34"],
        correctIndex: 0,
        explanation: "25 - 9 = 16.",
      },
      {
        id: 5,
        text: "What is the degree of polynomial 4x³ + 2x² - x + 7?",
        options: ["1", "2", "3", "4"],
        correctIndex: 2,
        explanation: "The highest power of x is 3, so the degree is 3.",
      },
    ],
  },
  {
    id: 2,
    courseId: 2,
    title: "Light & Optics Quiz",
    difficulty: "MEDIUM",
    timeLimit: 480,
    xpReward: 250,
    lastScore: undefined,
    attempted: false,
    questions: [
      {
        id: 1,
        text: "The speed of light in vacuum is approximately:",
        options: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"],
        correctIndex: 0,
        explanation: "Light travels at ~3×10⁸ m/s in vacuum.",
      },
      {
        id: 2,
        text: "When a ray of light travels from water to air, it bends:",
        options: ["Towards the normal", "Away from the normal", "Along the normal", "Does not bend"],
        correctIndex: 1,
        explanation: "Travelling from denser to rarer medium → bends away from the normal.",
      },
      {
        id: 3,
        text: "A concave lens is also called a:",
        options: ["Converging lens", "Diverging lens", "Plane lens", "Bifocal lens"],
        correctIndex: 1,
        explanation: "Concave lenses diverge light rays, hence diverging lens.",
      },
      {
        id: 4,
        text: "The angle of incidence equals the angle of reflection is:",
        options: ["Snell's Law", "Huygen's Principle", "Law of Reflection", "Brewster's Law"],
        correctIndex: 2,
        explanation: "The Law of Reflection states angle of incidence = angle of reflection.",
      },
      {
        id: 5,
        text: "Total internal reflection occurs when light travels from:",
        options: ["Rarer to denser medium", "Denser to rarer medium", "Air to glass", "Glass to glass"],
        correctIndex: 1,
        explanation: "TIR occurs when light moves from denser to rarer medium beyond critical angle.",
      },
    ],
  },
  {
    id: 3,
    courseId: 4,
    title: "Cell Biology Quiz",
    difficulty: "EASY",
    timeLimit: 540,
    xpReward: 150,
    lastScore: 100,
    attempted: true,
    questions: [
      {
        id: 1,
        text: "Which organelle is called the 'powerhouse of the cell'?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"],
        correctIndex: 2,
        explanation: "Mitochondria produce ATP via cellular respiration.",
      },
      {
        id: 2,
        text: "Cell wall is present in:",
        options: ["Animal cells only", "Plant cells only", "Both plant and animal cells", "Neither"],
        correctIndex: 1,
        explanation: "Only plant cells have a cell wall made of cellulose.",
      },
      {
        id: 3,
        text: "During mitosis, the cell divides into how many daughter cells?",
        options: ["1", "2", "4", "8"],
        correctIndex: 1,
        explanation: "Mitosis produces 2 genetically identical daughter cells.",
      },
      {
        id: 4,
        text: "DNA is located in the:",
        options: ["Cytoplasm", "Cell membrane", "Nucleus", "Vacuole"],
        correctIndex: 2,
        explanation: "DNA is housed in the nucleus within chromosomes.",
      },
    ],
  },
  {
    id: 4,
    courseId: 5,
    title: "Python Basics Quiz",
    difficulty: "EASY",
    timeLimit: 600,
    xpReward: 200,
    lastScore: 60,
    attempted: true,
    questions: [
      {
        id: 1,
        text: "Which keyword is used to define a function in Python?",
        options: ["function", "def", "func", "define"],
        correctIndex: 1,
        explanation: "Python uses 'def' to declare a function.",
      },
      {
        id: 2,
        text: "What is the output of: print(2 ** 3)?",
        options: ["6", "8", "5", "9"],
        correctIndex: 1,
        explanation: "** is the exponentiation operator: 2³ = 8.",
      },
      {
        id: 3,
        text: "Which data type is: name = 'Arjun'?",
        options: ["int", "float", "bool", "str"],
        correctIndex: 3,
        explanation: "Text enclosed in quotes is a string (str).",
      },
      {
        id: 4,
        text: "Which loop is used when the number of iterations is known?",
        options: ["while loop", "for loop", "do-while loop", "foreach loop"],
        correctIndex: 1,
        explanation: "A 'for' loop is best when iterations are predetermined.",
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
    title: "Solve 10 Linear Equations",
    description: "Solve the given 10 linear equations step-by-step and upload your solution sheet.",
    dueDate: "2025-03-05",
    status: "SUBMITTED",
    score: 8,
    maxScore: 10,
    xpReward: 150,
  },
  {
    id: 2,
    courseId: 2,
    title: "Lab Report: Mirror Experiment",
    description: "Conduct the mirror experiment, record observations, and write a lab report.",
    dueDate: "2025-03-10",
    status: "PENDING",
    maxScore: 20,
    xpReward: 200,
  },
  {
    id: 3,
    courseId: 4,
    title: "Draw and Label Cell Diagram",
    description: "Draw a plant cell and an animal cell, label all major organelles.",
    dueDate: "2025-02-28",
    status: "GRADED",
    score: 18,
    maxScore: 20,
    xpReward: 200,
  },
  {
    id: 4,
    courseId: 5,
    title: "Create a Calculator Program",
    description: "Write a Python program that performs addition, subtraction, multiplication, and division.",
    dueDate: "2025-03-15",
    status: "PENDING",
    maxScore: 25,
    xpReward: 300,
  },
  {
    id: 5,
    courseId: 8,
    title: "Ecosystem Observation Journal",
    description: "Observe and document a local ecosystem near your home or school for 3 days.",
    dueDate: "2025-03-20",
    status: "SUBMITTED",
    score: undefined,
    maxScore: 15,
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
  { id: 1, title: "First Step", description: "Complete your first lesson", icon: "Star", earned: true, earnedAt: "2024-06-11", xpBonus: 50 },
  { id: 2, title: "Quiz Master", description: "Score 100% on any quiz", icon: "Trophy", earned: true, earnedAt: "2024-07-02", xpBonus: 200 },
  { id: 3, title: "7-Day Streak", description: "Learn for 7 days in a row", icon: "Flame", earned: true, earnedAt: "2024-06-18", xpBonus: 100 },
  { id: 4, title: "Course Finisher", description: "Complete an entire course", icon: "Award", earned: true, earnedAt: "2024-08-15", xpBonus: 500 },
  { id: 5, title: "Fast Learner", description: "Complete 5 lessons in one day", icon: "Zap", earned: false, xpBonus: 150 },
  { id: 6, title: "Science Whiz", description: "Enroll in 3 science courses", icon: "FlaskConical", earned: false, xpBonus: 200 },
  { id: 7, title: "30-Day Streak", description: "Learn for 30 days in a row", icon: "Flame", earned: false, xpBonus: 500 },
  { id: 8, title: "Top Scorer", description: "Rank in top 10 of any course", icon: "Medal", earned: false, xpBonus: 300 },
];

export interface DemoNotification {
  id: number;
  type: "MODULE_UNLOCKED" | "ACHIEVEMENT_EARNED" | "AI_RECOMMENDATION" | "QUIZ_COMPLETED" | "ENROLLMENT" | "ASSIGNMENT_GRADED";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  icon: string;
}

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  { id: 1, type: "ACHIEVEMENT_EARNED", title: "Achievement Unlocked!", message: "You earned 'Quiz Master' – 200 XP bonus added!", isRead: false, createdAt: "2025-02-27T10:30:00", icon: "Trophy" },
  { id: 2, type: "QUIZ_COMPLETED", title: "Quiz Completed", message: "You scored 80% on 'Algebra Basics Quiz'. Keep it up!", isRead: false, createdAt: "2025-02-26T15:20:00", icon: "CheckCircle" },
  { id: 3, type: "AI_RECOMMENDATION", title: "Recommended for You", message: "Based on your progress, try 'Trigonometry' next!", isRead: false, createdAt: "2025-02-26T09:00:00", icon: "Sparkles" },
  { id: 4, type: "ENROLLMENT", title: "Enrollment Successful", message: "You've enrolled in 'Physics – Light & Optics'.", isRead: true, createdAt: "2025-02-25T14:00:00", icon: "BookOpen" },
  { id: 5, type: "MODULE_UNLOCKED", title: "New Module Unlocked!", message: "You unlocked 'Quadratic Equations' in Algebra!", isRead: true, createdAt: "2025-02-24T11:45:00", icon: "Unlock" },
  { id: 6, type: "ASSIGNMENT_GRADED", title: "Assignment Graded", message: "Your 'Cell Diagram' was graded: 18/20. Excellent work!", isRead: true, createdAt: "2025-02-23T16:30:00", icon: "ClipboardCheck" },
  { id: 7, type: "QUIZ_COMPLETED", title: "Quiz Completed", message: "You scored 100% on 'Cell Biology Quiz'! Perfect score!", isRead: true, createdAt: "2025-02-22T10:00:00", icon: "CheckCircle" },
];

export interface DailyActivity {
  date: string;
  xp: number;
  lessons: number;
}

export const DEMO_DAILY_ACTIVITY: DailyActivity[] = [
  { date: "Feb 21", xp: 120, lessons: 2 },
  { date: "Feb 22", xp: 250, lessons: 4 },
  { date: "Feb 23", xp: 180, lessons: 3 },
  { date: "Feb 24", xp: 320, lessons: 5 },
  { date: "Feb 25", xp: 90, lessons: 1 },
  { date: "Feb 26", xp: 420, lessons: 6 },
  { date: "Feb 27", xp: 200, lessons: 3 },
];

// Teacher analytics data
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
  { id: 1, name: "Arjun Subramanian", city: "Chennai", avatar: "AS", course: "Algebra Fundamentals", progress: 65, quizAvg: 80, streak: 12, xp: 3420, lastActive: "Today" },
  { id: 4, name: "Ananya Krishnamurthy", city: "Trichy", avatar: "AK", course: "Python Basics", progress: 40, quizAvg: 72, streak: 5, xp: 1890, lastActive: "Yesterday" },
  { id: 5, name: "Vikram Natarajan", city: "Salem", avatar: "VN", course: "Algebra Fundamentals", progress: 90, quizAvg: 92, streak: 22, xp: 5600, lastActive: "Today" },
  { id: 6, name: "Deepa Sundaram", city: "Tirunelveli", avatar: "DS", course: "Cell Biology", progress: 20, quizAvg: 55, streak: 3, xp: 780, lastActive: "3 days ago" },
  { id: 7, name: "Suresh Pandian", city: "Erode", avatar: "SP", course: "Light & Optics", progress: 75, quizAvg: 85, streak: 18, xp: 4100, lastActive: "Today" },
];

// Admin overview data
export const ADMIN_STATS = {
  totalUsers: 1284,
  totalStudents: 1150,
  totalTeachers: 124,
  totalAdmins: 10,
  totalCourses: 48,
  totalEnrollments: 6820,
  courseCompletionRate: 68,
  avgQuizScore: 74,
  activeThisMonth: 892,
  newThisMonth: 143,
};

export const ADMIN_MONTHLY_DATA = [
  { month: "Sep", users: 850, enrollments: 4200 },
  { month: "Oct", users: 960, enrollments: 4800 },
  { month: "Nov", users: 1050, enrollments: 5300 },
  { month: "Dec", users: 1100, enrollments: 5600 },
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
