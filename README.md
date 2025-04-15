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

### Installation

```bash
npm install
npm run dev
```

### Building for Production

```bash
npm run build
```

This will generate the following files in the `dist` directory:
- `vs-chat-widget.es.js` - ES module
- `vs-chat-widget.umd.js` - UMD module
- `vs-chat-widget.iife.js` - IIFE (immediately invoked function expression) for direct browser usage

## Usage

### In a React Application

```jsx
import ChatWidget from './path/to/ChatWidget';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <ChatWidget 
        botServiceUrl="https://your-bot-service.com"
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
    botServiceUrl: 'https://your-bot-service.com',
    userName: 'User Name',
    tenantId: 'your-tenant-id'
  });
</script>
```

## Configuration Options

The chat widget accepts the following configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `botServiceUrl` | string | 'http://localhost:3978' | URL of your Bot Framework service |
| `userName` | string | 'User' | Name of the user |
| `tenantId` | string | 'vesperworld' | Tenant ID for your bot |
| `launcherIcon` | string | '💬' | Emoji or text for the launcher button |
| `widgetWidth` | string | '400px' | Width of the chat window |
| `widgetHeight` | string | '500px' | Height of the chat window |
| `primaryColor` | string | '#0078d4' | Primary color for the widget |
| `showAudioButton` | boolean | true | Whether to show the audio recording button |
| `inputPlaceholder` | string | 'Type your message here' | Placeholder text for the input field |
| `customStyles` | object | {} | Custom styles for different parts of the widget |

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

Check out the `examples` directory for sample implementations:
- `external-usage.html` - Example of using the widget in a non-React website

## Bot Framework Integration

This widget connects to your bot through the Direct Line API. You'll need to set up a Bot Framework bot and expose a Direct Line token endpoint at:

```
{botServiceUrl}/api/directline/token
```

The endpoint should accept the following query parameters:
- `userId`: Unique identifier for the user
- `userName`: Display name of the user
- `tenantId`: Tenant identifier

## Adaptive card host config
 
 [Adaptive card host config](https://learn.microsoft.com/en-us/adaptive-cards/rendering-cards/host-config)



## Post message
```
 // Only send conversationUpdate if this is a new conversation
      if (newConversation) {
        console.log('Sending conversationUpdate for new conversation, userId:', userId);
          //Uncomment to send conversation update
          directLine.postActivity({
            type: 'conversationUpdate',
            from: { id: userId, name: userName },
            membersAdded: [{ id: userId, name: userName }],
            channelData: {
              custom: 'init'
            }
          }).subscribe(
            id => console.log('conversationUpdate sent', id),
            err => console.error('Failed to send conversationUpdate', err)
          );
      }
```