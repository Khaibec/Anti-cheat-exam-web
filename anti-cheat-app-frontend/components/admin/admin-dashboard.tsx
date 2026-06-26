import { Button, Container, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  AdminExam,
  AdminStats,
  AdminStudent,
  createExam,
  createStudent,
  deleteExam,
  deleteStudent,
  ExamPayload,
  getExam,
  getExams,
  getStats,
  getStudents,
  StudentPayload,
  updateExam,
  updateStudent,
} from "../../helpers/api/admin-api";
import ConfirmDialog from "./confirm-dialog";
import ExamFormDialog from "./exam-form-dialog";
import StudentFormDialog from "./student-form-dialog";
import classes from "./admin-dashboard.module.scss";

interface AdminDashboardProps {
  initialStudents: AdminStudent[];
  initialExams: AdminExam[];
  initialStats: AdminStats;
}

const formatAssignedExams = (
  assignedExams: AdminStudent["assignedExams"]
) => {
  if (!assignedExams?.length) return "—";

  return assignedExams
    .map((item) => (typeof item === "string" ? item : item.examId))
    .join(", ");
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialStudents,
  initialExams,
  initialStats,
}) => {
  const session = useSession();
  const token = session.data?.user?.token;

  const [students, setStudents] = useState(initialStudents);
  const [exams, setExams] = useState(initialExams);
  const [stats, setStats] = useState(initialStats);

  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AdminStudent | null>(null);
  const [editingExam, setEditingExam] = useState<AdminExam | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(
    null
  );
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const refreshData = useCallback(async () => {
    if (!token) return;

    const [updatedStudents, updatedExams, updatedStats] = await Promise.all([
      getStudents(token),
      getExams(token),
      getStats(token),
    ]);

    setStudents(updatedStudents);
    setExams(updatedExams);
    setStats(updatedStats);
  }, [token]);

  const openConfirm = (message: string, action: () => Promise<void>) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    setConfirmLoading(true);

    try {
      await confirmAction();
      setConfirmOpen(false);
    } catch (e) {
      toast.error(e.message || "Operation failed!");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCreateStudent = async (payload: StudentPayload) => {
    try {
      await createStudent(token, payload);
      toast.success("Student created!");
      await refreshData();
    } catch (e) {
      toast.error(e.message || "Failed to create student!");
      throw e;
    }
  };

  const handleUpdateStudent = async (payload: StudentPayload) => {
    if (!editingStudent) return;

    try {
      await updateStudent(token, editingStudent._id, payload);
      toast.success("Student updated!");
      await refreshData();
    } catch (e) {
      toast.error(e.message || "Failed to update student!");
      throw e;
    }
  };

  const handleDeleteStudent = (student: AdminStudent) => {
    openConfirm(
      `Delete student "${student.fname} ${student.lname}" (${student._id})?`,
      async () => {
        await deleteStudent(token, student._id);
        toast.success("Student deleted!");
        await refreshData();
      }
    );
  };

  const handleCreateExam = async (payload: ExamPayload) => {
    try {
      await createExam(token, payload);
      toast.success("Exam created!");
      await refreshData();
    } catch (e) {
      toast.error(e.message || "Failed to create exam!");
      throw e;
    }
  };

  const handleUpdateExam = async (payload: ExamPayload) => {
    if (!editingExam) return;

    try {
      await updateExam(token, editingExam._id, payload);
      toast.success("Exam updated!");
      await refreshData();
    } catch (e) {
      toast.error(e.message || "Failed to update exam!");
      throw e;
    }
  };

  const handleDeleteExam = (exam: AdminExam) => {
    openConfirm(`Delete exam "${exam.name}" (${exam._id})?`, async () => {
      await deleteExam(token, exam._id);
      toast.success("Exam deleted!");
      await refreshData();
    });
  };

  const openEditExam = async (exam: AdminExam) => {
    try {
      const fullExam = await getExam(token, exam._id);
      setEditingExam(fullExam);
      setExamDialogOpen(true);
    } catch (e) {
      toast.error(e.message || "Failed to load exam!");
    }
  };

  return (
    <Container maxWidth="lg" className={classes.container}>
      <h1 className={classes.title}>
        Instructor Dashboard — {session.data?.user?.fname}{" "}
        {session.data?.user?.lname}
      </h1>

      <div className={classes.stats}>
        <div className={classes.statCard}>
          <span>My Students</span>
          <p className={classes.statValue}>{stats.managedStudentsCount}</p>
        </div>
        <div className={classes.statCard}>
          <span>Submissions</span>
          <p className={classes.statValue}>{stats.totalSubmissions}</p>
        </div>
        <div className={classes.statCard}>
          <span>Average Score</span>
          <p className={classes.statValue}>{stats.averagePercentage}%</p>
        </div>
        <div className={classes.statCard}>
          <span>Exams</span>
          <p className={classes.statValue}>{exams.length}</p>
        </div>
      </div>

      <h2 className={classes.sectionTitle}>Exam Statistics</h2>
      <table className={classes.table}>
        <thead>
          <tr>
            <th>Exam</th>
            <th>Submissions</th>
            <th>Average Score</th>
          </tr>
        </thead>
        <tbody>
          {stats.examStats.length === 0 ? (
            <tr>
              <td colSpan={3}>No submissions yet from your students.</td>
            </tr>
          ) : (
            stats.examStats.map((examStat) => (
              <tr key={examStat.examId}>
                <td>
                  {examStat.examName} ({examStat.examId})
                </td>
                <td>{examStat.submissionCount}</td>
                <td>{examStat.averagePercentage}%</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2 className={classes.sectionTitle}>Recent Submissions</h2>
      <table className={classes.table}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Exam</th>
            <th>Attempt</th>
            <th>Grade (/10)</th>
            <th>Submitted At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stats.submissions.length === 0 ? (
            <tr>
              <td colSpan={6}>No graded submissions yet.</td>
            </tr>
          ) : (
            stats.submissions.map((submission, index) => (
              <tr key={`${submission.studentId}-${submission.examId}-${index}`}>
                <td>{submission.studentName}</td>
                <td>{submission.examName}</td>
                <td>#{submission.attemptNumber ?? 1}</td>
                <td>
                  {submission.finalGradeOutOf10 ?? submission.gradeOutOf10 ?? "—"}
                  /10
                </td>
                <td>
                  {submission.submittedAt
                    ? new Date(submission.submittedAt).toLocaleString()
                    : "—"}
                </td>
                <td>
                  <Link
                    href={`/admin/students/${submission.studentId}/exams/${submission.examId}/review`}
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={classes.sectionHeader}>
        <h2 className={classes.sectionTitle}>Students</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingStudent(null);
            setStudentDialogOpen(true);
          }}
        >
          Add Student
        </Button>
      </div>

      <table className={classes.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Assigned Exams</th>
            <th>Results</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student._id}</td>
              <td>
                {student.fname} {student.lname}
              </td>
              <td>{formatAssignedExams(student.assignedExams)}</td>
              <td>
                {student.submissions?.length
                  ? student.submissions
                      .map(
                        (item) =>
                          `${item.examId} (#${item.attemptNumber}): ${item.finalGradeOutOf10 ?? item.gradeOutOf10 ?? "—"}/10`
                      )
                      .join("; ")
                  : "—"}
              </td>
              <td className={classes.actions}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditingStudent(student);
                    setStudentDialogOpen(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteStudent(student)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={classes.sectionHeader}>
        <h2 className={classes.sectionTitle}>Exams</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingExam(null);
            setExamDialogOpen(true);
          }}
        >
          Add Exam
        </Button>
      </div>

      <table className={classes.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Duration (min)</th>
            <th>Start</th>
            <th>End</th>
            <th>Questions</th>
            <th>Max Attempts</th>
            <th>Shuffle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam._id}>
              <td>{exam._id}</td>
              <td>{exam.name}</td>
              <td>{exam.duration}</td>
              <td>{exam.startDate}</td>
              <td>{exam.endDate}</td>
              <td>{exam.questionCount}</td>
              <td>{exam.maxAttempts ?? 1}</td>
              <td>{exam.shuffleQuestions === false ? "No" : "Yes"}</td>
              <td className={classes.actions}>
                <IconButton size="small" onClick={() => openEditExam(exam)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteExam(exam)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <StudentFormDialog
        open={studentDialogOpen}
        student={editingStudent}
        exams={exams}
        onClose={() => setStudentDialogOpen(false)}
        onSubmit={editingStudent ? handleUpdateStudent : handleCreateStudent}
      />

      <ExamFormDialog
        open={examDialogOpen}
        exam={editingExam}
        onClose={() => setExamDialogOpen(false)}
        onSubmit={editingExam ? handleUpdateExam : handleCreateExam}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Delete"
        message={confirmMessage}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        loading={confirmLoading}
      />
    </Container>
  );
};

export default AdminDashboard;
