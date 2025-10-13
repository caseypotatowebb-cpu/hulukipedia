# hulukipedia
Team Tomorrow Hulukipedia Dossier Generator (HTML exportable, cross-agent integration-ready)

## Overview
This repository houses the Team Tomorrow Hulukipedia project - a comprehensive dossier generation system designed for cross-agent integration and HTML export capabilities.

The refactored architecture introduces a lightweight FastAPI gateway powered by [liteLLM](https://github.com/BerriAI/litellm) so that Team Tomorrow can orchestrate multiple model providers without exposing keys in the browser.

## Team Tomorrow Workflow

### Setup Instructions
1. Clone this repository to your local development environment
2. Create a Python virtual environment and install dependencies with `pip install -r requirements.txt`
3. Copy `litellm_config.yaml` if you need a custom location and set `HULUKIPEDIA_LITELLM_CONFIG` accordingly (defaults to the file at the repo root)
4. Export provider API keys as environment variables (see [Secrets & Providers](#secrets--providers))
5. Launch the gateway with `uvicorn src.server:app --reload`
6. Open `hulukipedia.html` in your browser and configure the gateway URL + agent routing from **Settings**

### Development Process
- All code should be paste-ready and modular
- Follow Team Tomorrow coding standards
- Document all functions and modules thoroughly
- Test HTML export functionality before committing
- Keep provider metadata in `litellm_config.yaml` in sync with client expectations (display names, capabilities, defaults)

## Agent Integration

### Cross-Agent Compatibility
- Code is designed to work across multiple AI agent systems
- Use standardized function signatures and data structures
- Maintain backward compatibility when updating
- The FastAPI gateway exposes `/v1/providers`, `/v1/generate`, and `/v1/images` for cross-agent orchestration

### Integration Guidelines
- Agents should be able to import and use modules directly
- All external dependencies must be clearly documented
- Provide example usage for each major component
- When adding a new provider ensure the alias is declared in `litellm_config.yaml` and optionally add a default mapping under `hulukipedia_defaults`

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
├── src/                 # Source code modules (FastAPI gateway, utilities)
├── requirements.txt     # Python dependencies for the gateway
├── litellm_config.yaml  # Provider catalogue + defaults managed by liteLLM
├── examples/            # Usage examples
├── tests/               # Test cases
├── docs/                # Additional documentation
└── exports/             # Sample HTML exports
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
- Never store raw provider secrets in the browser — the gateway + liteLLM handle credential resolution

## Secrets & Providers

The FastAPI gateway defers secret management to liteLLM. Populate the following environment variables before starting the server:

```
export OPENAI_API_KEY="..."
export ANTHROPIC_API_KEY="..."
export GEMINI_API_KEY="..."
```

You can expand the provider catalogue by editing `litellm_config.yaml`. Each entry can include:

- `model_name`: The alias the client uses.
- `litellm_params`: Arguments passed directly to liteLLM (model name, base URLs, etc.). Use the liteLLM secret manager keyword (e.g., `OPENAI_API_KEY`) instead of hardcoding keys.
- `metadata`: Optional display data surfaced in the UI (friendly name, provider, capabilities, description).

Add or override default agent routing under the `hulukipedia_defaults` section. The browser UI reads from `/v1/providers` to render selectable options, and falls back to these defaults when no explicit mapping is stored.

## Support

For questions, issues, or contributions, please refer to the project documentation or contact the Team Tomorrow development team.

---

**Note**: This repository is set up for immediate code-paste usage and cross-agent integration. All modules are designed to be self-contained and well-documented for easy implementation.
