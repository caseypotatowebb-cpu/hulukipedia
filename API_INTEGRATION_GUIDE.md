# Hulukipedia API Integration Guide

## Overview

Hulukipedia now features **full multi-API integration** with support for 5 major AI providers, giving you the flexibility to choose the best model for each task.

## Supported APIs

### 🌙 Monday (Google Gemini)
- **Model**: `gemini-2.0-flash`
- **Best for**: Text generation, JSON responses, image generation (Imagen 3.0)
- **Get API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/`

### 🔍 Tuesday (Perplexity)
- **Model**: `llama-3.1-sonar-large-128k-online`
- **Best for**: Research, web search, fact-checking with real-time data
- **Get API Key**: [Perplexity API](https://www.perplexity.ai/settings/api)
- **Endpoint**: `https://api.perplexity.ai/chat/completions`

### 🧠 Wednesday (Anthropic Claude)
- **Model**: `claude-3-5-sonnet-20241022`
- **Best for**: Deep analysis, psychological profiles, nuanced writing
- **Get API Key**: [Anthropic Console](https://console.anthropic.com/)
- **Endpoint**: `https://api.anthropic.com/v1/messages`

### 🌟 Friday (OpenAI)
- **Model**: `gpt-4o` (text), `dall-e-3` (images)
- **Best for**: All-purpose tasks, strategic analysis, DALL-E image generation
- **Get API Key**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **Endpoint**: `https://api.openai.com/v1/chat/completions`

### 🔓 Saturday (Venice AI)
- **Model**: `llama-3.3-70b`
- **Best for**: Uncensored content, "Locker Room" physical descriptions
- **Get API Key**: [Venice AI](https://venice.ai/)
- **Endpoint**: `https://api.venice.ai/api/v1/chat/completions`

## Setup Instructions

### 1. Obtain API Keys

Visit the links above for each service you want to use. You need at least **one API key** to use Hulukipedia (Gemini recommended as it's free to start).

### 2. Configure Keys in Hulukipedia

1. Open `hulukipedia.html` in your browser
2. Click the **Settings** (gear icon) button in the top-right
3. Enter your API keys in the modal
4. Keys are stored securely in browser localStorage
5. Status indicators show which APIs are active (green = configured, red = not configured)

### 3. Select APIs Per Section

Each section has a dropdown to choose which AI model to use:
- **Visual ID**: Monday (Imagen) or Friday (DALL-E)
- **Confirmed Intel**: Monday, Tuesday (Perplexity), or Wednesday (Claude)
- **Physical Description**: Monday, Wednesday, Friday, or Saturday
- **Communication Profile**: Wednesday, Friday, or Monday
- **And more...**

## API Integration Details

### Architecture

The system uses a unified API handler that normalizes responses from all providers into a common format:

```javascript
{
  candidates: [{
    content: {
      parts: [{ text: "response text" }]
    }
  }]
}
```

### Automatic Fallbacks

- If a selected API fails, the system displays a clear error message
- Users can easily switch to a different API using the dropdown
- JSON responses are automatically extracted from markdown code blocks

### CORS Handling

All API calls are made directly from the browser using `fetch()`. This requires:
- Valid API keys with proper permissions
- CORS-enabled endpoints (all supported APIs have this)
- Secure HTTPS connections

## Feature Comparison

| Feature | Monday | Tuesday | Wednesday | Friday | Saturday |
|---------|--------|---------|-----------|--------|----------|
| Text Generation | ✅ | ✅ | ✅ | ✅ | ✅ |
| JSON Mode | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Image Generation | ✅ Imagen | ❌ | ❌ | ✅ DALL-E | ❌ |
| Web Search | ❌ | ✅ | ❌ | ❌ | ❌ |
| Uncensored | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Free Tier | ✅ | Limited | ❌ | Limited | ❌ |

✅ = Full support | ⚠️ = Partial/workaround | ❌ = Not available

## Usage Recommendations

### For Best Results:

**Fictional Characters (Raven Mode)**:
- Intel: Monday (fast, accurate for pop culture)
- Physical: Saturday (uncensored "Locker Room" descriptions)
- Psychology: Wednesday (Claude excels at character analysis)
- SWOT: Friday (structured strategic thinking)

**Real People (Starling Mode)**:
- Intel: Tuesday (Perplexity with web search)
- Physical: Wednesday or Monday (balanced descriptions)
- Communication: Wednesday (nuanced behavioral analysis)
- Timeline: Tuesday (up-to-date career information)

### Cost Optimization:

1. **Free tier**: Use Monday (Gemini) - generous free quota
2. **Budget**: Mix Monday for most tasks + Tuesday for research only
3. **Premium**: Use Wednesday (Claude) for all analysis tasks
4. **Uncensored**: Enable Saturday only for "Locker Room" content

## Troubleshooting

### "API Key not set" Error
**Solution**: Click Settings and add the API key for the selected agent

### "API request failed (401)"
**Solution**: Invalid API key - regenerate from provider's dashboard

### "API request failed (429)"
**Solution**: Rate limit exceeded - wait a few seconds or upgrade plan

### JSON Parsing Errors
**Solution**: System automatically extracts JSON from markdown. If it fails, switch to Monday (Gemini) which has native JSON mode

### CORS Errors
**Solution**: All supported APIs have CORS enabled. If you see this:
1. Check that you're using HTTPS (not file://)
2. Verify API key is valid
3. Try a different browser

## Advanced: Response Format Normalization

For non-Gemini APIs that don't have native JSON mode, the system:

1. Appends JSON schema instructions to the prompt
2. Attempts to parse the response as JSON
3. Extracts JSON from markdown code blocks if wrapped
4. Falls back to raw text display if parsing fails

Example for Claude:
```javascript
const jsonPrompt = prompt + '\n\nReturn the response as a valid JSON array...';
const result = await callClaudeAPI(jsonPrompt, apiKey);
const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
```

## Security Notes

- API keys are stored in browser `localStorage` (client-side only)
- Keys are never transmitted to external servers except the AI providers
- Use private browsing if sharing a computer
- Regularly rotate API keys for security
- Consider using environment variables for API keys in production deployments

## API Rate Limits (Approximate)

| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Monday (Gemini) | 15 RPM | 360+ RPM |
| Tuesday (Perplexity) | 5 RPM | 100+ RPM |
| Wednesday (Claude) | N/A | 50+ RPM |
| Friday (OpenAI) | 3 RPM | 500+ RPM |
| Saturday (Venice) | N/A | Varies |

RPM = Requests Per Minute

## Future Enhancements

Planned improvements:
- [ ] Automatic API key validation on save
- [ ] Usage tracking and cost estimation
- [ ] Batch processing with queue management
- [ ] API health monitoring dashboard
- [ ] Custom API endpoint support
- [ ] Fallback chain configuration

## Support

For issues with:
- **Hulukipedia**: Create issue in this repository
- **API Keys**: Contact the specific provider's support
- **CORS/Browser**: Check browser console for detailed errors

---

**Ready to integrate?** Open `hulukipedia.html` and click the Settings button to get started!
