# ValueSpace Chat Widget - Blazor Integration Guide

This guide explains how to integrate the ValueSpace Chat Widget into a Blazor application.

## Overview

The ValueSpace Chat Widget can be integrated into a Blazor application using an iframe with dynamic configuration updates. This approach allows for real-time style and configuration changes without reloading the widget or losing the conversation state.

## Integration Steps

### 1. Add the Chat Widget Iframe to Your Blazor Page

```html
<iframe id="chatWidgetFrame" src="https://your-chat-widget-url/" width="100%" height="800px"></iframe>
```

### 2. Create a JavaScript Function to Update the Configuration

Add this JavaScript function to your Blazor application:

```javascript
// In your Blazor JavaScript interop file
function updateChatWidgetConfig(config) {
    // Get the iframe element
    const iframe = document.getElementById('chatWidgetFrame');
    
    // Check if the widget is already loaded and has the updateChatWidgetConfig method
    if (iframe.contentWindow && iframe.contentWindow.updateChatWidgetConfig) {
        // Use the dynamic update method (no reload required)
        return iframe.contentWindow.updateChatWidgetConfig(config);
    }
    
    // Fallback to URL hash parameter method if dynamic update isn't available
    const configString = encodeURIComponent(JSON.stringify(config));
    const baseUrl = iframe.src.split('#')[0]; // Get the base URL without hash
    iframe.src = `${baseUrl}#config=${configString}`;
    
    return true;
}

// Function to get the current widget configuration
function getChatWidgetConfig() {
    const iframe = document.getElementById('chatWidgetFrame');
    
    if (iframe.contentWindow && iframe.contentWindow.getChatWidgetConfig) {
        return iframe.contentWindow.getChatWidgetConfig();
    }
    
    return null;
}

// Register the functions for Blazor
window.chatWidgetInterop = {
    updateConfig: updateChatWidgetConfig,
    getConfig: getChatWidgetConfig
};
```

### 3. Call the JavaScript Function from Blazor

```csharp
@page "/chat-config"
@inject IJSRuntime JSRuntime

<div class="config-form">
    <div class="form-group">
        <label>Header Title:</label>
        <input @bind="headerTitle" />
    </div>
    
    <div class="form-group">
        <label>Header Color:</label>
        <input type="color" @bind="headerColor" />
    </div>
    
    <!-- Add more configuration options as needed -->
    
    <button @onclick="ApplyChanges">Apply Changes</button>
    <button @onclick="GetCurrentConfig">Get Current Config</button>
</div>

<iframe id="chatWidgetFrame" src="https://your-chat-widget-url/" width="100%" height="800px" />

@code {
    private string headerTitle = "Hi there! 👋";
    private string headerColor = "#101330";
    private object currentConfig;
    
    private async Task ApplyChanges()
    {
        var config = new
        {
            customStyles = new
            {
                styleOptions = new
                {
                    headerTitle = headerTitle,
                    headerBackgroundColor = headerColor,
                    
                    // Launcher styling
                    launcher = new
                    {
                        background = "#db4061"
                    },
                    
                    // Container dimensions
                    rootWidth = "400px",
                    rootHeight = "700px",
                    
                    // Other configuration options
                    userHighlighting = true
                }
            }
        };
        
        await JSRuntime.InvokeAsync<bool>("chatWidgetInterop.updateConfig", config);
    }
    
    private async Task GetCurrentConfig()
    {
        currentConfig = await JSRuntime.InvokeAsync<object>("chatWidgetInterop.getConfig");
        Console.WriteLine("Current config: " + System.Text.Json.JsonSerializer.Serialize(currentConfig));
        
        // You can now save this configuration to a database or use it elsewhere
    }
}
```

## How It Works

The chat widget exposes two global methods:

1. `window.updateChatWidgetConfig(config)`: Updates the widget configuration dynamically without reloading
2. `window.getChatWidgetConfig()`: Returns the current merged configuration

When you call `updateChatWidgetConfig`:

1. The new configuration is merged with the current configuration
2. The WebChat store is updated with the new styleOptions
3. CSS variables are updated for immediate style changes
4. No reload or reconnection to DirectLine is required

## Benefits

- **No Reload Required**: Configuration updates happen in real-time without reloading the widget
- **Conversation State Preserved**: The chat history and connection state are maintained during updates
- **Efficient**: Only the necessary style changes are applied, without recreating the entire widget
- **Flexible**: Works with any Blazor application, regardless of hosting model
- **Fallback Mechanism**: If dynamic updates aren't available, falls back to URL hash parameters

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `customStyles.styleOptions.headerTitle` | string | Title displayed in the header |
| `customStyles.styleOptions.headerSubtitle` | string | Subtitle displayed in the header |
| `customStyles.styleOptions.headerBackgroundColor` | string | Background color of the header |
| `customStyles.styleOptions.headerTextColor` | string | Text color of the header |
| `customStyles.styleOptions.launcher.background` | string | Background color of the launcher button |
| `customStyles.styleOptions.launcher.color` | string | Color of the launcher button icon |
| `customStyles.styleOptions.rootWidth` | string | Width of the chat container |
| `customStyles.styleOptions.rootHeight` | string | Height of the chat container |
| `customStyles.styleOptions.userHighlighting` | boolean | Whether to highlight user messages |

## Example: Saving Configuration to Database

```csharp
private async Task SaveConfigToDatabase()
{
    // Get the current configuration
    var currentConfig = await JSRuntime.InvokeAsync<object>("chatWidgetInterop.getConfig");
    
    // Serialize to JSON
    string configJson = System.Text.Json.JsonSerializer.Serialize(currentConfig);
    
    // Save to database
    await _configService.SaveConfigurationAsync(configJson);
}
```

## Example: Loading Configuration from Database

```csharp
private async Task LoadConfigFromDatabase()
{
    // Load from database
    string configJson = await _configService.GetConfigurationAsync();
    
    // Deserialize from JSON
    var config = System.Text.Json.JsonSerializer.Deserialize<object>(configJson);
    
    // Apply to widget
    await JSRuntime.InvokeAsync<bool>("chatWidgetInterop.updateConfig", config);
}
