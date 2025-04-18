import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './src/components/chatWidget';
import './src/components/chatWidget.css';

// Only expose the initChatWidget function for embedding the chat widget
function initChatWidget(config = {}) {
  console.log('[initChatWidget] called with config:', config);
  // Create a container if not provided
  let container = config.container;
  if (!container) {
    container = document.createElement('div');
    container.id = 'vs-chat-widget-container';
    document.body.appendChild(container);
    console.log('[initChatWidget] Created new container:', container);
  } else {
    console.log('[initChatWidget] Using provided container:', container);
  }
  // Safety check: ensure container is a real DOM element
  if (!(container instanceof HTMLElement)) {
    console.error('[initChatWidget] Target container is not a DOM element.', container);
    return;
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

// Auto-mount the widget in dev/app mode if running as a standalone app
if (import.meta.env.DEV) {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    ReactDOM.createRoot(rootEl).render(
      // Removed <React.StrictMode> to avoid double-mount/dev logs
      <ChatWidget userName="Guest" tenantId="vesperworld" channelData={{}} />
    );
  }
}

// Export the ChatWidget component for use in other React applications
export default ChatWidget;
