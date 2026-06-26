import { BASE_URL } from "../../constants";

const authHeaders = (token: string) => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export interface AdminStudent {
  _id: string;
  fname: string;
  lname: string;
  assignedExams: string[] | { examId: string; status?: string }[];
  submissions?: {
    examId: string;
    attemptNumber?: number;
    score?: number;
    total?: number;
    percentage?: number;
    gradeOutOf10?: number;
    autoGradeOutOf10?: number;
    finalGradeOutOf10?: number;
    submittedAt?: string;
  }[];
}

export interface ExamQuestion {
  title: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
}

export interface AdminExam {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  questionCount: number;
  shuffleQuestions?: boolean;
  maxAttempts?: number;
  questions?: ExamQuestion[];
  answerKeys?: string[];
}

export interface StudentPayload {
  _id?: string;
  fname: string;
  lname?: string;
  password?: string;
  assignedExams?: string[];
}

export interface ExamPayload {
  _id?: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  questions: ExamQuestion[];
  questionCount: number;
  answerKeys: string[];
  shuffleQuestions?: boolean;
  maxAttempts?: number;
}

export interface AdminStats {
  managedStudentsCount: number;
  totalSubmissions: number;
  averagePercentage: number;
  examStats: {
    examId: string;
    examName: string;
    submissionCount: number;
    averagePercentage: number;
  }[];
  submissions: {
    studentId: string;
    studentName: string;
    examId: string;
    examName: string;
    attemptNumber?: number;
    score: number;
    total: number;
    percentage: number;
    gradeOutOf10?: number;
    autoGradeOutOf10?: number;
    finalGradeOutOf10?: number;
    submittedAt?: string;
  }[];
}

export interface CheatingLogItem {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export interface CheatingTypeSummary {
  cheatingType: string;
  label: string;
  count: number;
  logs: CheatingLogItem[];
}

export interface ExamReviewData {
  student: {
    _id: string;
    fname: string;
    lname: string;
  };
  exam: {
    _id: string;
    name: string;
  };
  submission: {
    bestAttempt: Record<string, unknown>;
    attempts: Record<string, unknown>[];
    autoGradeOutOf10: number | null;
    finalGradeOutOf10: number | null;
    adjustedGradeOutOf10: number | null;
    reviewNote: string | null;
    reviewedAt: string | null;
    reviewedBy: string | null;
  };
  cheatingSummary: CheatingTypeSummary[];
  totalCheatingEvents: number;
}

const parseResponse = async (res: Response) => {
  const data = await res.json();

  if (!res.ok || data.err) {
    throw new Error(data.err || "Request failed!");
  }

  return data;
};

const getStudents = async (token: string): Promise<AdminStudent[]> => {
  const res = await fetch(`${BASE_URL}/admin/students`, {
    headers: authHeaders(token),
  });

  const data = await parseResponse(res);
  return data.students;
};

const createStudent = async (token: string, payload: StudentPayload) => {
  const res = await fetch(`${BASE_URL}/admin/students`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
};

const updateStudent = async (
  token: string,
  studentId: string,
  payload: StudentPayload
) => {
  const res = await fetch(`${BASE_URL}/admin/students/${studentId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
};

const deleteStudent = async (token: string, studentId: string) => {
  const res = await fetch(`${BASE_URL}/admin/students/${studentId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  return parseResponse(res);
};

const getExams = async (token: string): Promise<AdminExam[]> => {
  const res = await fetch(`${BASE_URL}/admin/exams`, {
    headers: authHeaders(token),
  });

  const data = await parseResponse(res);
  return data.exams;
};

const getExam = async (token: string, examId: string): Promise<AdminExam> => {
  const res = await fetch(`${BASE_URL}/admin/exams/${examId}`, {
    headers: authHeaders(token),
  });

  return parseResponse(res);
};

const createExam = async (token: string, payload: ExamPayload) => {
  const res = await fetch(`${BASE_URL}/admin/exams`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
};

const updateExam = async (
  token: string,
  examId: string,
  payload: Partial<ExamPayload>
) => {
  const res = await fetch(`${BASE_URL}/admin/exams/${examId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
};

const deleteExam = async (token: string, examId: string) => {
  const res = await fetch(`${BASE_URL}/admin/exams/${examId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  return parseResponse(res);
};

const getStats = async (token: string): Promise<AdminStats> => {
  const res = await fetch(`${BASE_URL}/admin/stats`, {
    headers: authHeaders(token),
  });

  return parseResponse(res);
};

const getExamReview = async (
  token: string,
  studentId: string,
  examId: string
): Promise<ExamReviewData> => {
  const res = await fetch(
    `${BASE_URL}/admin/students/${studentId}/exams/${examId}/review`,
    {
      headers: authHeaders(token),
    }
  );

  return parseResponse(res);
};

const updateExamGrade = async (
  token: string,
  studentId: string,
  examId: string,
  payload: { adjustedGradeOutOf10: number; reviewNote?: string }
) => {
  const res = await fetch(
    `${BASE_URL}/admin/students/${studentId}/exams/${examId}/grade`,
    {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }
  );

  return parseResponse(res);
};

export {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getStats,
  getExamReview,
  updateExamGrade,
};
