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
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
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
    ],
  },
};

const DEFAULT_PROVIDER = "venice";
const DEFAULT_MODEL = "openai-gpt-4o-2024-11-20";

// ─── SMART SECTION DEFAULTS ───
// Venice routes to Commander's favorites; Perplexity for factual research
const SECTION_DEFAULTS = {
  intel:     { provider: "perplexity", model: "sonar-pro" },
  physical:  { provider: "venice",     model: "venice-uncensored-role-play" },
  comm:      { provider: "venice",     model: "openai-gpt-4o-2024-11-20" },
  convo:     { provider: "venice",     model: "venice-uncensored-role-play" },
  psych:     { provider: "venice",     model: "deepseek-v4-pro" },
  strategic: { provider: "venice",     model: "grok-4-20" },
  add1:      { provider: "venice",     model: "olafangensan-glm-4.7-flash-heretic" },
  add2:      { provider: "venice",     model: "claude-sonnet-4-5" },
};

// ─── API HELPER ───
const API_BASE = window.location.origin;

async function callAI(systemPrompt, userPrompt, provider = DEFAULT_PROVIDER, model = null) {
  try {
    const res = await fetch(`${API_BASE}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userPrompt, maxTokens: 1500, useSearch: false, provider, model }),
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
    physical: (tone) => {
      const tones = {
        blue: "Write a clinical/medical-style physical description",
        green: "Write a glamorous magazine-feature physical description",
        yellow: "Write a candid, appreciative bar-talk physical description",
        red: "Write a raw, unfiltered, locker-room physical description",
      };
      return {
        system: `You write vivid physical descriptions. ${fictional ? "This is a fictional character — be creative and detailed." : "This is a real person — base on publicly known appearance."}`,
        user: `${tones[tone]} of ${entity}. Cover build, face, distinguishing features, and overall presence. 150-200 words.`,
      };
    },
    comm: {
      system: "You are a communications analyst profiling speech patterns.",
      user: `Write a communication profile for ${entity}. Cover: vocabulary level, speech patterns, tone tendencies, persuasion style, notable verbal habits, and how they adjust communication for different audiences. 150-200 words.`,
    },
    convo: {
      system: "You write realistic dialogue examples showing how a subject speaks in different contexts.",
      user: `Write 3 conversation examples for ${entity} in different contexts (casual, professional, under pressure). Each should be 2-4 lines of dialogue. Label each with the context. Format clearly.`,
    },
    psych: {
      system: "You are a psychological profiler writing analyst field notes in a slightly informal, insightful style.",
      user: `Write psychological analyst notes for ${entity}. Cover: core motivations, defense mechanisms, attachment style, cognitive patterns, emotional regulation, and potential vulnerabilities. Write as handwritten-style analyst notes. 200-250 words.`,
    },
    strategic: {
      system: "You are a strategic analyst conducting SWOT analysis.",
      user: `Write a SWOT analysis for ${entity}. Format with clear Strengths, Weaknesses, Opportunities, and Threats sections. 3-4 bullet points each. Be specific and insightful.`,
    },
    addendum1: {
      system: fictional
        ? "You write immersive fictional field surveillance logs."
        : "You write factual historical timelines.",
      user: fictional
        ? `Write a field surveillance log for ${entity}. Include timestamps, location notes, observed behaviors, and analyst commentary. Make it feel like real field notes. 200-250 words.`
        : `Write a key events timeline for ${entity}. List 8-12 significant dates/events in chronological order with brief descriptions. Format: DATE — EVENT.`,
    },
    addendum2: {
      system: fictional
        ? "You write realistic encounter simulation briefings."
        : "You analyze public personas and media presence.",
      user: fictional
        ? `Write an encounter simulation briefing for meeting ${entity}. Cover: recommended approach, conversation openers, topics to avoid, expected reactions, and extraction protocol. 200-250 words.`
        : `Write a public persona analysis for ${entity}. Cover: media image vs. private behavior, brand management, public perception trends, and authenticity assessment. 200-250 words.`,
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
function IntelEntry({ entry, category, subject, details, theme, provider, model }) {
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
      const p = getPrompts(subject, details, "raven").verify(category, entry);
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
  const [imageModel, setImageModel] = useState("nano-banana-pro");
  const [imageSource, setImageSource] = useState("venice"); // "venice" or "pollinations"
  const [deepSearchResult, setDeepSearchResult] = useState(null);

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
      const prompts = getPrompts(subject.name, subject.details, mode);
      const pObj = subKey ? prompts[promptKey](subKey) : prompts[promptKey];
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
    }
    setL("image", false);
  };

  const copyAllText = () => {
    const sections = [
      `DOSSIER: ${subject.name.toUpperCase()}`,
      subject.details ? `Context: ${subject.details}` : "",
      "\n═══ CONFIRMED INTEL ═══",
      intel.map(c => `${c.category}:\n${c.entries.map(e => `  — ${e}`).join("\n")}`).join("\n"),
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
          [sectionKey]: { ...prev[sectionKey], provider: getSP(sectionKey), model: m },
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
                      <img src={imageUrl} alt="Generated portrait" className="w-full rounded-md" style={{ maxHeight: "300px", objectFit: "cover" }} />
                    ) : (
                      <div className="flex items-center justify-center rounded-md" style={{ height: "200px", backgroundColor: t.bgMain, border: `1px dashed ${t.border}` }}>
                        {loading.image ? <Spinner size={32} /> : <Image size={48} style={{ opacity: 0.2 }} />}
                      </div>
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

            {/* Footer */}
            <footer className="text-center py-4" style={{ fontFamily: "'Satisfy', cursive", color: t.accentGold, fontSize: "0.875rem" }}>
              <p><strong>Disclaimer:</strong> AI-generated content. May contain inaccuracies.</p>
              <p className="mt-1" style={{ fontSize: "0.75rem", color: t.textSecondary }}>Hulukipedia — A Team Tomorrow Production 🦅</p>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
