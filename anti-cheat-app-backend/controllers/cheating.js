const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { handleError } = require("../utils/handleResponse");
const CheatingLog = require("../models/cheating_log");

const UPLOAD_DIR = path.join(__dirname, "../uploads/cheating-logs");
const RATE_LIMIT_MS = 5000;

const ALLOWED_CHEATING_TYPES = [
  "looking_left",
  "looking_right",
  "no_face_detected",
  "multiple_faces",
  "tab_switch",
];

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const studentId = req.student?._id || "unknown";
    const { cheatingType } = req.body;
    const dir = path.join(UPLOAD_DIR, studentId, cheatingType || "unknown");

    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, _file, cb) => {
    const { examId } = req.body;
    cb(null, `${Date.now()}_${examId || "exam"}.jpg`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

const removeUploadedFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
};

const buildImageUrl = (studentId, cheatingType, filename) =>
  `/api/cheating-logs/${studentId}/${cheatingType}/${filename}`;

exports.uploadCheatingImage = upload.single("image");

exports.logCheating = (req, res) => {
  const { examId, cheatingType } = req.body;
  const studentId = req.student._id;

  if (!examId || !cheatingType) {
    removeUploadedFile(req.file?.path);
    return handleError(res, "examId and cheatingType are required!", 400);
  }

  if (!ALLOWED_CHEATING_TYPES.includes(cheatingType)) {
    removeUploadedFile(req.file?.path);
    return handleError(res, "Invalid cheatingType!", 400);
  }

  if (!req.file) {
    return handleError(res, "Image is required!", 400);
  }

  const rateLimitSince = new Date(Date.now() - RATE_LIMIT_MS);

  CheatingLog.findOne({
    studentId,
    examId,
    cheatingType,
    createdAt: { $gte: rateLimitSince },
  })
    .sort({ createdAt: -1 })
    .exec((err, recentLog) => {
      if (err) {
        removeUploadedFile(req.file.path);
        return handleError(res, "Database error, please try again!", 400);
      }

      if (recentLog) {
        removeUploadedFile(req.file.path);
        return res.json({
          skipped: true,
          message: "Cheating log rate limited (max 1 per 5 seconds per type).",
        });
      }

      const imageUrl = buildImageUrl(studentId, cheatingType, req.file.filename);
      const log = new CheatingLog({
        studentId,
        examId,
        cheatingType,
        imageUrl,
      });

      log.save((saveErr, savedLog) => {
        if (saveErr) {
          removeUploadedFile(req.file.path);
          return handleError(res, "Error saving cheating log!", 400);
        }

        return res.json({
          skipped: false,
          log: {
            id: savedLog._id,
            studentId: savedLog.studentId,
            examId: savedLog.examId,
            cheatingType: savedLog.cheatingType,
            imageUrl: savedLog.imageUrl,
            createdAt: savedLog.createdAt,
          },
        });
      });
    });
};
