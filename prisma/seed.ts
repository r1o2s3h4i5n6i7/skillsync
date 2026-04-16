import { PrismaClient, Prisma, Difficulty, LessonType, Role, CourseStatus, AssignmentStatus, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const daysFromNow = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const monthsAgo = (n: number) => { const d = new Date(); d.setMonth(d.getMonth() - n); return d; };

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// ═══════════════════════════════════════════════════════════════
// COURSE CONTENT DATA
// ═══════════════════════════════════════════════════════════════

interface CourseBlueprint {
  title: string;
  description: string;
  subject: string;
  difficulty: Difficulty;
  duration: string;
  image: string;
  rating: number;
  tags: string[];
  instructorIdx: number; // 0=teacher1, 1=teacher2
  lessons: { title: string; duration: string; xpReward: number }[];
  quizTopics: { title: string; difficulty: Difficulty; questions: { text: string; options: string[]; correctIndex: number; explanation: string }[] }[];
  assignments: { title: string; description: string; maxScore: number }[];
}

const COURSES: CourseBlueprint[] = [
  // ──── 1. Java Programming Masterclass ────
  {
    title: "Java Programming Masterclass",
    description: "Master Java from fundamentals to advanced OOP concepts. Cover collections, multithreading, exception handling, and build real-world applications with industry best practices.",
    subject: "Programming", difficulty: "EASY", duration: "15 hours", image: "/images/java.png", rating: 4.8,
    tags: ["Java", "OOP", "Backend"],
    instructorIdx: 0,
    lessons: [
      { title: "Introduction to Java & JDK Setup", duration: "12m", xpReward: 50 },
      { title: "Variables, Data Types & Operators", duration: "18m", xpReward: 50 },
      { title: "Control Flow: If-Else, Switch, Loops", duration: "22m", xpReward: 75 },
      { title: "Methods & Scope", duration: "15m", xpReward: 50 },
      { title: "Classes, Objects & Constructors", duration: "25m", xpReward: 75 },
      { title: "Inheritance & Polymorphism", duration: "28m", xpReward: 100 },
      { title: "Interfaces & Abstract Classes", duration: "20m", xpReward: 75 },
      { title: "Exception Handling & Custom Exceptions", duration: "18m", xpReward: 75 },
      { title: "Collections Framework Deep Dive", duration: "30m", xpReward: 100 },
      { title: "Multithreading & Concurrency Basics", duration: "35m", xpReward: 100 },
    ],
    quizTopics: [
      { title: "Java Basics Quiz", difficulty: "EASY", questions: [
        { text: "Which keyword is used to define a class in Java?", options: ["class", "struct", "define", "object"], correctIndex: 0, explanation: "The 'class' keyword is used to declare a class in Java." },
        { text: "What is the default value of an int variable in Java?", options: ["null", "0", "1", "undefined"], correctIndex: 1, explanation: "Primitive int variables default to 0 in Java." },
        { text: "Which of these is NOT a Java primitive type?", options: ["int", "boolean", "String", "char"], correctIndex: 2, explanation: "String is a reference type (class), not a primitive." },
        { text: "What does JVM stand for?", options: ["Java Virtual Machine", "Java Variable Manager", "Java Version Module", "Just Virtual Memory"], correctIndex: 0, explanation: "JVM stands for Java Virtual Machine which executes bytecode." },
      ]},
      { title: "OOP Concepts Quiz", difficulty: "MEDIUM", questions: [
        { text: "Which OOP principle allows a child class to inherit from a parent?", options: ["Encapsulation", "Inheritance", "Abstraction", "Composition"], correctIndex: 1, explanation: "Inheritance lets a subclass inherit fields/methods from a superclass." },
        { text: "What is method overloading?", options: ["Redefining a method in a child class", "Multiple methods with same name but different parameters", "Making a method static", "Using abstract methods"], correctIndex: 1, explanation: "Method overloading means defining multiple methods with the same name but different parameter lists." },
        { text: "Which keyword prevents a class from being inherited?", options: ["static", "abstract", "final", "private"], correctIndex: 2, explanation: "The 'final' keyword on a class prevents subclassing." },
        { text: "What is encapsulation?", options: ["Hiding implementation details", "Code reuse", "Multiple inheritance", "Type casting"], correctIndex: 0, explanation: "Encapsulation is bundling data and methods while hiding internal state." },
      ]},
      { title: "Collections & Threads Quiz", difficulty: "HARD", questions: [
        { text: "Which collection does not allow duplicate elements?", options: ["ArrayList", "LinkedList", "HashSet", "Vector"], correctIndex: 2, explanation: "HashSet implements the Set interface which does not allow duplicates." },
        { text: "What interface must a class implement to be used in a Thread?", options: ["Serializable", "Runnable", "Comparable", "Iterable"], correctIndex: 1, explanation: "A class must implement Runnable or extend Thread to execute in a thread." },
        { text: "Which is thread-safe?", options: ["HashMap", "ArrayList", "ConcurrentHashMap", "LinkedList"], correctIndex: 2, explanation: "ConcurrentHashMap is designed for thread-safe concurrent access." },
        { text: "What does synchronized keyword do?", options: ["Makes code faster", "Ensures only one thread accesses a block at a time", "Creates a new thread", "Stops all threads"], correctIndex: 1, explanation: "Synchronized ensures mutual exclusion for thread safety." },
      ]},
    ],
    assignments: [
      { title: "Build a Calculator Application", description: "Create a command-line calculator that supports +, -, *, / operations with proper error handling for division by zero.", maxScore: 10 },
      { title: "Student Grade Management System", description: "Implement a student management system using OOP principles: classes for Student, Course, GradeBook with proper encapsulation.", maxScore: 15 },
      { title: "Custom LinkedList Implementation", description: "Build your own LinkedList class with add, remove, search, and reverse operations. Include JUnit test cases.", maxScore: 20 },
      { title: "Multithreaded File Processor", description: "Create a multi-threaded application that reads multiple text files concurrently and produces a word frequency count.", maxScore: 25 },
      { title: "Library Management System with Collections", description: "Design a full library system using HashMap, ArrayList, and Comparable interfaces for sorting books.", maxScore: 20 },
    ],
  },

  // ──── 2. Python for Beginners ────
  {
    title: "Python for Beginners",
    description: "Learn Python programming from scratch. Cover syntax, data structures, functions, file I/O, and basic scripting to automate everyday tasks.",
    subject: "Programming", difficulty: "EASY", duration: "12 hours", image: "/images/datascience.png", rating: 4.9,
    tags: ["Python", "Scripting", "Beginner"],
    instructorIdx: 1,
    lessons: [
      { title: "Installing Python & First Script", duration: "10m", xpReward: 50 },
      { title: "Variables, Numbers & Strings", duration: "15m", xpReward: 50 },
      { title: "Lists, Tuples & Dictionaries", duration: "20m", xpReward: 75 },
      { title: "Conditionals & Loops", duration: "18m", xpReward: 50 },
      { title: "Functions & Lambda Expressions", duration: "22m", xpReward: 75 },
      { title: "File I/O & Error Handling", duration: "20m", xpReward: 75 },
      { title: "Modules & Packages", duration: "15m", xpReward: 50 },
    ],
    quizTopics: [
      { title: "Python Basics Quiz", difficulty: "EASY", questions: [
        { text: "Which function prints output in Python?", options: ["echo()", "print()", "console.log()", "write()"], correctIndex: 1, explanation: "print() is Python's built-in function for output." },
        { text: "How do you create a list in Python?", options: ["(1,2,3)", "[1,2,3]", "{1,2,3}", "<1,2,3>"], correctIndex: 1, explanation: "Square brackets [] create a list in Python." },
        { text: "Which keyword defines a function?", options: ["function", "func", "def", "fn"], correctIndex: 2, explanation: "The 'def' keyword is used to define functions in Python." },
        { text: "What is the output of len('Hello')?", options: ["4", "5", "6", "Error"], correctIndex: 1, explanation: "'Hello' has 5 characters, so len() returns 5." },
      ]},
      { title: "Data Structures Quiz", difficulty: "MEDIUM", questions: [
        { text: "Which data structure is immutable?", options: ["List", "Dictionary", "Tuple", "Set"], correctIndex: 2, explanation: "Tuples are immutable — once created, elements cannot be changed." },
        { text: "How do you access a dictionary value?", options: ["dict[key]", "dict.key", "dict(key)", "dict->key"], correctIndex: 0, explanation: "Dictionary values are accessed using bracket notation: dict[key]." },
        { text: "What does dict.get('key', 'default') return if key is missing?", options: ["None", "Error", "'default'", "0"], correctIndex: 2, explanation: ".get() returns the default value if the key is not found." },
        { text: "Which removes the last item from a list?", options: ["list.delete()", "list.pop()", "list.remove()", "list.drop()"], correctIndex: 1, explanation: "list.pop() removes and returns the last element." },
      ]},
    ],
    assignments: [
      { title: "Number Guessing Game", description: "Create an interactive number guessing game where the computer picks a random number and the user has to guess it with hints.", maxScore: 10 },
      { title: "Contact Book Application", description: "Build a phone contact book using dictionaries. Support add, search, update, and delete operations. Save data to a JSON file.", maxScore: 15 },
      { title: "Text File Analyzer", description: "Write a script that reads a text file and reports word count, line count, most frequent words, and average word length.", maxScore: 15 },
      { title: "Simple Budget Tracker", description: "Create a budget tracking app that lets users add income/expense entries, categorize them, and show a summary.", maxScore: 20 },
      { title: "Web Scraper Script", description: "Build a simple web scraper using requests and BeautifulSoup to extract headlines from a news website.", maxScore: 20 },
    ],
  },

  // ──── 3. Full Stack Web Development ────
  {
    title: "Full Stack Web Development",
    description: "Build modern web applications from front to back. Master HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB to create production-ready full-stack applications.",
    subject: "Web Development", difficulty: "MEDIUM", duration: "25 hours", image: "/images/fullstack.png", rating: 4.9,
    tags: ["React", "Node.js", "MongoDB", "Express"],
    instructorIdx: 0,
    lessons: [
      { title: "HTML5 Semantic Elements & Accessibility", duration: "15m", xpReward: 50 },
      { title: "CSS Flexbox & Grid Mastery", duration: "20m", xpReward: 75 },
      { title: "JavaScript ES6+ Features", duration: "25m", xpReward: 75 },
      { title: "React Components & JSX", duration: "22m", xpReward: 75 },
      { title: "React Hooks: useState, useEffect, useContext", duration: "28m", xpReward: 100 },
      { title: "State Management with Context API", duration: "20m", xpReward: 75 },
      { title: "Node.js & Express REST APIs", duration: "30m", xpReward: 100 },
      { title: "MongoDB & Mongoose ODM", duration: "25m", xpReward: 75 },
      { title: "Authentication with JWT", duration: "25m", xpReward: 100 },
      { title: "Deployment to Vercel & Railway", duration: "18m", xpReward: 75 },
    ],
    quizTopics: [
      { title: "Frontend Fundamentals", difficulty: "EASY", questions: [
        { text: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correctIndex: 0, explanation: "HTML = Hyper Text Markup Language, the standard markup for web pages." },
        { text: "Which CSS property creates flexible layouts?", options: ["float", "display: flex", "position: relative", "margin: auto"], correctIndex: 1, explanation: "display: flex enables the Flexbox layout model." },
        { text: "What does 'const' do in JavaScript?", options: ["Creates a variable that can change", "Creates a constant that cannot be reassigned", "Creates a function", "Imports a module"], correctIndex: 1, explanation: "const declares a variable whose reference cannot be reassigned." },
        { text: "Which hook manages state in React?", options: ["useEffect", "useState", "useRef", "useMemo"], correctIndex: 1, explanation: "useState is the React hook for managing component state." },
      ]},
      { title: "Backend Development Quiz", difficulty: "MEDIUM", questions: [
        { text: "What status code means 'Created'?", options: ["200", "201", "204", "301"], correctIndex: 1, explanation: "HTTP 201 means a new resource was successfully created." },
        { text: "Which method retrieves data in REST?", options: ["POST", "PUT", "GET", "DELETE"], correctIndex: 2, explanation: "GET is the HTTP method used to retrieve/read resources." },
        { text: "What does middleware do in Express?", options: ["Renders HTML", "Processes requests before route handlers", "Connects to database", "Sends emails"], correctIndex: 1, explanation: "Middleware functions execute during the request-response cycle." },
        { text: "Which MongoDB method finds one document?", options: ["find()", "findOne()", "get()", "select()"], correctIndex: 1, explanation: "findOne() returns the first document matching the query." },
      ]},
    ],
    assignments: [
      { title: "Personal Portfolio Website", description: "Build a responsive portfolio with HTML, CSS, and JavaScript. Include sections: About, Skills, Projects, Contact.", maxScore: 15 },
      { title: "React Todo Application", description: "Create a full-featured todo app with add, edit, delete, filter by status, and local storage persistence.", maxScore: 20 },
      { title: "REST API with Express & MongoDB", description: "Build a CRUD API for a blog platform. Implement routes for posts, comments, and user authentication.", maxScore: 25 },
      { title: "Full Stack E-Commerce Store", description: "Build a mini e-commerce app: product listing, cart, checkout flow with React frontend and Node.js backend.", maxScore: 30 },
      { title: "Real-Time Chat Application", description: "Create a real-time chat app using Socket.io, React, and Express with multiple chat rooms.", maxScore: 25 },
    ],
  },

  // ──── 4. React.js Bootcamp ────
  {
    title: "React.js Bootcamp",
    description: "Deep dive into React.js ecosystem. Master hooks, context, routing, performance optimization, and modern patterns used in production applications.",
    subject: "Web Development", difficulty: "MEDIUM", duration: "18 hours", image: "/images/fullstack.png", rating: 4.7,
    tags: ["React", "JavaScript", "Frontend"],
    instructorIdx: 1,
    lessons: [
      { title: "React Fundamentals & Virtual DOM", duration: "15m", xpReward: 50 },
      { title: "JSX Deep Dive & Expressions", duration: "12m", xpReward: 50 },
      { title: "Component Lifecycle & Hooks", duration: "25m", xpReward: 75 },
      { title: "Custom Hooks & Reusable Logic", duration: "20m", xpReward: 75 },
      { title: "React Router v6 Navigation", duration: "18m", xpReward: 75 },
      { title: "Form Handling & Validation", duration: "22m", xpReward: 75 },
      { title: "Performance: memo, useMemo, useCallback", duration: "20m", xpReward: 100 },
      { title: "Testing with React Testing Library", duration: "25m", xpReward: 100 },
    ],
    quizTopics: [
      { title: "React Core Concepts", difficulty: "MEDIUM", questions: [
        { text: "What is the Virtual DOM?", options: ["A real DOM element", "A lightweight copy of the actual DOM", "A CSS framework", "A database"], correctIndex: 1, explanation: "The Virtual DOM is an in-memory representation that React uses for efficient updates." },
        { text: "Which hook replaces componentDidMount?", options: ["useState", "useEffect", "useRef", "useReducer"], correctIndex: 1, explanation: "useEffect with an empty dependency array mimics componentDidMount." },
        { text: "What is props drilling?", options: ["A testing technique", "Passing props through many nested components", "A performance optimization", "A routing pattern"], correctIndex: 1, explanation: "Props drilling is passing data through multiple component layers unnecessarily." },
        { text: "How do you prevent unnecessary re-renders?", options: ["Use more state", "React.memo and useMemo", "Add more components", "Use class components"], correctIndex: 1, explanation: "React.memo and useMemo help skip re-renders when inputs haven't changed." },
      ]},
    ],
    assignments: [
      { title: "Component Library", description: "Build a reusable component library with Button, Modal, Card, Input, and Toast components.", maxScore: 20 },
      { title: "Weather Dashboard", description: "Create a weather app using React that fetches data from OpenWeatherMap API with search and favorites.", maxScore: 15 },
      { title: "Movie Search App", description: "Build a movie search application using OMDB API with pagination, filters, and favourites list.", maxScore: 20 },
      { title: "Kanban Board", description: "Implement a drag-and-drop Kanban board with columns: Todo, In Progress, Done. Use React DnD.", maxScore: 25 },
      { title: "Blog with Markdown Editor", description: "Create a blog platform with a markdown editor, preview mode, and tag-based filtering.", maxScore: 20 },
    ],
  },

  // ──── 5. Node.js API Engineering ────
  {
    title: "Node.js API Engineering",
    description: "Build robust, scalable APIs with Node.js and Express. Cover middleware, authentication, databases, testing, and deployment strategies.",
    subject: "Web Development", difficulty: "MEDIUM", duration: "16 hours", image: "/images/fullstack.png", rating: 4.8,
    tags: ["Node.js", "Express", "API", "Backend"],
    instructorIdx: 0,
    lessons: [
      { title: "Node.js Runtime & Event Loop", duration: "15m", xpReward: 50 },
      { title: "Express.js Setup & Routing", duration: "18m", xpReward: 75 },
      { title: "Middleware Patterns", duration: "20m", xpReward: 75 },
      { title: "Database Integration (SQL & NoSQL)", duration: "25m", xpReward: 75 },
      { title: "Authentication & Authorization", duration: "28m", xpReward: 100 },
      { title: "Error Handling & Logging", duration: "15m", xpReward: 50 },
      { title: "API Testing with Jest & Supertest", duration: "22m", xpReward: 75 },
      { title: "Rate Limiting & Security Best Practices", duration: "18m", xpReward: 75 },
    ],
    quizTopics: [
      { title: "Node.js Fundamentals", difficulty: "MEDIUM", questions: [
        { text: "What is the event loop in Node.js?", options: ["A UI rendering engine", "A mechanism that handles async operations", "A database connector", "A package manager"], correctIndex: 1, explanation: "The event loop processes async callbacks and I/O operations." },
        { text: "Which module handles file operations?", options: ["http", "fs", "path", "os"], correctIndex: 1, explanation: "The 'fs' (file system) module provides file I/O operations." },
        { text: "What does next() do in Express middleware?", options: ["Stops execution", "Passes control to the next middleware", "Returns a response", "Creates a new route"], correctIndex: 1, explanation: "next() passes control to the next middleware function in the stack." },
        { text: "Which HTTP method is idempotent?", options: ["POST", "GET", "PATCH", "None"], correctIndex: 1, explanation: "GET is idempotent — multiple identical requests produce the same result." },
      ]},
    ],
    assignments: [
      { title: "RESTful Blog API", description: "Build a complete blog API with CRUD operations, pagination, and search functionality.", maxScore: 15 },
      { title: "Authentication System", description: "Implement JWT-based auth with registration, login, password reset, and role-based access.", maxScore: 20 },
      { title: "File Upload Service", description: "Create a file upload microservice supporting images, documents with validation and cloud storage.", maxScore: 20 },
      { title: "Rate-Limited API Gateway", description: "Build an API gateway with rate limiting, request logging, and circuit breaker pattern.", maxScore: 25 },
      { title: "WebSocket Chat Server", description: "Implement a real-time chat server using Socket.io with rooms, private messages, and online status.", maxScore: 25 },
    ],
  },

  // ──── 6. SQL Database Fundamentals ────
  {
    title: "SQL Database Fundamentals",
    description: "Master relational databases with SQL. Learn schema design, complex queries, joins, indexing, transactions, and query optimization techniques.",
    subject: "Database", difficulty: "MEDIUM", duration: "14 hours", image: "/images/sql.png", rating: 4.7,
    tags: ["SQL", "MySQL", "PostgreSQL", "Database"],
    instructorIdx: 1,
    lessons: [
      { title: "Introduction to Relational Databases", duration: "12m", xpReward: 50 },
      { title: "CREATE, INSERT, SELECT Basics", duration: "18m", xpReward: 50 },
      { title: "WHERE Clauses & Filtering", duration: "15m", xpReward: 50 },
      { title: "JOINs: INNER, LEFT, RIGHT, FULL", duration: "25m", xpReward: 100 },
      { title: "GROUP BY, HAVING & Aggregations", duration: "20m", xpReward: 75 },
      { title: "Subqueries & CTEs", duration: "22m", xpReward: 75 },
      { title: "Indexing & Query Optimization", duration: "25m", xpReward: 100 },
      { title: "Transactions & ACID Properties", duration: "18m", xpReward: 75 },
    ],
    quizTopics: [
      { title: "SQL Basics Quiz", difficulty: "EASY", questions: [
        { text: "Which SQL command retrieves data?", options: ["INSERT", "UPDATE", "SELECT", "DELETE"], correctIndex: 2, explanation: "SELECT is used to query and retrieve data from tables." },
        { text: "What does DISTINCT do?", options: ["Sorts results", "Removes duplicate rows", "Limits results", "Groups data"], correctIndex: 1, explanation: "DISTINCT eliminates duplicate rows from the result set." },
        { text: "Which clause filters rows?", options: ["ORDER BY", "GROUP BY", "WHERE", "HAVING"], correctIndex: 2, explanation: "WHERE filters rows before grouping, based on conditions." },
        { text: "What is a PRIMARY KEY?", options: ["Any column", "A unique identifier for each row", "A foreign reference", "An index"], correctIndex: 1, explanation: "A PRIMARY KEY uniquely identifies each record in a table." },
      ]},
      { title: "Advanced SQL Quiz", difficulty: "HARD", questions: [
        { text: "What is a CTE?", options: ["Common Table Expression", "Conditional Type Extension", "Column Type Enum", "Cache Table Entity"], correctIndex: 0, explanation: "CTE (Common Table Expression) defines a temporary named result set." },
        { text: "Which join returns all rows from both tables?", options: ["INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN", "CROSS JOIN"], correctIndex: 2, explanation: "FULL OUTER JOIN returns all rows from both tables with NULLs for non-matches." },
        { text: "What does EXPLAIN do?", options: ["Deletes data", "Shows query execution plan", "Creates a view", "Exports data"], correctIndex: 1, explanation: "EXPLAIN shows how the database engine will execute a query." },
        { text: "What is normalization?", options: ["Adding indexes", "Organizing data to reduce redundancy", "Caching queries", "Creating backups"], correctIndex: 1, explanation: "Normalization structures data to minimize duplication and dependency." },
      ]},
    ],
    assignments: [
      { title: "E-Commerce Database Schema", description: "Design a normalized database schema for an e-commerce platform with users, products, orders, and reviews.", maxScore: 15 },
      { title: "Complex Query Challenge", description: "Write 10 advanced SQL queries involving multiple joins, subqueries, window functions, and CTEs.", maxScore: 20 },
      { title: "Database Migration Script", description: "Create migration scripts to evolve a schema: add columns, create indexes, modify constraints.", maxScore: 15 },
      { title: "Query Performance Report", description: "Analyze slow queries using EXPLAIN, propose indexes, and measure before/after performance.", maxScore: 20 },
      { title: "Transaction Safety Implementation", description: "Implement bank transfer logic ensuring ACID compliance with proper rollback handling.", maxScore: 20 },
    ],
  },

  // ──── 7. Data Structures in Java ────
  {
    title: "Data Structures & Algorithms",
    description: "Master essential data structures and algorithms. Learn arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming with Java implementations.",
    subject: "Programming", difficulty: "HARD", duration: "20 hours", image: "/images/dsa.png", rating: 4.9,
    tags: ["DSA", "Algorithms", "Java", "Problem Solving"],
    instructorIdx: 0,
    lessons: [
      { title: "Big O Notation & Complexity Analysis", duration: "15m", xpReward: 50 },
      { title: "Arrays & Two Pointer Technique", duration: "20m", xpReward: 75 },
      { title: "Linked Lists: Singly & Doubly", duration: "25m", xpReward: 75 },
      { title: "Stacks & Queues Implementation", duration: "18m", xpReward: 75 },
      { title: "Hash Maps & Hash Sets", duration: "22m", xpReward: 75 },
      { title: "Binary Trees & BST", duration: "30m", xpReward: 100 },
      { title: "Graph Algorithms: BFS & DFS", duration: "35m", xpReward: 100 },
      { title: "Sorting: Quick, Merge, Heap", duration: "28m", xpReward: 100 },
      { title: "Dynamic Programming Patterns", duration: "40m", xpReward: 100 },
    ],
    quizTopics: [
      { title: "Complexity Analysis Quiz", difficulty: "MEDIUM", questions: [
        { text: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correctIndex: 1, explanation: "Binary search halves the search space each time, giving O(log n)." },
        { text: "What is the space complexity of a recursive Fibonacci?", options: ["O(1)", "O(n)", "O(2^n)", "O(log n)"], correctIndex: 1, explanation: "The recursive call stack grows linearly with n, giving O(n) space." },
        { text: "Which sorting algorithm is O(n log n) in worst case?", options: ["Quick Sort", "Bubble Sort", "Merge Sort", "Selection Sort"], correctIndex: 2, explanation: "Merge Sort always divides in half and merges in O(n), giving O(n log n)." },
        { text: "What is amortized time complexity?", options: ["Best case only", "Average over a sequence of operations", "Worst case only", "Space complexity"], correctIndex: 1, explanation: "Amortized analysis averages the cost over all operations in a sequence." },
      ]},
    ],
    assignments: [
      { title: "Array Manipulation Problems", description: "Solve 5 array problems: two sum, maximum subarray, rotate array, merge intervals, product except self.", maxScore: 20 },
      { title: "Linked List Operations", description: "Implement: reverse a linked list, detect cycle, merge two sorted lists, remove duplicates.", maxScore: 20 },
      { title: "Binary Tree Traversals", description: "Implement inorder, preorder, postorder traversals. Solve: max depth, level order, validate BST.", maxScore: 25 },
      { title: "Graph Problems Set", description: "Implement BFS/DFS, find shortest path, detect cycles, and solve the number of islands problem.", maxScore: 25 },
      { title: "Dynamic Programming Challenge", description: "Solve: climbing stairs, coin change, longest common subsequence, knapsack problem.", maxScore: 30 },
    ],
  },

  // ──── 8. Cybersecurity Basics ────
  {
    title: "Cybersecurity Essentials",
    description: "Understand the fundamentals of cybersecurity. Learn about network security, cryptography, ethical hacking, vulnerability assessment, and security best practices.",
    subject: "Security", difficulty: "MEDIUM", duration: "14 hours", image: "/images/security.png", rating: 4.6,
    tags: ["Cybersecurity", "Ethical Hacking", "Network Security"],
    instructorIdx: 1,
    lessons: [
      { title: "Introduction to Cybersecurity", duration: "12m", xpReward: 50 },
      { title: "Network Security Fundamentals", duration: "18m", xpReward: 75 },
      { title: "Cryptography: Symmetric & Asymmetric", duration: "22m", xpReward: 75 },
      { title: "Web Application Security (OWASP Top 10)", duration: "25m", xpReward: 100 },
      { title: "SQL Injection & XSS Prevention", duration: "20m", xpReward: 75 },
      { title: "Penetration Testing Basics", duration: "28m", xpReward: 100 },
      { title: "Incident Response & Forensics", duration: "18m", xpReward: 75 },
    ],
    quizTopics: [
      { title: "Security Fundamentals Quiz", difficulty: "MEDIUM", questions: [
        { text: "What does CIA stand for in security?", options: ["Central Intelligence Agency", "Confidentiality, Integrity, Availability", "Code Inspection Analysis", "Certified Information Auditor"], correctIndex: 1, explanation: "CIA triad is the fundamental security model: Confidentiality, Integrity, Availability." },
        { text: "What is a phishing attack?", options: ["DDoS attack", "Fraudulent communication to steal data", "Malware installation", "Physical break-in"], correctIndex: 1, explanation: "Phishing uses deceptive messages to trick users into revealing sensitive information." },
        { text: "Which protocol encrypts web traffic?", options: ["HTTP", "FTP", "HTTPS/TLS", "SMTP"], correctIndex: 2, explanation: "HTTPS uses TLS to encrypt communication between browser and server." },
        { text: "What is SQL injection?", options: ["A database backup", "Inserting malicious SQL into queries", "A type of virus", "Network scanning"], correctIndex: 1, explanation: "SQL injection exploits vulnerabilities by injecting malicious SQL code." },
      ]},
    ],
    assignments: [
      { title: "Vulnerability Assessment Report", description: "Perform a vulnerability scan on a test web application and document all findings with severity ratings.", maxScore: 20 },
      { title: "Password Security Analysis", description: "Analyze password hashing algorithms (MD5, SHA-256, bcrypt) and demonstrate why bcrypt is preferred.", maxScore: 15 },
      { title: "OWASP Top 10 Case Study", description: "Research and present 3 real-world security breaches, mapping each to an OWASP Top 10 category.", maxScore: 20 },
      { title: "Secure Code Review", description: "Review a provided code sample and identify all security vulnerabilities. Suggest fixes.", maxScore: 20 },
      { title: "Incident Response Plan", description: "Draft a comprehensive incident response plan for a hypothetical data breach scenario.", maxScore: 25 },
    ],
  },

  // ──── 9. DevOps with Docker & Kubernetes ────
  {
    title: "DevOps with Docker & Kubernetes",
    description: "Master containerization and orchestration. Learn Docker, Kubernetes, CI/CD pipelines, infrastructure as code, and modern deployment strategies.",
    subject: "DevOps", difficulty: "HARD", duration: "22 hours", image: "/images/devops.png", rating: 4.8,
    tags: ["Docker", "Kubernetes", "CI/CD", "DevOps"],
    instructorIdx: 0,
    lessons: [
      { title: "Introduction to DevOps Culture", duration: "10m", xpReward: 50 },
      { title: "Docker Fundamentals & Dockerfile", duration: "20m", xpReward: 75 },
      { title: "Docker Compose & Multi-Container Apps", duration: "25m", xpReward: 75 },
      { title: "Docker Networking & Volumes", duration: "18m", xpReward: 75 },
      { title: "Kubernetes Architecture & Concepts", duration: "25m", xpReward: 100 },
      { title: "Pods, Deployments & Services", duration: "30m", xpReward: 100 },
      { title: "CI/CD with GitHub Actions", duration: "22m", xpReward: 75 },
      { title: "Monitoring with Prometheus & Grafana", duration: "20m", xpReward: 75 },
    ],
    quizTopics: [
      { title: "Docker & Kubernetes Quiz", difficulty: "HARD", questions: [
        { text: "What is a Docker container?", options: ["A virtual machine", "A lightweight isolated process", "A physical server", "An operating system"], correctIndex: 1, explanation: "A container is a standardized, lightweight package that runs in isolation." },
        { text: "What is a Kubernetes Pod?", options: ["A server", "The smallest deployable unit", "A container registry", "A network rule"], correctIndex: 1, explanation: "A Pod is the smallest deployable unit in Kubernetes, containing one or more containers." },
        { text: "What does CI/CD stand for?", options: ["Code Integration/Code Delivery", "Continuous Integration/Continuous Delivery", "Central Infrastructure/Central Deployment", "Cloud Instance/Cloud Database"], correctIndex: 1, explanation: "CI/CD = Continuous Integration and Continuous Delivery/Deployment." },
        { text: "Which command builds a Docker image?", options: ["docker run", "docker build", "docker pull", "docker push"], correctIndex: 1, explanation: "docker build creates an image from a Dockerfile." },
      ]},
    ],
    assignments: [
      { title: "Dockerize a Node.js Application", description: "Create a Dockerfile and docker-compose.yml for a Node.js app with MongoDB and Redis.", maxScore: 15 },
      { title: "Kubernetes Deployment", description: "Deploy a 3-tier application to Kubernetes with separate deployments for frontend, backend, and database.", maxScore: 25 },
      { title: "CI/CD Pipeline Setup", description: "Create a GitHub Actions workflow that builds, tests, and deploys an application automatically.", maxScore: 20 },
      { title: "Infrastructure as Code", description: "Write Terraform or Ansible scripts to provision cloud infrastructure for a web application.", maxScore: 25 },
      { title: "Monitoring Dashboard", description: "Set up Prometheus and Grafana to monitor a Kubernetes cluster with custom dashboards.", maxScore: 20 },
    ],
  },

  // ──── 10. Machine Learning Foundations ────
  {
    title: "Machine Learning Foundations",
    description: "Understand core ML concepts. Learn regression, classification, clustering, model evaluation, and build practical models using scikit-learn and Python.",
    subject: "AI", difficulty: "HARD", duration: "20 hours", image: "/images/ml.png", rating: 4.8,
    tags: ["Machine Learning", "Python", "scikit-learn", "AI"],
    instructorIdx: 1,
    lessons: [
      { title: "What is Machine Learning?", duration: "12m", xpReward: 50 },
      { title: "Supervised vs Unsupervised Learning", duration: "15m", xpReward: 50 },
      { title: "Linear Regression from Scratch", duration: "25m", xpReward: 100 },
      { title: "Logistic Regression & Classification", duration: "22m", xpReward: 75 },
      { title: "Decision Trees & Random Forests", duration: "25m", xpReward: 100 },
      { title: "K-Means Clustering", duration: "20m", xpReward: 75 },
      { title: "Model Evaluation Metrics", duration: "18m", xpReward: 75 },
      { title: "Feature Engineering & Selection", duration: "22m", xpReward: 75 },
      { title: "Neural Network Basics", duration: "30m", xpReward: 100 },
    ],
    quizTopics: [
      { title: "ML Concepts Quiz", difficulty: "HARD", questions: [
        { text: "What is overfitting?", options: ["Model is too simple", "Model memorizes training data", "Model is well-generalized", "Model runs slowly"], correctIndex: 1, explanation: "Overfitting means the model learns noise in training data and performs poorly on new data." },
        { text: "Which metric is best for imbalanced classification?", options: ["Accuracy", "F1 Score", "Mean Squared Error", "R-squared"], correctIndex: 1, explanation: "F1 Score balances precision and recall, making it better for imbalanced datasets." },
        { text: "What does k in k-NN represent?", options: ["Number of features", "Number of nearest neighbors to consider", "Number of clusters", "Learning rate"], correctIndex: 1, explanation: "k in k-NN is the number of nearest neighbors used for classification/regression." },
        { text: "What is cross-validation?", options: ["Testing on training data", "Splitting data into multiple folds for robust evaluation", "Using two datasets", "Removing outliers"], correctIndex: 1, explanation: "Cross-validation splits data into folds, training on some and testing on others." },
      ]},
    ],
    assignments: [
      { title: "House Price Prediction", description: "Build a linear regression model to predict house prices using the Boston Housing dataset.", maxScore: 20 },
      { title: "Spam Email Classifier", description: "Create a Naive Bayes classifier to detect spam emails with TF-IDF feature extraction.", maxScore: 20 },
      { title: "Customer Segmentation", description: "Use K-Means clustering to segment customers based on purchase behavior.", maxScore: 20 },
      { title: "Model Comparison Report", description: "Train 5 different ML models on the same dataset and compare their performance metrics.", maxScore: 25 },
      { title: "End-to-End ML Pipeline", description: "Build a complete ML pipeline: data cleaning, feature engineering, model training, evaluation, and deployment.", maxScore: 30 },
    ],
  },

  // ──── 11. AWS Cloud Practitioner ────
  {
    title: "AWS Cloud Practitioner",
    description: "Prepare for the AWS Cloud Practitioner certification. Cover EC2, S3, IAM, VPC, Lambda, and core cloud computing concepts.",
    subject: "Cloud", difficulty: "MEDIUM", duration: "16 hours", image: "/images/aws.png", rating: 4.7,
    tags: ["AWS", "Cloud", "Certification"],
    instructorIdx: 0,
    lessons: [
      { title: "Cloud Computing Fundamentals", duration: "12m", xpReward: 50 },
      { title: "AWS Global Infrastructure", duration: "15m", xpReward: 50 },
      { title: "IAM: Users, Groups & Policies", duration: "20m", xpReward: 75 },
      { title: "EC2 Instances & Auto Scaling", duration: "25m", xpReward: 100 },
      { title: "S3 Storage & Lifecycle Policies", duration: "18m", xpReward: 75 },
      { title: "VPC, Subnets & Security Groups", duration: "22m", xpReward: 75 },
      { title: "Serverless with Lambda", duration: "20m", xpReward: 75 },
      { title: "AWS Pricing & Billing", duration: "15m", xpReward: 50 },
    ],
    quizTopics: [
      { title: "AWS Services Quiz", difficulty: "MEDIUM", questions: [
        { text: "What is EC2?", options: ["Database service", "Virtual server service", "Storage service", "DNS service"], correctIndex: 1, explanation: "EC2 (Elastic Compute Cloud) provides resizable virtual servers in the cloud." },
        { text: "What does S3 stand for?", options: ["Simple Storage Service", "Secure Server Service", "Serverless Scaling System", "Static Site Service"], correctIndex: 0, explanation: "S3 = Simple Storage Service, an object storage service." },
        { text: "Which service manages user access?", options: ["EC2", "S3", "IAM", "RDS"], correctIndex: 2, explanation: "IAM (Identity and Access Management) controls who can access AWS resources." },
        { text: "What is the AWS free tier?", options: ["Unlimited free usage", "Limited free usage for new accounts", "Enterprise plan", "Government program"], correctIndex: 1, explanation: "AWS Free Tier offers limited free usage for 12 months for new accounts." },
      ]},
    ],
    assignments: [
      { title: "Deploy a Static Website to S3", description: "Host a static HTML/CSS website on S3 with CloudFront CDN and a custom domain.", maxScore: 15 },
      { title: "EC2 Instance Setup", description: "Launch an EC2 instance, configure security groups, and deploy a Node.js application.", maxScore: 20 },
      { title: "IAM Best Practices Report", description: "Create an IAM policy document implementing least privilege access for a 3-tier application.", maxScore: 15 },
      { title: "Serverless API with Lambda", description: "Build a REST API using API Gateway and Lambda with DynamoDB as the data store.", maxScore: 25 },
      { title: "Cost Optimization Analysis", description: "Analyze a sample AWS bill and recommend cost optimization strategies using Reserved Instances and Spot Instances.", maxScore: 20 },
    ],
  },

  // ──── 12–30: Additional courses (shorter blueprints) ────
  ...[
    { title: "Git & GitHub Workflow", description: "Master version control with Git. Learn branching, merging, rebasing, pull requests, and collaborative development workflows.", subject: "DevOps", difficulty: "EASY" as Difficulty, duration: "8 hours", image: "/images/devops.png", rating: 4.6, tags: ["Git", "GitHub"], instructorIdx: 1 },
    { title: "PHP & Laravel Development", description: "Build web applications with PHP and the Laravel framework. Cover MVC, Eloquent ORM, Blade templates, and REST APIs.", subject: "Web Development", difficulty: "MEDIUM" as Difficulty, duration: "18 hours", image: "/images/fullstack.png", rating: 4.5, tags: ["PHP", "Laravel"], instructorIdx: 0 },
    { title: "Mobile Apps with Flutter", description: "Create cross-platform mobile applications using Flutter and Dart. Build beautiful UIs with Material Design.", subject: "Mobile", difficulty: "MEDIUM" as Difficulty, duration: "20 hours", image: "/images/default-course.png", rating: 4.7, tags: ["Flutter", "Dart", "Mobile"], instructorIdx: 1 },
    { title: "UI/UX Design for Developers", description: "Learn design principles, color theory, typography, wireframing, and prototyping with Figma for developers.", subject: "Web Development", difficulty: "EASY" as Difficulty, duration: "10 hours", image: "/images/default-course.png", rating: 4.5, tags: ["UI/UX", "Figma", "Design"], instructorIdx: 0 },
    { title: "TypeScript Mastery", description: "Level up your JavaScript with TypeScript. Learn types, interfaces, generics, decorators, and advanced patterns.", subject: "Programming", difficulty: "MEDIUM" as Difficulty, duration: "14 hours", image: "/images/fullstack.png", rating: 4.8, tags: ["TypeScript", "JavaScript"], instructorIdx: 1 },
    { title: "Spring Boot Backend Development", description: "Build enterprise Java applications with Spring Boot. Cover dependency injection, REST APIs, JPA, and security.", subject: "Programming", difficulty: "HARD" as Difficulty, duration: "22 hours", image: "/images/java.png", rating: 4.7, tags: ["Spring Boot", "Java", "Backend"], instructorIdx: 0 },
    { title: "MongoDB for Developers", description: "NoSQL database mastery with MongoDB. Learn CRUD, aggregation pipelines, indexing, and schema design patterns.", subject: "Database", difficulty: "MEDIUM" as Difficulty, duration: "12 hours", image: "/images/sql.png", rating: 4.6, tags: ["MongoDB", "NoSQL"], instructorIdx: 1 },
    { title: "Agile & Scrum Methodology", description: "Master Agile project management with Scrum. Learn sprints, user stories, retrospectives, and team collaboration.", subject: "Programming", difficulty: "EASY" as Difficulty, duration: "6 hours", image: "/images/default-course.png", rating: 4.4, tags: ["Agile", "Scrum", "Project Management"], instructorIdx: 0 },
    { title: "Linux System Administration", description: "Learn Linux from the command line up. Cover file system, users, permissions, shell scripting, and server management.", subject: "DevOps", difficulty: "MEDIUM" as Difficulty, duration: "15 hours", image: "/images/devops.png", rating: 4.7, tags: ["Linux", "Sysadmin", "Shell"], instructorIdx: 1 },
    { title: "Data Science with Pandas", description: "Analyze and visualize data with Python. Master Pandas DataFrames, NumPy arrays, Matplotlib, and Seaborn charts.", subject: "Data Science", difficulty: "MEDIUM" as Difficulty, duration: "16 hours", image: "/images/datascience.png", rating: 4.8, tags: ["Pandas", "NumPy", "Data Science"], instructorIdx: 0 },
    { title: "Blockchain & Web3 Basics", description: "Understand blockchain technology, smart contracts, Ethereum, Solidity, and decentralized application development.", subject: "Programming", difficulty: "HARD" as Difficulty, duration: "18 hours", image: "/images/default-course.png", rating: 4.5, tags: ["Blockchain", "Web3", "Solidity"], instructorIdx: 1 },
    { title: "GraphQL API Development", description: "Build efficient APIs with GraphQL. Learn schemas, resolvers, mutations, subscriptions, and Apollo Server.", subject: "Web Development", difficulty: "MEDIUM" as Difficulty, duration: "12 hours", image: "/images/fullstack.png", rating: 4.6, tags: ["GraphQL", "Apollo", "API"], instructorIdx: 0 },
    { title: "Computer Networking Fundamentals", description: "Understand OSI model, TCP/IP, DNS, HTTP, routing, subnetting, and network troubleshooting.", subject: "Security", difficulty: "MEDIUM" as Difficulty, duration: "14 hours", image: "/images/security.png", rating: 4.5, tags: ["Networking", "TCP/IP", "OSI"], instructorIdx: 1 },
    { title: "Redis & Caching Strategies", description: "Master Redis for caching, sessions, message queues, and real-time leaderboards in production applications.", subject: "Database", difficulty: "MEDIUM" as Difficulty, duration: "10 hours", image: "/images/sql.png", rating: 4.6, tags: ["Redis", "Caching", "Performance"], instructorIdx: 0 },
    { title: "Next.js Full Stack Framework", description: "Build production apps with Next.js. Master SSR, SSG, API routes, middleware, and the App Router.", subject: "Web Development", difficulty: "MEDIUM" as Difficulty, duration: "16 hours", image: "/images/fullstack.png", rating: 4.9, tags: ["Next.js", "React", "SSR"], instructorIdx: 1 },
    { title: "Microservices Architecture", description: "Design and build microservices. Cover service communication, API gateways, event-driven architecture, and deployment.", subject: "Programming", difficulty: "HARD" as Difficulty, duration: "20 hours", image: "/images/dsa.png", rating: 4.7, tags: ["Microservices", "Architecture", "API Gateway"], instructorIdx: 0 },
    { title: "Testing & QA Automation", description: "Master software testing: unit tests, integration tests, E2E with Cypress, and CI/CD test pipelines.", subject: "DevOps", difficulty: "MEDIUM" as Difficulty, duration: "14 hours", image: "/images/devops.png", rating: 4.5, tags: ["Testing", "Jest", "Cypress", "QA"], instructorIdx: 1 },
    { title: "Rust Programming Language", description: "Learn Rust for systems programming. Cover ownership, borrowing, lifetimes, concurrency, and memory safety.", subject: "Programming", difficulty: "HARD" as Difficulty, duration: "22 hours", image: "/images/default-course.png", rating: 4.6, tags: ["Rust", "Systems Programming"], instructorIdx: 0 },
    { title: "Deep Learning with TensorFlow", description: "Build neural networks with TensorFlow and Keras. Cover CNNs, RNNs, transfer learning, and model deployment.", subject: "AI", difficulty: "HARD" as Difficulty, duration: "24 hours", image: "/images/ml.png", rating: 4.8, tags: ["Deep Learning", "TensorFlow", "Neural Networks"], instructorIdx: 1 },
  ].map((c) => ({
    ...c,
    lessons: Array.from({ length: rand(5, 8) }, (_, i) => ({
      title: `${c.title.split(" ")[0]} - Module ${i + 1}`,
      duration: `${rand(10, 35)}m`,
      xpReward: pick([50, 75, 100]),
    })),
    quizTopics: [{
      title: `${c.title} Assessment`, difficulty: c.difficulty,
      questions: [
        { text: `What is the primary purpose of ${c.tags[0]}?`, options: ["Data storage", "Process automation", c.description.substring(0, 40), "None of the above"], correctIndex: 2, explanation: `${c.tags[0]} is used for ${c.description.substring(0, 60)}.` },
        { text: `Which is a key feature of ${c.tags[0]}?`, options: ["Scalability", "Performance", "Security", "All of the above"], correctIndex: 3, explanation: `${c.tags[0]} provides scalability, performance, and security.` },
        { text: `${c.title} is best suited for which role?`, options: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer"], correctIndex: 2, explanation: "This course benefits full stack developers the most." },
        { text: `What prerequisite is recommended for ${c.title}?`, options: ["None", "Basic programming", "Advanced math", "Machine learning"], correctIndex: 1, explanation: "Basic programming knowledge helps with understanding the course material." },
      ],
    }],
    assignments: Array.from({ length: 5 }, (_, i) => ({
      title: `${c.title.split(" ")[0]} Project ${i + 1}`,
      description: `Complete a hands-on project applying concepts from ${c.title} module ${i + 1}. Demonstrate understanding through practical implementation.`,
      maxScore: pick([10, 15, 20, 25]),
    })),
  })),
];

// Generate lesson content for all lessons
function generateLessonContent(courseTitle: string, lessonTitle: string): Prisma.InputJsonValue {
  return {
    text: [
      { content: `Welcome to "${lessonTitle}" from the course "${courseTitle}". This module covers fundamental concepts that every developer should master. Let's begin with the core principles.`, reference_web: "https://developer.mozilla.org/en-US/", animation: "fade-in" },
      { content: `Understanding the theoretical foundation is crucial before diving into implementation. This section establishes the key terminology and mental models you'll need throughout the rest of the course.`, reference_web: "https://www.freecodecamp.org/", animation: "slide-up" },
      { content: `In professional software development, the concepts taught in this lesson are applied daily. Companies like Google, Microsoft, and Amazon rely on these fundamentals in their engineering practices.`, reference_web: "https://github.com/", animation: "fade-in" },
      { content: `Best practices include writing clean code, following SOLID principles, and maintaining comprehensive documentation. These habits distinguish junior developers from senior engineers.`, reference_web: "https://refactoring.guru/", animation: "slide-up" },
      { content: `Practice is the key to mastery. After completing this lesson, work through the exercises and try to apply each concept in a small project. This reinforcement helps transfer knowledge from short-term to long-term memory.`, reference_web: "https://www.codecademy.com/", animation: "fade-in" },
      { content: `Common mistakes beginners make include skipping fundamentals, not reading documentation, and copying code without understanding. Take time to truly comprehend each concept before moving on.`, reference_web: "https://stackoverflow.com/", animation: "slide-up" },
      { content: `The software industry evolves rapidly, but core principles remain constant. Data structures, algorithms, design patterns, and system thinking will serve you throughout your career regardless of which specific technology you use.`, reference_web: "https://www.coursera.org/", animation: "fade-in" },
      { content: `Collaboration is essential in modern development. Learning to use version control, code reviews, and agile methodologies will make you a more effective team member and contributor.`, reference_web: "https://docs.github.com/", animation: "slide-up" },
      { content: `Testing your code isn't optional — it's a professional requirement. Unit tests, integration tests, and end-to-end tests ensure your software works correctly and continues to work as you make changes.`, reference_web: "https://jestjs.io/", animation: "fade-in" },
      { content: `Congratulations on completing this section! Review the reference materials linked below, attempt the quiz, and proceed to the next lesson when you feel confident in these concepts.`, reference_web: "https://www.udemy.com/", animation: "slide-up" },
    ],
    youtubeLinks: [
      pick(["https://www.youtube.com/watch?v=eIrMbLywjGU", "https://www.youtube.com/watch?v=rfscVS0vtbw", "https://www.youtube.com/watch?v=PkZNo7MFNFg", "https://www.youtube.com/watch?v=Oe421EPjeBE", "https://www.youtube.com/watch?v=HXV3zeQKqGY"]),
    ],
    referenceLinks: [
      "https://developer.mozilla.org/en-US/",
      "https://www.w3schools.com/",
    ],
    animation: "zoom-in",
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN SEEDER
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log("🌱 SkillSync Production Seeder — Starting...\n");
  const t0 = Date.now();

  // ──── CLEAN ────
  console.log("🧹 Cleaning existing data...");
  await prisma.courseReview.deleteMany();
  await prisma.dailyActivity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.courseTag.deleteMany();
  await prisma.fileMeta.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  console.log("  ✓ Database cleaned\n");

  const hash = await bcrypt.hash("demo123", 10);

  // ═══════════════════════════════════════════════════════════
  // 1. USERS
  // ═══════════════════════════════════════════════════════════
  console.log("👥 Creating users...");
  const TEACHER_IDS = [2, 8];
  const STUDENT_IDS = [1, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  await prisma.user.createMany({
    data: [
      // Demo accounts
      { id: 1, name: "Roshini", email: "student@demo.com", password: hash, role: "STUDENT", avatar: "RO", city: "Chennai", xp: 3420, level: 7, streak: 12, coins: 850, joinedAt: new Date("2024-06-10") },
      { id: 2, name: "Course Handler", email: "teacher@demo.com", password: hash, role: "TEACHER", avatar: "CH", city: "Bangalore", xp: 12000, level: 25, streak: 45, coins: 3200, joinedAt: new Date("2023-08-01") },
      { id: 3, name: "Admin", email: "admin@demo.com", password: hash, role: "ADMIN", avatar: "AD", city: "Madurai", xp: 25000, level: 50, streak: 120, coins: 9999, joinedAt: new Date("2023-01-01") },
      { id: 8, name: "Meena Balaji", email: "meena@demo.com", password: hash, role: "TEACHER", avatar: "MB", city: "Hyderabad", xp: 9500, level: 20, streak: 60, coins: 2400, joinedAt: new Date("2023-11-15") },
      // Extra students for activity
      { id: 4,  name: "Arun Kumar",       email: "arun@demo.com",     password: hash, role: "STUDENT", avatar: "AK", city: "Delhi",       xp: rand(1000, 8000), level: rand(3, 15), streak: rand(0, 30),  coins: rand(100, 2000), joinedAt: monthsAgo(rand(6, 11)) },
      { id: 5,  name: "Priya Sharma",     email: "priya@demo.com",    password: hash, role: "STUDENT", avatar: "PS", city: "Mumbai",      xp: rand(2000, 12000), level: rand(5, 20), streak: rand(5, 50),  coins: rand(200, 3000), joinedAt: monthsAgo(rand(4, 10)) },
      { id: 6,  name: "Vikram Reddy",     email: "vikram@demo.com",   password: hash, role: "STUDENT", avatar: "VR", city: "Hyderabad",   xp: rand(500, 5000), level: rand(2, 12), streak: rand(0, 20),  coins: rand(50, 1500), joinedAt: monthsAgo(rand(3, 9)) },
      { id: 7,  name: "Sneha Patel",      email: "sneha@demo.com",    password: hash, role: "STUDENT", avatar: "SP", city: "Ahmedabad",   xp: rand(3000, 15000), level: rand(8, 25), streak: rand(10, 70), coins: rand(500, 4000), joinedAt: monthsAgo(rand(8, 12)) },
      { id: 9,  name: "Rahul Gupta",      email: "rahul@demo.com",    password: hash, role: "STUDENT", avatar: "RG", city: "Kolkata",     xp: rand(1500, 10000), level: rand(4, 18), streak: rand(3, 40),  coins: rand(150, 2500), joinedAt: monthsAgo(rand(5, 11)) },
      { id: 10, name: "Deepika Nair",     email: "deepika@demo.com",  password: hash, role: "STUDENT", avatar: "DN", city: "Kochi",       xp: rand(800, 6000), level: rand(3, 14), streak: rand(0, 25),  coins: rand(100, 1800), joinedAt: monthsAgo(rand(4, 10)) },
      { id: 11, name: "Karthik Iyer",     email: "karthik@demo.com",  password: hash, role: "STUDENT", avatar: "KI", city: "Chennai",     xp: rand(2500, 11000), level: rand(6, 22), streak: rand(8, 55),  coins: rand(300, 3500), joinedAt: monthsAgo(rand(7, 12)) },
      { id: 12, name: "Ananya Mishra",    email: "ananya@demo.com",   password: hash, role: "STUDENT", avatar: "AM", city: "Pune",         xp: rand(1200, 7500), level: rand(4, 16), streak: rand(2, 35),  coins: rand(150, 2200), joinedAt: monthsAgo(rand(3, 8)) },
      { id: 13, name: "Arjun Singh",      email: "arjun@demo.com",    password: hash, role: "STUDENT", avatar: "AS", city: "Jaipur",      xp: rand(600, 4000), level: rand(2, 10), streak: rand(0, 15),  coins: rand(50, 1200), joinedAt: monthsAgo(rand(2, 7)) },
      { id: 14, name: "Kavitha Rajan",    email: "kavitha@demo.com",  password: hash, role: "STUDENT", avatar: "KR", city: "Coimbatore",  xp: rand(4000, 16000), level: rand(10, 28), streak: rand(15, 80), coins: rand(600, 5000), joinedAt: monthsAgo(rand(9, 12)) },
      { id: 15, name: "Sanjay Verma",     email: "sanjay@demo.com",   password: hash, role: "STUDENT", avatar: "SV", city: "Lucknow",     xp: rand(900, 5500), level: rand(3, 13), streak: rand(1, 28),  coins: rand(100, 1600), joinedAt: monthsAgo(rand(4, 9)) },
      { id: 16, name: "Divya Krishnan",   email: "divya@demo.com",    password: hash, role: "STUDENT", avatar: "DK", city: "Trivandrum",  xp: rand(1800, 9000), level: rand(5, 19), streak: rand(5, 45),  coins: rand(200, 2800), joinedAt: monthsAgo(rand(6, 11)) },
      { id: 17, name: "Mohammed Faisal",  email: "faisal@demo.com",   password: hash, role: "STUDENT", avatar: "MF", city: "Bangalore",   xp: rand(700, 4500), level: rand(2, 11), streak: rand(0, 18),  coins: rand(80, 1400), joinedAt: monthsAgo(rand(3, 8)) },
      { id: 18, name: "Lakshmi Sundaram", email: "lakshmi@demo.com",  password: hash, role: "STUDENT", avatar: "LS", city: "Madurai",     xp: rand(2200, 10500), level: rand(6, 21), streak: rand(7, 50),  coins: rand(250, 3200), joinedAt: monthsAgo(rand(5, 10)) },
    ],
  });
  console.log(`  ✓ ${2 + 2 + STUDENT_IDS.length} users created (2 teachers, 1 admin, ${STUDENT_IDS.length} students)\n`);

  // ═══════════════════════════════════════════════════════════
  // 2. COURSES + TAGS + LESSONS + QUIZZES + ASSIGNMENTS
  // ═══════════════════════════════════════════════════════════
  console.log("📚 Creating courses, lessons, quizzes, assignments...");
  let totalLessons = 0, totalQuizzes = 0, totalQuestions = 0, totalAssignments = 0;

  for (let ci = 0; ci < COURSES.length; ci++) {
    const bp = COURSES[ci];
    const courseId = ci + 1;
    const instructorId = TEACHER_IDS[bp.instructorIdx];

    // Course
    await prisma.course.create({
      data: {
        id: courseId,
        title: bp.title,
        description: bp.description,
        subject: bp.subject,
        difficulty: bp.difficulty,
        duration: bp.duration,
        image: bp.image,
        rating: bp.rating,
        instructorId,
        tags: { create: bp.tags.map(t => ({ name: t })) },
      },
    });

    // Lessons
    for (let li = 0; li < bp.lessons.length; li++) {
      const l = bp.lessons[li];
      await prisma.lesson.create({
        data: {
          courseId,
          title: l.title,
          duration: l.duration,
          type: pick(["INTERACTIVE", "TEXT", "VIDEO"] as LessonType[]),
          xpReward: l.xpReward,
          orderIndex: li + 1,
          content: generateLessonContent(bp.title, l.title) as Prisma.InputJsonValue,
        },
      });
      totalLessons++;
    }

    // Quizzes
    for (const qt of bp.quizTopics) {
      await prisma.quiz.create({
        data: {
          courseId,
          title: qt.title,
          difficulty: qt.difficulty,
          timeLimit: pick([300, 600, 900, 1200]),
          xpReward: pick([100, 150, 200, 250]),
          questions: {
            create: qt.questions.map((q, qi) => ({
              text: q.text,
              options: JSON.stringify(q.options),
              correctIndex: q.correctIndex,
              explanation: q.explanation,
              orderIndex: qi + 1,
            })),
          },
        },
      });
      totalQuizzes++;
      totalQuestions += qt.questions.length;
    }

    // Assignments  (30% expired, rest upcoming)
    for (let ai = 0; ai < bp.assignments.length; ai++) {
      const a = bp.assignments[ai];
      const isExpired = ai < Math.ceil(bp.assignments.length * 0.3);
      const dueDate = isExpired
        ? daysAgo(rand(10, 40))
        : daysFromNow(rand(5, 35));
      await prisma.assignment.create({
        data: {
          courseId,
          title: a.title,
          description: a.description,
          maxScore: a.maxScore,
          xpReward: pick([100, 150, 200]),
          dueDate,
        },
      });
      totalAssignments++;
    }
  }
  console.log(`  ✓ ${COURSES.length} courses created`);
  console.log(`  ✓ ${totalLessons} lessons with rich content`);
  console.log(`  ✓ ${totalQuizzes} quizzes with ${totalQuestions} questions`);
  console.log(`  ✓ ${totalAssignments} assignments\n`);

  // ═══════════════════════════════════════════════════════════
  // 3. ENROLLMENTS
  // ═══════════════════════════════════════════════════════════
  console.log("📋 Creating enrollments...");
  const allCourseIds = Array.from({ length: COURSES.length }, (_, i) => i + 1);
  const enrollmentData: { userId: number; courseId: number; status: CourseStatus; progress: number; enrolledAt: Date }[] = [];

  for (const sid of STUDENT_IDS) {
    const numCourses = rand(3, Math.min(12, COURSES.length));
    const shuffled = [...allCourseIds].sort(() => Math.random() - 0.5).slice(0, numCourses);
    for (const cid of shuffled) {
      const progress = rand(0, 100);
      const status: CourseStatus = progress === 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "NOT_STARTED";
      enrollmentData.push({
        userId: sid,
        courseId: cid,
        status,
        progress,
        enrolledAt: randomDate(monthsAgo(11), daysAgo(1)),
      });
    }
  }
  await prisma.enrollment.createMany({ data: enrollmentData });
  console.log(`  ✓ ${enrollmentData.length} enrollments created\n`);

  // ═══════════════════════════════════════════════════════════
  // 4. LESSON PROGRESS
  // ═══════════════════════════════════════════════════════════
  console.log("📖 Creating lesson progress...");
  const allLessons = await prisma.lesson.findMany({ select: { id: true, courseId: true } });
  const lessonsByCourse = new Map<number, number[]>();
  for (const l of allLessons) {
    if (!lessonsByCourse.has(l.courseId)) lessonsByCourse.set(l.courseId, []);
    lessonsByCourse.get(l.courseId)!.push(l.id);
  }

  const progressData: { userId: number; lessonId: number; completed: boolean; completedAt: Date | null }[] = [];
  for (const e of enrollmentData) {
    if (e.progress === 0) continue;
    const courseLessons = lessonsByCourse.get(e.courseId) || [];
    const numCompleted = Math.max(1, Math.floor(courseLessons.length * (e.progress / 100)));
    for (let i = 0; i < numCompleted && i < courseLessons.length; i++) {
      progressData.push({
        userId: e.userId,
        lessonId: courseLessons[i],
        completed: true,
        completedAt: randomDate(e.enrolledAt, new Date()),
      });
    }
  }
  // Batch insert with chunk to avoid memory issues
  for (let i = 0; i < progressData.length; i += 500) {
    await prisma.lessonProgress.createMany({
      data: progressData.slice(i, i + 500),
      skipDuplicates: true,
    });
  }
  console.log(`  ✓ ${progressData.length} lesson progress records\n`);

  // ═══════════════════════════════════════════════════════════
  // 5. QUIZ ATTEMPTS
  // ═══════════════════════════════════════════════════════════
  console.log("🧠 Creating quiz attempts...");
  const allQuizzes = await prisma.quiz.findMany({ select: { id: true, courseId: true }, });
  const quizByCourse = new Map<number, number[]>();
  for (const q of allQuizzes) {
    if (!quizByCourse.has(q.courseId)) quizByCourse.set(q.courseId, []);
    quizByCourse.get(q.courseId)!.push(q.id);
  }

  const attemptData: { userId: number; quizId: number; score: number; answers: string; timeSpent: number; createdAt: Date }[] = [];
  for (const e of enrollmentData) {
    if (e.progress < 20) continue;
    const courseQuizzes = quizByCourse.get(e.courseId) || [];
    for (const qid of courseQuizzes) {
      if (Math.random() < 0.6) {
        const numAttempts = rand(1, 3);
        for (let a = 0; a < numAttempts; a++) {
          attemptData.push({
            userId: e.userId,
            quizId: qid,
            score: rand(30, 100),
            answers: JSON.stringify([rand(0, 3), rand(0, 3), rand(0, 3), rand(0, 3)]),
            timeSpent: rand(60, 900),
            createdAt: randomDate(e.enrolledAt, new Date()),
          });
        }
      }
    }
  }
  for (let i = 0; i < attemptData.length; i += 500) {
    await prisma.quizAttempt.createMany({ data: attemptData.slice(i, i + 500) });
  }
  console.log(`  ✓ ${attemptData.length} quiz attempts\n`);

  // ═══════════════════════════════════════════════════════════
  // 6. ASSIGNMENT SUBMISSIONS
  // ═══════════════════════════════════════════════════════════
  console.log("📝 Creating assignment submissions...");
  const allAssignments = await prisma.assignment.findMany({ select: { id: true, courseId: true, maxScore: true, dueDate: true } });
  const assignmentByCourse = new Map<number, typeof allAssignments>();
  for (const a of allAssignments) {
    if (!assignmentByCourse.has(a.courseId)) assignmentByCourse.set(a.courseId, []);
    assignmentByCourse.get(a.courseId)!.push(a);
  }

  const submissionData: { assignmentId: number; userId: number; status: AssignmentStatus; score: number | null; fileUrl: string | null; submittedAt: Date | null; gradedAt: Date | null }[] = [];
  for (const e of enrollmentData) {
    if (e.progress < 15) continue;
    const courseAssignments = assignmentByCourse.get(e.courseId) || [];
    for (const a of courseAssignments) {
      if (Math.random() < 0.5) {
        const roll = Math.random();
        const submitted = randomDate(e.enrolledAt, new Date());
        if (roll < 0.4) {
          // GRADED
          submissionData.push({
            assignmentId: a.id, userId: e.userId, status: "GRADED",
            score: rand(Math.floor(a.maxScore * 0.4), a.maxScore),
            fileUrl: `/uploads/assignments/submission-${e.userId}-${a.id}.pdf`,
            submittedAt: submitted,
            gradedAt: new Date(submitted.getTime() + rand(1, 7) * 86400000),
          });
        } else if (roll < 0.75) {
          // SUBMITTED
          submissionData.push({
            assignmentId: a.id, userId: e.userId, status: "SUBMITTED",
            score: null, fileUrl: `/uploads/assignments/submission-${e.userId}-${a.id}.pdf`,
            submittedAt: submitted, gradedAt: null,
          });
        }
        // else: PENDING (no submission record needed)
      }
    }
  }
  // Deduplicate by unique(assignmentId, userId)
  const subMap = new Map<string, typeof submissionData[0]>();
  for (const s of submissionData) {
    subMap.set(`${s.assignmentId}-${s.userId}`, s);
  }
  const uniqueSubs = Array.from(subMap.values());
  for (let i = 0; i < uniqueSubs.length; i += 500) {
    await prisma.assignmentSubmission.createMany({
      data: uniqueSubs.slice(i, i + 500),
      skipDuplicates: true,
    });
  }
  console.log(`  ✓ ${uniqueSubs.length} assignment submissions\n`);

  // ═══════════════════════════════════════════════════════════
  // 7. ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════
  console.log("🏆 Creating achievements...");
  const achievements = [
    // Student achievements
    { id: 1,  title: "First Steps",           description: "Complete your first lesson",            icon: "Star",         xpBonus: 50,  forRole: "STUDENT" as Role },
    { id: 2,  title: "Code Ninja",            description: "Complete 10 lessons",                  icon: "Zap",          xpBonus: 100, forRole: "STUDENT" as Role },
    { id: 3,  title: "Quiz Master",           description: "Score 100% on any quiz",              icon: "Trophy",       xpBonus: 200, forRole: "STUDENT" as Role },
    { id: 4,  title: "7 Day Streak",          description: "Maintain a 7-day learning streak",     icon: "Flame",        xpBonus: 150, forRole: "STUDENT" as Role },
    { id: 5,  title: "30 Day Streak",         description: "Maintain a 30-day learning streak",    icon: "Flame",        xpBonus: 500, forRole: "STUDENT" as Role },
    { id: 6,  title: "Course Completer",      description: "Complete your first course",           icon: "Award",        xpBonus: 300, forRole: "STUDENT" as Role },
    { id: 7,  title: "5 Courses Done",        description: "Complete 5 courses",                   icon: "Medal",        xpBonus: 750, forRole: "STUDENT" as Role },
    { id: 8,  title: "Fast Learner",          description: "Complete a course in under a week",    icon: "Zap",          xpBonus: 200, forRole: "STUDENT" as Role },
    { id: 9,  title: "Assignment Hero",       description: "Get 100% on 3 assignments",            icon: "Target",       xpBonus: 250, forRole: "STUDENT" as Role },
    { id: 10, title: "Top Scorer",            description: "Reach top 3 on the leaderboard",       icon: "Trophy",       xpBonus: 500, forRole: "STUDENT" as Role },
    { id: 11, title: "Night Owl",             description: "Study after 10 PM for 5 days",         icon: "Star",         xpBonus: 100, forRole: "STUDENT" as Role },
    { id: 12, title: "Knowledge Seeker",      description: "Enroll in 10 courses",                 icon: "Orbit",        xpBonus: 200, forRole: "STUDENT" as Role },
    { id: 13, title: "Bookworm",              description: "Read 50 lesson paragraphs",            icon: "Star",         xpBonus: 150, forRole: "STUDENT" as Role },
    { id: 14, title: "Dedicated Learner",     description: "Log in for 14 consecutive days",       icon: "Flame",        xpBonus: 300, forRole: "STUDENT" as Role },
    { id: 15, title: "Social Butterfly",      description: "Leave 5 course reviews",               icon: "Star",         xpBonus: 100, forRole: "STUDENT" as Role },
    { id: 16, title: "Problem Solver",        description: "Attempt 20 quizzes",                   icon: "FlaskConical", xpBonus: 200, forRole: "STUDENT" as Role },
    { id: 17, title: "Rising Star",           description: "Reach Level 10",                       icon: "Star",         xpBonus: 250, forRole: "STUDENT" as Role },
    { id: 18, title: "XP Hunter",             description: "Earn 5000 XP total",                   icon: "Zap",          xpBonus: 300, forRole: "STUDENT" as Role },
    { id: 19, title: "Full Stack Journey",    description: "Enroll in courses from 5 subjects",    icon: "Orbit",        xpBonus: 250, forRole: "STUDENT" as Role },
    { id: 20, title: "Century Club",          description: "Earn 100 coins",                       icon: "Award",        xpBonus: 100, forRole: "STUDENT" as Role },
    { id: 21, title: "Perfectionist",         description: "Score 90%+ on 10 quizzes",             icon: "Target",       xpBonus: 400, forRole: "STUDENT" as Role },
    { id: 22, title: "Early Bird",            description: "Submit 3 assignments before deadline",  icon: "Star",         xpBonus: 150, forRole: "STUDENT" as Role },
    { id: 23, title: "Multitasker",           description: "Work on 3 courses in one day",         icon: "Zap",          xpBonus: 100, forRole: "STUDENT" as Role },
    { id: 24, title: "Comeback Kid",          description: "Resume learning after a 7-day break",  icon: "Flame",        xpBonus: 75,  forRole: "STUDENT" as Role },
    { id: 25, title: "Deep Diver",            description: "Spend 2+ hours in a single session",   icon: "Star",         xpBonus: 150, forRole: "STUDENT" as Role },
    // Teacher achievements
    { id: 101, title: "Course Creator",       description: "Publish your first course",            icon: "Star",         xpBonus: 200, forRole: "TEACHER" as Role },
    { id: 102, title: "Tech Mentor",          description: "Publish 5 courses",                    icon: "Award",        xpBonus: 500, forRole: "TEACHER" as Role },
    { id: 103, title: "Student Magnet",       description: "Get 50 total enrollments",             icon: "Trophy",       xpBonus: 300, forRole: "TEACHER" as Role },
    { id: 104, title: "Review Superstar",     description: "Receive 20 five-star reviews",         icon: "Star",         xpBonus: 400, forRole: "TEACHER" as Role },
    { id: 105, title: "Grading Machine",      description: "Grade 100 assignments",                icon: "Target",       xpBonus: 250, forRole: "TEACHER" as Role },
    { id: 106, title: "Content King",         description: "Create 50 lessons total",              icon: "Medal",        xpBonus: 500, forRole: "TEACHER" as Role },
    { id: 107, title: "Quiz Master Teacher",  description: "Create 20 quizzes",                    icon: "Orbit",        xpBonus: 300, forRole: "TEACHER" as Role },
    { id: 108, title: "Popular Instructor",   description: "Average rating above 4.5",             icon: "Trophy",       xpBonus: 350, forRole: "TEACHER" as Role },
    { id: 109, title: "Consistency Champion", description: "Publish content for 30 consecutive days", icon: "Flame",      xpBonus: 400, forRole: "TEACHER" as Role },
    { id: 110, title: "Community Builder",    description: "Respond to 50 student reviews",        icon: "Star",         xpBonus: 200, forRole: "TEACHER" as Role },
  ];

  await prisma.achievement.createMany({ data: achievements });

  // Award achievements to students
  const userAchievements: { userId: number; achievementId: number; earnedAt: Date }[] = [];
  const studentAchievementIds = achievements.filter(a => a.forRole === "STUDENT").map(a => a.id);
  const teacherAchievementIds = achievements.filter(a => a.forRole === "TEACHER").map(a => a.id);

  for (const sid of STUDENT_IDS) {
    const numEarned = rand(3, Math.min(12, studentAchievementIds.length));
    const earned = [...studentAchievementIds].sort(() => Math.random() - 0.5).slice(0, numEarned);
    for (const achId of earned) {
      userAchievements.push({
        userId: sid,
        achievementId: achId,
        earnedAt: randomDate(monthsAgo(10), new Date()),
      });
    }
  }
  // Award teacher achievements
  for (const tid of TEACHER_IDS) {
    const numEarned = rand(3, 7);
    const earned = [...teacherAchievementIds].sort(() => Math.random() - 0.5).slice(0, numEarned);
    for (const achId of earned) {
      userAchievements.push({
        userId: tid,
        achievementId: achId,
        earnedAt: randomDate(monthsAgo(10), new Date()),
      });
    }
  }
  await prisma.userAchievement.createMany({ data: userAchievements, skipDuplicates: true });
  console.log(`  ✓ ${achievements.length} achievements defined`);
  console.log(`  ✓ ${userAchievements.length} user achievements awarded\n`);

  // ═══════════════════════════════════════════════════════════
  // 8. DAILY ACTIVITY (Last 12 months for all students)
  // ═══════════════════════════════════════════════════════════
  console.log("📊 Creating daily activity data (12 months)...");
  const activityData: { userId: number; date: Date; xp: number; lessons: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const sid of STUDENT_IDS) {
    // Some students are more active than others
    const activityLevel = Math.random(); // 0.0–1.0 (how often they are active)
    for (let d = 365; d >= 0; d--) {
      if (Math.random() > activityLevel * 0.7 + 0.15) continue; // Skip some days
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      activityData.push({
        userId: sid,
        date,
        xp: rand(10, 350),
        lessons: rand(0, 5),
      });
    }
  }
  for (let i = 0; i < activityData.length; i += 500) {
    await prisma.dailyActivity.createMany({
      data: activityData.slice(i, i + 500),
      skipDuplicates: true,
    });
  }
  console.log(`  ✓ ${activityData.length} daily activity records across 12 months\n`);

  // ═══════════════════════════════════════════════════════════
  // 9. NOTIFICATIONS (12 months)
  // ═══════════════════════════════════════════════════════════
  console.log("🔔 Creating notifications...");
  const notifData: { userId: number; type: NotificationType; title: string; message: string; icon: string; isRead: boolean; createdAt: Date }[] = [];

  const studentNotifTemplates: { type: NotificationType; title: string; message: string; icon: string }[] = [
    { type: "ENROLLMENT", title: "Enrolled Successfully!", message: "You have been enrolled in a new course. Start learning now!", icon: "BookOpen" },
    { type: "ASSIGNMENT_GRADED", title: "Assignment Graded!", message: "Your assignment has been graded. Check your score!", icon: "FileCheck" },
    { type: "QUIZ_COMPLETED", title: "Quiz Completed!", message: "Great job on completing the quiz. View your results.", icon: "CheckCircle" },
    { type: "ACHIEVEMENT_EARNED", title: "Achievement Unlocked!", message: "You've earned a new achievement badge!", icon: "Trophy" },
    { type: "MODULE_UNLOCKED", title: "New Module Available!", message: "A new lesson module has been unlocked for you.", icon: "Lock" },
    { type: "AI_RECOMMENDATION", title: "Course Recommendation", message: "Based on your progress, we recommend checking out a new course.", icon: "Sparkles" },
    { type: "COURSE_UPDATED", title: "Course Updated", message: "A course you're enrolled in has new content!", icon: "Sparkles" },
    { type: "SYSTEM_ALERT", title: "Streak Warning!", message: "Don't lose your streak — complete a lesson today!", icon: "Flame" },
  ];

  const teacherNotifTemplates: { type: NotificationType; title: string; message: string; icon: string }[] = [
    { type: "STUDENT_ENROLLED", title: "New Student!", message: "A student has enrolled in your course.", icon: "UserPlus" },
    { type: "ASSIGNMENT_SUBMITTED", title: "Assignment Submitted", message: "A student has submitted an assignment for grading.", icon: "FileText" },
    { type: "NEW_COURSE_REVIEW", title: "New Course Review", message: "A student left a review on your course.", icon: "Star" },
    { type: "COURSE_PUBLISHED", title: "Course Published!", message: "Your course is now live and available to students.", icon: "BookOpen" },
  ];

  for (const sid of STUDENT_IDS) {
    const numNotifs = rand(12, 35);
    for (let n = 0; n < numNotifs; n++) {
      const tmpl = pick(studentNotifTemplates);
      notifData.push({
        ...tmpl,
        userId: sid,
        isRead: Math.random() < 0.6,
        createdAt: randomDate(monthsAgo(11), new Date()),
      });
    }
  }
  for (const tid of TEACHER_IDS) {
    const numNotifs = rand(20, 50);
    for (let n = 0; n < numNotifs; n++) {
      const tmpl = pick(teacherNotifTemplates);
      notifData.push({
        ...tmpl,
        userId: tid,
        isRead: Math.random() < 0.5,
        createdAt: randomDate(monthsAgo(11), new Date()),
      });
    }
  }
  // Admin notifications
  for (let n = 0; n < 15; n++) {
    notifData.push({
      userId: 3,
      type: pick(["SYSTEM_ALERT", "MEMBER_JOINED", "COURSE_PUBLISHED"] as NotificationType[]),
      title: pick(["New User Registered", "System Health Check", "Weekly Report Ready"]),
      message: pick(["A new user has joined the platform.", "All systems operating normally.", "Your weekly analytics report is ready."]),
      icon: pick(["Bell", "Shield", "BarChart"]),
      isRead: Math.random() < 0.4,
      createdAt: randomDate(monthsAgo(11), new Date()),
    });
  }

  for (let i = 0; i < notifData.length; i += 500) {
    await prisma.notification.createMany({ data: notifData.slice(i, i + 500) });
  }
  console.log(`  ✓ ${notifData.length} notifications\n`);

  // ═══════════════════════════════════════════════════════════
  // 10. COURSE REVIEWS
  // ═══════════════════════════════════════════════════════════
  console.log("⭐ Creating course reviews...");
  const reviewData: { userId: number; courseId: number; rating: number; comment: string; createdAt: Date }[] = [];
  const reviewComments = [
    "Excellent course! The explanations are clear and the projects are practical.",
    "Really well-structured content. I learned so much in just a few weeks.",
    "The instructor explains complex topics in a very approachable way.",
    "Great hands-on projects. I built my first real application!",
    "Good course overall, but could use more advanced examples.",
    "Perfect for beginners. The pace is just right.",
    "I love how each lesson builds on the previous one. Very logical flow.",
    "The quizzes really help reinforce the material. Highly recommend!",
    "This course gave me the confidence to start applying for developer jobs.",
    "Practical and relevant content. Exactly what the industry needs.",
    "Some sections could be more detailed, but overall a solid course.",
    "The best course I've taken on this platform. Worth every minute!",
    "Challenging assignments that really push your understanding further.",
    "Clear explanations with real-world examples. Very engaging!",
    "I completed this course in two weeks and feel much more confident now.",
  ];

  for (const e of enrollmentData) {
    if (e.progress > 30 && Math.random() < 0.35) {
      reviewData.push({
        userId: e.userId,
        courseId: e.courseId,
        rating: pick([3, 4, 4, 4, 5, 5, 5, 5]), // skew positive
        comment: pick(reviewComments),
        createdAt: randomDate(e.enrolledAt, new Date()),
      });
    }
  }
  // Deduplicate (one review per user per course)
  const reviewMap = new Map<string, typeof reviewData[0]>();
  for (const r of reviewData) {
    reviewMap.set(`${r.userId}-${r.courseId}`, r);
  }
  const uniqueReviews = Array.from(reviewMap.values());
  for (let i = 0; i < uniqueReviews.length; i += 500) {
    await prisma.courseReview.createMany({ data: uniqueReviews.slice(i, i + 500) });
  }
  console.log(`  ✓ ${uniqueReviews.length} course reviews\n`);

  // ═══════════════════════════════════════════════════════════
  // 11. TEACHER METRICS & ACTIVITY
  // ═══════════════════════════════════════════════════════════
  console.log("👨‍🏫 Updating teacher metrics & seeding teacher activity...");
  
  for (const tid of TEACHER_IDS) {
    // 1. Get all courses for this teacher
    const teacherCourses = await prisma.course.findMany({
      where: { instructorId: tid },
      include: {
        enrollments: {
          include: {
            user: { select: { streak: true } }
          }
        }
      }
    });

    const enrolledStudents = teacherCourses.flatMap(c => c.enrollments);
    const totalEnrollments = enrolledStudents.length;
    const sumProgress = enrolledStudents.reduce((sum, e) => sum + e.progress, 0);
    const maxStudentStreak = enrolledStudents.length > 0 
      ? Math.max(...enrolledStudents.map(e => e.user.streak))
      : 0;

    // Formula: XP = (Enrollments * 150) + (Avg Progress * 5) + (Total Sum Progress / 10)
    const teacherXp = (totalEnrollments * 150) + Math.floor(sumProgress * 1.5);
    const teacherLevel = Math.floor(teacherXp / 800) + 1;
    const teacherStreak = Math.floor(maxStudentStreak * 0.8) + rand(5, 15);

    await prisma.user.update({
      where: { id: tid },
      data: {
        xp: teacherXp,
        level: teacherLevel,
        streak: teacherStreak
      }
    });

    // 2. Generate activity logs for teacher based on student interactions
    // We'll mimic activity on days where their students were active
    const studentActivities = await prisma.dailyActivity.findMany({
      where: { userId: { in: enrolledStudents.map(e => e.userId) } },
      orderBy: { date: "asc" }
    });

    const teacherActivitiesByDate = new Map<string, { xp: number; contentCreated: number }>();
    for (const sa of studentActivities) {
      const dStr = sa.date.toISOString().split("T")[0];
      if (!teacherActivitiesByDate.has(dStr)) {
        teacherActivitiesByDate.set(dStr, { xp: 0, contentCreated: 0 });
      }
      const current = teacherActivitiesByDate.get(dStr)!;
      current.xp += Math.floor(sa.xp * 0.1) + rand(5, 20); // Teachers get "Passive XP" from student activity
      if (Math.random() < 0.2) current.contentCreated += 1;
    }

    const teacherActivityData = Array.from(teacherActivitiesByDate.entries()).map(([date, data]) => ({
      userId: tid,
      date: new Date(date),
      xp: data.xp,
      lessons: data.contentCreated // In teacher context, "lessons" can be "lessons reviewed/created"
    }));

    for (let i = 0; i < teacherActivityData.length; i += 500) {
      await prisma.dailyActivity.createMany({
        data: teacherActivityData.slice(i, i + 500),
        skipDuplicates: true
      });
    }
  }
  console.log("  ✓ Teacher stats updated and activity charts seeded\n");

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log("══════════════════════════════════════════════════");
  console.log("  🎉 SEED COMPLETE!");
  console.log("══════════════════════════════════════════════════");
  console.log(`  Users:              ${2 + 2 + STUDENT_IDS.length}`);
  console.log(`  Courses:            ${COURSES.length}`);
  console.log(`  Lessons:            ${totalLessons}`);
  console.log(`  Quizzes:            ${totalQuizzes} (${totalQuestions} questions)`);
  console.log(`  Assignments:        ${totalAssignments}`);
  console.log(`  Enrollments:        ${enrollmentData.length}`);
  console.log(`  Lesson Progress:    ${progressData.length}`);
  console.log(`  Quiz Attempts:      ${attemptData.length}`);
  console.log(`  Submissions:        ${uniqueSubs.length}`);
  console.log(`  Achievements:       ${achievements.length} (${userAchievements.length} awarded)`);
  console.log(`  Daily Activities:   ${activityData.length}`);
  console.log(`  Notifications:      ${notifData.length}`);
  console.log(`  Course Reviews:     ${uniqueReviews.length}`);
  console.log(`  ⏱️  Time:            ${elapsed}s`);
  console.log("══════════════════════════════════════════════════\n");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
