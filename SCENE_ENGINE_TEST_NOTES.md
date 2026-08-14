# Scene Engine Live Test Notes

## 2026-08-14 — Rosa Diaz and Terry Jeffords contract test

A live Visual Scene Studio set was launched with the following contract:

- Primary subject: Rosa Diaz (Brooklyn Nine-Nine)
- Required adult counterpart: Terry Jeffords, her sergeant
- Coverage: required in every selected frame
- Relationship: colleagues with history
- Emotional voltage: charged
- Situation: a beach house after a difficult shift, with ocean light through open doors and both characters off the clock but guarded
- Planned shots: Full-Length Hero, Three-Quarter Detail, Seated Editorial

The first Nano Banana Pro frame completed after deployment. Direct visual inspection confirmed that it contained two distinct adults, with Rosa and a physically distinct Terry-like counterpart together in a beach-house interior with ocean visible. This is a material improvement over the supplied failing sample, where the counterpart was omitted from two of three frames. Frames 2 and 3 were still rendering at the time of this note. The post-generation vision-review status must be checked after all frames complete.

## UI observations

The live planner displays a visible CAST LOCK ON status, the named counterpart, required-every-frame coverage, relationship, emotional voltage, and location contract before launch. Each queued frame displays the saved contract beneath its direction, allowing the user to identify a failure instead of having to remember what was requested.

## Completed three-frame result

Direct visual inspection of the completed live gallery confirmed a major improvement: all three frames visibly contain two distinct adults. Rosa-like primary subject and Terry-like counterpart appear together in the full-length, three-quarter, and seated frames. The output preserved the beach-house interior, open ocean-side doors/windows, a shared off-duty setting, and the planned progression from standing presence to closer detail to a seated beat. This resolves the exact supplied failure mode, where a named counterpart and their relationship were silently dropped from two of the three images.

The result is not framed as automatic perfection: the UI stores the cast/location/voltage contract beneath every card and invokes a vision check to surface pass/review status. The next inspection should verify the returned requirement-review statuses and, if necessary, refine the validation model response parser rather than hiding ambiguity.

## Automated vision review

The deployed scene-contract validator returned a positive requirement check for all three frames. The first review confirmed that Rosa Diaz and Terry Jeffords were both fully visible, distinct, and positioned to convey the guarded charged dynamic. The second confirmed both characters, coherent styling, and the shared scene. The final review specifically confirmed two distinct seated figures, beach-house interior, ocean light, coherent wardrobe, charged but guarded interaction, and the required seated editorial framing.

This is the intended quality-control behavior: the model does not merely receive a stronger prompt; the system saves an inspectable contract and then evaluates the delivered image against it. Any future miss can now be distinguished from a planner/input mistake and re-rolled from that exact contract.

## Shared Scene Lab live UI

The addendum section has been replaced by the shared Scene Lab in the live app. It offers a scene lens (including Observation, Confrontation, Private Conversation, Chemistry, Deal / Temptation, After Hours, and Aftermath), named adult counterpart, relationship/history, emotional voltage, setting/occasion, each person’s distinct want, a pressure point or secret, desired turn/outcome, and an optional director note. It drives both Scene Observation and Encounter Simulation, rather than leaving those outputs to generic surveillance language.

## Scene Lab field map

The live DOM confirms independent fields for counterpart, setting, primary subject want, counterpart want, pressure point, desired turn, and director note. This is enough information to run a focused narrative test using the same Rosa/Terry relationship contract that was proven in the visual set.

## Narrative test contract

A live Scene Lab narrative test is configured for Rosa Diaz and Terry Jeffords. The setting is a beach house after a difficult shift, with ocean light and neither character ready to leave. Rosa wants Terry to admit why the case feels personal without revealing how much she needs the answer; Terry wants Rosa to stop turning danger into a solitary burden. An unfiled case photograph is the pressure point. The desired turn is a new bargain to take the case together after the truth is spoken, while the charged feeling remains unresolved. The director note requires dialogue-led characterization, rain-soaked ocean atmosphere, restraint, eye contact, and active agency for both people.

## First narrative result and correction trigger

The Scene Observation response did preserve the named two-person cast and active interpersonal tension: it explicitly placed Terry and Rosa together in the generated moment. However, its opening relocated the scene to the East River rather than honoring the explicit beach-house/ocean-light location contract. That means the shared Scene Lab architecture is successfully passing cast and relationship information but the current narrative prompt does not yet treat every contract field as non-negotiable.

This is a release-blocking quality finding for the narrative side. Before finalizing the handoff, the text prompts and default model selection must be tightened so setting, competing wants, pressure point, desired turn, and director note are repeated as a named non-negotiable scene contract and checked in the output. The visual path is ready; the narrative path needs this last enforcement refinement.

## Narrative enforcement refinement deployed

The initial narrative test exposed a location-contract miss despite correct cast handling. The release was refined to use Grok 4.20 as the default for both shared Scene Lab outputs and to require an exact-setting opening, two concrete setting details, an explicit pressure point, two active named speakers, and a final beat that earns the desired outcome. The refined Worker was deployed successfully at 2026-08-14T14:08:37Z; health verification returned HTTP 200 with version 3.6.0.

## Refined narrative validation setup

A cache-busted production session has been opened after the refinement deployment. A fresh Rosa Diaz Raven dossier is being used to repeat the same beach-house Scene Lab contract, so the corrected output can be compared directly against the original location failure.

The cache-busted refined release reached the normal target-disambiguation flow and presents the canonical fictional Rosa Diaz choice separately from Stephanie Beatriz and the character’s full-name variant. The next test step will select the canonical character and repeat the same Scene Lab contract.

## Live default-model mismatch discovered

The fresh refined dossier exposed a second release-blocking issue: although `SECTION_DEFAULTS` was edited to use Grok 4.20 for `add1` and `add2`, the rendered Scene Observation and Encounter Simulation controls still show Google Gemini and Venice AI. The UI’s section-provider wiring uses a different key path than the edited defaults. This must be corrected before the final scene-contract retest so the Scene Lab actually uses the intended Grok 4.20 default in production.

## Final default-normalization deployment

A narrow additive normalization effect was deployed after the live UI still showed the obsolete Gemini/Venice Scene Lab defaults. It only replaces the known former default pairs when Imaginative Scene mode is active and preserves deliberate user-selected provider changes. The final deployment completed successfully at 2026-08-14T14:14:32Z and the cache-busted production home page loads correctly.

The final cache-busted validation session accepted the Rosa Diaz Raven query and reached target confirmation, using a clean browser state after the legacy Scene Lab default normalization deployment.

## Final default check passed

The fresh production dossier now visibly shows Grok (xAI) for both Scene Observation and Encounter Simulation. This confirms that the legacy-default normalization is working in a clean browser session and that the next narrative output will exercise the intended Grok 4.20 Scene Lab route.

The final live Scene Observation request has been launched through Grok (xAI) with the complete beach-house contract. The visible control confirms the corrected default route. The requested output is now pending final review for exact location, named cast, pressure point, and outcome fidelity.

## Final narrative contract test passed

The Grok 4.20 Scene Observation explicitly opened at the requested beach house with brine, wet cedar, rain, ocean light, open doors, wet sand, Rosa, Terry, and the unfiled photograph present. A text search confirmed the requested ending language: the scene closes with a new bargain that they will carry the case together. The corrected production route honors the named cast, setting, pressure point, and intended outcome rather than drifting into a generic alternate location.

