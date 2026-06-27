const { handleError } = require("../utils/handleResponse");
const Exam = require("../models/exam");
const {
  buildQuestionOrder,
  getAttemptSummary,
} = require("../utils/grading");

exports.getExamById = (req, res, next, id) => {
  Exam.findById(id, (err, exam) => {
    if (err) return handleError(res, "Database error, please try again!", 400);

    if (!exam) return handleError(res, "Exam does not exist!", 400);

    req.exam = exam;
    next();
  });
};

exports.getAssignedExamList = (req, res) => {
  const assignedExams = req.student.assignedExams;

  const assignedExamIds = assignedExams.map((exam) =>
    typeof exam === "string" ? exam : exam.examId
  );

  Exam.find({ _id: { $in: assignedExamIds } })
    .lean()
    .exec((err, exams) => {
      if (err || !exams)
        return handleError(res, "DB Error, cannot get assigned Exams.");

      exams.forEach((examDoc, i) => {
        const examId = assignedExamIds[i];
        const summary = getAttemptSummary(
          req.student.submittedExams?.[examId],
          examDoc.maxAttempts || 1
        );

        exams[i].questions = undefined;
        exams[i].answerKeys = undefined;
        exams[i].maxAttempts = summary.maxAttempts;
        exams[i].attemptsUsed = summary.attemptsUsed;
        exams[i].attemptsRemaining = summary.attemptsRemaining;

        if (summary.latest?.score !== null && summary.latest?.score !== undefined) {
          exams[i].score = summary.best?.score ?? summary.latest.score;
          exams[i].total = summary.best?.total ?? summary.latest.total;
          exams[i].percentage =
            summary.best?.percentage ?? summary.latest.percentage;
          exams[i].gradeOutOf10 = summary.finalGradeOutOf10;
          exams[i].autoGradeOutOf10 = summary.autoGradeOutOf10;

          exams[i].status =
            summary.attemptsRemaining > 0 ? "graded" : "completed";
        } else if (summary.attemptsUsed > 0) {
          exams[i].status = "submitted";
        } else {
          exams[i].status =
            typeof assignedExams[i] === "object"
              ? assignedExams[i].status || "pending"
              : "pending";
        }
      });

      return res.json({ exams });
    });
};

exports.getExam = (req, res) => {
  if (!req.exam) return handleError(res, "Cannot get Exam, DB Error!");

  // Block access if exam not yet started or already expired
  try {
    const now = new Date();
    const start = new Date(req.exam.startDate);
    const end = new Date(req.exam.endDate);

    if (now < start) {
      return handleError(res, "Exam has not started yet.", 400);
    }

    if (now > end) {
      return handleError(res, "Exam has expired.", 400);
    }
  } catch (e) {
    // If date parsing fails, continue — existing logic will handle other errors
  }

  const examId = req.exam._id;
  const summary = getAttemptSummary(
    req.student.submittedExams?.[examId],
    req.exam.maxAttempts || 1
  );

  if (summary.attemptsRemaining <= 0) {
    return handleError(res, "No attempts remaining!", 400);
  }

  const exam = req.exam.toObject();
  const questionOrder = buildQuestionOrder(
    exam.questions.length,
    exam.shuffleQuestions !== false
  );
  const shuffledQuestions = questionOrder.map((index) => exam.questions[index]);

  exam.questions = shuffledQuestions;
  exam.questionOrder = questionOrder;
  exam.maxAttempts = summary.maxAttempts;
  exam.attemptsUsed = summary.attemptsUsed;
  exam.attemptsRemaining = summary.attemptsRemaining;
  delete exam.answerKeys;

  return res.json(exam);
};

exports.createExam = (req, res) => {
  const exam = new Exam({ ...req.body });

  exam.save().then((savedExam) => {
    if (!savedExam) handleError(res, "Error creating Exam!");

    return res.json(savedExam);
  });
};
