export interface Question {
  title: string;
  options: Record<string, string>;
}

export interface Exam {
  questions: Question[];
  questionCount: number;
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  questionOrder?: number[];
  shuffleQuestions?: boolean;
  maxAttempts?: number;
  attemptsUsed?: number;
  attemptsRemaining?: number;
}

export interface AssignedExam {
  _id: string;
  questionCount: number;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: "pending" | "submitted" | "graded" | "completed";
  maxAttempts?: number;
  attemptsUsed?: number;
  attemptsRemaining?: number;
  score?: number;
  total?: number;
  percentage?: number;
  gradeOutOf10?: number;
  autoGradeOutOf10?: number;
}

export interface ExamResultBreakdown {
  displayIndex: number;
  originalIndex: number;
  questionTitle: string;
  studentAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface ExamAttemptSummary {
  attemptNumber: number;
  score: number;
  total: number;
  percentage: number;
  gradeOutOf10: number;
  submittedAt: string;
}

export interface ExamResult {
  examId: string;
  examName: string;
  score: number;
  total: number;
  percentage: number;
  gradeOutOf10: number;
  autoGradeOutOf10: number | null;
  finalGradeOutOf10: number | null;
  adjustedGradeOutOf10: number | null;
  reviewNote?: string | null;
  breakdown: ExamResultBreakdown[];
  submittedAt: string;
  attemptNumber: number;
  maxAttempts: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  attempts?: ExamAttemptSummary[];
}

export interface SubmitExamResult {
  examId: string;
  examName: string;
  score: number;
  total: number;
  percentage: number;
  gradeOutOf10: number;
  submittedAt: string;
  attemptNumber: number;
  maxAttempts: number;
  attemptsUsed: number;
  attemptsRemaining: number;
}
