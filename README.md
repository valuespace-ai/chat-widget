# ValueSpace Chat Widget

A customizable React chat widget that integrates with Microsoft Bot Framework. This widget can be:

1. Used within a React application
2. Embedded into any website using a simple script tag
3. Customized with various styling and behavior options

## Features

- 🤖 Microsoft Bot Framework integration
- 🎙️ Voice message support
- 🎨 Fully customizable UI
- 📱 Responsive design
- 🔌 Easy to embed in any website
- ⚛️ React-based architecture

## Getting Started

### Installation: running as react JS application

```bash
npm install
npm run staging
```

ps. `npm run local` will build and run the widget for local development environment which needs local bot server running  (see .env.localdev)
`npm run staging` will build  and run the widget for staging environment (so the bot service is always available there, see .env.staging).

### Building JS bundle

```bash
npm run build:staging
```

ps. `npm run build:local` will build the widget JS bundle for local development environment which needs local bot server running (see .env.localdev)
`npm run build:staging` will build the widget for staging environment (so the bot service is always available there, see .env.staging).

This will generate the following files in the `CDN` directory:
- `vs-chat-widget.iife.js` - IIFE (immediately invoked function expression) for direct browser usage
- `styles.css` - widget styles

## Usage

### In a React Application (see index.html)

```jsx
import ChatWidget from './path/to/ChatWidget';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <ChatWidget 
        userName="User Name"
        tenantId="your-tenant-id"
      />
    </div>
  );
}
```

### Embedded in Any Website

Add the script to your HTML:

```html
<script src="path/to/vs-chat-widget.iife.js"></script>
<script>
  // Initialize with default settings
  const chatWidget = window.initChatWidget({
    userName: 'User Name',
    tenantId: 'your-tenant-id',
    container={document.getElementById('vs-chat-widget-container')}
  });
</script>
```

also see `test.html` for an example.

## Configuration Options



### Custom Styles Example

[Style options](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/api/src/StyleOptions.ts)

```javascript
const config = {
  customStyles: {
    launcher: {
      // Custom styles for the launcher button
      bottom: '50px',
      right: '50px'
    },
    container: {
      // Custom styles for the chat container
      borderRadius: '10px'
    },
    styleOptions: {
      // BotFramework styleOptions
      bubbleBackground: '#f7f7f7',
      bubbleBorderRadius: 10
    },
    styleSet: {
      // BotFramework styleSet overrides
      bubble: {
        backgroundColor: '#f0f0f0',
        color: '#000000'
      },
      bubbleFromUser: {
        backgroundColor: '#e6f7ff',
        color: '#000000'
      }
    }
  }
};
```

## Examples

## Bot Framework Integration

The endpoint should accept the following query parameters:
- `userId`: Unique identifier for the user
- `userName`: Display name of the user
- `tenantId`: Tenant identifier


## Full config coming from the server:
```

{
  "styleOptions": {
    "inputPlaceholder": "Type a message",
    "launcher": {
      "launcherIcon": "💬",
      "background": "#db4061",
      "color": "white",
      "blueclor": "#0078d4",
      "width": "60px",
      "height": "60px"
    },
    "adaptiveCardsHostConfig": {
      "containerStyles": {
        "default": {
          "backgroundColor": "#FFF5EE"
        },
        "emphasis": {
          "backgroundColor": "#b89500" // optional, for inner containers
        }
      }
    },
    "backgroundColor": "#F0F2F5",
    "rootHeight": "800px",
    "rootWidth": "500px",
    "buttonColor": "#767676",
    "paddingRegular": 10,

    "bubbleBorderRadius": 8,
    "bubbleFromUserBorderRadius": 8,
    "bubbleAttachmentMaxWidth": 280,
    "bubbleAttachmentMinWidth": 0,
    "bubbleMessageMaxWidth": 280,
    "bubbleMaxWidth": 280,
    "bubbleMessageMinWidth": 0,
    "welcomeAvatarImage": "https://e7.pngegg.com/pngimages/191/906/png-clipart-internet-bot-chatbot-business-chatbot-avatar-child-face.png",
    "welcomeInitialDelay": 10000,
    //"botAvatarImage": "",
    //"botAvatarInitials": "",
    //"userAvatarInitials": "",
    "hideSendBox": false,
    "hideAvatar": true,
    "avatarSize": 0,

    "userHighlighting": true,
    "bubbleBackground": "white",
    "bubbleFromUserBackground": "#20b69e",
    "bubbleTextColor": "#000000",
    "bubbleFromUserTextColor": "white",

    // Header configuration
    "headerTitle": "Hi there! 👋",
    "headerSubtitle": "Ask me anything — I'm here to help!",
    "headerBackgroundColor": "#101330",
    "headerTextColor": "white",
    "showHeader": true,

    "showAvatarInGroup": true,
    "timestampColor": "#8A8A8A",
    "timestampFormat": "relative",
    "showTypingIndicator": true,
    "typingAnimationDuration": 10000,
    "typingAnimationHeight": 20,
    "typingAnimationWidth": 64,
    "sendBoxButtonColor": "#767676",
    "sendBoxBackground": "white",
    "sendBoxHeight": 40,
    "sendBoxMaxHeight": 120,
    "sendBoxBorderTop": "1px solid #E2E8F0",
    "sendBoxBorderBottom": "none",
    "sendBoxBorderLeft": "none",
    "sendBoxBorderRight": "none",
    "sendBoxTextColor": "#000000",
    "sendBoxPlaceholderColor": "#888888",
    "sendBoxTextWrap": true,
    "suggestedActionsHeight": 40,
    "suggestedActionsLayout": "flow",
    "suggestedActionsStackedHeight": 80,
    "suggestedActionsStackedOverflow": "scroll",
    "suggestedActionsVisualKeyboardIndicator": true,
    "emojiSet": true,
    "enableUploadThumbnail": true,
    "markdownRespectCRLF": true,
    "richCardWrapTitle": true,
    "enableInternalRenderAttachmentMiddleware": true,
    "groupTimestamp": "3000",
    "showSpokenText": false,
    "hideUploadButton": false,
    "hideVoiceRecorder": false
  }
}
```

## Adaptive card host config
 
 [Adaptive card host config](https://learn.microsoft.com/en-us/adaptive-cards/rendering-cards/host-config)


## How to send message to the chat through DirectLine


```
    directLine.postActivity({
      type: 'message',
      text: '',
      from: { id: userId || 'user' },
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.audio',
          content: {
            media: [{ url: contentUrl }],
            thumbnailUrl: 'https://static.thenounproject.com/png/2634986-200.png',
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
  ```