const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
  },
  fname: {
    type: String,
    required: true,
    maxlength: 32,
    trim: true,
  },
  lname: {
    type: String,
    maxlength: 32,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  managedStudents: {
    type: [String],
    default: [],
  },
});

adminSchema.methods = {
  authenticate: function (plainPassword) {
    return plainPassword === this.password;
  },
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
