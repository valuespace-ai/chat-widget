import React, { Suspense, useEffect, useRef, useState } from "react";
import useAudioRecorder from "../hooks/useAudioRecorder";
import { Props } from "./interfaces";

// Import SVG icons

// Lazy-load visualizer
const LiveAudioVisualizer = React.lazy(async () => {
  const { LiveAudioVisualizer } = await import("react-audio-visualize");
  return { default: LiveAudioVisualizer };
});

// Define allowed file extension types
type FileExtension = "webm" | "mp3" | "wav";

const VoiceAudioRecorder: React.FC<Props> = ({
  onRecordingComplete,
  onNotAllowedOrFound,
  recorderControls,
  audioTrackConstraints,
  downloadOnSavePress = false,
  downloadFileExtension = "webm" as FileExtension,
  showVisualizer = true,
  mediaRecorderOptions,
  classes,
  onRecordingStateChange,
}) => {
  const initializedRef = useRef(false);

  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
    recordingTime,
    mediaRecorder,
  } =
    recorderControls ??
    useAudioRecorder(audioTrackConstraints,
      (error: Error) => {
        if (onNotAllowedOrFound && error instanceof DOMException) {
          onNotAllowedOrFound(error);
        }
      },
      mediaRecorderOptions);

  const [actionType, setActionType] = useState<null | 'send' | 'discard'>(null);

  // Prevent auto-recording on mount
  useEffect(() => {
    initializedRef.current = true;
  }, []);

  // Notify parent component when recording state changes
  useEffect(() => {
    if (initializedRef.current && onRecordingStateChange) {
      onRecordingStateChange(isRecording);
    }
  }, [isRecording, onRecordingStateChange]);

  // Clear the shouldSave flag when starting a new recording
  const handleStartRecording = () => {
    startRecording();
  };

  // Discard/cancel handler for STOP (trash) button
  const handleDiscardRecording = () => {
    setActionType('discard');
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (typeof recorderControls?.reset === 'function') {
      recorderControls.reset();
    }
  };

  const stopAudioRecorder = async () => {
    if (!mediaRecorder) {
      console.warn('[VoiceAudioRecorder] No MediaRecorder instance');
      return;
    }
    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    } else {
      if (recordingBlob) {
        onRecordingComplete && onRecordingComplete(recordingBlob, recordingTime);
      } else {
        console.warn('[VoiceAudioRecorder] No recordingBlob to send');
      }
    }
  };

  const handleSendRecording = () => {
    setActionType('send');
    stopAudioRecorder();
  };

  useEffect(() => {
    // Download if requested
    if (downloadOnSavePress && recordingBlob) {
      void downloadBlob(recordingBlob);
    }
    // Only handle when actionType is set
    if (recordingBlob && actionType) {
      if (actionType === 'send' && onRecordingComplete) {
        onRecordingComplete(recordingBlob, recordingTime);
      } else if (actionType === 'discard') {
      }
      setActionType(null); // Reset after handling
      // Optionally: clear the blob to avoid further triggers
      // setRecordingBlob(null);
    }
  }, [recordingBlob, downloadOnSavePress, onRecordingComplete, actionType, recordingTime]);

  const downloadBlob = async (blob: Blob): Promise<void> => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audio.${downloadFileExtension}`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <>
      {/* Record button - visible when not recording */}
      {!isRecording && (
        <button
          style={{ backgroundColor: 'var(--button-color)', borderRadius: '50%' }}
          className="webchat__icon-button webchat__icon-button--stretch audio-recorder-button"
          title="Start recording"
          type="button"
          onClick={handleStartRecording}
          data-testid="ar_mic"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-mic"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>

        </button>
      )}

      {/* Recording controls - visible only when recording */}
      <div className="audio-recorder-controls" style={{ display: isRecording ? 'flex' : 'none' }}>
        {/* Trash / Stop */}
        <button
          className="webchat__icon-button webchat__send-box__button audio-recorder-button"
          onClick={handleDiscardRecording}
          title="Discard recording"
          data-testid="ar_trash"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>

        {/* Visualizer */}
        {showVisualizer && mediaRecorder && (
          <div className="audio-recorder-visualizer">
            <Suspense fallback={<div className="audio-recorder-visualizer-fallback"></div>}>
              <LiveAudioVisualizer
                mediaRecorder={mediaRecorder}
                barWidth={2}
                gap={2}
                height={16}
                fftSize={512}
                maxDecibels={-10}
                minDecibels={-80}
                smoothingTimeConstant={0.4}
              />
            </Suspense>
          </div>
        )}

        {/* Timer */}
        <span className="audio-recorder-timer">
          {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, "0")}
        </span>

        {/* Pause / Resume - separated into two buttons */}
        {isPaused ? (
          <button
            className="webchat__icon-button webchat__send-box__button audio-recorder-button"
            onClick={togglePauseResume}
            title="Resume recording"
            data-testid="ar_resume"
            type="button"
          >

            <svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
              <title>Resume Recording</title>
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <circle fill="#f44336" cx="12" cy="12" r="10"></circle>
              </g>
            </svg>

          </button>
        ) : (
          <button
            className="webchat__icon-button webchat__send-box__button audio-recorder-button"
            onClick={togglePauseResume}
            title="Pause recording"
            data-testid="ar_pause"
            type="button"
          >

            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>

          </button>
        )}

        {/* Send / Save */}
        <button
          className="webchat__icon-button  webchat__send-box__button audio-recorder-button"
          onClick={handleSendRecording}
          title="Send recording"
          data-testid="ar_send"
          type="button"
        >
          <svg className="webchat__send-icon" height="28" viewBox="0 0 45.7 33.8" width="28">
            <path d="M8.55 25.25l21.67-7.25H11zm2.41-9.47h19.26l-21.67-7.23zm-6 13l4-11.9L5 5l35.7 11.9z"></path>
          </svg>
        </button>
      </div>
    </>
  );
};

export default VoiceAudioRecorder;
