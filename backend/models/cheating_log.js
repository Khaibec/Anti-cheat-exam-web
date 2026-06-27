const mongoose = require("mongoose");

const cheatingLogSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    trim: true,
  },
  examId: {
    type: String,
    required: true,
    trim: true,
  },
  cheatingType: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

cheatingLogSchema.index({ studentId: 1, examId: 1, cheatingType: 1, createdAt: -1 });

const CheatingLog = mongoose.model("CheatingLog", cheatingLogSchema);

module.exports = CheatingLog;
