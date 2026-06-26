import { BASE_URL } from "../../constants";
import { CheatingType } from "../cheating/cheating-types";

const logCheating = async (
  studentId: string,
  examId: string,
  cheatingType: CheatingType,
  imageBlob: Blob,
  token: string
) => {
  const formData = new FormData();
  formData.append("examId", examId);
  formData.append("cheatingType", cheatingType);
  formData.append("image", imageBlob, `${cheatingType}.jpg`);

  const res = await fetch(`${BASE_URL}/cheatingLog/${studentId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || data.err) {
    throw new Error(data.err || "Failed to log cheating event!");
  }

  return data;
};

export { logCheating };
