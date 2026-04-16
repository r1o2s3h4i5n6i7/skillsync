/**
 * seed-demo.ts — Rich Demo Data Seeder
 *
 * This script ADDS demo data on top of the existing base seed.
 * It does NOT delete existing data.
 *
 * Run: npx tsx prisma/seed-demo.ts
 *
 * Adds:
 * - 15 additional students with varied stats for a lively leaderboard
 * - Enrollments spread across all 10 courses
 * - Lesson progress records for realistic progress bars
 * - Quiz attempts with varied scores
 * - Assignment submissions in all states
 * - More achievements (student + teacher)
 * - Rich notifications for all 3 demo accounts
 * - Daily activity history (30 days) for student dashboard charts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🎓 Seeding RICH demo data (additive — no deletions)...\n");

  const hash = await bcrypt.hash("demo123", 10);

  // ══════════════════════════════════════════════════════
  // 1. ADDITIONAL STUDENTS (15 students for leaderboard)
  // ══════════════════════════════════════════════════════
  const additionalStudents = [
    { name: "Priya Venkatesh", email: "priya@demo.com", city: "Chennai", xp: 5200, level: 11, streak: 18, coins: 1200 },
    { name: "Rajesh Kumar", email: "rajesh@demo.com", city: "Coimbatore", xp: 4800, level: 10, streak: 25, coins: 1100 },
    { name: "Lakshmi Iyer", email: "lakshmi@demo.com", city: "Madurai", xp: 6100, level: 13, streak: 30, coins: 1500 },
    { name: "Surya Prakash", email: "surya@demo.com", city: "Trichy", xp: 3900, level: 8, streak: 10, coins: 900 },
    { name: "Kavitha Rajan", email: "kavitha@demo.com", city: "Salem", xp: 7200, level: 15, streak: 42, coins: 1800 },
    { name: "Arun Selvam", email: "arun@demo.com", city: "Tirunelveli", xp: 2800, level: 6, streak: 5, coins: 650 },
    { name: "Deepa Chandran", email: "deepa@demo.com", city: "Erode", xp: 8500, level: 18, streak: 55, coins: 2100 },
    { name: "Vikram Sundaram", email: "vikram@demo.com", city: "Vellore", xp: 4100, level: 9, streak: 15, coins: 950 },
    { name: "Anitha Mohan", email: "anitha@demo.com", city: "Thanjavur", xp: 5600, level: 12, streak: 20, coins: 1350 },
    { name: "Karthikeyan R", email: "karthikeyan@demo.com", city: "Dindigul", xp: 3200, level: 7, streak: 8, coins: 750 },
    { name: "Sowmiya Ganesh", email: "sowmiya@demo.com", city: "Karur", xp: 9200, level: 19, streak: 65, coins: 2400 },
    { name: "Balaji Natarajan", email: "balaji@demo.com", city: "Kumbakonam", xp: 6800, level: 14, streak: 35, coins: 1650 },
    { name: "Revathi Krishnan", email: "revathi@demo.com", city: "Nagercoil", xp: 4500, level: 10, streak: 22, coins: 1050 },
    { name: "Santhosh Murugesan", email: "santhosh@demo.com", city: "Tiruppur", xp: 7800, level: 16, streak: 48, coins: 1950 },
    { name: "Nandhini Palani", email: "nandhini@demo.com", city: "Pollachi", xp: 5900, level: 12, streak: 28, coins: 1400 },
  ];

  const createdStudents: number[] = [];
  for (const s of additionalStudents) {
    const nameParts = s.name.split(" ");
    const avatar = `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    try {
      const user = await prisma.user.create({
        data: {
          name: s.name,
          email: s.email,
          password: hash,
          role: "STUDENT",
          avatar,
          city: s.city,
          xp: s.xp,
          level: s.level,
          streak: s.streak,
          coins: s.coins,
          joinedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        },
      });
      createdStudents.push(user.id);
    } catch {
      // Skip if email already exists
    }
  }
  console.log(`✅ ${createdStudents.length} additional students created`);

  // ══════════════════════════════════════════════════════
  // 2. ADDITIONAL ENROLLMENTS for demo student (id=1)
  //    Enroll Arjun in courses 2, 4, 5, 6 (he already has 1, 3, 9)
  // ══════════════════════════════════════════════════════
  const studentExtraEnrollments = [
    { userId: 1, courseId: 2, status: "IN_PROGRESS" as const, progress: 20 },
    { userId: 1, courseId: 4, status: "COMPLETED" as const, progress: 100 },
    { userId: 1, courseId: 5, status: "NOT_STARTED" as const, progress: 0 },
    { userId: 1, courseId: 6, status: "IN_PROGRESS" as const, progress: 35 },
  ];

  for (const e of studentExtraEnrollments) {
    try {
      await prisma.enrollment.create({ data: e });
    } catch {
      // skip duplicates
    }
  }
  console.log("✅ Arjun enrolled in 4 more courses (total 7)");

  // Enroll random new students in random courses
  const courseIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let enrollmentCount = 0;
  for (const studentId of createdStudents) {
    const numCourses = 2 + Math.floor(Math.random() * 5); // 2-6 courses each
    const shuffled = [...courseIds].sort(() => Math.random() - 0.5).slice(0, numCourses);
    for (const cid of shuffled) {
      const progress = Math.floor(Math.random() * 101);
      const status = progress === 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "NOT_STARTED";
      try {
        await prisma.enrollment.create({
          data: {
            userId: studentId,
            courseId: cid,
            status: status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED",
            progress,
          },
        });
        enrollmentCount++;
      } catch {
        // skip duplicates
      }
    }
  }
  console.log(`✅ ${enrollmentCount} enrollments created for new students`);

  // ══════════════════════════════════════════════════════
  // 3. LESSON PROGRESS for courses 2, 4 (Arjun)
  // ══════════════════════════════════════════════════════
  // Course 2 lessons: 6, 7, 8, 9, 10 — complete lesson 6
  // Course 4 has no lessons in seed, skip
  try {
    await prisma.lessonProgress.create({
      data: { userId: 1, lessonId: 6, completed: true, completedAt: new Date("2024-08-15") },
    });
  } catch {
    /* already exists */
  }
  console.log("✅ Additional lesson progress for Arjun");

  // ══════════════════════════════════════════════════════
  // 4. MORE QUIZ ATTEMPTS (varied scores for demo)
  // ══════════════════════════════════════════════════════
  // Add quiz attempts from new students on quiz 1
  let quizAttemptCount = 0;
  for (const sid of createdStudents.slice(0, 8)) {
    const score = 40 + Math.floor(Math.random() * 61); // 40-100
    try {
      await prisma.quizAttempt.create({
        data: {
          userId: sid,
          quizId: 1,
          score,
          answers: JSON.stringify([Math.floor(Math.random() * 4)]),
          timeSpent: 60 + Math.floor(Math.random() * 300),
        },
      });
      quizAttemptCount++;
    } catch {
      /* skip */
    }
  }
  console.log(`✅ ${quizAttemptCount} quiz attempts from new students`);

  // ══════════════════════════════════════════════════════
  // 5. ASSIGNMENT SUBMISSIONS (varied states)
  // ══════════════════════════════════════════════════════
  let submissionCount = 0;
  const statuses: Array<"PENDING" | "SUBMITTED" | "GRADED"> = ["PENDING", "SUBMITTED", "GRADED"];
  for (const sid of createdStudents.slice(0, 6)) {
    const status = statuses[Math.floor(Math.random() * 3)];
    const score = status === "GRADED" ? 5 + Math.floor(Math.random() * 6) : null;
    try {
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: 1,
          userId: sid,
          status,
          score,
          submittedAt: status !== "PENDING" ? new Date() : null,
          gradedAt: status === "GRADED" ? new Date() : null,
        },
      });
      submissionCount++;
    } catch {
      /* skip duplicates */
    }
  }
  console.log(`✅ ${submissionCount} assignment submissions`);

  // ══════════════════════════════════════════════════════
  // 6. MORE ACHIEVEMENTS (both student and teacher)
  // ══════════════════════════════════════════════════════
  const newAchievements = [
    { title: "Algorithm Wizard", description: "Complete all DSA course lessons", icon: "Zap", xpBonus: 300, forRole: "STUDENT" as const },
    { title: "Full Stack Hero", description: "Score 90%+ on Full Stack Web Dev quiz", icon: "Globe", xpBonus: 250, forRole: "STUDENT" as const },
    { title: "Learning Streak", description: "Maintain a 7-day streak", icon: "Flame", xpBonus: 100, forRole: "STUDENT" as const },
    { title: "Quiz Master", description: "Score 100% on 3 different quizzes", icon: "Target", xpBonus: 400, forRole: "STUDENT" as const },
    { title: "Community Star", description: "Earn 5000 XP total", icon: "Star", xpBonus: 200, forRole: "STUDENT" as const },
    { title: "Knowledge Sharer", description: "Complete 10 courses", icon: "Award", xpBonus: 500, forRole: "STUDENT" as const },
    { title: "Course Pioneer", description: "Create your first course", icon: "Rocket", xpBonus: 100, forRole: "TEACHER" as const },
    { title: "Popular Educator", description: "Have 50+ total enrollments", icon: "Users", xpBonus: 300, forRole: "TEACHER" as const },
    { title: "Content Creator", description: "Create 10 courses with lessons", icon: "PenTool", xpBonus: 400, forRole: "TEACHER" as const },
  ];

  let achCount = 0;
  for (const a of newAchievements) {
    try {
      await prisma.achievement.create({ data: a });
      achCount++;
    } catch {
      /* skip duplicates */
    }
  }

  // Award some achievements to Arjun (student)
  const arjunAchievements = await prisma.achievement.findMany({
    where: { forRole: "STUDENT", title: { in: ["Learning Streak", "Community Star"] } },
  });
  for (const ach of arjunAchievements) {
    try {
      await prisma.userAchievement.create({
        data: { userId: 1, achievementId: ach.id, earnedAt: new Date("2024-09-15") },
      });
    } catch {
      /* skip */
    }
  }

  // Award teacher achievements to Divya (teacher, id=2)
  const teacherAchs = await prisma.achievement.findMany({
    where: { forRole: "TEACHER", title: { in: ["Course Pioneer", "Popular Educator"] } },
  });
  for (const ach of teacherAchs) {
    try {
      await prisma.userAchievement.create({
        data: { userId: 2, achievementId: ach.id, earnedAt: new Date("2024-12-01") },
      });
    } catch {
      /* skip */
    }
  }
  console.log(`✅ ${achCount} new achievements created + awards given`);

  // ══════════════════════════════════════════════════════
  // 7. RICH NOTIFICATIONS (for all 3 demo accounts)
  // ══════════════════════════════════════════════════════
  const now = new Date();
  const notifications = [
    // Student notifications
    { userId: 1, type: "MODULE_UNLOCKED" as const, title: "Module Unlocked!", message: "You've unlocked 'Arrays & Linked Lists' in Advanced Data Structures! Keep going 💪", icon: "BookOpen", isRead: false, createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
    { userId: 1, type: "QUIZ_COMPLETED" as const, title: "Quiz Score: 80%", message: "Great job on the Java Fundamentals Quiz! You earned 160 XP.", icon: "Target", isRead: false, createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
    { userId: 1, type: "ACHIEVEMENT_EARNED" as const, title: "🏆 Learning Streak!", message: "You've maintained a 7-day learning streak! +100 XP bonus awarded.", icon: "Flame", isRead: false, createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    { userId: 1, type: "AI_RECOMMENDATION" as const, title: "Recommended for You", message: "Based on your progress, try 'Cloud Computing with AWS' — it matches your skill profile.", icon: "Sparkles", isRead: true, createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
    { userId: 1, type: "ENROLLMENT" as const, title: "Enrollment Confirmed", message: "You're now enrolled in 'SQL & Database Optimization'. Start your first lesson!", icon: "CheckCircle", isRead: true, createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
    { userId: 1, type: "ASSIGNMENT_GRADED" as const, title: "Assignment Graded!", message: "Your 'Java Interface Implementation' submission scored 8/10. Well done!", icon: "FileCheck", isRead: true, createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) },
    { userId: 1, type: "SYSTEM_ALERT" as const, title: "New Courses Available!", message: "Check out 3 new courses added this week: System Design, DevOps, and Cybersecurity.", icon: "Bell", isRead: true, createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },

    // Teacher notifications
    { userId: 2, type: "STUDENT_ENROLLED" as const, title: "New Enrollment!", message: "Priya Venkatesh just enrolled in your 'Java Programming Mastery' course.", icon: "UserPlus", isRead: false, createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) },
    { userId: 2, type: "STUDENT_ENROLLED" as const, title: "New Enrollment!", message: "Lakshmi Iyer enrolled in 'Advanced Data Structures'. Your students are growing!", icon: "UserPlus", isRead: false, createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
    { userId: 2, type: "ACHIEVEMENT_EARNED" as const, title: "🎉 Popular Educator!", message: "Your courses now have 50+ total enrollments. You earned 300 XP!", icon: "Award", isRead: false, createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
    { userId: 2, type: "COURSE_PUBLISHED" as const, title: "Course Published", message: "Your 'Machine Learning Foundations' course is now live and visible to students.", icon: "Globe", isRead: true, createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
    { userId: 2, type: "QUIZ_COMPLETED" as const, title: "Student Quiz Activity", message: "8 students attempted the Java Fundamentals Quiz today. Average score: 72%.", icon: "BarChart", isRead: true, createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },

    // Admin notifications
    { userId: 3, type: "MEMBER_JOINED" as const, title: "New Members!", message: "15 new students registered this week. Total platform users: 19.", icon: "Users", isRead: false, createdAt: new Date(now.getTime() - 30 * 60 * 1000) },
    { userId: 3, type: "SYSTEM_ALERT" as const, title: "Platform Milestone", message: "SkillSync has crossed 50 total course enrollments! The community is thriving.", icon: "TrendingUp", isRead: false, createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
    { userId: 3, type: "COURSE_PUBLISHED" as const, title: "New Course Alert", message: "Divya Narayanan published 'Machine Learning Foundations' — 5 enrollments already.", icon: "BookOpen", isRead: true, createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    { userId: 3, type: "SYSTEM_ALERT" as const, title: "Weekly Report Ready", message: "This week: 15 signups, 42 enrollments, avg quiz score 72%. View full report.", icon: "FileText", isRead: true, createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
  ];

  let notifCount = 0;
  for (const n of notifications) {
    await prisma.notification.create({ data: n });
    notifCount++;
  }
  console.log(`✅ ${notifCount} notifications created`);

  // ══════════════════════════════════════════════════════
  // 8. DAILY ACTIVITY (30 days for student dashboard chart)
  // ══════════════════════════════════════════════════════
  let activityCount = 0;
  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    // Skip weekends with lower probability
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (isWeekend && Math.random() < 0.4) continue;

    const xp = 30 + Math.floor(Math.random() * 220);
    const lessonsCompleted = Math.floor(Math.random() * 5);

    try {
      await prisma.dailyActivity.upsert({
        where: { userId_date: { userId: 1, date } },
        create: { userId: 1, date, xp, lessons: lessonsCompleted },
        update: { xp: { increment: xp }, lessons: { increment: lessonsCompleted } },
      });
      activityCount++;
    } catch {
      /* skip */
    }
  }
  console.log(`✅ ${activityCount} daily activity records for Arjun`);

  // ══════════════════════════════════════════════════════
  // 9. ADDITIONAL QUIZZES for courses that don't have quizzes
  // ══════════════════════════════════════════════════════
  const additionalQuizzes = [
    {
      courseId: 2,
      title: "Data Structures Assessment",
      difficulty: "HARD" as const,
      timeLimit: 900,
      xpReward: 300,
      questions: [
        { text: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correctIndex: 1, explanation: "Binary search divides the search interval in half each step, giving O(log n)." },
        { text: "Which data structure uses FIFO principle?", options: ["Stack", "Queue", "Array", "Tree"], correctIndex: 1, explanation: "Queue follows First-In-First-Out (FIFO) principle." },
        { text: "What is the worst-case height of an unbalanced BST with n nodes?", options: ["O(log n)", "O(n)", "O(n²)", "O(1)"], correctIndex: 1, explanation: "An unbalanced BST can degrade to a linked list, giving O(n) height." },
        { text: "Which traversal visits the root node first?", options: ["Inorder", "Preorder", "Postorder", "Level-order"], correctIndex: 1, explanation: "Preorder traversal visits: Root → Left → Right." },
      ],
    },
    {
      courseId: 3,
      title: "Full Stack Web Dev Quiz",
      difficulty: "MEDIUM" as const,
      timeLimit: 720,
      xpReward: 250,
      questions: [
        { text: "What hook replaces componentDidMount in React?", options: ["useState", "useEffect", "useContext", "useMemo"], correctIndex: 1, explanation: "useEffect with an empty dependency array [] replaces componentDidMount." },
        { text: "What does 'npm run build' do in Next.js?", options: ["Starts dev server", "Runs tests", "Creates production bundle", "Installs packages"], correctIndex: 2, explanation: "npm run build creates an optimized production build." },
        { text: "Which HTTP method is idempotent?", options: ["POST", "PATCH", "PUT", "None"], correctIndex: 2, explanation: "PUT is idempotent — repeating the same request produces the same result." },
      ],
    },
    {
      courseId: 5,
      title: "ML Foundations Quiz",
      difficulty: "HARD" as const,
      timeLimit: 900,
      xpReward: 350,
      questions: [
        { text: "Which algorithm is used for classification problems?", options: ["Linear Regression", "K-Means", "Logistic Regression", "PCA"], correctIndex: 2, explanation: "Logistic Regression outputs probabilities for classification despite its name." },
        { text: "What does 'overfitting' mean?", options: ["Model is too simple", "Model memorizes training data", "Model has high bias", "Model ignores features"], correctIndex: 1, explanation: "Overfitting means the model learns noise in training data, performing poorly on unseen data." },
        { text: "What is the purpose of a validation set?", options: ["Train the model", "Tune hyperparameters", "Final evaluation", "Data augmentation"], correctIndex: 1, explanation: "The validation set is used to tune hyperparameters without biasing the test set evaluation." },
      ],
    },
  ];

  let quizCount = 0;
  for (const q of additionalQuizzes) {
    try {
      await prisma.quiz.create({
        data: {
          courseId: q.courseId,
          title: q.title,
          difficulty: q.difficulty,
          timeLimit: q.timeLimit,
          xpReward: q.xpReward,
          questions: {
            create: q.questions.map((qn, idx) => ({
              text: qn.text,
              options: JSON.stringify(qn.options),
              correctIndex: qn.correctIndex,
              explanation: qn.explanation,
              orderIndex: idx + 1,
            })),
          },
        },
      });
      quizCount++;
    } catch {
      /* skip */
    }
  }
  console.log(`✅ ${quizCount} additional quizzes with questions created`);

  // ══════════════════════════════════════════════════════
  // 10. ADDITIONAL ASSIGNMENTS for more courses
  // ══════════════════════════════════════════════════════
  const additionalAssignments = [
    { courseId: 2, title: "Implement a Binary Search Tree", description: "Build a BST with insert, delete, and search operations. Include traversal methods.", dueDate: new Date("2025-05-15"), maxScore: 15, xpReward: 200 },
    { courseId: 3, title: "Build a REST API with Express", description: "Create a complete CRUD API for a task management system with authentication.", dueDate: new Date("2025-05-20"), maxScore: 20, xpReward: 250 },
    { courseId: 5, title: "Linear Regression from Scratch", description: "Implement gradient descent for linear regression using only NumPy. Visualize results.", dueDate: new Date("2025-06-01"), maxScore: 15, xpReward: 200 },
    { courseId: 9, title: "Data Analysis with Pandas", description: "Analyze a provided CSV dataset. Create charts, compute statistics, and present insights.", dueDate: new Date("2025-05-25"), maxScore: 10, xpReward: 150 },
  ];

  let assignCount = 0;
  for (const a of additionalAssignments) {
    try {
      await prisma.assignment.create({ data: a });
      assignCount++;
    } catch {
      /* skip */
    }
  }
  console.log(`✅ ${assignCount} additional assignments created`);

  // ══════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════
  const totalUsers = await prisma.user.count();
  const totalEnrollments = await prisma.enrollment.count();
  const totalQuizzes = await prisma.quiz.count();
  const totalNotifications = await prisma.notification.count();

  console.log("\n🎉 Rich demo seeding complete!");
  console.log(`   📊 Total users: ${totalUsers}`);
  console.log(`   📚 Total enrollments: ${totalEnrollments}`);
  console.log(`   📝 Total quizzes: ${totalQuizzes}`);
  console.log(`   🔔 Total notifications: ${totalNotifications}`);
  console.log("\n   Login as:");
  console.log("   • Student: student@demo.com / demo123");
  console.log("   • Teacher: teacher@demo.com / demo123");
  console.log("   • Admin:   admin@demo.com / demo123");
}

main()
  .catch((e) => {
    console.error("❌ Demo seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
