const express = require("express");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getStudentByID } = require("../controllers/student");
const { handleError } = require("../utils/handleResponse");
const {
  uploadCheatingImage,
  logCheating,
} = require("../controllers/cheating");

const router = express.Router();

router.param("studentId", getStudentByID);

router.post(
  "/cheatingLog/:studentId",
  isSignedIn,
  isAuthenticated,
  (req, res, next) => {
    uploadCheatingImage(req, res, (err) => {
      if (err) return handleError(res, err.message || "Upload failed!", 400);
      next();
    });
  },
  logCheating
);

module.exports = router;
