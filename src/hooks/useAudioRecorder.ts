import { useState, useRef, useEffect } from "react";

interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  mediaRecorder: MediaRecorder | null;
  recordingBlob: Blob | null;
}

const useAudioRecorder = (
  audioTrackConstraints?: MediaTrackConstraints,
  onNotAllowedOrFound?: (error: Error) => void,
  mediaRecorderOptions?: MediaRecorderOptions,
  onRecordingComplete?: (blob: Blob) => void
) => {
  const [recorderState, setRecorderState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    mediaRecorder: null,
    recordingBlob: null,
  });

  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const mediaChunks = useRef<Blob[]>([]);
  const mediaStream = useRef<MediaStream | null>(null);

  // Function to start recording
  const startRecording = async () => {
    // Always clear any existing timer and reset pause state before starting
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setRecorderState((prevState) => ({
      ...prevState,
      isPaused: false,
      recordingTime: 0,
    }));

    if (recorderState.isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioTrackConstraints || true,
      });

      mediaStream.current = stream;
      const recorder = new MediaRecorder(stream, mediaRecorderOptions);
      
      recorder.addEventListener("dataavailable", (e) => {
        if (e.data.size > 0) {
          mediaChunks.current.push(e.data);
        }
      });

      recorder.addEventListener("stop", () => {
        const blob = new Blob(mediaChunks.current, {
          type: mediaRecorderOptions?.mimeType || "audio/webm",
        });
        
        setRecorderState((prevState) => ({
          ...prevState,
          recordingBlob: blob,
          isRecording: false,
          isPaused: false, // always reset pause state on stop
        }));

        mediaChunks.current = [];
        
        if (mediaStream.current) {
          mediaStream.current.getTracks().forEach((track) => track.stop());
          mediaStream.current = null;
        }

        // Call the callback here, if provided
        if (typeof onRecordingComplete === 'function') {
          onRecordingComplete(blob);
        }
      });

      recorder.start();
      
      setRecorderState((prevState) => ({
        ...prevState,
        isRecording: true,
        isPaused: false,
        recordingTime: 0,
        mediaRecorder: recorder,
        recordingBlob: null,
      }));

      // Start timer
      timerInterval.current = setInterval(() => {
        setRecorderState((prevState) => ({
          ...prevState,
          recordingTime: prevState.recordingTime + 1,
        }));
      }, 1000);
    } catch (err) {
      if (onNotAllowedOrFound) {
        onNotAllowedOrFound(err as Error);
      }
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    if (!recorderState.isRecording) return;

    if (recorderState.mediaRecorder && recorderState.mediaRecorder.state !== "inactive") {
      recorderState.mediaRecorder.stop();
    }

    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  // Function to toggle pause/resume
  const togglePauseResume = () => {
    if (!recorderState.isRecording) return;

    if (recorderState.isPaused) {
      // Resume recording
      if (recorderState.mediaRecorder && recorderState.mediaRecorder.state === "paused") {
        recorderState.mediaRecorder.resume();
      }

      // Resume timer
      timerInterval.current = setInterval(() => {
        setRecorderState((prevState) => ({
          ...prevState,
          recordingTime: prevState.recordingTime + 1,
        }));
      }, 1000);

      setRecorderState((prevState) => ({
        ...prevState,
        isPaused: false,
      }));
    } else {
      // Pause recording
      if (recorderState.mediaRecorder && recorderState.mediaRecorder.state === "recording") {
        recorderState.mediaRecorder.pause();
      }

      // Pause timer
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }

      setRecorderState((prevState) => ({
        ...prevState,
        isPaused: true,
      }));
    }
  };

  // Function to reset the recorder state
  const reset = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
      mediaStream.current = null;
    }
    setRecorderState({
      isRecording: false,
      isPaused: false,
      recordingTime: 0,
      mediaRecorder: null,
      recordingBlob: null,
    });
    mediaChunks.current = [];
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }

      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    startRecording,
    stopRecording,
    togglePauseResume,
    reset,
    recordingBlob: recorderState.recordingBlob,
    isRecording: recorderState.isRecording,
    isPaused: recorderState.isPaused,
    recordingTime: recorderState.recordingTime,
    mediaRecorder: recorderState.mediaRecorder,
  };
};

export default useAudioRecorder;
