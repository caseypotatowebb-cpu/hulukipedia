# hulukipedia
Team Tomorrow Hulukipedia Dossier Generator (HTML exportable, cross-agent integration-ready)

## Overview
This repository houses the Team Tomorrow Hulukipedia project - a comprehensive dossier generation system designed for cross-agent integration and HTML export capabilities.

## Team Tomorrow Workflow

### Setup Instructions
1. Clone this repository to your local development environment
2. Ensure you have the necessary dependencies installed
3. Configure access to your LiteLLM proxy (see **LiteLLM Configuration** below)
4. Follow the agent integration guidelines below

### LiteLLM Configuration
Hulukipedia now routes all language and image generation through a LiteLLM proxy so that provider secrets stay on the server.

1. Launch your LiteLLM proxy and gather the **Base URL**, an optional **Proxy Token**, and (if you are using multi-tenancy) the **Tenant ID**.
2. Open the in-app **Settings** modal.
3. Enter the LiteLLM connection details and select **Save LiteLLM Config**.
4. Use the **Test Connection** button to verify connectivity.
5. Upload provider API keys directly to LiteLLM from the modal – they are not stored in local storage.

Each Team Tomorrow agent maps to a different LiteLLM model:

| Agent | Provider | Default Model |
|-------|----------|---------------|
| Monday | Google Gemini | `gemini/gemini-2.0-flash` |
| Tuesday | OpenAI | `openai/gpt-4o-mini` |
| Friday | Anthropic Claude | `anthropic/claude-3-5-sonnet-20241022` |
| Saturday | Mistral AI | `mistral/mistral-large-latest` |

Images are generated through the LiteLLM `/images/generations` endpoint using the appropriate model for the selected agent (falling back to Monday’s Gemini image stack when required).

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
