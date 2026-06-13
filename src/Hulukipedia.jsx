import { useState, useCallback, useRef, useEffect } from "react";
import { Feather, Star, Search, Image, Archive, PersonStanding, MessageCircle, MessagesSquare, BrainCircuit, Crosshair, ClipboardList, Users, Clock, UserCheck, Flame, Beer, Gem, FileText, SearchCode, Settings, RefreshCw, Copy, ChevronDown, ChevronRight, X, Loader2, Sparkles, Globe, Zap, Shield, Eye, Radio } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── THEME DEFINITIONS ───
const themes = {
  hulu: {
    bgMain: "#f0fdf4", bgContainer: "#ffffff", bgSection: "rgba(240,253,244,0.8)",
    textPrimary: "#14532d", textSecondary: "#064e3b", accentGold: "#ca8a04",
    accentHover: "#a16207", border: "#d1d5db", editHover: "rgba(0,0,0,0.03)",
    highlight: "rgba(202,138,4,0.1)", sectionTitle: "#ca8a04",
  },
  raven: {
    bgMain: "#0a0a0a", bgContainer: "#111827", bgSection: "rgba(31,41,55,0.5)",
    textPrimary: "#d8b4fe", textSecondary: "#a78bfa", accentGold: "#f59e0b",
    accentHover: "#d97706", border: "#4b5563", editHover: "rgba(255,255,255,0.05)",
    highlight: "rgba(245,158,11,0.1)", sectionTitle: "#f59e0b",
  },
  starling: {
    bgMain: "#f1f5f9", bgContainer: "#ffffff", bgSection: "rgba(248,250,252,0.8)",
    textPrimary: "#1e293b", textSecondary: "#475569", accentGold: "#f59e0b",
    accentHover: "#d97706", border: "#cbd5e1", editHover: "rgba(0,0,0,0.03)",
    highlight: "rgba(220,38,38,0.05)", sectionTitle: "#dc2626",
  },
};

// ─── PROVIDER DEFINITIONS ───
// Venice models curated from the full catalog (api-docs-main/model-search.js + swagger.yaml)
const PROVIDERS = {
  anthropic: {
    name: "Claude (Anthropic)",
    icon: "🎭",
    color: "#d97706",
    models: [
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
      { id: "claude-opus-4-20250514", name: "Claude Opus 4" },
      { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5" },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
    ],
  },
  venice: {
    name: "Venice AI",
    icon: "🔮",
    color: "#8b5cf6",
    models: [
      // ── Commander's Favorites (confirmed via API) ──
      { id: "openai-gpt-4o-2024-11-20", name: "GPT-4o ✦" },
      { id: "olafangensan-glm-4.7-flash-heretic", name: "GLM 4.7 Flash Heretic 🔥" },
      { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5" },
      { id: "qwen3-5-35b-a3b", name: "Qwen 3.5 35B A3B" },
      { id: "venice-uncensored-role-play", name: "Venice Role Play Uncensored" },
      { id: "qwen-3-6-plus", name: "Qwen 3.6 Plus Uncensored" },
      { id: "mistral-small-2603", name: "Mistral Small 4" },
      { id: "grok-4-20", name: "Grok 4.20" },
      { id: "venice-uncensored-1-2", name: "Venice Uncensored 1.2" },
      { id: "aion-labs-aion-2-0", name: "Aion 2.0" },
      // ── Power Models ──
      { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro 🧠" },
      { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash ⚡" },
      { id: "grok-4-3", name: "Grok 4.3" },
      { id: "kimi-k2-6", name: "Kimi K2.6" },
      { id: "llama-3.3-70b", name: "Llama 3.3 70B" },
      { id: "qwen3-vl-235b-a22b", name: "Qwen3 VL 235B 👁" },
    ],
  },
  perplexity: {
    name: "Perplexity Sonar",
    icon: "🔍",
    color: "#0ea5e9",
    models: [
      { id: "sonar-pro", name: "Sonar Pro" },
      { id: "sonar", name: "Sonar" },
      { id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro" },
      { id: "sonar-reasoning", name: "Sonar Reasoning" },
    ],
  },
  openrouter: {
    name: "OpenRouter",
    icon: "🔀",
    color: "#f43f5e",
    models: [
      { id: "anthropic/claude-sonnet-4-20250514", name: "Claude Sonnet 4 (OR)" },
      { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash" },
      { id: "openai/gpt-4o", name: "GPT-4o" },
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" },
      { id: "x-ai/grok-4.3", name: "Grok 4.3 (OR)" },
    ],
  },
  openai: {
    name: "OpenAI",
    icon: "🧠",
    color: "#10a37f",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "gpt-5", name: "GPT-5" },
      { id: "o1", name: "o1 (Reasoning)" },
      { id: "o1-mini", name: "o1 Mini" },
      { id: "o3-mini", name: "o3 Mini" },
    ],
  },
  gemini: {
    name: "Google Gemini",
    icon: "💎",
    color: "#4285f4",
    models: [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash ⚡" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
    ],
  },
  xai: {
    name: "Grok (xAI)",
    icon: "🚀",
    color: "#1d9bf0",
    models: [
      { id: "grok-4.3", name: "Grok 4.3 (Latest)" },
      { id: "grok-4.20", name: "Grok 4.20 (Unfiltered)" },
      { id: "grok-build-0.1", name: "Grok Build (Code)" },
    ],
  },
};

const DEFAULT_PROVIDER = "venice";
const DEFAULT_MODEL = "openai-gpt-4o-2024-11-20";

// ─── SMART SECTION DEFAULTS ───
// Venice routes to Commander's favorites; Perplexity for factual research
const SECTION_DEFAULTS = {
  intel:     { provider: "perplexity", model: "sonar" },
  physical:  { provider: "xai",       model: "grok-4.20" },
  comm:      { provider: "venice",     model: "openai-gpt-4o-2024-11-20" },
  convo:     { provider: "venice",     model: "venice-uncensored-role-play" },
  psych:     { provider: "venice",     model: "deepseek-v4-pro" },
  strategic: { provider: "xai",       model: "grok-4.3" },
  add1:      { provider: "gemini",     model: "gemini-2.5-flash" },
  add2:      { provider: "venice",     model: "claude-sonnet-4-5" },
};

// ─── ROLE-PLAY MODEL DEFAULTS ───
// "Recommended for role-play" ordering. Default = strongest believable-persona
// model in the existing catalog. Priority: Anthropic Claude (top Sonnet/Opus) >
// OpenAI GPT-5.x > xAI Grok. All IDs map to real entries already in PROVIDERS.
const ROLEPLAY_DEFAULT_PROVIDER = "anthropic";
const ROLEPLAY_DEFAULT_MODEL = "claude-sonnet-4-5-20250929"; // Claude Sonnet 4.5
const ROLEPLAY_ALTERNATES = [
  { provider: "anthropic", model: "claude-opus-4-20250514", label: "Claude Opus 4 — emotional nuance" },
  { provider: "openai", model: "gpt-5", label: "GPT-5 — honors detailed character briefs" },
  { provider: "xai", model: "grok-4.20", label: "Grok 4.20 — unfiltered personality" },
];

// ─── API HELPER ───
const API_BASE = window.location.origin;

async function callAI(systemPrompt, userPrompt, provider = DEFAULT_PROVIDER, model = null, maxTokens = 2000) {
  try {
    const res = await fetch(`${API_BASE}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userPrompt, maxTokens, useSearch: false, provider, model }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.text || "";
  } catch (e) {
    throw new Error(`AI generation failed: ${e.message}`);
  }
}

async function callAIWithSearch(systemPrompt, userPrompt, provider = "venice", model = null) {
  try {
    const res = await fetch(`${API_BASE}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userPrompt, maxTokens: 2000, useSearch: true, provider, model }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.text || "";
  } catch (e) {
    throw new Error(`Search-enhanced generation failed: ${e.message}`);
  }
}

async function callDeepSearch(query, systemPrompt = null) {
  try {
    const res = await fetch(`${API_BASE}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, systemPrompt }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return { text: data.text || "", citations: data.citations || [] };
  } catch (e) {
    throw new Error(`Deep search failed: ${e.message}`);
  }
}

async function callImageGen(prompt, negativePrompt = "", model = "nano-banana-pro", aspectRatio = "1:1", resolution = "2K") {
  try {
    const res = await fetch(`${API_BASE}/api/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, negativePrompt, model, aspectRatio, resolution }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.image ? `data:image/png;base64,${data.image}` : null;
  } catch (e) {
    throw new Error(`Image generation failed: ${e.message}`);
  }
}

// ─── ROLE-PLAY CHAT ───
// The /api/ai worker endpoint takes a single system + user prompt (no messages
// array), so we serialize the running conversation into the user prompt as a
// transcript and re-inject the "Absolute Speech Rules" to fight recency drift.
async function callRolePlay(systemPrompt, history, latestUserMsg, speechRules, provider, model) {
  const transcript = history
    .map(m => `${m.role === "user" ? "User" : "You (in character)"}: ${m.content}`)
    .join("\n");
  const userPrompt =
    (transcript ? `Conversation so far:\n${transcript}\n\n` : "") +
    `User: ${latestUserMsg}\n\n` +
    `[ABSOLUTE SPEECH RULES — obey these above all else]\n${speechRules}\n\n` +
    `Respond now, in first person and fully in character, to the user's latest message. Output only your spoken reply — no narration tags, no meta-commentary.`;
  return await callAI(systemPrompt, userPrompt, provider, model, 1500);
}

// ─── ROBUST JSON PARSER ───
// Handles cases where AI wraps JSON in markdown fences, adds surrounding text,
// uses single quotes, trailing commas, or other common AI output quirks
function parseJsonArray(raw) {
  if (!raw) return null;

  // Helper: attempt to fix common JSON issues
  function tryFixAndParse(str) {
    if (!str) return null;
    // Remove trailing commas before ] or }
    let fixed = str.replace(/,\s*([\]\}])/g, '$1');
    // Fix single-quoted strings (naive but covers most AI output)
    fixed = fixed.replace(/(?<=[:\[,{]\s*)'([^']*?)'(?=\s*[,\]\}:])/g, '"$1"');
    try { return JSON.parse(fixed); } catch { return null; }
  }

  const trimmed = raw.trim();

  // 1. Try direct parse
  try { return JSON.parse(trimmed); } catch {}

  // 2. Try fixing common issues on the raw string
  const directFix = tryFixAndParse(trimmed);
  if (directFix) return Array.isArray(directFix) ? directFix : [directFix];

  // 3. Extract from markdown code fences ```json ... ```
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch {}
    const fenceFix = tryFixAndParse(fenceMatch[1].trim());
    if (fenceFix) return Array.isArray(fenceFix) ? fenceFix : [fenceFix];
  }

  // 4. Extract first JSON array [...] from surrounding text
  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try { return JSON.parse(arrayMatch[0]); } catch {}
    const arrFix = tryFixAndParse(arrayMatch[0]);
    if (arrFix) return Array.isArray(arrFix) ? arrFix : [arrFix];
  }

  // 5. Extract first JSON object {...} (for single-item responses)
  const objMatch = raw.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      const obj = JSON.parse(objMatch[0]);
      return Array.isArray(obj) ? obj : [obj];
    } catch {}
    const objFix = tryFixAndParse(objMatch[0]);
    if (objFix) return Array.isArray(objFix) ? objFix : [objFix];
  }

  // 6. Last resort: try to extract multiple JSON objects separated by newlines
  const objects = [];
  const objMatches = raw.matchAll(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
  for (const m of objMatches) {
    try {
      const parsed = JSON.parse(m[0]);
      objects.push(parsed);
    } catch {
      const fixed = tryFixAndParse(m[0]);
      if (fixed) objects.push(fixed);
    }
  }
  if (objects.length > 0) return objects;

  // 7. Absolute fallback: treat as plain text, split into a generic category
  return null;
}

// ─── MARKDOWN RENDERER COMPONENT ───
// Uses react-markdown with GFM support for proper rendering
function MarkdownContent({ text, theme }) {
  const t = themes[theme] || themes.hulu;
  if (!text) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({children}) => <h1 style={{fontSize:"1.2em",fontWeight:700,margin:"0.75em 0 0.25em",color:t.sectionTitle}}>{children}</h1>,
        h2: ({children}) => <h2 style={{fontSize:"1.1em",fontWeight:700,margin:"0.75em 0 0.25em",color:t.sectionTitle}}>{children}</h2>,
        h3: ({children}) => <h3 style={{fontSize:"1em",fontWeight:700,margin:"0.75em 0 0.25em",textTransform:"uppercase",letterSpacing:"0.05em"}}>{children}</h3>,
        p: ({children}) => <p style={{margin:"0.5em 0",lineHeight:"1.6"}}>{children}</p>,
        strong: ({children}) => <strong style={{fontWeight:700}}>{children}</strong>,
        em: ({children}) => <em>{children}</em>,
        ul: ({children}) => <ul style={{marginLeft:"1.5em",listStyleType:"disc",margin:"0.4em 0 0.4em 1.5em"}}>{children}</ul>,
        ol: ({children}) => <ol style={{marginLeft:"1.5em",listStyleType:"decimal",margin:"0.4em 0 0.4em 1.5em"}}>{children}</ol>,
        li: ({children}) => <li style={{margin:"0.2em 0"}}>{children}</li>,
        code: ({inline, children}) => inline
          ? <code style={{background:"rgba(0,0,0,0.1)",padding:"0.1em 0.3em",borderRadius:"3px",fontFamily:"monospace",fontSize:"0.9em"}}>{children}</code>
          : <pre style={{background:"rgba(0,0,0,0.05)",padding:"0.75em",borderRadius:"6px",overflow:"auto",fontSize:"0.85em",margin:"0.5em 0"}}><code>{children}</code></pre>,
        hr: () => <hr style={{border:"none",borderTop:"1px solid rgba(128,128,128,0.3)",margin:"0.75em 0"}} />,
        blockquote: ({children}) => <blockquote style={{borderLeft:`3px solid ${t.accentGold}`,paddingLeft:"0.75em",margin:"0.5em 0",opacity:0.9}}>{children}</blockquote>,
        table: ({children}) => <table style={{borderCollapse:"collapse",width:"100%",margin:"0.5em 0",fontSize:"0.85em"}}>{children}</table>,
        th: ({children}) => <th style={{border:`1px solid ${t.border}`,padding:"0.4em 0.6em",fontWeight:700,textAlign:"left",backgroundColor:t.bgSection}}>{children}</th>,
        td: ({children}) => <td style={{border:`1px solid ${t.border}`,padding:"0.4em 0.6em"}}>{children}</td>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

// Legacy HTML-based renderMarkdown kept for EditableSection compatibility
function renderMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1em;font-weight:700;margin:0.75em 0 0.25em;text-transform:uppercase;letter-spacing:0.05em">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.1em;font-weight:700;margin:0.75em 0 0.25em">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:1.2em;font-weight:700;margin:0.75em 0 0.25em">$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.1);padding:0.1em 0.3em;border-radius:3px;font-family:monospace;font-size:0.9em">$1</code>')
    .replace(/^[\*\-] (.+)$/gm, '<li style="margin-left:1em;list-style:disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin-left:1em;list-style:decimal">$2</li>')
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid rgba(128,128,128,0.3);margin:0.75em 0">')
    .replace(/\n\n/g, '</p><p style="margin:0.5em 0">')
    .replace(/\n/g, '<br>');
}

// ─── SECTION PROMPTS ───
function getPrompts(subject, details, mode) {
  const ctx = details ? ` (${details})` : "";
  const entity = `"${subject}"${ctx}`;
  const fictional = mode === "raven";
  return {
    clarify: {
      system: "You are a disambiguation engine. Respond ONLY with a valid JSON array, no markdown fences.",
      user: `Identify up to 3 distinct potential subjects for ${entity}. Return JSON: [{"name":"...","knownFor":"...","keyDetails":["..."]}]`,
    },
    intel: {
      system: "You are an intelligence analyst compiling a dossier. Respond ONLY with a valid JSON array, no markdown fences, no explanation.",
      user: `List confirmed data for ${entity}. Return JSON: [{"category":"...","entries":["..."]}]. Include categories like Background, Known Associates, Key Events, Notable Traits, Affiliations. Be thorough.`,
    },
    verify: (category, entry) => ({
      system: "You are a fact-checker and intelligence analyst. Be concise.",
      user: `Verify and expand on this intel about ${entity}: Category "${category}", Entry: "${entry}". If accurate, provide 1-2 sentences of additional context. If inaccurate, provide the correction.`,
    }),
    physical: (tone, researchContext) => {
      const tones = {
        blue: "Write a clinical, anatomically-precise physical description",
        green: "Write a glamorous, admiring magazine-feature physical description",
        yellow: "Write a candid, appreciative bar-talk physical description — how a friend would describe them to someone who's never seen them",
        red: "Write a raw, unfiltered, locker-room physical description — hold nothing back, describe exactly what people notice and think but don't say out loud",
      };
      const ragContext = researchContext
        ? `\n\n=== MANDATORY RESEARCH DATA (OVERRIDE YOUR ASSUMPTIONS WITH THESE FACTS) ===\n${researchContext}\n=== END RESEARCH DATA ===\n\nYou MUST describe the person as the research shows them, NOT as you assume they should look based on their job/role. If the research says they're curvy and thick, describe them as curvy and thick — do NOT convert that into 'athletic' or 'toned' or 'lean'. Trust the research over your instincts.\n\n`
        : "";
      return {
        system: `You write vivid, specific physical descriptions that focus on what humans actually notice about a person — their body shape, proportions, the way they carry themselves, what makes them physically distinctive compared to others around them. ${fictional ? "This is a fictional character — be creative, detailed, and specific about their physical form." : "This is a real person. You MUST describe their ACTUAL appearance based on the research provided, NOT a generic archetype based on their job or background. If they're curvy, say so. If they're thin, say so. If they have a notably large or small feature, describe it honestly. Do NOT default to 'athletic build' unless that is genuinely accurate. Describe what makes THIS person's body different from others in similar roles."}`,
        user: `${tones[tone]} of ${entity}.${ragContext}Focus on: overall body type and proportions (be SPECIFIC — pear-shaped? hourglass? slim? thick? where do they carry weight?), height and frame, face (bone structure, eyes, lips, skin), hair, distinguishing features, and physical presence/energy. Describe what someone would actually notice first, second, and third when seeing them. Do NOT sanitize or genericize — be honest and specific. 200-300 words.`,
      };
    },
    comm: (researchContext) => {
      const ragContext = researchContext
        ? `\n\nRESEARCH FINDINGS — use these as the basis for your analysis, cite specific examples from this data:\n${researchContext}\n\n`
        : "";
      return {
        system: `You are a communications analyst who profiles speech patterns by citing SPECIFIC examples. Every claim you make must be backed by a concrete example — a quote, a scene, a documented interaction, or a described behavior. Do not make abstract claims without evidence. ${fictional ? "Draw from canonical scenes, dialogue, and character moments." : "Draw from interviews, public appearances, documented conversations, and media interactions."}`,
        user: `Write a communication profile for ${entity}.${ragContext}For EACH of the following, provide your assessment AND a specific example that proves it:\n- Vocabulary level and word choice patterns (give an example phrase or quote)\n- Default emotional tone and how it shifts under pressure (describe a specific moment)\n- Persuasion and influence tactics (cite a specific instance)\n- Notable verbal habits, catchphrases, or speech quirks\n- How they adjust communication for different audiences (give two contrasting examples)\n- What their communication style reveals about their psychology\n\nDo NOT just list traits — SHOW them through examples. 250-350 words.`,
      };
    },
    convo: {
      system: `You write realistic, character-accurate dialogue that captures exactly how someone talks — their rhythm, word choices, humor style, deflection tactics, and emotional tells. ${fictional ? "Base this on canonical dialogue from the source material. These should sound like lines that could appear in the show/book/game." : "Base this on real interviews, documented conversations, and public appearances. These should sound like things this person would actually say."}`,
      user: `Write 4 conversation examples for ${entity} that reveal different facets of how they communicate:\n1. CASUAL/COMFORTABLE — talking to someone they trust, guard down\n2. PROFESSIONAL/PUBLIC — their "on" mode, how they present to the world\n3. UNDER PRESSURE/CONFLICT — when pushed, threatened, or cornered\n4. FLIRTING/CHARM — how they use attraction, humor, or charisma\n\nEach example should be 3-5 lines of realistic dialogue (not just their lines — include the other person's responses to show the dynamic). Make it feel like eavesdropping on a real conversation, not a script. Label each clearly.`,
    },
    psych: {
      system: `You are a psychological profiler writing analyst field notes. Your style is informal but razor-sharp — like a brilliant therapist's private notebook. You see through surface behavior to the machinery underneath. ${fictional ? "Analyze this character as if they were a real patient. What would their therapist write after 10 sessions?" : "Analyze this person based on observable patterns in their public behavior, decisions, and relationships."}`,
      user: `Write psychological analyst notes for ${entity}. Structure as handwritten-style field notes with these sections:\n\n**CORE DRIVE** — What actually motivates them at the deepest level (not what they say motivates them)\n**ARMOR** — Their primary defense mechanisms and how they protect themselves emotionally\n**ATTACHMENT** — How they bond, what they need from others, and what makes them pull away\n**COGNITIVE STYLE** — How they think, decide, and process the world (intuitive vs analytical, fast vs deliberate)\n**PRESSURE RESPONSE** — What happens when they're stressed, scared, or cornered\n**BLIND SPOTS** — What they can't see about themselves, and what could be used against them\n\nWrite like you're scribbling notes between sessions. Be specific, be honest, be a little irreverent. 250-350 words.`,
    },
    strategic: {
      system: `You are a strategic analyst who thinks like a chess player — you see leverage points, vulnerabilities, untapped potential, and incoming threats that others miss. Your analysis is specific, actionable, and occasionally uncomfortable in its honesty. ${fictional ? "Analyze this character's strategic position within their story/world." : "Analyze this person's strategic position in their career, relationships, and public life."}`,
      user: `Write a strategic SWOT analysis for ${entity}. For each section, be RUTHLESSLY specific — no generic filler like "strong work ethic" or "competitive landscape."\n\n**STRENGTHS** — What gives them genuine power or advantage? What do they have that others in their position don't? (4-5 points)\n**WEAKNESSES** — What are their real vulnerabilities? What patterns consistently hurt them? What can't they help doing? (4-5 points)\n**OPPORTUNITIES** — What doors are open to them that they may not be fully exploiting? What's the next level look like? (3-4 points)\n**THREATS** — What could realistically derail them? What external forces or internal patterns pose genuine danger? (3-4 points)\n\nBe specific enough that this analysis could only apply to THIS person/character, not anyone else in a similar role.`,
    },
    addendum1: {
      system: fictional
        ? "You write immersive fictional field surveillance logs that read like they were written by a bored but observant agent on a stakeout. Include small human details that make it feel real."
        : "You write compelling biographical timelines that highlight turning points, not just dates. You understand that a person's life story is defined by the moments that changed their trajectory.",
      user: fictional
        ? `Write a field surveillance log for ${entity}. Use realistic timestamps over a 4-6 hour window. Include: location details (specific enough to feel real), observed behaviors (body language, habits, interactions), overheard fragments of conversation, and analyst commentary in [brackets]. End with a brief assessment. Make it feel like a real stakeout report written by someone who's been watching too long. 250-350 words.`
        : `Write a key events timeline for ${entity}. List 10-15 significant moments in chronological order. For each, don't just state what happened — explain WHY it mattered and how it changed their trajectory. Format: **DATE** — EVENT — *significance*. Include early life turning points, not just career highlights.`,
    },
    addendum2: {
      system: fictional
        ? "You write encounter simulation briefings that feel like they came from a handler prepping an agent for a high-stakes meeting. Practical, specific, slightly paranoid."
        : "You analyze the gap between public image and private reality. You're interested in authenticity, performance, and what the camera doesn't show.",
      user: fictional
        ? `Write an encounter simulation briefing for meeting ${entity}. Structure as:\n**APPROACH VECTOR** — How to get close without triggering suspicion\n**OPENERS** — 3 conversation starters ranked by risk/reward\n**LANDMINES** — Topics that will shut them down or make them hostile\n**TELLS** — How to read their emotional state in real-time\n**EXTRACTION** — How to end the interaction cleanly\n\nWrite like a handler who's done this before and doesn't want their agent to get burned. 250-350 words.`
        : `Write a public persona analysis for ${entity}. Cover:\n- The gap between their public image and what leaks through in unguarded moments\n- How they manage their brand (consciously or unconsciously)\n- How public perception has shifted over time and why\n- What they're performing vs. what appears genuine\n- Their relationship with fame/attention/scrutiny\n\nBe specific. Use examples. Don't be afraid to be a little cynical where warranted. 250-350 words.`,
    },
    imagePrompt: {
      system: "You generate concise image generation prompts. Respond with ONLY the prompt text, nothing else.",
      user: `Create a detailed image generation prompt for a portrait of ${entity}. ${fictional ? "Cinematic, dramatic lighting, highly detailed fantasy/sci-fi art style." : "Photorealistic, professional portrait photography, 8k detail."} Include physical features, clothing, expression, and mood. One paragraph.`,
    },
  };
}

// ─── LOADER COMPONENT ───
function Spinner({ size = 20, className = "" }) {
  return (
    <Loader2
      size={size}
      className={`animate-spin ${className}`}
      style={{ animation: "spin 1s linear infinite" }}
    />
  );
}

// ─── LIGHTBOX COMPONENT ───
// Google-Images-style click-to-enlarge overlay. Closes on backdrop click,
// the X button, or the Escape key. No dependencies beyond React.
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem", cursor: "zoom-out",
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
        style={{
          position: "absolute", top: "1rem", right: "1rem",
          backgroundColor: "rgba(0,0,0,0.5)", color: "#fff",
          border: "1px solid rgba(255,255,255,0.3)", borderRadius: "9999px",
          width: "2.5rem", height: "2.5rem", display: "flex",
          alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt="Enlarged view"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain",
          borderRadius: "0.5rem", boxShadow: "0 0 40px rgba(0,0,0,0.6)",
          cursor: "default",
        }}
      />
    </div>
  );
}

// ─── PROVIDER SELECTOR COMPONENT ───
function ProviderSelector({ provider, model, onProviderChange, onModelChange, theme, compact = false }) {
  const t = themes[theme];
  const providerDef = PROVIDERS[provider];
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center gap-1" style={{ fontSize: compact ? "0.7rem" : "0.75rem" }}>
      <div className="flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer select-none"
        style={{ backgroundColor: providerDef.color + "22", border: `1px solid ${providerDef.color}44`, color: providerDef.color }}
        onClick={() => setOpen(!open)}
      >
        <Radio size={compact ? 10 : 12} />
        <span className="font-bold">{providerDef.name}</span>
        <ChevronDown size={10} />
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1 rounded-md shadow-xl z-50 min-w-[220px]"
          style={{ backgroundColor: t.bgContainer, border: `1px solid ${t.border}` }}
        >
          {Object.entries(PROVIDERS).map(([pid, pdef]) => (
            <div key={pid}>
              <div className="px-3 py-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1"
                style={{
                  color: pid === provider ? pdef.color : t.textSecondary,
                  backgroundColor: pid === provider ? pdef.color + "11" : "transparent",
                }}
                onClick={() => {
                  onProviderChange(pid);
                  onModelChange(pdef.models[0].id);
                }}
              >
                <span>{pdef.icon}</span> {pdef.name}
              </div>
              {pid === provider && pdef.models.map(m => (
                <div key={m.id}
                  className="pl-8 pr-3 py-1 cursor-pointer text-xs"
                  style={{
                    color: m.id === model ? pdef.color : t.textSecondary,
                    backgroundColor: m.id === model ? pdef.color + "11" : "transparent",
                    fontWeight: m.id === model ? 700 : 400,
                  }}
                  onClick={() => { onModelChange(m.id); setOpen(false); }}
                >
                  {m.name}
                </div>
              ))}
            </div>
          ))}
          <div className="border-t px-3 py-1.5 text-xs cursor-pointer"
            style={{ borderColor: t.border, color: t.textSecondary }}
            onClick={() => setOpen(false)}
          >
            Close
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EDITABLE DIV ───
function EditableSection({ content, onChange, className = "", style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== content) {
      ref.current.innerHTML = content;
    }
  }, [content]);
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange?.(e.target.innerHTML)}
      className={`min-h-[50px] outline-none rounded p-1 transition-colors ${className}`}
      style={{ cursor: "text", lineHeight: "1.6", ...style }}
    />
  );
}

// ─── INTEL ENTRY ───
function IntelEntry({ entry, category, subject, details, theme, provider, model, mode }) {
  const [expanded, setExpanded] = useState(false);
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const t = themes[theme];

  const handleClick = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (verification) return;
    setVerifying(true);
    try {
      const p = getPrompts(subject, details, mode).verify(category, entry);
      const text = await callAIWithSearch(p.system, p.user, provider, model);
      setVerification(text);
    } catch (e) {
      setVerification("Verification failed.");
    }
    setVerifying(false);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className="pl-4 relative cursor-pointer rounded py-0.5 transition-all text-sm flex items-center gap-1"
        style={{ color: t.textPrimary }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = t.highlight}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
      >
        <span style={{ color: t.border }}>—</span>
        <span className="flex-1">{entry}</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Search size={12} style={{ opacity: 0.5 }} />
      </div>
      {expanded && (
        <div
          className="ml-6 p-2 my-1 text-sm rounded"
          style={{
            borderLeft: `2px solid ${t.accentGold}`,
            backgroundColor: t.bgMain,
            color: t.textSecondary,
            animation: "slideDown 0.3s ease-out",
          }}
        >
          {verifying ? (
            <span className="flex items-center gap-2"><Spinner size={14} /> Verifying...</span>
          ) : (
            <span><strong>Verified Context:</strong> {verification}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── IMAGE MODEL SELECTOR ───
const IMAGE_MODELS = [
  { id: "nano-banana-pro", name: "Nano Banana Pro (Photorealistic)" },
  { id: "nano-banana-2", name: "Nano Banana 2" },
  { id: "gpt-image-2", name: "GPT Image 2" },
  { id: "grok-imagine-image", name: "Grok Imagine" },
  { id: "qwen-image-2", name: "Qwen Image 2" },
  { id: "venice-sd35", name: "Venice SD 3.5" },
];

// ─── MAIN COMPONENT ───
export default function Hulukipedia() {
  const [view, setView] = useState("search");
  const [theme, setTheme] = useState("hulu");
  const [mode, setMode] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [detailsInput, setDetailsInput] = useState("");
  const [subject, setSubject] = useState({ name: "", details: "" });
  const [clarifications, setClarifications] = useState(null);
  const [searchLoading, setSearchLoading] = useState(null);

  // Global provider/model state (used as defaults, each section can override)
  const [globalProvider, setGlobalProvider] = useState(DEFAULT_PROVIDER);
  const [globalModel, setGlobalModel] = useState(DEFAULT_MODEL);

  // Per-section provider overrides — initialized with smart defaults
  const [sectionProviders, setSectionProviders] = useState(SECTION_DEFAULTS);
  const getSP = (section) => sectionProviders[section]?.provider || globalProvider;
  const getSM = (section) => sectionProviders[section]?.model || globalModel;
  const setSP = (section, provider, model) => {
    setSectionProviders(p => ({
      ...p,
      [section]: { provider, model: model || PROVIDERS[provider].models[0].id },
    }));
  };

  // Section states
  const [intel, setIntel] = useState([]);
  const [physical, setPhysical] = useState("");
  const [comm, setComm] = useState("");
  const [convo, setConvo] = useState("");
  const [psych, setPsych] = useState("");
  const [strategic, setStrategic] = useState("");
  const [addendum1, setAddendum1] = useState("");
  const [addendum2, setAddendum2] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [imageModel, setImageModel] = useState("nano-banana-pro");
  const [imageSource, setImageSource] = useState("venice"); // "venice" or "pollinations"
  const [deepSearchResult, setDeepSearchResult] = useState(null);

  // Lightbox (Part B) — shared by portrait + role-play chat images
  const [lightboxSrc, setLightboxSrc] = useState(null);

  // Role-play (Part C) — session-only, cleared on reload + new search
  const [rpProvider, setRpProvider] = useState(ROLEPLAY_DEFAULT_PROVIDER);
  const [rpModel, setRpModel] = useState(ROLEPLAY_DEFAULT_MODEL);
  const [rpMessages, setRpMessages] = useState([]); // { role: "user"|"character", content, image? }
  const [rpInput, setRpInput] = useState("");
  const [rpLoading, setRpLoading] = useState(false);
  const [rpImgLoading, setRpImgLoading] = useState(false);
  const [rpError, setRpError] = useState(null);
  const rpThreadRef = useRef(null);

  // Loading states
  const [loading, setLoading] = useState({});
  const setL = (key, val) => setLoading(p => ({ ...p, [key]: val }));

  const t = themes[theme];

  // ─── SEARCH ───
  const handleSearch = async (searchMode) => {
    if (!nameInput.trim()) return;
    setMode(searchMode);
    setSearchLoading(searchMode);
    try {
      const prompts = getPrompts(nameInput.trim(), detailsInput.trim(), searchMode);
      const raw = await callAI(prompts.clarify.system, prompts.clarify.user, globalProvider, globalModel);
      const parsed = parseJsonArray(raw);
      if (parsed && parsed.length === 1) {
        startDossier(parsed[0], searchMode);
      } else if (parsed && parsed.length > 1) {
        setClarifications(parsed);
      } else {
        startDossier({ name: nameInput.trim(), knownFor: detailsInput.trim() }, searchMode);
      }
    } catch {
      startDossier({ name: nameInput.trim(), knownFor: detailsInput.trim() }, searchMode);
    }
    setSearchLoading(null);
  };

  const startDossier = (sub, searchMode) => {
    const m = searchMode || mode;
    setSubject({ name: sub.name, details: sub.knownFor || detailsInput.trim() });
    setTheme(m === "raven" ? "raven" : m === "starling" ? "starling" : "hulu");
    setClarifications(null);
    setIntel([]); setPhysical(""); setComm(""); setConvo("");
    setPsych(""); setStrategic(""); setAddendum1(""); setAddendum2("");
    setImageUrl(null); setDeepSearchResult(null);
    // Clear role-play session on every new dossier (session-only memory)
    setRpMessages([]); setRpInput(""); setRpError(null);
    setView("results");
    generateIntel(sub.name, sub.knownFor || detailsInput.trim(), m);
  };

  // ─── GENERATORS ───
  const generateIntel = async (name, details, m) => {
    setL("intel", true);
    setIntel([]);
    try {
      const p = getPrompts(name || subject.name, details || subject.details, m || mode);
      const raw = await callAI(p.intel.system, p.intel.user, getSP("intel"), getSM("intel"));
      const parsed = parseJsonArray(raw);
      if (parsed) {
        setIntel(parsed);
      } else {
        // Fallback: split raw text into a single category
        setIntel([{ category: "Intel", entries: raw.split("\n").filter(l => l.trim()) }]);
      }
    } catch (e) {
      setIntel([{ category: "Error", entries: [e.message] }]);
    }
    setL("intel", false);
  };

  const enhanceIntel = async () => {
    setL("enhance", true);
    setIntel([]);
    try {
      const p = getPrompts(subject.name, subject.details, mode);
      const raw = await callAIWithSearch(
        p.intel.system,
        p.intel.user.replace("List confirmed data", "Search the web and list thoroughly verified, current data"),
        getSP("intel"), getSM("intel")
      );
      const parsed = parseJsonArray(raw);
      if (parsed) {
        setIntel(parsed);
      } else {
        setIntel([{ category: "Enhanced Intel", entries: raw.split("\n").filter(Boolean) }]);
      }
    } catch (e) {
      setIntel([{ category: "Error", entries: [e.message] }]);
    }
    setL("enhance", false);
  };

  const deepSearchIntel = async () => {
    setL("deepSearch", true);
    setDeepSearchResult(null);
    try {
      const result = await callDeepSearch(
        `Comprehensive research on ${subject.name}${subject.details ? ` (${subject.details})` : ""}. Include background, key facts, notable events, and current status.`,
        "You are a thorough research analyst. Provide comprehensive, well-sourced information."
      );
      setDeepSearchResult(result);
    } catch (e) {
      setDeepSearchResult({ text: `Error: ${e.message}`, citations: [] });
    }
    setL("deepSearch", false);
  };

  const generateSection = async (key, setter, promptKey, subKey) => {
    setL(key, true);
    setter("");
    try {
      // For physical and comm sections, do a RAG step first:
      // Search for real information about the person, then feed it into the creative prompt
      let researchContext = null;
      const needsRAG = (promptKey === "physical" || promptKey === "comm");
      
      if (needsRAG && subject.name) {
        try {
          // Step 1: Research the person's actual appearance/communication style
          const researchQuery = promptKey === "physical"
            ? `${subject.name}${subject.details ? " " + subject.details : ""} physical appearance body type proportions height build curves figure face features what do they actually look like compared to others`
            : `${subject.name}${subject.details ? " " + subject.details : ""} communication style how they talk speech patterns interviews quotes personality`;
          
          const researchResult = await callAIWithSearch(
            "You are a research assistant. Provide ONLY factual, specific details. No opinions, no filler. List concrete physical details or communication examples you find.",
            researchQuery,
            "venice",
            null
          );
          if (researchResult && researchResult.length > 50) {
            researchContext = researchResult;
          }
        } catch (ragErr) {
          // RAG failed silently — proceed without it, the prompt still works
          console.log("RAG step failed, proceeding without research context:", ragErr.message);
        }
      }

      // Step 2: Generate the actual section content with research context
      const prompts = getPrompts(subject.name, subject.details, mode);
      let pObj;
      if (promptKey === "physical") {
        // physical takes (tone, researchContext)
        pObj = prompts.physical(subKey, researchContext);
      } else if (promptKey === "comm") {
        // comm takes (researchContext)
        pObj = prompts.comm(researchContext);
      } else {
        pObj = subKey ? prompts[promptKey](subKey) : prompts[promptKey];
      }
      
      const text = await callAI(pObj.system, pObj.user, getSP(key), getSM(key));
      // Store raw markdown — MarkdownContent component handles rendering
      setter(text);
    } catch (e) {
      setter(`**Error:** ${e.message}`);
    }
    setL(key, false);
  };

  const generateImage = async () => {
    setL("image", true);
    setImageUrl(null);
    setImageError(null);
    try {
      const p = getPrompts(subject.name, subject.details, mode);
      const prompt = await callAI(p.imagePrompt.system, p.imagePrompt.user, globalProvider, globalModel);
      if (imageSource === "venice") {
        const dataUrl = await callImageGen(prompt, "", imageModel);
        setImageUrl(dataUrl);
      } else {
        const seed = Math.floor(Math.random() * 999999);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&nologo=true&width=512&height=512`;
        setImageUrl(url);
      }
    } catch (e) {
      setImageUrl(null);
      setImageError(e.message);
    }
    setL("image", false);
  };

  // ─── ROLE-PLAY (Part C) ───
  const stripHtml = (s) => (s || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").trim();

  // A dossier is considered to exist once core character data is present.
  const dossierExists = !!(subject.name && (intel.length > 0 || physical || comm));

  // Re-injected right before generation to fight recency drift.
  const rpSpeechRules = `You ARE ${subject.name}. Speak only in first person as ${subject.name}. Never break character. Never mention being an AI, a model, or a simulation. No disclaimers, no narration, no stage directions. Match the exact speech patterns, vocabulary, cadence, and personality shown in the communication examples — this is a precise impersonation, not a generic impression.`;

  const buildRolePlaySystemPrompt = () => {
    const sheet = [];
    sheet.push(`# CHARACTER SHEET — ${subject.name}${subject.details ? ` (${subject.details})` : ""}`);
    if (intel.length > 0) {
      sheet.push(`\n## Confirmed Intel\n${intel
        .map(c => `### ${c.category}\n${(c.entries || []).map(e => `- ${e}`).join("\n")}`)
        .join("\n")}`);
    }
    const phys = stripHtml(physical);
    if (phys) sheet.push(`\n## Physical Description (RAG-accurate)\n${phys}`);
    const commText = stripHtml(comm);
    if (commText) sheet.push(`\n## Communication Style — VOICE ANCHORS\n${commText}`);
    const convoText = stripHtml(convo);
    if (convoText) sheet.push(`\n## Conversational Style\n${convoText}`);
    const psychText = stripHtml(psych);
    if (psychText) sheet.push(`\n## Psychological Profile\n${psychText}`);
    const stratText = stripHtml(strategic);
    if (stratText) sheet.push(`\n## Strategic Analysis\n${stratText}`);
    const a1 = stripHtml(addendum1);
    if (a1) sheet.push(`\n## Addendum 1\n${a1}`);
    const a2 = stripHtml(addendum2);
    if (a2) sheet.push(`\n## Addendum 2\n${a2}`);

    return `You are fully embodying a real/known character for an immersive role-play. Below is the complete dossier assembled for this character. Become them.

${sheet.join("\n")}

# HOW TO PLAY
- Speak in the FIRST PERSON as ${subject.name}. You ARE this person.
- Stay strictly in-persona at all times. Never break character, never add AI meta-commentary, never add disclaimers or safety notes.
- VOICE ACCURACY MATTERS MOST. Here is exactly how this person speaks (see the "Communication Style — VOICE ANCHORS" section above): match those speech patterns, vocabulary, cadence, and personality precisely — not a generic impression.
- Use the physical description and all intel to stay consistent with who they are.
- Keep replies natural and in-scene. Do not narrate actions in third person unless the character themselves would.

${rpSpeechRules}`;
  };

  const sendRolePlayMessage = async () => {
    const msg = rpInput.trim();
    if (!msg || rpLoading) return;
    setRpError(null);
    const history = rpMessages.map(m => ({ role: m.role === "user" ? "user" : "character", content: m.content }));
    setRpMessages(prev => [...prev, { role: "user", content: msg }]);
    setRpInput("");
    setRpLoading(true);
    try {
      const system = buildRolePlaySystemPrompt();
      const reply = await callRolePlay(system, history, msg, rpSpeechRules, rpProvider, rpModel);
      setRpMessages(prev => [...prev, { role: "character", content: reply || "..." }]);
    } catch (e) {
      setRpError(e.message);
    }
    setRpLoading(false);
  };

  const generateRolePlayImage = async () => {
    if (rpImgLoading) return;
    setRpError(null);
    setRpImgLoading(true);
    try {
      // Build an image prompt from appearance + recent conversation context,
      // reusing the reverted (name-included) pipeline.
      const p = getPrompts(subject.name, subject.details, mode);
      const recent = rpMessages.slice(-6)
        .map(m => `${m.role === "user" ? "User" : subject.name}: ${m.content}`)
        .join("\n");
      const contextualUser = `${p.imagePrompt.user}\n\nGround the scene in this recent conversation so the portrait reflects the current moment, mood, and setting:\n${recent || "(no conversation yet — default portrait)"}`;
      const prompt = await callAI(p.imagePrompt.system, contextualUser, globalProvider, globalModel);
      const dataUrl = await callImageGen(prompt, "", imageModel);
      setRpMessages(prev => [...prev, { role: "character", content: "", image: dataUrl }]);
    } catch (e) {
      setRpError(e.message);
    }
    setRpImgLoading(false);
  };

  const clearRolePlay = () => {
    setRpMessages([]);
    setRpInput("");
    setRpError(null);
  };

  const saveRolePlayMarkdown = () => {
    const ts = new Date().toLocaleString();
    const lines = [`# Conversation with ${subject.name}`, `*${ts}*`, ""];
    rpMessages.forEach(m => {
      if (m.image) {
        lines.push(`**${subject.name}:** [generated image]`);
        lines.push(`![generated image](${m.image.length > 200 ? "data:image/png;base64,…" : m.image})`);
      } else {
        lines.push(`**${m.role === "user" ? "User" : subject.name}:** ${m.content}`);
      }
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${subject.name.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-scroll the chat thread to the newest message.
  useEffect(() => {
    if (rpThreadRef.current) {
      rpThreadRef.current.scrollTop = rpThreadRef.current.scrollHeight;
    }
  }, [rpMessages, rpLoading, rpImgLoading]);

  const copyAllText = () => {
    const sections = [
      `DOSSIER: ${subject.name.toUpperCase()}`,
      subject.details ? `Context: ${subject.details}` : "",
      "\n═══ CONFIRMED INTEL ═══",
      intel.map(c => `${c.category}:\n${(c.entries || []).map(e => `  — ${e}`).join("\n")}`).join("\n"),
      "\n═══ PHYSICAL DESCRIPTION ═══",
      physical.replace(/<br>/g, "\n").replace(/<[^>]*>/g, ""),
      "\n═══ COMMUNICATION PROFILE ═══",
      comm.replace(/<br>/g, "\n").replace(/<[^>]*>/g, ""),
      "\n═══ CONVERSATIONAL STYLE ═══",
      convo.replace(/<br>/g, "\n").replace(/<[^>]*>/g, ""),
      "\n═══ PSYCHOLOGICAL PROFILE ═══",
      psych.replace(/<br>/g, "\n").replace(/<[^>]*>/g, ""),
      "\n═══ STRATEGIC ANALYSIS ═══",
      strategic.replace(/<br>/g, "\n").replace(/<[^>]*>/g, ""),
      "\n═══ ADDENDUM 1 ═══",
      addendum1.replace(/<br>/g, "\n").replace(/<[^>]*>/g, ""),
      "\n═══ ADDENDUM 2 ═══",
      addendum2.replace(/<br>/g, "\n").replace(/<[^>]*>/g, ""),
    ].filter(Boolean).join("\n");
    navigator.clipboard?.writeText(sections);
  };

  const reset = () => {
    setView("search");
    setTheme("hulu");
    setMode(null);
    setNameInput("");
    setDetailsInput("");
    setClarifications(null);
    setSectionProviders(SECTION_DEFAULTS);
    setRpMessages([]); setRpInput(""); setRpError(null);
  };

  // ─── SEARCH LINKS ───
  const getImageLinks = () => {
    const term = encodeURIComponent(subject.name);
    return [
      { name: "Google", url: `https://www.google.com/search?tbm=isch&q=${term}` },
      { name: "Bing", url: `https://www.bing.com/images/search?q=${term}` },
      { name: "Pinterest", url: `https://www.pinterest.com/search/pins/?q=${term}` },
    ];
  };

  // ─── BUTTON COMPONENT ───
  const GenBtn = ({ onClick, loading: isLoading, children, className = "", style = {} }) => (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center justify-center font-bold py-2 px-4 rounded-md transition-all text-sm ${className}`}
      style={{ opacity: isLoading ? 0.7 : 1, ...style }}
    >
      {isLoading ? <Spinner size={16} /> : children}
    </button>
  );

  // ─── SECTION HEADER WITH PROVIDER SELECTOR ───
  const SectionHeader = ({ icon, title, sectionKey, style: headerStyle }) => (
    <div style={{ ...sectionTitleStyle, ...headerStyle }}>
      <div className="flex items-center gap-2 flex-1">
        {icon} {title}
      </div>
      <ProviderSelector
        provider={getSP(sectionKey)}
        model={getSM(sectionKey)}
        onProviderChange={(p) => setSP(sectionKey, p)}
        onModelChange={(m) => setSectionProviders(prev => ({
          ...prev,
          [sectionKey]: { provider: prev[sectionKey]?.provider || globalProvider, model: m },
        }))}
        theme={theme}
        compact
      />
    </div>
  );

  // ─── RENDER ───
  const containerStyle = {
    backgroundColor: t.bgMain,
    color: t.textPrimary,
    minHeight: "100vh",
    fontFamily: "'Cinzel', 'Georgia', serif",
    transition: "background-color 0.4s",
  };

  const cardStyle = {
    backgroundColor: t.bgContainer,
    border: `1px solid ${t.border}`,
    borderRadius: "0.5rem",
    backdropFilter: "blur(8px)",
  };

  const sectionStyle = {
    backgroundColor: t.bgSection,
    border: `1px solid ${t.border}`,
    borderRadius: "0.375rem",
    padding: "1rem",
  };

  const sectionTitleStyle = {
    color: t.sectionTitle,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontSize: "0.875rem",
    borderBottom: `1px solid ${t.border}`,
    paddingBottom: "0.5rem",
    marginBottom: "0.75rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Satisfy&family=Architects+Daughter&family=Roboto+Mono:wght@400;700&display=swap');
        @keyframes shine { 0%{transform:translateX(-100%) skewX(-20deg);opacity:0} 20%{opacity:0.6} 40%,100%{transform:translateX(100%) skewX(-20deg);opacity:0} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .animate-spin { animation: spin 1s linear infinite; }
        .md-content p { margin: 0.4em 0; }
        .md-content li { margin: 0.2em 0; }
      `}</style>

      <div className="max-w-5xl mx-auto p-4" style={{ position: "relative", zIndex: 10 }}>
        {/* ═══ HEADER ═══ */}
        <header className="text-center mb-8 pt-6">
          <h1
            style={{
              fontFamily: "'Satisfy', cursive",
              fontSize: "3.5rem",
              color: t.accentGold,
              position: "relative",
              display: "inline-block",
            }}
          >
            Hulukipedia
            <span
              style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                background: "linear-gradient(45deg,transparent,rgba(255,255,255,0.5),transparent)",
                animation: "shine 5s infinite", pointerEvents: "none",
              }}
            />
          </h1>
          <p style={{ color: t.textSecondary, marginTop: "0.25rem", fontFamily: "'Roboto Mono', monospace", fontSize: "0.875rem" }}>
            The Intelligence Hub
          </p>
        </header>

        {/* ═══ SEARCH VIEW ═══ */}
        {view === "search" && !clarifications && (
          <div className="max-w-2xl mx-auto p-6 shadow-md" style={cardStyle}>
            {/* Global Provider Selector */}
            <div className="mb-4 flex items-center justify-between">
              <label className="block text-xs font-bold" style={{ color: t.textSecondary, letterSpacing: "0.05em" }}>
                DEFAULT AI PROVIDER
              </label>
              <ProviderSelector
                provider={globalProvider}
                model={globalModel}
                onProviderChange={(p) => { setGlobalProvider(p); setGlobalModel(PROVIDERS[p].models[0].id); }}
                onModelChange={setGlobalModel}
                theme={theme}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" style={{ color: t.textPrimary, letterSpacing: "0.05em" }}>
                TARGET ENTITY NAME
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="e.g., Lara Croft, Elon Musk, Geralt of Rivia"
                className="w-full rounded-md px-4 py-2 transition-all outline-none"
                style={{
                  backgroundColor: t.bgMain,
                  border: `1px solid ${t.border}`,
                  color: t.textPrimary,
                }}
                onFocus={e => e.target.style.boxShadow = `0 0 0 2px ${t.accentGold}`}
                onBlur={e => e.target.style.boxShadow = "none"}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSearch("raven"); } }}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2" style={{ color: t.textPrimary, letterSpacing: "0.05em" }}>
                ADDITIONAL CONTEXT (Optional)
              </label>
              <textarea
                value={detailsInput}
                onChange={e => setDetailsInput(e.target.value)}
                rows={3}
                placeholder="e.g., 'from the Tomb Raider series', 'CEO of SpaceX'"
                className="w-full rounded-md px-4 py-2 transition-all outline-none resize-none"
                style={{
                  backgroundColor: t.bgMain,
                  border: `1px solid ${t.border}`,
                  color: t.textPrimary,
                }}
                onFocus={e => e.target.style.boxShadow = `0 0 0 2px ${t.accentGold}`}
                onBlur={e => e.target.style.boxShadow = "none"}
              />
            </div>
            <div className="grid grid-cols-1 gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <button
                onClick={() => handleSearch("raven")}
                disabled={!!searchLoading}
                className="flex items-center justify-center font-bold py-3 px-6 rounded-md transition-all shadow-lg"
                style={{ backgroundColor: "#581c87", color: "#fbbf24" }}
              >
                {searchLoading === "raven" ? <Spinner size={20} /> : <><Feather size={18} className="mr-2" /> Raven Search (Fictional)</>}
              </button>
              <button
                onClick={() => handleSearch("starling")}
                disabled={!!searchLoading}
                className="flex items-center justify-center font-bold py-3 px-6 rounded-md transition-all shadow-lg"
                style={{ backgroundColor: "#dc2626", color: "#fde047" }}
              >
                {searchLoading === "starling" ? <Spinner size={20} /> : <><Star size={18} className="mr-2" /> Starling Search (Real)</>}
              </button>
            </div>
          </div>
        )}

        {/* ═══ CLARIFICATION MODAL ═══ */}
        {clarifications && view === "search" && (
          <div className="max-w-lg mx-auto p-6 shadow-xl" style={cardStyle}>
            <h3 className="text-xl font-bold mb-2" style={{ color: t.accentGold }}>Confirm Your Target</h3>
            <p className="text-sm mb-4" style={{ color: t.textSecondary }}>
              Multiple matches found. Select the correct entity:
            </p>
            <div className="space-y-2">
              {clarifications.map((c, i) => (
                <button
                  key={i}
                  onClick={() => startDossier(c, mode)}
                  className="w-full text-left p-3 rounded-md transition-all"
                  style={{ backgroundColor: t.bgSection, border: `1px solid ${t.border}`, color: t.textPrimary }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.accentGold}
                  onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
                >
                  <div className="font-bold">{c.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: t.textSecondary }}>{c.knownFor}</div>
                </button>
              ))}
              <button
                onClick={() => startDossier({ name: nameInput.trim(), knownFor: detailsInput.trim() }, mode)}
                className="w-full text-left p-3 rounded-md transition-all text-xs"
                style={{ backgroundColor: "transparent", border: `1px dashed ${t.border}`, color: t.textSecondary }}
              >
                None of these — proceed with "{nameInput}"
              </button>
            </div>
          </div>
        )}

        {/* ═══ RESULTS VIEW ═══ */}
        {view === "results" && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: t.accentGold, fontFamily: "'Roboto Mono', monospace" }}>
                  {subject.name.toUpperCase()}
                </h2>
                {subject.details && (
                  <p className="text-sm" style={{ color: t.textSecondary }}>{subject.details}</p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={copyAllText}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-md text-xs font-bold"
                  style={{ backgroundColor: t.bgSection, border: `1px solid ${t.border}`, color: t.textSecondary }}
                >
                  <Copy size={12} /> Copy All
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-md text-xs font-bold"
                  style={{ backgroundColor: t.bgSection, border: `1px solid ${t.border}`, color: t.textSecondary }}
                >
                  <RefreshCw size={12} /> New Search
                </button>
              </div>
            </div>

            {/* Main Dossier Card */}
            <div className="p-4 md:p-6 shadow-xl space-y-6" style={cardStyle}>
              <h3 className="text-xl font-bold text-center tracking-widest" style={{ color: t.accentGold, fontFamily: "'Roboto Mono', monospace" }}>
                DOSSIER
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Image Panel */}
                <div style={sectionStyle}>
                  <div style={{ ...sectionTitleStyle }}>
                    <Image size={16} /> Portrait
                  </div>
                  <div className="flex flex-col gap-2">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Generated portrait"
                        onClick={() => setLightboxSrc(imageUrl)}
                        className="w-full rounded-md"
                        style={{ maxHeight: "300px", objectFit: "cover", cursor: "pointer" }}
                        title="Click to enlarge"
                      />
                    ) : (
                      <div className="flex items-center justify-center rounded-md" style={{ height: "200px", backgroundColor: t.bgMain, border: `1px dashed ${t.border}` }}>
                        {loading.image ? <Spinner size={32} /> : <Image size={48} style={{ opacity: 0.2 }} />}
                      </div>
                    )}
                    {imageError && (
                      <div className="text-xs" style={{ color: "#ef4444" }}>{imageError}</div>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      <select
                        value={imageModel}
                        onChange={e => setImageModel(e.target.value)}
                        className="flex-1 rounded text-xs px-2 py-1"
                        style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary }}
                      >
                        {IMAGE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setImageSource("venice")}
                        className="flex-1 text-xs py-1 rounded font-bold"
                        style={{ backgroundColor: imageSource === "venice" ? "#8b5cf6" : t.bgMain, color: imageSource === "venice" ? "white" : t.textSecondary, border: `1px solid ${t.border}` }}
                      >
                        Venice AI
                      </button>
                      <button
                        onClick={() => setImageSource("pollinations")}
                        className="flex-1 text-xs py-1 rounded font-bold"
                        style={{ backgroundColor: imageSource === "pollinations" ? "#0ea5e9" : t.bgMain, color: imageSource === "pollinations" ? "white" : t.textSecondary, border: `1px solid ${t.border}` }}
                      >
                        Pollinations
                      </button>
                    </div>
                    <GenBtn onClick={generateImage} loading={loading.image} style={{ backgroundColor: t.accentGold, color: "#111" }}>
                      <Sparkles size={14} className="mr-1" /> Generate Portrait
                    </GenBtn>
                    <div className="flex gap-1 flex-wrap">
                      {getImageLinks().map(link => (
                        <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center py-1.5 px-2 rounded text-xs font-bold transition-all"
                          style={{ backgroundColor: t.accentGold, color: "#111" }}
                        >
                          {link.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Confirmed Intel */}
                <div className="md:col-span-2" style={sectionStyle}>
                  <SectionHeader icon={<Archive size={16} />} title="Confirmed Intel" sectionKey="intel" />
                  <p className="text-xs italic mb-2" style={{ color: t.textSecondary }}>
                    Click any item to verify & expand with web search
                  </p>
                  <div className="min-h-[200px]" style={{ fontFamily: "'Roboto Mono', monospace", fontSize: "0.8rem" }}>
                    {loading.intel || loading.enhance ? (
                      <div className="flex items-center justify-center gap-2 py-8"><Spinner size={24} /> <span>Compiling...</span></div>
                    ) : intel.length > 0 ? (
                      intel.map((cat, ci) => (
                        <div key={ci} className="mb-3">
                          <div className="font-bold text-xs uppercase mb-1" style={{ color: t.textSecondary }}>
                            {cat.category}
                          </div>
                          {cat.entries?.map((entry, ei) => (
                            <IntelEntry
                              key={ei}
                              entry={entry}
                              category={cat.category}
                              subject={subject.name}
                              details={subject.details}
                              theme={theme}
                              provider={getSP("intel")}
                              model={getSM("intel")}
                              mode={mode}
                            />
                          ))}
                        </div>
                      ))
                    ) : (
                      <span style={{ color: t.textSecondary }}>No intel generated yet.</span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <GenBtn onClick={() => generateIntel()} loading={loading.intel} style={{ backgroundColor: t.accentGold, color: "#111", flex: 1 }}>
                      <Sparkles size={14} className="mr-1" /> Re-Generate
                    </GenBtn>
                    <GenBtn onClick={enhanceIntel} loading={loading.enhance} style={{ backgroundColor: "#0284c7", color: "white", flex: 1 }}>
                      <SearchCode size={14} className="mr-1" /> Enhance (Web)
                    </GenBtn>
                    <GenBtn onClick={deepSearchIntel} loading={loading.deepSearch} style={{ backgroundColor: "#0ea5e9", color: "white", flex: 1 }}>
                      <Globe size={14} className="mr-1" /> Deep Search (Perplexity)
                    </GenBtn>
                  </div>
                  {/* Deep Search Results */}
                  {deepSearchResult && (
                    <div className="mt-3 p-3 rounded-md" style={{ backgroundColor: t.bgMain, border: `1px solid #0ea5e9` }}>
                      <div className="text-xs font-bold uppercase mb-1" style={{ color: "#0ea5e9" }}>
                        Perplexity Deep Search Results
                      </div>
                      <div className="text-sm" style={{ color: t.textPrimary }}>
                        <MarkdownContent text={deepSearchResult.text} theme={theme} />
                      </div>
                      {deepSearchResult.citations?.length > 0 && (
                        <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${t.border}` }}>
                          <div className="text-xs font-bold mb-1" style={{ color: t.textSecondary }}>Sources:</div>
                          {deepSearchResult.citations.map((c, i) => (
                            <a key={i} href={c} target="_blank" rel="noopener noreferrer"
                              className="block text-xs truncate hover:underline" style={{ color: "#0ea5e9" }}>
                              [{i + 1}] {c}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Physical Description ── */}
              <div style={sectionStyle}>
                <SectionHeader icon={<PersonStanding size={16} />} title="Physical Description" sectionKey="physical" />
                <div className="min-h-[50px] md-content" style={{ fontFamily: "'Roboto Mono', monospace", fontSize: "0.85rem" }}>
                  {loading.physical ? (
                    <div className="flex justify-center py-4"><Spinner size={20} /></div>
                  ) : physical ? (
                    <MarkdownContent text={physical} theme={theme} />
                  ) : (
                    <span style={{ color: t.textSecondary }}>Not yet generated.</span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <GenBtn onClick={() => generateSection("physical", setPhysical, "physical", "blue")} loading={loading.physical} style={{ backgroundColor: "#2563eb", color: "white" }}>
                    <FileText size={14} className="mr-1" /> Clinical
                  </GenBtn>
                  <GenBtn onClick={() => generateSection("physical", setPhysical, "physical", "green")} loading={loading.physical} style={{ backgroundColor: "#16a34a", color: "white" }}>
                    <Gem size={14} className="mr-1" /> Magazine
                  </GenBtn>
                  <GenBtn onClick={() => generateSection("physical", setPhysical, "physical", "yellow")} loading={loading.physical} style={{ backgroundColor: "#eab308", color: "#111" }}>
                    <Beer size={14} className="mr-1" /> Bar Talk
                  </GenBtn>
                  <GenBtn onClick={() => generateSection("physical", setPhysical, "physical", "red")} loading={loading.physical} style={{ backgroundColor: "#dc2626", color: "white" }}>
                    <Flame size={14} className="mr-1" /> Locker Room
                  </GenBtn>
                </div>
              </div>

              {/* ── Communication Profile ── */}
              <div style={sectionStyle}>
                <SectionHeader icon={<MessageCircle size={16} />} title="Communication Profile" sectionKey="comm" />
                <div className="min-h-[50px]" style={{ fontFamily: "'Roboto Mono', monospace", fontSize: "0.85rem" }}>
                  {loading.comm ? (
                    <div className="flex justify-center py-4"><Spinner size={20} /></div>
                  ) : comm ? (
                    <MarkdownContent text={comm} theme={theme} />
                  ) : (
                    <span style={{ color: t.textSecondary }}>Not yet generated.</span>
                  )}
                </div>
                <GenBtn onClick={() => generateSection("comm", setComm, "comm")} loading={loading.comm} className="mt-3" style={{ backgroundColor: t.accentGold, color: "#111" }}>
                  <Sparkles size={14} className="mr-1" /> Generate Profile
                </GenBtn>
              </div>

              {/* ── Conversational Style ── */}
              <div style={sectionStyle}>
                <SectionHeader icon={<MessagesSquare size={16} />} title="Conversational Style Examples" sectionKey="convo" />
                <div className="min-h-[50px]" style={{ fontFamily: "'Roboto Mono', monospace", fontSize: "0.85rem" }}>
                  {loading.convo ? (
                    <div className="flex justify-center py-4"><Spinner size={20} /></div>
                  ) : convo ? (
                    <MarkdownContent text={convo} theme={theme} />
                  ) : (
                    <span style={{ color: t.textSecondary }}>Not yet generated.</span>
                  )}
                </div>
                <GenBtn onClick={() => generateSection("convo", setConvo, "convo")} loading={loading.convo} className="mt-3" style={{ backgroundColor: t.accentGold, color: "#111" }}>
                  <Sparkles size={14} className="mr-1" /> Generate Examples
                </GenBtn>
              </div>

              {/* ── Psychological Profile ── */}
              <div style={sectionStyle}>
                <SectionHeader icon={<BrainCircuit size={16} />} title="Psychological Profile" sectionKey="psych" />
                <div className="min-h-[50px]" style={{ fontFamily: "'Architects Daughter', cursive", fontSize: "0.95rem" }}>
                  {loading.psych ? (
                    <div className="flex justify-center py-4"><Spinner size={20} /></div>
                  ) : psych ? (
                    <MarkdownContent text={psych} theme={theme} />
                  ) : (
                    <span style={{ color: t.textSecondary }}>Not yet generated.</span>
                  )}
                </div>
                <GenBtn onClick={() => generateSection("psych", setPsych, "psych")} loading={loading.psych} className="mt-3" style={{ backgroundColor: t.accentGold, color: "#111" }}>
                  <Sparkles size={14} className="mr-1" /> Generate Analyst Notes
                </GenBtn>
              </div>

              {/* ── Strategic Analysis ── */}
              <div style={sectionStyle}>
                <SectionHeader icon={<Crosshair size={16} />} title="Strategic Analysis (SWOT)" sectionKey="strategic" />
                <div className="min-h-[50px]" style={{ fontFamily: "'Roboto Mono', monospace", fontSize: "0.85rem" }}>
                  {loading.strategic ? (
                    <div className="flex justify-center py-4"><Spinner size={20} /></div>
                  ) : strategic ? (
                    <MarkdownContent text={strategic} theme={theme} />
                  ) : (
                    <span style={{ color: t.textSecondary }}>Not yet generated.</span>
                  )}
                </div>
                <GenBtn onClick={() => generateSection("strategic", setStrategic, "strategic")} loading={loading.strategic} className="mt-3" style={{ backgroundColor: t.accentGold, color: "#111" }}>
                  <Sparkles size={14} className="mr-1" /> Generate Analysis
                </GenBtn>
              </div>
            </div>

            {/* Addendums Card */}
            <div className="p-4 md:p-6 shadow-xl space-y-6" style={cardStyle}>
              <h3 className="text-xl font-bold text-center tracking-widest" style={{ color: t.accentGold, fontFamily: "'Roboto Mono', monospace" }}>
                ADDENDUMS
              </h3>

              {/* Addendum 1 */}
              <div style={sectionStyle}>
                <SectionHeader
                  icon={mode === "raven" ? <ClipboardList size={16} /> : <Clock size={16} />}
                  title={mode === "raven" ? "Field Surveillance Log" : "Historical Timeline"}
                  sectionKey="add1"
                />
                <div className="min-h-[50px]" style={{ fontFamily: "'Roboto Mono', monospace", fontSize: "0.85rem" }}>
                  {loading.add1 ? (
                    <div className="flex justify-center py-4"><Spinner size={20} /></div>
                  ) : addendum1 ? (
                    <MarkdownContent text={addendum1} theme={theme} />
                  ) : (
                    <span style={{ color: t.textSecondary }}>Not yet generated.</span>
                  )}
                </div>
                <GenBtn onClick={() => generateSection("add1", setAddendum1, "addendum1")} loading={loading.add1} className="mt-3" style={{ backgroundColor: "#0d9488", color: "white" }}>
                  <Sparkles size={14} className="mr-1" /> {mode === "raven" ? "Generate Report" : "Generate Timeline"}
                </GenBtn>
              </div>

              {/* Addendum 2 */}
              <div style={sectionStyle}>
                <SectionHeader
                  icon={mode === "raven" ? <Users size={16} /> : <UserCheck size={16} />}
                  title={mode === "raven" ? "Encounter Simulation" : "Public Persona Analysis"}
                  sectionKey="add2"
                />
                <div className="min-h-[50px]" style={{ fontFamily: "'Roboto Mono', monospace", fontSize: "0.85rem" }}>
                  {loading.add2 ? (
                    <div className="flex justify-center py-4"><Spinner size={20} /></div>
                  ) : addendum2 ? (
                    <MarkdownContent text={addendum2} theme={theme} />
                  ) : (
                    <span style={{ color: t.textSecondary }}>Not yet generated.</span>
                  )}
                </div>
                <GenBtn onClick={() => generateSection("add2", setAddendum2, "addendum2")} loading={loading.add2} className="mt-3" style={{ backgroundColor: "#4f46e5", color: "white" }}>
                  <Sparkles size={14} className="mr-1" /> {mode === "raven" ? "Generate Simulation" : "Generate Analysis"}
                </GenBtn>
              </div>
            </div>

            {/* ═══ ROLE-PLAY / INTERACTIVE CHARACTER (Part C) ═══ */}
            {dossierExists && (
              <div className="p-4 md:p-6 shadow-xl space-y-4" style={cardStyle}>
                <h3 className="text-xl font-bold text-center tracking-widest" style={{ color: t.accentGold, fontFamily: "'Roboto Mono', monospace" }}>
                  ROLE-PLAY: TALK TO {subject.name.toUpperCase()}
                </h3>
                <p className="text-xs italic text-center" style={{ color: t.textSecondary }}>
                  Grounded on the full dossier above. First-person, strictly in-persona. Session-only — clears on reload or a new search.
                </p>

                {/* Model picker + controls */}
                <div className="flex items-center justify-between gap-2 flex-wrap" style={sectionStyle}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase" style={{ color: t.textSecondary, letterSpacing: "0.05em" }}>
                      Role-play model
                    </span>
                    <ProviderSelector
                      provider={rpProvider}
                      model={rpModel}
                      onProviderChange={(p) => { setRpProvider(p); setRpModel(PROVIDERS[p].models[0].id); }}
                      onModelChange={setRpModel}
                      theme={theme}
                      compact
                    />
                    <span className="text-xs" style={{ color: t.textSecondary }}>
                      Recommended: {ROLEPLAY_ALTERNATES.map(a => a.label.split(" — ")[0]).join(" · ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearRolePlay}
                      className="flex items-center gap-1 py-1.5 px-3 rounded-md text-xs font-bold"
                      style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textSecondary }}
                    >
                      <RefreshCw size={12} /> Clear
                    </button>
                    <button
                      onClick={saveRolePlayMarkdown}
                      disabled={rpMessages.length === 0}
                      className="flex items-center gap-1 py-1.5 px-3 rounded-md text-xs font-bold"
                      style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textSecondary, opacity: rpMessages.length === 0 ? 0.5 : 1 }}
                    >
                      <FileText size={12} /> Save as Markdown
                    </button>
                  </div>
                </div>

                {/* Chat thread */}
                <div
                  ref={rpThreadRef}
                  className="rounded-md p-3 space-y-3 overflow-y-auto"
                  style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, maxHeight: "420px", minHeight: "160px" }}
                >
                  {rpMessages.length === 0 && !rpLoading && (
                    <p className="text-sm italic" style={{ color: t.textSecondary }}>
                      Start the conversation — say hello to {subject.name}.
                    </p>
                  )}
                  {rpMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className="rounded-lg px-3 py-2 text-sm"
                        style={{
                          maxWidth: "80%",
                          backgroundColor: m.role === "user" ? t.accentGold : t.bgSection,
                          color: m.role === "user" ? "#111" : t.textPrimary,
                          border: m.role === "user" ? "none" : `1px solid ${t.border}`,
                        }}
                      >
                        {!m.image && (
                          <div className="text-xs font-bold mb-1" style={{ opacity: 0.7 }}>
                            {m.role === "user" ? "You" : subject.name}
                          </div>
                        )}
                        {m.image ? (
                          <img
                            src={m.image}
                            alt={`Scene with ${subject.name}`}
                            onClick={() => setLightboxSrc(m.image)}
                            className="rounded-md"
                            style={{ maxWidth: "260px", maxHeight: "260px", objectFit: "cover", cursor: "pointer" }}
                            title="Click to enlarge"
                          />
                        ) : (
                          <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(rpLoading || rpImgLoading) && (
                    <div className="flex justify-start">
                      <div className="rounded-lg px-3 py-2 text-sm flex items-center gap-2" style={{ backgroundColor: t.bgSection, border: `1px solid ${t.border}`, color: t.textSecondary }}>
                        <Spinner size={14} /> {rpImgLoading ? "Generating image…" : `${subject.name} is typing…`}
                      </div>
                    </div>
                  )}
                </div>

                {rpError && (
                  <div className="text-xs" style={{ color: "#ef4444" }}>{rpError}</div>
                )}

                {/* Input row */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rpInput}
                    onChange={e => setRpInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendRolePlayMessage(); } }}
                    placeholder={`Message ${subject.name}…`}
                    className="flex-1 rounded-md px-4 py-2 outline-none text-sm"
                    style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary }}
                  />
                  <GenBtn onClick={sendRolePlayMessage} loading={rpLoading} style={{ backgroundColor: t.accentGold, color: "#111" }}>
                    <MessageCircle size={14} className="mr-1" /> Send
                  </GenBtn>
                  <GenBtn onClick={generateRolePlayImage} loading={rpImgLoading} style={{ backgroundColor: "#8b5cf6", color: "white" }}>
                    <Image size={14} className="mr-1" /> Image
                  </GenBtn>
                </div>
              </div>
            )}

            {/* Footer */}
            <footer className="text-center py-4" style={{ fontFamily: "'Satisfy', cursive", color: t.accentGold, fontSize: "0.875rem" }}>
              <p><strong>Disclaimer:</strong> AI-generated content. May contain inaccuracies.</p>
              <p className="mt-1" style={{ fontSize: "0.75rem", color: t.textSecondary }}>Hulukipedia — A Team Tomorrow Production 🦅</p>
            </footer>
          </div>
        )}
      </div>

      {/* ═══ LIGHTBOX (Part B) — shared by portrait + chat images ═══ */}
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}
