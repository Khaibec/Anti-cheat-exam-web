const { handleError } = require("../utils/handleResponse");
const Student = require("../models/student");
const Exam = require("../models/exam");
const {
  gradeExam,
  isValidQuestionOrder,
  getSubmissionRecord,
  getAttemptSummary,
  getLatestAttempt,
} = require("../utils/grading");

exports.getStudentByID = (req, res, next, id) => {
  Student.findById(id, (err, student) => {
    if (err || !student) return handleError(res, "Student not found!", 400);
    req.student = student;
    next();
  });
};

const updateAssignedExamStatus = (student, examId, status) => {
  student.assignedExams = student.assignedExams.map((item) => {
    const id = typeof item === "string" ? item : item.examId;
    if (id === examId) return { examId, status };
    return item;
  });
};

exports.submitExam = (req, res) => {
  const { examId, answers, questionOrder } = req.body;
  const student = req.student;

  Exam.findById(examId, (err, exam) => {
    if (err || !exam) return handleError(res, "Exam not found!", 400);

    const maxAttempts = exam.maxAttempts || 1;
    const summary = getAttemptSummary(
      student.submittedExams?.[examId],
      maxAttempts
    );

    if (summary.attemptsRemaining <= 0) {
      return handleError(res, "No attempts remaining!", 400);
    }

    const expectedCount = exam.questionCount;

    if (!answers || answers.length !== expectedCount) {
      return handleError(res, "Invalid answers!", 400);
    }

    const order =
      questionOrder || Array.from({ length: expectedCount }, (_, i) => i);

    if (!isValidQuestionOrder(order, expectedCount)) {
      return handleError(res, "Invalid question order!", 400);
    }

    const grading = gradeExam(exam, answers, order);
    const submittedAt = new Date().toISOString();
    const record = getSubmissionRecord(student.submittedExams?.[examId]);
    const attemptNumber = record.attempts.length + 1;

    record.attempts.push({
      answers,
      questionOrder: order,
      ...grading,
      submittedAt,
      attemptNumber,
    });

    student.submittedExams[examId] = record;

    const updatedSummary = getAttemptSummary(record, maxAttempts);
    const status =
      updatedSummary.attemptsRemaining > 0 ? "graded" : "completed";

    updateAssignedExamStatus(student, examId, status);
    student.markModified("submittedExams");
    student.markModified("assignedExams");

    student.save((saveErr) => {
      if (saveErr) return handleError(res, "Error submitting Exam!", 400);

      return res.json({
        examId,
        examName: exam.name,
        ...grading,
        submittedAt,
        attemptNumber,
        maxAttempts,
        attemptsUsed: updatedSummary.attemptsUsed,
        attemptsRemaining: updatedSummary.attemptsRemaining,
      });
    });
  });
};

exports.getExamResult = (req, res) => {
  const examId = req.params.examId;
  const attemptParam = req.query.attempt;
  const record = getSubmissionRecord(req.student.submittedExams?.[examId]);

  if (!record.attempts.length) {
    return handleError(res, "No submission found!", 404);
  }

  let attempt = getLatestAttempt(record);

  if (attemptParam !== undefined) {
    const attemptNumber = Number(attemptParam);
    attempt = record.attempts.find((item) => item.attemptNumber === attemptNumber);
  }

  if (!attempt || attempt.score === null || attempt.score === undefined) {
    return handleError(res, "Result not available for this submission!", 400);
  }

  const summary = getAttemptSummary(record, req.exam.maxAttempts || 1);

  return res.json({
    examId,
    examName: req.exam.name,
    score: attempt.score,
    total: attempt.total,
    percentage: attempt.percentage,
    gradeOutOf10: attempt.gradeOutOf10,
    autoGradeOutOf10: summary.autoGradeOutOf10,
    finalGradeOutOf10: summary.finalGradeOutOf10,
    adjustedGradeOutOf10: record.adjustedGradeOutOf10,
    reviewNote: record.reviewNote,
    breakdown: attempt.breakdown,
    submittedAt: attempt.submittedAt,
    attemptNumber: attempt.attemptNumber,
    maxAttempts: summary.maxAttempts,
    attemptsUsed: summary.attemptsUsed,
    attemptsRemaining: summary.attemptsRemaining,
    attempts: record.attempts.map((item) => ({
      attemptNumber: item.attemptNumber,
      score: item.score,
      total: item.total,
      percentage: item.percentage,
      gradeOutOf10: item.gradeOutOf10,
      submittedAt: item.submittedAt,
    })),
  });
};
