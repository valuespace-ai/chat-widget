import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './src/components/chatWidget';
import './src/components/chatWidget.css';

// Only expose the initChatWidget function for embedding the chat widget
function initChatWidget(config = {}) {
  // Create a container if not provided
  let container = config.container;
  if (!container) {
    container = document.createElement('div');
    container.id = 'vs-chat-widget-container';
    document.body.appendChild(container);
  }

  // Render the chat widget with the provided configuration
  const root = ReactDOM.createRoot(container);
  root.render(<ChatWidget {...config} />);

  // Return methods that can be called by the host website
  return {
    destroy: () => {
      root.unmount();
      container.remove();
    }
    // Add more exposed methods if needed
  };
}

window.initChatWidget = window.initChatWidget || initChatWidget;

// Export the ChatWidget component for use in other React applications
export default ChatWidget;
