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
  { id: 1, title: "Java Programming Mastery", description: "Core Java, OOP, Collections, and Multithreading.", subject: "Programming", difficulty: "EASY", instructor: "Divya Narayanan", instructorId: 2, duration: "15 hours", lessons: 5, enrolled: 520, rating: 4.8, image: "/images/java.jpg", tags: ["Java","OOP"], status: "IN_PROGRESS", progress: 60 },
  { id: 2, title: "Advanced Data Structures", description: "Stacks, Queues, Trees, Graphs, and Complexity Analysis.", subject: "DSA", difficulty: "HARD", instructor: "Divya Narayanan", instructorId: 2, duration: "18 hours", lessons: 5, enrolled: 430, rating: 4.9, image: "/images/dsa.jpg", tags: ["DSA","Algorithms"], status: "NOT_STARTED", progress: 0 },
  { id: 3, title: "Full Stack Web Development", description: "HTML, CSS, JS, React, Node & MongoDB.", subject: "Web Development", difficulty: "MEDIUM", instructor: "Meena Balaji", instructorId: 8, duration: "25 hours", lessons: 5, enrolled: 780, rating: 4.9, image: "/images/fullstack.jpg", tags: ["React","Node"], status: "IN_PROGRESS", progress: 40 },
  { id: 4, title: "SQL & Database Optimization", description: "Joins, Indexing, Transactions, Query Optimization.", subject: "Database", difficulty: "MEDIUM", instructor: "Meena Balaji", instructorId: 8, duration: "12 hours", lessons: 5, enrolled: 510, rating: 4.7, image: "/images/sql.jpg", tags: ["SQL","PostgreSQL"], status: "NOT_STARTED", progress: 0 },
  { id: 5, title: "Machine Learning Foundations", description: "Regression, Classification, Model Evaluation.", subject: "AI", difficulty: "HARD", instructor: "Divya Narayanan", instructorId: 2, duration: "20 hours", lessons: 5, enrolled: 390, rating: 4.8, image: "/images/ml.jpg", tags: ["ML","Python"], status: "NOT_STARTED", progress: 0 },
  { id: 6, title: "Cloud Computing with AWS", description: "EC2, S3, IAM, Deployment & Scaling.", subject: "Cloud", difficulty: "MEDIUM", instructor: "Meena Balaji", instructorId: 8, duration: "16 hours", lessons: 5, enrolled: 460, rating: 4.7, image: "/images/aws.jpg", tags: ["AWS","Cloud"], status: "NOT_STARTED", progress: 0 },
  { id: 7, title: "Cybersecurity Essentials", description: "Network Security, Encryption, Ethical Hacking Basics.", subject: "Security", difficulty: "MEDIUM", instructor: "Divya Narayanan", instructorId: 2, duration: "14 hours", lessons: 5, enrolled: 340, rating: 4.6, image: "/images/security.jpg", tags: ["Cybersecurity"], status: "NOT_STARTED", progress: 0 },
  { id: 8, title: "DevOps & CI/CD Pipeline", description: "Docker, Kubernetes, GitHub Actions.", subject: "DevOps", difficulty: "HARD", instructor: "Meena Balaji", instructorId: 8, duration: "22 hours", lessons: 5, enrolled: 310, rating: 4.8, image: "/images/devops.jpg", tags: ["Docker","CI/CD"], status: "NOT_STARTED", progress: 0 },
  { id: 9, title: "Python for Data Science", description: "NumPy, Pandas, Matplotlib, Data Analysis.", subject: "Data Science", difficulty: "MEDIUM", instructor: "Divya Narayanan", instructorId: 2, duration: "18 hours", lessons: 5, enrolled: 600, rating: 4.9, image: "/images/datascience.jpg", tags: ["Python","Pandas"], status: "IN_PROGRESS", progress: 55 },
  { id: 10, title: "System Design & Architecture", description: "Scalability, Microservices, Distributed Systems.", subject: "Architecture", difficulty: "HARD", instructor: "Meena Balaji", instructorId: 8, duration: "20 hours", lessons: 5, enrolled: 280, rating: 4.8, image: "/images/systemdesign.jpg", tags: ["Microservices"], status: "NOT_STARTED", progress: 0 }
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

export const DEMO_LESSONS: DemoLesson[] = [];

let lessonId = 1;

DEMO_COURSES.forEach(course => {
  for (let i = 1; i <= 5; i++) {
    DEMO_LESSONS.push({
      id: lessonId++,
      courseId: course.id,
      title: `${course.title} - Module ${i}`,
      duration: `${15 + i * 5} min`,
      type: i % 3 === 0 ? "INTERACTIVE" : i % 2 === 0 ? "TEXT" : "VIDEO",
      completed: false,
      xpReward: 50 + i * 10,
    });
  }
});

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

export const DEMO_QUIZZES: DemoQuiz[] = [];

let quizId = 1;

DEMO_COURSES.forEach(course => {
  for (let i = 1; i <= 3; i++) {
    DEMO_QUIZZES.push({
      id: quizId++,
      courseId: course.id,
      title: `${course.title} - Quiz ${i}`,
      difficulty: i === 3 ? "HARD" : i === 2 ? "MEDIUM" : "EASY",
      timeLimit: 600,
      xpReward: 150,
      attempted: false,
      questions: [
        {
          id: 1,
          text: `What is a key concept in ${course.title}?`,
          options: ["Concept A","Concept B","Concept C","Concept D"],
          correctIndex: 1,
          explanation: "Correct answer explanation.",
        }
      ]
    });
  }
});

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

export const DEMO_ASSIGNMENTS: DemoAssignment[] = DEMO_COURSES.map(course => ({
  id: course.id,
  courseId: course.id,
  title: `${course.title} - Final Project`,
  description: `Complete a hands-on project for ${course.title}.`,
  dueDate: "2025-04-10",
  status: "PENDING",
  maxScore: 100,
  xpReward: 500,
}));

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
  { id:1, title:"First Login", description:"Login to platform", icon:"Star", earned:true, xpBonus:50 },
  { id:2, title:"Java Expert", description:"Complete Java course", icon:"Award", earned:false, xpBonus:300 },
  { id:3, title:"DSA Master", description:"Complete DSA course", icon:"Trophy", earned:false, xpBonus:400 },
  { id:4, title:"Cloud Certified", description:"Finish AWS training", icon:"Cloud", earned:false, xpBonus:350 },
  { id:5, title:"ML Specialist", description:"Complete ML course", icon:"Brain", earned:false, xpBonus:500 },
  { id:6, title:"7-Day Streak", description:"Login 7 days", icon:"Flame", earned:true, xpBonus:100 },
  { id:7, title:"30-Day Streak", description:"Login 30 days", icon:"Flame", earned:false, xpBonus:500 },
  { id:8, title:"Quiz Champion", description:"Score 90%+ in 5 quizzes", icon:"Medal", earned:false, xpBonus:200 },
  { id:9, title:"Top Performer", description:"Rank Top 5", icon:"Crown", earned:false, xpBonus:600 },
  { id:10, title:"Full Stack Hero", description:"Complete Full Stack Course", icon:"Zap", earned:false, xpBonus:400 }
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
  { id:1, name:"Arjun Kumar", city:"Chennai", avatar:"AK", course:"Java Programming", progress:70, quizAvg:85, streak:15, xp:4200, lastActive:"Today" },
  { id:2, name:"Vikram Raj", city:"Coimbatore", avatar:"VR", course:"Full Stack", progress:55, quizAvg:78, streak:10, xp:3500, lastActive:"Yesterday" },
  { id:3, name:"Deepa S", city:"Salem", avatar:"DS", course:"SQL", progress:90, quizAvg:92, streak:22, xp:6000, lastActive:"Today" },
  { id:4, name:"Kavin M", city:"Madurai", avatar:"KM", course:"Machine Learning", progress:40, quizAvg:68, streak:5, xp:2100, lastActive:"2 days ago" },
  { id:5, name:"Nithya R", city:"Trichy", avatar:"NR", course:"Cloud Computing", progress:80, quizAvg:88, streak:18, xp:4800, lastActive:"Today" },
  { id:6, name:"Prakash T", city:"Erode", avatar:"PT", course:"DevOps", progress:60, quizAvg:75, streak:12, xp:3700, lastActive:"Yesterday" },
  { id:7, name:"Rahul K", city:"Chennai", avatar:"RK", course:"Cybersecurity", progress:30, quizAvg:65, streak:4, xp:1500, lastActive:"3 days ago" },
  { id:8, name:"Anu L", city:"Vellore", avatar:"AL", course:"Python Data Science", progress:75, quizAvg:89, streak:20, xp:5200, lastActive:"Today" },
  { id:9, name:"Surya P", city:"Tirunelveli", avatar:"SP", course:"System Design", progress:50, quizAvg:80, streak:8, xp:3000, lastActive:"Yesterday" },
  { id:10, name:"Harini M", city:"Salem", avatar:"HM", course:"Advanced DSA", progress:65, quizAvg:84, streak:14, xp:4100, lastActive:"Today" },
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
  { month:"May", users:600, enrollments:2500 },
  { month:"Jun", users:750, enrollments:3100 },
  { month:"Jul", users:900, enrollments:3800 },
  { month:"Aug", users:1050, enrollments:4500 },
  { month:"Sep", users:1200, enrollments:5200 },
  { month:"Oct", users:1400, enrollments:6000 },
  { month:"Nov", users:1650, enrollments:7200 },
  { month:"Dec", users:1900, enrollments:8500 },
  { month:"Jan", users:2200, enrollments:9800 },
  { month:"Feb", users:2500, enrollments:11200 },
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
