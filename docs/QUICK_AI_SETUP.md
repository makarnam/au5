# Quick AI Setup Guide for AU5 Controls Generator

## 🚀 Get AI Working in 5 Minutes

### Option 1: Local AI (Ollama) - FREE & PRIVATE
**Best for: Privacy, no API costs, offline use**

#### macOS/Linux:
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Or on macOS with Homebrew
brew install ollama

# Start Ollama
ollama serve

# Download a model (in another terminal)
ollama pull llama3.2
```

#### Windows:
1. Download from https://ollama.ai/download
2. Install and run Ollama
3. Open Command Prompt and run: `ollama pull llama3.2`

#### Verify Setup:
- Open http://localhost:11434 in browser
- Should see "Ollama is running"
- In AU5, the AI should now work automatically

---

### Option 2: Cloud AI - REQUIRES API KEY
**Best for: Best quality, no local installation**

#### OpenAI (Recommended)
1. Get API key: https://platform.openai.com/api-keys
2. In AU5: Controls → Generate AI Controls → Settings ⚙️
3. Add configuration:
   - Provider: OpenAI GPT
   - Model: gpt-4o-mini (cheap) or gpt-4o (better)
   - API Key: [paste your key]

#### Anthropic Claude
1. Get API key: https://console.anthropic.com/
2. Add configuration:
   - Provider: Anthropic Claude
   - Model: claude-3-5-sonnet-20241022
   - API Key: [paste your key]

#### Google Gemini
1. Get API key: https://aistudio.google.com/app/apikey
2. Add configuration:
   - Provider: Google Gemini
   - Model: gemini-1.5-flash (fast) or gemini-1.5-pro
   - API Key: [paste your key]

---

## 🔧 Troubleshooting

### "Ollama API error: 404 Not Found"
```bash
# Check if Ollama is running
ps aux | grep ollama

# If not running, start it
ollama serve

# Check available models
ollama list

# If no models, download one
ollama pull llama3.2
```

### "Failed to generate controls"
1. **Check AI Configuration**: Click Settings ⚙️ in the generator
2. **Test Connection**: Use the "Test" button for each provider
3. **Verify API Key**: Make sure it's valid and has credits
4. **Try Fallback**: The system will use template controls if AI fails

### "No AI configuration available"
- Click "Setup AI Configuration" button in the generator
- Follow the in-app setup guide
- Or use this quick setup above

---

## 💡 Pro Tips

### For Best Results:
- **Framework**: Be specific (SOC 2 Type II, ISO 27001, etc.)
- **Process Area**: Choose relevant areas (Access Management, Change Management)
- **Industry**: Select your actual industry for context
- **Count**: Start with 5-10 controls, not 50

### Cost-Effective Options:
1. **Ollama llama3.2** - Free, runs locally
2. **OpenAI gpt-4o-mini** - $0.15/1M tokens
3. **Google Gemini Flash** - $0.075/1M tokens

### For Privacy/Security:
- Use Ollama (everything stays on your machine)
- No data sent to external services
- Perfect for sensitive compliance work

---

## 📋 Quick Test

Once set up, test with these settings:
- Framework: ISO 27001
- Process Area: Access Management
- Industry: Technology
- Count: 3
- Click "Generate AI Controls"

Should create 3 access management controls in ~30 seconds.

---

## 🆘 Still Need Help?

1. **Check Browser Console**: F12 → Console tab for detailed errors
2. **Verify Network**: Corporate firewalls may block AI APIs
3. **Check Quotas**: API providers have usage limits
4. **Use Templates**: Custom templates work without AI

The system includes fallback template controls, so you can always generate controls even without AI!