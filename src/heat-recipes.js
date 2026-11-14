// "After Dark · Heat" Visual Scene Studio presets (Weekday's wishlist, Nov 13 2026).
// More deliberate and devious moods (seductive, provocative, dark, menacing, scandalous) that
// stay suggestive rather than explicit, so they pass Nano Banana and similar image filters.
// They work in both Raven (fictional) and Starling (real-person) modes; Starling frames get an
// extra staging note (see starlingHeatNote) so a real person is never shown in a fake "real event".

export const HEAT_GROUP_LABEL = "After Dark · Heat";

export const HEAT_CONSTRAINT =
  " All depicted people are adults. Heat comes from attitude, gaze, posture, wardrobe, shadow and implication, never from explicit content: no nudity, no sex acts, no exposed intimate anatomy, no coercion, no gore, and no underage coding. Everyone shown is visibly in control of their own choices.";

export function starlingHeatNote(mode) {
  return mode === "starling"
    ? " This is a real public figure: present the frame as an obviously staged editorial or film still, never as a candid, leaked, or documentary photo of a real event. Keep the wardrobe something they could wear in public, with no implied undress; let expression, light and posture carry the heat."
    : "";
}

export function isHeatRecipe(recipe) {
  return Boolean(recipe && (recipe.heat || recipe.id === "after-dark"));
}

const heat = (recipe) => ({ ...recipe, heat: true, group: HEAT_GROUP_LABEL });

export const HEAT_RECIPES = [
  heat({
    id: "velvet-trap",
    label: "Velvet Trap",
    description: "Fatale velvet: an invitation with the hook left in plain sight.",
    aspectRatio: "3:4",
    artDirection: "a seductive velvet-lounge editorial, deep crimson and black, low amber practicals, slow cigarette-smoke haze, a fatale who knows exactly what effect they are having",
    shots: [
      { label: "The Invitation", direction: "a SINGLE three-quarter frame reclining on a velvet chaise, one hand extended toward the lens like an offer, a knowing half-smile" },
      { label: "Over the Glass", direction: "a SINGLE close frame looking over the rim of a cocktail glass, lipstick on the glass, eyes daring the viewer" },
      { label: "Slow Turn", direction: "a SINGLE frame mid-turn away from camera, glancing back over a bare shoulder, evening gown draped and fully in place" },
      { label: "Key on the Table", direction: "a SINGLE medium frame sliding a hotel key across a lacquered table with two fingers, face half in shadow" },
      { label: "Door Left Open", direction: "a SINGLE full-length frame in a doorway backlit by red light, silhouette poised, the room behind deliberately unreadable" },
    ],
  }),
  heat({
    id: "villain-era",
    label: "Villain Era",
    description: "Regal, menacing, unapologetic: the night the nice-person mask comes off for good.",
    aspectRatio: "16:9",
    artDirection: "a dark cinematic villain portrait series, storm light, cold steel and black leather, rain on glass, low camera angles that make the subject loom",
    shots: [
      { label: "The Throne", direction: "a SINGLE low-angle frame seated sideways on an imposing chair, one leg over the armrest, utterly unbothered" },
      { label: "Cruel Smile", direction: "a SINGLE tight portrait with a slow, cruel smile, rain-streaked window light cutting across the eyes" },
      { label: "Walking Away From the Fire", direction: "a SINGLE full-body frame walking toward camera with an orange glow and embers behind, not looking back" },
      { label: "Chess Move", direction: "a SINGLE medium frame tipping over the opponent's king with one finger, eyes on the viewer instead of the board" },
      { label: "Balcony Over the City", direction: "a SINGLE wide frame on a high balcony at night, coat whipping in the wind, surveying the city like it already belongs to them" },
    ],
  }),
  heat({
    id: "red-room-confession",
    label: "Red Room Confession",
    description: "Sins whispered through a lattice, everything drenched in red.",
    aspectRatio: "4:5",
    artDirection: "a provocative red-gel editorial, a confessional mood, saturated crimson light, deep blacks, film grain, secrets about to be spilled",
    shots: [
      { label: "Behind the Lattice", direction: "a SINGLE frame seen through a carved confessional lattice, eyes and lips visible, a secret clearly being savored" },
      { label: "Finger to Lips", direction: "a SINGLE close portrait with one finger pressed to the lips, a dangerous little grin" },
      { label: "Rosary and Lipstick", direction: "a SINGLE detail-and-face frame with a rosary wrapped around a wrist while slowly applying dark lipstick, eyes fixed on the lens" },
      { label: "Leaning In", direction: "a SINGLE medium frame leaning toward the lens as if to whisper, red light pooling on the collarbone, fully dressed in dark satin" },
      { label: "Unrepentant", direction: "a SINGLE full-length frame walking out of the red room into darkness, chin up, absolutely unrepentant" },
    ],
  }),
  heat({
    id: "tabloid-noir",
    label: "Tabloid Noir",
    description: "Flashbulbs and scandal-sheet glamour, staged as a black-and-white 1950s noir shoot.",
    aspectRatio: "3:2",
    artDirection: "an obviously staged high-fashion film-noir editorial styled like a 1950s scandal sheet, hard flash, deep shadows, black-and-white with one accent color",
    shots: [
      { label: "Caught in the Flash", direction: "a SINGLE frame shielding the eyes from a wall of flashbulbs with a defiant smirk, sunglasses at night" },
      { label: "Back Seat Exit", direction: "a SINGLE frame stepping out of a vintage car, one heel or boot on the curb, looking straight into the lens like they planned it" },
      { label: "Dressing Room", direction: "a SINGLE frame in a vintage dressing room lit by a ring of bare bulbs, glancing sideways at the lens as if caught mid-secret" },
      { label: "No Comment", direction: "a SINGLE close portrait with a raised eyebrow and the faintest smile, the expression of someone who will never say a word" },
      { label: "Front Page", direction: "a SINGLE poster-like full-length frame under a streetlamp in the rain, trench coat, the picture everyone will talk about tomorrow; no text in frame" },
    ],
  }),
  heat({
    id: "boudoir-power",
    label: "Boudoir Power Play",
    description: "Silk, candlelight, and a closed door: sensual, in charge, never explicit.",
    aspectRatio: "4:5",
    artDirection: "a moody boudoir-inspired editorial with silk, velvet and candlelight, soft shadows, sensual but fully styled wardrobe (silk robe, slip dress or tailored loungewear), power clearly with the subject",
    shots: [
      { label: "Vanity Gaze", direction: "a SINGLE frame seated at a vanity, turned toward the lens and holding the viewer's eyes while fastening an earring" },
      { label: "Silk and Shadow", direction: "a SINGLE three-quarter frame standing by a tall window, silk robe belted, moonlight and candlelight splitting the face" },
      { label: "Phone Face Down", direction: "a SINGLE medium frame on rumpled sheets, fully robed, phone face down beside them, an 'I'll call you back' look" },
      { label: "Pulling the Curtain", direction: "a SINGLE frame closing heavy curtains with one hand, glancing back as if deciding whether the viewer may stay" },
      { label: "Last Word", direction: "a SINGLE close portrait with a slow exhale and a satisfied, private smile, warm candle glow" },
    ],
  }),
  heat({
    id: "midnight-heist",
    label: "Midnight Heist",
    description: "Laser grids and vault steel; the subject planned every second of this.",
    aspectRatio: "16:9",
    artDirection: "a slick heist-thriller still series, laser grids and vault steel, cool cyan and warning red, black tactical couture, total composure",
    shots: [
      { label: "Laser Grid", direction: "a SINGLE frame contorting gracefully between red laser beams, perfectly calm, a smirk at the camera" },
      { label: "Vault Open", direction: "a SINGLE frame standing in an opened vault door, gold light spilling out, gloves being pulled off one finger at a time" },
      { label: "Diamonds in Hand", direction: "a SINGLE close frame letting a diamond necklace pour from one gloved hand to the other, eyes on the viewer" },
      { label: "Rooftop Getaway", direction: "a SINGLE wide frame on a rooftop edge at night, city lights below, sirens' glow far away, coat in the wind" },
      { label: "Toast to the Score", direction: "a SINGLE medium frame raising a glass of champagne in an empty penthouse, loot bag at their feet" },
    ],
  }),
  heat({
    id: "gothic-seduction",
    label: "Gothic Seduction",
    description: "Candle smoke, black lace, and a smile with a little too much tooth.",
    aspectRatio: "3:4",
    artDirection: "a gothic romance editorial, candlelit stone halls, black lace and deep burgundy velvet, pale moonlight, an alluring and slightly predatory mood",
    shots: [
      { label: "Candelabra", direction: "a SINGLE frame holding a lit candelabra in a dark corridor, candlelight catching the eyes, beckoning down the hall" },
      { label: "Stained Glass", direction: "a SINGLE full-length frame before a stained-glass window, colored light across a high-collared gown or frock coat" },
      { label: "Red Wine, Slow Sip", direction: "a SINGLE close frame taking a slow sip of dark red wine, eyes never leaving the lens" },
      { label: "On the Staircase", direction: "a SINGLE frame descending a grand stone staircase, one hand trailing the banister, train or coat-tails flowing" },
      { label: "Behind the Veil", direction: "a SINGLE close portrait behind a sheer black lace veil, lips curved in a secret smile" },
    ],
  }),
  heat({
    id: "corner-office",
    label: "Corner Office Dominance",
    description: "Forty floors up after midnight: power, intimidation, and a little cruelty.",
    aspectRatio: "16:9",
    artDirection: "a high-gloss power-dressing editorial in a glass-walled corner office at night, sharp tailoring, cold city lights, status games",
    shots: [
      { label: "Feet on the Desk", direction: "a SINGLE frame leaning back with polished shoes on a glass desk, city skyline behind, a patient predator's smile" },
      { label: "Contract and Pen", direction: "a SINGLE medium frame sliding a contract and a fountain pen toward the viewer, eyebrow raised" },
      { label: "Loosened Tie / Undone Cuff", direction: "a SINGLE three-quarter frame loosening a tie or unbuttoning a cuff at the window, night skyline glittering behind" },
      { label: "Looking Down", direction: "a SINGLE low-angle frame standing over the camera, arms folded, unimpressed, like the meeting is already over" },
      { label: "Lights Off", direction: "a SINGLE silhouette frame hitting the light switch on the way out, a final look over the shoulder" },
    ],
  }),
  heat({
    id: "morning-after",
    label: "Morning-After Wreckage",
    description: "Confetti, flat champagne, and dawn after a legendary night: glamorous, not sordid.",
    aspectRatio: "3:2",
    artDirection: "a staged editorial of the morning after a legendary party, a trashed luxury suite, spilled champagne and confetti, dawn light, fully dressed in last night's evening wear",
    shots: [
      { label: "Dawn at the Window", direction: "a SINGLE frame in last night's evening wear holding heels in one hand, watching sunrise through a wide hotel window" },
      { label: "Smudged Lipstick", direction: "a SINGLE close portrait with slightly smudged lipstick and mascara, a grin that says no regrets" },
      { label: "Sunglasses Indoors", direction: "a SINGLE frame sprawled in an armchair among empty bottles, oversized sunglasses on, coffee in hand" },
      { label: "The Note", direction: "a SINGLE medium frame reading a handwritten note left on the pillow, eyebrow raised, unreadable smile" },
      { label: "Walk of Fame", direction: "a SINGLE full-length frame striding down an empty hotel corridor at dawn, jacket over the shoulder, completely unashamed" },
    ],
  }),
  heat({
    id: "neon-predator",
    label: "Neon Predator",
    description: "Neon rain and slow menace; the subject is the hunter, never the prey.",
    aspectRatio: "9:16",
    artDirection: "a rain-soaked cyber-noir alley at night, magenta and cyan neon reflected in puddles, wet leather, steam, a calm and menacing presence",
    shots: [
      { label: "End of the Alley", direction: "a SINGLE full-body frame standing at the far end of a neon alley, head tilted, waiting" },
      { label: "Under the Umbrella", direction: "a SINGLE medium frame under a clear umbrella streaked with neon rain, eyes glowing with reflected light" },
      { label: "Hand on the Wall", direction: "a SINGLE close frame leaning one hand on a wet brick wall beside the lens, face close, a slow dangerous smile" },
      { label: "Rooftop Watcher", direction: "a SINGLE wide frame crouched on a rooftop ledge above the street, coat dripping, watching someone below" },
      { label: "Vanishing Point", direction: "a SINGLE frame walking away until steam and neon swallow the silhouette, one last look back" },
    ],
  }),
  heat({
    id: "forbidden-invitation",
    label: "Forbidden Invitation",
    description: "Gilded masks at a secret-society ball, where every guest brought something to hide.",
    aspectRatio: "16:9",
    artDirection: "an opulent masquerade at a secret-society gala, gilded masks, candlelit ballroom, black and gold couture, whispered intrigue",
    shots: [
      { label: "Mask Lifted", direction: "a SINGLE close frame lifting an ornate mask just enough to reveal the eyes, a conspiratorial look" },
      { label: "Across the Ballroom", direction: "a SINGLE wide frame across an empty candlelit ballroom after the guests have gone, the subject alone in the middle, looking straight into the lens" },
      { label: "Sealed Envelope", direction: "a SINGLE medium frame holding a wax-sealed black envelope between two fingers, offering it" },
      { label: "Behind the Curtain", direction: "a SINGLE frame half-hidden behind a heavy velvet curtain in a private alcove, beckoning with one finger" },
      { label: "Midnight Exit", direction: "a SINGLE full-length frame descending gala steps at midnight, mask in hand, cloak or gown trailing" },
    ],
  }),
  heat({
    id: "tables-turned",
    label: "Interrogation, Tables Turned",
    description: "One hard lamp, one steel table, and somehow they are the one asking the questions.",
    aspectRatio: "16:9",
    artDirection: "a tense interrogation-room still, a single hard overhead lamp, a dark observation window, cigarette haze, the subject unsettlingly in control",
    shots: [
      { label: "Under the Lamp", direction: "a SINGLE frame seated under a hard overhead lamp, leaning back, completely relaxed, smiling at the dark observation window" },
      { label: "Leaning Across", direction: "a SINGLE medium frame leaning across the steel table toward the lens, hands folded, quietly threatening" },
      { label: "Cuffs Off", direction: "a SINGLE close frame of the subject casually dangling an unlocked pair of handcuffs from one finger, eyebrow raised" },
      { label: "Through the Glass", direction: "a SINGLE frame standing close to the dark observation window, staring into it as if they can see everyone behind it" },
      { label: "Walking Out", direction: "a SINGLE full-body frame strolling out of the interrogation room, door swinging, never looking back" },
    ],
  }),
  heat({
    id: "poolside-temptation",
    label: "Poolside Temptation",
    description: "Turquoise glow at dusk, palm shadows, and a slow, glamorous resort-wear tease.",
    aspectRatio: "3:2",
    artDirection: "a sultry dusk poolside editorial at a modernist villa, glowing turquoise water, palm silhouettes, golden-hour skin highlights, designer resort wear and cover-ups",
    shots: [
      { label: "Edge of the Pool", direction: "a SINGLE frame sitting on the pool edge, feet in the glowing water, looking up at the lens over sunglasses" },
      { label: "Lounger Lean", direction: "a SINGLE three-quarter frame stretched on a lounger, sheer cover-up and sun hat, cocktail in hand" },
      { label: "Wet Hair Glance", direction: "a SINGLE close portrait with slicked-back wet hair and water droplets, a slow knowing look" },
      { label: "Cabana Curtain", direction: "a SINGLE frame drawing back a white cabana curtain, half in shadow, an unspoken invitation" },
      { label: "Night Swim", direction: "a SINGLE wide frame under underwater pool light at night, the subject at the far edge, rippling turquoise light, mysterious" },
    ],
  }),
];
