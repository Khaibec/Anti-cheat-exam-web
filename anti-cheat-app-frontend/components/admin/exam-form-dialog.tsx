import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { AdminExam, ExamPayload, ExamQuestion } from "../../helpers/api/admin-api";

interface ExamFormDialogProps {
  open: boolean;
  exam: AdminExam | null;
  onClose: () => void;
  onSubmit: (payload: ExamPayload) => Promise<void>;
}

const emptyQuestion = (): ExamQuestion & { answerKey: string } => ({
  title: "",
  options: { a: "", b: "", c: "", d: "" },
  answerKey: "a",
});

const emptyForm = {
  _id: "",
  name: "",
  startDate: "",
  endDate: "",
  duration: 60,
  shuffleQuestions: true,
  maxAttempts: 1,
  questions: [emptyQuestion()],
};

const ExamFormDialog: React.FC<ExamFormDialogProps> = ({
  open,
  exam,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(exam);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (exam) {
      setForm({
        _id: exam._id,
        name: exam.name,
        startDate: exam.startDate,
        endDate: exam.endDate,
        duration: exam.duration,
        shuffleQuestions: exam.shuffleQuestions !== false,
        maxAttempts: exam.maxAttempts || 1,
        questions:
          exam.questions?.map((q, i) => ({
            ...q,
            answerKey: exam.answerKeys?.[i] || "a",
          })) || [emptyQuestion()],
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, exam]);

  const updateQuestion = (
    index: number,
    field: string,
    value: string
  ) => {
    setForm((prev) => {
      const questions = [...prev.questions];

      if (field === "title" || field === "answerKey") {
        questions[index] = { ...questions[index], [field]: value };
      } else {
        questions[index] = {
          ...questions[index],
          options: { ...questions[index].options, [field]: value },
        };
      }

      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion()],
    }));
  };

  const removeQuestion = (index: number) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const questions: ExamQuestion[] = form.questions.map(
        ({ title, options }) => ({ title, options })
      );
      const answerKeys = form.questions.map((q) => q.answerKey);

      const payload: ExamPayload = {
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        duration: Number(form.duration),
        shuffleQuestions: form.shuffleQuestions,
        maxAttempts: Number(form.maxAttempts),
        questions,
        questionCount: questions.length,
        answerKeys,
      };

      if (!isEdit) {
        payload._id = form._id.trim();
      }

      await onSubmit(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    form.name.trim() &&
    form.startDate &&
    form.endDate &&
    form.duration > 0 &&
    form.maxAttempts >= 1 &&
    form.questions.length > 0 &&
    form.questions.every(
      (q) =>
        q.title.trim() &&
        q.options.a.trim() &&
        q.options.b.trim() &&
        q.options.c.trim() &&
        q.options.d.trim()
    ) &&
    (isEdit || form._id.trim());

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? "Edit Exam" : "Add Exam"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        {!isEdit && (
          <TextField
            label="Exam ID"
            value={form._id}
            onChange={(e) => setForm((prev) => ({ ...prev, _id: e.target.value }))}
            required
            fullWidth
          />
        )}

        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
          fullWidth
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, startDate: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
          <TextField
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, endDate: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
          <TextField
            label="Duration (min)"
            type="number"
            value={form.duration}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, duration: Number(e.target.value) }))
            }
            required
            fullWidth
          />
          <TextField
            label="Max Attempts"
            type="number"
            inputProps={{ min: 1 }}
            value={form.maxAttempts}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                maxAttempts: Math.max(1, Number(e.target.value)),
              }))
            }
            required
            fullWidth
            helperText="How many times a student can take this exam"
          />
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={form.shuffleQuestions}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  shuffleQuestions: e.target.checked,
                }))
              }
            />
          }
          label="Shuffle question order for each student"
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Questions</Typography>
          <Button startIcon={<AddIcon />} onClick={addQuestion} size="small">
            Add Question
          </Button>
        </Box>

        {form.questions.map((question, index) => (
          <Box
            key={index}
            sx={{
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 1,
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="subtitle2">Question {index + 1}</Typography>
              {form.questions.length > 1 && (
                <IconButton size="small" onClick={() => removeQuestion(index)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <TextField
              label="Question"
              value={question.title}
              onChange={(e) => updateQuestion(index, "title", e.target.value)}
              required
              fullWidth
              sx={{ mb: 1 }}
            />

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1 }}>
              {(["a", "b", "c", "d"] as const).map((key) => (
                <TextField
                  key={key}
                  label={`Option ${key.toUpperCase()}`}
                  value={question.options[key]}
                  onChange={(e) => updateQuestion(index, key, e.target.value)}
                  required
                  size="small"
                />
              ))}
            </Box>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Answer</InputLabel>
              <Select
                value={question.answerKey}
                label="Answer"
                onChange={(e) => updateQuestion(index, "answerKey", e.target.value)}
              >
                {(["a", "b", "c", "d"] as const).map((key) => (
                  <MenuItem key={key} value={key}>
                    {key.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ))}
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

export default ExamFormDialog;
