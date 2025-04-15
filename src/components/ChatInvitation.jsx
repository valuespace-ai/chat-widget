import React from 'react';
import './chatInvitation.css';

/**
 * ChatInvitation component - A friendly popup invitation to start a chat
 * @param {object} props - Component props
 * @param {string} props.avatarImage - URL to the bot avatar image
 * @param {function} props.onStartChat - Function to call when user clicks "Chat Now"
 * @param {function} props.onDismiss - Function to call when user clicks "No Thanks"
 * @returns {JSX.Element} - The rendered component
 */
const ChatInvitation = ({ avatarImage, onStartChat, onDismiss }) => {
  return (
    <div className="chat-invitation">
      {/* Blue banner header */}
      <div className="chat-invitation-header"></div>
      
      {/* Avatar image */}
      <div className="chat-invitation-avatar">
        <img 
          src={avatarImage} 
          alt="Chat Assistant" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23101330"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';
          }}
        />
      </div>
      
      {/* Main message */}
      <div className="chat-invitation-message">
        Can we help you?
      </div>
      
      {/* Action buttons */}
      <div className="chat-invitation-actions">
        <button 
          className="chat-invitation-primary" 
          onClick={onStartChat}
        >
          Chat Now
        </button>
        <button 
          className="chat-invitation-secondary" 
          onClick={onDismiss}
        >
          No Thanks ›
        </button>
      </div>
    </div>
  );
};

export default ChatInvitation;
