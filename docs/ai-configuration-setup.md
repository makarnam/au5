# AI Configuration Setup for Risk Control Matrix Generation

## Overview

The Risk Control Matrix AI Generator allows you to automatically generate comprehensive risk-control matrices using AI. This guide will help you set up the AI configuration properly to avoid the "Failed to generate matrix. Please check your AI configuration" error.

## Prerequisites

Before setting up AI configuration, ensure you have:

1. **For Ollama (Local AI)**: Ollama installed and running locally
2. **For OpenAI**: Valid OpenAI API key
3. **For Claude**: Valid Anthropic API key
4. **For Gemini**: Valid Google AI API key

## Setup Instructions

### Step 1: Access AI Configuration

1. Navigate to the Risk Control Matrix page
2. Click on the "AI Generator" tab
3. If no AI configuration is found, you'll see a warning message
4. Click the "Configure AI" button or the "AI Settings" button in the header

### Step 2: Choose an AI Provider

The system supports four AI providers:

#### Option 1: Ollama (Recommended for Privacy)
- **Pros**: Runs locally, no API costs, complete privacy
- **Setup**:
  1. Install Ollama from https://ollama.ai
  2. Pull a model: `ollama pull llama3.2`
  3. Ensure Ollama is running: `ollama serve`
  4. In the AI configuration, select "Ollama (Local)"
  5. Set API Endpoint to: `http://localhost:11434`
  6. Choose your model (e.g., llama3.2, llama3.1, mistral)

#### Option 2: OpenAI
- **Pros**: High-quality models, reliable
- **Setup**:
  1. Get API key from https://platform.openai.com
  2. In the AI configuration, select "OpenAI GPT"
  3. Enter your API key
  4. Choose a model (gpt-4o, gpt-4o-mini, gpt-3.5-turbo)

#### Option 3: Claude (Anthropic)
- **Pros**: Excellent reasoning capabilities
- **Setup**:
  1. Get API key from https://console.anthropic.com
  2. In the AI configuration, select "Anthropic Claude"
  3. Enter your API key
  4. Choose a model (claude-3-5-sonnet, claude-3-haiku, claude-3-opus)

#### Option 4: Gemini (Google)
- **Pros**: Good performance, competitive pricing
- **Setup**:
  1. Get API key from https://aistudio.google.com
  2. In the AI configuration, select "Google Gemini"
  3. Enter your API key
  4. Choose a model (gemini-1.5-pro, gemini-1.5-flash, gemini-pro)

### Step 3: Configure Settings

For each provider, configure:

1. **Model**: Select the appropriate model for your provider
2. **API Key**: Required for cloud providers (OpenAI, Claude, Gemini)
3. **API Endpoint**: Usually auto-filled, but can be customized
4. **Temperature**: Controls creativity (0.0 = conservative, 1.0 = creative)
5. **Max Tokens**: Maximum response length (500-2000 recommended)

### Step 4: Test Configuration

1. Click the "Test Connection" button
2. Wait for the test to complete
3. You should see a green checkmark if successful
4. If failed, check the error message and troubleshoot

## Troubleshooting Common Issues

### "Failed to generate matrix. Please check your AI configuration"

This error occurs when:

1. **No AI configuration exists**
   - Solution: Create an AI configuration first

2. **Invalid API key**
   - Solution: Check your API key is correct and has sufficient credits

3. **Model not found (Ollama)**
   - Solution: Run `ollama pull <model-name>` to download the model

4. **Ollama not running**
   - Solution: Start Ollama with `ollama serve`

5. **Network connectivity issues**
   - Solution: Check your internet connection and firewall settings

### Specific Error Messages and Solutions

#### "Ollama is not running or not accessible"
- Ensure Ollama is installed and running
- Check if the endpoint URL is correct (default: http://localhost:11434)
- Try running `ollama serve` in terminal

#### "Model not found in Ollama"
- List available models: `ollama list`
- Pull the required model: `ollama pull <model-name>`
- Restart Ollama if needed

#### "Invalid API key"
- Verify your API key is correct
- Check if your account has sufficient credits
- Ensure the API key has the necessary permissions

#### "Request timed out"
- Increase the timeout settings
- Check your network connection
- Try with a smaller model or fewer tokens

## Using the AI Generator

Once configured:

1. **Select Industry**: Choose your business industry
2. **Set Business Size**: Select your organization size
3. **Choose Matrix Size**: 3x3, 4x4, or 5x5
4. **Select Risk Categories**: Choose relevant risk types
5. **Pick Control Frameworks**: Select applicable frameworks (COSO, ISO 27001, etc.)
6. **Configure Generation Focus**: Comprehensive, Focused, or Minimal
7. **Include Existing Data**: Optionally include existing risks and controls
8. **Click Generate**: The AI will create a complete risk-control matrix

## Best Practices

1. **Start with Ollama**: For privacy and cost reasons, start with local Ollama
2. **Use Appropriate Models**: Larger models (like llama3.2) provide better results
3. **Test First**: Always test your configuration before generating matrices
4. **Review Output**: AI-generated content should be reviewed and validated
5. **Iterate**: Use the generated matrix as a starting point and customize as needed

## Advanced Configuration

### Custom Prompts
In the Advanced Options section, you can add custom prompts to guide the AI generation:

```
Focus on cybersecurity risks and include specific controls for data protection.
Consider regulatory requirements for financial services.
Include both preventive and detective controls.
```

### Temperature Settings
- **0.0-0.3**: Conservative, consistent output
- **0.4-0.7**: Balanced creativity and consistency
- **0.8-1.0**: More creative, varied output

### Token Limits
- **500-1000**: Sufficient for basic matrices
- **1000-2000**: Better for comprehensive matrices
- **2000+**: For very detailed matrices with extensive descriptions

## Support

If you continue to experience issues:

1. Check the browser console for detailed error messages
2. Verify your AI provider's status page
3. Test your configuration with a simple prompt first
4. Contact support with specific error messages and configuration details

## Security Considerations

- **API Keys**: Never share your API keys or commit them to version control
- **Local Models**: Ollama provides the highest level of privacy
- **Data Privacy**: Review your AI provider's data handling policies
- **Network Security**: Use HTTPS for all API communications
