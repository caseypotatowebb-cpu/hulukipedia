# Hulukipedia Scene Engine Audit

**Date:** 2026-08-14  
**Scope:** Visual Set Planner, Field Observation Log, Encounter Simulation, and role-play scene setup.

## What Failed in the Rosa / Terry Test

The Visual Set Planner correctly surfaced a three-frame plan, custom wardrobe, a cinematic recipe, and the freeform direction “a beach house with Terry Jeffords, her sergeant.” It did **not** enforce those choices. One output rendered Rosa alone in an alley, another framed Rosa in a generic solitary composition, and only one frame kept Terry visibly present. The model did not ignore the user because the visual controls were unclear; it ignored the user because the application converted the key requirements into weak, optional prose.

| Requirement | Current implementation | Consequence |
|---|---|---|
| Named counterpart | `visualCoStar` only renders for the `Duo Chemistry` recipe, and is optional even there. | A named person in the Director’s Brief is not treated as a required participant. |
| Presence across frames | No per-frame participant coverage state exists. | A model can remove a requested co-star from any shot without the app recognizing a miss. |
| Relationship / rank | No structured relationship field exists. | “Her sergeant,” partner, rival, or date becomes background flavor rather than a composition instruction. |
| Scene location / objective | Freeform Director’s Brief is appended after generic recipe language. | A specific beach-house scenario competes with broad default art direction and can be overwritten by the model’s generic visual priors. |
| Wardrobe | The planned-output card displays wardrobe text, but prompt enforcement is not a visible hard contract. | A custom swimsuit instruction can be weakened or interpreted inconsistently. |
| Shot verification | No structured requirement manifest or visual quality pass exists. | The UI can label a frame “Three-Quarter Drama” even when the image violates the planned participants or social beat. |

## Root Cause

The Worker is not stripping the instruction. It forwards the image prompt with `safe_mode: false`. The drop happens in the frontend’s `buildVisualScenePrompt()` architecture: one identity anchor for the subject, a generic recipe, a generic shot, then a short optional co-star suffix. The system needs a **scene contract** that is built from explicit controls and repeated as non-negotiable visual requirements.

The lower narrative sections have the analogous problem. `operationConfig` currently offers only observer, mission, tone, and a miscellaneous note. The field log and encounter prompts then ask for broadly “cinematic” character writing. They do not ask the user for the counterpart, relationship, location, desire/pressure, scene objective, emotional voltage, or required reversal. Consequently they return competent but emotionally cautious case-file prose.

## Rewrite Requirements

### Visual Scene Contract

The scene planner should create a visible, stored contract for every frame:

1. **Required cast:** primary subject plus optional named adult counterpart(s).
2. **Participant coverage:** whether the counterpart must appear in every selected frame or only specific selected frames.
3. **Relationship dynamic:** allies, colleagues, rivals, authority friction, complicated history, romance, mutual temptation, or custom.
4. **Scene situation:** place, occasion, immediate objective, and prop/environment anchors.
5. **Adult atmosphere:** a user-selectable emotional-voltage layer that keeps adult participants agentic and specific.
6. **Wardrobe contract:** per-set or per-frame wardrobe requirements that cannot fall behind generic styling language.
7. **Frame contract:** exact camera angle, position, required people, interaction, and visual story beat.
8. **Failure avoidance:** no absent named counterpart, no substitute stranger, no duplicated main subject, no collage, no wrong location, no generic solo portrait when the contract requires a shared scene.

### Narrative Scene Engine

The lower experience should become a **Scene Lab**, with a rich shared contract rather than a narrow fictional-operation widget. It should let the user set:

- point of view and counterpart;
- relationship / history;
- location and situation;
- emotional voltage and story genre;
- what each person wants in the scene;
- a pressure point, boundary, secret, or temptation;
- the desired endpoint or unresolved question.

The output prompts should demand explicit use of those selected values, vivid physical behavior, concrete dialogue, escalation through choices, and distinct agency for every named person. The language should feel daring, adult, and emotionally alive without flattening anyone into a prop.

## Acceptance Criteria

A Rosa-and-Terry-style plan must visibly display the cast and relationship before launch. Each generated frame prompt must state that both Rosa and Terry are required, distinct adult people, describe their intended interaction, and forbid a solo substitute frame. The gallery must show the frame’s contract next to its provenance so a missed requirement is obvious and can be re-rolled with the same hard constraints.

A Scene Lab prompt must return a character-driven scene that uses the declared relationship, location, emotional voltage, and pressure point, with real dialogue and consequences rather than a sterile report.

## External Capability Confirmed: Generated-Frame Vision Checks

Venice documents a direct requirement-check route: a vision-capable chat model such as `qwen3-vl-235b-a22b` can receive text plus an image URL or base64 data URL through the OpenAI-compatible `/api/v1/chat/completions` endpoint. This makes it feasible to add a post-generation **contract check** for each frame: required cast, participant count, location anchors, wardrobe requirement, interaction beat, and forbidden solo/duplicate failures. The check should describe a failure rather than silently declaring a missed frame correct.

Sources:
- https://docs.venice.ai/guides/features/vision
- https://docs.venice.ai/api-reference/endpoint/chat/completions
