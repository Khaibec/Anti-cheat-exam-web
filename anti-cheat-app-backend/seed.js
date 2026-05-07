require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./models/student");
const Exam = require("./models/exam");

const DB_URL = process.env.DB_URL;

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("DB Connected");

    try {
      // Clear existing data
      await Student.deleteMany({});
      await Exam.deleteMany({});
      console.log("✅ Cleared existing data");

      // ======== EXAMS DATA ========
      const exams = [
        {
          _id: "exam001",
          name: "Math Test 1",
          startDate: "2024-05-10",
          endDate: "2024-05-15",
          duration: 60,
          questions: [
            {
              title: "What is 2 + 2?",
              options: {
                a: "3",
                b: "4",
                c: "5",
                d: "6",
              },
            },
            {
              title: "What is the square root of 16?",
              options: {
                a: "2",
                b: "3",
                c: "4",
                d: "5",
              },
            },
            {
              title: "What is 10 × 5?",
              options: {
                a: "40",
                b: "50",
                c: "60",
                d: "70",
              },
            },
          ],
          questionCount: 3,
          answerKeys: ["b", "c", "b"],
        },
        {
          _id: "exam002",
          name: "English Test 1",
          startDate: "2024-05-12",
          endDate: "2024-05-17",
          duration: 45,
          questions: [
            {
              title: "Which is the correct spelling?",
              options: {
                a: "occassion",
                b: "occasion",
                c: "ocasion",
                d: "occassoin",
              },
            },
            {
              title: "Choose the correct sentence:",
              options: {
                a: "She go to school",
                b: "She goes to school",
                c: "She going to school",
                d: "She gone to school",
              },
            },
            {
              title: "What is the antonym of 'happy'?",
              options: {
                a: "sad",
                b: "joyful",
                c: "cheerful",
                d: "delighted",
              },
            },
          ],
          questionCount: 3,
          answerKeys: ["b", "b", "a"],
        },
        {
          _id: "exam003",
          name: "Science Test 1",
          startDate: "2024-05-14",
          endDate: "2024-05-20",
          duration: 90,
          questions: [
            {
              title: "What is the chemical formula for water?",
              options: {
                a: "H2O",
                b: "O2H",
                c: "H2O2",
                d: "OH2",
              },
            },
            {
              title: "How many planets are in our solar system?",
              options: {
                a: "7",
                b: "8",
                c: "9",
                d: "10",
              },
            },
            {
              title: "What is the speed of light?",
              options: {
                a: "300,000 km/s",
                b: "150,000 km/s",
                c: "500,000 km/s",
                d: "100,000 km/s",
              },
            },
          ],
          questionCount: 3,
          answerKeys: ["a", "b", "a"],
        },
      ];

      // ======== STUDENTS DATA ========
      const students = [
        {
          _id: "1234567890",
          fname: "Khải",
          lname: "Phùng",
          password: "password123",
          assignedExams: ["exam001", "exam002"],
          submittedExams: {},
        },
        {
          _id: "1234567891",
          fname: "Ngọc",
          lname: "Trần",
          password: "password123",
          assignedExams: ["exam002", "exam003"],
          submittedExams: {},
        },
        {
          _id: "0123456789",
          fname: "Minh",
          lname: "Lê",
          password: "password123",
          assignedExams: ["exam001", "exam003"],
          submittedExams: {},
        },
      ];

      // Insert exams
      await Exam.insertMany(exams);
      console.log("✅ Exams seeded successfully!");

      // Insert students
      await Student.insertMany(students);
      console.log("✅ Students seeded successfully!");

      console.log("\n📊 Seeded Data Summary:");
      console.log(`   - Exams: ${exams.length}`);
      console.log(`   - Students: ${students.length}`);
      console.log("\n🔑 Test Credentials:");
      console.log("   - ID: student001, Password: password123");
      console.log("   - ID: student002, Password: password123");
      console.log("   - ID: student003, Password: password123");

      process.exit(0);
    } catch (err) {
      console.log("❌ Error:", err.message);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.log("❌ DB Connection Error:", err.message);
    process.exit(1);
  });