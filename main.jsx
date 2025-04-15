import React from 'react';
import ReactDOM from 'react-dom/client';
import StyleManager from './src/components/StyleManager';
import ChatWidget from './src/components/chatWidget';
import './src/components/chatWidget.css';
import StandaloneExample from './src/examples/StandaloneExample';
import './src/styles/test-buttons.css';

// Create test buttons for proactive messaging
const createTestButtons = () => {
  // Create container for test buttons
  const testButtonsContainer = document.createElement('div');
  testButtonsContainer.className = 'notification-test-panel';

  // Create notification test button
  const notificationButton = document.createElement('button');
  notificationButton.className = 'notification-test-button';
  notificationButton.textContent = 'Test Notification';
  notificationButton.addEventListener('click', () => {
    if (window.chatWidgetProactive) {
      window.chatWidgetProactive.showNotification("This is a test notification!", {
        actionText: "Open Chat",
        onAction: () => window.chatWidgetProactive.openChat(),
        timeout: 8000
      });
    }
  });

  // Create proactive message test button
  const proactiveButton = document.createElement('button');
  proactiveButton.className = 'notification-test-button';
  proactiveButton.textContent = 'Test Proactive Message';
  proactiveButton.addEventListener('click', () => {
    if (window.chatWidgetProactive) {
      window.chatWidgetProactive.sendProactiveMessage("Hello! This is a proactive message from the bot.");
    }
  });

  // Create welcome popup test button
  const welcomeButton = document.createElement('button');
  welcomeButton.className = 'notification-test-button';
  welcomeButton.textContent = 'Test Welcome Popup';
  welcomeButton.addEventListener('click', () => {
    // Use the global chatWidgetProactive object to show the welcome popup
    if (window.chatWidgetProactive && window.chatWidgetProactive.showWelcomePopup) {
      window.chatWidgetProactive.showWelcomePopup();
    } else {
      console.error('Welcome popup function not available');
    }
  });

  // Add buttons to container
  testButtonsContainer.appendChild(notificationButton);
  testButtonsContainer.appendChild(proactiveButton);
  testButtonsContainer.appendChild(welcomeButton);

  // Add container to document
  document.body.appendChild(testButtonsContainer);
};

// This function will be exposed to the global scope
// so it can be called by the host website
window.initChatWidget = (config = {}) => {
  // Create a container for the chat widget if it doesn't exist
  let container = document.getElementById('vs-chat-widget-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'vs-chat-widget-container';
    document.body.appendChild(container);
  }

  // Render the chat widget with the provided configuration
  const root = ReactDOM.createRoot(container);
  root.render(<ChatWidget {...config} />);

  // Create test buttons for development
  if (config.showTestButtons || process.env.NODE_ENV === 'development') {
    setTimeout(() => createTestButtons(), 1000);
  }

  // Return methods that can be called by the host website
  return {
    // Expose methods that can be called by the host website
    destroy: () => {
      root.unmount();
      container.remove();

      // Remove test buttons if they exist
      const testButtons = document.querySelector('.notification-test-panel');
      if (testButtons) {
        testButtons.remove();
      }
    },
    // Add more methods as needed
  };
};

// Auto-initialize if the script is loaded directly in a page with a root element
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);

    // Check if we should show the example or the regular widget
    const urlParams = new URLSearchParams(window.location.search);
    const showExample = urlParams.get('example') === 'true';

    // Check for configuration in URL parameters
    const configParam = urlParams.get('config');
    let configFromUrl = null;

    if (configParam) {
      try {
        // Parse the configuration from the URL parameter
        configFromUrl = JSON.parse(decodeURIComponent(configParam));
        console.log('%c[ChatWidget] Loaded configuration from URL:', 'background: #20b69e; color: white; padding: 4px 8px; border-radius: 4px;', configFromUrl);

        // Use StyleManager to merge with default configuration
        const defaultConfig = StyleManager.getDefaultConfig();
        configFromUrl = StyleManager.mergeConfigurations(defaultConfig, configFromUrl);
        console.log('%c[ChatWidget] Chat configuration updated:', 'background: #db4061; color: white; padding: 4px 8px; border-radius: 4px;', configFromUrl);
      } catch (error) {
        console.error('[ChatWidget] Error parsing configuration from URL:', error);
      }
    }

    if (showExample) {
      // Render the standalone example
      root.render(<StandaloneExample />);
    } else {
      // Render the regular chat widget with configuration from URL if available
      root.render(<ChatWidget {...configFromUrl} />);
    }

    // Create test buttons for development
    if (process.env.NODE_ENV === 'development' && !showExample) {
      setTimeout(() => createTestButtons(), 1000);
    }
  }
});

// Export the ChatWidget component for use in other React applications
export default ChatWidget;
