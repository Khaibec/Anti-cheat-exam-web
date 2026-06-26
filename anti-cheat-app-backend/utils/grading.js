const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const buildQuestionOrder = (count, shouldShuffle) => {
  const order = Array.from({ length: count }, (_, i) => i);
  return shouldShuffle ? shuffleArray(order) : order;
};

const isValidQuestionOrder = (order, count) => {
  if (!Array.isArray(order) || order.length !== count) return false;

  const sorted = [...order].sort((a, b) => a - b);
  return sorted.every((value, index) => value === index);
};

const toGradeOutOf10 = (score, total) => {
  if (!total) return 0;
  return Math.round((score / total) * 100) / 10;
};

const gradeExam = (exam, answers, questionOrder) => {
  const total = questionOrder.length;
  let correctCount = 0;
  const breakdown = [];

  questionOrder.forEach((originalIndex, displayIndex) => {
    const correctAnswer = exam.answerKeys[originalIndex];
    const studentAnswer = answers[displayIndex] ?? null;
    const isCorrect = studentAnswer === correctAnswer;

    if (isCorrect) correctCount += 1;

    breakdown.push({
      displayIndex,
      originalIndex,
      questionTitle: exam.questions[originalIndex]?.title || "",
      studentAnswer,
      correctAnswer,
      isCorrect,
    });
  });

  const gradeOutOf10 = toGradeOutOf10(correctCount, total);

  return {
    score: correctCount,
    total,
    percentage: total > 0 ? Math.round((correctCount / total) * 100) : 0,
    gradeOutOf10,
    breakdown,
  };
};

const emptySubmissionRecord = () => ({
  attempts: [],
  adjustedGradeOutOf10: null,
  reviewNote: null,
  reviewedAt: null,
  reviewedBy: null,
});

const getSubmissionRecord = (raw) => {
  if (!raw) return emptySubmissionRecord();

  if (raw.attempts && Array.isArray(raw.attempts)) {
    return {
      attempts: raw.attempts,
      adjustedGradeOutOf10:
        raw.adjustedGradeOutOf10 === undefined ? null : raw.adjustedGradeOutOf10,
      reviewNote: raw.reviewNote ?? null,
      reviewedAt: raw.reviewedAt ?? null,
      reviewedBy: raw.reviewedBy ?? null,
    };
  }

  if (Array.isArray(raw)) {
    return {
      ...emptySubmissionRecord(),
      attempts: [
        {
          answers: raw,
          score: null,
          total: raw.length,
          percentage: null,
          gradeOutOf10: null,
          breakdown: [],
          submittedAt: null,
          attemptNumber: 1,
        },
      ],
    };
  }

  return {
    ...emptySubmissionRecord(),
    attempts: [
      {
        ...raw,
        gradeOutOf10:
          raw.gradeOutOf10 ??
          (raw.score != null && raw.total
            ? toGradeOutOf10(raw.score, raw.total)
            : null),
        attemptNumber: raw.attemptNumber || 1,
      },
    ],
  };
};

const getAttemptCount = (raw) => getSubmissionRecord(raw).attempts.length;

const getLatestAttempt = (raw) => {
  const { attempts } = getSubmissionRecord(raw);
  return attempts.length ? attempts[attempts.length - 1] : null;
};

const getBestAttempt = (raw) => {
  const { attempts } = getSubmissionRecord(raw);

  return attempts.reduce((best, current) => {
    if (!best) return current;

    const currentGrade = current.gradeOutOf10 ?? -1;
    const bestGrade = best.gradeOutOf10 ?? -1;

    if (currentGrade !== bestGrade) {
      return currentGrade > bestGrade ? current : best;
    }

    return (current.percentage ?? -1) > (best.percentage ?? -1) ? current : best;
  }, null);
};

const getAutoGradeOutOf10 = (raw) => {
  const best = getBestAttempt(raw);
  if (!best) return null;

  return (
    best.gradeOutOf10 ??
    (best.score != null && best.total ? toGradeOutOf10(best.score, best.total) : null)
  );
};

const getFinalGradeOutOf10 = (raw) => {
  const record = getSubmissionRecord(raw);

  if (
    record.adjustedGradeOutOf10 !== null &&
    record.adjustedGradeOutOf10 !== undefined
  ) {
    return record.adjustedGradeOutOf10;
  }

  return getAutoGradeOutOf10(raw);
};

const getAttemptSummary = (raw, maxAttempts = 1) => {
  const record = getSubmissionRecord(raw);
  const attemptsUsed = record.attempts.length;
  const limit = Math.max(1, maxAttempts || 1);

  return {
    maxAttempts: limit,
    attemptsUsed,
    attemptsRemaining: Math.max(0, limit - attemptsUsed),
    latest: getLatestAttempt(raw),
    best: getBestAttempt(raw),
    autoGradeOutOf10: getAutoGradeOutOf10(raw),
    finalGradeOutOf10: getFinalGradeOutOf10(raw),
    adjustedGradeOutOf10: record.adjustedGradeOutOf10,
  };
};

const normalizeSubmission = (submission) => {
  const latest = getLatestAttempt(submission);
  if (!latest) return null;
  return latest;
};

module.exports = {
  buildQuestionOrder,
  isValidQuestionOrder,
  toGradeOutOf10,
  gradeExam,
  getSubmissionRecord,
  getAttemptCount,
  getLatestAttempt,
  getBestAttempt,
  getAutoGradeOutOf10,
  getFinalGradeOutOf10,
  getAttemptSummary,
  normalizeSubmission,
};
