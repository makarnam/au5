# Ollama Troubleshooting Guide

## Error: "Ollama API error: 404 Not Found"

This error occurs when the AI generator tries to connect to Ollama but encounters issues. Here's how to fix it:

## Quick Diagnosis

The 404 error typically means one of these issues:

1. **Ollama is not running**
2. **Model not downloaded/available**
3. **Wrong endpoint configuration**
4. **Ollama not installed**

## Step-by-Step Solutions

### 1. Check if Ollama is Running

**On macOS/Linux:**
```bash
# Check if Ollama is running
ps aux | grep ollama

# Or check the port
lsof -i :11434
```

**On Windows:**
```cmd
# Check if Ollama is running
tasklist | findstr ollama

# Or check the port
netstat -an | findstr 11434
```

### 2. Start Ollama

If Ollama is not running:

```bash
# Start Ollama
ollama serve
```

This should start Ollama on `http://localhost:11434`

### 3. Install Ollama (if not installed)

**macOS:**
```bash
# Using Homebrew
brew install ollama

# Or download from https://ollama.ai
```

**Linux:**
```bash
# Install script
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
- Download from https://ollama.ai
- Run the installer

### 4. Download Required Models

After starting Ollama, download the models you want to use:

```bash
# Popular models for audit descriptions
ollama pull llama2
ollama pull llama2:7b
ollama pull codellama
ollama pull mistral
ollama pull phi

# Check available models
ollama list
```

### 5. Test Ollama Connection

Verify Ollama is working:

```bash
# Test API endpoint
curl http://localhost:11434/api/tags

# Test generation
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Write a brief audit description",
  "stream": false
}'
```

### 6. Configure AI Settings in AU5

1. Go to **Settings** → **AI Configuration**
2. Add new configuration:
   - **Provider**: Ollama
   - **Base URL**: `http://localhost:11434`
   - **Model**: Choose from downloaded models (e.g., `llama2`)
   - **Temperature**: 0.7
   - **Max Tokens**: 500
3. Test the connection
4. Save configuration

## Common Issues and Solutions

### Issue: "Model not found"

**Error Message:**
```
Model "llama2" not found. Available models: []. Run "ollama pull llama2" to download it.
```

**Solution:**
```bash
# Download the specific model
ollama pull llama2

# Or check what models are available
ollama list
```

### Issue: "Connection refused"

**Error Message:**
```
Ollama is not running or not accessible at http://localhost:11434
```

**Solution:**
```bash
# Start Ollama service
ollama serve

# Or if using systemd (Linux)
sudo systemctl start ollama
sudo systemctl enable ollama
```

### Issue: "Permission denied"

**Error Message:**
```
Permission denied when accessing Ollama
```

**Solution:**
```bash
# Fix permissions (Linux/macOS)
sudo chown -R $USER ~/.ollama

# Or run with proper permissions
sudo ollama serve
```

### Issue: "Port already in use"

**Error Message:**
```
Port 11434 already in use
```

**Solution:**
```bash
# Kill existing process
sudo lsof -ti:11434 | xargs sudo kill -9

# Or use different port
ollama serve --port 11435
```

Then update AU5 configuration to use `http://localhost:11435`

## Performance Optimization

### Model Recommendations

For audit descriptions, these models work well:

- **llama2:7b** - Good balance of quality and speed
- **mistral:7b** - Fast and efficient
- **phi:3b** - Lightweight, good for simple descriptions
- **codellama:7b** - Better for technical audits

### Resource Requirements

| Model | RAM Required | Speed | Quality |
|-------|-------------|-------|---------|
| phi:3b | 4GB | Fast | Good |
| llama2:7b | 8GB | Medium | Excellent |
| mistral:7b | 8GB | Fast | Excellent |
| codellama:7b | 8GB | Medium | Very Good |

### Configuration Tips

```json
{
  "temperature": 0.7,     // Creative but focused
  "max_tokens": 300,      // Good length for descriptions
  "top_p": 0.9,          // Diverse but coherent
  "repeat_penalty": 1.1   // Avoid repetition
}
```

## Advanced Troubleshooting

### Debug Mode

Enable detailed logging:

```bash
# Set debug environment
export OLLAMA_DEBUG=1
ollama serve
```

### Network Issues

If using Ollama on a different machine:

```bash
# Allow external connections
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

Update AU5 configuration:
- **Base URL**: `http://your-server-ip:11434`

### Docker Setup

Run Ollama in Docker:

```bash
# Pull and run Ollama
docker run -d -p 11434:11434 --name ollama ollama/ollama

# Download models
docker exec ollama ollama pull llama2

# Check status
docker logs ollama
```

## Verification Checklist

✅ **Ollama is installed**
```bash
ollama --version
```

✅ **Ollama is running**
```bash
curl http://localhost:11434/api/tags
```

✅ **Models are downloaded**
```bash
ollama list
```

✅ **AU5 configuration is correct**
- Provider: Ollama
- Base URL: http://localhost:11434
- Model: matches downloaded model
- Test connection passes

✅ **Network connectivity**
```bash
telnet localhost 11434
```

## Getting Help

### Ollama Resources
- **Official Documentation**: https://ollama.ai/docs
- **GitHub Issues**: https://github.com/ollama/ollama/issues
- **Discord Community**: https://discord.gg/ollama

### AU5 AI Configuration
- Check AI Configuration in Settings
- Review error logs in browser console
- Test with different models
- Try cloud providers (OpenAI, Claude) as alternative

### Quick Test Command

Run this to verify everything works:

```bash
# 1. Check Ollama is running
curl -s http://localhost:11434/api/tags | jq '.models[].name'

# 2. Test generation
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "prompt": "Write a brief IT security audit description",
    "stream": false
  }' | jq '.response'
```

If this works, then AU5 should be able to connect successfully.

## Alternative Solutions

If Ollama continues to have issues, consider these alternatives:

1. **OpenAI API** - Requires API key but very reliable
2. **Claude API** - Anthropic's API, excellent for audit content
3. **Google Gemini** - Free tier available
4. **Different Ollama Models** - Try lighter models like `phi`

Remember: The goal is to have a working AI configuration for generating audit descriptions. Ollama is just one option among many!