# AI Setup and Troubleshooting Guide

This guide helps you configure and troubleshoot AI providers for the Enhanced AI Control Generator feature in AU5.

## Quick Fix for "Failed to generate controls" Error

If you're seeing "Failed to generate controls. Please try again." or "Ollama API error: 404 Not Found", follow these steps:

### Option 1: Set Up Ollama (Local AI - Recommended for Privacy)

1. **Install Ollama**:
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download from https://ollama.ai/download
   ```

2. **Start Ollama**:
   ```bash
   ollama serve
   ```

3. **Download a model**:
   ```bash
   # Recommended lightweight model
   ollama pull llama3.2
   
   # Or other options
   ollama pull mistral
   ollama pull phi3
   ```

4. **Verify Ollama is running**:
   - Open http://localhost:11434 in your browser
   - You should see "Ollama is running"

### Option 2: Use Cloud AI Providers (Requires API Keys)

If you prefer cloud-based AI or can't run Ollama locally:

#### OpenAI GPT
1. Get API key from https://platform.openai.com/api-keys
2. In AU5, go to Controls → AI Settings
3. Add new configuration:
   - Provider: OpenAI GPT
   - Model: gpt-4o-mini (cost-effective) or gpt-4o (more capable)
   - API Key: [your key]
   - Endpoint: https://api.openai.com/v1

#### Anthropic Claude
1. Get API key from https://console.anthropic.com/
2. Add configuration:
   - Provider: Anthropic Claude
   - Model: claude-3-5-sonnet-20241022
   - API Key: [your key]
   - Endpoint: https://api.anthropic.com/v1

#### Google Gemini
1. Get API key from https://aistudio.google.com/app/apikey
2. Add configuration:
   - Provider: Google Gemini
   - Model: gemini-1.5-flash (fast) or gemini-1.5-pro (better quality)
   - API Key: [your key]
   - Endpoint: https://generativelanguage.googleapis.com/v1beta

## AI Configuration in AU5

### Accessing AI Settings
1. Navigate to the Controls module
2. Click "Generate Controls with AI"
3. Click the settings/gear icon to configure AI providers

### Setting Up Your First Configuration
1. Choose your preferred provider
2. Enter the required details:
   - **Model**: Select from available models
   - **API Key**: (if required)
   - **Temperature**: 0.7 (balanced creativity)
   - **Max Tokens**: 1000-2000 (for control generation)
3. Click "Test Connection" to verify
4. Save the configuration

### Default Configuration Priority
The system will use configurations in this order:
1. Your saved configurations (most recent first)
2. Ollama local instance (if running)
3. Template/fallback controls

## Troubleshooting Common Issues

### "Ollama API error: 404 Not Found"
**Cause**: Ollama is not running or not installed
**Solutions**:
- Install and start Ollama (see Option 1 above)
- Or configure a cloud AI provider (see Option 2 above)
- Check if Ollama is running: `ps aux | grep ollama`

### "Failed to generate controls. Please try again."
**Possible Causes**:
1. No AI configuration set up
2. Invalid API key
3. Network connectivity issues
4. AI service temporarily down

**Solutions**:
1. Check AI configuration in settings
2. Test connection for each configured provider
3. Verify API keys are valid and have sufficient credits
4. Check network connection

### "User not authenticated" in AI configurations
**Cause**: Not logged in or session expired
**Solution**: Log out and log back in to AU5

### Generated controls are low quality
**Adjustments**:
- Increase temperature (0.8-0.9) for more creativity
- Use a more capable model (gpt-4o vs gpt-4o-mini)
- Provide more specific framework and process area selections
- Add custom instructions in the generation prompt

## Model Recommendations

### For Cost-Effectiveness:
- **Ollama llama3.2**: Free, local, good quality
- **OpenAI gpt-4o-mini**: Low cost, good performance
- **Google Gemini Flash**: Fast and affordable

### For Best Quality:
- **OpenAI gpt-4o**: Excellent reasoning and compliance knowledge
- **Claude 3.5 Sonnet**: Great for detailed, structured outputs
- **Gemini 1.5 Pro**: Good balance of capability and cost

### For Privacy/Offline:
- **Ollama models**: All processing stays local
- No data sent to external services

## Environment Variables (Optional)

You can set default endpoints in your environment:

```bash
# .env file
VITE_OLLAMA_ENDPOINT=http://localhost:11434
VITE_OPENAI_ENDPOINT=https://api.openai.com/v1
VITE_CLAUDE_ENDPOINT=https://api.anthropic.com/v1
VITE_GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1beta
```

## Performance Tips

### For Faster Generation:
1. Use Ollama locally (no network latency)
2. Choose smaller, faster models
3. Reduce max tokens if not needed
4. Lower temperature (0.5-0.7) for more focused outputs

### For Better Results:
1. Be specific about frameworks (SOC 2, ISO 27001, etc.)
2. Select relevant process areas
3. Use higher token limits (1500-2000)
4. Test different models to find what works best for your use case

## Database Requirements

The AI functionality requires these database tables:
- `ai_configurations`: Stores your AI provider settings
- `ai_generation_logs`: Tracks generation history
- `controls`: Enhanced with AI-specific columns

If you're missing these tables, run the migration scripts:
1. `supabase-diagnose-controls.sql` (to check current state)
2. `supabase-fix-evidence-requirements.sql` (to add missing columns)

## Security Notes

- API keys are stored encrypted in Supabase
- Ollama runs locally - no data leaves your machine
- Cloud providers may store prompts according to their policies
- Use Ollama for sensitive compliance data
- Rotate API keys regularly

## Getting Help

If you're still experiencing issues:

1. **Check the browser console** for detailed error messages
2. **Test connection** in AI settings for each provider
3. **Verify database schema** using the diagnostic scripts
4. **Check API quotas** if using cloud providers
5. **Review network settings** if behind corporate firewall

For Ollama-specific issues:
- Check Ollama logs: `ollama logs`
- Verify model is downloaded: `ollama list`
- Test directly: `ollama run llama3.2 "Hello"`

## Example Configurations

### Ollama (Local)
```
Provider: Ollama (Local)
Model: llama3.2
Endpoint: http://localhost:11434
Temperature: 0.7
Max Tokens: 1500
```

### OpenAI (Cloud)
```
Provider: OpenAI GPT
Model: gpt-4o-mini
API Key: sk-...
Endpoint: https://api.openai.com/v1
Temperature: 0.7
Max Tokens: 2000
```

This setup will ensure your AI control generation works reliably!