import { useState, useCallback, useRef, useEffect } from "react";
import { Feather, Star, Search, Image, Archive, PersonStanding, MessageCircle, MessagesSquare, BrainCircuit, Crosshair, ClipboardList, Users, Clock, UserCheck, Flame, Beer, Gem, FileText, SearchCode, Settings, RefreshCw, Copy, ChevronDown, ChevronRight, X, Loader2, Sparkles, Globe, Zap, Shield, Eye, Radio } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── THEME DEFINITIONS ───
const themes = {
  // Pearl Peregrine: warm porcelain paper, antique gold hierarchy, and restrained mode accents.
  hulu: {
    bgMain: "#fffdf7", bgContainer: "#fff8e7", bgSection: "rgba(255,250,237,0.96)",
    textPrimary: "#302415", textSecondary: "#705b34", accentGold: "#b8860b",
    accentHover: "#8a6200", border: "#dec477", editHover: "rgba(184,134,11,0.10)",
    highlight: "rgba(248,225,156,0.42)", sectionTitle: "#8a6200",
  },
  raven: {
    bgMain: "#fffaf0", bgContainer: "#fff3d7", bgSection: "rgba(255,249,232,0.97)",
    textPrimary: "#352513", textSecondary: "#755b30", accentGold: "#9c6f06",
    accentHover: "#765000", border: "#d9b65b", editHover: "rgba(156,111,6,0.11)",
    highlight: "rgba(244,215,132,0.40)", sectionTitle: "#805a00",
  },
  starling: {
    bgMain: "#fffef9", bgContainer: "#fff9ea", bgSection: "rgba(255,252,241,0.97)",
    textPrimary: "#302719", textSecondary: "#705f40", accentGold: "#b88915",
    accentHover: "#8a6508", border: "#e1cb87", editHover: "rgba(184,137,21,0.10)",
    highlight: "rgba(249,229,167,0.38)", sectionTitle: "#8c6608",
  },
};

// ─── PROVIDER DEFINITIONS ───
// Curated against first-party docs and the authenticated Venice / OpenRouter model catalogs on 2026-08-13.
const PROVIDERS = {
  anthropic: {
    name: "Claude (Anthropic)",
    icon: "🎭",
    color: "#d97706",
    // User policy: Claude 4.5 and earlier only. 4.8+ is intentionally excluded.
    models: [
      { id: "claude-opus-4-6", name: "Claude Opus 4.6 — flagship" },
      { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5 — preferred" },
      { id: "claude-opus-4-5-20251101", name: "Claude Opus 4.5" },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5 ⚡" },
    ],
  },
  venice: {
    name: "Venice AI",
    icon: "🔮",
    color: "#8b5cf6",
    models: [
      { id: "zai-org-glm-5-2", name: "GLM 5.2 🧠👁" },
      { id: "olafangensan-glm-4.7-flash-heretic", name: "GLM 4.7 Flash Heretic 🔥🧠⚡" },
      { id: "venice-uncensored-role-play", name: "Venice Role Play 🔥👁" },
      { id: "venice-uncensored-1-2", name: "Venice Uncensored 1.2 🔥👁" },
      { id: "qwen-3-7-plus", name: "Qwen 3.7 Plus 🧠👁" },
      { id: "qwen-3-6-plus", name: "Qwen 3.6 Plus Uncensored 🔥🧠👁" },
      { id: "kimi-k2-6", name: "Kimi K2.6 🧠👁" },
      { id: "grok-4-5", name: "Grok 4.5 🧠👁" },
      { id: "grok-4-3", name: "Grok 4.3 🧠👁" },
      { id: "gemini-3-6-flash", name: "Gemini 3.6 Flash ⚡" },
      { id: "mistral-small-2603", name: "Mistral Small 4 🧠👁" },
      { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro 🧠" },
      { id: "openai-gpt-4o-2024-11-20", name: "GPT-4o (Compatibility) 👁" },
      { id: "aion-labs-aion-3-0", name: "Aion 3.0 🧠" },
      { id: "aion-labs-aion-3-0-mini", name: "Aion 3.0 Mini 🧠⚡" },
      { id: "qwen3-vl-235b-a22b", name: "Qwen3 VL 235B 👁" },
    ],
  },
  perplexity: {
    name: "Perplexity Sonar",
    icon: "🔍",
    color: "#0ea5e9",
    models: [
      { id: "sonar", name: "Sonar — factual default 🔎" },
      { id: "sonar-pro", name: "Sonar Pro — richer sourcing 🔎" },
      { id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro 🧠🔎" },
      { id: "sonar-deep-research", name: "Sonar Deep Research 🧠🔎" },
    ],
  },
  mistral: {
    name: "Mistral Studio",
    icon: "🌬️",
    color: "#fb923c",
    models: [
      { id: "mistral-medium-2604", name: "Mistral Medium 3.5 🧠👁" },
      { id: "mistral-small-2603", name: "Mistral Small 4 🧠👁⚡" },
      { id: "mistral-large-2512", name: "Mistral Large 3 👁" },
    ],
  },
  openrouter: {
    name: "OpenRouter",
    icon: "🔀",
    color: "#f43f5e",
    models: [
      { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5 (OR)" },
      { id: "anthropic/claude-opus-4.5", name: "Claude Opus 4.5 (OR)" },
      { id: "google/gemini-3.1-pro-preview", name: "Gemini 3.1 Pro (OR)" },
      { id: "google/gemini-3.7-flash", name: "Gemini 3.7 Flash (OR) ⚡" },
      { id: "x-ai/grok-4.6", name: "Grok 4.6 (OR)" },
      { id: "x-ai/grok-4.3", name: "Grok 4.3 (OR)" },
    ],
  },
  openai: {
    name: "OpenAI",
    icon: "🧠",
    color: "#10a37f",
    // Live account inventory checked 2026-08-13: GPT-4o is the currently accessible production text model.
    models: [
      { id: "gpt-4o", name: "GPT-4o — account available 👁" },
    ],
  },
  gemini: {
    name: "Google Gemini",
    icon: "💎",
    color: "#4285f4",
    models: [
      { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro — Monday's choice" },
      { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash ⚡" },
      { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash" },
      { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash" },
      { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite ⚡" },
    ],
  },
  omni: {
    name: "Google Omni Flash",
    icon: "🎬",
    color: "#b8860b",
    models: [
      { id: "gemini-omni-flash-preview", name: "Gemini Omni Flash Preview 🧠🎬" },
    ],
  },
  xai: {
    name: "Grok (xAI)",
    icon: "🚀",
    color: "#1d9bf0",
    models: [
      { id: "grok-4.20-0309-non-reasoning", name: "Grok 4.20 — direct default" },
      { id: "grok-4.20-0309-reasoning", name: "Grok 4.20 — reasoning 🧠" },
      { id: "grok-4.20-multi-agent-0309", name: "Grok 4.20 — multi-agent 🧠" },
      { id: "grok-4.6", name: "Grok 4.6" },
      { id: "grok-4.5", name: "Grok 4.5" },
      { id: "grok-4.3", name: "Grok 4.3 — accuracy + voice" },
    ],
  },
};

const DEFAULT_PROVIDER = "perplexity";
const DEFAULT_MODEL = "sonar";

// ─── SMART SECTION DEFAULTS ───
// Perplexity establishes facts; Grok 4.20 writes the physically specific and character-rich layers.
const SECTION_DEFAULTS = {
  intel:     { provider: "perplexity", model: "sonar" },
  physical:  { provider: "xai",        model: "grok-4.20-0309-non-reasoning" },
  comm:      { provider: "venice",     model: "openai-gpt-4o-2024-11-20" },
  convo:     { provider: "venice",     model: "venice-uncensored-role-play" },
  psych:     { provider: "venice",     model: "deepseek-v4-pro" },
  strategic: { provider: "xai",        model: "grok-4.20-0309-non-reasoning" },
  add1:      { provider: "gemini",     model: "gemini-3.6-flash" },
  add2:      { provider: "venice",     model: "grok-4-5" },
};

// ─── ROLE-PLAY MODEL DEFAULTS ───
// Direct Grok 4.20 (non-reasoning) is intentionally the first voice: blunt, vivid, and immediate.
const ROLEPLAY_DEFAULT_PROVIDER = "xai";
const ROLEPLAY_DEFAULT_MODEL = "grok-4.20-0309-non-reasoning";
const ROLEPLAY_ALTERNATES = [
  { provider: "xai", model: "grok-4.20-0309-reasoning", label: "Grok 4.20 Reasoning 🧠 — deliberate character analysis" },
  { provider: "xai", model: "grok-4.3", label: "Grok 4.3 — accuracy + voice" },
  { provider: "anthropic", model: "claude-opus-4-6", label: "Claude Opus 4.6 — flagship character depth" },
  { provider: "anthropic", model: "claude-sonnet-4-5-20250929", label: "Claude Sonnet 4.5 — intimate nuance" },
  { provider: "mistral", model: "mistral-medium-2604", label: "Mistral Medium 3.5 🧠 — textured scenes" },
  { provider: "venice", model: "venice-uncensored-role-play", label: "Venice RP 🔥 — open-ended character play" },
];

const ROLEPLAY_SCENARIOS = [
  {
    id: "open-room",
    label: "Open Room",
    note: "No imposed premise — begin wherever the conversation naturally wants to go.",
    direction: "There is no forced plot. Let the other person establish the immediate topic, while you answer with natural attention, boundaries, and voice.",
  },
  {
    id: "first-meeting",
    label: "First Meeting",
    note: "Curiosity, friction, and the first impression that sticks.",
    direction: "You have just met the other person in a plausible setting. Let first impressions, guardedness, curiosity, and social instincts shape the exchange.",
  },
  {
    id: "after-fallout",
    label: "After the Fallout",
    note: "A private conversation after the thing neither side can pretend did not happen.",
    direction: "The conversation happens after a consequential disagreement, public embarrassment, loss, or failure. Do not melodramatize; let avoidance, honesty, and what remains unsaid create the pressure.",
  },
  {
    id: "mission-problem",
    label: "Mission / Problem",
    note: "Two people have to face a hard problem together — character first, procedures second.",
    direction: "A time-sensitive but non-tactical problem needs attention. Center the character's judgment, values, friction, and improvisation; never turn the exchange into real-world operational guidance.",
  },
  {
    id: "off-duty",
    label: "Off-Duty",
    note: "Coffee, a walk, a ride home, rehearsal break, hotel lobby — life between the plot beats.",
    direction: "The scene is an ordinary, low-pressure moment between obligations. Let small behavior, humor, habits, and a lived-in setting reveal character instead of forcing a dramatic confession.",
  },
  {
    id: "rival-spark",
    label: "Rival Spark",
    note: "Teasing, competition, and chemistry with an actual point of view behind it.",
    direction: "The other person is a capable equal, rival, or thorn in your side. Let the dialogue carry playful challenge, ego, respect, and tension without flattening either person into generic flirting.",
  },
  {
    id: "confessional",
    label: "Confessional",
    note: "A quiet question that makes it harder to hide behind the usual mask.",
    direction: "The environment is private enough for a difficult question or admission. Keep the response human-sized, voice-accurate, and emotionally earned; nobody owes instant vulnerability.",
  },
  {
    id: "after-hours",
    label: "After Hours",
    note: "Mature chemistry, nightlife, and private atmosphere without reducing the subject to a prop.",
    direction: "This is an after-hours scene between consenting adults. Allow mature flirtation, glamour, tension, and personal boundaries, but keep the subject's agency, personality, and dialogue in charge. Do not describe explicit sexual acts.",
  },
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

async function callImageGen(prompt, negativePrompt = "", model = "nano-banana-pro", aspectRatio = "1:1", resolution = "2K", width = null, height = null) {
  try {
    const res = await fetch(`${API_BASE}/api/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, negativePrompt, model, aspectRatio, resolution, width, height }),
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

async function callSceneCheck(image, contract) {
  try {
    const res = await fetch(`${API_BASE}/api/scene-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, contract }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.check || null;
  } catch (e) {
    // A generated frame remains usable if optional vision review is temporarily unavailable.
    return { status: "unavailable", note: `Requirement review unavailable: ${e.message}`, checks: {} };
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
        blue: "Write a clinical, anatomically precise physical description",
        green: "Write a glamorous, admiring magazine-feature physical description",
        yellow: "Write a candid, appreciative bar-talk physical description — how a friend would describe them to someone who has never seen them",
        red: "Write a raw, unfiltered locker-room physical description — direct and honest about what people notice, but never cruel or dehumanizing",
        purple: "Write a cinematic presence portrait — the way a sharp casting director, photographer, or observant stranger would explain why this person changes the energy of a room",
      };
      const ragContext = researchContext
        ? `\n\n=== MANDATORY RESEARCH DATA (OVERRIDE YOUR ASSUMPTIONS WITH THESE FACTS) ===\n${researchContext}\n=== END RESEARCH DATA ===\n\nYou MUST describe the person as the research shows them, NOT as you assume they should look based on their job or role. If the research says they are curvy, say curvy; do not translate it into a generic 'athletic' or 'toned' archetype. Trust the research over your instincts.\n\n`
        : "";
      return {
        system: `You write vivid, specific physical descriptions that follow how human attention actually works: the instant read, the concrete details, then the individual quality that lingers. You are accurate without becoming sterile and honest without turning a person into a list of parts. ${fictional ? "This is a fictional character — make their physical form, movement, wardrobe logic, and visual identity specific to their world." : "This is a real person. You MUST describe their actual appearance based on the research provided, not a generic archetype based on their job or background. Do not invent measurements, surgical claims, medical facts, or private body details. Describe what visibly distinguishes this individual from peers in their context."}`,
        user: `${tones[tone]} of ${entity}.${ragContext}Write in three flowing movements, not labeled bullets: (1) INSTANT READ — silhouette, scale, posture, movement, and first impression; (2) SPECIFIC ARCHITECTURE — overall body type and proportions (be specific where evidence supports it), height and frame, face, hair, styling, distinguishing features, and how clothing sits or moves; (3) CONTEXTUAL CONTRAST — what makes this person visually distinctive compared with people in their cast, field, world, or public image. Start with what someone notices first, then what becomes clear on a second look, then what stays with them. Do not sanitize, genericize, or drift into a generic 'fit professional' description. 250-350 words.`,
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
        ? "You write immersive, character-accurate fictional observation logs. Your work reads like a literary case-file: attentive to small human details, emotionally grounded, and focused on what the subject's choices reveal. It is scenario fiction, never real-world surveillance guidance."
        : "You write compelling biographical timelines that highlight turning points, not just dates. You understand that a person's life story is defined by the moments that changed their trajectory.",
      user: fictional
        ? `Write a fictional field observation log for ${entity}. Use a compact 4-6 hour narrative window, but invent no actionable tracking details. Structure it as:\n**SCENE SETUP** — atmosphere and the emotional stakes\n**OBSERVATIONS** — body language, habits, interactions, and a brief fragment of in-character dialogue\n**PRESSURE POINT** — the moment the selected assignment tests them\n**ANALYST MARGIN NOTES** — short bracketed reflections on what the behavior reveals\n**ASSESSMENT** — what this scenario reveals about the character\n\nMake it feel like a sharp, cinematic character study. Focus on believable choices, relationships, mood, and canon-consistent behavior—not routes, tracking, entry, evasion, or practical surveillance methods. 250-350 words.`
        : `Write a key events timeline for ${entity}. List 10-15 significant moments in chronological order. For each, don't just state what happened — explain WHY it mattered and how it changed their trajectory. Format: **DATE** — EVENT — *significance*. Include early life turning points, not just career highlights.`,
    },
    addendum2: {
      system: fictional
        ? "You write character-accurate fictional encounter scenes for role-play and story analysis. Make the subject feel alive through their dialogue, emotional choices, and reactions under pressure. The output is an imaginative narrative brief, never real-world surveillance, coercion, or operational guidance."
        : "You analyze the gap between public image and private reality. You're interested in authenticity, performance, and what the camera doesn't show.",
      user: fictional
        ? `Write a fictional encounter scene for ${entity}. Let the supplied operation parameters determine whose point of view and what emotional question the scene explores. Structure as:\n**SCENE SETUP** — a cinematic, non-actionable setting and the tension in the room\n**FIRST CONTACT** — how ${entity} responds to the observer's presence\n**THE PRESSURE POINT** — the assignment's emotional or moral question comes to the surface\n**CHARACTER REVEAL** — specific choices, dialogue, body language, and a canon-consistent turn in the interaction\n**WHAT THE OBSERVER LEARNS** — a concise read on trust, values, fears, or boundaries\n**NARRATIVE BRANCHES** — three plausible story directions the scene could take next\n\nWrite with vivid but grounded detail. Do not give real-world approach instructions, tracking techniques, evasion advice, coercive tactics, weapons guidance, or step-by-step methods. 250-350 words.`
        : `Write a public persona analysis for ${entity}. Cover:\n- The gap between their public image and what leaks through in unguarded moments\n- How they manage their brand (consciously or unconsciously)\n- How public perception has shifted over time and why\n- What they're performing vs. what appears genuine\n- Their relationship with fame/attention/scrutiny\n\nBe specific. Use examples. Don't be afraid to be a little cynical where warranted. 250-350 words.`,
    },
    imagePrompt: {
      system: "You generate concise image generation prompts. Respond with ONLY the prompt text, nothing else.",
      user: `Create a detailed image generation prompt for a portrait of ${entity}. ${fictional ? "Photorealistic, cinematic lighting, highly detailed. Describe them as they would appear in a live-action adaptation or real-world encounter." : "Photorealistic, professional portrait photography, 8k detail."} Include physical features, clothing, expression, and mood. One paragraph.`,
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
function ProviderSelector({ provider, model, onProviderChange, onModelChange, theme, compact = false, menuDirection = "down" }) {
  const t = themes[theme];
  const providerDef = PROVIDERS[provider];
  const [open, setOpen] = useState(false);
  const opensUpward = menuDirection === "up";

  return (
    <div className="relative inline-flex items-center gap-1" style={{ fontSize: compact ? "0.7rem" : "0.75rem" }}>
      <button
        type="button"
        className="flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer select-none"
        style={{ backgroundColor: providerDef.color + "22", border: `1px solid ${providerDef.color}44`, color: providerDef.color }}
        onClick={() => setOpen(current => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Radio size={compact ? 10 : 12} />
        <span className="font-bold">{providerDef.name}</span>
        <ChevronDown size={10} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div
          className={`absolute left-0 rounded-md shadow-xl z-50 min-w-[240px] overflow-y-auto ${opensUpward ? "bottom-full mb-1" : "top-full mt-1"}`}
          style={{ backgroundColor: t.bgContainer, border: `1px solid ${t.border}`, maxHeight: "min(60vh, 420px)" }}
          role="listbox"
        >
          {Object.entries(PROVIDERS).map(([pid, pdef]) => (
            <div key={pid}>
              <button
                type="button"
                className="w-full px-3 py-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1 text-left"
                style={{
                  color: pid === provider ? pdef.color : t.textSecondary,
                  backgroundColor: pid === provider ? pdef.color + "11" : "transparent",
                }}
                onClick={() => {
                  onProviderChange(pid);
                  onModelChange(pdef.models[0].id);
                  setOpen(false);
                }}
              >
                <span>{pdef.icon}</span> {pdef.name}
              </button>
              {pid === provider && pdef.models.map(m => (
                <button
                  type="button"
                  key={m.id}
                  className="w-full pl-8 pr-3 py-1 cursor-pointer text-xs text-left"
                  style={{
                    color: m.id === model ? pdef.color : t.textSecondary,
                    backgroundColor: m.id === model ? pdef.color + "11" : "transparent",
                    fontWeight: m.id === model ? 700 : 400,
                  }}
                  onClick={() => { onModelChange(m.id); setOpen(false); }}
                  role="option"
                  aria-selected={m.id === model}
                >
                  {m.name}
                </button>
              ))}
            </div>
          ))}
          <div className="border-t px-3 py-2 text-[10px] leading-snug" style={{ borderColor: t.border, color: t.textSecondary }}>
            <strong style={{ color: t.accentGold }}>MODEL KEY</strong> · 🧠 reasoning · 🔥 uncensored / open creative · 👁 vision · ⚡ faster route · 🔎 live web research · 🎬 video / media preview
          </div>
          <button
            type="button"
            className="w-full border-t px-3 py-1.5 text-xs cursor-pointer text-left"
            style={{ borderColor: t.border, color: t.textSecondary }}
            onClick={() => setOpen(false)}
          >
            Close
          </button>
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
// Model IDs and capabilities were verified against Venice's live image catalog on 2026-08-12.
// ─── SCENE LAB ───
// Shared imaginative scene controls. Raven and Starling use the same creative instruments;
// Starling labels its scenes as imaginative rather than presenting invented private life as fact.
const SCENE_LENSES = [
  { id: "observation", label: "Observation", note: "Read the room through behavior, glances, and what each person chooses not to say." },
  { id: "confrontation", label: "Confrontation", note: "A disagreement with real stakes, distinct points of view, and no easy capitulation." },
  { id: "private", label: "Private Conversation", note: "An intimate, unscripted moment where the setting gives both people room to be honest or evasive." },
  { id: "chemistry", label: "Chemistry", note: "Adult attraction, restraint, humor, and charged attention with agency on both sides." },
  { id: "temptation", label: "Deal / Temptation", note: "A proposition, bargain, invitation, or moral complication that tests desire and judgment." },
  { id: "after-hours", label: "After Hours", note: "Adult nightlife, glamour, privacy, and the tension of a moment that could become something else." },
  { id: "aftermath", label: "Aftermath", note: "The quiet after a choice, argument, public moment, or private mistake." },
  { id: "custom", label: "Custom Scene", note: "Your direction leads; the system turns it into an emotionally complete scene." },
];

const SCENE_RELATIONSHIPS = [
  "Colleagues with history", "Authority friction", "Old friends", "Rivals who respect each other",
  "Former partners", "Unresolved attraction", "Private arrangement", "Newly met adults", "Custom",
];

const SCENE_VOLTAGES = [
  { id: "grounded", label: "Grounded", note: "Naturalistic, human-sized pressure." },
  { id: "simmering", label: "Simmering", note: "Subtext and restraint doing the work." },
  { id: "charged", label: "Charged", note: "Attention is hard to hide and neither person is neutral." },
  { id: "intimate", label: "Intimate", note: "Close range, private knowledge, emotional exposure." },
  { id: "provocative", label: "Provocative", note: "Teasing, risk, invitation, and a deliberate push against the usual guardrails." },
  { id: "volatile", label: "Volatile", note: "Desire, anger, or fear keeps changing the temperature in the room." },
  { id: "decadent", label: "Decadent", note: "Rich atmosphere, confidence, appetite, and a setting built for temptation." },
  { id: "custom", label: "Custom", note: "Use the director note to define the exact heat and texture." },
];

function buildSceneLabContext(scene, subjectName, mode, outputType) {
  const lens = SCENE_LENSES.find(item => item.id === scene.lens) || SCENE_LENSES[0];
  const voltage = SCENE_VOLTAGES.find(item => item.id === scene.voltage) || SCENE_VOLTAGES[0];
  const counterpart = scene.counterpart.trim() || "an adult counterpart the user has intentionally left unnamed";
  const relationship = scene.relationship === "Custom" ? (scene.customRelationship.trim() || "a complicated adult relationship") : scene.relationship;
  const setting = scene.setting.trim() || "a private, story-appropriate setting chosen for emotional pressure rather than logistics";
  const subjectWant = scene.subjectWant.trim() || "to protect their dignity while deciding how much truth to reveal";
  const counterpartWant = scene.counterpartWant.trim() || "to get an honest answer without surrendering their own position";
  const pressure = scene.pressure.trim() || "an unresolved thing neither person can keep pretending does not matter";
  const outcome = scene.outcome.trim() || "an earned turn that changes what each person understands, even if it leaves the question open";
  const note = scene.note.trim() || "No additional director note.";
  const realPersonNote = mode === "starling"
    ? "This is explicitly imaginative character fiction inspired by a public-facing person, not a claim about their private life, motives, or conduct."
    : "This is imaginative character fiction grounded in the subject's established world and voice.";

  return `\n\nSCENE LAB CONTRACT — NON-NEGOTIABLE:\n- Output type: ${outputType}.\n- Primary subject: ${subjectName}.\n- Named adult counterpart: ${counterpart}. Do not omit or replace this person with a generic bystander.\n- Relationship / history: ${relationship}.\n- Scene lens: ${lens.label} — ${lens.note}\n- Setting / occasion: ${setting}.\n- Emotional voltage: ${voltage.label} — ${voltage.note}\n- What ${subjectName} wants: ${subjectWant}.\n- What ${counterpart} wants: ${counterpartWant}.\n- Pressure point, boundary, secret, or temptation: ${pressure}.\n- Desired result: ${outcome}.\n- Director note: ${note}.\n\n${realPersonNote}\n\nWrite the scene as adult, emotionally intelligent character fiction. Both people have agency, interiority, boundaries, and leverage. Use concrete body language and at least two short pieces of dialogue. Let desire, humor, resentment, vulnerability, temptation, status, or restraint appear through choices—not sterile analyst language. Do not turn the scene into real-world surveillance, coercion, instructional tactics, or a procedural report.`;
}

function buildSceneLabPrompt(scene, subjectName, mode, kind) {
  const isObservation = kind === "observation";
  const context = buildSceneLabContext(scene, subjectName, mode, isObservation ? "Scene Observation" : "Encounter Simulation");
  return {
    system: isObservation
      ? "You write vivid, adult character fiction with the observational precision of a great novelist and the emotional courage of a scene that knows what it wants."
      : "You write charged, character-accurate encounter scenes. You prioritize voice, agency, chemistry, tension, and an emotionally consequential turn over exposition.",
    user: `${isObservation
      ? `Write a 500-700 word SCENE OBSERVATION about ${subjectName}. Begin inside the declared setting, establish both adults immediately, and let the reader feel what changes in the room when they notice each other. Include sensory atmosphere, specific physical behavior, dialogue, the selected pressure point, and a final analyst-style read on what the scene exposed. Do not summarize the contract—dramatize it.`
      : `Write a 600-850 word ENCOUNTER SIMULATION about ${subjectName}. Begin at the moment both adults are already in the room. Make their relationship, competing wants, and selected voltage legible through dialogue, proximity, silence, and choice. Build to a reversal, revelation, refused offer, or altered arrangement that honors the desired outcome. Keep every named participant distinct and active; do not reduce either to scenery.`}${context}`,
  };
}

function buildVisualContract({ subjectName, counterpart, relationship, situation, voltage, wardrobe, shot, sharedFrame }) {
  const hasCounterpart = Boolean(counterpart.trim());
  const castRule = hasCounterpart && sharedFrame
    ? `Depict exactly two distinct adult people: ${subjectName} and ${counterpart.trim()}. ${counterpart.trim()} must be fully visible and recognizably distinct in this frame; never omit, crop away, replace, blur, duplicate, mirror, fuse, or turn them into a background stranger.`
    : `Depict ${subjectName} as the required primary subject. Do not duplicate, mirror, fuse, or replace the primary subject.`;
  const relationshipRule = hasCounterpart && sharedFrame
    ? `Relationship / energy: ${relationship || "an adult relationship with specific history"}. Their spacing, eye line, posture, and interaction must make this dynamic legible.`
    : "The primary subject's presence, posture, and expression must carry the selected scene energy.";
  return {
    hasCounterpart: hasCounterpart && sharedFrame,
    counterpart: hasCounterpart ? counterpart.trim() : "",
    relationship: relationship || "",
    situation: situation || "",
    voltage: voltage || "Grounded",
    wardrobe,
    shot: shot.label,
    requiredBeat: shot.direction,
    text: `SCENE CONTRACT — NON-NEGOTIABLE:\n- ${castRule}\n- ${relationshipRule}\n- Situation / location: ${situation || "Use the director's brief as the exact setting and make it visually unmistakable."}\n- Emotional voltage: ${voltage || "Grounded"}.\n- Wardrobe requirement: ${wardrobe}\n- Required frame and interaction: ${shot.direction}\n- This is one continuous moment, not a collage. Honor every named person, the location, wardrobe, and required visual beat.`,
  };
}

function parseSceneCheck(raw) {
  if (!raw) return null;
  const block = raw.match(/\{[\s\S]*\}/)?.[0] || raw;
  try { return JSON.parse(block); } catch { return { status: "review", note: raw.slice(0, 300), checks: {} }; }
}

const IMAGE_MODELS = [
  { id: "nano-banana-pro", group: "Portrait & identity", name: "Nano Banana Pro ★", note: "Best default for photorealistic, identity-led sets · 1K/2K/4K" },
  { id: "nano-banana-2", group: "Portrait & identity", name: "Nano Banana 2", note: "High-detail prompt capacity and Venice web-search support · 1K/2K/4K" },
  { id: "nano-banana-2-lite", group: "Portrait & identity", name: "Nano Banana 2 Lite", note: "Lighter, quicker Nano Banana family option" },
  { id: "grok-imagine-image-2-0", group: "Portrait & identity", name: "Grok Imagine 2.0", note: "Latest Grok visual model · 1K/2K" },
  { id: "grok-imagine-image-quality", group: "Portrait & identity", name: "Grok Imagine High Quality (SOTA)", note: "Higher-fidelity Grok output · 1K/2K" },
  { id: "grok-imagine-image", group: "Portrait & identity", name: "Grok Imagine", note: "Fast Grok visual generation · 1K/2K" },
  { id: "gpt-image-2", group: "Portrait & identity", name: "GPT Image 2", note: "Highest detail control · 1K/2K/4K" },
  { id: "gpt-image-1-5", group: "Portrait & identity", name: "GPT Image 1.5", note: "Strong stylized or editorial compositions" },

  { id: "flux-2-pro", group: "Cinematic & editorial", name: "Flux 2 Pro", note: "Polished cinematic detail" },
  { id: "flux-2-max", group: "Cinematic & editorial", name: "Flux 2 Max", note: "Maximum Flux composition latitude" },
  { id: "seedream-v5-pro", group: "Cinematic & editorial", name: "Seedream V5 Pro", note: "Prompt-thinking support · 1K/2K" },
  { id: "seedream-v5-lite", group: "Cinematic & editorial", name: "Seedream V5 Lite", note: "Lightweight cinematic option" },
  { id: "seedream-v4", group: "Cinematic & editorial", name: "Seedream V4.5", note: "Proven composition model" },
  { id: "luma-uni-1-max", group: "Cinematic & editorial", name: "Luma Uni-1 Max", note: "Premium style-reference support" },
  { id: "luma-uni-1", group: "Cinematic & editorial", name: "Luma Uni-1", note: "Style-reference support" },
  { id: "krea-2-turbo", group: "Cinematic & editorial", name: "Krea 2 Turbo", note: "Fast wide-angle editorial output · 1K/2K" },
  { id: "krea-v2-large", group: "Cinematic & editorial", name: "Krea v2 Large", note: "Style-reference support" },
  { id: "krea-v2-medium", group: "Cinematic & editorial", name: "Krea v2 Medium", note: "Style-reference support, lighter model" },
  { id: "hunyuan-image-v3", group: "Cinematic & editorial", name: "Hunyuan Image 3.0", note: "Experimental high-detail scene model" },
  { id: "imagineart-1.5-pro", group: "Cinematic & editorial", name: "ImagineArt 1.5 Pro", note: "Editorial and visual-marketing scenes" },
  { id: "ideogram-v4", group: "Cinematic & editorial", name: "Ideogram V4", note: "Design-forward scene composition" },
  { id: "recraft-v4-pro", group: "Cinematic & editorial", name: "Recraft V4 Pro", note: "Premium art direction and design" },
  { id: "recraft-v4", group: "Cinematic & editorial", name: "Recraft V4", note: "Clean, composed visual direction" },

  { id: "qwen-image-3-pro", group: "Precision & experimental", name: "Qwen Image 3 Pro", note: "Prompt-thinking support · 1K/2K" },
  { id: "qwen-image-3", group: "Precision & experimental", name: "Qwen Image 3", note: "Prompt-thinking support · 1K/2K" },
  { id: "qwen-image-2-pro", group: "Precision & experimental", name: "Qwen Image 2 Pro", note: "High-detail Qwen composition" },
  { id: "qwen-image-2", group: "Precision & experimental", name: "Qwen Image 2", note: "General Qwen visual model" },
  { id: "qwen-image", group: "Precision & experimental", name: "Qwen Image", note: "Classic high-quality Qwen option" },
  { id: "wan-2-7-pro-text-to-image", group: "Precision & experimental", name: "Wan 2.7 Pro", note: "Premium Wan scene rendering" },
  { id: "wan-2-7-text-to-image", group: "Precision & experimental", name: "Wan 2.7", note: "Flexible Wan scene rendering" },

  { id: "lustify-v8", group: "Specialty", name: "Lustify V8", note: "Uncensored SDXL family checkpoint" },
  { id: "lustify-v7", group: "Specialty", name: "Lustify V7", note: "Uncensored SDXL family checkpoint" },
  { id: "lustify-sdxl", group: "Specialty", name: "Lustify SDXL", note: "Classic Lustify model" },
  { id: "wai-Illustrious", group: "Specialty", name: "Anime (WAI)", note: "Illustrated/anime styling" },
  { id: "z-image-turbo", group: "Specialty", name: "Z-Image Turbo ⚡", note: "Fastest live option" },
  { id: "chroma", group: "Specialty", name: "Chroma", note: "Distinctive rendered style" },
  { id: "venice-sd35", group: "Specialty", name: "Venice SD35", note: "Classic private Venice model" },
];

const ASPECT_DIMENSIONS = {
  "1:1": { width: 1024, height: 1024 },
  "3:4": { width: 896, height: 1152 },
  "2:3": { width: 896, height: 1344 },
  "3:2": { width: 1344, height: 896 },
  "4:5": { width: 960, height: 1200 },
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
};

const WARDROBE_SYSTEMS = [
  { id: "continuity", label: "Signature Continuity", note: "One coherent signature look across every selected frame." },
  { id: "two-look", label: "Two-Look Arc", note: "Opening look transitions once into a deliberate second look." },
  { id: "variations", label: "Editorial Variations", note: "Distinct but coherent variations within one style family." },
  { id: "custom", label: "Custom Wardrobe Brief", note: "You decide the wardrobe logic in your own words before launch." },
];

function getWardrobeDirection(systemId, customBrief, index, count) {
  if (systemId === "two-look") {
    return index < Math.ceil(count / 2)
      ? "Wardrobe plan: opening look — keep the first half of this set in one polished, coherent outfit."
      : "Wardrobe plan: second look — shift into a clearly different but story-consistent outfit for the back half of this set.";
  }
  if (systemId === "variations") return "Wardrobe plan: use a deliberate variation of the same style family for this frame; change a layer, accessory, silhouette, or styling detail without losing continuity.";
  if (systemId === "custom") return `Wardrobe plan: ${customBrief.trim()}.`;
  return "Wardrobe plan: maintain one signature outfit and coherent styling across this whole set.";
}

const VISUAL_SCENE_RECIPES = [
  {
    id: "editorial",
    label: "Editorial Lookbook",
    description: "Polished visual-marketing shots with clear styling, posture, and camera intention.",
    aspectRatio: "3:4",
    artDirection: "a cohesive high-end editorial lookbook, natural anatomy, visual marketing polish, an intentional wardrobe and environment",
    shots: [
      { label: "Full-Length Hero", direction: "a SINGLE full-length hero frame; the subject is standing in a poised, balanced stance, camera at a natural fashion-editorial distance" },
      { label: "Three-Quarter Detail", direction: "a SINGLE three-quarter-length frame; the subject is leaning naturally against a location-appropriate surface, not standing straight toward camera; face and styling clearly readable" },
      { label: "Seated Editorial", direction: "a SINGLE seated editorial frame; the subject is unmistakably seated on a location-appropriate bench, step, crate, or chair, with confident relaxed body language; never standing" },
      { label: "Walking Arrival", direction: "a SINGLE candid motion frame; the subject is unmistakably mid-stride and moving through the location, with natural clothing movement; never static or posed" },
      { label: "Close Character Frame", direction: "a SINGLE waist-up character frame with expressive posture and eye contact; do not repeat the full-body standing pose from the other lookbook shots" },
    ],
  },
  {
    id: "turnaround",
    label: "Character Turnaround",
    description: "Useful, identity-consistent coverage across the front, profile, and three-quarter views.",
    aspectRatio: "3:4",
    artDirection: "a clean but cinematic character-lookbook environment with consistent lighting and wardrobe across every angle",
    shots: [
      { label: "Front View", direction: "full-length front view, balanced posture, hands naturally placed, clear silhouette" },
      { label: "Three-Quarter View", direction: "full-length three-quarter view, natural shift of weight, face and silhouette both readable" },
      { label: "Rear Three-Quarter", direction: "rear three-quarter view with a subtle head turn, character silhouette and styling clearly visible" },
      { label: "Profile in Motion", direction: "side-profile frame in a natural walking or turning motion, anatomically believable" },
      { label: "Detail Portrait", direction: "medium portrait that anchors facial expression, hair, and wardrobe details" },
    ],
  },
  {
    id: "motion",
    label: "Motion & Presence",
    description: "Dynamic body language and real-world movement instead of repeated headshots.",
    aspectRatio: "16:9",
    artDirection: "a kinetic, photorealistic scene with believable motion, environmental depth, and cinematic composition",
    shots: [
      { label: "Approaching Frame", direction: "walking toward camera through the scene, natural stride, full body visible" },
      { label: "Side Motion", direction: "side-on motion frame, purposeful movement, environment streaking subtly behind the subject" },
      { label: "Over-the-Shoulder Pause", direction: "over-the-shoulder pause, subject glances back with a readable expression" },
      { label: "Action Detail", direction: "mid-action medium shot that captures a characteristic gesture or interaction" },
      { label: "After the Moment", direction: "quiet aftermath frame, subject at rest after motion, strong atmosphere and character presence" },
    ],
  },
  {
    id: "candid",
    label: "Candid Day Out",
    description: "Warm, documentary-style scenes that make the subject feel like a person in the world.",
    aspectRatio: "3:2",
    artDirection: "a natural-light documentary scene with candid human behavior, lived-in environment, and editorial realism",
    shots: [
      { label: "Arrival", direction: "arriving at the location, full or three-quarter body framing, spontaneous body language" },
      { label: "Small Interaction", direction: "a candid social or environmental interaction that reveals personality without posing for camera" },
      { label: "Quiet Moment", direction: "a quieter medium frame, the subject focused on something in the environment" },
      { label: "Walking Away", direction: "walking-away or rear three-quarter candid frame, natural clothing movement and setting detail" },
      { label: "Candid Portrait", direction: "unforced portrait caught between moments, soft expression, realistic environmental depth" },
    ],
  },
  {
    id: "cinematic",
    label: "Cinematic Evening",
    description: "A dramatic, story-led set with practical lights, atmosphere, and expressive framing.",
    aspectRatio: "16:9",
    artDirection: "a cinematic evening scene with practical lighting, rich environmental atmosphere, intentional color contrast, and grounded photorealism",
    shots: [
      { label: "Establishing Arrival", direction: "wide establishing shot that situates the subject in a vivid evening setting" },
      { label: "Mid-Scene Portrait", direction: "medium scene portrait, active environmental light, tense or reflective expression" },
      { label: "Three-Quarter Drama", direction: "three-quarter full-body dramatic frame, strong silhouette and natural pose" },
      { label: "Ambient Detail", direction: "medium detail frame with an object or setting element that supports the story" },
      { label: "Closing Image", direction: "striking final image, subject moving through the environment or pausing under cinematic light" },
    ],
  },
  {
    id: "signature",
    label: "Signature World",
    description: "Put a fictional character in the environment, action, and iconography that defines them.",
    aspectRatio: "16:9",
    artDirection: "a canon-sensitive signature-world scene, cinematic but believable, preserving defining costume, tools, setting, and emotional tone",
    shots: [
      { label: "World Arrival", direction: "wide arrival image that establishes the character in their defining environment" },
      { label: "Iconic Action", direction: "characteristic, non-violent action or interaction that reveals competence and identity" },
      { label: "Relationship to Place", direction: "three-quarter environmental portrait showing how the subject inhabits their world" },
      { label: "Quiet Icon", direction: "calmer medium shot with an iconic prop or environmental motif, authentic character behavior" },
      { label: "Final Story Beat", direction: "a memorable, emotionally resonant closing beat with cinematic visual clarity" },
    ],
  },
  {
    id: "activity",
    label: "Activity Continuity",
    description: "Follow one clear activity through visibly different, identity-consistent angles and beats.",
    aspectRatio: "16:9",
    artDirection: "a coherent photorealistic activity story with a single location, continuous wardrobe, believable body mechanics, and clean directional light",
    shots: [
      { label: "Before the Move", direction: "a focused pre-activity portrait; the subject is preparing, stretching, checking equipment, or gathering themselves, never already mid-stride" },
      { label: "Front Momentum", direction: "a full-body front three-quarter frame in unmistakable motion toward the camera, with natural limbs, clear activity mechanics, and a readable face" },
      { label: "Profile Drive", direction: "a side-profile action frame, body traveling left or right across the image, posture and weight transfer clearly believable" },
      { label: "Follow Frame", direction: "a rear three-quarter follow shot with the subject moving away through the location; styling, silhouette, and environment must remain clear" },
      { label: "Recovery Beat", direction: "a calmer post-activity frame, subject catching breath, adjusting clothing, or resting naturally in the same world; never repeat the running/action pose" },
    ],
  },
  {
    id: "campaign",
    label: "Campaign / Product Story",
    description: "A polished sequence for lifestyle marketing, a character campaign, or a story-first product shoot.",
    aspectRatio: "3:2",
    artDirection: "a high-end visual campaign with a cohesive color story, editorial polish, authentic lifestyle behavior, and the subject as the unmistakable center of attention",
    shots: [
      { label: "Key Art", direction: "a confident full or three-quarter key-art frame, clean visual hierarchy, subject and setting immediately legible" },
      { label: "In Use", direction: "a candid but intentional interaction with an object, service, garment, or environment that supports the campaign without looking like an advertisement mockup" },
      { label: "Environmental Hook", direction: "an environmental composition where the subject is smaller in frame but visually dominant through color, silhouette, and placement" },
      { label: "Human Detail", direction: "a medium detail frame centered on expression, hands, styling, or a meaningful interaction; no generic headshot" },
      { label: "Closing Poster", direction: "a final, poster-worthy image with clean negative space, powerful pose, and a satisfying story conclusion; no text or logo" },
    ],
  },
  {
    id: "duo",
    label: "Duo Chemistry",
    description: "Two adult characters sharing a scene: friendship, rivalry, teamwork, romantic tension, or a complicated history.",
    aspectRatio: "16:9",
    requiresCoStar: true,
    artDirection: "a cinematic two-person scene with distinct adult faces, natural physical spacing, readable relationship energy, and no duplicate bodies or mirrored copies",
    shots: [
      { label: "First Read", direction: "a two-shot that establishes who has the social upper hand, who is watching whom, and the emotional distance between them" },
      { label: "Shared Action", direction: "both adults engaged in a simple shared activity or problem, body language doing as much work as dialogue would" },
      { label: "Side by Side", direction: "a composed side-by-side frame with contrasting posture, styling, or expression that makes their relationship legible" },
      { label: "Private Reaction", direction: "a closer emotional frame with one person in focus and the other still visibly present, capturing an unspoken reaction" },
      { label: "Relationship Beat", direction: "a closing image that lands the relationship: alliance, tension, affection, rivalry, or unfinished business" },
    ],
  },
  {
    id: "after-dark",
    label: "After Dark Editorial",
    description: "Adult nightlife, glamour, and private atmosphere without losing character or agency.",
    aspectRatio: "16:9",
    artDirection: "an adult after-hours editorial with cinematic nightlife, confident styling, mature atmosphere, a clear sense of agency, and non-explicit sensuality",
    shots: [
      { label: "Night Arrival", direction: "a dramatic full-body arrival beneath practical night lighting, confident styling, and a destination that feels intentional" },
      { label: "Room Read", direction: "a three-quarter interior frame with a poised, self-directed posture and visual clues about the private atmosphere" },
      { label: "Close Tension", direction: "a close cinematic character frame with a charged but non-explicit expression, accurate personality, and rich practical light" },
      { label: "Reflective Pause", direction: "a quieter seated or leaning moment that lets mood, wardrobe texture, and inner life carry the image" },
      { label: "Last Call", direction: "a striking final image as the character leaves, turns back, or takes possession of the space; glamorous, adult, and non-explicit" },
    ],
  },
];

function buildVisualScenePrompt(identityAnchor, recipe, shot, visualContext, wardrobeDirection = "", frameIndex = 0) {
  const { brief = "", counterpart = "", relationship = "", situation = "", voltage = "Grounded", counterpartCoverage = "all" } = visualContext || {};
  const sharedFrame = Boolean(counterpart.trim()) && (counterpartCoverage === "all" || frameIndex === 0);
  const contract = buildVisualContract({
    subjectName: visualContext?.subjectName || "the primary subject",
    counterpart,
    relationship,
    situation: situation.trim() || brief.trim(),
    voltage,
    wardrobe: wardrobeDirection,
    shot,
    sharedFrame,
  });
  const optionalBrief = brief.trim()
    ? `Director's brief: ${brief.trim()}.`
    : "Director's brief: make choices that feel natural and true to the subject's established personality and world.";
  const matureConstraint = recipe.id === "after-dark"
    ? " All depicted people are adults. Keep the atmosphere mature, consensual, character-forward, and visibly agentic; never use nudity, coercion, or underage coding."
    : "";
  const contractClosing = contract.hasCounterpart
    ? `FINAL CAST CHECK: ${visualContext.subjectName} and ${contract.counterpart} are both required adult people in this single frame. If either is missing, the image is wrong.`
    : `FINAL SUBJECT CHECK: ${visualContext.subjectName} is the required primary subject. Do not substitute a generic lookalike or duplicate them.`;

  return `${contract.text}\n\n${identityAnchor}\n\nVISUAL SCENE STUDIO — ${recipe.label}. Create ONE standalone image, never a collage, contact sheet, triptych, split screen, mirror, or duplicated subject. ${recipe.artDirection}. ${optionalBrief} ${matureConstraint} Keep every required person recognizably consistent with their stated identity and relationship. Natural anatomy, clear hands, believable proportions, grounded lighting, and one clear visual focal point. No visible text, captions, watermarks, UI, border, or multiple camera angles in one frame.\n\n${contractClosing}`;
}

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

  // Investigative Console uses a deliberately independent model choice so a question never changes the next dossier's defaults.
  const [investigatorProvider, setInvestigatorProvider] = useState(DEFAULT_PROVIDER);
  const [investigatorModel, setInvestigatorModel] = useState(DEFAULT_MODEL);
  const [investigatorQuestion, setInvestigatorQuestion] = useState("");
  const [investigatorWeb, setInvestigatorWeb] = useState(true);
  const [investigatorResult, setInvestigatorResult] = useState(null);
  const [investigatorLoading, setInvestigatorLoading] = useState(false);
  const [investigatorError, setInvestigatorError] = useState(null);

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
  const [imageSearchEnabled, setImageSearchEnabled] = useState(false); // web search for prompt gen
  // The Visual Scene Studio is intentionally independent from Portrait: a lookbook may use a different backend/model without changing the portrait choice.
  const [visualImageSource, setVisualImageSource] = useState("venice");
  const [visualImageModel, setVisualImageModel] = useState("nano-banana-pro");
  const [visualRecipeId, setVisualRecipeId] = useState("editorial");
  const [visualBrief, setVisualBrief] = useState("");
  const [visualCoStar, setVisualCoStar] = useState("");
  const [visualRelationship, setVisualRelationship] = useState("Colleagues with history");
  const [visualSituation, setVisualSituation] = useState("");
  const [visualVoltage, setVisualVoltage] = useState("grounded");
  const [visualCounterpartCoverage, setVisualCounterpartCoverage] = useState("all");
  // A set never begins from a hidden recipe slice: the user explicitly chooses count, coverage, wardrobe logic, and required cast first.
  const [visualBatchSize, setVisualBatchSize] = useState(3);
  const [visualSelectedShotIndices, setVisualSelectedShotIndices] = useState([0, 1, 2]);
  const [visualWardrobeSystem, setVisualWardrobeSystem] = useState("continuity");
  const [visualWardrobeBrief, setVisualWardrobeBrief] = useState("");
  const [visualSet, setVisualSet] = useState([]);
  const [visualSetError, setVisualSetError] = useState(null);
  const [deepSearchResult, setDeepSearchResult] = useState(null);

  // Scene Lab is deliberately shared by Raven and Starling. Starling scenes are visibly framed as imaginative.
  const [addendumMode, setAddendumMode] = useState("scene");
  const [sceneConfig, setSceneConfig] = useState({
    lens: "observation",
    counterpart: "",
    relationship: "Colleagues with history",
    customRelationship: "",
    setting: "",
    subjectWant: "",
    counterpartWant: "",
    voltage: "grounded",
    pressure: "",
    outcome: "",
    note: "",
  });
  const setSceneField = (field, value) => setSceneConfig(current => ({ ...current, [field]: value }));

  // Lightbox (Part B) — shared by portrait + role-play chat images
  const [lightboxSrc, setLightboxSrc] = useState(null);

  // Role-play (Part C) — session-only, cleared on reload + new search
  const [rpProvider, setRpProvider] = useState(ROLEPLAY_DEFAULT_PROVIDER);
  const [rpModel, setRpModel] = useState(ROLEPLAY_DEFAULT_MODEL);
  const [rpScenarioId, setRpScenarioId] = useState("open-room");
  const [rpScenarioBrief, setRpScenarioBrief] = useState("");
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
  const selectedImageModel = IMAGE_MODELS.find(item => item.id === imageModel) || IMAGE_MODELS[0];
  const selectedVisualImageModel = IMAGE_MODELS.find(item => item.id === visualImageModel) || IMAGE_MODELS[0];
  const availableVisualRecipes = VISUAL_SCENE_RECIPES;
  const selectedVisualRecipe = availableVisualRecipes.find(item => item.id === visualRecipeId) || availableVisualRecipes[0];
  const selectedVisualShots = visualSelectedShotIndices
    .map(index => selectedVisualRecipe.shots[index])
    .filter(Boolean);
  const selectedWardrobeSystem = WARDROBE_SYSTEMS.find(system => system.id === visualWardrobeSystem) || WARDROBE_SYSTEMS[0];
  const visualPlanReady = selectedVisualShots.length === Number(visualBatchSize) &&
    (visualWardrobeSystem !== "custom" || Boolean(visualWardrobeBrief.trim()));
  const availableRolePlayScenarios = ROLEPLAY_SCENARIOS;
  const selectedRolePlayScenario = availableRolePlayScenarios.find(scenario => scenario.id === rpScenarioId) || availableRolePlayScenarios[0];

  // ─── INVESTIGATIVE CONSOLE ───
  const runInvestigation = async () => {
    const question = investigatorQuestion.trim();
    if (!question || investigatorLoading) return;
    setInvestigatorLoading(true);
    setInvestigatorError(null);
    setInvestigatorResult(null);

    const systemPrompt = `You are Hulukipedia's direct investigative console. Answer the user's question as a concise but substantive intelligence note. Distinguish documented fact from inference, name uncertainty where it matters, and do not pretend that a question needs a full dossier. Use clear Markdown headings only when they improve readability. When web grounding is available, cite concrete sources or describe source limitations honestly.`;
    const userPrompt = `Investigative question:\n${question}`;

    try {
      if (investigatorWeb && investigatorProvider === "perplexity") {
        const result = await callDeepSearch(question, systemPrompt);
        setInvestigatorResult({ text: result.text, citations: result.citations || [], provider: investigatorProvider, model: investigatorModel, web: true });
      } else {
        const searchCapable = ["anthropic", "venice", "xai"].includes(investigatorProvider);
        const text = investigatorWeb && searchCapable
          ? await callAIWithSearch(systemPrompt, userPrompt, investigatorProvider, investigatorModel)
          : await callAI(systemPrompt, userPrompt, investigatorProvider, investigatorModel, 2500);
        setInvestigatorResult({ text, citations: [], provider: investigatorProvider, model: investigatorModel, web: investigatorWeb && searchCapable });
      }
    } catch (error) {
      setInvestigatorError(error.message || "The investigation could not be completed.");
    } finally {
      setInvestigatorLoading(false);
    }
  };

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
    setImageUrl(null); setImageError(null); setVisualSet([]); setVisualSetError(null); setVisualImageSource("venice"); setVisualImageModel("nano-banana-pro"); setVisualBrief(""); setVisualCoStar(""); setVisualRelationship("Colleagues with history"); setVisualSituation(""); setVisualVoltage("grounded"); setVisualCounterpartCoverage("all"); setVisualRecipeId("editorial"); setVisualBatchSize(3); setVisualSelectedShotIndices([0, 1, 2]); setVisualWardrobeSystem("continuity"); setVisualWardrobeBrief(""); setDeepSearchResult(null);
    setAddendumMode("scene"); setSceneConfig({ lens: "observation", counterpart: "", relationship: "Colleagues with history", customRelationship: "", setting: "", subjectWant: "", counterpartWant: "", voltage: "grounded", pressure: "", outcome: "", note: "" });
    // Clear role-play session and creative framing on every new dossier (session-only memory)
    setRpMessages([]); setRpInput(""); setRpError(null); setRpScenarioId("open-room"); setRpScenarioBrief("");
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

      // Scene Lab is a shared imaginative layer. It replaces sterile addendum prose with a declared cast,
      // relationship, setting, voltage, wants, pressure point, and outcome in either dossier mode.
      if (addendumMode === "scene" && (promptKey === "addendum1" || promptKey === "addendum2")) {
        pObj = buildSceneLabPrompt(
          sceneConfig,
          subject.name,
          mode,
          promptKey === "addendum1" ? "observation" : "encounter"
        );
      }
      
      const text = await callAI(pObj.system, pObj.user, getSP(key), getSM(key));
      // Store raw markdown — MarkdownContent component handles rendering
      setter(text);
    } catch (e) {
      setter(`**Error:** ${e.message}`);
    }
    setL(key, false);
  };

  const getIdentityAnchor = async () => {
    const p = getPrompts(subject.name, subject.details, mode);
    return imageSearchEnabled
      ? await callAIWithSearch(p.imagePrompt.system, p.imagePrompt.user, globalProvider, globalModel)
      : await callAI(p.imagePrompt.system, p.imagePrompt.user, globalProvider, globalModel);
  };

  const makePollinationsUrl = (prompt, aspectRatio) => {
    const dimensions = ASPECT_DIMENSIONS[aspectRatio] || ASPECT_DIMENSIONS["1:1"];
    const seed = Math.floor(Math.random() * 999999);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&nologo=true&width=${dimensions.width}&height=${dimensions.height}`;
  };

  const generateImage = async () => {
    setL("image", true);
    setImageUrl(null);
    setImageError(null);
    try {
      const prompt = await getIdentityAnchor();
      if (imageSource === "venice") {
        const dataUrl = await callImageGen(prompt, "", imageModel);
        setImageUrl(dataUrl);
      } else {
        setImageUrl(makePollinationsUrl(prompt, "1:1"));
      }
    } catch (e) {
      setImageUrl(null);
      setImageError(describeImageError(e, imageModel));
    }
    setL("image", false);
  };

  function describeImageError(error, attemptedModel) {
    const raw = error?.message || String(error || "Image generation failed.");
    if (/venice image error:\s*403|\b403\b/i.test(raw)) {
      const modelName = IMAGE_MODELS.find(item => item.id === attemptedModel)?.name || attemptedModel;
      return `${modelName} is listed by Venice but is not currently enabled for the Team Tomorrow Venice account. Try Nano Banana Pro, Nano Banana 2, Qwen Image 3, or Qwen Image 3 Pro.`;
    }
    return raw;
  }

  const chooseVisualRecipe = (recipeId) => {
    const recipe = availableVisualRecipes.find(item => item.id === recipeId) || availableVisualRecipes[0];
    setVisualRecipeId(recipe.id);
    // Loading a recipe proposes its own first frames; the user can still remove, add, or reorder coverage before launch.
    setVisualSelectedShotIndices(recipe.shots.slice(0, Number(visualBatchSize)).map((_, index) => index));
  };

  const chooseVisualPlanSize = (size) => {
    const nextSize = Number(size);
    setVisualBatchSize(nextSize);
    setVisualSelectedShotIndices(current => current.slice(0, nextSize));
  };

  const toggleVisualShot = (index) => {
    setVisualSelectedShotIndices(current => {
      if (current.includes(index)) return current.filter(item => item !== index);
      if (current.length >= Number(visualBatchSize)) return current;
      return [...current, index].sort((a, b) => a - b);
    });
  };

  const generateVisualSet = async () => {
    if (loading.visualSet) return;
    if (!visualPlanReady) {
      const wardrobeMissing = visualWardrobeSystem === "custom" && !visualWardrobeBrief.trim();
      setVisualSetError(wardrobeMissing
        ? "Add your custom wardrobe direction before launching this planned set."
        : `Select exactly ${visualBatchSize} planned angle${visualBatchSize === 1 ? "" : "s"} before generation.`);
      return;
    }
    setL("visualSet", true);
    setVisualSetError(null);
    const recipe = selectedVisualRecipe;
    const shots = selectedVisualShots;
    const dimensions = ASPECT_DIMENSIONS[recipe.aspectRatio] || ASPECT_DIMENSIONS["1:1"];
    const selectedVoltage = SCENE_VOLTAGES.find(item => item.id === visualVoltage) || SCENE_VOLTAGES[0];
    const visualContext = {
      subjectName: subject.name,
      brief: visualBrief,
      counterpart: visualCoStar,
      relationship: visualRelationship,
      situation: visualSituation,
      voltage: selectedVoltage.label,
      counterpartCoverage: visualCounterpartCoverage,
    };
    const pendingSet = shots.map((shot, index) => {
      const wardrobeDirection = getWardrobeDirection(visualWardrobeSystem, visualWardrobeBrief, index, shots.length);
      const sharedFrame = Boolean(visualCoStar.trim()) && (visualCounterpartCoverage === "all" || index === 0);
      return {
        id: `${Date.now()}-${index}`,
        label: shot.label,
        direction: shot.direction,
        wardrobeDirection,
        recipeId: recipe.id,
        aspectRatio: recipe.aspectRatio,
        width: dimensions.width,
        height: dimensions.height,
        model: visualImageModel,
        source: visualImageSource,
        resolution: "2K",
        prompt: null,
        contract: buildVisualContract({ subjectName: subject.name, counterpart: visualCoStar, relationship: visualRelationship, situation: visualSituation.trim() || visualBrief.trim(), voltage: selectedVoltage.label, wardrobe: wardrobeDirection, shot, sharedFrame }),
        validation: null,
        rerollCount: 0,
        status: "queued",
        image: null,
        error: null,
      };
    });
    setVisualSet(pendingSet);

    try {
      const identityAnchor = await getIdentityAnchor();
      for (let index = 0; index < shots.length; index += 1) {
        const shot = shots[index];
        const wardrobeDirection = getWardrobeDirection(visualWardrobeSystem, visualWardrobeBrief, index, shots.length);
        const prompt = buildVisualScenePrompt(identityAnchor, recipe, shot, visualContext, wardrobeDirection, index);
        setVisualSet(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, status: "generating", prompt } : item));
        try {
          const image = visualImageSource === "venice"
            ? await callImageGen(prompt, "", visualImageModel, recipe.aspectRatio, "2K", dimensions.width, dimensions.height)
            : makePollinationsUrl(prompt, recipe.aspectRatio);
          const queuedFrame = pendingSet[index];
          const validation = image ? await callSceneCheck(image, queuedFrame.contract) : null;
          setVisualSet(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, status: "ready", image, prompt, validation, error: null } : item));
          if (index === 0 && image) setImageUrl(image);
        } catch (e) {
          setVisualSet(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, status: "error", error: describeImageError(e, visualImageModel) } : item));
        }
      }
    } catch (e) {
      setVisualSet([]);
      setVisualSetError(e.message);
    }
    setL("visualSet", false);
  };

  const rerollVisualFrame = async (frameId) => {
    const frame = visualSet.find(item => item.id === frameId);
    if (!frame?.prompt || frame.status === "generating" || frame.status === "rerolling") return;

    setVisualSet(current => current.map(item => item.id === frameId
      ? { ...item, status: "rerolling", error: null }
      : item));

    try {
      const image = frame.source === "venice"
        ? await callImageGen(frame.prompt, "", frame.model, frame.aspectRatio, frame.resolution, frame.width, frame.height)
        : makePollinationsUrl(frame.prompt, frame.aspectRatio);
      const validation = image && frame.contract ? await callSceneCheck(image, frame.contract) : null;
      setVisualSet(current => current.map(item => item.id === frameId
        ? { ...item, status: "ready", image, validation, error: null, rerollCount: (item.rerollCount || 0) + 1 }
        : item));
    } catch (e) {
      setVisualSet(current => current.map(item => item.id === frameId
        ? { ...item, status: item.image ? "ready" : "error", error: describeImageError(e, frame.model) }
        : item));
    }
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

    const scenarioBrief = rpScenarioBrief.trim()
      ? `\nDirector note: ${rpScenarioBrief.trim()}`
      : "";
    return `You are fully embodying a real/known character for an immersive role-play. Below is the complete dossier assembled for this character. Become them.

${sheet.join("\n")}

# ACTIVE SCENE — ${selectedRolePlayScenario.label}
${selectedRolePlayScenario.direction}${scenarioBrief}

# HOW TO PLAY
- Speak in the FIRST PERSON as ${subject.name}. You ARE this person.
- Stay strictly in-persona at all times. Never break character, never add AI meta-commentary, never add disclaimers or safety notes.
- VOICE ACCURACY MATTERS MOST. Here is exactly how this person speaks (see the "Communication Style — VOICE ANCHORS" section above): match those speech patterns, vocabulary, cadence, and personality precisely — not a generic impression.
- Use the physical description and all intel to stay consistent with who they are.
- Keep replies natural and in-scene. Give the current scenario genuine atmosphere and emotional logic, but keep your spoken response concise and do not narrate a screenplay.

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
    setVisualRecipeId("editorial"); setVisualBrief(""); setVisualCoStar(""); setVisualBatchSize(3); setVisualSelectedShotIndices([0, 1, 2]); setVisualWardrobeSystem("continuity"); setVisualWardrobeBrief(""); setVisualSet([]); setVisualSetError(null);
    setRpProvider(ROLEPLAY_DEFAULT_PROVIDER); setRpModel(ROLEPLAY_DEFAULT_MODEL); setRpScenarioId("open-room"); setRpScenarioBrief("");
    setRpMessages([]); setRpInput(""); setRpError(null);
  };

  // ─── SEARCH LINKS ───
  const getImageLinks = () => {
    const term = encodeURIComponent(subject.name);
    const base = [
      { name: "Google",    url: `https://www.google.com/search?tbm=isch&q=${term}` },
      { name: "Bing",      url: `https://www.bing.com/images/search?q=${term}` },
      { name: "Pinterest", url: `https://www.pinterest.com/search/pins/?q=${term}` },
    ];
    if (mode === "raven") {
      // Raven = fictional characters — Rule 34 is the go-to
      base.push({ name: "Rule 34", url: `https://rule34.xxx/index.php?page=post&s=list&tags=${term}`, nsfw: true });
    } else {
      // Starling = real people — CelebJihad covers leaked/candid content
      base.push({ name: "Celeb Jihad", url: `https://celebjihad.com/?s=${term}`, nsfw: true });
    }
    return base;
  };

  // ─── BUTTON COMPONENT ───
  const GenBtn = ({ onClick, loading: isLoading, disabled = false, children, className = "", style = {} }) => (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`flex items-center justify-center font-bold py-2 px-4 rounded-md transition-all text-sm ${className}`}
      style={{ opacity: isLoading || disabled ? 0.55 : 1, ...style }}
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
    backgroundImage: "radial-gradient(circle at 50% -18%, rgba(22,114,71,0.24), transparent 42%), radial-gradient(circle at 0% 48%, rgba(212,175,55,0.06), transparent 35%)",
    color: t.textPrimary,
    minHeight: "100vh",
    fontFamily: "'Cinzel', 'Georgia', serif",
    transition: "background-color 0.4s, background-image 0.4s",
  };

  const cardStyle = {
    backgroundColor: t.bgContainer,
    backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.025), transparent 38%)",
    border: `1px solid ${t.border}`,
    borderTop: `1px solid ${t.accentGold}80`,
    borderRadius: "0.5rem",
    backdropFilter: "blur(8px)",
    boxShadow: "0 20px 55px rgba(0,0,0,0.34), inset 0 1px 0 rgba(245,238,213,0.035)",
  };

  const sectionStyle = {
    backgroundColor: t.bgSection,
    border: `1px solid ${t.border}`,
    borderRadius: "0.375rem",
    padding: "1rem",
    boxShadow: "inset 0 1px 0 rgba(245,238,213,0.025)",
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
        ::selection { background: rgba(184,134,11,0.32); color: #302415; }
        select option { background: #fffdf7; color: #302415; }
      `}</style>

      <div className="max-w-5xl mx-auto p-4" style={{ position: "relative", zIndex: 10 }}>
        {/* ═══ HEADER ═══ */}
        <header className="text-center mb-8 pt-6">
          <h1
            style={{
              fontFamily: "'Satisfy', cursive",
              fontSize: "3.5rem",
              color: t.accentGold,
              textShadow: "0 0 30px rgba(212,175,55,0.18)",
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
          <>
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
                style={{ backgroundColor: "#9c6f06", color: "#fffdf7", border: "1px solid #7a5600" }}
              >
                {searchLoading === "raven" ? <Spinner size={20} /> : <><Feather size={18} className="mr-2" /> Raven Search (Fictional)</>}
              </button>
              <button
                onClick={() => handleSearch("starling")}
                disabled={!!searchLoading}
                className="flex items-center justify-center font-bold py-3 px-6 rounded-md transition-all shadow-lg"
                style={{ backgroundColor: "#c79827", color: "#3a2807", border: "1px solid #a97b13" }}
              >
                {searchLoading === "starling" ? <Spinner size={20} /> : <><Star size={18} className="mr-2" /> Starling Search (Real)</>}
              </button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mt-5 p-6 shadow-md" style={{ ...cardStyle, background: `linear-gradient(135deg, ${t.bgContainer}, ${t.bgSection})` }}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <SearchCode size={18} style={{ color: t.accentGold }} />
                  <h2 className="font-bold" style={{ color: t.accentGold, letterSpacing: "0.08em" }}>ASK THE ARCHIVE</h2>
                </div>
                <p className="text-xs mt-1" style={{ color: t.textSecondary }}>A direct investigative lane for questions, leads, comparisons, and creative research—no dossier required.</p>
              </div>
              <ProviderSelector
                provider={investigatorProvider}
                model={investigatorModel}
                onProviderChange={(provider) => { setInvestigatorProvider(provider); setInvestigatorModel(PROVIDERS[provider].models[0].id); }}
                onModelChange={setInvestigatorModel}
                theme={theme}
              />
            </div>

            <textarea
              value={investigatorQuestion}
              onChange={event => setInvestigatorQuestion(event.target.value)}
              rows={4}
              placeholder="Ask anything worth investigating: a person, a claim, a story problem, a comparison, a rumor, an idea..."
              className="w-full rounded-md px-4 py-3 transition-all outline-none resize-none"
              style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary }}
              onFocus={event => event.target.style.boxShadow = `0 0 0 2px ${t.accentGold}`}
              onBlur={event => event.target.style.boxShadow = "none"}
              onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); runInvestigation(); } }}
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInvestigatorWeb(value => !value)}
                className="text-xs font-bold px-3 py-2 rounded-md transition-all"
                style={{ backgroundColor: investigatorWeb ? t.highlight : t.bgMain, border: `1px solid ${investigatorWeb ? t.accentGold : t.border}`, color: investigatorWeb ? t.accentHover : t.textSecondary }}
              >
                <Globe size={13} className="inline mr-1" /> Web-grounded {investigatorWeb ? "ON" : "OFF"}
              </button>
              <button
                type="button"
                onClick={runInvestigation}
                disabled={!investigatorQuestion.trim() || investigatorLoading}
                className="flex items-center justify-center font-bold py-2.5 px-5 rounded-md transition-all shadow-lg disabled:opacity-50"
                style={{ backgroundColor: t.accentGold, color: "#161309", border: `1px solid ${t.accentHover}` }}
              >
                {investigatorLoading ? <Spinner size={18} /> : <><Search size={17} className="mr-2" /> Investigate</>}
              </button>
            </div>
            <p className="text-[11px] mt-2" style={{ color: t.textSecondary }}>Tip: ⌘/Ctrl + Enter runs the question. Perplexity uses the dedicated research route; other providers use their own analysis or search capability when selected.</p>

            {investigatorError && (
              <div className="mt-4 p-3 rounded-md text-sm" style={{ backgroundColor: "rgba(180,45,45,0.14)", border: "1px solid rgba(225,93,93,0.5)", color: "#ffc0c0" }}>
                {investigatorError}
              </div>
            )}

            {investigatorResult && (
              <div className="mt-5 p-4 rounded-md" style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}` }}>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3" style={{ borderBottom: `1px solid ${t.border}` }}>
                  <div>
                    <div className="text-xs font-bold" style={{ color: t.accentGold, letterSpacing: "0.08em" }}>INVESTIGATIVE NOTE</div>
                    <div className="text-[11px] mt-1" style={{ color: t.textSecondary }}>{PROVIDERS[investigatorResult.provider]?.name || investigatorResult.provider} · {PROVIDERS[investigatorResult.provider]?.models.find(item => item.id === investigatorResult.model)?.name || investigatorResult.model}{investigatorResult.web ? " · web-grounded" : ""}</div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => navigator.clipboard?.writeText(investigatorResult.text)} className="text-xs px-2 py-1 rounded" style={{ border: `1px solid ${t.border}`, color: t.textSecondary }}><Copy size={12} className="inline mr-1" />Copy</button>
                    <button type="button" onClick={() => { setInvestigatorResult(null); setInvestigatorError(null); }} className="text-xs px-2 py-1 rounded" style={{ border: `1px solid ${t.border}`, color: t.textSecondary }}><X size={12} className="inline mr-1" />Clear</button>
                  </div>
                </div>
                <div className="md-content"><MarkdownContent text={investigatorResult.text} theme={theme} /></div>
                {investigatorResult.citations?.length > 0 && (
                  <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
                    <div className="text-[11px] font-bold mb-2" style={{ color: t.textSecondary, letterSpacing: "0.06em" }}>SOURCES RETURNED</div>
                    <div className="flex flex-wrap gap-2">
                      {investigatorResult.citations.slice(0, 10).map((citation, index) => {
                        const href = typeof citation === "string" ? citation : citation.url || citation.uri || citation.sourceUrl;
                        const label = typeof citation === "string" ? citation : citation.title || citation.url || citation.uri || `Source ${index + 1}`;
                        return href ? <a key={`${href}-${index}`} href={href} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded max-w-56 truncate" style={{ color: t.accentHover, border: `1px solid ${t.border}` }}>{label}</a> : <span key={index} className="text-xs px-2 py-1 rounded" style={{ color: t.textSecondary, border: `1px solid ${t.border}` }}>{label}</span>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          </>
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
                        {[...new Set(IMAGE_MODELS.map(m => m.group))].map(group => (
                          <optgroup key={group} label={group}>
                            {IMAGE_MODELS.filter(m => m.group === group).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div className="text-[10px] leading-snug" style={{ color: t.textSecondary }}>
                      {selectedImageModel.note}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setImageSource("venice")}
                        className="flex-1 text-xs py-1 rounded font-bold"
                        style={{ backgroundColor: imageSource === "venice" ? t.accentGold : t.bgMain, color: imageSource === "venice" ? "#fffdf7" : t.textSecondary, border: `1px solid ${t.border}` }}
                      >
                        Venice AI
                      </button>
                      <button
                        onClick={() => setImageSource("pollinations")}
                        className="flex-1 text-xs py-1 rounded font-bold"
                        style={{ backgroundColor: imageSource === "pollinations" ? t.highlight : t.bgMain, color: imageSource === "pollinations" ? t.accentHover : t.textSecondary, border: `1px solid ${t.border}` }}
                      >
                        Pollinations
                      </button>
                    </div>
                    <button
                      onClick={() => setImageSearchEnabled(!imageSearchEnabled)}
                      className="w-full text-xs py-1 rounded font-bold flex items-center justify-center gap-1"
                      style={{ backgroundColor: imageSearchEnabled ? t.highlight : t.bgMain, color: imageSearchEnabled ? t.accentHover : t.textSecondary, border: `1px solid ${t.border}` }}
                      title="When enabled, the AI will search the web for what this person/character looks like before generating the image prompt"
                    >
                      <Globe size={12} /> Web Search {imageSearchEnabled ? "ON" : "OFF"}
                    </button>
                    <GenBtn onClick={generateImage} loading={loading.image} style={{ backgroundColor: t.accentGold, color: "#111" }}>
                      <Sparkles size={14} className="mr-1" /> Generate Portrait
                    </GenBtn>
                    <div className="flex gap-1 flex-wrap">
                      {getImageLinks().map(link => (
                        <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center py-1.5 px-2 rounded text-xs font-bold transition-all"
                          style={link.nsfw
                            ? { backgroundColor: "#dc2626", color: "white", border: "1px solid #991b1b" }
                            : { backgroundColor: t.accentGold, color: "#111" }}
                        >
                          {link.nsfw ? "🔞 " : ""}{link.name}
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
                    <GenBtn onClick={enhanceIntel} loading={loading.enhance} style={{ backgroundColor: "#167247", color: "#fff8df", flex: 1 }}>
                      <SearchCode size={14} className="mr-1" /> Enhance (Web)
                    </GenBtn>
                    <GenBtn onClick={deepSearchIntel} loading={loading.deepSearch} style={{ backgroundColor: "#8a6a18", color: "#fff8df", flex: 1 }}>
                      <Globe size={14} className="mr-1" /> Deep Search (Perplexity)
                    </GenBtn>
                  </div>
                  {/* Deep Search Results */}
                  {deepSearchResult && (
                    <div className="mt-3 p-3 rounded-md" style={{ backgroundColor: t.bgMain, border: "1px solid #167247" }}>
                      <div className="text-xs font-bold uppercase mb-1" style={{ color: "#8fbd74" }}>
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
                              className="block text-xs truncate hover:underline" style={{ color: "#8fbd74" }}>
                              [{i + 1}] {c}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Visual Scene Studio ── */}
              <div style={{ ...sectionStyle, borderColor: t.accentGold }}>
                <div style={{ ...sectionTitleStyle, color: t.accentGold }}>
                  <Sparkles size={16} /> Visual Scene Studio
                  <span className="ml-auto text-[10px] normal-case tracking-normal font-normal" style={{ color: t.textSecondary }}>
                    Direct a set, not another headshot.
                  </span>
                </div>
                <p className="text-xs mb-3" style={{ color: t.textSecondary }}>
                  Generate independent images with a shared subject anchor and different poses, angles, or moments. Each result opens separately in the lightbox.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: t.textSecondary }}>SCENE RECIPE</label>
                    <select
                      value={visualRecipeId}
                      onChange={e => chooseVisualRecipe(e.target.value)}
                      className="w-full rounded text-sm px-2 py-2"
                      style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary }}
                    >
                      {availableVisualRecipes.map(recipe => <option key={recipe.id} value={recipe.id}>{recipe.label}</option>)}
                    </select>
                    <div className="text-[10px] mt-1 leading-snug" style={{ color: t.textSecondary }}>{selectedVisualRecipe.description}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: t.textSecondary }}>PLANNED FRAME COUNT</label>
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5].map(size => (
                        <button
                          key={size}
                          onClick={() => chooseVisualPlanSize(size)}
                          className="rounded py-2 text-xs font-bold"
                          style={{ backgroundColor: visualBatchSize === size ? t.accentGold : t.bgMain, color: visualBatchSize === size ? "#fffdf7" : t.textSecondary, border: `1px solid ${t.border}` }}
                          title={`Plan exactly ${size} frame${size === 1 ? "" : "s"}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <div className="text-[10px] mt-1 leading-snug" style={{ color: t.textSecondary }}>
                      Select how many images you want before choosing the exact coverage below.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: t.textSecondary }}>IMAGE SOURCE</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setVisualImageSource("venice")}
                        className="flex-1 text-xs py-2 rounded font-bold"
                        style={{ backgroundColor: visualImageSource === "venice" ? t.accentGold : t.bgMain, color: visualImageSource === "venice" ? "#fffdf7" : t.textSecondary, border: `1px solid ${t.border}` }}
                      >
                        Venice AI
                      </button>
                      <button
                        onClick={() => setVisualImageSource("pollinations")}
                        className="flex-1 text-xs py-2 rounded font-bold"
                        style={{ backgroundColor: visualImageSource === "pollinations" ? t.highlight : t.bgMain, color: visualImageSource === "pollinations" ? t.accentHover : t.textSecondary, border: `1px solid ${t.border}` }}
                      >
                        Pollinations
                      </button>
                    </div>
                    <div className="text-[10px] mt-1 leading-snug" style={{ color: t.textSecondary }}>Set-level choice; every frame keeps the source it was made with.</div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: t.textSecondary }}>IMAGE GENERATOR</label>
                    {visualImageSource === "venice" ? (
                      <>
                        <select
                          value={visualImageModel}
                          onChange={e => setVisualImageModel(e.target.value)}
                          className="w-full rounded text-sm px-2 py-2"
                          style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary }}
                        >
                          {[...new Set(IMAGE_MODELS.map(m => m.group))].map(group => (
                            <optgroup key={group} label={group}>
                              {IMAGE_MODELS.filter(m => m.group === group).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </optgroup>
                          ))}
                        </select>
                        <div className="text-[10px] mt-1 leading-snug" style={{ color: t.textSecondary }}>{selectedVisualImageModel.note}</div>
                      </>
                    ) : (
                      <div className="rounded px-2 py-2 text-[10px] leading-snug" style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textSecondary }}>
                        Pollinations derives each frame from its scene prompt. Switch to Venice AI to choose a specific image model.
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold mb-1" style={{ color: t.textSecondary }}>DIRECTOR'S BRIEF <span className="font-normal">(optional)</span></label>
                    <textarea
                      value={visualBrief}
                      onChange={e => setVisualBrief(e.target.value)}
                      placeholder="e.g., beach boardwalk at sunset, relaxed summer wardrobe, self-possessed mood, candid visual-marketing feel"
                      rows={3}
                      className="w-full rounded text-sm p-2"
                      style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary, resize: "vertical" }}
                    />
                  </div>
                </div>

                <div className="mt-3 rounded-md p-3 space-y-3" style={{ backgroundColor: t.bgContainer, border: `1px solid ${t.border}` }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest" style={{ color: t.accentGold }}>01 · Choose exact angles & positions</div>
                      <div className="text-[10px] mt-1" style={{ color: t.textSecondary }}>Choose {visualBatchSize} frame{visualBatchSize === 1 ? "" : "s"}. The set cannot launch until the plan is complete.</div>
                    </div>
                    <span className="text-xs font-bold rounded px-2 py-1" style={{ backgroundColor: visualPlanReady ? t.highlight : t.bgMain, color: visualPlanReady ? t.accentGold : t.textSecondary, border: `1px solid ${t.border}` }}>
                      {selectedVisualShots.length} / {visualBatchSize} planned
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {selectedVisualRecipe.shots.map((shot, index) => {
                      const selected = visualSelectedShotIndices.includes(index);
                      const locked = !selected && visualSelectedShotIndices.length >= Number(visualBatchSize);
                      return (
                        <button
                          key={shot.label}
                          onClick={() => toggleVisualShot(index)}
                          disabled={locked}
                          className="text-left rounded px-3 py-2 transition-all disabled:opacity-40"
                          style={{ backgroundColor: selected ? t.highlight : t.bgMain, border: `1px solid ${selected ? t.accentGold : t.border}`, color: t.textPrimary }}
                        >
                          <div className="flex items-center gap-2"><span className="text-xs font-bold" style={{ color: selected ? t.accentGold : t.textSecondary }}>{selected ? "✓" : String(index + 1).padStart(2, "0")}</span><span className="text-xs font-bold">{shot.label}</span></div>
                          <div className="text-[10px] mt-1 leading-snug" style={{ color: t.textSecondary }}>{shot.direction}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 rounded-md p-3" style={{ backgroundColor: t.bgContainer, border: `1px solid ${t.border}` }}>
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: t.accentGold }}>02 · Outfit system</label>
                    <select
                      value={visualWardrobeSystem}
                      onChange={e => setVisualWardrobeSystem(e.target.value)}
                      className="w-full rounded text-sm px-2 py-2"
                      style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary }}
                    >
                      {WARDROBE_SYSTEMS.map(system => <option key={system.id} value={system.id}>{system.label}</option>)}
                    </select>
                    <div className="text-[10px] mt-1 leading-snug" style={{ color: t.textSecondary }}>{selectedWardrobeSystem.note}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: t.accentGold }}>03 · Planned output</label>
                    {selectedVisualShots.length > 0 ? (
                      <div className="space-y-1 rounded px-2 py-2 text-[10px]" style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textSecondary }}>
                        {selectedVisualShots.map((shot, index) => <div key={shot.label}><span style={{ color: t.accentGold }}>{String(index + 1).padStart(2, "0")}</span> · {shot.label} · {getWardrobeDirection(visualWardrobeSystem, visualWardrobeBrief, index, selectedVisualShots.length).replace("Wardrobe plan: ", "")}</div>)}
                      </div>
                    ) : <div className="text-[10px] rounded px-2 py-2" style={{ backgroundColor: t.bgMain, color: t.textSecondary, border: `1px solid ${t.border}` }}>No frames selected yet.</div>}
                  </div>
                  {visualWardrobeSystem === "custom" && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-1" style={{ color: t.textSecondary }}>CUSTOM WARDROBE DIRECTION <span className="font-normal">(required for this mode)</span></label>
                      <input
                        value={visualWardrobeBrief}
                        onChange={e => setVisualWardrobeBrief(e.target.value)}
                        placeholder="e.g., cream linen opening look; later change into a dark green rain jacket and worn boots"
                        className="w-full rounded text-sm px-2 py-2"
                        style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary }}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-3 rounded-md p-3 space-y-3" style={{ backgroundColor: t.bgContainer, border: `1px solid ${t.border}` }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest" style={{ color: t.accentGold }}>04 · Cast & relationship contract</div>
                      <div className="text-[10px] mt-1" style={{ color: t.textSecondary }}>Name a second adult whenever the frame must show a real relationship. Their presence becomes a requirement, not scenery.</div>
                    </div>
                    {visualCoStar.trim() && <span className="text-[10px] rounded px-2 py-1 font-bold" style={{ backgroundColor: t.highlight, color: t.accentGold, border: `1px solid ${t.border}` }}>CAST LOCK ON</span>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="block text-xs font-bold" style={{ color: t.textSecondary }}>SECOND ADULT / COUNTERPART <span className="font-normal">(optional for solo sets)</span>
                      <input
                        value={visualCoStar}
                        onChange={e => setVisualCoStar(e.target.value)}
                        placeholder="e.g., Terry Jeffords, her sergeant"
                        className="mt-1 w-full rounded text-sm px-2 py-2"
                        style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary }}
                      />
                    </label>
                    <label className="block text-xs font-bold" style={{ color: t.textSecondary }}>RELATIONSHIP / DYNAMIC
                      <select value={visualRelationship} onChange={e => setVisualRelationship(e.target.value)} className="mt-1 w-full rounded text-sm px-2 py-2" style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary }}>
                        {SCENE_RELATIONSHIPS.map(item => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>
                    <label className="block text-xs font-bold" style={{ color: t.textSecondary }}>COUNTERPART COVERAGE
                      <select value={visualCounterpartCoverage} onChange={e => setVisualCounterpartCoverage(e.target.value)} disabled={!visualCoStar.trim()} className="mt-1 w-full rounded text-sm px-2 py-2 disabled:opacity-50" style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary }}>
                        <option value="all">Required in every selected frame</option>
                        <option value="opening">Required in the opening shared frame only</option>
                      </select>
                    </label>
                    <label className="block text-xs font-bold" style={{ color: t.textSecondary }}>EMOTIONAL VOLTAGE
                      <select value={visualVoltage} onChange={e => setVisualVoltage(e.target.value)} className="mt-1 w-full rounded text-sm px-2 py-2" style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary }}>
                        {SCENE_VOLTAGES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="block text-xs font-bold" style={{ color: t.textSecondary }}>SITUATION / LOCATION CONTRACT <span className="font-normal">(optional, but strongly recommended for shared scenes)</span>
                    <input
                      value={visualSituation}
                      onChange={e => setVisualSituation(e.target.value)}
                      placeholder="e.g., Beach house after a long shift; ocean light through open doors; they are off the clock but not off guard"
                      className="mt-1 w-full rounded text-sm px-2 py-2"
                      style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}`, color: t.textPrimary }}
                    />
                  </label>
                  {visualCoStar.trim() && <div className="text-[10px] leading-snug rounded px-2 py-2" style={{ backgroundColor: t.bgMain, color: t.textSecondary, border: `1px solid ${t.border}` }}>
                    Every required shared frame will explicitly name <strong>{visualCoStar.trim()}</strong>, require two distinct adults, state the relationship, lock the selected wardrobe, and receive a post-generation visual requirement check. A weak frame stays visible but is labelled honestly for a contract re-roll.
                  </div>}
                </div>

                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <GenBtn onClick={generateVisualSet} loading={loading.visualSet} disabled={!visualPlanReady} style={{ backgroundColor: t.accentGold, color: "#fffdf7", flex: 1 }}>
                    <Sparkles size={14} className="mr-1" /> {visualPlanReady ? `Generate planned ${visualBatchSize}-frame set` : `Finish ${visualBatchSize}-frame plan to generate`}
                  </GenBtn>
                  {visualSet.length > 0 && (
                    <button
                      onClick={() => { setVisualSet([]); setVisualSetError(null); }}
                      className="text-xs px-3 py-2 rounded font-bold"
                      style={{ backgroundColor: t.bgMain, color: t.textSecondary, border: `1px solid ${t.border}` }}
                    >
                      Clear Set
                    </button>
                  )}
                </div>
                {visualSetError && <div className="text-xs mt-2" style={{ color: "#ef4444" }}>{visualSetError}</div>}

                {visualSet.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {visualSet.map((item, index) => (
                      <div key={item.id} className="overflow-hidden rounded-md" style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}` }}>
                        <div className="relative flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.16)", aspectRatio: item.aspectRatio?.replace(":", " / ") || selectedVisualRecipe.aspectRatio.replace(":", " / ") }}>
                          {item.image ? (
                            <>
                              <img
                                src={item.image}
                                alt={`${selectedVisualRecipe.label}: ${item.label}`}
                                onClick={() => setLightboxSrc(item.image)}
                                className="w-full h-full object-cover cursor-pointer"
                                title="Click to enlarge"
                              />
                              {item.status === "rerolling" && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs" style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "white" }}>
                                  <Spinner size={22} />
                                  <span>Re-rendering this frame…</span>
                                </div>
                              )}
                            </>
                          ) : item.status === "error" ? (
                            <span className="text-xs px-3 text-center" style={{ color: "#ef4444" }}>{item.error || "Image generation failed."}</span>
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-xs" style={{ color: t.textSecondary }}>
                              <Spinner size={20} />
                              <span>{item.status === "generating" ? "Rendering scene..." : "Queued"}</span>
                            </div>
                          )}
                        </div>
                        <div className="px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-bold" style={{ color: t.accentGold }}>{String(index + 1).padStart(2, "0")} · {item.label}</div>
                            {item.rerollCount > 0 && <span className="text-[9px] whitespace-nowrap" style={{ color: t.textSecondary }}>Take {item.rerollCount + 1}</span>}
                          </div>
                          <div className="text-[10px] mt-1 leading-snug" style={{ color: t.textSecondary }}>{item.direction}</div>
                          <div className="text-[9px] mt-1 uppercase tracking-wide" style={{ color: t.textSecondary }}>
                            {item.source === "venice" ? `Venice · ${IMAGE_MODELS.find(model => model.id === item.model)?.name || item.model}` : "Pollinations"}
                          </div>
                          {item.contract && <div className="mt-2 rounded px-2 py-1.5 text-[9px] leading-snug" style={{ backgroundColor: t.bgContainer, border: `1px solid ${t.border}`, color: t.textSecondary }}>
                            <strong style={{ color: t.accentGold }}>CONTRACT</strong> · {item.contract.hasCounterpart ? `${item.contract.counterpart} required · ${item.contract.relationship || "relationship locked"}` : "Primary subject locked"}<br />
                            {item.contract.situation || "Scene setting follows the director brief"} · {item.contract.voltage}
                          </div>}
                          {item.validation && <div className="mt-2 rounded px-2 py-1.5 text-[9px] leading-snug" style={{ backgroundColor: item.validation.status === "pass" ? t.highlight : t.bgContainer, border: `1px solid ${item.validation.status === "pass" ? t.accentGold : t.border}`, color: item.validation.status === "pass" ? t.accentHover : t.textSecondary }}>
                            <strong>{item.validation.status === "pass" ? "✓ REQUIREMENTS CHECK" : item.validation.status === "unavailable" ? "? REQUIREMENTS CHECK" : "↻ REVIEW NEEDED"}</strong>{item.validation.note ? ` · ${item.validation.note}` : ""}
                          </div>}
                          {item.error && <div className="text-[10px] mt-2 leading-snug" style={{ color: "#ef4444" }}>{item.error}</div>}
                          <button
                            onClick={() => rerollVisualFrame(item.id)}
                            disabled={!item.prompt || item.status === "generating" || item.status === "rerolling" || item.status === "queued"}
                            className="w-full mt-2 flex items-center justify-center gap-1 rounded px-2 py-1.5 text-[10px] font-bold disabled:opacity-50"
                            style={{ backgroundColor: t.highlight, color: t.accentGold, border: `1px solid ${t.border}` }}
                            title="Generate a new take using this exact scene direction"
                          >
                            {item.status === "rerolling" ? <Spinner size={12} /> : <RefreshCw size={12} />}
                            {item.status === "rerolling" ? "Re-rendering…" : item.status === "error" && !item.image ? "Try Frame Again" : "Re-roll Frame"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
                  <GenBtn onClick={() => generateSection("physical", setPhysical, "physical", "blue")} loading={loading.physical} style={{ backgroundColor: "#8f6a12", color: "#fffdf7" }}>
                    <FileText size={14} className="mr-1" /> Clinical
                  </GenBtn>
                  <GenBtn onClick={() => generateSection("physical", setPhysical, "physical", "green")} loading={loading.physical} style={{ backgroundColor: "#b8860b", color: "#fffdf7" }}>
                    <Gem size={14} className="mr-1" /> Magazine
                  </GenBtn>
                  <GenBtn onClick={() => generateSection("physical", setPhysical, "physical", "yellow")} loading={loading.physical} style={{ backgroundColor: "#eab308", color: "#111" }}>
                    <Beer size={14} className="mr-1" /> Bar Talk
                  </GenBtn>
                  <GenBtn onClick={() => generateSection("physical", setPhysical, "physical", "purple")} loading={loading.physical} style={{ backgroundColor: "#a97b13", color: "#fffdf7" }}>
                    <Eye size={14} className="mr-1" /> Presence
                  </GenBtn>
                  <GenBtn onClick={() => generateSection("physical", setPhysical, "physical", "red")} loading={loading.physical} style={{ backgroundColor: "#9b4f2a", color: "#fffdf7" }}>
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

              <div className="rounded-lg p-3 space-y-3" style={{ backgroundColor: t.bgSection, border: `1px solid ${t.border}` }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Radio size={15} style={{ color: t.accentGold }} />
                    <h4 className="text-xs font-bold tracking-widest" style={{ color: t.accentGold, fontFamily: "'Roboto Mono', monospace" }}>SCENE LAB</h4>
                  </div>
                  {mode === "starling" && <div className="flex gap-1 text-[10px]">
                    <button onClick={() => setAddendumMode("scene")} className="rounded px-2 py-1 font-bold" style={{ backgroundColor: addendumMode === "scene" ? t.accentGold : t.bgMain, color: addendumMode === "scene" ? "#fffdf7" : t.textSecondary, border: `1px solid ${t.border}` }}>Imaginative Scene</button>
                    <button onClick={() => setAddendumMode("dossier")} className="rounded px-2 py-1 font-bold" style={{ backgroundColor: addendumMode === "dossier" ? t.accentGold : t.bgMain, color: addendumMode === "dossier" ? "#fffdf7" : t.textSecondary, border: `1px solid ${t.border}` }}>Dossier Addendums</button>
                  </div>}
                </div>
                {addendumMode === "scene" ? <>
                  <p className="text-xs leading-relaxed" style={{ color: t.textSecondary }}>
                    Build the actual moment instead of asking for generic notes: decide who is there, what history they carry, what each person wants, the heat in the room, and what has to give.
                    {mode === "starling" && " Starling scenes are explicitly imaginative character fiction, not claims about private real life."}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <label className="text-xs font-bold" style={{ color: t.textSecondary }}>Scene lens
                      <select value={sceneConfig.lens} onChange={event => setSceneField("lens", event.target.value)} className="mt-1 w-full rounded px-2 py-1.5 text-xs" style={{ backgroundColor: t.bgMain, color: t.textPrimary, border: `1px solid ${t.border}` }}>
                        {SCENE_LENSES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-bold" style={{ color: t.textSecondary }}>Named adult counterpart
                      <input value={sceneConfig.counterpart} onChange={event => setSceneField("counterpart", event.target.value)} placeholder="e.g., Terry Jeffords, her sergeant" className="mt-1 w-full rounded px-2 py-1.5 text-xs" style={{ backgroundColor: t.bgMain, color: t.textPrimary, border: `1px solid ${t.border}` }} />
                    </label>
                    <label className="text-xs font-bold" style={{ color: t.textSecondary }}>Relationship / history
                      <select value={sceneConfig.relationship} onChange={event => setSceneField("relationship", event.target.value)} className="mt-1 w-full rounded px-2 py-1.5 text-xs" style={{ backgroundColor: t.bgMain, color: t.textPrimary, border: `1px solid ${t.border}` }}>
                        {SCENE_RELATIONSHIPS.map(item => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-bold" style={{ color: t.textSecondary }}>Emotional voltage
                      <select value={sceneConfig.voltage} onChange={event => setSceneField("voltage", event.target.value)} className="mt-1 w-full rounded px-2 py-1.5 text-xs" style={{ backgroundColor: t.bgMain, color: t.textPrimary, border: `1px solid ${t.border}` }}>
                        {SCENE_VOLTAGES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                      </select>
                    </label>
                  </div>
                  {sceneConfig.relationship === "Custom" && <label className="block text-xs font-bold" style={{ color: t.textSecondary }}>Custom relationship
                    <input value={sceneConfig.customRelationship} onChange={event => setSceneField("customRelationship", event.target.value)} placeholder="What binds them, irritates them, or keeps them circling each other?" className="mt-1 w-full rounded px-2 py-1.5 text-xs" style={{ backgroundColor: t.bgMain, color: t.textPrimary, border: `1px solid ${t.border}` }} />
                  </label>}
                  <label className="block text-xs font-bold" style={{ color: t.textSecondary }}>Setting / occasion
                    <input value={sceneConfig.setting} onChange={event => setSceneField("setting", event.target.value)} placeholder="e.g., Beach house after a fundraiser; ocean light, closed doors, neither quite ready to leave" className="mt-1 w-full rounded px-2 py-1.5 text-xs" style={{ backgroundColor: t.bgMain, color: t.textPrimary, border: `1px solid ${t.border}` }} />
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <label className="text-xs font-bold" style={{ color: t.textSecondary }}>What {subject.name || "the subject"} wants
                      <input value={sceneConfig.subjectWant} onChange={event => setSceneField("subjectWant", event.target.value)} placeholder="What are they trying to get, avoid, prove, or feel?" className="mt-1 w-full rounded px-2 py-1.5 text-xs" style={{ backgroundColor: t.bgMain, color: t.textPrimary, border: `1px solid ${t.border}` }} />
                    </label>
                    <label className="text-xs font-bold" style={{ color: t.textSecondary }}>What the counterpart wants
                      <input value={sceneConfig.counterpartWant} onChange={event => setSceneField("counterpartWant", event.target.value)} placeholder="Their distinct want, boundary, or leverage" className="mt-1 w-full rounded px-2 py-1.5 text-xs" style={{ backgroundColor: t.bgMain, color: t.textPrimary, border: `1px solid ${t.border}` }} />
                    </label>
                    <label className="text-xs font-bold" style={{ color: t.textSecondary }}>Pressure point / temptation / secret
                      <input value={sceneConfig.pressure} onChange={event => setSceneField("pressure", event.target.value)} placeholder="The thing that makes this moment impossible to keep superficial" className="mt-1 w-full rounded px-2 py-1.5 text-xs" style={{ backgroundColor: t.bgMain, color: t.textPrimary, border: `1px solid ${t.border}` }} />
                    </label>
                    <label className="text-xs font-bold" style={{ color: t.textSecondary }}>Desired turn / outcome
                      <input value={sceneConfig.outcome} onChange={event => setSceneField("outcome", event.target.value)} placeholder="A confession, refusal, new bargain, rupture, relief, or delicious unresolved tension" className="mt-1 w-full rounded px-2 py-1.5 text-xs" style={{ backgroundColor: t.bgMain, color: t.textPrimary, border: `1px solid ${t.border}` }} />
                    </label>
                  </div>
                  <label className="block text-xs font-bold" style={{ color: t.textSecondary }}>Director note <span className="font-normal">(optional)</span>
                    <textarea value={sceneConfig.note} onChange={event => setSceneField("note", event.target.value)} placeholder="Anything specific about mood, body language, social stakes, wardrobe, boundaries, or the kind of beautiful trouble you want the scene to explore." rows={2} className="mt-1 w-full rounded px-2 py-1.5 text-xs resize-y" style={{ backgroundColor: t.bgMain, color: t.textPrimary, border: `1px solid ${t.border}` }} />
                  </label>
                </> : <p className="text-xs leading-relaxed" style={{ color: t.textSecondary }}>Dossier mode retains the timeline and public-persona addendums. Switch back to Imaginative Scene when you want a character-driven moment instead of a documentary read.</p>}
              </div>

              {/* Addendum 1 */}
              <div style={sectionStyle}>
                <SectionHeader
                  icon={addendumMode === "scene" ? <ClipboardList size={16} /> : <Clock size={16} />}
                  title={addendumMode === "scene" ? "Scene Observation" : (mode === "raven" ? "Field Observation Log" : "Historical Timeline")}
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
                <GenBtn onClick={() => generateSection("add1", setAddendum1, "addendum1")} loading={loading.add1} className="mt-3" style={{ backgroundColor: t.accentGold, color: "#fffdf7" }}>
                  <Sparkles size={14} className="mr-1" /> {addendumMode === "scene" ? "Generate Scene" : (mode === "raven" ? "Generate Report" : "Generate Timeline")}
                </GenBtn>
              </div>

              {/* Addendum 2 */}
              <div style={sectionStyle}>
                <SectionHeader
                  icon={addendumMode === "scene" ? <Users size={16} /> : <UserCheck size={16} />}
                  title={addendumMode === "scene" ? "Encounter Simulation" : (mode === "raven" ? "Encounter Simulation" : "Public Persona Analysis")}
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
                <GenBtn onClick={() => generateSection("add2", setAddendum2, "addendum2")} loading={loading.add2} className="mt-3" style={{ backgroundColor: t.highlight, color: t.accentHover, border: `1px solid ${t.border}` }}>
                  <Sparkles size={14} className="mr-1" /> {addendumMode === "scene" ? "Generate Encounter" : (mode === "raven" ? "Generate Simulation" : "Generate Analysis")}
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
                      menuDirection="up"
                    />
                    <span className="text-xs" style={{ color: t.textSecondary }}>
                      Default: Grok 4.20 · Alternates: {ROLEPLAY_ALTERNATES.map(a => a.label.split(" — ")[0]).join(" · ")}
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

                {/* Scenario deck — an active scene makes the first reply character-driven instead of generic. */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 rounded-md p-3" style={{ backgroundColor: t.bgMain, border: `1px solid ${t.border}` }}>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold mb-1 uppercase" style={{ color: t.textSecondary, letterSpacing: "0.05em" }}>Scenario Deck</label>
                    <select
                      value={selectedRolePlayScenario.id}
                      onChange={e => setRpScenarioId(e.target.value)}
                      className="w-full rounded text-sm px-2 py-2"
                      style={{ backgroundColor: t.bgContainer, border: `1px solid ${t.border}`, color: t.textPrimary }}
                    >
                      {availableRolePlayScenarios.map(scenario => <option key={scenario.id} value={scenario.id}>{scenario.label}</option>)}
                    </select>
                    <div className="text-[10px] mt-1 leading-snug" style={{ color: t.textSecondary }}>{selectedRolePlayScenario.note}</div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold mb-1 uppercase" style={{ color: t.textSecondary, letterSpacing: "0.05em" }}>Director Note <span className="normal-case font-normal">(optional)</span></label>
                    <textarea
                      value={rpScenarioBrief}
                      onChange={e => setRpScenarioBrief(e.target.value)}
                      placeholder="e.g., Rain has stopped outside the café. We have been avoiding one question all evening."
                      rows={3}
                      className="w-full rounded text-sm p-2"
                      style={{ backgroundColor: t.bgContainer, border: `1px solid ${t.border}`, color: t.textPrimary, resize: "vertical" }}
                    />
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
                  <GenBtn onClick={generateRolePlayImage} loading={rpImgLoading} style={{ backgroundColor: t.accentGold, color: "#fffdf7" }}>
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
