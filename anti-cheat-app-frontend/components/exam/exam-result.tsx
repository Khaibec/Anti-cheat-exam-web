import {
  Box,
  Chip,
  Container,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useRouter } from "next/router";
import { ExamResult } from "../../models/exam-models";
import classes from "./exam-result.module.scss";

interface ExamResultViewProps {
  result: ExamResult;
}

const ExamResultView: React.FC<ExamResultViewProps> = ({ result }) => {
  const router = useRouter();

  const handleAttemptChange = (attemptNumber: number) => {
    router.push(`/exam/result/${result.examId}?attempt=${attemptNumber}`);
  };

  return (
    <Container maxWidth="md" className={classes.container}>
      <Typography variant="h4" component="h1" gutterBottom>
        {result.examName}
      </Typography>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip
          label={`Attempt ${result.attemptNumber} of ${result.maxAttempts}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`${result.attemptsRemaining} attempt(s) remaining`}
          color={result.attemptsRemaining > 0 ? "success" : "default"}
          variant="outlined"
        />
      </Box>

      {result.attempts && result.attempts.length > 1 && (
        <FormControl size="small" sx={{ mb: 2, minWidth: 220 }}>
          <InputLabel>View Attempt</InputLabel>
          <Select
            value={result.attemptNumber}
            label="View Attempt"
            onChange={(e) => handleAttemptChange(Number(e.target.value))}
          >
            {result.attempts.map((attempt) => (
              <MenuItem key={attempt.attemptNumber} value={attempt.attemptNumber}>
                Attempt {attempt.attemptNumber}: {attempt.gradeOutOf10}/10 (
                {attempt.score}/{attempt.total})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Box className={classes.scoreCard}>
        <Typography variant="h2" className={classes.scoreValue}>
          {result.finalGradeOutOf10 ?? result.gradeOutOf10}/10
        </Typography>
        {result.adjustedGradeOutOf10 != null &&
          result.autoGradeOutOf10 != null &&
          result.adjustedGradeOutOf10 !== result.autoGradeOutOf10 && (
            <Typography color="warning.main" sx={{ mb: 1 }}>
              Adjusted by instructor (auto: {result.autoGradeOutOf10}/10)
            </Typography>
          )}
        {result.reviewNote && (
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            Note: {result.reviewNote}
          </Typography>
        )}
        <Typography variant="h6">
          {result.score} / {result.total} correct ({result.percentage}%)
        </Typography>
        <Typography color="text.secondary">
          Submitted: {new Date(result.submittedAt).toLocaleString()}
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Answer Review
      </Typography>

      <List>
        {result.breakdown.map((item, index) => (
          <ListItem key={index} alignItems="flex-start" className={classes.reviewItem}>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {item.isCorrect ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <CancelIcon color="error" fontSize="small" />
                  )}
                  <span>
                    Q{item.displayIndex + 1}: {item.questionTitle}
                  </span>
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Your answer:{" "}
                    <Chip
                      size="small"
                      label={item.studentAnswer?.toUpperCase() || "No answer"}
                      color={item.isCorrect ? "success" : "error"}
                      variant="outlined"
                    />
                  </Typography>
                  {!item.isCorrect && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Correct answer:{" "}
                      <Chip
                        size="small"
                        label={item.correctAnswer.toUpperCase()}
                        color="success"
                        variant="outlined"
                      />
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default ExamResultView;
