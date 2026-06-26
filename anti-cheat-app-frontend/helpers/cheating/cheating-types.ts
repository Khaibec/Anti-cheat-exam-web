export type CheatingType =
  | "looking_left"
  | "looking_right"
  | "no_face_detected"
  | "multiple_faces"
  | "tab_switch";

export const CHEATING_TYPE_LABELS: Record<CheatingType, string> = {
  looking_left: "Looking left",
  looking_right: "Looking right",
  no_face_detected: "Face not detected",
  multiple_faces: "Multiple faces detected",
  tab_switch: "Tab switch / left exam window",
};

export const RATE_LIMIT_MS = 5000;

export const getCheatingTypeFromGaze = (
  lookingLeft: boolean,
  lookingRight: boolean
): CheatingType | null => {
  if (lookingLeft) return "looking_left";
  if (lookingRight) return "looking_right";
  return null;
};

export const getCheatingStatusLabel = (type: CheatingType | null): string => {
  if (!type) return "Everything okay!";
  return `Cheating Detected: ${CHEATING_TYPE_LABELS[type]}`;
};
