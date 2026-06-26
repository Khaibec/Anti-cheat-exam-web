const { handleError, handleSuccess } = require("../utils/handleResponse");
const { check, validationResult } = require("express-validator");
const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");
const Student = require("../models/student");
const Admin = require("../models/admin");

exports.login = (req, res) => {
  const errors = validationResult(req);
  const { id, password } = req.body;

  if (!errors.isEmpty()) {
    return res.json({
      err: errors.errors[0].msg,
    });
  }

  Student.findById(id, (err, student) => {
    if (err) return handleError(res, "Database error, please try again!", 400);

    if (student) {
      if (!student.authenticate(password))
        return handleError(res, "Incorrect username or password!", 401);

      const { _id, fname, lname, assignedExams } = student;

      const token = jwt.sign(
        { id: _id, role: "student" },
        process.env.JWT_SECRET,
        { algorithm: "HS256" }
      );

      return res.json({
        id: _id,
        fname,
        lname,
        role: "student",
        assignedExams,
        token,
      });
    }

    Admin.findById(id, (adminErr, admin) => {
      if (adminErr)
        return handleError(res, "Database error, please try again!", 400);

      if (!admin) return handleError(res, "User does not exist!", 400);

      if (!admin.authenticate(password))
        return handleError(res, "Incorrect username or password!", 401);

      const { _id, fname, lname } = admin;

      const token = jwt.sign(
        { id: _id, role: "admin" },
        process.env.JWT_SECRET,
        { algorithm: "HS256" }
      );

      return res.json({
        id: _id,
        fname,
        lname,
        role: "admin",
        token,
      });
    });
  });
};

exports.isSignedIn = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});

exports.isAuthenticated = (req, res, next) => {
  const isAuthenticated =
    req.student &&
    req.auth &&
    req.student._id.toString() === req.auth.id &&
    req.auth.role === "student";

  if (!isAuthenticated) {
    return handleError(res, "Access denied, please login!", 403);
  }

  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.auth || req.auth.role !== "admin") {
    return handleError(res, "Access denied, admin only!", 403);
  }

  next();
};
