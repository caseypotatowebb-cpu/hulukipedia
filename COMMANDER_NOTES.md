# 🦅 COMMANDER'S DIRECTIVES & FUTURE ROADMAP

This document captures the Commander's strategic vision, immediate priorities, and critical notes for the evolution of Hulukipedia. All Team Tomorrow members dispatched to this project must read this before making changes.

## 1. The Quality Mandate: Accuracy Over Assumptions
The app only works if it is right, entertaining, and an advancement on standard infrastructure. 

**The Core Issue:** Models often rely on assumptions rather than specific facts. For example, when generating a physical description of a police officer (like Lucy Chen / Melissa O'Neil), models default to "athletic, trim, track-star shape" because of the job title. They ignore the actual physical reality of the actress (curvaceous, natural frame, wide hips, thick thighs).

**The Directive:** 
- Sections like "Physical Description" must rely **heavily on RAG (Retrieval-Augmented Generation)** rather than model instinct.
- The models must actually look up the person and describe their specific, unique reality, not a generic archetype.
- For sections like "Communication Profile", the AI must provide specific examples of *why* it came to its conclusions, grounding its analysis in reality.

## 2. Model Selection Strategy
The choice of model matters more than anything else for specific tasks. 

- **Grok 4.20** has proven to be the only model capable of capturing the necessary descriptive focus and tone for certain physical profiles. Other models are too tame, boring, and miss what humans actually focus on.
- **Sonar (Normal, not Pro)** is the preferred default for initial intel search. It has the right tone and detail level.
- **Model Switching:** The UI must support seamless switching between models for different sections, combining the best of RAG (for facts) and specific model personalities (for tone).

## 3. Expanding the API Ecosystem
Hulukipedia was designed to not be locked into one provider or model.

- **Gemini Integration:** The original Monday version was powered by Gemini APIs. We need to start thinking about wiring Gemini back in as an additional provider so Venice/Anthropic/Perplexity don't carry the entire load.
- **Current Status:** Venice, Anthropic, Perplexity, and OpenRouter are currently wired in and working.

## 4. Image Generation: The Photorealism Goal
Images should strive for absolute photorealism.

- **Nano Banana Pro** (discovered via Perplexity) is astonishingly good at generating images of real people and characters. It is now the default image model.
- **Pollinations.ai:** Currently wired in as a fallback image source. It is a free, URL-based image generation service that doesn't require an API key, useful when primary providers fail or hit rate limits.

## 5. Team Assistance vs. Solo Sprints
The Commander views this app as a group project, not a solo endeavor. 

- Future work should focus on building infrastructure that is comfortably accessed by multiple teammates.
- When facing complex strategic decisions (like balancing RAG vs. Instinct), the agent should ask: "Should we handle that together here, or is that exactly the kind of polish that is perfect for Team Assistance?"

---
*Last updated: v2.3.0 | By: Autumn*
