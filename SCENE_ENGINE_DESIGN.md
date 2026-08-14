# Hulukipedia Requirement-Locked Scene Engine

**Status:** Approved implementation design  
**Date:** 2026-08-14

## Design Goal

Hulukipedia’s creative layer must act like a director’s call sheet, not an inspiration box. The user’s cast, relationship, wardrobe, location, tension, and selected beats become **scene contracts**—visible before launch, repeated in each prompt, stored with every frame, and checked after generation.

> “A beach house with Terry Jeffords, her sergeant” is not a vague mood. It means Rosa Diaz and Terry Jeffords are both required adult participants, Terry is visibly present in each selected shared shot, their NYPD relationship is legible, the location reads as a beach house, and the selected frame has a specific interaction rather than a solo portrait.

## Visual Scene Contract

| Contract field | User control | Prompt rule | Gallery evidence |
|---|---|---|---|
| Primary subject | Existing dossier target | Required in every frame | Primary subject label |
| Counterpart | Named adult co-star, optional only for solo recipes | Required in every selected “shared-cast” frame | Counterpart label and required-frame count |
| Relationship | Colleagues, friends, rivals, old partners, unresolved attraction, complicated history, custom | Defines spacing, gaze, body language, and emotional reading | Relationship label |
| Scene situation | Location, occasion, immediate shared objective | Must appear as practical visual anchors | Situation summary |
| Emotional voltage | Grounded, charged, intimate, provocative, volatile, decadent, custom | Determines atmosphere and interaction language without replacing agency | Voltage badge |
| Wardrobe | Existing system plus explicit custom instructions | Treated as a required visual condition, not a decorative aside | Wardrobe contract |
| Per-frame interaction | Each shot card contains a required shared beat when the co-star is required | Both adults must be visible and recognizably distinct; no solo substitute, duplicate body, or generic bystander | Contract summary shown per card |
| Validation | Default-on requirement check | Vision model checks cast count, named counterpart, location, wardrobe, and interaction | PASS / NEEDS RE-ROLL status and a concise reason |

### Cast Rules

The planner will support a named **second adult** for any recipe, not just `Duo Chemistry`. The user can choose whether that person is required in every selected frame or only selected cards. A co-star is never silently substituted with “an unnamed counterpart” when the user supplies a name.

Each frame prompt begins and ends with an explicit requirement block. For example:

```text
SCENE CONTRACT — NON-NEGOTIABLE:
- Depict exactly two distinct adult people: Rosa Diaz and Terry Jeffords.
- Terry Jeffords must be fully visible and recognizably distinct in this frame; do not omit, replace, blur, crop away, duplicate, or turn him into a background stranger.
- Relationship: colleagues with established trust and professional history.
- Situation: beach-house evening, together after work, the room and ocean light must read clearly.
- Wardrobe: Rosa wears the declared custom wardrobe; do not replace it with generic black tactical clothing.
- Required beat: Rosa and Terry share the selected dramatic beat through visible attention, proximity, or interaction.
```

The normal art-direction prompt follows, then a short anti-failure close repeats the cast and required beat.

### Validation Architecture

After an image is generated, Hulukipedia sends it to the existing Venice vision-capable chat route using `qwen3-vl-235b-a22b`. The validator emits structured JSON:

```json
{
  "status": "pass | review",
  "checks": {
    "primary_subject_present": true,
    "counterpart_present": true,
    "distinct_people": true,
    "wardrobe_matches": true,
    "location_matches": true,
    "interaction_matches": true
  },
  "note": "Both adults are present, but the beach-house location is weak."
}
```

A `review` result does not delete the image. It is honest in the gallery, keeps the exact contract available, and offers a **Re-roll with Contract** button. The validator is a quality signal, not an invisible censor or false claim of pixel-perfect recognition.

## Shared Scene Lab

The old “Fictional Operation Parameters” becomes a **Scene Lab** available in both Raven and Starling. It does not decide what the user may imagine based on whether a target is fictional or familiar.

| Control | Examples |
|---|---|
| Scene lens | Observation, Confrontation, Private Conversation, Chemistry, Confessional, Deal / Temptation, After-Hours, Custom |
| Counterpart | A named adult person or character, plus their role in the relationship |
| Relationship | Colleagues, authority friction, friends, rivals, former partners, unresolved attraction, private arrangement, custom |
| Setting / occasion | Beach house after a fundraiser, empty museum during a storm, hotel lobby at closing, private rehearsal room |
| What each person wants | The subject’s desire and the counterpart’s desire in the moment |
| Emotional voltage | Grounded, simmering, charged, intimate, provocative, volatile, decadent, custom |
| Pressure point | Secret, boundary, bargain, temptation, old wound, public risk, emotional test |
| Desired outcome | Relief, rupture, a new arrangement, a refused offer, unresolved tension, custom |

Raven defaults to **Scene Lab** because its current lower sections already use imaginative addendums. Starling keeps its Dossier addendums (Timeline and Persona Analysis) available through a `Dossier / Scene Lab` switch. In Scene Lab mode, both real and fictional targets use the same clearly labelled **imaginative scene** framing rather than making claims about anyone’s private life.

### Narrative Output Contract

The Scene Observation and Encounter Simulation prompts must include every selected field and require:

1. immediate physical atmosphere and the first emotional read;
2. distinct agency for subject and counterpart;
3. concrete dialogue, not analyst paraphrase;
4. escalation driven by chosen desire, pressure, and boundary;
5. an emotionally or socially consequential turn;
6. an ending that honors the chosen outcome or deliberately leaves it unresolved.

The desired voice is adult, intimate, perceptive, sometimes messy, and capable of temptation or deviousness—but it should still make characters feel like people with wants and choices rather than interchangeable bodies.

## Acceptance Tests

1. **Rosa / Terry beach-house test:** with Terry set as required in every frame, all three selected prompts name him and describe the relationship/interaction. A frame that omits him must receive `review`, not a false “done.”
2. **Wardrobe test:** Custom Wardrobe Brief remains visibly attached to each frame contract and is checked in the validation summary.
3. **Scene Lab test:** a user-selected counterpart, relationship, location, mutual wants, voltage, and pressure point produce a scene using all six elements, with dialogue and a visible turning point.
4. **Cross-mode test:** both Raven and Starling expose Scene Lab. Starling clearly labels its scene outputs as imaginative rather than as reports of hidden real life.
