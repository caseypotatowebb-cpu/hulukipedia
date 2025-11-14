# CLAUDE.md - Hulukipedia AI Assistant Guide

## Project Overview

**Hulukipedia** is a web-based AI-powered dossier generation system designed for "Team Tomorrow". It creates comprehensive intelligence profiles for both fictional characters (Raven mode) and real-world public figures (Starling mode).

### Key Characteristics
- **Single-page application** (SPA) built entirely in one HTML file
- **Cross-agent integration ready** - designed to work with multiple AI agent systems
- **Export-focused** - generates exportable HTML and PDF dossiers
- **Modular and paste-ready** - code designed for easy copying and reuse
- **Client-side only** - no backend server required

### Project Purpose
Generate detailed intelligence dossiers that include:
- Biographical information
- Physical descriptions (multiple style options)
- Communication profiles
- Psychological analysis
- Strategic assessment (SWOT)
- Conversational style examples
- AI-generated portraits
- Custom addendums based on mode

---

## Repository Structure

```
hulukipedia/
├── README.md              # Project documentation and usage guidelines
├── hulukipedia.html       # Main application (complete SPA)
└── CLAUDE.md             # This file - AI assistant guide
```

### File Responsibilities

#### `hulukipedia.html` (1452 lines)
The complete application containing:
- **Lines 1-263**: HTML structure, meta tags, external dependencies, and CSS styling
- **Lines 264-495**: HTML markup for UI components (forms, modals, dossier sections)
- **Lines 497-1451**: JavaScript application logic (all functionality)

#### `README.md`
User-facing documentation covering:
- Team Tomorrow workflow
- Agent integration guidelines
- Code-paste instructions
- HTML export features
- Contributing guidelines

---

## Technology Stack

### External Dependencies (CDN-loaded)
- **Tailwind CSS** (`https://cdn.tailwindcss.com`) - Utility-first CSS framework
- **Google Fonts** - Custom fonts: Cinzel, Roboto Mono, Architects Daughter, Satisfy
- **Lucide Icons** (`https://unpkg.com/lucide@latest`) - Icon library
- **jsPDF** (`2.5.1`) - PDF generation library
- **html2canvas** (`1.4.1`) - HTML-to-canvas rendering for visual PDFs

### AI APIs Integrated
1. **Monday (Gemini)** - Primary AI for text generation and clarifications
2. **Tuesday** - Researcher agent (simulated, fallback to Gemini)
3. **Friday** - All-rounder agent (simulated, fallback to Gemini)
4. **Saturday** - Unconventional agent (simulated, fallback to Gemini)
5. **Imagen 3.0** - Image generation API

### Browser APIs Used
- **LocalStorage** - Persisting API keys and search history
- **Fetch API** - Making API requests
- **Form API** - User input handling

---

## Architecture & Design Patterns

### Application Architecture

```
User Interface (HTML/CSS)
         ↓
Event Handlers (JavaScript)
         ↓
Core Functions (Business Logic)
         ↓
API Router (Team Tomorrow)
         ↓
External APIs (Gemini, Imagen)
         ↓
Response Processors
         ↓
DOM Updaters
```

### Key Design Patterns

#### 1. **State Management**
Global state variables:
- `currentMode`: 'hulu' | 'raven' | 'starling'
- `currentSubjectName`: String
- `currentSubjectDetails`: String

#### 2. **Theme System**
CSS custom properties (CSS variables) for dynamic theming:
```css
:root {
  --bg-main, --bg-container, --bg-section
  --text-primary, --text-secondary
  --accent-gold, --accent-gold-hover
  --border-color, --editable-hover-bg
}
```

Three themes:
- `theme-hulu`: Default green theme
- `theme-raven`: Dark purple theme (fictional characters)
- `theme-starling`: Light slate theme (real people)

#### 3. **Modular Function Structure**
Functions organized by responsibility:
- **Event Handlers**: Button click handlers
- **Core Functions**: Business logic (search, generation, reset)
- **API Functions**: External service calls
- **UI Functions**: DOM manipulation
- **Utility Functions**: History, storage, error handling

#### 4. **Progressive Enhancement**
- App works with just browser APIs
- Graceful degradation when APIs fail
- User-controlled content generation (nothing auto-generates)

---

## Key Components

### 1. Search System (Lines 608-640)

**Function**: `handleSearch(e, mode)`
- Validates input
- Calls clarification API
- Routes to single result or disambiguation modal

**Function**: `getClarifications(subject, context, mode)`
- Uses structured JSON schema
- Returns array of potential subjects
- Always uses Monday agent for consistency

### 2. Dossier Generation (Lines 642-664)

**Function**: `startDossierGeneration(subject)`
- Sets global state
- Applies theme
- Clears previous content
- Sets up mode-specific addendums
- Auto-generates initial intel

### 3. Content Generation System

#### Intel Generation (Lines 1069-1112)
**Function**: `generateIntel(searchContext = '')`
- Core biographical data
- Structured as category/entries JSON array
- Mode-specific fields (fictional vs real)
- Optional enhancement via deep search

#### Text Section Generation (Lines 1210-1231)
**Function**: `generateTextSection(section, contentElement, buttonElement, agent = 'monday')`
- Generic function for most text sections
- Supports agent selection
- Handles loading states
- Error handling and display

#### Physical Description (Lines 592-595)
Four style variations:
- **Blue Button** (`physical_blue`): Clinical, technical description
- **Green Button** (`physical_green`): Magazine-style feature
- **Yellow Button** (`physical_yellow`): Direct, appreciative "bar talk"
- **Red Button** (`physical_red`): Extremely blunt "locker room" style

#### Conversational Style (Lines 1123-1163)
**Function**: `generateConvoStyle()`
- Generates 4-6 dialogue examples
- Context + Line pairs
- Structured JSON output
- Character/personality-accurate

#### Strategic Analysis (Lines 1165-1208)
**Function**: `generateStrategicAnalysis()`
- SWOT analysis
- Mode-specific focus (internal/external factors)
- Structured JSON output

#### Image Generation (Lines 1026-1067)
**Function**: `generateAIImage()`
- Extracts visual traits via structured prompt
- Constructs detailed image prompt
- Calls Imagen API
- Displays base64 image

### 4. PDF Export System

#### Simple PDF (Lines 1233-1397)
**Function**: `downloadSimplePDF()`
- Text-based export using jsPDF
- Custom formatting for each section type
- Page break management
- Preserves content structure

#### Visual PDF (Lines 1399-1437)
**Function**: `downloadVisualPDF()`
- Screenshot-based export
- Uses html2canvas to render DOM
- Preserves visual styling
- Single-image PDF output

### 5. API Routing (Lines 861-891)

**Function**: `callTeamTomorrowAPI(agent, prompt, config)`
- Central routing for all AI calls
- Agent-based selection
- API key management
- Simulated fallback for unimplemented agents

### 6. Local Storage System

**Keys Used**:
- `hulukipediaSubjectHistory` - Recent subject searches
- `hulukipediaContextHistory` - Recent context additions
- `hulukipediaApiKeys` - Encrypted API keys (JSON object)

**Functions**:
- `saveToHistory(key, value, maxSize)`
- `loadFromHistory(key, datalistElement)`
- `saveApiKeys()` / `loadApiKeys()`
- `getApiKey(agent)`

---

## Development Workflows

### Adding a New Dossier Section

1. **Add HTML Structure** (around line 470):
```html
<div class="dossier-section bg-bg-section p-4 rounded-md border border-border-color">
    <h3><i data-lucide="icon-name" class="inline-block h-5 w-5 mr-2 -mt-1"></i>Section Title</h3>
    <div id="new-section-content" class="font-mono min-h-[50px]" contenteditable="true"></div>
    <button id="new-section-btn" class="generate-section-btn mt-4 ...">
        <span>✨ Generate Content</span>
    </button>
</div>
```

2. **Add DOM References** (around line 560):
```javascript
const newSectionBtn = document.getElementById('new-section-btn');
const newSectionContent = document.getElementById('new-section-content');
```

3. **Add Event Listener** (around line 600):
```javascript
newSectionBtn.addEventListener('click', () => generateTextSection('new_section', newSectionContent, newSectionBtn));
```

4. **Add Prompt** (in `getPromptForSection()`, around line 770):
```javascript
new_section: `Generate [description] for ${subject}. [Instructions]...`
```

5. **Add to PDF Export** (if needed, around line 1300):
```javascript
{ title: "Section Title", contentId: "new-section-content", type: "text" }
```

### Adding a New AI Agent

1. **Add API Key Input** (in API modal, around line 336):
```html
<div>
    <label for="newagent-key" class="block text-sm font-medium text-primary">New Agent</label>
    <input type="password" id="newagent-key" placeholder="Enter API Key" class="...">
</div>
```

2. **Update `saveApiKeys()`** (around line 836):
```javascript
const keys = {
    gemini: geminiKeyInput.value.trim(),
    newagent: newagentKeyInput.value.trim(),
    // ...
};
```

3. **Add to `callTeamTomorrowAPI()` switch** (around line 872):
```javascript
case 'newagent':
    return callNewAgentAPI(prompt, config?.generationConfig, apiKey);
```

4. **Implement API function**:
```javascript
async function callNewAgentAPI(prompt, generationConfig, apiKey) {
    // Implementation here
}
```

### Modifying Prompts

All prompts are centralized in `getPromptForSection(section, searchContext)` (lines 730-799).

**Structure**:
- Base prompts apply to all modes
- Mode-specific overrides in `modeSpecifics` object
- Search context integration support

**Best Practices**:
- Include critical instructions in UPPERCASE
- Use structured output formats (JSON when possible)
- Specify fallback behavior ("If not found, write X")
- Be explicit about tone and style

---

## API Integration

### Gemini API Integration

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

**Request Format**:
```javascript
{
    contents: [{
        role: "user",
        parts: [{ text: prompt }]
    }],
    generationConfig: {
        responseMimeType: "application/json", // Optional
        responseSchema: { /* JSON Schema */ }  // Optional
    }
}
```

**Response Structure**:
```javascript
{
    candidates: [{
        content: {
            parts: [{
                text: "Generated content here"
            }]
        }
    }]
}
```

### Imagen API Integration

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict`

**Request Format**:
```javascript
{
    instances: [{
        prompt: "Detailed image description..."
    }],
    parameters: {
        sampleCount: 1
    }
}
```

**Response Structure**:
```javascript
{
    predictions: [{
        bytesBase64Encoded: "base64ImageDataHere..."
    }]
}
```

### Structured Output (JSON Mode)

Used for predictable, parseable responses:

```javascript
const schema = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            "category": { "type": "STRING" },
            "entries": {
                "type": "ARRAY",
                "items": { "type": "STRING" }
            }
        }
    }
};
```

**Sections Using JSON**:
- Intel (`intel`)
- Clarifications (`clarification`)
- Conversational Style (`convo_style`)
- Strategic Analysis (`strategic`)
- Image Details (`image_details`)

---

## Code Conventions

### Naming Conventions

1. **Variables**: camelCase
   - `currentSubjectName`, `apiKeyModal`, `intelContent`

2. **Functions**: camelCase with verb prefixes
   - `generateIntel()`, `handleSearch()`, `saveApiKeys()`

3. **Constants**: UPPER_SNAKE_CASE
   - `SUBJECT_HISTORY_KEY`, `MAX_HISTORY_SIZE`

4. **DOM IDs**: kebab-case
   - `subject-name`, `dossier-content`, `api-key-modal`

5. **CSS Classes**: kebab-case (Tailwind + custom)
   - `dossier-section`, `intel-category`, `generate-section-btn`

### Function Organization

Functions are grouped by purpose (around lines 497-1449):

1. **Event Listeners Setup** (572-605)
2. **Core Functions** (608-728)
3. **API & Prompts** (730-957)
4. **Content Generation** (959-1231)
5. **Export Functions** (1233-1437)
6. **Utility Functions** (801-860, 1439-1448)

### Error Handling Pattern

```javascript
try {
    // Operation
    buttonElement.disabled = true;
    contentElement.innerHTML = '<div class="mini-loader"></div>';

    const result = await apiCall();

    // Process result
    contentElement.innerHTML = result;

} catch (error) {
    console.error("Context-specific message:", error);
    contentElement.innerHTML = `<span class="text-red-500">Error: ${error.message}</span>`;
} finally {
    buttonElement.disabled = false;
    buttonElement.innerHTML = originalHTML;
    lucide.createIcons(); // Refresh icons
}
```

### Loading State Pattern

1. **Save original button HTML**
2. **Replace with loader**: `<div class="mini-loader"></div>`
3. **Disable button**
4. **Show loader in content area**
5. **Restore in finally block**

### CSS Custom Property Usage

Always use CSS variables for themeable values:

```javascript
// DON'T:
element.style.backgroundColor = '#f0fdf4';

// DO:
element.style.backgroundColor = 'var(--bg-main)';
```

---

## Testing & Debugging

### Manual Testing Checklist

#### Search Flow
- [ ] Empty subject name shows error
- [ ] Single result goes directly to dossier
- [ ] Multiple results show clarification modal
- [ ] Clarification selection works
- [ ] Cancel returns to search

#### Content Generation
- [ ] Each button generates appropriate content
- [ ] Loading states show correctly
- [ ] Errors display user-friendly messages
- [ ] Content is editable after generation
- [ ] Agent selection affects output (when implemented)

#### Theme Switching
- [ ] Raven search applies dark theme
- [ ] Starling search applies light theme
- [ ] Theme persists during session
- [ ] CSS variables update correctly
- [ ] Addendum titles/content change by mode

#### PDF Export
- [ ] Simple PDF includes all generated content
- [ ] Simple PDF handles page breaks
- [ ] Visual PDF captures styling
- [ ] Filename includes subject name
- [ ] Empty sections are skipped

#### Persistence
- [ ] API keys save to localStorage
- [ ] API keys load on page load
- [ ] Subject history populates datalist
- [ ] Context history populates datalist
- [ ] History limited to 10 items

### Common Issues & Solutions

#### Issue: API returns empty response
**Cause**: Missing or invalid API key
**Solution**: Check localStorage for keys, verify key validity

#### Issue: PDF generation fails
**Cause**: Content contains unsupported characters or structure
**Solution**: Check console, validate HTML structure in content areas

#### Issue: Images don't generate
**Cause**: Safety filters rejecting prompt
**Solution**: Check console for Imagen response, adjust prompt details

#### Issue: Content not saving to PDF
**Cause**: Content div is empty or has only loaders
**Solution**: Ensure generation completes before PDF export

#### Issue: Icons don't appear
**Cause**: `lucide.createIcons()` not called after DOM update
**Solution**: Call `lucide.createIcons()` after any HTML injection

---

## Deployment

### Requirements
- **Web Server**: Any HTTP server (Apache, Nginx, Python SimpleHTTPServer, etc.)
- **HTTPS**: Required for API calls to work properly
- **CORS**: APIs must allow origin (Gemini/Imagen do by default)

### Deployment Steps

1. **Clone Repository**
```bash
git clone https://github.com/caseypotatowebb-cpu/hulukipedia.git
cd hulukipedia
```

2. **Test Locally**
```bash
python3 -m http.server 8000
# Visit http://localhost:8000/hulukipedia.html
```

3. **Deploy to Static Host**
- Upload `hulukipedia.html` to web server
- No build process required
- No server-side dependencies

4. **Configure API Keys**
- Users must add their own API keys via Settings modal
- Keys stored in browser localStorage only

### Recommended Hosts
- **GitHub Pages** - Free, easy setup
- **Netlify** - Drop file, instant deploy
- **Vercel** - Free tier, custom domains
- **Any static host** - No special requirements

---

## Common Tasks for AI Assistants

### Task: Add New Physical Description Style

1. Find physical button group (lines 426-439)
2. Add new button:
```html
<button id="physical-btn-purple" class="generate-section-btn ...">
    <i data-lucide="sparkles" class="mr-2 h-4 w-4"></i><span>New Style</span>
</button>
```
3. Add DOM reference (line ~544)
4. Add event listener (line ~596)
5. Add prompt in `getPromptForSection()` (line ~760)

### Task: Change Theme Colors

1. Locate theme definition (lines 24-62)
2. Modify CSS custom properties:
```css
body.theme-name {
    --bg-main: #newcolor;
    --text-primary: #newcolor;
    /* etc */
}
```

### Task: Add New Dossier Field to Intel

1. Modify intel prompt (lines 736-742)
2. Add new category to list:
```javascript
intel: basePrompts.intel + `\n- Category: "New Field", ...`
```
3. Mode-specific fields in `modeSpecifics` (lines 782-786)

### Task: Implement Real API for Tuesday/Friday/Saturday

1. Replace placeholder in `callTeamTomorrowAPI()` (line ~876)
2. Implement actual fetch call:
```javascript
case 'tuesday':
    return callTuesdayAPI(prompt, config, apiKey);
```
3. Create API function following pattern of `callGeminiAPI()`
4. Update API key modal to collect new credentials

### Task: Add New Export Format

1. Create export function following PDF pattern
2. Add button to results header (around line 360)
3. Add event listener
4. Process DOM content
5. Generate file using appropriate library

### Task: Modify Addendum Behavior

1. Locate `setupAddendums()` (lines 702-715)
2. Modify titles and button text:
```javascript
if (currentMode === 'raven') {
    addendum1Title.innerHTML = `New Title`;
    addendum1Btn.querySelector('span').textContent = `New Button Text`;
}
```
3. Update corresponding prompt keys (lines 773-774)

---

## Gotchas & Important Notes

### Critical Implementation Details

1. **Lucide Icons Must Be Refreshed**
   - After any `innerHTML` update containing icons
   - Always call `lucide.createIcons()` after DOM manipulation
   - Failure causes icons to not render

2. **Loading States Are Essential**
   - Users need feedback during API calls (can take 5-15 seconds)
   - Always disable buttons during operations
   - Always show loaders in content areas

3. **ContentEditable Attribute**
   - All content areas have `contenteditable="true"`
   - Users can manually edit AI-generated content
   - Preserve this in new sections

4. **API Key Security**
   - Keys stored in localStorage (not secure, but acceptable for client-side)
   - Never log API keys
   - Never commit keys to repository
   - Users responsible for their own keys

5. **Mode-Specific Behavior**
   - Always check `currentMode` when behavior should differ
   - Raven = fictional characters
   - Starling = real people
   - Hulu = neutral (search screen)

6. **JSON Schema Strictness**
   - Structured output requires exact schema match
   - Test schema with small examples first
   - Fallback to text mode if JSON parsing fails

7. **PDF Character Encoding**
   - jsPDF supports limited character sets
   - Unicode characters may not render
   - Test with actual content before deploying

8. **Image Generation Safety**
   - Imagen has strict safety filters
   - NSFW prompts will be rejected
   - Provide graceful error messaging

9. **CSS Variables and Theming**
   - All themeable colors use CSS custom properties
   - Hard-coded colors will break theme switching
   - Test all themes when modifying styles

10. **Browser Compatibility**
    - Requires modern browser (ES6+, Fetch API, LocalStorage)
    - No polyfills included
    - Test in target browsers

### Performance Considerations

- **Single Large File**: Entire app in one HTML file (~1500 lines)
  - Pro: No build process, easy deployment
  - Con: Full reload for any change

- **External Dependencies**: All loaded via CDN
  - Pro: Leverages browser caching
  - Con: Requires internet connection

- **API Calls**: Sequential, not batched
  - Each section generates independently
  - User controls when to generate (no auto-load)

- **PDF Generation**: Client-side processing
  - Large dossiers may take time
  - Visual PDF especially resource-intensive

### Security Notes

- **XSS Risk**: User input not sanitized before display
  - Acceptable for single-user tool
  - Don't allow untrusted users

- **API Key Exposure**: Stored in localStorage
  - Accessible via browser dev tools
  - Not suitable for multi-user environments

- **CORS**: Relies on API CORS policies
  - Gemini/Imagen allow browser requests
  - Custom APIs may need CORS configuration

---

## Version Control & Git Workflow

### Current Branch
- **Active Development**: `claude/claude-md-mhyfqrh7wetqjcxy-016dqENJguV6LgXhsH8QqQvx`
- **Main Branch**: Not specified (check git status)

### Commit Guidelines

When making changes:

1. **Commit Message Format**:
```
<type>: <brief description>

<detailed description if needed>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests

2. **Example Good Commits**:
```
feat: Add new clinical physical description style

Added a fourth physical description option that provides
medical/clinical style output with technical terminology.

docs: Update CLAUDE.md with API integration details

fix: Resolve PDF export issue with special characters
```

### Pre-commit Checklist
- [ ] Test in browser (open HTML file)
- [ ] Check console for errors
- [ ] Verify all new features work
- [ ] Update this file if architecture changed
- [ ] Update README if user-facing changes

---

## Quick Reference

### File Locations
- Main App: `hulukipedia.html`
- User Docs: `README.md`
- AI Guide: `CLAUDE.md` (this file)

### Key Functions
- `handleSearch()` - Initiates dossier generation
- `generateIntel()` - Core biographical data
- `generateTextSection()` - Generic section generator
- `callTeamTomorrowAPI()` - API routing hub
- `downloadSimplePDF()` - Text-based export
- `downloadVisualPDF()` - Screenshot export

### Key Line Numbers
- CSS Styling: 14-262
- HTML Structure: 264-495
- JavaScript Start: 497
- API Functions: 861-957
- Content Generation: 959-1231
- PDF Export: 1233-1437

### External Resources
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [jsPDF Docs](https://github.com/parallax/jsPDF)
- [Gemini API Docs](https://ai.google.dev/docs)

---

## Future Enhancement Ideas

### Potential Improvements
1. **Batch Generation**: Generate all sections at once
2. **Save/Load Dossiers**: LocalStorage persistence of full dossiers
3. **Custom Templates**: User-defined section layouts
4. **Multi-language**: i18n support for prompts and UI
5. **Diff View**: Compare two subjects side-by-side
6. **Export Formats**: Markdown, JSON, Word doc
7. **Image Upload**: User-provided reference images
8. **Voice Profile**: Audio generation for subjects
9. **Relationship Mapping**: Visual network of connections
10. **Historical Versions**: Track changes to dossiers over time

### Architecture Improvements
1. **Module System**: Split into separate JS files
2. **State Management**: Implement Redux/Zustand
3. **Component Framework**: Migrate to React/Vue
4. **Build Process**: Add bundling, minification
5. **Testing**: Unit tests, integration tests
6. **Backend**: Optional save-to-server functionality
7. **Real-time Collaboration**: Multiple users, one dossier
8. **API Caching**: Reduce redundant calls
9. **Offline Mode**: Service worker for PWA
10. **Analytics**: Usage tracking (privacy-respecting)

---

## Contact & Support

### For Contributors
- Follow Team Tomorrow coding standards
- Code should be immediately usable by other team members
- Include comprehensive documentation
- Test all HTML export functionality
- Ensure agent integration compatibility

### For Issues
- Check browser console for errors
- Verify API keys are set correctly
- Test with simple subject names first
- Check localStorage for corrupted data

---

**Last Updated**: 2025-11-14
**Version**: 1.0.0
**Maintainer**: Team Tomorrow Development Team
