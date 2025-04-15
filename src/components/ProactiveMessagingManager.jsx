/**
 * ProactiveMessagingManager.jsx
 * Manages proactive messaging functionality for the chat widget
 */

/**
 * Setup proactive messaging functionality and expose global methods
 * @param {Object} directLine - DirectLine object for communication
 * @param {Object} store - WebChat store
 * @param {Function} toggleChat - Function to toggle chat open/closed
 * @param {boolean} isChatOpen - Current state of chat (open/closed)
 * @param {Function} handleShowWelcomePopup - Function to show welcome popup
 * @returns {Object} The global chatWidgetProactive object
 */
const setupProactiveMessaging = (directLine, store, toggleChat, isChatOpen, handleShowWelcomePopup) => {
  // Function to send a proactive message from the bot
  const sendProactiveMessage = (text, options = {}) => {
    console.log('[ChatWidget] Sending proactive message:', text);

    if (!directLine) {
      console.error('[ChatWidget] DirectLine not available for proactive message');
      return;
    }

    // Create activity object for the message
    const activity = {
      type: 'message',
      text: text,
      from: {
        id: 'bot',
        name: 'Bot',
        role: 'bot'
      },
      timestamp: new Date().toISOString(),
      ...options
    };

    // Post activity to the conversation
    directLine.postActivity(activity).subscribe(
      id => console.log('[ChatWidget] Proactive message sent, ID:', id),
      error => console.error('[ChatWidget] Error sending proactive message:', error)
    );

    // Open the chat if it's closed
    if (!isChatOpen) {
      toggleChat();
    }
  };

  // Function to show a notification without opening the chat
  const showNotification = (text, options = {}) => {
    console.log('[ChatWidget] Showing notification:', text);

    // Create notification element
    const notificationElement = document.createElement('div');
    notificationElement.className = 'webchat-notification';
    notificationElement.innerHTML = `
      <div class="webchat-notification-content">
        <div class="webchat-notification-text">${text}</div>
        ${options.actionText ? `<button class="webchat-notification-action">${options.actionText}</button>` : ''}
      </div>
      <button class="webchat-notification-close">×</button>
    `;

    // Add notification to the DOM
    document.body.appendChild(notificationElement);

    // Add event listeners
    const closeButton = notificationElement.querySelector('.webchat-notification-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        notificationElement.classList.add('closing');
        setTimeout(() => {
          document.body.removeChild(notificationElement);
        }, 300);
      });
    }

    const actionButton = notificationElement.querySelector('.webchat-notification-action');
    if (actionButton && options.onAction) {
      actionButton.addEventListener('click', () => {
        options.onAction();
        notificationElement.classList.add('closing');
        setTimeout(() => {
          document.body.removeChild(notificationElement);
        }, 300);
      });
    }

    // Auto-dismiss after timeout if specified
    if (options.timeout) {
      setTimeout(() => {
        if (document.body.contains(notificationElement)) {
          notificationElement.classList.add('closing');
          setTimeout(() => {
            if (document.body.contains(notificationElement)) {
              document.body.removeChild(notificationElement);
            }
          }, 300);
        }
      }, options.timeout);
    }
  };
  
  // Function to show the welcome popup
  const showWelcomePopup = () => {
    console.log('[ChatWidget] Showing welcome popup');
    
    // Close the chat if it's open before showing the welcome popup
    if (isChatOpen) {
      toggleChat(); // Close the chat
      
      // Wait a short time for the chat to close before showing the welcome popup
      setTimeout(() => {
        if (handleShowWelcomePopup) {
          handleShowWelcomePopup();
        }
      }, 300);
    } else {
      // If chat is already closed, just show the welcome popup
      if (handleShowWelcomePopup) {
        handleShowWelcomePopup();
      }
    }
  };

  // Make functions globally available
  const chatWidgetProactive = {
    sendProactiveMessage,
    openChat: toggleChat,
    showNotification,
    showWelcomePopup
  };
  
  // Assign to window object
  window.chatWidgetProactive = chatWidgetProactive;
  
  return chatWidgetProactive;
};

// Export the ProactiveMessagingManager object
const ProactiveMessagingManager = {
  setupProactiveMessaging
};

export default ProactiveMessagingManager;
