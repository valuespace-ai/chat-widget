import { createDirectLine, createStore } from 'botframework-webchat';

/**
 * DirectLineManager handles the connection to the bot service
 * and manages the DirectLine connection state
 */
const DirectLineManager = {
  /**
   * Creates a DirectLine connection to the bot service
   * @param {string} botServiceUrl - URL of the bot service
   * @param {string} userId - User ID for the conversation
   * @param {string} userName - User name for the conversation
   * @param {string} tenantId - Tenant ID for the conversation
   * @param {object} channelData - Additional channel data to send with messages
   * @returns {Promise<{directLine: object, conversationId: string, store: object, newConversation: boolean}>} - DirectLine connection and store
   */
  createConnection: async (botServiceUrl, userId, userName, tenantId, channelData = {}) => {
    try {
      const res = await fetch(`${botServiceUrl}/api/directline/token?userId=${userId}&userName=${encodeURIComponent(userName)}&tenantId=${tenantId}`);
      let responseData = await res.text();
      console.log('botServiceUrl:', botServiceUrl);

      // Parse the response data carefully
      let parsedData = JSON.parse(responseData);

      // Extract token and style with defaults
      const token = parsedData?.token;
      const conversationId = parsedData?.conversationId;
      const serverStyle = parsedData?.style || {};
      const newConversation = parsedData?.newConversation || false;

      if (!token) {
        throw new Error('No token received from server');
      }

      // Create DirectLine with the token and additional options
      const directLine = createDirectLine({
        token,
        //conversationId,
        watermark: '0',
        domain: 'https://directline.botframework.com/v3/directline',
        webSocket: true // Enable WebSocket for better connection stability
      });

      console.log('DirectLine created with token:', token);
      console.log('DirectLine created with conversationId:', conversationId);

      // Create store with channel data
      const store = createStore({}, ({ dispatch }) => next => action => {
        // Safe logging only for actions that include an activity
        if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
          if (action.payload.activity.type !== 'typing') {
            //console.log('✅ Bot incoming activity:', action.payload.activity);
          }
        }

        if (action.type === 'WEB_CHAT/SEND_MESSAGE') {
          action.payload = {
            ...action.payload,
            channelData: {
              pageUrl: window.location.href,
              ...channelData
            }
          };
        }

        return next(action);
      });

      return {
        directLine,
        conversationId,
        store,
        serverStyle,
        newConversation
      };
    } catch (error) {
      console.error('Error creating DirectLine connection:', error);
      throw error;
    }
  },

  /**
   * Subscribe to connection status changes
   * @param {object} directLine - DirectLine connection
   * @param {function} onStatusChange - Callback for status changes
   * @returns {object} - Subscription object
   */
  subscribeToConnectionStatus: (directLine, onStatusChange) => {
    return directLine.connectionStatus$.subscribe(status => {
      onStatusChange(status);
    });
  },

  /**
   * Handle connection status changes with appropriate actions
   * @param {object} directLine - DirectLine connection
   * @param {boolean} newConversation - Whether this is a new conversation
   * @param {string} userId - User ID for the conversation
   * @param {string} userName - User name for the conversation
   * @param {object} callbacks - Callback functions for different connection states
   * @returns {object} - Subscription object
   */
  handleConnectionStatus: (directLine, newConversation, userId, userName, callbacks) => {
    const { onConnectionFailed, onConnectionConfirmed, onReconnectNeeded } = callbacks;

    return directLine.connectionStatus$.subscribe(status => {
      // Connection failed (fatal)
      if (status === 5) {
        if (onReconnectNeeded) {
          onReconnectNeeded('Connection failed (fatal)');
        }
        if (onConnectionFailed) {
          onConnectionFailed();
        }
      }

      // Token expired
      else if (status === 3) {
        if (onReconnectNeeded) {
          onReconnectNeeded('Token expired');
        }
        if (onConnectionFailed) {
          onConnectionFailed();
        }
      }

      // Connection failed
      else if (status === 4) {
        if (onConnectionFailed) {
          onConnectionFailed();
        }
      }

      // Connected successfully
      else if (status === 2) {
        if (onConnectionConfirmed) {
          onConnectionConfirmed();
        }
      }

      // Connecting
      else if (status === 1) {
        console.log('Chat widget connecting...');
      }
    });
  }
};

export default DirectLineManager;
