import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  AdminExam,
  AdminStudent,
  StudentPayload,
} from "../../helpers/api/admin-api";

interface StudentFormDialogProps {
  open: boolean;
  student: AdminStudent | null;
  exams: AdminExam[];
  onClose: () => void;
  onSubmit: (payload: StudentPayload) => Promise<void>;
}

const emptyForm = {
  _id: "",
  fname: "",
  lname: "",
  password: "",
  assignedExams: [] as string[],
};

const StudentFormDialog: React.FC<StudentFormDialogProps> = ({
  open,
  student,
  exams,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(student);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (student) {
      setForm({
        _id: student._id,
        fname: student.fname,
        lname: student.lname || "",
        password: "",
        assignedExams: (student.assignedExams || []).map((item) =>
          typeof item === "string" ? item : item.examId
        ),
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, student]);

  const handleChange = (field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload: StudentPayload = {
        fname: form.fname.trim(),
        lname: form.lname.trim(),
        assignedExams: form.assignedExams,
      };

      if (!isEdit) {
        payload._id = form._id.trim();
        payload.password = form.password;
      } else if (form.password.trim()) {
        payload.password = form.password;
      }

      await onSubmit(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    form.fname.trim() &&
    (isEdit || (form._id.trim() && form.password.length >= 8));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Student" : "Add Student"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        {!isEdit && (
          <TextField
            label="Student ID"
            value={form._id}
            onChange={(e) => handleChange("_id", e.target.value)}
            required
            fullWidth
          />
        )}

        <TextField
          label="First Name"
          value={form.fname}
          onChange={(e) => handleChange("fname", e.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Last Name"
          value={form.lname}
          onChange={(e) => handleChange("lname", e.target.value)}
          fullWidth
        />

        <TextField
          label={isEdit ? "New Password (optional)" : "Password"}
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          required={!isEdit}
          fullWidth
          helperText={!isEdit ? "Minimum 8 characters" : undefined}
        />

        <FormControl fullWidth>
          <InputLabel>Assigned Exams</InputLabel>
          <Select
            multiple
            value={form.assignedExams}
            onChange={(e) =>
              handleChange("assignedExams", e.target.value as string[])
            }
            input={<OutlinedInput label="Assigned Exams" />}
          >
            {exams.map((exam) => (
              <MenuItem key={exam._id} value={exam._id}>
                {exam.name} ({exam._id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !isValid}>
          {isEdit ? "Save" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentFormDialog;
