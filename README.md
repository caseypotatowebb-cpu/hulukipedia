# Hulukipedia
Team Tomorrow Hulukipedia Dossier Generator - **Now with Full Multi-API Integration!**

## 🚀 What's New

**Version 2.0 - Multi-API Integration Complete!**
- ✅ **5 AI Providers Integrated**: Gemini, Perplexity, Claude, OpenAI, Venice
- ✅ **Per-Section API Selection**: Choose the best model for each task
- ✅ **Enhanced API Configuration UI**: Visual status indicators, helpful links
- ✅ **Robust Error Handling**: Clear error messages and fallback options
- ✅ **Dual Image Generation**: Support for both Imagen 3.0 and DALL-E 3
- ✅ **Real-time Web Search**: Perplexity integration for up-to-date intel
- ✅ **Uncensored Content**: Venice AI for unrestricted descriptions

## Overview
Hulukipedia is a comprehensive dossier generation system that combines multiple AI models to create detailed profiles of fictional characters and real-world entities. The system intelligently routes different tasks to the most appropriate AI provider for optimal results.

## 🎯 Quick Start

1. **Open the App**: Simply open `hulukipedia.html` in your web browser
2. **Configure APIs**: Click the Settings (⚙️) button to add your API keys
3. **Start Generating**: Enter a subject name and choose Raven (fictional) or Starling (real) search
4. **Customize**: Select different AI models for each section using the dropdowns

**📚 Full API Setup Guide**: See [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) for detailed instructions

## Features

### 🎨 Dual-Mode Operation
- **Raven Mode**: For fictional characters (games, movies, TV, books)
- **Starling Mode**: For real-world public figures

### 🤖 Multi-AI Integration
| Provider | Specialty | API Required |
|----------|-----------|--------------|
| **Gemini** (Google) | Fast text & image generation | Free tier available |
| **Perplexity** | Web search & research | Limited free |
| **Claude** (Anthropic) | Deep analysis & psychology | Paid only |
| **OpenAI** | All-purpose GPT-4o + DALL-E | Limited free |
| **Venice** | Uncensored content | Paid only |

### 📋 Generated Sections
- **Visual ID**: AI-generated portrait (Imagen or DALL-E)
- **Confirmed Intel**: Structured fact database
- **Physical Description**: 4 tone levels (Clinical → Locker Room)
- **Communication Profile**: Speech patterns & mannerisms
- **Conversational Examples**: In-character dialogue samples
- **Psychological Profile**: Deep personality analysis
- **Strategic Analysis**: SWOT breakdown
- **Addendums**: Custom surveillance logs or career timelines

### 💾 Export Options
- **Simple PDF**: Text-based, optimized for readability
- **Visual PDF**: Full screenshot with styling preserved
- **Editable Content**: All sections are contenteditable for manual refinement

## Team Tomorrow Workflow

### Setup Instructions
1. Clone this repository to your local development environment
2. Open `hulukipedia.html` in a modern web browser
3. Configure API keys through the Settings modal
4. Follow the agent integration guidelines below

### Development Process
- All code should be paste-ready and modular
- Follow Team Tomorrow coding standards
- Document all functions and modules thoroughly
- Test HTML export functionality before committing

## Agent Integration

### Cross-Agent Compatibility
- Code is designed to work across multiple AI agent systems
- Use standardized function signatures and data structures
- Maintain backward compatibility when updating

### Integration Guidelines
- Agents should be able to import and use modules directly
- All external dependencies must be clearly documented
- Provide example usage for each major component

## Code-Paste Instructions

### For Contributors
1. **Code Structure**: Organize code in logical, self-contained modules
2. **Documentation**: Include inline comments explaining complex logic
3. **Testing**: Provide test cases and example outputs
4. **Dependencies**: List all required libraries and versions

### For Users
1. **Copy-Paste Ready**: All code blocks should run with minimal setup
2. **Clear Examples**: Each function includes usage examples
3. **Error Handling**: Robust error handling for common edge cases
4. **Configuration**: Easy-to-modify configuration parameters

## HTML Export Features

### Export Capabilities
- Generate standalone HTML files with embedded styling
- Support for multiple output formats (single page, multi-page)
- Responsive design for various screen sizes
- Print-friendly layouts

### Usage
```python
# Example usage (to be implemented)
from hulukipedia import DossierGenerator

generator = DossierGenerator()
html_output = generator.export_to_html(data)
```

## Getting Started

### Quick Start
1. Browse the repository structure
2. Review example implementations
3. Copy relevant code modules
4. Adapt for your specific use case

### Repository Structure
```
hulukipedia/
├── src/                 # Source code modules
├── examples/           # Usage examples
├── tests/              # Test cases
├── docs/               # Additional documentation
└── exports/            # Sample HTML exports
```

## Contributing

### Code Submission Guidelines
- Ensure code is well-documented and tested
- Follow the established coding style
- Update README if adding new features
- Maintain cross-agent compatibility

### Team Tomorrow Standards
- Code should be immediately usable by other team members
- Include comprehensive documentation
- Test all HTML export functionality
- Ensure agent integration compatibility

## Support

For questions, issues, or contributions, please refer to the project documentation or contact the Team Tomorrow development team.

---

**Note**: This repository is set up for immediate code-paste usage and cross-agent integration. All modules are designed to be self-contained and well-documented for easy implementation.
