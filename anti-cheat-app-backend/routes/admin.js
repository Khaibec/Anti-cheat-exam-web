const express = require("express");
const { isSignedIn, isAdmin } = require("../controllers/auth");
const { getStudentByID, getExamResult } = require("../controllers/student");
const { getExamById } = require("../controllers/exam");
const {
  login,
  loadAdmin,
  ensureManagedStudent,
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getStats,
  getExamReview,
  updateExamGrade,
} = require("../controllers/admin");

const router = express.Router();

router.param("studentId", getStudentByID);
router.param("examId", getExamById);

router.post("/admin/login", login);

router.use("/admin", isSignedIn, isAdmin, loadAdmin);

router.get("/admin/students", getAllStudents);
router.post("/admin/students", createStudent);
router.get("/admin/stats", getStats);
router.get("/admin/students/:studentId", ensureManagedStudent, getStudent);
router.put("/admin/students/:studentId", ensureManagedStudent, updateStudent);
router.delete("/admin/students/:studentId", ensureManagedStudent, deleteStudent);

router.get(
  "/admin/students/:studentId/exams/:examId/review",
  ensureManagedStudent,
  getExamReview
);
router.put(
  "/admin/students/:studentId/exams/:examId/grade",
  ensureManagedStudent,
  updateExamGrade
);

router.get("/admin/exams", getAllExams);
router.post("/admin/exams", createExam);
router.get("/admin/exams/:examId", getExam);
router.put("/admin/exams/:examId", updateExam);
router.delete("/admin/exams/:examId", deleteExam);

module.exports = router;
