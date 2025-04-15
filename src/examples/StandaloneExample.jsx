import React from 'react';
import ChatWidget from '../components/chatWidget';

/**
 * StandaloneExample - A complete example of the chat widget with documentation
 * This component can be imported and used directly in the main application
 */
const StandaloneExample = () => {
  // Configuration for the chat widget
  const widgetConfig = {
    botServiceUrl: 'http://localhost:3978',
    userName: 'User',
    tenantId: 'default',
    customStyles: {
      styleOptions: {
        // Launcher (toggle button) styling
        launcher: {
          background: '#db4061',
          color: 'white',
          width: '60px',
          height: '60px'
        },
        
        // Chat window dimensions
        rootWidth: '400px',
        rootHeight: '700px',
        
        // Input area styling
        sendBoxBackground: 'white',
        
        // Message bubbles
        bubbleMaxWidth: 280,
        bubbleBackground: "white",
        bubbleFromUserBackground: "#20b69e",
        bubbleTextColor: "#000000",
        bubbleFromUserTextColor: "white",
        userHighlighting: true,
        
        // Avatar configuration
        welcomeAvatarImage: 'https://e7.pngegg.com/pngimages/191/906/png-clipart-internet-bot-chatbot-business-chatbot-avatar-child-face.png',
        hideAvatar: true,
        avatarSize: 0,
        
        // Welcome popup - Set to 0 to prevent automatic popup
        welcomeInitialDelay: 0, // Disable automatic welcome popup
        
        // Header configuration
        headerTitle: 'Hi there! 👋',
        headerSubtitle: "Ask me anything — I'm here to help!",
        headerBackgroundColor: '#101330',
        headerTextColor: 'white',
        showHeader: true
      }
    }
  };

  // Test functions for proactive messaging
  const testShowWelcomePopup = () => {
    // Special test logic for welcome popup
    // 1. First close the chat if it's open
    if (window.chatWidgetProactive) {
      // Check if chat is open by looking at the container
      const chatContainer = document.getElementById('chat-container');
      const isOpen = chatContainer && chatContainer.classList.contains('open');
      
      if (isOpen) {
        // Close the chat first
        window.chatWidgetProactive.openChat();
      }
      
      // Wait a short time for the chat to close
      setTimeout(() => {
        // Hide the toggle button and show welcome popup
        // This is handled by the ChatWidgetUI component when showWelcomePopup is called
        window.chatWidgetProactive.showWelcomePopup();
      }, 300);
    }
  };

  const testOpenChat = () => {
    if (window.chatWidgetProactive) {
      window.chatWidgetProactive.openChat();
    }
  };

  const testSendProactiveMessage = () => {
    if (window.chatWidgetProactive) {
      window.chatWidgetProactive.sendProactiveMessage('This is a test proactive message from the example page!');
    }
  };

  return (
    <div className="standalone-example">
      <div className="page-header">
        <h1>ValueSpace Chat Widget - Complete Example</h1>
      </div>
      
      <div className="content">
        <p><strong>Note:</strong> This is a documentation page. The actual chat widget appears in the bottom-right corner of the page.</p>
        
        <p>This page demonstrates the complete ValueSpace Chat Widget with all styling options and the toggle button. The widget is fully functional and connected to the DirectLine service.</p>
        
        <div className="config-section">
          <h2>Current Configuration</h2>
          <p>The widget below is initialized with the following configuration:</p>
          <pre><code>{JSON.stringify(widgetConfig, null, 2)}</code></pre>
        </div>
        
        <h2>How to Integrate</h2>
        <p>To add the complete chat widget to your website:</p>
        
        <div className="code-block">
          <pre><code>{`
// 1. Include the chat widget script
<script src="path/to/vs-chat-widget.iife.js"></script>

// 2. Initialize the widget with your configuration
<script>
  window.initChatWidget({
    botServiceUrl: 'http://localhost:3978',
    userName: 'User',
    tenantId: 'default',
    customStyles: {
      styleOptions: {
        // Your style customizations here
        userHighlighting: true,
        welcomeInitialDelay: 5000,
        launcher: {
          background: '#db4061',
          color: 'white'
        }
      }
    }
  });
</script>
          `}</code></pre>
        </div>
        
        <h2>Available Style Options</h2>
        <p>The widget supports extensive styling options, including:</p>
        <ul>
          <li><span className="highlight">launcher</span>: Customize the toggle button appearance</li>
          <li><span className="highlight">rootWidth/rootHeight</span>: Set the chat window dimensions</li>
          <li><span className="highlight">sendBoxBackground</span>: Style the input area</li>
          <li><span className="highlight">bubbleBackground/bubbleFromUserBackground</span>: Style message bubbles</li>
          <li><span className="highlight">userHighlighting</span>: Enable highlighting of user messages</li>
          <li><span className="highlight">headerTitle/headerSubtitle</span>: Customize the header text</li>
          <li><span className="highlight">headerBackgroundColor/headerTextColor</span>: Style the header</li>
          <li><span className="highlight">welcomeInitialDelay</span>: Set delay for welcome popup</li>
        </ul>
        
        <div className="test-buttons">
          <h3>Test Proactive Features</h3>
          <p>Use these buttons to test the proactive messaging features:</p>
          <div className="button-group">
            <button onClick={testShowWelcomePopup} className="test-button">
              Show Welcome Popup
            </button>
            <button onClick={testOpenChat} className="test-button">
              Toggle Chat
            </button>
            <button onClick={testSendProactiveMessage} className="test-button">
              Send Proactive Message
            </button>
          </div>
        </div>
        
        <div className="footer-spacer"></div>
      </div>
      
      {/* Render the actual chat widget with the configuration */}
      <ChatWidget {...widgetConfig} />
    </div>
  );
};

// Add CSS styles for the example page
const styles = `
  .standalone-example {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    color: #333;
  }
  
  /* Ensure the chat launcher is always visible regardless of other states */
  .chat-launcher {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
    z-index: 9999 !important;
  }
  
  /* Override the condition in ChatWidgetUI that hides the launcher when invitation is shown */
  .chat-root.with-invitation .chat-launcher {
    display: flex !important;
  }
  
  .page-header {
    background-color: #101330;
    color: white;
    padding: 15px 0;
    text-align: center;
    margin-bottom: 20px;
  }
  
  h1 {
    color: white;
    margin-bottom: 20px;
  }
  
  h2 {
    color: #101330;
    margin-top: 30px;
    margin-bottom: 15px;
  }
  
  h3 {
    color: #101330;
    margin-top: 25px;
    margin-bottom: 10px;
  }
  
  /* Test buttons styling */
  .test-buttons {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    margin: 30px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 15px;
  }
  
  .test-button {
    padding: 10px 16px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    min-width: 160px;
  }
  
  .test-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .test-button:active {
    transform: translateY(0);
  }
  
  .test-button:nth-child(1) {
    background-color: #db4061;
    color: white;
  }
  
  .test-button:nth-child(2) {
    background-color: #20b69e;
    color: white;
  }
  
  .test-button:nth-child(3) {
    background-color: #101330;
    color: white;
  }
  
  .footer-spacer {
    height: 100px;
  }
  
  code {
    background-color: #f0f0f0;
    padding: 2px 5px;
    border-radius: 3px;
    font-family: monospace;
  }
  
  pre {
    background-color: #f0f0f0;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    margin: 20px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

// Inject the styles into the document
const injectStyles = () => {
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
  }
};

// Call the function to inject styles
injectStyles();

export default StandaloneExample;
