import deepmerge from 'deepmerge';
import React from 'react';

/**
 * StyleManager handles the creation and management of styles for the chat widget
 */
const StyleManager = {
  /**
   * Process all styles in a single step, combining server and config styles
   * @param {object} serverStyle - Style received from the server
   * @param {object} configStyle - Style provided in the component config
   * @returns {object} - All processed style values in a single object
   */
  processStyles: (serverStyle, configStyle) => {
    // Server and config style options with defaults
    const serverStyleOptions = serverStyle?.styleOptions || {};
    const configStyleOptions = configStyle?.styleOptions || {};

    //console.log('Server styleOptions:', serverStyleOptions);
    console.log('Config styleOptions:', configStyleOptions);

    // Deep merge style options using deepmerge library
    const styleOptions = deepmerge(serverStyleOptions, configStyleOptions);

    //console.log('Merged styleOptions:', styleOptions);

    // Extract launcher for convenience
    const launcherStyle = styleOptions.launcher || {};

    // Check if highlighting is enabled in styleOptions
    const highlightingEnabled = styleOptions.userHighlighting || false;

    // Determine if voice recorder should be hidden
    const hideVoiceRecorder = styleOptions.hideVoiceRecorder || false;

    // Return all processed styles in a single object
    return {
      styleOptions,
      highlightingEnabled,
      launcherStyle,
      hideVoiceRecorder
    };
  },

  /**
   * Merge configurations with proper deep merging using deepmerge
   * @param {object} defaultConfig - Default configuration object
   * @param {object} userConfig - User-provided configuration object
   * @returns {object} - Merged configuration
   */
  mergeConfigurations: (defaultConfig, userConfig) => {
    // If userConfig is null or undefined, return defaultConfig
    if (!userConfig) {
      return defaultConfig;
    }

    // Use deepmerge for proper deep merging of all configuration properties
    return deepmerge(defaultConfig, userConfig);
  },

  /**
   * Get default configuration for the chat widget
   * @returns {object} - Default configuration object
   */
  getDefaultConfig: () => {
    return {
      customStyles: {
        styleOptions: {
          launcher: {
            background: '#db4061',
            color: 'white',
            width: '60px',
            height: '60px'
          },
          rootWidth: '400px',
          rootHeight: '700px',
          buttonColor: '#767676',
          sendBoxButtonColor: '#767676',
          sendBoxBackground: 'white',
          bubbleMaxWidth: 280,
          welcomeAvatarImage: 'https://e7.pngegg.com/pngimages/191/906/png-clipart-internet-bot-chatbot-business-chatbot-avatar-child-face.png',
          welcomeInitialDelay: 10000,
          botAvatarImage: undefined,
          botAvatarInitials: undefined,
          userAvatarInitials: undefined,
          hideSendBox: false,
          hideAvatar: true,
          avatarSize: 0,

          userHighlighting: true,
          bubbleBackground: "white",
          bubbleFromUserBackground: "#20b69e",
          bubbleTextColor: "#000000",
          bubbleFromUserTextColor: "white",

          // Header configuration
          headerTitle: 'Hi there! 👋',
          headerSubtitle: "Ask me anything — I'm here to help!",
          headerBackgroundColor: '#101330',
          headerTextColor: 'white',
          showHeader: true
        }
      }
    };
  },

  /**
   * Apply all CSS variables for root styling
 * @param {object} styleOptions - Style options
   */
  applyRootCssVariables: (styleOptions) => {
    if (!styleOptions) return;
    // Button color
    if (styleOptions.buttonColor) {
      document.documentElement.style.setProperty('--button-color', styleOptions.buttonColor);
    }
    // Header styles
    if (styleOptions.headerBackground) {
      document.documentElement.style.setProperty('--header-background', styleOptions.headerBackground);
    }
    // Launcher styles
    if (styleOptions.launcher) {
      const launcher = styleOptions.launcher;
      if (launcher.background) {
        document.documentElement.style.setProperty('--launcher-background', launcher.background);
      }
      if (launcher.color) {
        document.documentElement.style.setProperty('--launcher-color', launcher.color);
      }
      if (launcher.width) {
        document.documentElement.style.setProperty('--launcher-width', launcher.width);
      }
      if (launcher.height) {
        document.documentElement.style.setProperty('--launcher-height', launcher.height);
      }
      if (launcher.fontSize) {
        document.documentElement.style.setProperty('--launcher-font-size', launcher.fontSize);
      }
    }
    // Attachment bubble and container backgrounds
    if (styleOptions.bubbleFromUserBackground) {
      document.documentElement.style.setProperty('--user-bubble-background', styleOptions.bubbleFromUserBackground);
    }
    if (styleOptions.bubbleBackground) {
      document.documentElement.style.setProperty('--bot-bubble-background', styleOptions.bubbleBackground);
    }
    if (styleOptions.backgroundColor) {
      document.documentElement.style.setProperty('--container-background-color', styleOptions.backgroundColor);
    }
  },

  /**
   * Creates activity middleware for highlighting user and bot messages
   * @param {boolean} userHighlighting - Whether to enable highlighting
   * @returns {function|undefined} - Activity middleware or undefined if highlighting is disabled
   */
  createHighlightingMiddleware: (userHighlighting) => {
    if (!userHighlighting) return undefined;

    return () => next => (...setupArgs) => {
      const render = next(...setupArgs);

      if (render) {
        return (...renderArgs) => {
          const element = render(...renderArgs);
          const [card] = setupArgs;
          return element && <div className={card.activity.from.role === 'user' ? 'highlightedActivity--user' : 'highlightedActivity--bot'}>{element}</div>;
        };
      }
    };
  },

  /**
   * Creates WebChat configuration with all necessary style options
   * @param {object} styleOptions - Style options for WebChat
   * @param {object} activityMiddleware - Activity middleware for WebChat
   * @param {object} attachmentMiddleware - Attachment middleware for WebChat
   * @param {object} directLine - DirectLine connection
   * @param {object} store - WebChat store
   * @returns {object} - Complete WebChat configuration
   */
  createWebChatConfig: (styleOptions, activityMiddleware, attachmentMiddleware, directLine, store) => {
    return {
      directLine,
      locale: 'ru-RU', // or 'en-US', 'de-DE', 'fr-FR', etc.
      enableUIAdaptiveCards: true,
      styleOptions: {
        ...styleOptions
      },
      experimentalFeatureSettings: {
        adaptiveCards: {
          enableActionExecute: true
        },
        // Enable file uploads if not already enabled
        uploadThumbnail: true
      },
      adaptiveCardsHostConfig: {
        supportsInteractivity: true,
        containerStyles: {
          default: {
            backgroundColor: "#FFF5EE"
          },
          emphasis: {
            backgroundColor: "#b89500" // optional, for inner containers
          }
        }
      },
      debug: true,
      sendTypingIndicator: true,
      store,
      activityMiddleware,
      attachmentMiddleware
    };
  }
};

export default StyleManager;
