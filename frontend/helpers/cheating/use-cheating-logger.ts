import { useCallback, useRef } from "react";
import { logCheating } from "../api/cheating-api";
import {
  CheatingType,
  RATE_LIMIT_MS,
} from "../cheating/cheating-types";

interface UseCheatingLoggerOptions {
  studentId?: string;
  examId?: string;
  token?: string;
}

export const useCheatingLogger = ({
  studentId,
  examId,
  token,
}: UseCheatingLoggerOptions) => {
  const lastLoggedAtRef = useRef<Record<string, number>>({});

  const reportCheating = useCallback(
    async (cheatingType: CheatingType, imageBlob: Blob | null) => {
      if (!studentId || !examId || !token || !imageBlob) {
        return { skipped: true };
      }

      const now = Date.now();
      const lastLoggedAt = lastLoggedAtRef.current[cheatingType] || 0;

      if (now - lastLoggedAt < RATE_LIMIT_MS) {
        return { skipped: true };
      }

      try {
        const result = await logCheating(
          studentId,
          examId,
          cheatingType,
          imageBlob,
          token
        );

        if (!result.skipped) {
          lastLoggedAtRef.current[cheatingType] = now;
        }

        return result;
      } catch (error) {
        console.error("Failed to report cheating:", error);
        return { skipped: true, error };
      }
    },
    [studentId, examId, token]
  );

  return { reportCheating };
};
