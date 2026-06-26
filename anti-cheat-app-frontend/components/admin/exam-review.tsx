import {
  Box,
  Button,
  Chip,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  ExamReviewData,
  updateExamGrade,
} from "../../helpers/api/admin-api";
import { getBackendAssetUrl } from "../../helpers/url";
import classes from "./exam-review.module.scss";

interface ExamReviewPanelProps {
  review: ExamReviewData;
  token: string;
  onUpdated: (review: ExamReviewData) => void;
}

const ExamReviewPanel: React.FC<ExamReviewPanelProps> = ({
  review,
  token,
  onUpdated,
}) => {
  const [adjustedGrade, setAdjustedGrade] = useState(
    review.submission.adjustedGradeOutOf10?.toString() ??
      review.submission.finalGradeOutOf10?.toString() ??
      review.submission.autoGradeOutOf10?.toString() ??
      ""
  );
  const [reviewNote, setReviewNote] = useState(
    review.submission.reviewNote ?? ""
  );
  const [loading, setLoading] = useState(false);

  const handleSaveGrade = async () => {
    setLoading(true);

    try {
      await updateExamGrade(token, review.student._id, review.exam._id, {
        adjustedGradeOutOf10: Number(adjustedGrade),
        reviewNote,
      });

      toast.success("Grade updated successfully!");

      onUpdated({
        ...review,
        submission: {
          ...review.submission,
          adjustedGradeOutOf10: Number(adjustedGrade),
          finalGradeOutOf10: Number(adjustedGrade),
          reviewNote,
          reviewedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      toast.error(error.message || "Failed to update grade!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" className={classes.reviewContainer}>
      <Typography variant="h4" gutterBottom>
        Exam Review
      </Typography>

      <Typography color="text.secondary" gutterBottom>
        {review.student.fname} {review.student.lname} — {review.exam.name} (
        {review.exam._id})
      </Typography>

      <Box className={classes.section}>
        <Typography variant="h6" gutterBottom>
          Scores
        </Typography>
        <Box className={classes.statRow}>
          <Box className={classes.statCard}>
            <span>Auto grade</span>
            <p className={classes.statValue}>
              {review.submission.autoGradeOutOf10 ?? "—"}/10
            </p>
          </Box>
          <Box className={classes.statCard}>
            <span>Final grade</span>
            <p className={classes.statValue}>
              {review.submission.finalGradeOutOf10 ?? "—"}/10
            </p>
          </Box>
          <Box className={classes.statCard}>
            <span>Cheating events</span>
            <p className={classes.statValue}>{review.totalCheatingEvents}</p>
          </Box>
        </Box>
      </Box>

      <Box className={classes.section}>
        <Typography variant="h6" gutterBottom>
          Adjust Grade
        </Typography>
        <Box className={classes.gradeForm}>
          <TextField
            label="Final grade (/10)"
            type="number"
            inputProps={{ min: 0, max: 10, step: 0.1 }}
            value={adjustedGrade}
            onChange={(e) => setAdjustedGrade(e.target.value)}
            helperText={`Auto grade: ${review.submission.autoGradeOutOf10 ?? "—"}/10`}
          />
          <TextField
            label="Review note"
            multiline
            minRows={3}
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Reason for grade adjustment..."
          />
          <Button
            variant="contained"
            onClick={handleSaveGrade}
            disabled={loading || adjustedGrade === ""}
          >
            Save Final Grade
          </Button>
        </Box>
      </Box>

      <Box className={classes.section}>
        <Typography variant="h6" gutterBottom>
          Cheating Summary
        </Typography>

        {review.cheatingSummary.length === 0 ? (
          <Typography color="text.secondary">No cheating events recorded.</Typography>
        ) : (
          review.cheatingSummary.map((item) => (
            <Box key={item.cheatingType} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="subtitle1">{item.label}</Typography>
                <Chip size="small" label={`${item.count} time(s)`} color="warning" />
              </Box>

              <Box className={classes.imageGrid}>
                {item.logs.map((log) => (
                  <Box key={log.id} className={classes.imageCard}>
                    <img
                      src={getBackendAssetUrl(log.imageUrl)}
                      alt={item.label}
                    />
                    <div className={classes.imageMeta}>
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </Box>
                ))}
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Container>
  );
};

export default ExamReviewPanel;
