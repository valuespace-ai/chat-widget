import { ReactElement } from "react";

export interface Props {
  onRecordingComplete: (blob: Blob) => void;
  onNotAllowedOrFound?: (exception: DOMException) => void;
  recorderControls?: any; 
  audioTrackConstraints?: MediaTrackConstraints;
  downloadOnSavePress?: boolean;
  downloadFileExtension?: string;
  showVisualizer?: boolean;
  mediaRecorderOptions?: MediaRecorderOptions;
  classes?: {
    AudioRecorderClass?: string;
    AudioRecorderStartSaveClass?: string;
    AudioRecorderPauseResumeClass?: string;
    AudioRecorderDiscardClass?: string;
    AudioRecorderIconClass?: string;
  };
  onRecordingStateChange?: (isRecording: boolean) => void;
}
