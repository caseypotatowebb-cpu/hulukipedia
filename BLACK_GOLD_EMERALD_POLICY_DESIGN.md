# Hulukipedia Black, Gold & Emerald Refresh — August 13, 2026

## Intent

The refresh is a **change of atmosphere, not a reinvention of the interface**. Hulukipedia should still read as a layered intelligence dossier, but the home page and both dossier modes should immediately feel different: a near-black archival desk, warm antique gold for hierarchy and decisive actions, and dense emerald for intelligence, research, and living context.

The visual language is deliberately restrained. Gold should not be used as a fill everywhere; it is a signal for titles, active choices, and primary actions. Emerald should carry systems, research, Raven movement, and focus states. Warm ivory text replaces the previous pastel-purple and pale-slate body colors so longer intelligence sections remain calm and readable.

## Palette

| Token | Value | Use |
|---|---:|---|
| Obsidian | `#070907` | Site canvas and home-page field. |
| Archive Black | `#0D120E` | Primary cards and dossier sheets. |
| Deep Emerald | `#0E2218` | Nested panels, visual studio, and low-level surfaces. |
| Signal Emerald | `#167247` | Research state, Raven direction, focus outlines, secondary action. |
| Aged Gold | `#D4AF37` | Headings, active state, primary action, key dividers. |
| Bright Gold | `#F1D273` | Hover treatment and high-emphasis text. |
| Parchment | `#F5EED5` | Main readable text. |
| Moss Ink | `#B9C8A8` | Supporting labels, metadata, and quiet guidance. |
| Verdigris Border | `#28563E` | Card and field boundaries. |

Each mode keeps a modest accent shift while preserving the same family: Raven leans more emerald-black; Starling gets a subtle polished-gold emphasis rather than returning to a white dashboard. This makes the initial home page and each mode feel related, not like three unrelated applications.

## Focused UI changes

The main container gains a low-contrast black-to-emerald radial field, with no image assets and no competing illustration. Cards gain a fine aged-gold top sheen and a soft green-black depth shadow. Inputs stay matte rather than glossy. The existing script logo, monospaced labels, and dossier structure remain intact. Raven and Starling search buttons move from purple/red toward emerald and gold, making the redesigned landing screen visibly new before a search ever runs.

All menus, especially the lower Role-Play model selector, continue to use the upward-opening and scrollable behavior shipped in 3.1.0. The reskin must not alter its z-index or positioning rules.

## Enforced model policy

| Area | Decision |
|---|---|
| Grok default | Interpret the user’s “Grok 4.2” as the live **Grok 4.20** family. The authenticated xAI catalog does not contain a `grok-4.2` id, while it does contain `grok-4.20-0309-non-reasoning`, `grok-4.20-0309-reasoning`, and `grok-4.20-multi-agent-0309`. The non-reasoning stable route was smoke-tested successfully and is the preferred direct, energetic default. |
| Previous Grok 4.3 defaults | Physical Description, Strategic Analysis, and Role-Play change to `grok-4.20-0309-non-reasoning`. Grok 4.3 remains an optional selector choice, not the automatic voice. |
| OpenAI ceiling | No GPT model newer than GPT 5.1 is exposed anywhere. Since this account’s direct access is GPT-4o, retain GPT-4o only and remove OpenRouter GPT-5.6 Terra. |
| Claude floor | No Claude release older than 4.8 is exposed. Remove Sonnet 4.6, Sonnet 4.5, Haiku 4.5, and Venice Claude 4.5; retain Claude Opus 4.8 plus Claude 5-family choices after direct verification. |
| Perplexity | Retain the current direct Sonar family: `sonar`, `sonar-pro`, `sonar-reasoning-pro`, and `sonar-deep-research`. Remove retired `sonar-reasoning`. Do not use Perplexity Agent presets because their current documented presets route to GPT 5.4–5.6 families, which violate the product rule. |

## Credential handling

The supplied Vibe credential appears to correspond to Vibe Prospecting, a B2B company/contact intelligence service. It belongs in a Team Tomorrow business-research workflow, not Hulukipedia’s character dossier pipeline, and will remain unintegrated.

The service represented by the supplied “Studio” credential remains unknown. No connector or key format matches it. It is intentionally not contacted or stored in Worker code until the user supplies the service name or dashboard URL.

## Future provider decision

Mistral is still the best next direct provider after a valid Mistral key is supplied. No additional provider is being added in this release: the priority is to remove stale/dead selection paths, honor the user’s model taste precisely, and make the application itself look newly alive.
