import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AttachmentMiddleware } from './AttachmentMiddleware.jsx';
import './chatWidget.css';
import ChatWidgetUI from './ChatWidgetUI';
import DirectLineManager from './DirectLineManager';
import ProactiveMessagingManager from './ProactiveMessagingManager';
import StyleManager from './StyleManager';

// Suppress specific React warnings that come from the WebChat library
// This is a temporary solution until the WebChat library is updated to support React 18
const originalConsoleError = console.error;
console.error = function filterWarnings(msg, ...args) {
  // Filter out specific React warnings
  if (typeof msg === 'string' && (
    msg.includes('ReactDOM.render is no longer supported in React 18') ||
    msg.includes('Cannot update a component') ||
    msg.includes('Support for defaultProps will be removed from')
  )) {
    return;
  }
  return originalConsoleError(msg, ...args);
};

// Initialize the global chatWidgetProactive object
window.chatWidgetProactive = {
  sendProactiveMessage: null,
  openChat: null,
  showNotification: null
};

const ChatWidget = (props) => {
  const [webchatStarted, setWebchatStarted] = useState(false);
  const [connectionConfirmed, setConnectionConfirmed] = useState(false);
  const containerRef = useRef(null);
  const [directLine, setDirectLine] = useState(null);
  const [styleOptions, setStyleOptions] = useState(null);
  const [userHighlighting, setUserHighlighting] = useState(false);
  const [webChatStore, setWebChatStore] = useState(null);
  const stylesRef = useRef(null);
  const [serverStyle, setServerStyle] = useState(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const userId = useRef(localStorage.getItem('userId') || crypto.randomUUID());
  useEffect(() => {
    localStorage.setItem('userId', userId.current);
  }, []);

  const startWebChat = async () => {
    if (webchatStarted) return;

    console.log("import.meta.env.VITE_BOT_SERVICE_URL", import.meta.env.VITE_BOT_SERVICE_URL);

    try {
      // Create DirectLine connection
      const { directLine: dl, serverStyle, store, newConversation } = await DirectLineManager.createConnection(
        import.meta.env.VITE_BOT_SERVICE_URL,
        userId.current,
        props.userName,
        props.tenantId,
        props.channelData
      );

      // Save the store to state so it can be used later
      setWebChatStore(store);

      // Save server style for later processing
      setServerStyle(serverStyle);

      // Handle connection status with DirectLineManager
      DirectLineManager.handleConnectionStatus(dl, newConversation, userId.current, props.userName, {
        onConnectionFailed: () => {
          console.error('Connection failed');
          setConnectionConfirmed(false);
        },
        onConnectionConfirmed: () => {
          console.log('%c[ChatWidget] Chat widget connected successfully', 'background: #20b69e; color: white; padding: 4px 8px; border-radius: 4px;');
          setConnectionConfirmed(true);
        },
        onReconnectNeeded: (reason) => {
          console.warn(`Connection issue: ${reason}`);
          console.log(`Attempting to reconnect due to: ${reason}`);
          setTimeout(() => {
            startWebChat();
          }, 3000);
        }
      });

      // Update state
      setDirectLine(dl);
      setWebchatStarted(true);
    } catch (error) {
      console.log('%c[ChatWidget] Merged with default configuration:', 'background: #db4061; color: white; padding: 4px 8px; border-radius: 4px;', configFromUrl);
      console.error('Error initializing Web Chat:', error);
    }
  };

  // Initialize chat on component mount
  useEffect(() => {
    startWebChat();
  }, []);

  // Initialize chat container when component mounts
  useEffect(() => {
    if (containerRef.current) {
      if (isChatOpen) {
        containerRef.current.classList.add('open');
      } else {
        containerRef.current.classList.remove('open');
      }
    }
  }, [containerRef, isChatOpen]);

  // Set style state values when stylesRef is updated
  useEffect(() => {
    try {
      if (stylesRef.current) {
        const { highlightingEnabled, styleOptions } = stylesRef.current;

        // Set style state values
        setUserHighlighting(highlightingEnabled);
        setStyleOptions(styleOptions);
      }
    } catch (error) {
      console.error('Error setting style state values:', error);
    }
  }, [serverStyle]);

  // Create a ref to store the showWelcomePopup function
  const showWelcomePopupRef = useRef(null);

  // Pass the showWelcomePopup function to ChatWidgetUI and store it in the ref
  const handleShowWelcomePopup = useCallback(() => {
    if (showWelcomePopupRef.current) {
      showWelcomePopupRef.current();
    }
  }, []);

  // Render WebChat when directLine, store, and styles are available
  useEffect(() => {
    // Prevent multiple renders
    if (isRendering) return;

    // Skip if missing required data
    if (!directLine || !webChatStore || !webchatStarted || !serverStyle) return;

    setIsRendering(true);

    try {
      // Process all styles in a single step
      // Get default configuration from StyleManager
      const defaultConfig = StyleManager.getDefaultConfig();

      const config = defaultConfig;
      stylesRef.current = StyleManager.processStyles(serverStyle);

      // Make the store globally accessible
      window.webChatStore = webChatStore;

      // Apply CSS variables
      StyleManager.applyRootCssVariables(stylesRef.current.styleOptions);

      // Create composed attachment middleware (audio + bubble)
      const attachmentMiddleware = AttachmentMiddleware(stylesRef.current.styleOptions);
      const activityMiddleware = StyleManager.createHighlightingMiddleware(
        stylesRef.current.styleOptions?.userHighlighting || false
      );

      // Get the webchat container element
      const webchatElement = document.getElementById('webchat');

      // Render WebChat with configuration
      window.WebChat.renderWebChat(
        {
          directLine,
          locale: 'ru-RU', // or 'en-US', 'de-DE', 'fr-FR', etc.
          enableUIAdaptiveCards: true,
          styleOptions: stylesRef.current.styleOptions,
          experimentalFeatureSettings: {
            adaptiveCards: {
              enableActionExecute: true
            },
            uploadThumbnail: true
          },
          adaptiveCardsHostConfig: {
            supportsInteractivity: true,
            containerStyles: stylesRef.current.adaptiveCardsContainerStyles
          },
          debug: true,
          sendTypingIndicator: true,
          store: webChatStore,
          activityMiddleware,
          attachmentMiddleware
        },
        webchatElement
      );

      // Set up proactive messaging capabilities
      ProactiveMessagingManager.setupProactiveMessaging(directLine, webChatStore, toggleChat, isChatOpen, handleShowWelcomePopup);

      // Set style state values
      setUserHighlighting(stylesRef.current.highlightingEnabled);
      setStyleOptions(stylesRef.current.styleOptions);
    } catch (error) {
      console.error('%c[ChatWidget] Error rendering WebChat:', 'background: #db4061; color: white; padding: 4px 8px; border-radius: 4px;', error);
    } finally {
      setIsRendering(false);
    }
  }, [directLine, webChatStore, webchatStarted, serverStyle]);

  // Toggle chat visibility
  const toggleChat = useCallback(() => {
    if (containerRef.current) {
      const newIsOpen = !isChatOpen;
      setIsChatOpen(newIsOpen);

      if (newIsOpen) {
        containerRef.current.classList.add('open');
      } else {
        containerRef.current.classList.remove('open');
      }
    }
  }, [containerRef, isChatOpen]);

  // Update the proactive messaging when toggleChat changes
  useEffect(() => {
    if (directLine && webchatStarted) {
      ProactiveMessagingManager.setupProactiveMessaging(directLine, webChatStore, toggleChat, isChatOpen, handleShowWelcomePopup);
    }
  }, [directLine, webChatStore, webchatStarted, toggleChat, isChatOpen, handleShowWelcomePopup]);

  // Create UI styles using StyleManager
  const getUIStyles = () => {
    // If styles have been processed, use them
    if (stylesRef.current) {
      return {
        launcherStyle: stylesRef.current.styleOptions?.launcher || {},
        hideVoiceRecorder: stylesRef.current.hideVoiceRecorder,
        headerOptions: stylesRef.current.styleOptions
      };
    }

    // Fallback to default styles
    return {
      launcherStyle: serverStyle?.styleOptions?.launcher || {},
      hideVoiceRecorder: false,
      headerOptions: serverStyle?.styleOptions
    };
  };

  // Update the global chatWidgetProactive object with the latest showWelcomePopup function
  useEffect(() => {
    if (window.chatWidgetProactive) {
      window.chatWidgetProactive.showWelcomePopup = handleShowWelcomePopup;
    }
  }, [handleShowWelcomePopup]);

  const { launcherStyle, hideVoiceRecorder, headerOptions } = getUIStyles();

  return (
    <ChatWidgetUI
      connectionConfirmed={connectionConfirmed}
      toggleChat={toggleChat}
      containerRef={containerRef}
      launcherIcon={launcherStyle.launcherIcon}
      directLine={directLine}
      userId={userId.current}
      hideVoiceRecorder={hideVoiceRecorder}
      header={{
        title: headerOptions?.headerTitle,
        subtitle: headerOptions?.headerSubtitle,
        backgroundColor: headerOptions?.headerBackgroundColor,
        textColor: headerOptions?.headerTextColor,
        show: headerOptions?.showHeader !== undefined ? headerOptions.showHeader : true
      }}
      isChatOpen={isChatOpen}
      styleOptions={styleOptions}
      onShowWelcomePopupRef={showWelcomePopupRef}
    />
  );
};

export default ChatWidget;