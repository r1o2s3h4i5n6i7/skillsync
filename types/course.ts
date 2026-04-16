// ─── Course Domain Types ──────────────────────────────
// Used by both API routes (server) and React components (client)

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type LessonType = "VIDEO" | "INTERACTIVE" | "TEXT" | "QUIZ";
export type CourseStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type AssignmentStatus = "PENDING" | "SUBMITTED" | "GRADED";

// ─── Lesson Content (JSON stored in DB) ──────────────

export interface LessonContentParagraph {
  content: string;
  reference_web?: string;
  animation?: string;
}

export interface LessonContent {
  text: LessonContentParagraph[];
  youtubeLinks?: string[];
  referenceLinks?: string[];
  animation?: string;
}

// ─── List Items (used by course catalog, dashboard, context) ──

export interface CourseListItem {
  id: number;
  title: string;
  description: string;
  subject: string;
  difficulty: Difficulty;
  duration: string;
  image: string;
  rating: number;
  instructor: string;
  instructorId: number;
  enrolled: number;
  lessons: number;
  tags: string[];
  progress: number;
  status: CourseStatus;
}

export interface LessonListItem {
  id: number;
  courseId: number;
  title: string;
  duration: string;
  type: LessonType;
  xpReward: number;
  orderIndex: number;
  completed: boolean;
  content: LessonContent | null;
}

export interface QuestionData {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizListItem {
  id: number;
  courseId: number;
  title: string;
  difficulty: Difficulty;
  timeLimit: number;
  xpReward: number;
  questions: QuestionData[];
  attempted: boolean;
  lastScore: number | null;
}

export interface AssignmentListItem {
  id: number;
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  xpReward: number;
  status: AssignmentStatus;
  score: number | null;
  fileUrl?: string | null;
}

// ─── API Payloads ────────────────────────────────────

export interface CreateLessonPayload {
  title: string;
  duration: string;
  type?: LessonType;
  xpReward?: number;
  orderIndex?: number;
  content?: LessonContent | null;
}

export interface CreateQuizPayload {
  title: string;
  difficulty: Difficulty;
  timeLimit: number;
  xpReward: number;
  questions: Omit<QuestionData, "id">[];
}

export interface CreateAssignmentPayload {
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  xpReward: number;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  subject: string;
  difficulty: Difficulty;
  duration: string;
  image?: string;
  tags?: string[];
  lessons?: CreateLessonPayload[];
  quizzes?: CreateQuizPayload[];
  assignments?: CreateAssignmentPayload[];
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

// ─── API Responses ───────────────────────────────────

export interface CoursesListResponse {
  courses: CourseListItem[];
}

export interface CourseDetailResponse {
  course: CourseListItem;
  lessons: LessonListItem[];
  quizzes: QuizListItem[];
  assignments: AssignmentListItem[];
}

export interface LessonsListResponse {
  lessons: LessonListItem[];
}

export interface QuizzesListResponse {
  quizzes: QuizListItem[];
}

export interface AssignmentsListResponse {
  assignments: AssignmentListItem[];
}
