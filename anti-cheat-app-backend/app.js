require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const examRoutes = require("./routes/exam");
const studentRoutes = require("./routes/student");

const app = express();

const PORT = process.env.PORT || 8000;
const DB_URL = process.env.DB_URL;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// Check DB URL
console.log("DB_URL:", DB_URL);

// MongoDB Connection
mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch((err) => {
    console.log("DB CONNECTION ERR:", err);
  });

// Test API
app.get("/api/hello", (req, res) => {
  res.send("Hello");
});

// Routes
app.use("/api", authRoutes);
app.use("/api", examRoutes);
app.use("/api", studentRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});