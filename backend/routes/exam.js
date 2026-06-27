const express = require("express");
const { check, validationResult } = require("express-validator");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");

const router = express.Router();

const {
  getExamById,
  getExam,
  getAssignedExamList,
} = require("../controllers/exam");

const { getStudentByID, getExamResult } = require("../controllers/student");

router.param("studentId", getStudentByID);
router.param("examId", getExamById);

router.get("/:studentId/exam/:examId", isSignedIn, isAuthenticated, getExam);

router.get(
  "/:studentId/exam/:examId/result",
  isSignedIn,
  isAuthenticated,
  getExamResult
);

router.get(
  "/:studentId/assignedExams/all",
  isSignedIn,
  isAuthenticated,
  getAssignedExamList
);

module.exports = router;
