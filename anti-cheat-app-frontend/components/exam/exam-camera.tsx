import { Camera } from "@mediapipe/camera_utils";
import { FaceDetection, Results } from "@mediapipe/face_detection";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Webcam from "react-webcam";
import {
  detectCheating,
  extractFaceCoordinates,
} from "../../helpers/face-detection/face-detection-helper";
import {
  CheatingType,
  getCheatingStatusLabel,
  getCheatingTypeFromGaze,
} from "../../helpers/cheating/cheating-types";
import { useCheatingLogger } from "../../helpers/cheating/use-cheating-logger";
import classes from "./exam-camera.module.scss";

export interface ExamCameraHandle {
  captureAndReport: (cheatingType: CheatingType) => Promise<void>;
}

interface ExamCameraProps {
  studentId?: string;
  examId?: string;
  token?: string;
}

const ExamCamera = forwardRef<ExamCameraHandle, ExamCameraProps>(
  ({ studentId, examId, token }, ref) => {
    const webcamRef = useRef<Webcam>(null);
    const faceDetectionRef = useRef<FaceDetection | null>(null);
    const currentFrame = useRef(0);

    const [cheatingStatus, setCheatingStatus] = useState("Monitoring...");
    const { reportCheating } = useCheatingLogger({ studentId, examId, token });
    const reportCheatingRef = useRef(reportCheating);

    useEffect(() => {
      reportCheatingRef.current = reportCheating;
    }, [reportCheating]);

    const captureScreenshotBlob = useCallback(async (): Promise<Blob | null> => {
      const screenshot = webcamRef.current?.getScreenshot();
      if (!screenshot) return null;

      const response = await fetch(screenshot);
      return response.blob();
    }, []);

    const handleCheatingDetected = useCallback(
      async (cheatingType: CheatingType) => {
        setCheatingStatus(getCheatingStatusLabel(cheatingType));

        const imageBlob = await captureScreenshotBlob();
        await reportCheatingRef.current(cheatingType, imageBlob);
      },
      [captureScreenshotBlob]
    );

    const handleCheatingDetectedRef = useRef(handleCheatingDetected);

    useEffect(() => {
      handleCheatingDetectedRef.current = handleCheatingDetected;
    }, [handleCheatingDetected]);

    useImperativeHandle(
      ref,
      () => ({
        captureAndReport: async (cheatingType: CheatingType) => {
          await handleCheatingDetectedRef.current(cheatingType);
        },
      }),
      []
    );

    useEffect(() => {
      const faceDetection = new FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        },
      });

      faceDetection.setOptions({
        minDetectionConfidence: 0.5,
        model: "short",
      });

      const onResult = async (result: Results) => {
        if (result.detections.length < 1) {
          setCheatingStatus(getCheatingStatusLabel("no_face_detected"));
          await handleCheatingDetectedRef.current("no_face_detected");
          return;
        }

        if (result.detections.length > 1) {
          setCheatingStatus(getCheatingStatusLabel("multiple_faces"));
          await handleCheatingDetectedRef.current("multiple_faces");
          return;
        }

        const faceCoordinates = extractFaceCoordinates(result);
        const [lookingLeft, lookingRight] = detectCheating(faceCoordinates, false);
        const cheatingType = getCheatingTypeFromGaze(lookingLeft, lookingRight);

        setCheatingStatus(getCheatingStatusLabel(cheatingType));

        if (cheatingType) {
          await handleCheatingDetectedRef.current(cheatingType);
        }
      };

      faceDetection.onResults(onResult);
      faceDetectionRef.current = faceDetection;

      let camera: Camera | null = null;

      const startCamera = () => {
        if (!webcamRef.current?.video) return;

        camera = new Camera(webcamRef.current.video, {
          onFrame: async () => {
            if (!webcamRef.current?.video) return;

            currentFrame.current += 1;

            if (currentFrame.current >= 30) {
              currentFrame.current = 0;
              await faceDetection.send({ image: webcamRef.current.video });
            }
          },
          width: 1280,
          height: 720,
        });

        camera.start();
      };

      const timer = window.setTimeout(startCamera, 500);

      return () => {
        window.clearTimeout(timer);
        camera?.stop();
        faceDetection.close();
      };
    }, []);

    return (
      <div className={classes.cameraContainer}>
        <p className={classes.cheatingStatus}>Cheating status: {cheatingStatus}</p>

        <Webcam
          className={classes.camera}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
        />
      </div>
    );
  }
);

ExamCamera.displayName = "ExamCamera";

export default ExamCamera;
