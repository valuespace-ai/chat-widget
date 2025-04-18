import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { uploadAudioRecording } from '../services/ApiService';
import ChatInvitation from './ChatInvitation';
import VoiceAudioRecorder from './VoiceAudioRecorder';
import './voiceRecorder.css';

/**
 * ChatWidgetUI provides the UI components for the chat widget
 * @param {object} props - Component props
 * @param {object} props.launcherStyle - Style for the launcher button
 * @param {boolean} props.hideVoiceRecorder - Whether to hide the voice recorder
 * @param {object} props.header - Header configuration
 * @returns {JSX.Element} - The rendered component
 */
const ChatWidgetUI = ({
  connectionConfirmed,
  toggleChat,
  launcherStyle,
  containerRef,
  launcherIcon,
  directLine,
  userId,
  hideVoiceRecorder,
  header,
  isChatOpen,
  styleOptions,
  onShowWelcomePopupRef
}) => {
  const [webChatStore, setWebChatStore] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sendBoxMain, setSendBoxMain] = useState(null);
  const [recorderContainer, setRecorderContainer] = useState(null);
  const [showInvitation, setShowInvitation] = useState(false);
  const [welcomeRequested, setWelcomeRequested] = useState(false);
  const [chatWasEverOpened, setChatWasEverOpened] = useState(false);
  const portalMountedRef = useRef(false);
  const intervalRef = useRef(null);
  const processingRecordingRef = useRef(false);

  // Handle recording state changes
  const handleRecordingStateChange = (recordingState) => {
    setIsRecording(recordingState);

    // Toggle visibility of text box and original send button (not our recorder send button)
    const webchatElement = document.getElementById('webchat');
    if (webchatElement) {
      const textBox = webchatElement.querySelector('.webchat__send-box-text-box');

      // Get only the original WebChat send button, not our recorder send button
      // This specifically excludes buttons inside our recorder-container
      const originalSendButtons = Array.from(
        webchatElement.querySelectorAll('.webchat__send-button')
      ).filter(button => {
        // Check if this button is NOT inside our recorder container
        return !button.closest('.recorder-container');
      });

      // Get the send box main container
      const sendBoxMain = webchatElement.querySelector('.webchat__send-box__main');
      const recorderContainer = webchatElement.querySelector('.recorder-container');

      if (textBox) {
        if (recordingState) {
          // Hide text box when recording
          textBox.style.display = 'none';
        } else {
          // Show text box when not recording
          textBox.style.display = '';
        }
      }

      // Hide/show only the original send buttons
      originalSendButtons.forEach(button => {
        if (recordingState) {
          // Hide original send buttons when recording
          button.style.display = 'none';
        } else {
          // Show original send buttons when not recording
          button.style.display = '';
        }
      });

      // Adjust the recorder container to take full width when recording
      if (recorderContainer && sendBoxMain) {
        if (recordingState) {
          // Make recorder container take full width
          recorderContainer.style.width = '100%';
          recorderContainer.style.flex = '1';
          // Hide other children of sendBoxMain
          Array.from(sendBoxMain.children).forEach(child => {
            if (child !== recorderContainer) {
              child.style.display = 'none';
            }
          });
        } else {
          // Reset recorder container
          recorderContainer.style.width = '';
          recorderContainer.style.flex = '';
          // Show other children of sendBoxMain
          Array.from(sendBoxMain.children).forEach(child => {
            if (child !== recorderContainer) {
              child.style.display = '';
            }
          });
        }
      }
    }
  };

  // Upload audio to backend and get public URL
  const uploadAudioToBackend = async (file) => {
    return uploadAudioRecording(file);
  };

  // Handle recording completion
  const handleRecordingComplete = async (blob, recordingTime) => {
    // Prevent multiple submissions
    if (processingRecordingRef.current) {
      return;
    }

    try {
      processingRecordingRef.current = true;

      // Only process if we have a blob and it's not empty
      if (blob && blob.size > 0) {
        const timestamp = new Date();
        const dateString = timestamp.toISOString().replace(/T/, '_').replace(/:/g, '-').replace(/\..+/, '');
        const mimeType = blob.type;
        const extension = mimeType.split(';')[0].split('/')[1];
        const durationSec = Math.round(recordingTime);
        const filename = `voice-message_${dateString}_${durationSec}s.${extension}`;
        // Create a File object from the blob
        const audioFile = new File([blob], filename, { type: blob.type });

        // Upload the audio file
        const uploadResult = await uploadAudioToBackend(audioFile);

        // If upload successful, send message via WebChat
        if (uploadResult.success) {
          if (directLine) {
            const reader = new FileReader();
            reader.onloadend = () => {
              sendViaDirectLine(uploadResult.url);
            };
            reader.readAsDataURL(blob);
          }
          console.log('Audio uploaded successfully: ' + filename);
        } else {
          console.error('Upload failed:', uploadResult);
        }
      } else {
        console.warn('Blob is missing or empty:', blob);
      }
    } catch (error) {
      console.error('Error in handleRecordingComplete:', error);
    } finally {
      // Reset processing state
      processingRecordingRef.current = false;
    }
  };

  // Function to send via DirectLine
  const sendViaDirectLine = (contentUrl) => {

    if (!directLine) {
      console.error('DirectLine not available');
      return;
    }

    directLine.postActivity({
      type: 'message',
      text: '',
      from: { id: userId || 'user' },
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.audio',
          content: {
            media: [{ url: contentUrl }],
            autoloop: false,
            autostart: false,
            shareable: true,
            value: {
              recordedAt: new Date().toISOString()
            }
          }
        }
      ]
    }).subscribe(
      id => console.log('Message audio sent activity ID:', id),
      error => console.error('Error sending message:', error)
    );
  };

  // Arrow icon SVG component
  const ArrowDownIcon = () => (
    <svg viewBox="0 0 24 24" width="32" height="32" className="arrow-down-icon">
      <path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"></path>
    </svg>
  );

  // Handle the invitation actions
  const handleStartChat = () => {
    setShowInvitation(false);
    toggleChat(); // Open the chat
  };

  const handleDismissInvitation = () => {
    setShowInvitation(false);
  };

  // Function to show welcome popup
  const showWelcomePopup = useCallback(() => {
    if (isChatOpen) {
      // If chat is open, store the request and don't show the popup yet
      setWelcomeRequested(true);
    } else {
      // Only show invitation if chat is closed
      setShowInvitation(true);
    }
  }, [isChatOpen]);

  // Store the showWelcomePopup function in the ref
  useEffect(() => {
    if (onShowWelcomePopupRef) {
      onShowWelcomePopupRef.current = showWelcomePopup;
    }
  }, [showWelcomePopup, onShowWelcomePopupRef]);

  // Update the chatWasEverOpened state when chat is opened
  useEffect(() => {
    if (isChatOpen) {
      setChatWasEverOpened(true);
    }
  }, [isChatOpen]);

  // Close the chat
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  // Show invitation after a delay - simplified logic
  useEffect(() => {
    // Only set up the initial delay if connection is confirmed and chat was never opened
    if (connectionConfirmed && !chatWasEverOpened && !showInvitation) {
      const delay = styleOptions?.welcomeInitialDelay || 3000; // 3 seconds for testing

      const timer = setTimeout(() => {
        // Only show welcome popup if chat is still closed and was never opened
        if (!isChatOpen && !chatWasEverOpened) {
          setShowInvitation(true);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [styleOptions, connectionConfirmed, isChatOpen, chatWasEverOpened, showInvitation]);

  const findSendBoxMain = () => {
    const webchatElement = document.getElementById('webchat');
    if (!webchatElement) return;

    const sendBoxMainElement = webchatElement.querySelector('.webchat__send-box__main');
    if (!sendBoxMainElement) return;

    // Create a container for the recorder that will be inserted at the beginning
    const recorderContainerElement = document.createElement('div');
    recorderContainerElement.className = 'recorder-container';

    // Insert the recorder container at the beginning of sendBoxMain
    if (sendBoxMainElement.firstChild) {
      sendBoxMainElement.insertBefore(recorderContainerElement, sendBoxMainElement.firstChild);
    } else {
      sendBoxMainElement.appendChild(recorderContainerElement);
    }

    // Store both elements in state
    setSendBoxMain(sendBoxMainElement);
    setRecorderContainer(recorderContainerElement);
    portalMountedRef.current = true;

    // Try to get the WebChat store from the global window object
    if (window.webChatStore) {
      setWebChatStore(window.webChatStore);
    } else {
    }

    // Clear the interval once we've found the element
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Add AudioRecorder to the WebChat send box
  useEffect(() => {
    if (connectionConfirmed && directLine && !portalMountedRef.current && !hideVoiceRecorder) {

      // Try to find the send box after WebChat is fully rendered
      intervalRef.current = setInterval(() => {
        findSendBoxMain();
      }, 1000);

      // Clear interval after a reasonable time to prevent infinite attempts
      setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 10000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [connectionConfirmed, directLine, hideVoiceRecorder]);

  // Render the VoiceAudioRecorder into the recorderContainer using a portal
  const audioRecorderPortal = !hideVoiceRecorder && recorderContainer && ReactDOM.createPortal(
    <VoiceAudioRecorder
      onRecordingComplete={(blob, recordingTime) => {
        handleRecordingComplete(blob, recordingTime);
      }}
      onRecordingStateChange={(state) => {
        handleRecordingStateChange(state);
      }}
    />,
    recorderContainer
  );

  return (
    <>
      {/* Root Container */}
      <div className={`chat-root ${showInvitation ? 'with-invitation' : ''}`}>
        {/* Toggle button - always shown when connected unless invitation is showing */}
        {connectionConfirmed && !showInvitation && (
          <div id="chat-launcher" className="chat-launcher" onClick={toggleChat}>
            {isChatOpen ? <ArrowDownIcon /> : launcherIcon}
          </div>
        )}
        <div id="chat-container" className="chat-container" ref={containerRef}>
          <div className="chat-widget">
            {/* Custom Header - only shown if header.show is true */}
            {header.show && (
              <div className="chat-header">
                <h1 className="chat-title">{header.title}</h1>
                {header.subtitle && <p className="chat-subtitle">{header.subtitle}</p>}
              </div>
            )}

            {/* Web Chat */}
            <div className="chat-body">
              <div id="webchat" role="main" className="webchat-container" />
            </div>
          </div>
          {audioRecorderPortal}
        </div>

        {/* Chat Invitation Popup */}
        {connectionConfirmed && showInvitation && !isChatOpen && (
          <ChatInvitation
            avatarImage={styleOptions?.welcomeAvatarImage}
            onStartChat={handleStartChat}
            onDismiss={handleDismissInvitation}
          />
        )}
      </div>
    </>
  );
};

export default ChatWidgetUI;
