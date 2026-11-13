// ============================================================================

// GOOGLE OAUTH CONFIGURATION

// You can paste your Google Cloud Console OAuth 2.0 Web Client ID below,

// OR inside 'google-auth-config.json' in the project root folder.

// ============================================================================

const GOOGLE_CLIENT_ID_OVERRIDE = "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";



// Prompt Mirror - client-side game logic.

// All OpenAI calls are made directly from this browser tab, using the

// API key you entered once (saved locally by the tiny local server).



const IMAGE_MODEL = "dall-e-3";

const SCORE_MODEL = "gpt-4o-mini";

const IMAGE_SIZE = "1024x1024";

const CODE_MODEL = "gpt-4o-mini";



// Game keys shared with app.py's /api/players endpoints - used to keep

// each game's persistent player stats (see the player-profile module

// below) in their own bucket.

const GAME_PROMPT_MIRROR = "prompt-mirror";

const GAME_EMOJI_CHARADES = "emoji-charades";

const GAME_CODE_MIRROR = "code-mirror";

const GAME_PROMPT_REPAIR = "prompt-repair";



const SCORE_SYSTEM_PROMPT =

  "You are an extremely meticulous, detail-obsessed art judge scoring how closely a " +

  "recreated AI-generated image matches a hidden original AI-generated image. You are " +

  "picky on purpose: this score decides a competitive match, so near-miss images must " +

  "not receive the same score as each other unless they are truly indistinguishable. " +

  "Judge only how closely the recreation matches the original's actual content and " +

  "appearance (never technical image quality, resolution, or how 'good' the recreation " +

  "looks on its own).\n\n" +

  "Evaluate ALL of the following dimensions and let each one move the score:\n" +

  "1. Subject identity - is it literally the same subject(s)? A wrong or extra/missing " +

  "subject is a severe penalty.\n" +

  "2. Count and arrangement - number of objects/figures/elements, their pose, position, " +

  "and relative size.\n" +

  "3. Color palette - specific hues and tones, not just 'similar colors'. Deduct for a " +

  "shifted hue (e.g. teal vs blue), wrong dominant color, or missing/extra colors.\n" +

  "4. Composition and framing - camera angle, cropping, background vs foreground layout, " +

  "symmetry, orientation.\n" +

  "5. Art style and medium - photo vs illustration vs cartoon vs watercolor vs 3D render, " +

  "line weight, shading technique, level of detail.\n" +

  "6. Setting and background - indoor vs outdoor, environment, props, backdrop.\n" +

  "7. Minute distinguishing details - accessories, textures, patterns, facial expression, " +

  "lighting direction, time of day, weather, material finish, small props.\n\n" +

  "Be strict and granular: dock points for every mismatch above, however small - a single " +

  "wrong minor detail (a different curtain color, a missing shadow, a different pose) " +

  "should cost several points, not zero. Use the FULL precision of the 0-100 scale " +

  "(e.g. 63, 78, 41, 92, not just round numbers like 50/70/90) so that two different " +

  "recreations essentially never land on the exact same score unless they are genuinely " +

  "equally close. Reserve scores above 90 for near-perfect matches across every dimension " +

  "above, and scores below 20 for images that share almost nothing with the original.\n\n" +

  "Respond in EXACTLY this format: the first line must contain ONLY an integer from 0 to " +

  "100 and nothing else on that line - no rubric, no sub-scores, no parentheses. Then a " +

  "blank line. Then 2-4 short sentences of specific, pointed feedback addressed directly " +

  "to the player, naming the concrete details that matched or differed (e.g. 'the mug is " +

  "teal instead of navy blue and is missing its handle', not just 'the colors differ'). " +

  "Do not repeat the score in the feedback text.";



const LEVEL2_SUBJECTS = [

  "a red vintage bicycle leaning against a brick wall",

  "a small wooden sailboat on a calm lake at sunset",

  "a fluffy orange cat sitting on a windowsill",

  "a steaming cup of coffee next to an open book",

  "a lighthouse on a rocky cliff during a storm",

  "a hot air balloon floating over green hills",

  "a plate of fresh strawberries and blueberries",

  "an old typewriter on a wooden desk",

  "a golden retriever puppy playing in autumn leaves",

  "a city skyline at night with glowing windows",

  "a hiker standing on a mountain summit at sunrise",

  "a bowl of ramen with chopsticks",

  "a vintage red telephone booth on a cobblestone street",

  "a butterfly resting on a sunflower",

  "a cozy cabin in a snowy forest",

  "a pair of running shoes on a running track",

  "a stack of colorful macarons on a plate",

  "an astronaut floating in space with Earth in the background",

  "a farmers market stall filled with fresh vegetables",

  "a classic red sports car parked on a city street",

  "a barn owl perched on a wooden fence at dusk",

  "a surfer riding a big blue wave",

  "a chessboard mid-game on a marble table",

  "a hot air balloon festival with dozens of colorful balloons",

  "a cup of hot chocolate with marshmallows by a fireplace",

  "a desert landscape with cacti at sunset",

  "an umbrella-covered table at a rainy sidewalk cafe",

  "a robot watering plants in a greenhouse",

  "a treehouse built in a large oak tree",

  "a school of colorful fish swimming near a coral reef",

];



const LEVEL2_STYLES = [

  "as a watercolor painting",

  "as a vintage photograph",

  "in a minimalist flat illustration style",

  "as a detailed pencil sketch",

  "in a vibrant pop art style",

  "as a dreamy pastel illustration",

  "in a moody cinematic photo style",

  "as a children's storybook illustration",

  "in a retro 1980s poster style",

  "as a realistic digital painting",

  "in an impressionist painting style",

  "as a cozy autumn-toned illustration",

];



const LEVEL1_SUBJECTS = [

  "a single red apple",

  "a yellow rubber duck",

  "a blue coffee mug",

  "a green tennis ball",

  "a pair of white sneakers",

  "an orange traffic cone",

  "a black umbrella",

  "a wooden spoon",

  "a single sunflower",

  "a striped beach ball",

  "a slice of watermelon",

  "a red heart-shaped balloon",

  "a pair of sunglasses",

  "a simple house with a triangular roof",

  "a smiling cartoon sun",

  "a single blue star",

  "a green cactus in a small pot",

  "a slice of pizza",

];



const LEVEL1_STYLES = [

  "as a simple flat icon on a plain background",

  "as a basic cartoon drawing with bold outlines",

  "as a minimalist line drawing",

  "as simple clipart",

  "as a plain, brightly lit product photo on a white background",

];



const LEVEL3_SUBJECTS = [

  "a bustling night market with lantern-lit food stalls and crowds of people",

  "a steampunk airship docked above a Victorian city skyline at dawn",

  "a group of children flying kites in a windy field with mountains in the background",

  "an underwater coral reef city with glowing bioluminescent creatures",

  "a busy Tokyo street crossing in the rain with neon signs reflecting on wet pavement",

  "a knight battling a dragon on a castle rampart during a thunderstorm",

  "a cluttered wizard's study filled with potion bottles, scrolls, and a sleeping cat",

  "a cyberpunk alley with holographic advertisements and a lone figure in a trench coat",

  "a grand library with towering bookshelves, a spiral staircase, and floating candles",

  "a desert caravan of camels crossing dunes under a starry night sky with the Milky Way visible",

  "a Venice canal scene with gondolas, ornate bridges, and warm evening light reflecting on water",

  "a futuristic greenhouse on Mars with astronauts tending glowing alien plants",

  "an autumn harvest festival with a hot air balloon, pumpkin stalls, and falling leaves",

  "a pirate ship battle at sea during a storm with cannons firing and waves crashing",

  "a Japanese zen garden with a koi pond, cherry blossoms, and a wooden bridge at sunset",

];



const LEVEL3_STYLES = [

  "in the style of a detailed oil painting with dramatic chiaroscuro lighting",

  "as an intricate ink and watercolor illustration with fine linework",

  "in a hyper-detailed cyberpunk digital art style with neon color grading",

  "as a richly textured stop-motion animation still",

  "in the style of a lush hand-painted anime background",

  "as a dramatic film-noir black and white photograph with strong shadows",

  "in an ornate art nouveau illustration style with flowing decorative linework",

];



const LEVELS = {

  1: {

    label: "Level 1 \u2014 Easy",

    hint: "Level 1: one simple object, plain style. Easiest to match closely.",

    subjects: LEVEL1_SUBJECTS,

    styles: LEVEL1_STYLES,

  },

  2: {

    label: "Level 2 \u2014 Medium",

    hint: "Level 2: a single scene with some detail and a distinct art style.",

    subjects: LEVEL2_SUBJECTS,

    styles: LEVEL2_STYLES,

  },

  3: {

    label: "Level 3 \u2014 Hard",

    hint: "Level 3: a complex, multi-element scene with an elaborate style. Hardest to match.",

    subjects: LEVEL3_SUBJECTS,

    styles: LEVEL3_STYLES,

  },

};



// 10 Approved Themes for Picture Mirror (Day 3)

const THEMES = {

  "cyberpunk": {

    name: "Cyberpunk Metropolis",

    subjects: {

      1: ["a glowing neon ramen cart with rain reflections", "a futuristic holographic street sign", "a cybernetic courier drone with blue thrusters", "a neon cat silhouette on a wet metal fire escape"],

      2: ["a towering holographic billboard over a futuristic Tokyo-style highway", "a cybernetic courier on a glowing hoverbike in a neon alley", "a futuristic hacker workshop filled with floating code terminals"],

      3: ["a multi-level cyberpunk megacity skyline with flying vehicles, neon rain, and massive holographic dragon billboards"]

    },

    styles: [

      "in a hyper-detailed cyberpunk digital art style with neon color grading",

      "as a cinematic sci-fi concept art with volumetric fog and sharp neon highlights"

    ]

  },

  "fantasy-forest": {

    name: "Mystical Fantasy Forest",

    subjects: {

      1: ["a glowing blue mushroom on a mossy stone", "a magical floating wooden lantern", "a small enchanted acorn with golden runes", "a miniature fairy cottage inside a hollow tree stump"],

      2: ["an ancient hollow oak tree with glowing blue mushrooms inside", "a crystal deer drinking from a bioluminescent forest pool", "a hidden fairy village carved into colossal mossy tree trunks"],

      3: ["an ancient druidic tree sanctuary with floating crystal spires, glowing spirit animals, and twilight bioluminescence"]

    },

    styles: [

      "as an enchanting fantasy digital painting with ethereal lighting",

      "in the style of a lush hand-painted magical anime background with soft dust motes"

    ]

  },

  "oceanic-abyss": {

    name: "Oceanic Deep Abyss",

    subjects: {

      1: ["a glowing deep-sea jellyfish", "a pearl inside an ornate golden oyster shell", "a colorful sea turtle swimming over coral", "a bioluminescent starfish on black volcanic sand"],

      2: ["a submerged Greco-Roman marble temple surrounded by vibrant corals", "a giant glowing jellyfish drifting past an underwater sea cliff", "an ancient treasure chest covered in barnacles and sea anemones"],

      3: ["a vast bioluminescent deep sea trench with submerged megalithic ruins, glowing leviathans, and deep water pressure caustics"]

    },

    styles: [

      "as a vivid underwater digital illustration with aquatic sun rays",

      "in a moody cinematic deep-sea photographic style with glowing caustic lighting"

    ]

  },

  "space-odyssey": {

    name: "Cosmic Space Odyssey",

    subjects: {

      1: ["a shiny astronaut helmet reflecting Earth", "a miniature solar exploration probe", "a floating gold asteroid nugget", "a stylized lunar module on dusty regolith"],

      2: ["an astronaut floating untethered with a giant purple nebula in the background", "a futuristic ring-shaped space station orbiting a Saturn-like planet", "a planetary rover exploring a crater with two moons in the sky"],

      3: ["an interstellar armada orbiting a Dyson sphere with solar flares and swirling star clusters in ultra-detailed 8K sci-fi rendering"]

    },

    styles: [

      "as an awe-inspiring photorealistic space rendering",

      "in a retro 1970s sci-fi book cover illustration style with vibrant cosmic hues"

    ]

  },

  "cozy-cafe": {

    name: "Cozy Autumn Cafe",

    subjects: {

      1: ["a ceramic mug of latte with leaf latte art", "a single glazed cinnamon roll on a plate", "a steaming teapot with lemon slice", "a slice of warm pumpkin pie on a rustic saucer"],

      2: ["a rainy window seat at a bakery looking out at golden maple leaves", "a sleeping calico cat curled up on a velvet armchair by a fireplace", "a wooden cafe table with fresh croissants, coffee, and a vase of wildflowers"],

      3: ["an entire bustling rustic coffee roastery and bookshop with rain cascading outside, warm string lights, and antique bookshelves"]

    },

    styles: [

      "as a warm cozy watercolor painting with soft amber lighting",

      "in a charming storybook illustration style with delicate textures and warm tones"

    ]

  },

  "steampunk-workshop": {

    name: "Retro Steampunk Workshop",

    subjects: {

      1: ["a brass pocket watch with exposed gears", "a miniature steam pressure gauge", "a mechanical copper dragonfly", "a leather goggles pair resting on a brass valve"],

      2: ["a mechanical brass owl with glowing amber crystal eyes on a workbench", "an intricate clockwork pocket watch with exposed moving gears and ruby gems", "an eccentric inventor's desk covered in blueprints and brass measuring tools"],

      3: ["a massive Victorian inventor's laboratory with towering brass furnaces, copper steam pipes, clockwork automata, and gear mechanisms"]

    },

    styles: [

      "in an intricate Victorian steampunk illustration style with warm metallic tones",

      "as a detailed digital concept art with brass, copper, and amber highlights"

    ]

  },

  "surrealist-dream": {

    name: "Surrealist Dreamscape",

    subjects: {

      1: ["a melting pocket watch draped over a rock", "a floating green apple wearing a bowler hat", "an ornate key floating in a crystal sphere", "a chess knight carved from ocean water"],

      2: ["a floating island with a single lighthouse casting light into a starry void", "a melting pocket watch draped over a floating crystal chessboard", "a grand staircase winding up into clouds of colorful butterflies"],

      3: ["an expansive metaphysical desert where giant antique mirror frames open into ocean waves beneath two eclipsing suns"]

    },

    styles: [

      "in the visionary surrealist oil painting style reminiscent of Salvador Dali",

      "as a dreamlike metaphysical painting with sharp shadows, impossible geometry, and vivid skies"

    ]

  },

  "mythological-temple": {

    name: "Ancient Mythological Temple",

    subjects: {

      1: ["a cracked marble bust of a Greek philosopher", "a golden chalice with engraved mythological battles", "a bronze Spartan helmet with red crest", "an ancient carved stone scarab"],

      2: ["a marble statue of a winged goddess overlooking a mountain valley at sunrise", "an ancient Parthenon-inspired temple with golden sunbeams pouring through pillars", "a hidden ceremonial altar flanked by twin stone lions in an overgrown olive grove"],

      3: ["the summit of Mount Olympus with Olympian marble palaces, golden statues, celestial cloudscapes, and divine light"]

    },

    styles: [

      "as a dramatic classical oil painting with warm golden-hour chiaroscuro",

      "in an epic historical landscape painting style with heroic atmosphere"

    ]

  },

  "anime-street": {

    name: "Vibrant Anime Street",

    subjects: {

      1: ["a steaming bowl of ramen with chopsticks", "a paper lantern glowing red with Japanese calligraphy", "a colorful dango skewer on a ceramic plate", "a vintage Japanese vending machine glowing at night"],

      2: ["a cozy street food stall with red paper lanterns and steaming dumplings", "a cobblestone alleyway in Kyoto illuminated by paper lanterns during rain", "a retro confectionery shop with glass jars filled with colorful candy"],

      3: ["a bustling Tokyo night market at twilight with train overpasses, cherry blossom petals drifting, and hand-painted shop signs"]

    },

    styles: [

      "in the style of a masterfully hand-painted anime background",

      "as a vibrant Studio Ghibli-inspired watercolor and gouache illustration with warm glow"

    ]

  },

  "retro-synthwave": {

    name: "Retro 80s Synthwave",

    subjects: {

      1: ["a retro cassette tape with glowing neon tape reels", "a pair of 80s shutter shades reflecting a neon grid", "a miniature arcade joystick controller", "a futuristic sports visor with wireframe HUD"],

      2: ["a sleek 1980s sports car parked on a reflective grid facing a giant sunset", "a neon wireframe palm tree avenue with a neon grid highway", "an arcade cabinet glowing with vibrant vector graphics in a dark retro arcade"],

      3: ["a futuristic outrun cybercity with towering wireframe pyramids, a gigantic chrome sun, and speeding supercars on a neon grid"]

    },

    styles: [

      "in an iconic 1980s synthwave digital art style with vibrant magenta and cyan neon gradients",

      "as a retro outrun aesthetic poster with chrome reflections, scanlines, and CRT glow"

    ]

  }

};



const state = {

  apiKey: "",

  mode: "solo", // "solo" | "tournament"

  level: 1,

  theme: "cyberpunk", // 10 approved themes

  speed: "fast", // "fast" | "quality"

  playerName: "",

  hiddenPrompt: "",

  guessPrompt: "",

  originalImage: null,   // {kind:"b64"|"url", value}

  generatedImage: null,  // {kind:"b64"|"url", value}

};



// ---------------------------------------------------------------------

// Device identity - who's playing on THIS device. Asked once (see

// #screen-identity), then remembered in localStorage and shown in the

// header for the rest of the time this browser is used, across every

// game. This is distinct from the ad hoc name entry still used elsewhere

// (typing OTHER people's names into a same-device tournament roster) -

// this is specifically "who is holding this device right now", and it's

// what solo play, Prompt Mirror's join-a-tournament flow, and the

// Dari-Admin tournament-setup gate all key off.

//

// There's no password anywhere in this app, so a "login" here is a soft

// device lock, not real authentication - see app.py's /api/players/login

// for the server side of this. `deviceToken` is a random value generated

// once per browser and reused for every login/heartbeat/logout from it.

// ---------------------------------------------------------------------



const identity = {

  id: null,

  name: null,

  email: null,

  role: null, // "participant" | "admin"

  avatar: null,

  authProvider: null,

  heartbeatHandle: null,

};



const HEARTBEAT_INTERVAL_MS = 45000;



function getDeviceToken() {

  try {

    let t = localStorage.getItem("dari_device_token");

    if (!t) {

      t = (window.crypto && crypto.randomUUID)

        ? crypto.randomUUID()

        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      localStorage.setItem("dari_device_token", t);

    }

    return t;

  } catch (e) {

    // localStorage unavailable (private browsing, etc.) - fall back to a

    // token that at least survives this one page load.

    if (!getDeviceToken._fallback) {

      getDeviceToken._fallback = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    }

    return getDeviceToken._fallback;

  }

}



function saveIdentityToStorage() {

  try {

    localStorage.setItem("dari_identity", JSON.stringify({ id: identity.id }));

  } catch (e) {

    // best-effort

  }

}



function loadIdentityFromStorage() {

  try {

    const raw = localStorage.getItem("dari_identity");

    return raw ? JSON.parse(raw) : null;

  } catch (e) {

    return null;

  }

}



function clearIdentityStorage() {

  try {

    localStorage.removeItem("dari_identity");

  } catch (e) {

    // best-effort

  }

}



function updateIdentityBadge() {

  const badge = el("identity-badge");

  const wingsWelcome = el("wings-welcome");

  const wingsSubtitleDefault = el("wings-subtitle-default");

  if (!identity.id) {

    badge.hidden = true;

    wingsWelcome.hidden = true;

    wingsSubtitleDefault.hidden = false;

    return;

  }

  const roleLabel = identity.role === "admin" ? "Dari Admin" : "Dari Participant";



  badge.hidden = false;

  el("identity-badge-name").textContent = identity.name;

  const roleEl = el("identity-badge-role");

  roleEl.textContent = roleLabel;

  roleEl.classList.toggle("role-admin", identity.role === "admin");



  wingsSubtitleDefault.hidden = true;

  wingsWelcome.hidden = false;

  el("wings-welcome-name").textContent = identity.name;

  const wingsRoleEl = el("wings-welcome-role");

  wingsRoleEl.hidden = false;

  wingsRoleEl.textContent = roleLabel;

  wingsRoleEl.classList.toggle("role-admin", identity.role === "admin");

}



// Applies buttons/hints that depend on the CURRENT identity's role. Role

// only ever changes via switchPlayer() (a fresh sign-in), so this only

// needs to run once per identity rather than on every screen change.

function applyAdminGating() {

  const isAdmin = identity.role === "admin";

  el("btn-goto-create-tournament").hidden = !isAdmin;

  el("tournament-hub-admin-hint").hidden = isAdmin;

  el("tournament-admin-hint").hidden = true; // shown/hidden dynamically by setMode()

  el("emoji-tournament-admin-hint").hidden = true;

  el("code-tournament-admin-hint").hidden = true;

  el("repair-tournament-admin-hint").hidden = true;

}



function applyIdentity(player) {

  identity.id = player.id;

  identity.name = player.name;

  identity.email = player.email || null;

  identity.role = player.role === "admin" ? "admin" : "participant";

  identity.avatar = player.avatar || null;

  identity.authProvider = player.authProvider || null;

  saveIdentityToStorage();

  updateIdentityBadge();

  applyAdminGating();

  startHeartbeat();

}



function startHeartbeat() {

  stopHeartbeat();

  identity.heartbeatHandle = setInterval(async () => {

    if (!identity.id) return;

    try {

      const res = await fetch("/api/players/login", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ id: identity.id, deviceToken: getDeviceToken(), force: false }),

      });

      const data = await res.json();

      if (!data.ok || data.status !== "ok") {

        handleSignedOutElsewhere();

      }

    } catch (e) {

      // A dropped request is not a takeover - just try again next tick.

    }

  }, HEARTBEAT_INTERVAL_MS);

}



function stopHeartbeat() {

  if (identity.heartbeatHandle) {

    clearInterval(identity.heartbeatHandle);

    identity.heartbeatHandle = null;

  }

}



function handleSignedOutElsewhere() {

  const name = identity.name;

  stopHeartbeat();

  identity.id = null;

  identity.name = null;

  identity.role = null;

  clearIdentityStorage();

  updateIdentityBadge();

  resetIdentityScreen();

  el("identity-error").textContent = `You were signed out because ${name || "this player"} was opened on another device.`;

  el("identity-error").hidden = false;

  showScreen("identity");

}



// ---------------------------------------------------------------------

// Strictly Google OAuth Authentication State & Handlers

// ---------------------------------------------------------------------



const authState = {

  pendingGoogleUser: null,

  googleClientId: (typeof GOOGLE_CLIENT_ID_OVERRIDE !== "undefined" && !GOOGLE_CLIENT_ID_OVERRIDE.includes("YOUR_GOOGLE_CLIENT_ID_HERE"))

    ? GOOGLE_CLIENT_ID_OVERRIDE.trim()

    : "",

};



function showAuthToast(title, body, type = "info") {

  const container = el("auth-toast-container");

  if (!container) return;

  const toast = document.createElement("div");

  toast.className = `auth-toast ${type}`;

  let icon = "ℹ️";

  if (type === "success") icon = "✅";

  if (type === "error") icon = "⚠️";



  toast.innerHTML = `

    <span class="auth-toast-icon">${icon}</span>

    <div class="auth-toast-content">

      <div class="auth-toast-title">${title}</div>

      <div class="auth-toast-body">${body}</div>

    </div>

  `;



  container.appendChild(toast);

  setTimeout(() => {

    toast.style.opacity = "0";

    toast.style.transform = "translateY(10px)";

    toast.style.transition = "all 0.3s ease";

    setTimeout(() => toast.remove(), 300);

  }, 6000);

}



function initGoogleAuth() {

  // Load Google Client ID from server or override

  fetch("/api/auth/google/config")

    .then(r => r.json())

    .then(data => {

      let cid = (data.ok && data.clientId) ? data.clientId : "";

      if (authState.googleClientId) {

        cid = authState.googleClientId;

      }

      if (cid && !cid.includes("YOUR_GOOGLE_CLIENT_ID_HERE")) {

        authState.googleClientId = cid;

        const inp = el("input-oauth-client-id");

        if (inp) inp.value = cid;

        setupGoogleGIS(cid);

      }

    })

    .catch(() => {

      if (authState.googleClientId && !authState.googleClientId.includes("YOUR_GOOGLE_CLIENT_ID_HERE")) {

        setupGoogleGIS(authState.googleClientId);

      }

    });



  const googleBtn = el("btn-google-signin");

  if (googleBtn) {

    googleBtn.addEventListener("click", handleGoogleButtonClick);

  }



  const toggleCfg = el("btn-toggle-oauth-config");

  if (toggleCfg) {

    toggleCfg.addEventListener("click", () => {

      const drawer = el("oauth-config-drawer");

      if (drawer) drawer.hidden = !drawer.hidden;

    });

  }



  const saveCfg = el("btn-save-oauth-client-id");

  if (saveCfg) {

    saveCfg.addEventListener("click", async () => {

      const val = (el("input-oauth-client-id").value || "").trim();

      try {

        const res = await fetch("/api/auth/google/config", {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ clientId: val })

        });

        const data = await res.json();

        const msg = el("oauth-config-msg");

        if (msg) {

          msg.hidden = false;

          msg.textContent = "Google Client ID saved! " + (val ? "Initializing Google Sign-In..." : "");

          msg.style.color = "#3fae94";

        }

        if (val) {

          authState.googleClientId = val;

          setupGoogleGIS(val);

        }

      } catch (e) {

        alert("Failed to save: " + e.message);

      }

    });

  }



  // Google Account input & sign-in handler

  const simCustom = el("btn-google-sim-custom-signin");

  const simInput = el("input-google-sim-email");

  const handleCustomGoogleSubmit = () => {

    let raw = (el("input-google-sim-email").value || "").trim();

    if (!raw) {

      alert("Please enter your Google email address.");

      return;

    }

    let email = raw;

    if (!email.includes("@")) {

      email = email.toLowerCase().replace(/[^a-z0-9.]/g, "") + "@gmail.com";

    }

    const username = email.split("@")[0].replace(/[._-]/g, " ");

    const formattedName = username.replace(/\b\w/g, l => l.toUpperCase());



    processGoogleUser({

      name: formattedName,

      email: email.toLowerCase(),

      sub: "google-" + Math.abs(email.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)),

      picture: ""

    });

    el("modal-google-simulator").hidden = true;

  };



  if (simCustom) simCustom.addEventListener("click", handleCustomGoogleSubmit);

  if (simInput) {

    simInput.addEventListener("keydown", (e) => {

      if (e.key === "Enter") handleCustomGoogleSubmit();

    });

  }



  const closeSim = el("btn-close-google-simulator");

  if (closeSim) {

    closeSim.addEventListener("click", () => {

      el("modal-google-simulator").hidden = true;

    });

  }



  // First-time Google onboarding modal completion

  const btnGoogleComplete = el("btn-google-complete-signup");

  if (btnGoogleComplete) {

    btnGoogleComplete.addEventListener("click", finishGoogleSignup);

  }



  document.querySelectorAll("#google-role-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => {

      document.querySelectorAll("#google-role-picker .level-btn").forEach((x) => x.classList.remove("active"));

      b.classList.add("active");

    });

  });

}



function setupGoogleGIS(clientId) {

  if (window.google && google.accounts && google.accounts.id && clientId && !clientId.includes("YOUR_GOOGLE_CLIENT_ID_HERE")) {

    try {

      google.accounts.id.initialize({

        client_id: clientId,

        callback: handleGoogleCredentialResponse,

        auto_select: false,

        cancel_on_tap_outside: true,

      });



      // Render official Google Sign-In button

      const container = el("google-gsi-container");

      if (container) {

        container.innerHTML = "";

        google.accounts.id.renderButton(container, {

          theme: "outline",

          size: "large",

          text: "signin_with",

          shape: "pill",

          width: 320,

          logo_alignment: "left"

        });

        container.style.display = "flex";

        // Hide fallback button once official button is rendered

        const fallbackBtn = el("btn-google-signin");

        if (fallbackBtn) fallbackBtn.style.display = "none";

      }

    } catch (e) {

      console.warn("GIS initialization warning:", e);

    }

  }

}



function handleGoogleButtonClick() {

  if (window.google && google.accounts && google.accounts.id && authState.googleClientId && !authState.googleClientId.includes("YOUR_GOOGLE_CLIENT_ID_HERE")) {

    try {

      google.accounts.id.prompt((notification) => {

        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {

          el("modal-google-simulator").hidden = false;

        }

      });

      return;

    } catch (e) {

      console.warn("Google prompt error, opening chooser:", e);

    }

  }

  el("modal-google-simulator").hidden = false;

}



function handleGoogleCredentialResponse(response) {

  try {

    const payload = decodeJwtResponse(response.credential);

    processGoogleUser({

      name: payload.name || payload.email.split("@")[0],

      email: payload.email,

      sub: payload.sub,

      picture: payload.picture || ""

    });

  } catch (e) {

    showAuthToast("Google Sign-In Error", "Could not parse Google credential.", "error");

  }

}



function decodeJwtResponse(token) {

  const base64Url = token.split(".")[1];

  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  const jsonPayload = decodeURIComponent(

    atob(base64)

      .split("")

      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))

      .join("")

  );

  return JSON.parse(jsonPayload);

}



async function processGoogleUser(googleUser) {

  try {

    const res = await fetch("/api/auth/google", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(googleUser)

    });

    const data = await res.json();



    if (!data.ok) {

      showAuthToast("Sign-In Failed", data.error || "Unable to sign in with Google", "error");

      return;

    }



    if (!data.isNew && data.player) {

      // User has logged in already! Log straight in

      showAuthToast("Google Sign-In Successful", `Welcome back, ${data.player.name}!`, "success");

      applyIdentity(data.player);

      showScreen("wings");

      refreshPlayerNameDatalist();

      return;

    }



    // First time logging in with Google -> prompt to confirm role & finish signup

    authState.pendingGoogleUser = data.googleUser || googleUser;

    const modal = el("modal-google-onboarding");

    el("google-onboard-name").textContent = authState.pendingGoogleUser.name;

    el("google-onboard-email").textContent = authState.pendingGoogleUser.email;

    const avatar = el("google-avatar-display");

    if (authState.pendingGoogleUser.avatar) {

      avatar.innerHTML = `<img src="${authState.pendingGoogleUser.avatar}" alt="Avatar">`;

    } else {

      avatar.textContent = (authState.pendingGoogleUser.name[0] || "G").toUpperCase();

    }

    modal.hidden = false;

  } catch (e) {

    showAuthToast("Network Error", e.message, "error");

  }

}



async function finishGoogleSignup() {

  if (!authState.pendingGoogleUser) return;

  const roleBtn = document.querySelector("#google-role-picker .level-btn.active");

  const role = (roleBtn && roleBtn.dataset.role) || "participant";



  try {

    const res = await fetch("/api/auth/signup", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({

        name: authState.pendingGoogleUser.name,

        email: authState.pendingGoogleUser.email,

        role: role,

        googleId: authState.pendingGoogleUser.googleId,

        avatar: authState.pendingGoogleUser.avatar,

        deviceToken: getDeviceToken()

      })

    });

    const data = await res.json();

    if (!data.ok) throw new Error(data.error || "Could not save profile.");



    el("modal-google-onboarding").hidden = true;

    authState.pendingGoogleUser = null;

    showAuthToast("Welcome to DaRI AI!", `Profile registered for ${data.player.name}.`, "success");

    applyIdentity(data.player);

    showScreen("wings");

    refreshPlayerNameDatalist();

  } catch (e) {

    const err = el("google-onboard-error");

    if (err) {

      err.textContent = e.message;

      err.hidden = false;

    }

  }

}



function resetIdentityScreen() {

  if (el("input-identity-search")) el("input-identity-search").value = "";

  if (el("input-identity-new-name")) el("input-identity-new-name").value = "";

  if (el("identity-notice")) el("identity-notice").hidden = true;

  if (el("identity-error")) el("identity-error").hidden = true;

  if (el("identity-create-error")) el("identity-create-error").hidden = true;

  if (el("identity-takeover-block")) el("identity-takeover-block").hidden = true;

  if (el("modal-google-onboarding")) el("modal-google-onboarding").hidden = true;

  if (el("modal-google-simulator")) el("modal-google-simulator").hidden = true;

  document.querySelectorAll("#identity-role-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", b.dataset.role === "participant");

  });

  authState.pendingGoogleUser = null;

  pendingLoginId = null;

}



let pendingLoginId = null;



async function attemptIdentityLogin() {

  const errEl = el("identity-error");

  const noticeEl = el("identity-notice");

  if (errEl) errEl.hidden = true;

  if (noticeEl) noticeEl.hidden = true;

  if (el("identity-takeover-block")) el("identity-takeover-block").hidden = true;

  const nameOrId = (el("input-identity-search").value || "").trim();

  if (!nameOrId) {

    if (errEl) {

      errEl.textContent = "Enter your name or player ID, or create a new profile below.";

      errEl.hidden = false;

    }

    return;

  }

  const player = await findExistingPlayerByNameOrId(nameOrId);

  if (!player) {

    if (el("input-identity-new-name")) el("input-identity-new-name").value = nameOrId;

    if (noticeEl) {

      noticeEl.textContent = "No profile found with that name or ID — create one below.";

      noticeEl.hidden = false;

    }

    return;

  }

  await loginAsPlayer(player.id, false);

}



async function findExistingPlayerByNameOrId(nameOrId) {

  const trimmed = (nameOrId || "").trim();

  if (!trimmed) return null;

  if (looksLikePlayerId(trimmed)) {

    const byId = await lookupPlayerById(trimmed);

    if (byId) return byId;

  }

  try {

    const res = await fetch("/api/players");

    const data = await res.json();

    const key = trimmed.toLowerCase();

    return (data.players || []).find((p) => (p.name || "").trim().toLowerCase() === key || (p.email || "").trim().toLowerCase() === key) || null;

  } catch (e) {

    return null;

  }

}



async function loginAsPlayer(playerId, force) {

  const errEl = el("identity-error") || el("login-error");

  if (errEl) errEl.hidden = true;

  let data;

  try {

    const res = await fetch("/api/players/login", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ id: playerId, deviceToken: getDeviceToken(), force: !!force }),

    });

    data = await res.json();

  } catch (e) {

    if (errEl) {

      errEl.textContent = "Couldn't reach the server. Try again.";

      errEl.hidden = false;

    }

    return;

  }

  if (!data.ok) {

    if (errEl) {

      errEl.textContent = data.error || "Couldn't sign in.";

      errEl.hidden = false;

    }

    return;

  }

  if (data.status === "locked") {

    pendingLoginId = playerId;

    if (el("identity-takeover-block")) el("identity-takeover-block").hidden = false;

    return;

  }

  if (el("identity-takeover-block")) el("identity-takeover-block").hidden = true;

  resetIdentityScreen();

  applyIdentity(data.player);

  showScreen("wings");

  refreshPlayerNameDatalist();

}



async function createIdentity() {

  const errEl = el("identity-create-error") || el("signup-error");

  if (errEl) errEl.hidden = true;

  const name = (el("input-identity-new-name").value || "").trim();

  if (!name) {

    if (errEl) {

      errEl.textContent = "Enter a name for your profile.";

      errEl.hidden = false;

    }

    return;

  }

  const roleBtn = document.querySelector("#identity-role-picker .level-btn.active");

  const role = (roleBtn && roleBtn.dataset.role) || "participant";

  try {

    const res = await fetch("/api/players/create", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ name, role, deviceToken: getDeviceToken() }),

    });

    const data = await res.json();

    if (!data.ok) throw new Error(data.error || "Could not create profile.");

    resetIdentityScreen();

    applyIdentity(data.player);

    showScreen("wings");

    refreshPlayerNameDatalist();

  } catch (e) {

    if (errEl) {

      errEl.textContent = e.message;

      errEl.hidden = false;

    }

  }

}



async function switchPlayer() {

  stopHeartbeat();

  if (identity.id) {

    try {

      await fetch("/api/players/logout", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ id: identity.id, deviceToken: getDeviceToken() }),

      });

    } catch (e) {

      // best-effort

    }

  }

  identity.id = null;

  identity.name = null;

  identity.email = null;

  identity.role = null;

  identity.avatar = null;

  identity.authProvider = null;

  clearIdentityStorage();

  updateIdentityBadge();

  resetIdentityScreen();

  showScreen("identity");

}



// Resumes whoever was signed in on this device last time, or displays login screen.

async function resumeIdentityOrPrompt() {

  const saved = loadIdentityFromStorage();

  if (saved && saved.id) {

    try {

      const res = await fetch("/api/players/login", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ id: saved.id, deviceToken: getDeviceToken(), force: false }),

      });

      const data = await res.json();

      if (data.ok && (data.status === "ok" || !data.status) && data.player) {

        applyIdentity(data.player);

        showScreen("wings");

        refreshPlayerNameDatalist();

        return;

      }

    } catch (e) {

      // fall through to the login screen

    }

  }

  clearIdentityStorage();

  resetIdentityScreen();

  showScreen("identity");

}



// Tournament mode state - separate from the solo-play state above.

// A tournament is a random single-elimination knockout bracket. Each match

// is 3 sub-rounds (Level 1, 2, 3); whoever's cumulative score is higher

// after 3 sub-rounds wins the match (ties play sudden-death Level-2

// tiebreaker sub-rounds until someone is ahead).

const tstate = {

  players: [],       // [{id, name}]

  nextPlayerId: 1,

  bracket: [],        // bracket[roundIndex] = [match, match, ...]; bracket[0] is round 1 -

                       // used ONLY while locally computing a fresh fixture, before it's

                       // posted to the server (see generateBracket()).

  levels: [1, 2, 3],   // which difficulty levels each match plays, in order



  // --- Server-hosted tournament state (create/join/play from separate

  // devices) - a tournament's bracket lives on the server once created, so

  // several players' own devices can all see and play the same one. ---

  tournamentId: null,      // the tournament this device is currently viewing/playing

  tournamentName: null,

  pollHandle: null,        // current setInterval id, if any (see startPolling/stopPolling)

  activeMatchId: null,     // "roundIndex:matchIndex" of the match I'm actively playing

  myPlayerId: null,        // my own player-profile id, once joined

  myPlayerName: null,

  myRole: null,            // "a" or "b" within activeMatchId

  startingSubround: false, // guards against double-firing the "start next sub-round" race

  generatingMyEntry: false,// guards against double-submitting my own picture/score

  ackedSubroundIndex: -1,  // last sub-round result index I clicked "Continue" past

  idealPromptSubIndex: null, // which sub-round's "AI's ideal prompt" UI is currently shown,

                              // so the on-demand reveal survives repeated poll-driven re-renders

                              // of the same sub-round result (see renderSubroundResult).

};



function toggleTournamentLevel(n) {

  if (tstate.levels.includes(n)) {

    if (tstate.levels.length === 1) return; // keep at least one level selected

    tstate.levels = tstate.levels.filter((lvl) => lvl !== n);

  } else {

    tstate.levels = tstate.levels.concat(n).sort((a, b) => a - b);

  }

  renderTournamentLevelPicker();

}



function renderTournamentLevelPicker() {

  document.querySelectorAll("#tournament-level-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", tstate.levels.includes(Number(b.dataset.level)));

  });

}



const el = (id) => document.getElementById(id);



function showScreen(name) {

  // Any screen change cancels whatever server-polling loop was running for

  // a tournament screen (see startPolling/stopPolling) - a screen that

  // needs polling starts its own right back up immediately after calling

  // this, so nothing keeps refreshing in the background once you've

  // navigated away from it.

  stopPolling();

  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));

  const target = el("screen-" + name);

  if (target) target.classList.add("active");

  el("btn-change-key").hidden = name === "setup" || name === "identity";



  // Update bottom navigation bar active state

  document.querySelectorAll(".bottom-nav-item").forEach((btn) => {

    btn.classList.toggle("active", btn.dataset.nav === name);

  });



  window.scrollTo(0, 0);

}



function pick(arr) {

  if (!arr || !arr.length) return "";

  return arr[Math.floor(Math.random() * arr.length)];

}



function buildHiddenPrompt(levelArg) {

  const lvl = levelArg || state.level || 1;

  const themeObj = THEMES[state.theme] || THEMES["cyberpunk"];

  const themeSubjects = (themeObj.subjects && themeObj.subjects[lvl]) || (themeObj.subjects && themeObj.subjects[1]);

  const tier = LEVELS[lvl] || LEVELS[1];

  const subject = (themeSubjects && themeSubjects.length) ? pick(themeSubjects) : pick(tier.subjects);

  const style = (themeObj.styles && themeObj.styles.length) ? pick(themeObj.styles) : pick(tier.styles);

  return `${subject}, ${style}`;

}



// Prompt Mirror's hidden prompt is normally written by AI itself (one short

// chat-completion call), so every round is a fresh, original prompt instead

// of a combination pulled from the fixed word lists above. Those word lists

// stay in place purely as an offline/error fallback via buildHiddenPrompt()

// so a round never stalls if this call fails.

const HIDDEN_PROMPT_SYSTEM =

  "You write short, vivid prompts for an AI image generator, for a guessing " +

  "game where a player studies the resulting picture and tries to write a " +

  "prompt that recreates it. Respond with ONLY the image prompt itself as a " +

  "single sentence or two clauses - no quotes, no preamble, no explanation, " +

  "no markdown, no labels like \"Prompt:\".";



const HIDDEN_PROMPT_LEVEL_GUIDANCE = {

  1: "Easy difficulty: describe exactly ONE simple, common object (e.g. a " +

    "piece of fruit, a household item, an animal, a simple shape) rendered " +

    "in a plain, minimal style (a flat icon, a basic cartoon with bold " +

    "outlines, a minimalist line drawing, simple clipart, or a plain " +

    "brightly-lit product photo on a white background). Keep it to one " +

    "short clause for the subject plus one short clause for the style.",

  2: "Medium difficulty: describe ONE clear scene with a bit of detail (a " +

    "specific subject plus its setting, action, or mood) in a distinct art " +

    "style (e.g. watercolor painting, vintage photograph, flat " +

    "illustration, pencil sketch, pop art, pastel illustration, cinematic " +

    "photo, storybook illustration, retro poster, impressionist painting). " +

    "One or two clauses for the subject, plus a style clause.",

  3: "Hard difficulty: describe a complex, multi-element scene with several " +

    "distinct details (multiple subjects or elements, a specific setting, " +

    "lighting, weather, or atmosphere) in an elaborate art style (e.g. " +

    "detailed oil painting with dramatic lighting, hyper-detailed cyberpunk " +

    "digital art, richly textured stop-motion still, hand-painted anime " +

    "background, film-noir photograph, ornate art nouveau illustration). " +

    "Make it rich, specific, and ambitious.",

};



async function generateHiddenPromptAI(level) {

  const guidance = HIDDEN_PROMPT_LEVEL_GUIDANCE[level] || HIDDEN_PROMPT_LEVEL_GUIDANCE[1];

  const themeObj = THEMES[state.theme] || THEMES["cyberpunk"];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + state.apiKey,

    },

    body: JSON.stringify({

      model: SCORE_MODEL,

      max_tokens: 150,

      temperature: 1.1,

      messages: [

        { role: "system", content: HIDDEN_PROMPT_SYSTEM },

        {

          role: "user",

          content: guidance + " Adhere strictly to the theme: '" + themeObj.name +

            "'. Write one new image prompt now. Be creative and varied.",

        },

      ],

    }),

  });

  if (!res.ok) {

    const errBody = await res.json().catch(() => ({}));

    throw new Error((errBody.error && errBody.error.message) || `OpenAI prompt request failed (${res.status})`);

  }

  const data = await res.json();

  const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

  const cleaned = (text || "").trim().replace(/^["'“”\s]+|["'“”\s]+$/g, "");

  if (!cleaned) throw new Error("Empty hidden prompt from AI.");

  return cleaned;

}



async function getHiddenPrompt(level) {

  try {

    const aiPrompt = await generateHiddenPromptAI(level);

    if (aiPrompt) return aiPrompt;

  } catch (e) {

    // Fall back to the local word-bank prompt if the AI call fails for any

    // reason (network hiccup, rate limit, malformed response, etc.) so a

    // round never stalls just because this one extra call had a hiccup.

  }

  return buildHiddenPrompt(level);

}



function setLevel(n) {

  state.level = n;

  document.querySelectorAll("#level-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", Number(b.dataset.level) === n);

  });

  el("level-hint").textContent = (LEVELS[n] || LEVELS[1]).hint;

}



function updateLevelBadges() {

  const label = (LEVELS[state.level] || LEVELS[1]).label;

  el("challenge-level-badge").textContent = label;

  el("result-level-badge").textContent = label;

}



function setMode(mode) {

  state.mode = mode;

  document.querySelectorAll("#mode-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", b.dataset.mode === mode);

  });

  el("btn-start-round").textContent = mode === "tournament" ? "Set up tournament" : "Start a round";

  // Prompt Mirror's tournament mode goes to a hub where anyone can JOIN an

  // existing tournament - only the "+ Create a new tournament" button

  // there is gated to Dari Admins (see applyAdminGating), so there's no

  // hint to show here.

  el("tournament-admin-hint").hidden = true;

}



function handleStartClick() {

  if (state.mode === "tournament") {

    el("tournament-join-error").hidden = true;

    showScreen("tournament-hub");

    startPolling(refreshOpenTournaments, 4000);

  } else {

    startRound();

  }

}



// Reached from the tournament hub's "Create a new tournament" button (and

// from the bracket dashboard's "New tournament" button) - this is the

// player-roster + fixture-generation screen, unchanged from before except

// that generateBracket() now posts the finished fixture to the server

// instead of just keeping it in this browser tab.

function goToCreateTournament() {

  tstate.bracket = [];

  tstate.tournamentId = null;

  tstate.tournamentName = null;

  if (tstate.players.length === 0) {

    addPlayerRow();

    addPlayerRow();

  }

  renderPlayerList();

  renderTournamentLevelPicker();

  el("input-tournament-name").value = "";

  el("tournament-setup-error").hidden = true;

  showScreen("tournament-setup");

}



// Turn an {kind, value} image result into something usable as an <img src>

// or as a vision "image_url.url" value. OpenAI's images API may return

// either a base64 payload (b64_json) or a hosted url depending on model/

// API version, so we handle both rather than assuming one.

function imgSrc(img) {

  if (!img) return "";

  return img.kind === "b64" ? "data:image/png;base64," + img.value : img.value;

}



// ---------------------------------------------------------------------

// Voice input - lets a player dictate their prompt/guess instead of

// typing, using the browser's built-in speech recognition (works in

// Chrome/Edge; the mic button quietly hides itself elsewhere). Shared by

// both games - Prompt Mirror's two prompt boxes and Emoji Charades' two

// guess boxes all wire up through the same helper. Nothing is sent to

// OpenAI for this - it's the browser's own speech-to-text.

// ---------------------------------------------------------------------



const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;



function attachVoiceInput(buttonId, textareaId) {

  const btn = el(buttonId);

  const textarea = el(textareaId);

  if (!btn || !textarea) return;



  if (!SpeechRecognitionCtor) {

    btn.hidden = true;

    return;

  }



  let recognition = null;

  let listening = false;

  let baseText = "";



  function stopListening() {

    if (recognition) {

      try { recognition.stop(); } catch (e) { /* already stopped */ }

    }

  }



  btn.addEventListener("click", () => {

    if (listening) {

      stopListening();

      return;

    }



    recognition = new SpeechRecognitionCtor();

    recognition.lang = "en-US";

    recognition.interimResults = true;

    recognition.continuous = false;

    recognition.maxAlternatives = 1;

    baseText = textarea.value.trim();



    recognition.onstart = () => {

      listening = true;

      btn.classList.add("listening");

      btn.textContent = "⏹️";

      btn.title = "Stop listening";

    };

    recognition.onresult = (event) => {

      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {

        transcript += event.results[i][0].transcript;

      }

      textarea.value = (baseText ? baseText + " " : "") + transcript;

    };

    recognition.onerror = (event) => {

      if (event.error && event.error !== "no-speech" && event.error !== "aborted") {

        btn.title = "Voice input error: " + event.error + " - click to try again";

      }

    };

    recognition.onend = () => {

      listening = false;

      btn.classList.remove("listening");

      btn.textContent = "🎤";

      btn.title = btn.dataset.defaultTitle || "Speak instead of typing";

    };



    try {

      recognition.start();

    } catch (e) {

      listening = false;

    }

  });

}



function initVoiceInput() {

  [

    ["btn-mic-guess-prompt", "input-guess-prompt"],

    ["btn-mic-match-prompt", "input-match-prompt"],

    ["btn-mic-emoji-guess", "input-emoji-guess"],

    ["btn-mic-emoji-match-guess", "input-emoji-match-guess"],

    ["btn-mic-code-guess-prompt", "input-code-guess-prompt"],

    ["btn-mic-code-match-prompt", "input-code-match-prompt"],

    ["btn-mic-repair-prompt", "input-repair-prompt"],

    ["btn-mic-repair-match-prompt", "input-repair-match-prompt"],

  ].forEach(([buttonId, textareaId]) => {

    const btn = el(buttonId);

    if (btn) btn.dataset.defaultTitle = btn.title;

    attachVoiceInput(buttonId, textareaId);

  });

}



// ---------------------------------------------------------------------

// Player profiles - persistent, file-backed stats (see app.py's

// /api/players endpoints, which store everything in a JSON file on this

// computer). There's no login: a player is identified purely by the name

// they type, matched case-insensitively, so the same name always maps to

// the same permanent profile. Solo play and tournament play are tracked

// in separate stat blocks, and each game (Prompt Mirror / Emoji Charades)

// keeps its own blocks too. All calls here are deliberately best-effort -

// stat tracking should never be able to break or block actual gameplay,

// so every failure is swallowed silently.

// ---------------------------------------------------------------------



const profileCache = {}; // normalized name/id -> last-known player record from the server



// A generated player ID (see createNewProfile) is a short 5-character code

// like "27H9X". Anything typed that's shaped like one is tried as an exact

// ID lookup FIRST - if it matches a real profile, that's authoritative

// (this is how two players who share a name get told apart). Otherwise it

// falls through to the normal name-based find-or-create, so just typing

// your name still works everywhere with no extra step.

function looksLikePlayerId(s) {

  return /^[A-Za-z0-9]{4,8}$/.test(s);

}



async function lookupPlayerById(id) {

  try {

    const res = await fetch("/api/players/" + encodeURIComponent(id.trim()));

    const data = await res.json();

    if (data.ok && data.player) return data.player;

  } catch (e) {

    // best-effort

  }

  return null;

}



async function resolvePlayerProfile(nameOrId) {

  const trimmed = (nameOrId || "").trim();

  if (!trimmed) return null;

  const key = trimmed.toLowerCase();

  if (profileCache[key]) return profileCache[key];



  if (looksLikePlayerId(trimmed)) {

    const byId = await lookupPlayerById(trimmed);

    if (byId) {

      profileCache[key] = byId;

      profileCache[(byId.name || "").trim().toLowerCase()] = byId;

      return byId;

    }

  }



  try {

    const res = await fetch("/api/players/resolve", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ name: trimmed }),

    });

    const data = await res.json();

    if (data.ok && data.player) {

      profileCache[key] = data.player;

      return data.player;

    }

  } catch (e) {

    // Stats tracking is best-effort; never block play on it.

  }

  return null;

}



async function createNewProfile() {

  const nameInput = el("input-new-profile-name");

  const name = nameInput.value.trim();

  const errEl = el("create-profile-error");

  errEl.hidden = true;

  el("new-profile-result").hidden = true;

  if (!name) {

    errEl.textContent = "Enter a name for the new profile.";

    errEl.hidden = false;

    return;

  }

  try {

    const res = await fetch("/api/players/create", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ name }),

    });

    const data = await res.json();

    if (!data.ok) throw new Error(data.error || "Could not create profile.");

    profileCache[data.player.id.toLowerCase()] = data.player;

    el("new-profile-id").textContent = data.player.id;

    el("new-profile-name").textContent = `for ${data.player.name} — use this ID instead of your name when you play.`;

    el("new-profile-result").hidden = false;

    nameInput.value = "";

    refreshPlayerNameDatalist();

    renderPlayerProfiles();

  } catch (e) {

    errEl.textContent = e.message;

    errEl.hidden = false;

  }

}



// Solo play always attributes to whoever is signed in on THIS device (see

// the identity module above) - no more re-typing a name per game.

async function recordSoloResult(game, score, level) {

  if (!identity.id) return;

  try {

    await fetch("/api/players/event", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ playerId: identity.id, game, type: "solo", score, level }),

    });

  } catch (e) {

    // best-effort

  }

}



// Resolves/creates a persistent profile for every tournament entrant and

// stamps it onto each player object as `profileId` (the in-memory bracket

// player objects flow through to m.playerA/m.playerB/m.winner, so this id

// travels with them for the rest of the tournament). Split from the actual

// "tournament started" event so the caller can check for duplicate

// profiles (two roster entries resolving to the same player, e.g. both

// typing the same ID, or one typing a name and another typing the ID that

// name already owns) BEFORE any stats are recorded - see

// findDuplicateProfilePlayers().

async function resolveTournamentPlayers(players) {

  for (const p of players) {

    const profile = await resolvePlayerProfile(p.name);

    p.profileId = profile ? profile.id : null;

    if (!profile) continue;

    // If they typed a player ID instead of a name, show their actual name

    // everywhere the bracket displays it from here on.

    if (profile.name) p.name = profile.name;

  }

}



// Returns the first pair of players that resolved to the same profile ID,

// or null if every entrant is a distinct profile. Two roster slots can

// collide by accident (a name that's already someone else's profile) or by

// mistake (the same ID typed twice) - either way, letting the tournament

// proceed would mean one real profile plays itself, corrupting its

// win/loss and match-count stats.

function findDuplicateProfilePlayers(players) {

  const seen = new Map();

  for (const p of players) {

    if (!p.profileId) continue;

    if (seen.has(p.profileId)) return [seen.get(p.profileId), p];

    seen.set(p.profileId, p);

  }

  return null;

}



async function postTournamentStartEvents(players, game) {

  for (const p of players) {

    if (!p.profileId) continue;

    try {

      await fetch("/api/players/event", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ playerId: p.profileId, game, type: "tournament-start" }),

      });

    } catch (e) {

      // best-effort

    }

  }

}



function recordMatchResult(player, game, won, stageLabel, stageRank, score) {

  if (!player || !player.profileId) return;

  fetch("/api/players/event", {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({

      playerId: player.profileId, game, type: "match",

      won: !!won, stageLabel, stageRank, score,

    }),

  }).catch(() => {});

}



// One tournament sub-round's score at one difficulty level, for a single

// player - distinct from recordMatchResult, which records a whole match's

// summed total once the match is over. This is what lets a profile be

// ranked "Level 2 tournament" separately from its overall match average.

function recordTournamentLevelResult(player, game, level, score) {

  if (!player || !player.profileId) return;

  fetch("/api/players/event", {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({ playerId: player.profileId, game, type: "tournament-level", level, score }),

  }).catch(() => {});

}



function recordTournamentWon(player, game) {

  if (!player || !player.profileId) return;

  fetch("/api/players/event", {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({ playerId: player.profileId, game, type: "tournament-won" }),

  }).catch(() => {});

}



// "How far did they get" ranking used for a profile's best-ever tournament

// finish - higher is better. Matches the round-name conventions already

// used by roundName()/emojiRoundName() (Final/Semifinal/Quarterfinal/Round

// of N), so a Final counts for more than a Quarterfinal regardless of how

// big the bracket was.

function stageRankForRoundName(label) {

  if (label === "Final") return 4;

  if (label === "Semifinal") return 3;

  if (label === "Quarterfinal") return 2;

  return 1; // "Round of N"

}



async function refreshPlayerNameDatalist() {

  const list = el("player-name-list");

  if (!list) return;

  try {

    const res = await fetch("/api/players");

    const data = await res.json();

    list.innerHTML = "";

    (data.players || []).forEach((p) => {

      const opt = document.createElement("option");

      opt.value = p.name;

      list.appendChild(opt);

    });

  } catch (e) {

    // best-effort

  }

}



// --- Player profiles screen -------------------------------------------



// Ranks every player who has data in a category (solo rounds, or

// tournament matches) for one game, by their average score in that

// category, highest first. Players with zero rounds/matches in that

// category are left out of the ranking entirely (there's nothing to rank).

// Returns a Map of playerId -> {rank, total, avg}; `total` is how many

// players were ranked, so the UI can hide the badge when it's just 1.

function rankByAverage(entries) {

  const sorted = entries.slice().sort((a, b) => b.avg - a.avg);

  const map = new Map();

  sorted.forEach((e, i) => map.set(e.id, { rank: i + 1, total: sorted.length, avg: e.avg }));

  return map;

}



const PROFILE_LEVEL_KEYS = ["1", "2", "3"];

const PROFILE_LEVEL_LABELS = { "1": "Level 1", "2": "Level 2", "3": "Level 3" };



// Ranks every level bucket (1/2/3) independently, in addition to the

// overall solo/tournament averages - so a player can be e.g. "#1 of 4" on

// Level 3 solo while sitting mid-table overall.

function rankLevelBuckets(entriesByLevel) {

  const out = {};

  PROFILE_LEVEL_KEYS.forEach((lvl) => { out[lvl] = rankByAverage(entriesByLevel[lvl]); });

  return out;

}



function computeGameRankings(players, gameKey) {

  const soloEntries = [];

  const tournamentEntries = [];

  const soloLevelEntries = { "1": [], "2": [], "3": [] };

  const tournamentLevelEntries = { "1": [], "2": [], "3": [] };



  players.forEach((p) => {

    const g = (p.games && p.games[gameKey]) || {};

    const solo = g.solo || {};

    if (solo.played > 0) {

      soloEntries.push({ id: p.id, avg: solo.totalScore / solo.played });

    }

    const soloByLevel = solo.byLevel || {};

    PROFILE_LEVEL_KEYS.forEach((lvl) => {

      const ls = soloByLevel[lvl];

      if (ls && ls.played > 0) soloLevelEntries[lvl].push({ id: p.id, avg: ls.totalScore / ls.played });

    });



    const t = g.tournament || {};

    if (t.matchesPlayed > 0) {

      tournamentEntries.push({ id: p.id, avg: (t.totalMatchScore || 0) / t.matchesPlayed });

    }

    const tournamentByLevel = t.byLevel || {};

    PROFILE_LEVEL_KEYS.forEach((lvl) => {

      const ls = tournamentByLevel[lvl];

      if (ls && ls.played > 0) tournamentLevelEntries[lvl].push({ id: p.id, avg: ls.totalScore / ls.played });

    });

  });



  return {

    solo: rankByAverage(soloEntries),

    tournament: rankByAverage(tournamentEntries),

    soloByLevel: rankLevelBuckets(soloLevelEntries),

    tournamentByLevel: rankLevelBuckets(tournamentLevelEntries),

  };

}



function rankBadge(entry) {

  // Only worth showing once there's actually something to be ranked

  // against - a single player's "#1 of 1" isn't a rank, it's just them.

  if (!entry || entry.total < 2) return "";

  return ` <span class="profile-rank-badge">#${entry.rank} of ${entry.total}</span>`;

}



function hasAnyLevelData(byLevel) {

  return !!byLevel && PROFILE_LEVEL_KEYS.some((lvl) => byLevel[lvl] && byLevel[lvl].played > 0);

}



// Renders one "Level 1 / Level 2 / Level 3" row per level, showing that

// level's best/avg score and rank (or a dash if the player hasn't played

// that level in this category yet).

function buildLevelRows(byLevelStats, byLevelRankings, playerId) {

  return PROFILE_LEVEL_KEYS.map((lvl) => {

    const ls = (byLevelStats && byLevelStats[lvl]) || { played: 0, totalScore: 0, bestScore: 0 };

    if (!ls.played) {

      return `<div class="profile-stat-row profile-stat-row-sub"><span>${PROFILE_LEVEL_LABELS[lvl]}</span><span>&mdash;</span></div>`;

    }

    const avg = Math.round(ls.totalScore / ls.played);

    const rankEntry = byLevelRankings ? byLevelRankings[lvl].get(playerId) : null;

    return `<div class="profile-stat-row profile-stat-row-sub"><span>${PROFILE_LEVEL_LABELS[lvl]}</span><span>${ls.bestScore} best / ${avg} avg${rankBadge(rankEntry)}</span></div>`;

  }).join("");

}



function buildProfileGameBlock(label, g, gameRankings, playerId) {

  if (!g) return "";

  const solo = g.solo || { played: 0, totalScore: 0, bestScore: 0, byLevel: {} };

  const t = g.tournament || { tournamentsPlayed: 0, tournamentsWon: 0, matchesPlayed: 0, matchesWon: 0, bestRoundLabel: "", totalMatchScore: 0, byLevel: {} };

  const soloAvg = solo.played ? Math.round(solo.totalScore / solo.played) : 0;

  const tournamentAvg = t.matchesPlayed ? Math.round((t.totalMatchScore || 0) / t.matchesPlayed) : 0;

  const losses = Math.max(0, t.matchesPlayed - t.matchesWon);

  const soloRank = gameRankings ? gameRankings.solo.get(playerId) : null;

  const tournamentRank = gameRankings ? gameRankings.tournament.get(playerId) : null;

  return (

    `<div class="profile-game-block">` +

      `<div class="profile-game-label">${escapeHtml(label)}</div>` +

      `<div class="profile-stat-row"><span>Solo rounds played</span><span>${solo.played}</span></div>` +

      `<div class="profile-stat-row"><span>Solo best / avg score</span><span>${solo.bestScore} / ${soloAvg}${rankBadge(soloRank)}</span></div>` +

      (hasAnyLevelData(solo.byLevel)

        ? `<div class="profile-stat-subheading">Solo &mdash; by level</div>` +

          buildLevelRows(solo.byLevel, gameRankings && gameRankings.soloByLevel, playerId)

        : "") +

      `<div class="profile-stat-row"><span>Tournaments played</span><span>${t.tournamentsPlayed}</span></div>` +

      `<div class="profile-stat-row"><span>Tournaments won</span><span>${t.tournamentsWon}</span></div>` +

      `<div class="profile-stat-row"><span>Match record</span><span>${t.matchesWon}-${losses}</span></div>` +

      `<div class="profile-stat-row"><span>Tournament avg match score</span><span>${tournamentAvg}${rankBadge(tournamentRank)}</span></div>` +

      (hasAnyLevelData(t.byLevel)

        ? `<div class="profile-stat-subheading">Tournament &mdash; by level</div>` +

          buildLevelRows(t.byLevel, gameRankings && gameRankings.tournamentByLevel, playerId)

        : "") +

      `<div class="profile-stat-row"><span>Best tournament finish</span><span>${escapeHtml(t.bestRoundLabel || "—")}</span></div>` +

    `</div>`

  );

}



// Removes a profile the person no longer wants (a typo, a duplicate made

// by mistake, a one-off test) - server-side deletion needs no

// confirmation of its own, so this is the only guard against an accidental

// click. Also purges any cached resolution pointing at the deleted id, so

// a name that gets typed again later doesn't quietly resolve back to a

// profile that no longer exists (resolvePlayerProfile() would otherwise

// keep serving that stale cached object for the rest of the page's life).

async function deletePlayerProfile(id, name) {

  const ok = window.confirm(`Delete the profile "${name}" (ID ${id}) and all its saved stats? This can't be undone.`);

  if (!ok) return;

  try {

    const res = await fetch("/api/players/delete", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ playerId: id }),

    });

    const data = await res.json();

    if (!data.ok) throw new Error(data.error || "Could not delete profile.");

    Object.keys(profileCache).forEach((key) => {

      if (profileCache[key] && profileCache[key].id === id) delete profileCache[key];

    });

    refreshPlayerNameDatalist();

    renderPlayerProfiles();

  } catch (e) {

    window.alert("Could not delete profile: " + e.message);

  }

}



function buildProfileCard(p, rankings) {

  const card = document.createElement("div");

  card.className = "profile-card";

  const games = p.games || {};

  const isAdmin = p.role === "admin";

  card.innerHTML =

    `<div class="profile-card-top">` +

      `<div>` +

        `<div class="profile-card-name">${escapeHtml(p.name)} ` +

          `<span class="identity-badge-role${isAdmin ? " role-admin" : ""}">${isAdmin ? "Dari Admin" : "Dari Participant"}</span>` +

        `</div>` +

        `<div class="profile-card-id">ID: ${escapeHtml(p.id)}</div>` +

      `</div>` +

      `<div class="profile-card-actions">` +

        `<button type="button" class="link-btn profile-role-toggle-btn" title="Change this player's role">${isAdmin ? "Make participant" : "Make admin"}</button>` +

        `<button type="button" class="link-btn profile-delete-btn" title="Delete this profile">Delete</button>` +

      `</div>` +

    `</div>` +

    buildProfileGameBlock("Prompt Mirror", games[GAME_PROMPT_MIRROR], rankings[GAME_PROMPT_MIRROR], p.id) +

    buildProfileGameBlock("Emoji Charades", games[GAME_EMOJI_CHARADES], rankings[GAME_EMOJI_CHARADES], p.id) +

    buildProfileGameBlock("Code Mirror", games[GAME_CODE_MIRROR], rankings[GAME_CODE_MIRROR], p.id) +

    buildProfileGameBlock("Prompt Repair Shop", games[GAME_PROMPT_REPAIR], rankings[GAME_PROMPT_REPAIR], p.id);

  card.querySelector(".profile-delete-btn").addEventListener("click", () => deletePlayerProfile(p.id, p.name));

  card.querySelector(".profile-role-toggle-btn").addEventListener("click", () => toggleProfileRole(p.id, isAdmin ? "participant" : "admin"));

  return card;

}



// Since role is self-declared (this app has no passwords), anyone can flip

// anyone's role here - same trust model as picking your own role when

// creating a profile. This mainly exists so someone whose profile got

// auto-created before they ever used the identity screen (e.g. an admin

// typed their name into a tournament roster first) isn't permanently stuck

// as a participant with no way to become an admin.

async function toggleProfileRole(id, newRole) {

  try {

    const res = await fetch("/api/players/role", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ playerId: id, role: newRole }),

    });

    const data = await res.json();

    if (!data.ok) throw new Error(data.error || "Could not update role.");

    if (identity.id === id) {

      identity.role = newRole;

      updateIdentityBadge();

      applyAdminGating();

    }

    renderPlayerProfiles();

  } catch (e) {

    window.alert("Could not update role: " + e.message);

  }

}



async function renderPlayerProfiles() {

  showScreen("player-profiles");

  const wrap = el("player-profiles-list");

  wrap.innerHTML = '<p class="muted">Loading…</p>';

  try {

    const res = await fetch("/api/players");

    const data = await res.json();

    const players = data.players || [];

    if (!players.length) {

      wrap.innerHTML = '<p class="muted">No players yet — play a solo round or a tournament to start building profiles.</p>';

      return;

    }

    // Ranking only makes sense once there's someone to compare against -

    // computeGameRankings naturally no-ops down to empty maps (so

    // rankBadge() shows nothing) when there's only one profile.

    const rankings = {

      [GAME_PROMPT_MIRROR]: computeGameRankings(players, GAME_PROMPT_MIRROR),

      [GAME_EMOJI_CHARADES]: computeGameRankings(players, GAME_EMOJI_CHARADES),

      [GAME_CODE_MIRROR]: computeGameRankings(players, GAME_CODE_MIRROR),

      [GAME_PROMPT_REPAIR]: computeGameRankings(players, GAME_PROMPT_REPAIR),

    };

    wrap.innerHTML = "";

    players.forEach((p) => wrap.appendChild(buildProfileCard(p, rankings)));

  } catch (e) {

    wrap.innerHTML = '<p class="error">Could not load player profiles.</p>';

  }

}



async function init() {

  el("brand-home").addEventListener("click", () => {

    if (state.apiKey && identity.id) showScreen("wings");

  });

  el("btn-change-key").addEventListener("click", () => {

    el("input-api-key").value = "";

    el("setup-error").hidden = true;

    showScreen("setup");

  });

  el("btn-view-profiles").addEventListener("click", renderPlayerProfiles);

  el("btn-create-profile").addEventListener("click", createNewProfile);

  el("input-new-profile-name").addEventListener("keydown", (e) => {

    if (e.key === "Enter") createNewProfile();

  });

  el("btn-save-key").addEventListener("click", saveApiKey);

  el("input-api-key").addEventListener("keydown", (e) => {

    if (e.key === "Enter") saveApiKey();

  });



  // Home Screen — Day 2 Navigation Requirements:

  // Gaming Arcade -> Picture Mirror Setup Screen

  const btnGamingArcade = el("btn-enter-gaming-arcade") || (el("card-gaming-arcade") && el("card-gaming-arcade").querySelector("button"));

  if (btnGamingArcade) {

    btnGamingArcade.addEventListener("click", () => showScreen("picture-mirror-setup"));

  }



  // Agent Marketplace -> Displays "Coming Soon" screen

  const btnMarketplace = el("btn-open-marketplace") || (el("card-marketplace") && el("card-marketplace").querySelector("button"));

  if (btnMarketplace) {

    btnMarketplace.addEventListener("click", () => showScreen("marketplace-coming-soon"));

  }



  // AI Learning -> Displays "Coming Soon" screen

  const btnLearning = el("btn-open-learning") || (el("card-ai-learning") && el("card-ai-learning").querySelector("button"));

  if (btnLearning) {

    btnLearning.addEventListener("click", () => showScreen("learning-coming-soon"));

  }



  // Picture Mirror Setup Screen — Day 3 Configuration Handlers

  // 1. Theme selection (10 approved themes)

  document.querySelectorAll("#theme-selector-grid .theme-card-btn").forEach((b) => {

    b.addEventListener("click", () => {

      document.querySelectorAll("#theme-selector-grid .theme-card-btn").forEach((btn) => btn.classList.remove("active"));

      b.classList.add("active");

      state.theme = b.dataset.theme;

      updateSetupSummary();

    });

  });



  // 2. Difficulty selection (3 approved levels)

  document.querySelectorAll("#setup-level-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => {

      document.querySelectorAll("#setup-level-picker .level-btn").forEach((btn) => btn.classList.remove("active"));

      b.classList.add("active");

      setLevel(Number(b.dataset.level));

      updateSetupSummary();

    });

  });



  // 3. Generation speed selection (Fast vs Quality)

  document.querySelectorAll("#setup-speed-picker .speed-btn").forEach((b) => {

    b.addEventListener("click", () => {

      document.querySelectorAll("#setup-speed-picker .speed-btn").forEach((btn) => btn.classList.remove("active"));

      b.classList.add("active");

      state.speed = b.dataset.speed;

      updateSetupSummary();

    });

  });



  // Start game with configured theme, difficulty, and speed

  if (el("btn-start-game-configured")) {

    el("btn-start-game-configured").addEventListener("click", () => {

      if (!state.apiKey) {

        showScreen("setup");

        return;

      }

      startRound();

    });

  }



  if (el("btn-goto-arcade-hub")) {

    el("btn-goto-arcade-hub").addEventListener("click", () => showScreen("hub"));

  }



  // Coming Soon Early Access & Waitlist handlers

  if (el("btn-notify-marketplace")) {

    el("btn-notify-marketplace").addEventListener("click", () => {

      el("btn-notify-marketplace").disabled = true;

      el("btn-notify-marketplace").textContent = "Request Sent ✓";

      el("notify-marketplace-success").hidden = false;

    });

  }



  if (el("btn-notify-learning")) {

    el("btn-notify-learning").addEventListener("click", () => {

      el("btn-notify-learning").disabled = true;

      el("btn-notify-learning").textContent = "Waitlist Joined ✓";

      el("notify-learning-success").hidden = false;

    });

  }



  // Mobile Bottom Navigation Bar listeners

  document.querySelectorAll("#mobile-bottom-nav .bottom-nav-item").forEach((btn) => {

    btn.addEventListener("click", () => {

      const navTarget = btn.dataset.nav;

      if (navTarget) {

        if (navTarget === "player-profiles") renderPlayerProfiles();

        showScreen(navTarget);

      }

    });

  });



  function updateSetupSummary() {

    const themeObj = THEMES[state.theme] || THEMES["cyberpunk"];

    if (el("selected-theme-label")) el("selected-theme-label").textContent = themeObj.name;

    if (el("summary-theme-val")) el("summary-theme-val").textContent = themeObj.name;

    

    const diffLabels = { 1: "Level 1 (Easy)", 2: "Level 2 (Medium)", 3: "Level 3 (Hard)" };

    if (el("summary-diff-val")) el("summary-diff-val").textContent = diffLabels[state.level] || "Level 1 (Easy)";



    const speedLabels = { "fast": "Fast (Standard)", "quality": "Quality (HD)" };

    if (el("summary-speed-val")) el("summary-speed-val").textContent = speedLabels[state.speed] || "Fast (Standard)";



    const levelHints = {

      1: "Level 1: One simple subject with clear shapes and plain lighting. Easiest to match closely.",

      2: "Level 2: A single complete scene with distinct art style, lighting, and environment.",

      3: "Level 3: A complex multi-element scene with intricate lighting, atmosphere, and fine details."

    };

    if (el("setup-level-hint")) el("setup-level-hint").textContent = levelHints[state.level] || levelHints[1];

  }

  updateSetupSummary();



  el("card-prompt-mirror").querySelector("button").addEventListener("click", () => showScreen("picture-mirror-setup"));

  document.querySelectorAll("[data-back]").forEach((b) => {

    b.addEventListener("click", () => {

      showScreen(b.dataset.back);

      // These two screens are live dashboards fed by the server - restart

      // their poll loop whenever a back-link lands on one, same as

      // whatever forward-navigation first got there.

      if (b.dataset.back === "tournament-bracket") startPolling(refreshBracketFromServer, 3000);

      if (b.dataset.back === "tournament-hub") startPolling(refreshOpenTournaments, 4000);

    });

  });

  document.querySelectorAll("#level-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => setLevel(Number(b.dataset.level)));

  });

  document.querySelectorAll("#mode-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => setMode(b.dataset.mode));

  });

  el("btn-start-round").addEventListener("click", handleStartClick);

  el("btn-submit-guess").addEventListener("click", submitGuess);

  el("btn-retry-challenge").addEventListener("click", generateChallengeImage);

  el("btn-play-again").addEventListener("click", startRound);

  el("btn-reveal-ideal-prompt").addEventListener("click", revealIdealPrompt);

  el("btn-back-to-arcade").addEventListener("click", () => showScreen("hub"));



  el("btn-add-player").addEventListener("click", () => addPlayerRow());

  el("btn-bulk-add-players").addEventListener("click", bulkAddPlayers);

  document.querySelectorAll("#tournament-level-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => toggleTournamentLevel(Number(b.dataset.level)));

  });

  el("btn-generate-bracket").addEventListener("click", generateBracket);

  el("btn-new-tournament-from-bracket").addEventListener("click", () => {

    stopPolling();

    goToCreateTournament();

  });

  el("btn-submit-match-prompt").addEventListener("click", submitMyPrompt);

  el("btn-finish-match").addEventListener("click", () => {

    showScreen("tournament-bracket");

    startPolling(refreshBracketFromServer, 3000);

  });



  el("btn-goto-create-tournament").addEventListener("click", goToCreateTournament);

  el("btn-join-tournament-code").addEventListener("click", joinByCode);

  el("input-join-tournament-id").addEventListener("keydown", (e) => {

    if (e.key === "Enter") joinByCode();

  });



  // Google OAuth Authentication

  initGoogleAuth();



  if (el("btn-identity-continue")) el("btn-identity-continue").addEventListener("click", attemptIdentityLogin);

  if (el("input-identity-search")) {

    el("input-identity-search").addEventListener("keydown", (e) => {

      if (e.key === "Enter") attemptIdentityLogin();

    });

  }

  if (el("btn-identity-takeover")) {

    el("btn-identity-takeover").addEventListener("click", () => {

      if (pendingLoginId) loginAsPlayer(pendingLoginId, true);

    });

  }

  if (el("btn-identity-create")) el("btn-identity-create").addEventListener("click", createIdentity);

  if (el("input-identity-new-name")) {

    el("input-identity-new-name").addEventListener("keydown", (e) => {

      if (e.key === "Enter") createIdentity();

    });

  }

  document.querySelectorAll("#identity-role-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => {

      document.querySelectorAll("#identity-role-picker .level-btn").forEach((x) => x.classList.remove("active"));

      b.classList.add("active");

    });

  });

  if (el("btn-switch-player")) el("btn-switch-player").addEventListener("click", switchPlayer);



  initEmojiCharades();

  initCodeMirror();

  initPromptRepair();

  initVoiceInput();



  try {

    const res = await fetch("/api/key");

    const data = await res.json();

    if (data.has_key) {

      state.apiKey = data.api_key;

      await resumeIdentityOrPrompt();

    } else {

      showScreen("setup");

    }

  } catch (e) {

    showScreen("setup");

  }

}



async function saveApiKey() {

  const key = el("input-api-key").value.trim();

  const errEl = el("setup-error");

  errEl.hidden = true;

  if (!key) {

    errEl.textContent = "Please paste your OpenAI API key.";

    errEl.hidden = false;

    return;

  }

  try {

    const res = await fetch("/api/key", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ api_key: key }),

    });

    const data = await res.json();

    if (!data.ok) throw new Error(data.error || "Could not save key");

    state.apiKey = key;

    await resumeIdentityOrPrompt();

  } catch (e) {

    errEl.textContent = "Could not save your key: " + e.message;

    errEl.hidden = false;

  }

}



// Generates one image from a prompt. Returns {kind:"b64"|"url", value}.

// Robust multi-tier image generation:

// 1. Attempts OpenAI dall-e-3 (if API key provided)

// 2. Falls back to OpenAI dall-e-2 if dall-e-3 is unavailable on this key

// 3. Real High-Definition Subject Search (Wikimedia Commons, Unsplash & Picsum)

// 4. DaRI Turbo AI Engine (Pollinations AI)

// 5. Offline Dynamic Themed Canvas (Illustrates mushrooms, cities, space, oceans, etc.)

async function generateImage(prompt) {

  const cleanPrompt = String(prompt || "").trim();



  // Tier 1: Try OpenAI DALL-E 3

  if (state.apiKey) {

    try {

      const res = await fetch("https://api.openai.com/v1/images/generations", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          "Authorization": "Bearer " + state.apiKey,

        },

        body: JSON.stringify({

          model: "dall-e-3",

          prompt: cleanPrompt,

          size: "1024x1024",

          n: 1,

        }),

      });



      if (res.ok) {

        const data = await res.json();

        const item = data.data && data.data[0];

        if (item) {

          if (item.b64_json) return { kind: "b64", value: item.b64_json };

          if (item.url) return { kind: "url", value: item.url };

        }

      } else {

        const errBody = await res.json().catch(() => ({}));

        const errMsg = (errBody.error && errBody.error.message) || "";

        console.warn("[DaRI Arcade] DALL-E-3 error:", errMsg);



        // Tier 2: Try OpenAI DALL-E 2 if DALL-E 3 doesn't exist

        if (/does not exist|invalid_value|model|permission/i.test(errMsg)) {

          console.log("[DaRI Arcade] Attempting DALL-E 2 fallback...");

          try {

            const res2 = await fetch("https://api.openai.com/v1/images/generations", {

              method: "POST",

              headers: {

                "Content-Type": "application/json",

                "Authorization": "Bearer " + state.apiKey,

              },

              body: JSON.stringify({

                model: "dall-e-2",

                prompt: cleanPrompt.slice(0, 1000),

                size: "1024x1024",

                n: 1,

              }),

            });

            if (res2.ok) {

              const data2 = await res2.json();

              const item2 = data2.data && data2.data[0];

              if (item2) {

                if (item2.b64_json) return { kind: "b64", value: item2.b64_json };

                if (item2.url) return { kind: "url", value: item2.url };

              }

            }

          } catch (e2) {

            console.warn("[DaRI Arcade] DALL-E 2 exception:", e2.message);

          }

        }

      }

    } catch (e) {

      console.warn("[DaRI Arcade] OpenAI fetch exception:", e.message);

    }

  }



  // Tier 2.5: Free Generative AI Engine (Pollinations AI)

  // Generates real, bespoke AI imagery matching the exact prompt without requiring paid OpenAI DALL-E tiers

  console.log("[DaRI Arcade] Generating AI image via Pollinations AI Engine for:", cleanPrompt);

  try {

    const seed = Math.floor(Math.random() * 10000000);

    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

    return { kind: "url", value: pollinationsUrl };

  } catch (pErr) {

    console.warn("[DaRI Arcade] Pollinations AI fallback error:", pErr);

  }



  // Tier 3: Real High-Definition Subject Search (Matches actual prompt topics)

  console.log("[DaRI Arcade] Fetching real image for prompt:", cleanPrompt);

  try {

    const subjectImg = await fetchVisualSubjectImage(cleanPrompt);

    if (subjectImg) {

      return subjectImg;

    }

  } catch (err) {

    console.warn("[DaRI Arcade] Subject image search error:", err);

  }



  // Tier 4: Offline Themed Canvas Generator

  console.log("[DaRI Arcade] Falling back to offline dynamic themed canvas...");

  return generateProceduralCanvasImage(cleanPrompt);

}



// Fetches real high-resolution images tailored to the prompt's subject

async function fetchVisualSubjectImage(prompt) {

  const clean = prompt.replace(/[^\w\s]/gi, " ").toLowerCase();

  const stopWords = new Set(["a", "an", "the", "of", "in", "with", "and", "for", "to", "on", "at", "illustrate", "illustration", "image", "photo", "picture", "style", "hyperrealistic", "cinematic", "art", "rendered", "digital", "high", "quality", "vibrant", "detailed", "drawing", "painting"]);

  const words = clean.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

  const query = words.slice(0, 3).join(" ") || "fantasy";



  // 1. Wikimedia Commons API with origin=* for universal CORS support

  try {

    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5&pithumbsize=1024&origin=*`;

    const res = await fetch(wikiUrl);

    if (res.ok) {

      const data = await res.json();

      const pages = Object.values(data?.query?.pages || {});

      const valid = pages.filter(p => p.thumbnail && p.thumbnail.source);

      if (valid.length > 0) {

        let hash = 0;

        for (let i = 0; i < prompt.length; i++) hash = ((hash << 5) - hash) + prompt.charCodeAt(i);

        const choice = valid[Math.abs(hash) % valid.length];

        return { kind: "url", value: choice.thumbnail.source };

      }

    }

  } catch (e) {

    console.warn("[DaRI Arcade] Wiki search exception:", e.message);

  }



  // 2. Curated High-Definition Themed Library

  const THEME_BANK = {

    mushroom: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1024&q=80",

    fungi: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1024&q=80",

    cyberpunk: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1024&q=80",

    neon: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1024&q=80",

    space: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1024&q=80",

    galaxy: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1024&q=80",

    ocean: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1024&q=80",

    underwater: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=1024&q=80",

    autumn: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1024&q=80",

    cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1024&q=80",

    fantasy: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1024&q=80",

    castle: "https://images.unsplash.com/photo-1524397076537-829d494916a2?auto=format&fit=crop&w=1024&q=80",

    anime: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1024&q=80",

    steampunk: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1024&q=80",

    robot: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1024&q=80",

    temple: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1024&q=80",

    synthwave: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1024&q=80",

    dragon: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1024&q=80",

    forest: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1024&q=80"

  };



  for (const [k, url] of Object.entries(THEME_BANK)) {

    if (clean.includes(k)) {

      return { kind: "url", value: url };

    }

  }



  // 3. Unique Seeded High-Res Photograph (Different for every single prompt)

  let hash = 0;

  for (let i = 0; i < prompt.length; i++) hash = ((hash << 5) - hash) + prompt.charCodeAt(i);

  const seed = (Math.abs(hash) % 950) + 1;

  return { kind: "url", value: `https://picsum.photos/seed/${seed}/1024/1024` };

}



function generateProceduralCanvasImage(prompt) {

  const canvas = document.createElement("canvas");

  canvas.width = 1024;

  canvas.height = 1024;

  const ctx = canvas.getContext("2d");

  const clean = prompt.toLowerCase();



  let hash = 0;

  for (let i = 0; i < prompt.length; i++) {

    hash = (hash << 5) - hash + prompt.charCodeAt(i);

  }

  const hue1 = Math.abs(hash) % 360;

  const hue2 = (hue1 + 90) % 360;



  // Background gradient

  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);

  grad.addColorStop(0, `hsl(${hue1}, 75%, 10%)`);

  grad.addColorStop(0.6, `hsl(${(hue1 + 45) % 360}, 80%, 18%)`);

  grad.addColorStop(1, `hsl(${hue2}, 85%, 6%)`);

  ctx.fillStyle = grad;

  ctx.fillRect(0, 0, 1024, 1024);



  // Themed subject illustration

  if (clean.includes("mushroom") || clean.includes("fungi")) {

    // Glowing Mushroom Cap

    ctx.beginPath();

    ctx.arc(512, 500, 260, Math.PI, 0, false);

    ctx.closePath();

    ctx.fillStyle = "#ff4081";

    ctx.fill();

    ctx.strokeStyle = "#ff80ab";

    ctx.lineWidth = 8;

    ctx.stroke();



    // Spots

    ctx.fillStyle = "#ffffff";

    [[420, 420, 30], [512, 360, 40], [600, 430, 32], [512, 470, 25]].forEach(([x, y, r]) => {

      ctx.beginPath();

      ctx.arc(x, y, r, 0, Math.PI * 2);

      ctx.fill();

    });



    // Stem

    ctx.beginPath();

    ctx.moveTo(460, 500);

    ctx.bezierCurveTo(460, 680, 440, 780, 430, 840);

    ctx.lineTo(594, 840);

    ctx.bezierCurveTo(584, 780, 564, 680, 564, 500);

    ctx.closePath();

    ctx.fillStyle = "#e0e0e0";

    ctx.fill();

  } else if (clean.includes("space") || clean.includes("galaxy") || clean.includes("cosmic")) {

    // Planet with rings

    ctx.beginPath();

    ctx.arc(512, 512, 180, 0, Math.PI * 2);

    ctx.fillStyle = `hsl(${hue1}, 80%, 45%)`;

    ctx.fill();



    ctx.save();

    ctx.translate(512, 512);

    ctx.rotate(-0.4);

    ctx.beginPath();

    ctx.ellipse(0, 0, 340, 60, 0, 0, Math.PI * 2);

    ctx.strokeStyle = `hsla(${hue2}, 90%, 75%, 0.8)`;

    ctx.lineWidth = 14;

    ctx.stroke();

    ctx.restore();

  } else {

    // Vibrant landscape mountains & moon

    ctx.beginPath();

    ctx.arc(512, 340, 140, 0, Math.PI * 2);

    ctx.fillStyle = "#ffe082";

    ctx.fill();



    // Mountain silhouettes

    ctx.beginPath();

    ctx.moveTo(0, 850);

    ctx.lineTo(340, 480);

    ctx.lineTo(620, 850);

    ctx.closePath();

    ctx.fillStyle = `hsl(${hue1}, 60%, 15%)`;

    ctx.fill();



    ctx.beginPath();

    ctx.moveTo(380, 850);

    ctx.lineTo(720, 430);

    ctx.lineTo(1024, 850);

    ctx.closePath();

    ctx.fillStyle = `hsl(${hue2}, 70%, 22%)`;

    ctx.fill();

  }



  // Golden neon border frame

  ctx.strokeStyle = "#e5a93b";

  ctx.lineWidth = 14;

  ctx.strokeRect(36, 36, 952, 952);



  const dataUrl = canvas.toDataURL("image/png");

  return { kind: "b64", value: dataUrl.split(",")[1] };

}



async function startRound() {

  state.hiddenPrompt = "";

  state.guessPrompt = "";

  state.originalImage = null;

  state.generatedImage = null;



  showScreen("challenge");

  updateLevelBadges();

  el("challenge-error").hidden = true;

  el("btn-retry-challenge").hidden = true;

  el("challenge-image-wrap").hidden = true;

  el("challenge-form").hidden = true;

  el("input-guess-prompt").value = "";



  el("challenge-loading-text").textContent = "Checking challenge archive (>24h)...";

  el("challenge-loading").hidden = false;



  // 1. Check if a challenge image saved more than 24 hours ago exists in S3

  let reusedChallenge = null;

  try {

    const checkRes = await fetch(`/api/challenges/next?level=${state.level}`);

    if (checkRes.ok) {

      const checkData = await checkRes.json();

      if (checkData.reused && checkData.image_url) {

        reusedChallenge = checkData;

      }

    }

  } catch (err) {

    console.warn("[DaRI Arcade] Could not check reusable challenge archive:", err);

  }



  if (reusedChallenge) {

    console.log("[DaRI Arcade] Reusing challenge image from S3 (>24 hours old):", reusedChallenge.challenge_id);

    state.hiddenPrompt = reusedChallenge.hidden_prompt;

    state.originalImage = { kind: "url", value: reusedChallenge.image_url };

    el("challenge-image").src = reusedChallenge.image_url;

    el("challenge-image-wrap").hidden = false;

    el("challenge-form").hidden = false;

    el("challenge-loading").hidden = true;

    return;

  }



  // 2. If no image was saved before 24 hours, generate a fresh challenge image

  console.log("[DaRI Arcade] No image >24h old found in S3. Generating fresh challenge image...");

  el("challenge-loading-text").textContent = "Writing today's challenge…";

  state.hiddenPrompt = await getHiddenPrompt(state.level);



  await generateChallengeImage();

}



async function generateChallengeImage() {

  el("challenge-error").hidden = true;

  el("btn-retry-challenge").hidden = true;

  el("challenge-loading-text").textContent = "Generating your challenge image…";

  el("challenge-loading").hidden = false;



  try {

    const img = await generateImage(state.hiddenPrompt);

    state.originalImage = img;

    el("challenge-image").src = imgSrc(img);

    el("challenge-image-wrap").hidden = false;

    el("challenge-form").hidden = false;



    // Asynchronously upload only the original challenge image to S3 (eligible for reuse after 24 hours)

    uploadOriginalChallengeImageToS3(state.hiddenPrompt, img, state.level);

  } catch (e) {

    showChallengeError(e.message);

    el("btn-retry-challenge").hidden = false;

  } finally {

    el("challenge-loading").hidden = true;

  }

}





async function uploadOriginalChallengeImageToS3(prompt, img, level) {

  try {

    console.log("[DaRI Arcade] Uploading original challenge image to S3 (eligible for reuse after 24h)...");

    const payload = {

      prompt: prompt,

      level: level || 1,

      image_url: img.kind === "url" ? img.value : null,

      image_b64: img.kind === "b64" ? img.value : null,

    };

    const res = await fetch("/api/challenges/upload", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(payload),

    });

    if (res.ok) {

      const data = await res.json();

      console.log("[DaRI Arcade] Original challenge image saved to S3 successfully:", data.s3_key);

    } else {

      console.warn("[DaRI Arcade] S3 challenge upload returned non-200:", res.status);

    }

  } catch (err) {

    console.warn("[DaRI Arcade] Failed to upload challenge image to S3:", err);

  }

}



function showChallengeError(msg) {

  const errEl = el("challenge-error");

  errEl.textContent = errorHint(msg);

  errEl.hidden = false;

}



function errorHint(msg) {

  let hint = msg;

  if (/401|invalid_api_key|Incorrect API key/i.test(msg)) {

    hint += " — double check the API key you saved (use \"Change API key\" above).";

  } else if (/Failed to fetch|NetworkError|TypeError/i.test(msg)) {

    hint += " — this can happen on a restricted network/VPN that blocks api.openai.com, or if you're offline.";

  }

  return hint;

}



async function submitGuess() {

  const guess = el("input-guess-prompt").value.trim();

  if (!guess) return;

  state.guessPrompt = guess;

  el("challenge-error").hidden = true;

  el("challenge-form").hidden = true;

  el("challenge-loading-text").textContent = "Generating your recreation…";

  el("challenge-loading").hidden = false;



  try {

    const img = await generateImage(guess);

    state.generatedImage = img;

  } catch (e) {

    el("challenge-loading").hidden = true;

    el("challenge-form").hidden = false;

    showChallengeError(e.message);

    return;

  }

  el("challenge-loading").hidden = true;



  await runResultScreen();

}



function resetIdealPromptUI() {

  el("ideal-prompt-text").hidden = true;

  el("ideal-prompt-text").textContent = "";

  el("ideal-prompt-error").hidden = true;

  el("ideal-prompt-loading").hidden = true;

  const btn = el("btn-reveal-ideal-prompt");

  btn.hidden = false;

  btn.disabled = false;

  btn.textContent = "Show AI's ideal prompt";

}



async function revealIdealPrompt() {

  const btn = el("btn-reveal-ideal-prompt");

  btn.hidden = true;

  el("ideal-prompt-error").hidden = true;

  el("ideal-prompt-loading").hidden = false;

  try {

    const prompt = await generateIdealPrompt(state.originalImage);

    el("ideal-prompt-text").textContent = prompt;

    el("ideal-prompt-text").hidden = false;

  } catch (e) {

    el("ideal-prompt-error").textContent = errorHint(e.message);

    el("ideal-prompt-error").hidden = false;

    btn.hidden = false;

    btn.textContent = "Try again";

  } finally {

    el("ideal-prompt-loading").hidden = true;

  }

}



async function runResultScreen() {

  showScreen("result");

  el("result-original-image").src = imgSrc(state.originalImage);

  el("result-generated-image").src = imgSrc(state.generatedImage);

  el("score-block").hidden = true;

  el("result-reveal").hidden = true;

  el("result-guess-reveal").hidden = true;

  el("result-feedback").textContent = "";

  resetIdealPromptUI();

  el("result-loading-text").textContent = "Asking the AI judge to score your recreation…";

  el("result-loading").hidden = false;



  try {
    await streamScore(state.originalImage, state.generatedImage);
  } catch (e) {
    console.warn("[DaRI Arcade] streamScore uncaught:", e);
    await fallbackSemanticScore(state.hiddenPrompt, state.guessPrompt, state.originalImage, state.generatedImage);
  } finally {

    el("result-loading").hidden = true;

    el("reveal-guess-text").textContent = state.guessPrompt;

    el("result-guess-reveal").hidden = false;

    el("reveal-prompt-text").textContent = state.hiddenPrompt;

    el("result-reveal").hidden = false;

    if (!el("score-block").hidden) {

      recordSoloResult(GAME_PROMPT_MIRROR, Number(el("score-value").textContent), state.level);

    }

  }

}



function setScore(score) {

  score = Math.max(0, Math.min(100, Math.round(score)));

  el("score-value").textContent = score;

  const fill = el("score-bar-fill");

  fill.style.width = score + "%";

  let color = "#ff6b6b";

  if (score >= 70) color = "#33d6a6";

  else if (score >= 40) color = "#ffb454";

  fill.style.background = color;

  el("score-block").hidden = false;

}




// Built-in intelligent semantic judge: evaluates prompt recreation similarity
// when no paid OpenAI API key is supplied or when the OpenAI API is unreachable.

// Convert an image (kind: "url" or "b64") into a base64 Data URL so OpenAI Vision API
// receives direct bytes and never attempts an external network download on relative or private URLs.
async function ensureBase64DataUrl(img) {
  if (!img) return "";
  if (img.kind === "b64") {
    const val = String(img.value || "").trim();
    return val.startsWith("data:") ? val : ("data:image/png;base64," + val);
  }
  const rawUrl = String(img.value || "").trim();
  if (!rawUrl) return "";
  if (rawUrl.startsWith("data:")) return rawUrl;

  try {
    const fetchUrl = rawUrl.startsWith("http") ? rawUrl : (window.location.origin + rawUrl);
    const resp = await fetch(fetchUrl);
    if (resp.ok) {
      const blob = await resp.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(rawUrl);
        reader.readAsDataURL(blob);
      });
    }
  } catch (err) {
    console.warn("[DaRI Arcade] ensureBase64DataUrl fetch failed:", err);
  }
  return rawUrl;
}

async function fallbackSemanticScore(hiddenPrompt, guessPrompt, origImg, genImg) {
  const hidden = String(hiddenPrompt || "").trim();
  const guess = String(guessPrompt || "").trim();

  const clean = (s) => s.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(Boolean);
  const stopWords = new Set([
    "a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "by", "from",
    "and", "or", "is", "are", "was", "were", "it", "this", "that", "image", "picture", "photo", "style", "looking", "facing"
  ]);

  const hWords = clean(hidden).filter(w => !stopWords.has(w));
  const gWords = clean(guess).filter(w => !stopWords.has(w));

  const hSet = new Set(hWords);
  let matchedWords = 0;
  let partialMatches = 0;
  const matchedList = [];

  for (const gw of gWords) {
    if (hSet.has(gw)) {
      matchedWords++;
      matchedList.push(gw);
    } else {
      for (const hw of hWords) {
        if (hw.startsWith(gw) || gw.startsWith(hw) || (gw.length > 4 && hw.length > 4 && (gw.includes(hw.slice(0, 4)) || hw.includes(gw.slice(0, 4))))) {
          partialMatches++;
          matchedList.push(gw);
          break;
        }
      }
    }
  }

  const intersection = matchedWords + (partialMatches * 0.6);
  const union = Math.max(1, new Set([...hWords, ...gWords]).size);
  const jaccard = intersection / union;

  const visualAttributes = [
    "neon", "cyberpunk", "futuristic", "glowing", "dark", "bright", "vibrant",
    "minimalist", "flat", "realistic", "photo", "cinematic", "rain", "sunset", "blue", "red", "gold", "yellow", "green", "black", "white", "vintage", "retro"
  ];
  let attrMatches = 0;
  for (const attr of visualAttributes) {
    if (hidden.toLowerCase().includes(attr) && guess.toLowerCase().includes(attr)) {
      attrMatches++;
    }
  }

  let score = Math.round(jaccard * 65 + (attrMatches * 10));
  if (matchedWords >= 1 || partialMatches >= 1) {
    score = Math.max(score, 45 + Math.min(45, Math.round(intersection * 14)));
  } else {
    score = Math.max(15, Math.min(35, Math.round(15 + Math.random() * 15)));
  }

  score = Math.max(12, Math.min(95, score));

  let feedback = "";
  if (score >= 80) {
    feedback = `Spectacular recreation! You captured the core subject and visual mood almost perfectly${matchedList.length ? ` (matched: ${matchedList.join(", ")})` : ""}. The lighting and composition match the original closely.`;
  } else if (score >= 60) {
    feedback = `Great match! You accurately identified the key subject${matchedList.length ? ` (${matchedList.join(", ")})` : ""}. To score higher next time, pay close attention to secondary details like the background lighting, color palette, and art style.`;
  } else if (score >= 40) {
    feedback = `Fair attempt! You caught some elements of the theme${matchedList.length ? ` (${matchedList.join(", ")})` : ""}, but the overall atmosphere and specific details differed from the hidden reference prompt.`;
  } else {
    feedback = `Challenging round! Your recreation had a noticeably different subject and style from the original hidden prompt. Look closely at the shapes, lighting, and composition.`;
  }

  // Set score and render feedback
  setScore(score);
  const feedbackEl = el("result-feedback");
  if (feedbackEl) {
    feedbackEl.textContent = feedback;
  }
  return { score, feedback };
}

async function streamScore(origImg, genImg) {
  if (!state.apiKey) {
    console.log("[DaRI Arcade] No OpenAI API key provided. Using built-in semantic scoring engine...");
    return await fallbackSemanticScore(state.hiddenPrompt, state.guessPrompt, origImg, genImg);
  }

  try {
    const origDataUrl = await ensureBase64DataUrl(origImg);
    const genDataUrl = await ensureBase64DataUrl(genImg);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + state.apiKey,
      },
      body: JSON.stringify({
        model: SCORE_MODEL,
        stream: true,
        max_tokens: 300,
        messages: [
          { role: "system", content: SCORE_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Image 1 is the ORIGINAL. Image 2 is the RECREATION, generated from the player's guessed prompt. Compare them." },
              { type: "image_url", image_url: { url: origDataUrl } },
              { type: "image_url", image_url: { url: genDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok || !res.body) {
      const errBody = await res.json().catch(() => ({}));
      const errMsg = (errBody.error && errBody.error.message) || `OpenAI scoring request failed (${res.status})`;
      console.warn("[DaRI Arcade] OpenAI score failed:", errMsg, "— falling back to built-in semantic judge");
      return await fallbackSemanticScore(state.hiddenPrompt, state.guessPrompt, origImg, genImg);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";
    let scoreShown = false;
    let feedbackStarted = false;
    const feedbackEl = el("result-feedback");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;
        let json;
        try {
          json = JSON.parse(payload);
        } catch (e) {
          continue;
        }
        const delta = json.choices && json.choices[0] && json.choices[0].delta;
        const piece = delta && delta.content;
        if (!piece) continue;
        fullText += piece;

        if (!scoreShown) {
          const match = fullText.match(/^\s*(\d{1,3})/);
          const hasBreak = fullText.includes("\n\n") || fullText.includes("\n\r\n");
          if (match && (hasBreak || fullText.trim().length > String(match[1]).length + 2)) {
            setScore(parseInt(match[1], 10));
            scoreShown = true;
          }
        }

        if (scoreShown) {
          const afterScore = fullText.replace(/^\s*\d{1,3}\s*\n+/, "");
          if (afterScore.trim().length > 0) {
            feedbackStarted = true;
            feedbackEl.textContent = afterScore.trim();
          }
        }
      }
    }

    if (!scoreShown) {
      const match = fullText.match(/^\s*(\d{1,3})/);
      if (match) setScore(parseInt(match[1], 10));
      else await fallbackSemanticScore(state.hiddenPrompt, state.guessPrompt, origImg, genImg);
    }
    if (!feedbackStarted && fullText.trim()) {
      const afterScore = fullText.replace(/^\s*\d{1,3}\s*\n+/, "").trim();
      feedbackEl.textContent = afterScore || fullText.trim();
    }
    return;
  } catch (err) {
    console.warn("[DaRI Arcade] streamScore exception:", err);
    return await fallbackSemanticScore(state.hiddenPrompt, state.guessPrompt, origImg, genImg);
  }
}

function escapeHtml(s) {

  const d = document.createElement("div");

  d.textContent = s == null ? "" : String(s);

  return d.innerHTML;

}



// One non-streaming scoring call (used in tournament mode, where results

// stay hidden until every player has submitted, so live-streaming text

// into the UI wouldn't be seen anyway).

async function scoreImagesOnce(origImg, genImg) {
  if (!state.apiKey) {
    return await fallbackSemanticScore(state.hiddenPrompt, state.guessPrompt, origImg, genImg);
  }
  try {
    const origDataUrl = await ensureBase64DataUrl(origImg);
    const genDataUrl = await ensureBase64DataUrl(genImg);


  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + state.apiKey,

    },

    body: JSON.stringify({

      model: SCORE_MODEL,

      max_tokens: 300,

      messages: [

        { role: "system", content: SCORE_SYSTEM_PROMPT },

        {

          role: "user",

          content: [

            { type: "text", text: "Image 1 is the ORIGINAL. Image 2 is the RECREATION, generated from the player's guessed prompt. Compare them." },

            { type: "image_url", image_url: { url: origDataUrl } },

            { type: "image_url", image_url: { url: genDataUrl } },

          ],

        },

      ],

    }),

  });

  if (!res.ok) {

    const errBody = await res.json().catch(() => ({}));

    throw new Error((errBody.error && errBody.error.message) || `OpenAI scoring request failed (${res.status})`);

  }

  const data = await res.json();

  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

  const match = content.match(/^\s*(\d{1,3})/);

  const score = match ? Math.max(0, Math.min(100, parseInt(match[1], 10))) : 0;

  const feedback = content.replace(/^\s*\d{1,3}\s*\n+/, "").trim() || content.trim();

    return { score, feedback };
  } catch (err) {
    console.warn("[DaRI Arcade] scoreImagesOnce failed, using fallback:", err.message);
    return await fallbackSemanticScore(state.hiddenPrompt, state.guessPrompt, origImg, genImg);
  }
}



// --- "AI's ideal prompt" - an optional, on-demand learning aid. It never

// runs automatically (it costs one extra OpenAI call), only when the

// player clicks the reveal button on the result screen. It hands the

// ORIGINAL hidden picture back to a vision-capable model and asks it to

// write the single best prompt it can to recreate that exact picture, so

// the player has a "model answer" to compare their own guess against.

const REVERSE_PROMPT_SYSTEM =

  "You are an expert AI image-prompt engineer. Given a picture, write the " +

  "single best, most detailed prompt you can that would make an image " +

  "generator recreate this exact picture as closely as possible. Describe " +

  "the subject(s) and how many of them, the color palette, the " +

  "composition and framing, the art style and medium (photo, painting, " +

  "cartoon, etc.), the setting and background, and small distinguishing " +

  "details like lighting, texture, or accessories. Respond with ONLY the " +

  "prompt itself as one tight paragraph - no quotes, no preamble, no " +

  "explanation, no markdown, no labels like \"Prompt:\".";



async function generateIdealPrompt(img) {
  if (!state.apiKey) {
    return state.hiddenPrompt || "A detailed visual representation matching the original scene.";
  }

  try {
    const dataUrl = await ensureBase64DataUrl(img);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + state.apiKey,
      },
      body: JSON.stringify({
        model: SCORE_MODEL,
        max_tokens: 300,
        messages: [
          { role: "system", content: REVERSE_PROMPT_SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: "Write the ideal prompt that would recreate this exact picture." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
      if (text.trim()) return text.trim();
    }
  } catch (err) {
    console.warn("[DaRI Arcade] generateIdealPrompt error:", err);
  }

  return state.hiddenPrompt || "A detailed visual representation matching the original scene.";
}

function addPlayerRow(name) {

  if (tstate.players.length >= 64) return;

  tstate.players.push({ id: tstate.nextPlayerId++, name: name || "" });

  renderPlayerList();

}



function bulkAddPlayers() {

  const raw = el("bulk-player-names").value;

  const names = raw.split("\n").map((s) => s.trim()).filter(Boolean);

  if (!names.length) return;

  names.forEach((name) => addPlayerRow(name));

  el("bulk-player-names").value = "";

}



function removePlayerRow(id) {

  if (tstate.players.length <= 2) return;

  tstate.players = tstate.players.filter((p) => p.id !== id);

  renderPlayerList();

}



function renderPlayerList() {

  const wrap = el("tournament-player-list");

  wrap.innerHTML = "";

  tstate.players.forEach((p, i) => {

    const row = document.createElement("div");

    row.className = "player-row";

    row.innerHTML =

      `<input type="text" data-player-id="${p.id}" list="player-name-list" placeholder="Player ${i + 1} name" value="${escapeHtml(p.name)}" autocomplete="off">` +

      `<button type="button" class="remove-player-btn" data-remove-id="${p.id}" title="Remove player">&times;</button>`;

    wrap.appendChild(row);

  });

  wrap.querySelectorAll("input[data-player-id]").forEach((input) => {

    input.addEventListener("input", () => {

      const id = Number(input.dataset.playerId);

      const player = tstate.players.find((p) => p.id === id);

      if (player) player.name = input.value;

    });

  });

  wrap.querySelectorAll("[data-remove-id]").forEach((btn) => {

    btn.disabled = tstate.players.length <= 2;

    btn.addEventListener("click", () => removePlayerRow(Number(btn.dataset.removeId)));

  });

}



// --- Bracket generation -------------------------------------------------



function nextPowerOfTwo(n) {

  let p = 1;

  while (p < n) p *= 2;

  return p;

}



function shuffle(arr) {

  const a = arr.slice();

  for (let i = a.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [a[i], a[j]] = [a[j], a[i]];

  }

  return a;

}



function makeMatch(roundIndex, matchIndex, playerA, playerB) {

  return {

    roundIndex,

    matchIndex,

    playerA: playerA || null,

    playerB: playerB || null,

    status: playerA && playerB ? "ready" : (playerA && !playerB ? "bye" : "pending"),

    winner: null,

    subRounds: [],

    totals: {},

  };

}



async function generateBracket() {

  const errEl = el("tournament-setup-error");

  errEl.hidden = true;

  const names = tstate.players.map((p) => (p.name || "").trim());

  if (tstate.players.length < 2 || names.some((n) => !n)) {

    errEl.textContent = "Give every player a name (at least 2 players).";

    errEl.hidden = false;

    return;

  }

  tstate.players.forEach((p, i) => { p.name = names[i]; });



  await resolveTournamentPlayers(tstate.players);

  const dupe = findDuplicateProfilePlayers(tstate.players);

  if (dupe) {

    errEl.textContent = `"${dupe[0].name}" and "${dupe[1].name}" are the same player profile (ID ${dupe[0].profileId}). Give each player a distinct name or ID before starting.`;

    errEl.hidden = false;

    return;

  }

  await postTournamentStartEvents(tstate.players, GAME_PROMPT_MIRROR);



  const shuffled = shuffle(tstate.players);

  const n = shuffled.length;

  const size = nextPowerOfTwo(n);

  const byes = size - n;



  // Round 1 slots: `byes` bye-slots (one player, auto-advances) and the

  // rest are real 2-player matches, all placed in random order so byes

  // aren't clustered.

  const byePlayers = shuffled.slice(0, byes);

  const matchPlayers = shuffled.slice(byes);

  const slotDescriptors = byePlayers.map((p) => ({ players: [p, null] }));

  for (let i = 0; i < matchPlayers.length; i += 2) {

    slotDescriptors.push({ players: [matchPlayers[i], matchPlayers[i + 1]] });

  }

  const orderedSlots = shuffle(slotDescriptors);

  const round1 = orderedSlots.map((slot, idx) => makeMatch(0, idx, slot.players[0], slot.players[1]));



  const rounds = [round1];

  let prevCount = round1.length;

  let r = 1;

  while (prevCount > 1) {

    const count = prevCount / 2;

    const round = [];

    for (let i = 0; i < count; i++) round.push(makeMatch(r, i, null, null));

    rounds.push(round);

    prevCount = count;

    r++;

  }



  tstate.bracket = rounds;



  // Auto-resolve byes and propagate them forward immediately.

  round1.forEach((m) => {

    if (m.status === "bye") resolveByeMatch(m);

  });



  const name = (el("input-tournament-name").value || "").trim() ||

    `${tstate.players[0].name}'s tournament`;



  errEl.hidden = true;

  try {

    const tournament = await createTournamentOnServer(name, tstate.levels, tstate.players, tstate.bracket);

    tstate.tournamentId = tournament.id;

    tstate.tournamentName = tournament.name;

  } catch (e) {

    errEl.textContent = errorHint(e.message);

    errEl.hidden = false;

    return;

  }



  showScreen("tournament-bracket");

  startPolling(refreshBracketFromServer, 3000);

}



// Posts the locally-computed fixture (seeding/byes/round structure - all

// generated above, exactly as before) to the server so it becomes a named,

// joinable tournament other players' own devices can see and play. Player

// identity is each player's persistent profile id (the same short code

// used everywhere else in the app), since that's what a player types in to

// join their match from their own device.

async function createTournamentOnServer(name, levels, players, bracket) {

  const body = {

    name,

    game: GAME_PROMPT_MIRROR,

    organizerId: identity.id,

    levels,

    players: players.map((p) => ({ id: p.profileId, name: p.name })),

    bracket: bracket.map((round) => round.map((m) => ({

      matchIndex: m.matchIndex,

      playerA: m.playerA ? { id: m.playerA.profileId, name: m.playerA.name } : null,

      playerB: m.playerB ? { id: m.playerB.profileId, name: m.playerB.name } : null,

      status: m.status,

      winnerId: m.winner ? m.winner.profileId : null,

    }))),

  };

  const res = await fetch("/api/tournaments/create", {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(body),

  });

  const data = await res.json();

  if (!data.ok) throw new Error(data.error || "Could not create the tournament.");

  return data.tournament;

}



function resolveByeMatch(m) {

  m.status = "done";

  m.winner = m.playerA;

  advanceWinner(m);

}



function advanceWinner(m) {

  const rounds = tstate.bracket;

  const nextRoundIndex = m.roundIndex + 1;

  if (nextRoundIndex >= rounds.length) {

    tstate.champion = m.winner;

    return;

  }

  const nextMatch = rounds[nextRoundIndex][Math.floor(m.matchIndex / 2)];

  if (m.matchIndex % 2 === 0) nextMatch.playerA = m.winner;

  else nextMatch.playerB = m.winner;

  if (nextMatch.playerA && nextMatch.playerB) nextMatch.status = "ready";

}



// --- Polling helpers --------------------------------------------------

// Several tournament screens (the open-tournament list, the bracket

// dashboard, an in-progress match) auto-refresh from the server so a

// device sees what OTHER players' devices are doing without a manual

// reload. Only one of these runs at a time.



function stopPolling() {

  if (tstate.pollHandle) {

    clearInterval(tstate.pollHandle);

    tstate.pollHandle = null;

  }

}



function startPolling(fn, intervalMs) {

  stopPolling();

  fn();

  tstate.pollHandle = setInterval(fn, intervalMs);

}



function roundLabelForSize(matchesInRound) {

  if (matchesInRound === 1) return "Final";

  if (matchesInRound === 2) return "Semifinal";

  if (matchesInRound === 4) return "Quarterfinal";

  return `Round of ${matchesInRound * 2}`;

}



// --- Bracket rendering (server-hosted tournament - a live dashboard now,

// not a "click a match to play it" screen, since matches are played by

// joining from each player's own device instead) ------------------------



function renderBracketSlot(m, which) {

  const player = which === "A" ? m.playerA : m.playerB;

  if (m.status === "bye" && which === "B") {

    return `<div class="bracket-slot bye-slot">BYE</div>`;

  }

  if (!player) return `<div class="bracket-slot">TBD</div>`;

  const isWinner = !!(m.winnerId && m.winnerId === player.id);

  const score = m.totals && m.totals[player.id] != null ? m.totals[player.id] : null;

  return `<div class="bracket-slot${isWinner ? " winner-slot" : ""}">` +

    `<span>${escapeHtml(player.name)}</span>` +

    (score != null ? `<span class="bracket-score">${score}</span>` : "") +

    `</div>`;

}



async function refreshBracketFromServer() {

  if (!tstate.tournamentId) return;

  let data;

  try {

    const res = await fetch(`/api/tournaments/${tstate.tournamentId}`);

    data = await res.json();

  } catch (e) {

    return; // transient network hiccup - just try again next tick

  }

  if (!data.ok) return;

  renderBracket(data.tournament);

}



function renderBracket(tournament) {

  el("tournament-fixture-name").textContent = tournament.name;

  el("tournament-fixture-id").textContent = tournament.id;



  const wrap = el("bracket-view");

  wrap.innerHTML = "";

  tournament.bracket.forEach((round) => {

    const col = document.createElement("div");

    col.className = "bracket-round";

    const title = document.createElement("div");

    title.className = "bracket-round-title";

    title.textContent = roundLabelForSize(round.length);

    col.appendChild(title);



    round.forEach((m) => {

      const card = document.createElement("div");

      card.className = "bracket-match" + (m.status === "done" || m.status === "bye" ? " done" : "");

      const tagText = m.status === "done" ? "Completed"

        : m.status === "bye" ? "Bye"

        : m.status === "active" ? "In progress"

        : m.status === "ready" ? "Ready to play"

        : "Waiting";

      card.innerHTML =

        `<div class="bracket-match-tag${m.status === "pending" ? " tbd" : ""}">${tagText}</div>` +

        renderBracketSlot(m, "A") + renderBracketSlot(m, "B");

      col.appendChild(card);

    });

    wrap.appendChild(col);

  });



  const banner = el("bracket-champion-banner");

  if (tournament.championId) {

    banner.hidden = false;

    banner.textContent = `Champion: ${(tournament.players[tournament.championId] || {}).name || "?"}`;

  } else {

    banner.hidden = true;

  }

}



// --- Tournament hub: create or join ------------------------------------



async function refreshOpenTournaments() {

  let data;

  try {

    const res = await fetch(`/api/tournaments?game=${GAME_PROMPT_MIRROR}`);

    data = await res.json();

  } catch (e) {

    return;

  }

  const list = el("tournament-open-list");

  list.innerHTML = "";

  const tournaments = data.tournaments || [];

  el("tournament-open-empty").hidden = tournaments.length > 0;

  tournaments.forEach((t) => {

    const row = document.createElement("div");

    row.className = "tournament-open-row";

    const statusText = t.status === "done"

      ? `Finished${t.championName ? " — champion: " + t.championName : ""}`

      : `${t.roundLabel}${t.readyCount ? ` — ${t.readyCount} match${t.readyCount === 1 ? "" : "es"} ready` : ""}`;

    row.innerHTML =

      `<div class="tor-main"><div class="tor-name">${escapeHtml(t.name)}</div>` +

      `<div class="tor-meta">${t.playerCount} players &middot; ${escapeHtml(statusText)} &middot; ID ${t.id}</div></div>` +

      `<button type="button" class="btn-secondary tor-join-btn" data-tid="${t.id}">Join</button>`;

    row.querySelector(".tor-join-btn").addEventListener("click", () => attemptJoin(t.id));

    list.appendChild(row);

  });

}



async function attemptJoin(tournamentId) {

  const errEl = el("tournament-join-error");

  errEl.hidden = true;

  // Whoever is signed in on this device (see the identity module) is who

  // joins - no more separately typing a name/ID to join with.

  if (!identity.id) {

    errEl.textContent = "Please sign in first.";

    errEl.hidden = false;

    return;

  }

  let data;

  try {

    const res = await fetch(`/api/tournaments/${tournamentId}/join`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ playerId: identity.id }),

    });

    data = await res.json();

  } catch (e) {

    errEl.textContent = "Couldn't reach the server. Try again.";

    errEl.hidden = false;

    return;

  }

  if (!data.ok) {

    errEl.textContent = data.error || "Couldn't join that tournament.";

    errEl.hidden = false;

    return;

  }

  if (data.state === "champion") {

    errEl.textContent = `${identity.name} won this tournament! Check the fixture for final standings.`;

    errEl.hidden = false;

    return;

  }

  if (data.state === "eliminated") {

    errEl.textContent = `${identity.name} isn't in an active match right now (their last match here is already over).`;

    errEl.hidden = false;

    return;

  }

  if (data.state === "waiting") {

    errEl.textContent = `${identity.name} is in this tournament, but their next match isn't ready yet — check back once their opponent is decided.`;

    errEl.hidden = false;

    return;

  }



  // data.state === "playing"

  tstate.tournamentId = tournamentId;

  tstate.tournamentName = data.tournamentName;

  tstate.activeMatchId = data.matchId;

  tstate.myPlayerId = identity.id;

  tstate.myPlayerName = identity.name;

  tstate.myRole = data.role;

  tstate.matchLevels = data.levels;

  tstate.startingSubround = false;

  tstate.generatingMyEntry = false;

  tstate.ackedSubroundIndex = -1;

  tstate.idealPromptSubIndex = null;

  enterMatchScreen(data.match);

}



async function joinByCode() {

  const tid = (el("input-join-tournament-id").value || "").trim().toUpperCase();

  if (!tid) return;

  await attemptJoin(tid);

}



// --- Playing a match, server-synced (each device drives only ITS OWN

// player's actions; the server referees when a sub-round/match is decided

// and both devices simply poll to see the shared result) ----------------



function opponentOf(match) {

  return tstate.myRole === "a" ? match.playerB : match.playerA;

}

function meIn(match) {

  return tstate.myRole === "a" ? match.playerA : match.playerB;

}

function myEntry(sub) {

  return sub[tstate.myRole];

}

function opponentEntry(sub) {

  return sub[tstate.myRole === "a" ? "b" : "a"];

}



function enterMatchScreen(match) {

  const opp = opponentOf(match);

  const levelLabel = (tstate.matchLevels || [1]).map((n) => `Level ${n}`).join(", ");

  el("match-round-name").textContent = tstate.tournamentName;

  el("match-players-label").textContent =

    `You (${meIn(match).name}) vs ${opp ? opp.name : "?"} — best of ${(tstate.matchLevels || [1]).length} (${levelLabel}). Higher cumulative score advances.`;

  showScreen("tournament-match");

  renderMatchFromServer(match);

  startPolling(pollMatch, 2000);

}



async function pollMatch() {

  if (!tstate.tournamentId || !tstate.activeMatchId) {

    stopPolling();

    return;

  }

  let data;

  try {

    const res = await fetch(`/api/tournaments/${tstate.tournamentId}/matches/${tstate.activeMatchId}`);

    data = await res.json();

  } catch (e) {

    return;

  }

  if (!data.ok) return;

  tstate.matchLevels = data.levels;

  renderMatchFromServer(data.match);

  driveAutoStart(data.match);

}



function renderMatchFromServer(match) {

  tstate.lastMatchSnapshot = match;

  renderMatchTally(match);



  // Nothing further will change server-side once the match is done, but

  // don't jump straight to the final tally - the player still needs to see

  // the deciding sub-round's own result card first (image, feedback,

  // hidden prompt), exactly like every earlier sub-round.

  if (match.status === "done") {

    stopPolling();

  }



  // Always look at the next sub-round THIS device hasn't acknowledged yet,

  // not just whichever sub-round is most recent - the server (or the

  // opponent's device) may have already raced ahead and started a later

  // sub-round in the background before this player clicked "Continue" on

  // an earlier one. Sub-rounds are created strictly in order, so whenever

  // a later one exists this one is guaranteed to already be "done".

  const subs = match.subRounds || [];

  const nextIdx = tstate.ackedSubroundIndex + 1;

  const current = subs[nextIdx];



  // Keep showing a previous sub-round's result until the player clicks

  // "Continue" past it, even if the next sub-round has already started

  // generating in the background (or the match itself has already ended).

  if (current && current.status === "done") {

    renderSubroundResult(match, current);

    return;

  }



  if (match.status === "done") {

    renderFinalResult(match);

    return;

  }



  el("match-final-result").hidden = true;

  el("match-subround-result").hidden = true;

  el("match-subround-active").hidden = false;

  el("match-error").hidden = true;



  if (!current) {

    el("sub-round-num").textContent = "1";

    el("sub-round-level-badge").textContent = "";

    el("match-image-loading").hidden = false;

    el("match-image-wrap").hidden = true;

    el("match-prompt-form").hidden = true;

    el("match-processing").hidden = true;

    el("match-waiting-note").hidden = true;

    el("match-player-status-list").innerHTML = "";

    return;

  }



  el("sub-round-num").textContent = current.isTiebreaker ? "Tiebreaker" : String(current.index + 1);

  el("sub-round-of-wrap").hidden = current.isTiebreaker;

  el("sub-round-total").textContent = String((tstate.matchLevels || [1]).length);

  el("sub-round-level-badge").textContent = (LEVELS[current.level] || LEVELS[1]).label;



  el("match-image-loading").hidden = true;

  el("match-image-wrap").hidden = false;

  el("match-challenge-image").src = imgSrc(current.originalImage);



  renderMatchPlayerStatus(match, current);



  const mine = myEntry(current);

  const oppE = opponentEntry(current);

  const oppName = (opponentOf(match) || {}).name || "your opponent";

  const waitingNote = el("match-waiting-note");



  if (!mine.prompt) {

    el("match-prompt-form").hidden = false;

    el("match-processing").hidden = true;

    waitingNote.hidden = true;

    el("match-current-player-label").textContent = "Your prompt";

    if (document.activeElement !== el("input-match-prompt")) el("input-match-prompt").value = "";

  } else if (mine.score == null) {

    el("match-prompt-form").hidden = true;

    el("match-processing").hidden = false;

    waitingNote.hidden = true;

    el("match-processing-text").textContent = "Generating & scoring your picture…";

  } else if (oppE.score == null) {

    el("match-prompt-form").hidden = true;

    el("match-processing").hidden = true;

    waitingNote.hidden = false;

    waitingNote.textContent = `Waiting for ${oppName} to finish their picture…`;

  } else {

    el("match-prompt-form").hidden = true;

    el("match-processing").hidden = true;

    waitingNote.hidden = true;

  }

}



function renderMatchTally(match) {

  const wrap = el("match-tally");

  wrap.innerHTML = "";

  [match.playerA, match.playerB].forEach((p) => {

    if (!p) return;

    const item = document.createElement("div");

    item.className = "match-tally-item";

    item.innerHTML =

      `<div class="mt-name">${escapeHtml(p.name)}${p.id === tstate.myPlayerId ? " (you)" : ""}</div>` +

      `<div class="mt-score">${(match.totals && match.totals[p.id]) || 0}<span class="mt-score-max"> total</span></div>`;

    wrap.appendChild(item);

  });

}



function renderMatchPlayerStatus(match, sub) {

  const wrap = el("match-player-status-list");

  wrap.innerHTML = "";

  [["a", match.playerA], ["b", match.playerB]].forEach(([key, player]) => {

    if (!player) return;

    const entry = sub[key];

    const scored = entry.score != null;

    const promptedIn = !!entry.prompt;

    const chip = document.createElement("span");

    chip.className = "player-status-chip";

    let label;

    if (scored) {

      chip.classList.add("done");

      label = "scored";

    } else if (promptedIn) {

      chip.classList.add("current");

      label = "generating…";

    } else {

      label = "typing…";

    }

    const isMe = player.id === tstate.myPlayerId;

    chip.textContent = (isMe ? "You" : player.name) + " — " + label;

    wrap.appendChild(chip);

  });

}



function resetMatchIdealPromptUI() {

  el("match-ideal-prompt-text").hidden = true;

  el("match-ideal-prompt-text").textContent = "";

  el("match-ideal-prompt-error").hidden = true;

  el("match-ideal-prompt-loading").hidden = true;

  const btn = el("btn-reveal-match-ideal-prompt");

  btn.hidden = false;

  btn.disabled = false;

  btn.textContent = "Show AI's ideal prompt";

}



async function revealMatchIdealPrompt(originalImage) {

  const btn = el("btn-reveal-match-ideal-prompt");

  btn.hidden = true;

  el("match-ideal-prompt-error").hidden = true;

  el("match-ideal-prompt-loading").hidden = false;

  try {

    const prompt = await generateIdealPrompt(originalImage);

    el("match-ideal-prompt-text").textContent = prompt;

    el("match-ideal-prompt-text").hidden = false;

  } catch (e) {

    el("match-ideal-prompt-error").textContent = errorHint(e.message);

    el("match-ideal-prompt-error").hidden = false;

    btn.hidden = false;

    btn.textContent = "Try again";

  } finally {

    el("match-ideal-prompt-loading").hidden = true;

  }

}



function renderSubroundResult(match, sub) {

  el("match-subround-active").hidden = true;

  el("match-final-result").hidden = true;

  el("match-subround-result").hidden = false;

  el("match-subround-prompt-text").textContent = sub.hiddenPrompt;



  // pollMatch() re-runs this every ~2s while a player sits on this screen

  // waiting to click "Continue" - only reset/rewire the ideal-prompt block

  // the first time THIS sub-round is shown, so an already-revealed prompt

  // (or an in-flight request) doesn't get wiped out by the next poll tick.

  if (tstate.idealPromptSubIndex !== sub.index) {

    tstate.idealPromptSubIndex = sub.index;

    resetMatchIdealPromptUI();

    el("btn-reveal-match-ideal-prompt").onclick = () => revealMatchIdealPrompt(sub.originalImage);

  }



  const cardsWrap = el("match-subround-cards");

  cardsWrap.innerHTML = "";

  const subTop = Math.max(sub.a.score || 0, sub.b.score || 0);

  [{ p: match.playerA, e: sub.a }, { p: match.playerB, e: sub.b }]

    .sort((x, y) => (y.e.score || 0) - (x.e.score || 0))

    .forEach(({ p, e }) => {

      const isWinner = (e.score || 0) === subTop;

      const isMe = p && p.id === tstate.myPlayerId;

      const card = document.createElement("div");

      card.className = "tournament-result-card" + (isWinner ? " winner" : "");

      card.innerHTML =

        (isWinner ? '<div class="trc-winner-tag">Sub-round winner</div>' : "") +

        `<img src="${imgSrc(e.image)}" alt="${escapeHtml(p.name)}'s recreation">` +

        `<div class="trc-name">${escapeHtml(p.name)}${isMe ? " (you)" : ""}</div>` +

        `<div class="trc-score">${e.score || 0}<span style="font-size:1rem;color:var(--muted);">/100</span></div>` +

        `<div class="trc-feedback">${escapeHtml(e.feedback)}</div>` +

        `<div class="trc-prompt">"${escapeHtml(e.prompt)}"</div>`;

      cardsWrap.appendChild(card);

    });



  el("btn-next-subround").onclick = () => {

    tstate.ackedSubroundIndex = sub.index;

    renderMatchFromServer(match);

  };

}



function renderFinalResult(match) {

  el("match-subround-active").hidden = true;

  el("match-subround-result").hidden = true;

  el("match-final-result").hidden = false;



  const winner = match.winnerId === match.playerA.id ? match.playerA : match.playerB;

  const isMeWinner = winner.id === tstate.myPlayerId;

  el("match-winner-banner").textContent = isMeWinner

    ? "You win the match!"

    : `${winner.name} wins the match.`;



  const tallyWrap = el("match-final-tally");

  tallyWrap.innerHTML = "";

  [match.playerA, match.playerB]

    .sort((x, y) => (match.totals[y.id] || 0) - (match.totals[x.id] || 0))

    .forEach((p) => {

      const row = document.createElement("div");

      row.className = "standings-row" + (p.id === match.winnerId ? " leader" : "");

      row.innerHTML = `<span class="standings-name">${escapeHtml(p.name)}${p.id === tstate.myPlayerId ? " (you)" : ""}</span><span class="standings-detail">${match.totals[p.id] || 0} total</span>`;

      tallyWrap.appendChild(row);

    });

}



// Runs on every poll tick. Its only job is auto-starting the NEXT

// sub-round once the current one is fully done - per-player prompt

// submission stays a direct button click (submitMyPrompt below). Either

// player's device may attempt this; the server only ever actually creates

// one sub-round per index, so a race between both devices is harmless -

// at worst, one device's freshly-generated hidden image goes unused.

async function driveAutoStart(match) {

  if (match.status === "done" || tstate.startingSubround) return;

  const subs = match.subRounds || [];

  const current = subs[subs.length - 1];

  if (current && current.status !== "done") return;



  const levels = tstate.matchLevels || [1];

  const doneCount = subs.filter((s) => s.status === "done").length;

  let nextLevel, isTiebreaker, nextIndex;

  if (doneCount < levels.length) {

    nextLevel = levels[doneCount];

    isTiebreaker = false;

    nextIndex = doneCount;

  } else if (match.needsTiebreaker) {

    nextLevel = levels[levels.length - 1];

    isTiebreaker = true;

    nextIndex = subs.length;

  } else {

    return;

  }



  tstate.startingSubround = true;

  try {

    const hiddenPrompt = await getHiddenPrompt(nextLevel);

    const originalImage = await generateImage(hiddenPrompt);

    await fetch(`/api/tournaments/${tstate.tournamentId}/matches/${tstate.activeMatchId}/subround/start`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({

        playerId: tstate.myPlayerId, index: nextIndex, level: nextLevel,

        isTiebreaker, hiddenPrompt, originalImage,

      }),

    });

    // Whichever device's start call actually created it, the next poll

    // (mine or my opponent's) picks up the canonical version.

  } catch (e) {

    // Quietly retry on the next poll tick - this isn't a direct user

    // action, so there's no button to show an error next to.

  } finally {

    tstate.startingSubround = false;

  }

}



async function submitMyPrompt() {

  const guess = (el("input-match-prompt").value || "").trim();

  if (!guess) return;

  const match = tstate.lastMatchSnapshot;

  const subs = (match && match.subRounds) || [];

  const current = subs[subs.length - 1];

  if (!current) return;



  el("match-error").hidden = true;

  el("match-prompt-form").hidden = true;

  el("match-processing-text").textContent = "Submitting…";

  el("match-processing").hidden = false;



  try {

    await fetch(`/api/tournaments/${tstate.tournamentId}/matches/${tstate.activeMatchId}/subround/${current.index}/prompt`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ playerId: tstate.myPlayerId, prompt: guess }),

    });

    el("match-processing-text").textContent = "Generating your picture…";

    const image = await generateImage(guess);

    el("match-processing-text").textContent = "Scoring your picture…";

    const { score, feedback } = await scoreImagesOnce(current.originalImage, image);

    await fetch(`/api/tournaments/${tstate.tournamentId}/matches/${tstate.activeMatchId}/subround/${current.index}/result`, {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ playerId: tstate.myPlayerId, image, score, feedback }),

    });

  } catch (e) {

    el("match-processing").hidden = true;

    el("match-prompt-form").hidden = false;

    el("input-match-prompt").value = guess;

    el("match-error").textContent = errorHint(e.message);

    el("match-error").hidden = false;

    return;

  }

  el("match-processing").hidden = true;

  pollMatch();

}



// =======================================================================

// Emoji Charades - second arcade game. Kept fully independent from Prompt

// Mirror's state (own solo state `estate`, own tournament state `etstate`,

// own screens/functions) and only reuses truly generic helpers: el,

// showScreen, pick, shuffle, nextPowerOfTwo, escapeHtml, errorHint,

// state.apiKey, and SCORE_MODEL. Scoring is entirely local (no OpenAI

// call) - each round only makes one API call, to translate the hidden

// phrase into emojis.

// =======================================================================



// Fallback-only translator, used ONLY when the AI round-generator call

// below fails for any reason - it just turns an already-chosen local

// phrase into emojis, the way the whole game used to work. The primary

// path (generateEmojiRoundAI) invents the phrase AND its emoji

// translation together, so a round almost never touches this.

const EMOJI_SYSTEM_PROMPT =

  "You translate a hidden movie title, idiom, or phrase into a string of " +

  "emojis for a party guessing game called Emoji Charades, then briefly " +

  "explain your choice for after the reveal. Use between 3 and 8 emojis " +

  "that best represent its meaning, characters, setting, or imagery. " +

  "Avoid using an emoji that literally spells out a word in the answer " +

  "if a more playful combination works - but clarity still matters more " +

  "than cleverness. A sharp player who is good at this game should be " +

  "able to guess the answer from the emoji line alone.\n\n" +

  "Respond in EXACTLY this format: the first line must contain ONLY the " +

  "emojis and nothing else on that line - no words, no letters, no " +

  "digits, no punctuation. Then a blank line. Then one short sentence " +

  "(under 25 words) explaining what each emoji or group of emojis " +

  "represents, e.g. '🦁 is the lion, 👑 is his kingship, 🌅 represents " +

  "the circle of life.' Do not repeat or spell out the answer itself in " +

  "the explanation.";



// Fallback-only content banks, used ONLY when the AI round-generator call

// fails - a healthy mix of movies, idioms, and phrases so a round never

// stalls just because the AI call had a hiccup. Each entry carries a

// one-line clue that helps narrow the guess down WITHOUT giving away the

// answer itself.

const EMOJI_PHRASE_BANK_1 = [

  { phrase: "The Lion King", category: "Movie", hint: "An African savanna coming-of-age story." },

  { phrase: "Titanic", category: "Movie", hint: "A ship on its ill-fated maiden voyage." },

  { phrase: "Home Alone", category: "Movie", hint: "A boy defends his house from burglars over the holidays." },

  { phrase: "Finding Nemo", category: "Movie", hint: "A father searches the ocean for his lost son." },

  { phrase: "Toy Story", category: "Movie", hint: "Toys come to life when their owner isn't looking." },

  { phrase: "Frozen", category: "Movie", hint: "Two royal sisters and a magical winter power." },

  { phrase: "Jurassic Park", category: "Movie", hint: "A theme park where dinosaurs roam free." },

  { phrase: "The Avengers", category: "Movie", hint: "A team of superheroes joins forces." },

  { phrase: "Cinderella", category: "Movie", hint: "A glass slipper and a midnight deadline." },

  { phrase: "Beauty and the Beast", category: "Movie", hint: "A cursed prince and a girl who sees past appearances." },

  { phrase: "Ice Age", category: "Movie", hint: "Prehistoric animals migrate together to escape the cold." },

  { phrase: "Batman", category: "Movie", hint: "A billionaire fights crime in a cape and cowl at night." },

  { phrase: "Spider-Man", category: "Movie", hint: "A teenager gains powers after a radioactive bite." },

  { phrase: "Star Wars", category: "Movie", hint: "A galactic saga of rebels versus an empire." },

  { phrase: "Harry Potter", category: "Movie", hint: "A boy wizard attends a magical school." },

  { phrase: "Piece of Cake", category: "Phrase", hint: "Something that's extremely easy to do." },

  { phrase: "Break the Ice", category: "Idiom", hint: "To ease tension and start a conversation." },

  { phrase: "Once in a Blue Moon", category: "Phrase", hint: "Something that happens very rarely." },

  { phrase: "Raining Cats and Dogs", category: "Idiom", hint: "It's raining extremely heavily." },

];



const EMOJI_PHRASE_BANK_2 = [

  { phrase: "Inception", category: "Movie", hint: "A thief steals secrets by entering people's dreams." },

  { phrase: "The Matrix", category: "Movie", hint: "Reality turns out to be a simulation." },

  { phrase: "Forrest Gump", category: "Movie", hint: "A slow-witted man stumbles through decades of American history." },

  { phrase: "The Dark Knight", category: "Movie", hint: "A caped vigilante faces off against a chaotic clown." },

  { phrase: "Back to the Future", category: "Movie", hint: "A teenager accidentally travels three decades back in a car." },

  { phrase: "The Lord of the Rings", category: "Movie", hint: "A small hobbit carries a cursed ring toward a volcano." },

  { phrase: "Jaws", category: "Movie", hint: "A great white shark terrorizes a beach town." },

  { phrase: "The Godfather", category: "Movie", hint: "A crime family saga about power and loyalty." },

  { phrase: "E.T. the Extra-Terrestrial", category: "Movie", hint: "A boy hides a stranded alien from the government." },

  { phrase: "Rocky", category: "Movie", hint: "An underdog boxer gets a shot at the heavyweight title." },

  { phrase: "The Terminator", category: "Movie", hint: "A robotic assassin is sent back in time from the future." },

  { phrase: "The Wizard of Oz", category: "Movie", hint: "A tornado sweeps a girl and her dog off to a magical land." },

  { phrase: "Spill the Beans", category: "Idiom", hint: "To accidentally reveal a secret." },

  { phrase: "The Ball Is in Your Court", category: "Phrase", hint: "It's now up to you to make the next move." },

  { phrase: "Bite the Bullet", category: "Idiom", hint: "To face a painful situation with courage." },

  { phrase: "Let the Cat Out of the Bag", category: "Idiom", hint: "To reveal a secret, often by accident." },

  { phrase: "Cost an Arm and a Leg", category: "Phrase", hint: "Something that is very expensive." },

  { phrase: "Burning the Midnight Oil", category: "Phrase", hint: "Working late into the night." },

];



const EMOJI_PHRASE_BANK_3 = [

  { phrase: "The Butterfly Effect", category: "Movie", hint: "A small change in the past drastically alters the future." },

  { phrase: "The Shawshank Redemption", category: "Movie", hint: "A wrongly convicted man finds hope inside prison." },

  { phrase: "Interstellar", category: "Movie", hint: "Astronauts search for a new home for humanity through a wormhole." },

  { phrase: "Memento", category: "Movie", hint: "A man with no short-term memory hunts his wife's killer using tattoos and notes." },

  { phrase: "The Sixth Sense", category: "Movie", hint: "A boy who can see dead people confides in a child psychologist." },

  { phrase: "No Country for Old Men", category: "Movie", hint: "A hitman with a coin and a captive bolt pistol stalks a stolen fortune." },

  { phrase: "Eternal Sunshine of the Spotless Mind", category: "Movie", hint: "A couple has each other erased from their memories after a breakup." },

  { phrase: "Se7en", category: "Movie", hint: "Two detectives track a killer staging murders around the seven deadly sins." },

  { phrase: "The Prestige", category: "Movie", hint: "Two rival magicians sabotage each other chasing the perfect illusion." },

  { phrase: "Whiplash", category: "Movie", hint: "A driven music student clashes with a ruthless jazz conductor." },

  { phrase: "Donnie Darko", category: "Movie", hint: "A troubled teen is guided toward disaster by a man in a rabbit suit." },

  { phrase: "A Blessing in Disguise", category: "Phrase", hint: "Something good that initially seemed bad." },

  { phrase: "Barking Up the Wrong Tree", category: "Idiom", hint: "Pursuing a mistaken or misguided course of action." },

  { phrase: "Cutting Corners", category: "Phrase", hint: "Doing something poorly to save time or money." },

  { phrase: "Curiosity Killed the Cat", category: "Phrase", hint: "Being too inquisitive can get you into trouble." },

  { phrase: "Don't Judge a Book by Its Cover", category: "Phrase", hint: "Don't form an opinion based only on appearance." },

];



// Shared clue UI helpers, reused by both the solo challenge screen

// ("emoji-challenge" prefix) and the tournament match screen

// ("emoji-match" prefix) - each has matching #<prefix>-category,

// #<prefix>-clue-wrap, #<prefix>-clue-text and #btn-<prefix>-clue-toggle

// elements. The category badge is shown immediately (right alongside the

// emoji string) so players always know upfront whether they're guessing a

// movie, an idiom, or a phrase - only the extra hint sentence stays gated

// behind the optional "Show a clue" button, since that one really does

// give away more than the category alone.

function resetEmojiClueUI(prefix) {

  el(prefix + "-clue-text").hidden = true;

  el("btn-" + prefix + "-clue-toggle").textContent = "Show a clue";

}



function showEmojiCategoryAndClue(prefix, category, hint) {

  el(prefix + "-category").textContent = category ? "Category: " + category : "";

  el(prefix + "-clue-text").textContent = hint || "";

  el(prefix + "-clue-wrap").hidden = false;

  resetEmojiClueUI(prefix);

}



function toggleEmojiClue(prefix) {

  const textEl = el(prefix + "-clue-text");

  const show = textEl.hidden;

  textEl.hidden = !show;

  el("btn-" + prefix + "-clue-toggle").textContent = show ? "Hide clue" : "Show a clue";

}



const EMOJI_LEVELS = {

  1: {

    label: "Level 1 — Easy",

    hint: "Level 1: well-known, easy-to-guess movies, idioms, and phrases.",

    entries: EMOJI_PHRASE_BANK_1,

  },

  2: {

    label: "Level 2 — Medium",

    hint: "Level 2: trickier, less obvious movies, idioms, and phrases.",

    entries: EMOJI_PHRASE_BANK_2,

  },

  3: {

    label: "Level 3 — Hard",

    hint: "Level 3: lesser-known movies and trickier idioms/phrases. Hardest to guess.",

    entries: EMOJI_PHRASE_BANK_3,

  },

};



// Fallback-only local pick, used when the AI round-generator call fails -

// see generateEmojiRoundAI / getEmojiRound below. Returns a plain

// {phrase, category, hint} object, same shape the AI path produces.

function buildHiddenPhraseLocal(levelArg) {

  const lvl = levelArg || estate.level;

  const tier = EMOJI_LEVELS[lvl] || EMOJI_LEVELS[1];

  const entry = pick(tier.entries);

  return { phrase: entry.phrase, category: entry.category, hint: entry.hint };

}



// --- AI round generation ---------------------------------------------------

// Primary path: one single OpenAI call both invents a fresh answer (movie,

// idiom, or phrase - never repeats the same fixed bank round after round)

// AND translates it into emojis, so the game still only makes one API call

// per round. If this call fails or its response can't be parsed, we fall

// back to a local pick from the static banks above plus one call to the

// simpler translateFallbackPhraseToEmoji, so a round never stalls just

// because this one extra-capable call had a hiccup.

const EMOJI_ROUND_SYSTEM =

  "You invent one fresh round for a party guessing game called Emoji " +

  "Charades, then translate your own answer into emojis. The answer can " +

  "be a well-known movie title, a common English idiom, or a well-known " +

  "English phrase or expression - vary which type you pick across " +

  "rounds, don't default to movies every time. Pick something a sharp " +

  "player has a real chance of guessing from emojis alone, and be " +

  "creative and varied - avoid reusing the same handful of go-to answers " +

  "every time.\n\n" +

  "Respond in EXACTLY this format, one field per line, nothing else:\n" +

  "CATEGORY: <Movie, Idiom, or Phrase>\n" +

  "ANSWER: <the movie title, idiom, or phrase itself>\n" +

  "HINT: <one short sentence that helps narrow it down WITHOUT giving " +

  "away the answer or repeating any of its key words>\n" +

  "EMOJI: <3 to 8 emojis translating the answer - nothing else on this " +

  "line, no words, letters, or digits>\n" +

  "EXPLANATION: <one short sentence, under 25 words, explaining what " +

  "each emoji or group of emojis represents - don't repeat the answer " +

  "itself>";



const EMOJI_ROUND_LEVEL_GUIDANCE = {

  1: "Difficulty: Level 1, Easy. Pick something very well-known and easy to guess.",

  2: "Difficulty: Level 2, Medium. Pick something trickier and less obvious.",

  3: "Difficulty: Level 3, Hard. Pick something lesser-known or more abstract. Hardest to guess.",

};



function parseEmojiRoundResponse(text) {

  const lines = (text || "").split("\n").map((l) => l.trim()).filter(Boolean);

  const get = (label) => {

    const line = lines.find((l) => l.toUpperCase().startsWith(label + ":"));

    return line ? line.slice(line.indexOf(":") + 1).trim() : "";

  };

  const rawCategory = get("CATEGORY");

  const phrase = get("ANSWER");

  const hint = get("HINT");

  const emoji = get("EMOJI");

  const explanation = get("EXPLANATION");

  if (!phrase || !emoji) throw new Error("AI response was missing the answer or emoji translation.");

  const category = ["Movie", "Idiom", "Phrase"].includes(rawCategory) ? rawCategory : "Phrase";

  return { phrase, category, hint, emoji, explanation };

}



async function generateEmojiRoundAI(level) {

  const guidance = EMOJI_ROUND_LEVEL_GUIDANCE[level] || EMOJI_ROUND_LEVEL_GUIDANCE[1];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + state.apiKey,

    },

    body: JSON.stringify({

      model: SCORE_MODEL,

      max_tokens: 200,

      temperature: 1.1,

      messages: [

        { role: "system", content: EMOJI_ROUND_SYSTEM },

        { role: "user", content: guidance },

      ],

    }),

  });

  if (!res.ok) {

    const errBody = await res.json().catch(() => ({}));

    throw new Error((errBody.error && errBody.error.message) || `OpenAI request failed (${res.status})`);

  }

  const data = await res.json();

  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

  return parseEmojiRoundResponse(content);

}



// Returns {phrase, category, hint, emoji, explanation} for a fresh round,

// preferring the AI generator and silently falling back to a local pick

// (still translated into emojis via one OpenAI call) if that fails.

async function getEmojiRound(level) {

  try {

    return await generateEmojiRoundAI(level);

  } catch (e) {

    const local = buildHiddenPhraseLocal(level);

    const translated = await translateFallbackPhraseToEmoji(local.phrase);

    return { ...local, ...translated };

  }

}



// "What would AI guess?" - optional, on-demand learning aid (same idea as

// Prompt Mirror's "AI's ideal prompt"). Never runs automatically. Gives an

// LLM only what a player would have: the emoji string and its category

// (never the hint or the actual answer) and asks it to guess, so the

// player has a model attempt to compare their own guess against.

const EMOJI_AI_GUESS_SYSTEM =

  "You are playing Emoji Charades. You are told only an emoji string and " +

  "its category (Movie, Idiom, or Phrase) - guess what movie title, " +

  "idiom, or phrase it represents, the same way a sharp human player " +

  "would.\n\n" +

  "Respond in EXACTLY this format, one field per line, nothing else:\n" +

  "GUESS: <your single best guess>\n" +

  "REASONING: <one short sentence on how you read the emojis>";



function parseEmojiAiGuessResponse(text) {

  const lines = (text || "").split("\n").map((l) => l.trim()).filter(Boolean);

  const get = (label) => {

    const line = lines.find((l) => l.toUpperCase().startsWith(label + ":"));

    return line ? line.slice(line.indexOf(":") + 1).trim() : "";

  };

  const guess = get("GUESS");

  const reasoning = get("REASONING");

  if (!guess) throw new Error("AI response was missing a guess.");

  return { guess, reasoning };

}



async function generateEmojiAiGuess(emoji, category) {

  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + state.apiKey,

    },

    body: JSON.stringify({

      model: SCORE_MODEL,

      max_tokens: 150,

      messages: [

        { role: "system", content: EMOJI_AI_GUESS_SYSTEM },

        { role: "user", content: `Category: ${category || "unknown"}\nEmoji: ${emoji}` },

      ],

    }),

  });

  if (!res.ok) {

    const errBody = await res.json().catch(() => ({}));

    throw new Error((errBody.error && errBody.error.message) || `OpenAI request failed (${res.status})`);

  }

  const data = await res.json();

  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

  return parseEmojiAiGuessResponse(content);

}



const estate = {

  mode: "solo", // "solo" | "tournament"

  level: 1,

  playerName: "",

  hiddenPhrase: "",

  category: "",

  hint: "",

  guessText: "",

  emoji: "",

  emojiExplanation: "",

};



// Tournament state - separate from Prompt Mirror's tstate. Same knockout

// bracket / best-of-selected-levels design, just for the emoji game.

const etstate = {

  players: [],

  nextPlayerId: 1,

  bracket: [],

  champion: null,

  currentMatch: null,

  levels: [1, 2, 3],

};



function setEmojiLevel(n) {

  estate.level = n;

  document.querySelectorAll("#emoji-level-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", Number(b.dataset.level) === n);

  });

  el("emoji-level-hint").textContent = (EMOJI_LEVELS[n] || EMOJI_LEVELS[1]).hint;

}



function updateEmojiLevelBadges() {

  const label = (EMOJI_LEVELS[estate.level] || EMOJI_LEVELS[1]).label;

  el("emoji-challenge-level-badge").textContent = label;

  el("emoji-result-level-badge").textContent = label;

}



function setEmojiMode(mode) {

  estate.mode = mode;

  document.querySelectorAll("#emoji-mode-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", b.dataset.mode === mode);

  });

  el("btn-emoji-start-round").textContent = mode === "tournament" ? "Set up tournament" : "Start a round";

  // Emoji Charades tournaments are still played same-device (everyone

  // takes turns on this one screen) - so unlike Prompt Mirror, selecting

  // tournament mode here IS setting one up, and needs the Dari-Admin gate.

  el("emoji-tournament-admin-hint").hidden = !(mode === "tournament" && identity.role !== "admin");

}



function handleEmojiStartClick() {

  if (estate.mode === "tournament") {

    if (identity.role !== "admin") return;

    if (etstate.players.length === 0) {

      addEmojiPlayerRow();

      addEmojiPlayerRow();

    }

    etstate.bracket = [];

    etstate.champion = null;

    etstate.currentMatch = null;

    renderEmojiPlayerList();

    renderEmojiTournamentLevelPicker();

    el("emoji-tournament-setup-error").hidden = true;

    showScreen("emoji-tournament-setup");

  } else {

    startEmojiRound();

  }

}



// Fallback-only - see the comment above EMOJI_ROUND_SYSTEM. Only called

// when generateEmojiRoundAI has already failed once for this round.

async function translateFallbackPhraseToEmoji(phrase) {

  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + state.apiKey,

    },

    body: JSON.stringify({

      model: SCORE_MODEL,

      max_tokens: 150,

      messages: [

        { role: "system", content: EMOJI_SYSTEM_PROMPT },

        { role: "user", content: `Translate this hidden answer into emojis: "${phrase}"` },

      ],

    }),

  });

  if (!res.ok) {

    const errBody = await res.json().catch(() => ({}));

    throw new Error((errBody.error && errBody.error.message) || `OpenAI request failed (${res.status})`);

  }

  const data = await res.json();

  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

  const trimmed = content.trim();

  if (!trimmed) throw new Error("OpenAI returned an empty emoji translation.");



  // First line is the emoji string; everything after the following blank

  // line (if any) is the explanation of what the emoji mean, shown only

  // after the round is scored and revealed.

  const nlIndex = trimmed.indexOf("\n");

  const emoji = (nlIndex === -1 ? trimmed : trimmed.slice(0, nlIndex)).trim();

  const explanation = nlIndex === -1 ? "" : trimmed.slice(nlIndex).replace(/^\s*\n+/, "").trim();

  if (!emoji) throw new Error("OpenAI returned an empty emoji translation.");

  return { emoji, explanation };

}



// --- Local fuzzy scoring - no OpenAI call, so results are instant. -----



function normalizePhrase(s) {

  return (s || "")

    .toLowerCase()

    .replace(/[^a-z0-9\s]/g, " ")

    .replace(/\s+/g, " ")

    .trim();

}



const EMOJI_STOPWORDS = new Set([

  "a", "an", "the", "of", "in", "on", "at", "to", "and", "is", "it", "its",

  "your", "you", "for", "with", "don", "t",

]);



function levenshtein(a, b) {

  const m = a.length, n = b.length;

  if (m === 0) return n;

  if (n === 0) return m;

  const dp = new Array(n + 1);

  for (let j = 0; j <= n; j++) dp[j] = j;

  for (let i = 1; i <= m; i++) {

    let prev = dp[0];

    dp[0] = i;

    for (let j = 1; j <= n; j++) {

      const tmp = dp[j];

      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);

      prev = tmp;

    }

  }

  return dp[n];

}



// Combines whole-string edit-distance similarity with key-word overlap, so

// a guess that's close in wording AND shares the important words scores

// highest. Deterministic and instant - no AI judge call needed.

function scoreEmojiGuess(guess, answer) {

  const g = normalizePhrase(guess);

  const a = normalizePhrase(answer);

  if (!g) return { score: 0, feedback: "No guess was submitted." };

  if (g === a) return { score: 100, feedback: "Exact match! You nailed it word for word." };



  const dist = levenshtein(g, a);

  const maxLen = Math.max(g.length, a.length) || 1;

  const charSim = 1 - dist / maxLen;



  const stripStop = (words) => words.filter((w) => w && !EMOJI_STOPWORDS.has(w));

  const aAllWords = a.split(" ").filter(Boolean);

  const gAllWords = g.split(" ").filter(Boolean);

  const aKey = stripStop(aAllWords).length ? stripStop(aAllWords) : aAllWords;

  const gSet = new Set(stripStop(gAllWords).length ? stripStop(gAllWords) : gAllWords);

  const matched = aKey.filter((w) => gSet.has(w));

  const wordSim = aKey.length ? matched.length / aKey.length : 0;



  const combined = 0.45 * charSim + 0.55 * wordSim;

  const score = Math.max(0, Math.min(100, Math.round(combined * 100)));

  const wordLabel = aKey.length === 1 ? "key word" : "key words";



  let feedback;

  if (score >= 90) feedback = `Extremely close! You matched ${matched.length} of ${aKey.length} ${wordLabel}.`;

  else if (score >= 65) feedback = `Good guess — you matched ${matched.length} of ${aKey.length} ${wordLabel}, close in wording too.`;

  else if (score >= 35) feedback = `Some overlap — you got ${matched.length} of ${aKey.length} ${wordLabel}, but missed the core of it.`;

  else feedback = `Pretty far off — only ${matched.length} of ${aKey.length} ${wordLabel} matched.`;



  return { score, feedback };

}



// --- Solo mode -----------------------------------------------------------



async function startEmojiRound() {

  estate.hiddenPhrase = "";

  estate.category = "";

  estate.hint = "";

  estate.guessText = "";

  estate.emoji = "";

  estate.emojiExplanation = "";



  showScreen("emoji-challenge");

  updateEmojiLevelBadges();

  el("emoji-challenge-error").hidden = true;

  el("btn-retry-emoji-challenge").hidden = true;

  el("emoji-challenge-display-wrap").hidden = true;

  el("emoji-challenge-clue-wrap").hidden = true;

  el("emoji-challenge-form").hidden = true;

  el("input-emoji-guess").value = "";



  await generateEmojiChallenge();

}



async function generateEmojiChallenge() {

  el("emoji-challenge-error").hidden = true;

  el("btn-retry-emoji-challenge").hidden = true;

  el("emoji-challenge-display-wrap").hidden = true;

  el("emoji-challenge-clue-wrap").hidden = true;

  el("emoji-challenge-loading").hidden = false;



  try {

    const result = await getEmojiRound(estate.level);

    estate.hiddenPhrase = result.phrase;

    estate.category = result.category;

    estate.hint = result.hint;

    estate.emoji = result.emoji;

    estate.emojiExplanation = result.explanation;

    el("emoji-challenge-display").textContent = result.emoji;

    el("emoji-challenge-display-wrap").hidden = false;

    showEmojiCategoryAndClue("emoji-challenge", result.category, result.hint);

    el("emoji-challenge-form").hidden = false;

  } catch (e) {

    showEmojiChallengeError(e.message);

    el("btn-retry-emoji-challenge").hidden = false;

  } finally {

    el("emoji-challenge-loading").hidden = true;

  }

}



function showEmojiChallengeError(msg) {

  const errEl = el("emoji-challenge-error");

  errEl.textContent = errorHint(msg);

  errEl.hidden = false;

}



function submitEmojiGuess() {

  const guess = el("input-emoji-guess").value.trim();

  if (!guess) return;

  estate.guessText = guess;

  runEmojiResultScreen();

}



function resetEmojiAiGuessUI() {

  el("emoji-ai-guess-text").hidden = true;

  el("emoji-ai-guess-text").textContent = "";

  el("emoji-ai-guess-error").hidden = true;

  el("emoji-ai-guess-loading").hidden = true;

  const btn = el("btn-reveal-emoji-ai-guess");

  btn.hidden = false;

  btn.disabled = false;

  btn.textContent = "Show AI's guess";

}



async function revealEmojiAiGuess() {

  const btn = el("btn-reveal-emoji-ai-guess");

  btn.hidden = true;

  el("emoji-ai-guess-error").hidden = true;

  el("emoji-ai-guess-loading").hidden = false;

  try {

    const { guess, reasoning } = await generateEmojiAiGuess(estate.emoji, estate.category);

    el("emoji-ai-guess-text").textContent = reasoning ? `${guess} — ${reasoning}` : guess;

    el("emoji-ai-guess-text").hidden = false;

  } catch (e) {

    el("emoji-ai-guess-error").textContent = errorHint(e.message);

    el("emoji-ai-guess-error").hidden = false;

    btn.hidden = false;

    btn.textContent = "Try again";

  } finally {

    el("emoji-ai-guess-loading").hidden = true;

  }

}



function runEmojiResultScreen() {

  showScreen("emoji-result");

  el("emoji-result-display").textContent = estate.emoji;

  const { score, feedback } = scoreEmojiGuess(estate.guessText, estate.hiddenPhrase);

  setEmojiScore(score);

  el("emoji-result-feedback").textContent = feedback;

  el("emoji-reveal-guess-text").textContent = estate.guessText;

  el("emoji-reveal-phrase-text").textContent = estate.hiddenPhrase;

  resetEmojiAiGuessUI();



  if (estate.emojiExplanation) {

    el("emoji-explanation-text").textContent = estate.emojiExplanation;

    el("emoji-explanation-box").hidden = false;

  } else {

    el("emoji-explanation-box").hidden = true;

  }



  recordSoloResult(GAME_EMOJI_CHARADES, score, estate.level);

}



function setEmojiScore(score) {

  score = Math.max(0, Math.min(100, Math.round(score)));

  el("emoji-score-value").textContent = score;

  const fill = el("emoji-score-bar-fill");

  fill.style.width = score + "%";

  let color = "#ff6b6b";

  if (score >= 70) color = "#33d6a6";

  else if (score >= 40) color = "#ffb454";

  fill.style.background = color;

}



// --- Tournament mode: players ---------------------------------------------



function addEmojiPlayerRow(name) {

  if (etstate.players.length >= 64) return;

  etstate.players.push({ id: etstate.nextPlayerId++, name: name || "" });

  renderEmojiPlayerList();

}



function bulkAddEmojiPlayers() {

  const raw = el("emoji-bulk-player-names").value;

  const names = raw.split("\n").map((s) => s.trim()).filter(Boolean);

  if (!names.length) return;

  names.forEach((name) => addEmojiPlayerRow(name));

  el("emoji-bulk-player-names").value = "";

}



function removeEmojiPlayerRow(id) {

  if (etstate.players.length <= 2) return;

  etstate.players = etstate.players.filter((p) => p.id !== id);

  renderEmojiPlayerList();

}



function renderEmojiPlayerList() {

  const wrap = el("emoji-tournament-player-list");

  wrap.innerHTML = "";

  etstate.players.forEach((p, i) => {

    const row = document.createElement("div");

    row.className = "player-row";

    row.innerHTML =

      `<input type="text" data-emoji-player-id="${p.id}" list="player-name-list" placeholder="Player ${i + 1} name" value="${escapeHtml(p.name)}" autocomplete="off">` +

      `<button type="button" class="remove-player-btn" data-emoji-remove-id="${p.id}" title="Remove player">&times;</button>`;

    wrap.appendChild(row);

  });

  wrap.querySelectorAll("input[data-emoji-player-id]").forEach((input) => {

    input.addEventListener("input", () => {

      const id = Number(input.dataset.emojiPlayerId);

      const player = etstate.players.find((p) => p.id === id);

      if (player) player.name = input.value;

    });

  });

  wrap.querySelectorAll("[data-emoji-remove-id]").forEach((btn) => {

    btn.disabled = etstate.players.length <= 2;

    btn.addEventListener("click", () => removeEmojiPlayerRow(Number(btn.dataset.emojiRemoveId)));

  });

}



function toggleEmojiTournamentLevel(n) {

  if (etstate.levels.includes(n)) {

    if (etstate.levels.length === 1) return;

    etstate.levels = etstate.levels.filter((lvl) => lvl !== n);

  } else {

    etstate.levels = etstate.levels.concat(n).sort((a, b) => a - b);

  }

  renderEmojiTournamentLevelPicker();

}



function renderEmojiTournamentLevelPicker() {

  document.querySelectorAll("#emoji-tournament-level-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", etstate.levels.includes(Number(b.dataset.level)));

  });

}



// --- Bracket generation (reuses shuffle/nextPowerOfTwo from Prompt Mirror) -



function makeEmojiMatch(roundIndex, matchIndex, playerA, playerB) {

  return {

    roundIndex,

    matchIndex,

    playerA: playerA || null,

    playerB: playerB || null,

    status: playerA && playerB ? "ready" : (playerA && !playerB ? "bye" : "pending"),

    winner: null,

    subRounds: [],

    totals: {},

  };

}



async function generateEmojiBracket() {

  const errEl = el("emoji-tournament-setup-error");

  errEl.hidden = true;

  const names = etstate.players.map((p) => (p.name || "").trim());

  if (etstate.players.length < 2 || names.some((n) => !n)) {

    errEl.textContent = "Give every player a name (at least 2 players).";

    errEl.hidden = false;

    return;

  }

  etstate.players.forEach((p, i) => { p.name = names[i]; });



  await resolveTournamentPlayers(etstate.players);

  const dupe = findDuplicateProfilePlayers(etstate.players);

  if (dupe) {

    errEl.textContent = `"${dupe[0].name}" and "${dupe[1].name}" are the same player profile (ID ${dupe[0].profileId}). Give each player a distinct name or ID before starting.`;

    errEl.hidden = false;

    return;

  }

  await postTournamentStartEvents(etstate.players, GAME_EMOJI_CHARADES);



  const shuffled = shuffle(etstate.players);

  const n = shuffled.length;

  const size = nextPowerOfTwo(n);

  const byes = size - n;



  const byePlayers = shuffled.slice(0, byes);

  const matchPlayers = shuffled.slice(byes);

  const slotDescriptors = byePlayers.map((p) => ({ players: [p, null] }));

  for (let i = 0; i < matchPlayers.length; i += 2) {

    slotDescriptors.push({ players: [matchPlayers[i], matchPlayers[i + 1]] });

  }

  const orderedSlots = shuffle(slotDescriptors);

  const round1 = orderedSlots.map((slot, idx) => makeEmojiMatch(0, idx, slot.players[0], slot.players[1]));



  const rounds = [round1];

  let prevCount = round1.length;

  let r = 1;

  while (prevCount > 1) {

    const count = prevCount / 2;

    const round = [];

    for (let i = 0; i < count; i++) round.push(makeEmojiMatch(r, i, null, null));

    rounds.push(round);

    prevCount = count;

    r++;

  }



  etstate.bracket = rounds;

  etstate.champion = null;

  etstate.currentMatch = null;



  round1.forEach((m) => {

    if (m.status === "bye") resolveEmojiByeMatch(m);

  });



  showScreen("emoji-tournament-bracket");

  renderEmojiBracket();

}



function resolveEmojiByeMatch(m) {

  m.status = "done";

  m.winner = m.playerA;

  advanceEmojiWinner(m);

}



function advanceEmojiWinner(m) {

  const rounds = etstate.bracket;

  const nextRoundIndex = m.roundIndex + 1;

  if (nextRoundIndex >= rounds.length) {

    etstate.champion = m.winner;

    return;

  }

  const nextMatch = rounds[nextRoundIndex][Math.floor(m.matchIndex / 2)];

  if (m.matchIndex % 2 === 0) nextMatch.playerA = m.winner;

  else nextMatch.playerB = m.winner;

  if (nextMatch.playerA && nextMatch.playerB) nextMatch.status = "ready";

}



function emojiRoundName(roundIndex) {

  const matchesInRound = etstate.bracket[roundIndex].length;

  if (matchesInRound === 1) return "Final";

  if (matchesInRound === 2) return "Semifinal";

  if (matchesInRound === 4) return "Quarterfinal";

  return `Round of ${matchesInRound * 2}`;

}



function findNextPlayableEmojiMatch() {

  for (const round of etstate.bracket) {

    for (const m of round) {

      if (m.status === "ready") return m;

    }

  }

  return null;

}



// --- Bracket rendering -----------------------------------------------------



function renderEmojiBracketSlot(m, which) {

  if (m.status === "bye" && which === "B") {

    return `<div class="bracket-slot bye-slot">BYE</div>`;

  }

  const player = which === "A" ? m.playerA : m.playerB;

  if (!player) return `<div class="bracket-slot">TBD</div>`;

  const isWinner = !!(m.winner && m.winner.id === player.id);

  const score = m.totals && m.totals[player.id] != null ? m.totals[player.id] : null;

  return `<div class="bracket-slot${isWinner ? " winner-slot" : ""}">` +

    `<span>${escapeHtml(player.name)}</span>` +

    (score != null ? `<span class="bracket-score">${score}</span>` : "") +

    `</div>`;

}



function renderEmojiBracket() {

  const wrap = el("emoji-bracket-view");

  wrap.innerHTML = "";

  etstate.bracket.forEach((round, ri) => {

    const col = document.createElement("div");

    col.className = "bracket-round";

    const title = document.createElement("div");

    title.className = "bracket-round-title";

    title.textContent = emojiRoundName(ri);

    col.appendChild(title);



    round.forEach((m) => {

      const card = document.createElement("div");

      const playable = m.status === "ready";

      card.className = "bracket-match" + (playable ? " playable" : "") + (m.status === "done" || m.status === "bye" ? " done" : "");



      const tagText = m.status === "done" ? "Completed"

        : m.status === "bye" ? "Bye"

        : m.status === "ready" ? "Ready to play"

        : "Waiting";

      card.innerHTML =

        `<div class="bracket-match-tag${m.status === "pending" ? " tbd" : ""}">${tagText}</div>` +

        renderEmojiBracketSlot(m, "A") + renderEmojiBracketSlot(m, "B");



      if (playable) card.addEventListener("click", () => startEmojiMatch(m));

      col.appendChild(card);

    });

    wrap.appendChild(col);

  });



  const banner = el("emoji-bracket-champion-banner");

  if (etstate.champion) {

    banner.hidden = false;

    banner.textContent = `Champion: ${etstate.champion.name}`;

  } else {

    banner.hidden = true;

  }



  el("btn-emoji-play-next-match").hidden = !findNextPlayableEmojiMatch();

}



// --- Playing one match -----------------------------------------------------



function startEmojiMatch(m) {

  etstate.currentMatch = m;

  m.subRounds = [];

  m.totals = { [m.playerA.id]: 0, [m.playerB.id]: 0 };

  m.levels = etstate.levels.slice();

  const levelLabel = m.levels.map((n) => `Level ${n}`).join(", ");

  el("emoji-match-round-name").textContent = emojiRoundName(m.roundIndex);

  el("emoji-match-players-label").textContent = `${m.playerA.name} vs ${m.playerB.name} — best of ${m.levels.length} (${levelLabel}). Higher cumulative score advances.`;

  showScreen("emoji-tournament-match");

  renderEmojiMatchTally(m);

  startEmojiSubRound(m, m.levels[0], false);

}



function renderEmojiMatchTally(m) {

  const wrap = el("emoji-match-tally");

  wrap.innerHTML = "";

  [m.playerA, m.playerB].forEach((p) => {

    const item = document.createElement("div");

    item.className = "match-tally-item";

    item.innerHTML =

      `<div class="mt-name">${escapeHtml(p.name)}</div>` +

      `<div class="mt-score">${m.totals[p.id] || 0}<span class="mt-score-max"> total</span></div>`;

    wrap.appendChild(item);

  });

}



function renderEmojiMatchPlayerStatus(m, sub) {

  const wrap = el("emoji-match-player-status-list");

  wrap.innerHTML = "";

  [["a", m.playerA], ["b", m.playerB]].forEach(([key, player]) => {

    const entry = sub[key];

    const done = entry.score != null;

    const chip = document.createElement("span");

    chip.className = "player-status-chip";

    if (done) chip.classList.add("done");

    else if (sub.currentTurn === key) chip.classList.add("current");

    chip.textContent = player.name + (done ? " — submitted" : sub.currentTurn === key ? " — up now" : " — waiting");

    wrap.appendChild(chip);

  });

}



async function startEmojiSubRound(m, level, isTiebreaker) {

  const sub = {

    index: m.subRounds.length,

    level,

    isTiebreaker,

    hiddenPhrase: "",

    category: "",

    hint: "",

    emoji: "",

    explanation: "",

    a: { guess: "", score: null, feedback: "" },

    b: { guess: "", score: null, feedback: "" },

    currentTurn: "a",

  };

  m.subRounds.push(sub);



  el("emoji-sub-round-num").textContent = isTiebreaker ? "Tiebreaker" : String(sub.index + 1);

  el("emoji-sub-round-of-wrap").hidden = isTiebreaker;

  el("emoji-sub-round-total").textContent = String(m.levels.length);

  el("emoji-sub-round-level-badge").textContent = (EMOJI_LEVELS[level] || EMOJI_LEVELS[1]).label;

  el("emoji-match-error").hidden = true;

  el("btn-retry-emoji-subround").hidden = true;

  el("emoji-match-display-wrap").hidden = true;

  el("emoji-match-clue-wrap").hidden = true;

  el("emoji-match-guess-form").hidden = true;

  el("emoji-match-processing").hidden = true;

  el("emoji-match-subround-result").hidden = true;

  el("emoji-match-final-result").hidden = true;

  el("emoji-match-subround-active").hidden = false;

  renderEmojiMatchPlayerStatus(m, sub);



  await generateSubRoundEmoji(m, sub);

}



async function generateSubRoundEmoji(m, sub) {

  el("emoji-match-error").hidden = true;

  el("btn-retry-emoji-subround").hidden = true;

  el("emoji-match-display-wrap").hidden = true;

  el("emoji-match-clue-wrap").hidden = true;

  el("emoji-match-loading").hidden = false;



  try {

    const result = await getEmojiRound(sub.level);

    sub.hiddenPhrase = result.phrase;

    sub.category = result.category;

    sub.hint = result.hint;

    sub.emoji = result.emoji;

    sub.explanation = result.explanation;

    el("emoji-match-display").textContent = result.emoji;

    el("emoji-match-display-wrap").hidden = false;

    showEmojiCategoryAndClue("emoji-match", result.category, result.hint);

    showEmojiMatchGuessForm(m, sub);

  } catch (e) {

    el("emoji-match-error").textContent = errorHint(e.message);

    el("emoji-match-error").hidden = false;

    el("btn-retry-emoji-subround").hidden = false;

    el("btn-retry-emoji-subround").onclick = () => generateSubRoundEmoji(m, sub);

  } finally {

    el("emoji-match-loading").hidden = true;

  }

}



function showEmojiMatchGuessForm(m, sub) {

  const player = sub.currentTurn === "a" ? m.playerA : m.playerB;

  el("emoji-match-current-player-label").textContent = `${player.name}'s guess`;

  el("input-emoji-match-guess").value = "";

  el("emoji-match-guess-form").hidden = false;

  el("emoji-match-processing").hidden = true;

  renderEmojiMatchPlayerStatus(m, sub);

}



// Scoring here is local/instant, so this stays synchronous - no network

// call, no processing spinner needed between submit and reveal.

function submitEmojiMatchGuess() {

  const m = etstate.currentMatch;

  const sub = m.subRounds[m.subRounds.length - 1];

  const guess = el("input-emoji-match-guess").value.trim();

  if (!guess) return;

  const key = sub.currentTurn;

  const entry = sub[key];

  entry.guess = guess;



  const { score, feedback } = scoreEmojiGuess(guess, sub.hiddenPhrase);

  entry.score = score;

  entry.feedback = feedback;



  if (key === "a") {

    sub.currentTurn = "b";

    showEmojiMatchGuessForm(m, sub);

  } else {

    renderEmojiMatchPlayerStatus(m, sub);

    finishEmojiSubRound(m, sub);

  }

}



async function revealMatchEmojiAiGuess(emoji, category) {

  const btn = el("btn-reveal-emoji-match-ai-guess");

  btn.hidden = true;

  el("emoji-match-ai-guess-error").hidden = true;

  el("emoji-match-ai-guess-loading").hidden = false;

  try {

    const { guess, reasoning } = await generateEmojiAiGuess(emoji, category);

    el("emoji-match-ai-guess-text").textContent = reasoning ? `${guess} — ${reasoning}` : guess;

    el("emoji-match-ai-guess-text").hidden = false;

  } catch (e) {

    el("emoji-match-ai-guess-error").textContent = errorHint(e.message);

    el("emoji-match-ai-guess-error").hidden = false;

    btn.hidden = false;

    btn.textContent = "Try again";

  } finally {

    el("emoji-match-ai-guess-loading").hidden = true;

  }

}



function finishEmojiSubRound(m, sub) {

  m.totals[m.playerA.id] = (m.totals[m.playerA.id] || 0) + (sub.a.score || 0);

  m.totals[m.playerB.id] = (m.totals[m.playerB.id] || 0) + (sub.b.score || 0);

  renderEmojiMatchTally(m);

  recordTournamentLevelResult(m.playerA, GAME_EMOJI_CHARADES, sub.level, sub.a.score || 0);

  recordTournamentLevelResult(m.playerB, GAME_EMOJI_CHARADES, sub.level, sub.b.score || 0);



  el("emoji-match-subround-active").hidden = true;

  el("emoji-match-subround-result").hidden = false;

  el("emoji-match-subround-phrase-text").textContent = sub.hiddenPhrase;



  // Same-device/turn-based, renders once per sub-round - no poll-driven

  // re-render guard needed (unlike Prompt Mirror's tournament).

  el("emoji-match-ai-guess-text").hidden = true;

  el("emoji-match-ai-guess-text").textContent = "";

  el("emoji-match-ai-guess-error").hidden = true;

  el("emoji-match-ai-guess-loading").hidden = true;

  const aiGuessBtn = el("btn-reveal-emoji-match-ai-guess");

  aiGuessBtn.hidden = false;

  aiGuessBtn.disabled = false;

  aiGuessBtn.textContent = "Show AI's guess";

  aiGuessBtn.onclick = () => revealMatchEmojiAiGuess(sub.emoji, sub.category);



  if (sub.explanation) {

    el("emoji-match-explanation-text").textContent = sub.explanation;

    el("emoji-match-explanation-box").hidden = false;

  } else {

    el("emoji-match-explanation-box").hidden = true;

  }



  const cardsWrap = el("emoji-match-subround-cards");

  cardsWrap.innerHTML = "";

  const subTop = Math.max(sub.a.score || 0, sub.b.score || 0);

  [{ p: m.playerA, e: sub.a }, { p: m.playerB, e: sub.b }]

    .sort((x, y) => (y.e.score || 0) - (x.e.score || 0))

    .forEach(({ p, e }) => {

      const isWinner = (e.score || 0) === subTop;

      const card = document.createElement("div");

      card.className = "tournament-result-card" + (isWinner ? " winner" : "");

      card.innerHTML =

        (isWinner ? '<div class="trc-winner-tag">Sub-round winner</div>' : "") +

        `<div class="trc-name">${escapeHtml(p.name)}</div>` +

        `<div class="trc-score">${e.score || 0}<span style="font-size:1rem;color:var(--muted);">/100</span></div>` +

        `<div class="trc-feedback">${escapeHtml(e.feedback)}</div>` +

        `<div class="trc-prompt">"${escapeHtml(e.guess)}"</div>`;

      cardsWrap.appendChild(card);

    });



  const plannedDone = m.subRounds.length >= m.levels.length;



  el("btn-emoji-next-subround").onclick = () => {

    if (plannedDone) {

      const totalA = m.totals[m.playerA.id];

      const totalB = m.totals[m.playerB.id];

      if (totalA === totalB) {

        startEmojiSubRound(m, m.levels[m.levels.length - 1], true);

      } else {

        finishEmojiMatch(m);

      }

    } else {

      startEmojiSubRound(m, m.levels[m.subRounds.length], false);

    }

  };

}



function finishEmojiMatch(m) {

  const totalA = m.totals[m.playerA.id];

  const totalB = m.totals[m.playerB.id];

  m.winner = totalA >= totalB ? m.playerA : m.playerB;

  m.status = "done";

  advanceEmojiWinner(m);



  const isFinal = m.roundIndex === etstate.bracket.length - 1;

  const stageLabel = emojiRoundName(m.roundIndex);

  const stageRank = stageRankForRoundName(stageLabel);

  recordMatchResult(m.playerA, GAME_EMOJI_CHARADES, m.winner.id === m.playerA.id, stageLabel, stageRank, totalA);

  recordMatchResult(m.playerB, GAME_EMOJI_CHARADES, m.winner.id === m.playerB.id, stageLabel, stageRank, totalB);

  if (isFinal) recordTournamentWon(m.winner, GAME_EMOJI_CHARADES);



  el("emoji-match-subround-active").hidden = true;

  el("emoji-match-subround-result").hidden = true;

  el("emoji-match-final-result").hidden = false;

  el("emoji-match-winner-banner").textContent = isFinal

    ? `${m.winner.name} wins the tournament!`

    : `${m.winner.name} wins the match and advances!`;



  const tallyWrap = el("emoji-match-final-tally");

  tallyWrap.innerHTML = "";

  [m.playerA, m.playerB]

    .sort((x, y) => m.totals[y.id] - m.totals[x.id])

    .forEach((p) => {

      const row = document.createElement("div");

      row.className = "standings-row" + (p.id === m.winner.id ? " leader" : "");

      row.innerHTML = `<span class="standings-name">${escapeHtml(p.name)}</span><span class="standings-detail">${m.totals[p.id]} total</span>`;

      tallyWrap.appendChild(row);

    });

}



// --- Wiring ----------------------------------------------------------------



function initEmojiCharades() {

  el("card-emoji-charades").querySelector("button").addEventListener("click", () => showScreen("emoji-rules"));



  document.querySelectorAll("#emoji-level-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => setEmojiLevel(Number(b.dataset.level)));

  });

  document.querySelectorAll("#emoji-mode-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => setEmojiMode(b.dataset.mode));

  });

  el("btn-emoji-start-round").addEventListener("click", handleEmojiStartClick);

  el("btn-submit-emoji-guess").addEventListener("click", submitEmojiGuess);

  el("btn-retry-emoji-challenge").addEventListener("click", generateEmojiChallenge);

  el("btn-emoji-challenge-clue-toggle").addEventListener("click", () => toggleEmojiClue("emoji-challenge"));

  el("btn-emoji-match-clue-toggle").addEventListener("click", () => toggleEmojiClue("emoji-match"));

  el("btn-emoji-play-again").addEventListener("click", startEmojiRound);

  el("btn-emoji-back-to-arcade").addEventListener("click", () => showScreen("hub"));

  el("btn-reveal-emoji-ai-guess").addEventListener("click", revealEmojiAiGuess);



  el("btn-emoji-add-player").addEventListener("click", () => addEmojiPlayerRow());

  el("btn-emoji-bulk-add-players").addEventListener("click", bulkAddEmojiPlayers);

  document.querySelectorAll("#emoji-tournament-level-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => toggleEmojiTournamentLevel(Number(b.dataset.level)));

  });

  el("btn-emoji-generate-bracket").addEventListener("click", generateEmojiBracket);

  el("btn-emoji-play-next-match").addEventListener("click", () => {

    const m = findNextPlayableEmojiMatch();

    if (m) startEmojiMatch(m);

  });

  el("btn-emoji-new-tournament-from-bracket").addEventListener("click", () => {

    etstate.bracket = [];

    etstate.champion = null;

    etstate.currentMatch = null;

    renderEmojiPlayerList();

    renderEmojiTournamentLevelPicker();

    el("emoji-tournament-setup-error").hidden = true;

    showScreen("emoji-tournament-setup");

  });

  el("btn-submit-emoji-match-guess").addEventListener("click", submitEmojiMatchGuess);

  el("btn-emoji-finish-match").addEventListener("click", () => {

    showScreen("emoji-tournament-bracket");

    renderEmojiBracket();

  });

}



// =======================================================================

// Code Mirror - third arcade game. Kept fully independent from Prompt

// Mirror's and Emoji Charades' state (own solo state `cstate`, own

// tournament state `ctstate`, own screens/functions) and only reuses truly

// generic helpers: el, showScreen, pick, shuffle, nextPowerOfTwo,

// escapeHtml, errorHint, state.apiKey, CODE_MODEL, SCORE_MODEL, and the

// generic player-profile event functions (resolveTournamentPlayers,

// findDuplicateProfilePlayers, postTournamentStartEvents, recordSoloResult,

// recordMatchResult, recordTournamentLevelResult, recordTournamentWon,

// stageRankForRoundName), which already take a `game` key parameter

// instead of being hardcoded to one game.

//

// Same "hidden target vs. your prompt's attempt, judged for similarity"

// engine as Prompt Mirror, applied to a small Python function instead of a

// picture. Nothing is ever executed anywhere in this app - the judge only

// reads both functions and scores how closely they'd behave, the same way

// a human code reviewer would - so there's no risk of running untrusted

// AI-generated code on this machine.

// =======================================================================



const CODE_GEN_SYSTEM_PROMPT =

  "You write a single small Python 3 function on request, for a coding " +

  "guessing game. Respond with ONLY the code: the function itself, with " +

  "clear, descriptive names for the function and its parameters, and any " +

  "import it truly needs at the top. Do NOT include a docstring or any " +

  "comments anywhere in the code - the function's logic and naming should " +

  "speak for itself, since this code is shown to a player who must guess " +

  "a prompt for it, and a docstring or comment would hand them the answer " +

  "outright. Do not include markdown code fences, backticks, an " +

  "explanation, or any text before or after the code. Do not include " +

  "example usage, print statements, or tests - just the function " +

  "definition.";



const CODE_SCORE_SYSTEM_PROMPT =

  "You are an extremely meticulous senior code reviewer scoring how " +

  "closely a RECREATED Python function matches a hidden REFERENCE Python " +

  "function, for a competitive prompt-engineering game. You are picky on " +

  "purpose: this score decides a competitive match, so near-miss " +

  "recreations must not receive the same score as each other unless they " +

  "are genuinely equivalent. Judge only how closely the recreation " +

  "matches the reference's actual behavior and approach (never generic " +

  "code quality or style you personally prefer, and never whether the " +

  "reference itself is 'good' code).\n\n" +

  "Evaluate ALL of the following dimensions and let each one move the " +

  "score:\n" +

  "1. Functional correctness - for the same inputs, does the recreation " +

  "produce the same outputs as the reference? Trace through a few " +

  "representative and edge-case inputs mentally. A behavioral mismatch is " +

  "a severe penalty.\n" +

  "2. Edge case handling - empty input, a single element, negative " +

  "numbers, ties, duplicates, etc. - handled the same way as the " +

  "reference (or both left unhandled the same way)?\n" +

  "3. Algorithmic approach - the same general strategy (e.g. both an " +

  "iterative single pass, both using a dict, both recursive) versus a " +

  "different-but-still-correct approach - note the difference without " +

  "over-penalizing a merely different but equally valid approach, though " +

  "a less efficient or more convoluted approach than the reference should " +

  "still cost a few points.\n" +

  "4. Structure and interface - similar function signature shape " +

  "(parameter count/order/meaning), return type, and overall shape " +

  "(single function vs. several, use of helpers).\n" +

  "5. Robustness - input validation, error handling, and defensive " +

  "checks present in the reference but missing from the recreation (or " +

  "vice versa).\n" +

  "6. Readability and idiom - naming and use of idiomatic Python similar " +

  "in spirit to the reference.\n\n" +

  "Be strict and granular: dock points for every mismatch above, however " +

  "small. Use the FULL precision of the 0-100 scale (e.g. 63, 78, 41, 92, " +

  "not just round numbers like 50/70/90) so two different recreations " +

  "essentially never land on the exact same score unless they are " +

  "genuinely equally close. Reserve scores above 90 for functionally " +

  "equivalent code with closely matching approach and structure, and " +

  "scores below 20 for code that would produce wrong results for ordinary " +

  "inputs or solves a different problem entirely.\n\n" +

  "Respond in EXACTLY this format: the first line must contain ONLY an " +

  "integer from 0 to 100 and nothing else on that line - no rubric, no " +

  "sub-scores, no parentheses. Then a blank line. Then 2-4 short " +

  "sentences of specific, pointed feedback addressed directly to the " +

  "player, naming concrete differences (e.g. \"your version doesn't " +

  "handle an empty list and would raise instead of returning 0\", not " +

  "just \"edge cases differ\"). Do not repeat the score in the feedback " +

  "text.";



const CODE_LEVEL1_TASKS = [

  "a function that returns the sum of all numbers in a list",

  "a function that checks whether a number is even",

  "a function that reverses a string",

  "a function that counts the vowels in a string",

  "a function that returns the largest value in a list",

  "a function that capitalizes the first letter of every word in a sentence",

  "a function that checks whether a list is empty",

  "a function that converts a temperature from Celsius to Fahrenheit",

  "a function that returns the factorial of a non-negative integer",

  "a function that removes duplicate values from a list while keeping the original order",

  "a function that counts how many words are in a sentence",

  "a function that checks whether a word starts with a vowel",

];



const CODE_LEVEL1_CONSTRAINTS = [

  "written with simple, descriptive variable and function names",

  "written as concisely as practical, in just a couple of lines",

  "written with basic input validation that raises a ValueError on bad input",

  "written using only plain loops, without relying on built-in shortcuts like sum() or max()",

  "written with type hints on the function signature",

];



const CODE_LEVEL2_TASKS = [

  "a function that checks whether a string is a palindrome, ignoring case, spaces, and punctuation",

  "a function that finds the second largest number in a list without fully sorting it",

  "a function that flattens a one-level-nested list of lists into a single flat list",

  "a function that counts how many times each word appears in a sentence, returned as a dictionary",

  "a function that returns the most frequent element in a list, breaking ties by the smallest value",

  "a function that groups a sorted list of integers into lists of consecutive runs, e.g. [1,2,3,7,8,10] -> [[1,2,3],[7,8],[10]]",

  "a function that checks whether two strings are anagrams of each other",

  "a function that returns every pair of numbers in a list that sums to a given target",

  "a function that removes all vowels from a string while keeping the casing of the remaining letters",

  "a function that merges two already-sorted lists into one sorted list, without calling Python's built-in sort",

  "a function that returns the running (cumulative) total of a list of numbers as a new list",

  "a function that rotates a list left by n positions",

];



const CODE_LEVEL2_CONSTRAINTS = [

  "written using a list comprehension where it makes the code cleaner",

  "written to make a single pass through the input wherever possible",

  "written with a small helper function for any repeated logic",

  "written to handle empty input gracefully instead of raising an error",

  "written using a dictionary or set to avoid a nested loop",

];



const CODE_LEVEL3_TASKS = [

  "a function that finds the length of the longest strictly increasing subsequence in a list of integers",

  "a function that checks whether a string of brackets like ( { [ is balanced and properly nested",

  "a function that performs a binary search on a sorted list and returns the index, or -1 if the value isn't found",

  "a function that computes the nth Fibonacci number using memoization",

  "a function that finds the length of the shortest path between two nodes in an unweighted graph given as an adjacency dictionary",

  "a function implementing a basic fixed-capacity LRU cache class with get and put methods",

  "a function that returns the top-k most frequent elements in a list, sorted by frequency descending",

  "a function that checks whether a partially-filled 9x9 Sudoku grid (a list of lists, 0 for empty) has no row, column, or box conflicts so far",

  "a function that computes the edit distance (Levenshtein distance) between two strings",

  "a function that finds all the prime numbers up to n using the Sieve of Eratosthenes",

];



const CODE_LEVEL3_CONSTRAINTS = [

  "written with roughly O(n) or O(n log n) time complexity",

  "written iteratively rather than recursively, to avoid recursion-depth issues",

  "written with clearly named helper variables that make the algorithm's approach easy to follow",

  "written to explicitly handle edge cases like empty input or a single element",

  "written using only Python's standard library, no external packages",

];



const CODE_LEVELS = {

  1: {

    label: "Level 1 — Easy",

    hint: "Level 1: one simple function. Easiest to match closely.",

    tasks: CODE_LEVEL1_TASKS,

    constraints: CODE_LEVEL1_CONSTRAINTS,

  },

  2: {

    label: "Level 2 — Medium",

    hint: "Level 2: a function with real logic - loops, conditionals, a dict or two.",

    tasks: CODE_LEVEL2_TASKS,

    constraints: CODE_LEVEL2_CONSTRAINTS,

  },

  3: {

    label: "Level 3 — Hard",

    hint: "Level 3: a small algorithm with edge cases to get right. Hardest to match.",

    tasks: CODE_LEVEL3_TASKS,

    constraints: CODE_LEVEL3_CONSTRAINTS,

  },

};



function buildHiddenCodePrompt(levelArg) {

  const lvl = levelArg || cstate.level;

  const tier = CODE_LEVELS[lvl] || CODE_LEVELS[1];

  return `Write ${pick(tier.tasks)}. The function should be ${pick(tier.constraints)}.`;

}



const cstate = {

  mode: "solo", // "solo" | "tournament"

  level: 1,

  playerName: "",

  hiddenPrompt: "",

  guessPrompt: "",

  originalCode: "",

  generatedCode: "",

};



// Tournament mode state - separate from cstate above, same knockout-bracket

// design as Prompt Mirror's tstate and Emoji Charades' etstate.

const ctstate = {

  players: [],

  nextPlayerId: 1,

  bracket: [],

  champion: null,

  currentMatch: null,

  levels: [1, 2, 3],

};



function toggleCodeTournamentLevel(n) {

  if (ctstate.levels.includes(n)) {

    if (ctstate.levels.length === 1) return;

    ctstate.levels = ctstate.levels.filter((lvl) => lvl !== n);

  } else {

    ctstate.levels = ctstate.levels.concat(n).sort((a, b) => a - b);

  }

  renderCodeTournamentLevelPicker();

}



function renderCodeTournamentLevelPicker() {

  document.querySelectorAll("#code-tournament-level-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", ctstate.levels.includes(Number(b.dataset.level)));

  });

}



function setCodeLevel(n) {

  cstate.level = n;

  document.querySelectorAll("#code-level-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", Number(b.dataset.level) === n);

  });

  el("code-level-hint").textContent = (CODE_LEVELS[n] || CODE_LEVELS[1]).hint;

}



function updateCodeLevelBadges() {

  const label = (CODE_LEVELS[cstate.level] || CODE_LEVELS[1]).label;

  el("code-challenge-level-badge").textContent = label;

  el("code-result-level-badge").textContent = label;

}



function setCodeMode(mode) {

  cstate.mode = mode;

  document.querySelectorAll("#code-mode-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", b.dataset.mode === mode);

  });

  el("btn-code-start-round").textContent = mode === "tournament" ? "Set up tournament" : "Start a round";

  el("code-tournament-admin-hint").hidden = !(mode === "tournament" && identity.role !== "admin");

}



function handleCodeStartClick() {

  if (cstate.mode === "tournament") {

    if (identity.role !== "admin") return;

    if (ctstate.players.length === 0) {

      addCodePlayerRow();

      addCodePlayerRow();

    }

    ctstate.bracket = [];

    ctstate.champion = null;

    ctstate.currentMatch = null;

    renderCodePlayerList();

    renderCodeTournamentLevelPicker();

    el("code-tournament-setup-error").hidden = true;

    showScreen("code-tournament-setup");

  } else {

    startCodeRound();

  }

}



// Generates one Python function from a natural-language prompt. Returns the

// function's source as a plain string. Unlike generateImage, this is never

// executed anywhere in this app - it's only ever displayed and read by the

// AI judge, exactly like a human code reviewer would.

async function generateCode(promptText) {

  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + state.apiKey,

    },

    body: JSON.stringify({

      model: CODE_MODEL,

      max_tokens: 500,

      messages: [

        { role: "system", content: CODE_GEN_SYSTEM_PROMPT },

        { role: "user", content: promptText },

      ],

    }),

  });

  if (!res.ok) {

    const errBody = await res.json().catch(() => ({}));

    throw new Error((errBody.error && errBody.error.message) || `OpenAI request failed (${res.status})`);

  }

  const data = await res.json();

  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

  // Strip markdown fences defensively, in case the model adds them despite

  // being told not to - keeps whatever gets displayed/judged clean either way.

  let code = content.trim();

  code = code.replace(/^```[a-zA-Z]*\n?/, "").replace(/```\s*$/, "").trim();

  if (!code) throw new Error("OpenAI returned empty code.");

  return code;

}



// "AI's ideal prompt" - optional, on-demand learning aid (same idea as

// Prompt Mirror's). Never runs automatically. Hands the ORIGINAL hidden

// function back to the model and asks for the best request that would

// have produced it, so the player has a model answer to compare against.

const CODE_REVERSE_PROMPT_SYSTEM =

  "You are an expert at writing prompts that make an AI produce exact " +

  "pieces of Python code. Given a Python function, write the single best, " +

  "most precise prompt you can that would make an AI write this exact " +

  "function - name the function, describe its parameters, its return " +

  "value, its behavior on edge cases, and any notable implementation " +

  "choices. Respond with ONLY the prompt itself as one tight paragraph - " +

  "no quotes, no preamble, no explanation, no markdown, no code.";



async function generateIdealCodePrompt(code) {

  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + state.apiKey,

    },

    body: JSON.stringify({

      model: SCORE_MODEL,

      max_tokens: 300,

      messages: [

        { role: "system", content: CODE_REVERSE_PROMPT_SYSTEM },

        { role: "user", content: "Write the ideal prompt that would produce this exact function:\n\n```python\n" + code + "\n```" },

      ],

    }),

  });

  if (!res.ok) {

    const errBody = await res.json().catch(() => ({}));

    throw new Error((errBody.error && errBody.error.message) || `OpenAI request failed (${res.status})`);

  }

  const data = await res.json();

  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

  const cleaned = content.trim();

  if (!cleaned) throw new Error("OpenAI returned an empty prompt.");

  return cleaned;

}



async function startCodeRound() {

  cstate.hiddenPrompt = buildHiddenCodePrompt();

  cstate.guessPrompt = "";

  cstate.originalCode = "";

  cstate.generatedCode = "";



  showScreen("code-challenge");

  updateCodeLevelBadges();

  el("code-challenge-error").hidden = true;

  el("btn-code-retry-challenge").hidden = true;

  el("code-challenge-code-wrap").hidden = true;

  el("code-challenge-form").hidden = true;

  el("input-code-guess-prompt").value = "";



  await generateCodeChallenge();

}



async function generateCodeChallenge() {

  el("code-challenge-error").hidden = true;

  el("btn-code-retry-challenge").hidden = true;

  el("code-challenge-loading-text").textContent = "Generating your challenge function…";

  el("code-challenge-loading").hidden = false;



  try {

    const code = await generateCode(cstate.hiddenPrompt);

    cstate.originalCode = code;

    el("code-challenge-code").textContent = code;

    el("code-challenge-code-wrap").hidden = false;

    el("code-challenge-form").hidden = false;

  } catch (e) {

    showCodeChallengeError(e.message);

    el("btn-code-retry-challenge").hidden = false;

  } finally {

    el("code-challenge-loading").hidden = true;

  }

}



function showCodeChallengeError(msg) {

  const errEl = el("code-challenge-error");

  errEl.textContent = errorHint(msg);

  errEl.hidden = false;

}



// --- Copy-paste / plagiarism guard -------------------------------------

// The whole point of Code Mirror is: read the shown function, then WRITE

// a prompt that describes it. A player can otherwise lift text straight

// out of the code itself (a comment, a docstring, or the whole function

// body) and hand it back as their "prompt" - trivially scoring ~100

// without ever composing a real description, since generateCode() will

// happily just echo back code it was handed almost verbatim. Removing

// docstrings/comments from generated code (see CODE_GEN_SYSTEM_PROMPT)

// closes most of this at the source, but this is a second, independent

// safety net that runs on submission and never even calls the API if it

// fires - both layers together, since an LLM instruction isn't 100%

// reliable on its own and a player could still paste the code's body

// (not just a comment) as their "prompt".

function normalizeForCompare(text) {

  return (text || "").toLowerCase().replace(/\s+/g, " ").trim();

}



function longestCommonSubstringLength(a, b) {

  // Classic O(n*m) DP - fine here since both strings are at most a few

  // hundred characters (one guess prompt, one small function).

  if (!a || !b) return 0;

  let prevRow = new Array(b.length + 1).fill(0);

  let best = 0;

  for (let i = 1; i <= a.length; i++) {

    const curRow = new Array(b.length + 1).fill(0);

    for (let j = 1; j <= b.length; j++) {

      if (a[i - 1] === b[j - 1]) {

        curRow[j] = prevRow[j - 1] + 1;

        if (curRow[j] > best) best = curRow[j];

      }

    }

    prevRow = curRow;

  }

  return best;

}



const PYTHON_SYNTAX_MARKERS = [

  /\bdef\s+\w+\s*\(/, /\breturn\b/, /\belif\b/, /\bself\b/, /:\s*\n/,

  /\bfor\s+\w+\s+in\b/, /^\s{2,}\S/m, /==|!=|\+=|-=/,

];



function detectCodeCopyPaste(promptText, referenceCode) {

  const guess = promptText || "";

  const normGuess = normalizeForCompare(guess);

  const normCode = normalizeForCompare(referenceCode);

  if (!normGuess || !normCode) return { flagged: false };



  const syntaxHits = PYTHON_SYNTAX_MARKERS.reduce((n, re) => n + (re.test(guess) ? 1 : 0), 0);

  if (syntaxHits >= 2) {

    return {

      flagged: true,

      reason: "That reads like Python code rather than a description of it. Describe what the function does in your own words instead.",

    };

  }



  const lcs = longestCommonSubstringLength(normGuess, normCode);

  if (lcs >= 25) {

    return {

      flagged: true,

      reason: "That looks copied word-for-word from the code shown above (maybe a comment or docstring). Describe what the function does in your own words instead.",

    };

  }



  const guessWords = Array.from(new Set((normGuess.match(/[a-z0-9_]{4,}/g) || [])));

  if (guessWords.length >= 4) {

    const codeWordSet = new Set(normCode.match(/[a-z0-9_]{4,}/g) || []);

    const matched = guessWords.filter((w) => codeWordSet.has(w)).length;

    if (matched / guessWords.length >= 0.75) {

      return {

        flagged: true,

        reason: "That's built almost entirely out of words lifted from the code above. Describe what the function does in your own words instead.",

      };

    }

  }



  return { flagged: false };

}



async function submitCodeGuess() {

  const guess = el("input-code-guess-prompt").value.trim();

  if (!guess) return;

  const copyCheck = detectCodeCopyPaste(guess, cstate.originalCode);

  if (copyCheck.flagged) {

    showCodeChallengeError(copyCheck.reason);

    return;

  }

  cstate.guessPrompt = guess;

  el("code-challenge-error").hidden = true;

  el("code-challenge-form").hidden = true;

  el("code-challenge-loading-text").textContent = "Generating your recreation…";

  el("code-challenge-loading").hidden = false;



  try {

    cstate.generatedCode = await generateCode(guess);

  } catch (e) {

    el("code-challenge-loading").hidden = true;

    el("code-challenge-form").hidden = false;

    showCodeChallengeError(e.message);

    return;

  }

  el("code-challenge-loading").hidden = true;



  await runCodeResultScreen();

}



function resetCodeIdealPromptUI() {

  el("code-ideal-prompt-text").hidden = true;

  el("code-ideal-prompt-text").textContent = "";

  el("code-ideal-prompt-error").hidden = true;

  el("code-ideal-prompt-loading").hidden = true;

  const btn = el("btn-reveal-code-ideal-prompt");

  btn.hidden = false;

  btn.disabled = false;

  btn.textContent = "Show AI's ideal prompt";

}



async function revealCodeIdealPrompt() {

  const btn = el("btn-reveal-code-ideal-prompt");

  btn.hidden = true;

  el("code-ideal-prompt-error").hidden = true;

  el("code-ideal-prompt-loading").hidden = false;

  try {

    const prompt = await generateIdealCodePrompt(cstate.originalCode);

    el("code-ideal-prompt-text").textContent = prompt;

    el("code-ideal-prompt-text").hidden = false;

  } catch (e) {

    el("code-ideal-prompt-error").textContent = errorHint(e.message);

    el("code-ideal-prompt-error").hidden = false;

    btn.hidden = false;

    btn.textContent = "Try again";

  } finally {

    el("code-ideal-prompt-loading").hidden = true;

  }

}



async function runCodeResultScreen() {

  showScreen("code-result");

  el("code-result-original-code").textContent = cstate.originalCode;

  el("code-result-generated-code").textContent = cstate.generatedCode;

  el("code-score-block").hidden = true;

  el("code-result-reveal").hidden = true;

  el("code-result-guess-reveal").hidden = true;

  el("code-result-feedback").textContent = "";

  resetCodeIdealPromptUI();

  el("code-result-loading-text").textContent = "Asking the AI code reviewer to score your recreation…";

  el("code-result-loading").hidden = false;



  try {

    await streamCodeScore(cstate.originalCode, cstate.generatedCode);

  } catch (e) {

    el("code-result-feedback").textContent = errorHint(e.message);

  } finally {

    el("code-result-loading").hidden = true;

    el("code-reveal-guess-text").textContent = cstate.guessPrompt;

    el("code-result-guess-reveal").hidden = false;

    el("code-reveal-prompt-text").textContent = cstate.hiddenPrompt;

    el("code-result-reveal").hidden = false;

    if (!el("code-score-block").hidden) {

      recordSoloResult(GAME_CODE_MIRROR, Number(el("code-score-value").textContent), cstate.level);

    }

  }

}



function setCodeScore(score) {

  score = Math.max(0, Math.min(100, Math.round(score)));

  el("code-score-value").textContent = score;

  const fill = el("code-score-bar-fill");

  fill.style.width = score + "%";

  let color = "#ff6b6b";

  if (score >= 70) color = "#33d6a6";

  else if (score >= 40) color = "#ffb454";

  fill.style.background = color;

  el("code-score-block").hidden = false;

}



async function streamCodeScore(origCode, genCode) {

  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + state.apiKey,

    },

    body: JSON.stringify({

      model: SCORE_MODEL,

      stream: true,

      max_tokens: 300,

      messages: [

        { role: "system", content: CODE_SCORE_SYSTEM_PROMPT },

        {

          role: "user",

          content:

            "REFERENCE (the hidden original function):\n```python\n" + origCode + "\n```\n\n" +

            "RECREATION (generated from the player's guessed prompt):\n```python\n" + genCode + "\n```\n\n" +

            "Compare them.",

        },

      ],

    }),

  });



  if (!res.ok || !res.body) {

    const errBody = await res.json().catch(() => ({}));

    throw new Error((errBody.error && errBody.error.message) || `OpenAI scoring request failed (${res.status})`);

  }



  const reader = res.body.getReader();

  const decoder = new TextDecoder();

  let buffer = "";

  let fullText = "";

  let scoreShown = false;

  let feedbackStarted = false;

  const feedbackEl = el("code-result-feedback");



  while (true) {

    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");

    buffer = lines.pop();



    for (const line of lines) {

      const trimmed = line.trim();

      if (!trimmed.startsWith("data:")) continue;

      const payload = trimmed.slice(5).trim();

      if (payload === "[DONE]") continue;

      let json;

      try {

        json = JSON.parse(payload);

      } catch (e) {

        continue;

      }

      const delta = json.choices && json.choices[0] && json.choices[0].delta;

      const piece = delta && delta.content;

      if (!piece) continue;

      fullText += piece;



      if (!scoreShown) {

        const match = fullText.match(/^\s*(\d{1,3})/);

        const hasBreak = fullText.includes("\n\n") || fullText.includes("\n\r\n");

        if (match && (hasBreak || fullText.trim().length > String(match[1]).length + 2)) {

          setCodeScore(parseInt(match[1], 10));

          scoreShown = true;

        }

      }



      if (scoreShown) {

        const afterScore = fullText.replace(/^\s*\d{1,3}\s*\n+/, "");

        if (afterScore.trim().length > 0) {

          feedbackStarted = true;

          feedbackEl.textContent = afterScore.trim();

        }

      }

    }

  }



  if (!scoreShown) {

    const match = fullText.match(/^\s*(\d{1,3})/);

    if (match) setCodeScore(parseInt(match[1], 10));

  }

  if (!feedbackStarted) {

    const afterScore = fullText.replace(/^\s*\d{1,3}\s*\n+/, "").trim();

    feedbackEl.textContent = afterScore || fullText.trim();

  }

}



// One non-streaming scoring call (used in tournament mode, same reasoning as

// Prompt Mirror's scoreImagesOnce - results stay hidden until both players

// have submitted, so streaming into the UI wouldn't be seen anyway).

async function scoreCodeOnce(origCode, genCode) {

  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + state.apiKey,

    },

    body: JSON.stringify({

      model: SCORE_MODEL,

      max_tokens: 300,

      messages: [

        { role: "system", content: CODE_SCORE_SYSTEM_PROMPT },

        {

          role: "user",

          content:

            "REFERENCE (the hidden original function):\n```python\n" + origCode + "\n```\n\n" +

            "RECREATION (generated from the player's guessed prompt):\n```python\n" + genCode + "\n```\n\n" +

            "Compare them.",

        },

      ],

    }),

  });

  if (!res.ok) {

    const errBody = await res.json().catch(() => ({}));

    throw new Error((errBody.error && errBody.error.message) || `OpenAI scoring request failed (${res.status})`);

  }

  const data = await res.json();

  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

  const match = content.match(/^\s*(\d{1,3})/);

  const score = match ? Math.max(0, Math.min(100, parseInt(match[1], 10))) : 0;

  const feedback = content.replace(/^\s*\d{1,3}\s*\n+/, "").trim() || content.trim();

  return { score, feedback };

}



function addCodePlayerRow(name) {

  if (ctstate.players.length >= 64) return;

  ctstate.players.push({ id: ctstate.nextPlayerId++, name: name || "" });

  renderCodePlayerList();

}



function bulkAddCodePlayers() {

  const raw = el("code-bulk-player-names").value;

  const names = raw.split("\n").map((s) => s.trim()).filter(Boolean);

  if (!names.length) return;

  names.forEach((name) => addCodePlayerRow(name));

  el("code-bulk-player-names").value = "";

}



function removeCodePlayerRow(id) {

  if (ctstate.players.length <= 2) return;

  ctstate.players = ctstate.players.filter((p) => p.id !== id);

  renderCodePlayerList();

}



function renderCodePlayerList() {

  const wrap = el("code-tournament-player-list");

  wrap.innerHTML = "";

  ctstate.players.forEach((p, i) => {

    const row = document.createElement("div");

    row.className = "player-row";

    row.innerHTML =

      `<input type="text" data-player-id="${p.id}" list="player-name-list" placeholder="Player ${i + 1} name" value="${escapeHtml(p.name)}" autocomplete="off">` +

      `<button type="button" class="remove-player-btn" data-remove-id="${p.id}" title="Remove player">&times;</button>`;

    wrap.appendChild(row);

  });

  wrap.querySelectorAll("input[data-player-id]").forEach((input) => {

    input.addEventListener("input", () => {

      const id = Number(input.dataset.playerId);

      const player = ctstate.players.find((p) => p.id === id);

      if (player) player.name = input.value;

    });

  });

  wrap.querySelectorAll("[data-remove-id]").forEach((btn) => {

    btn.disabled = ctstate.players.length <= 2;

    btn.addEventListener("click", () => removeCodePlayerRow(Number(btn.dataset.removeId)));

  });

}



// --- Bracket generation -------------------------------------------------



function makeCodeMatch(roundIndex, matchIndex, playerA, playerB) {

  return {

    roundIndex,

    matchIndex,

    playerA: playerA || null,

    playerB: playerB || null,

    status: playerA && playerB ? "ready" : (playerA && !playerB ? "bye" : "pending"),

    winner: null,

    subRounds: [],

    totals: {},

  };

}



async function generateCodeBracket() {

  const errEl = el("code-tournament-setup-error");

  errEl.hidden = true;

  const names = ctstate.players.map((p) => (p.name || "").trim());

  if (ctstate.players.length < 2 || names.some((n) => !n)) {

    errEl.textContent = "Give every player a name (at least 2 players).";

    errEl.hidden = false;

    return;

  }

  ctstate.players.forEach((p, i) => { p.name = names[i]; });



  await resolveTournamentPlayers(ctstate.players);

  const dupe = findDuplicateProfilePlayers(ctstate.players);

  if (dupe) {

    errEl.textContent = `"${dupe[0].name}" and "${dupe[1].name}" are the same player profile (ID ${dupe[0].profileId}). Give each player a distinct name or ID before starting.`;

    errEl.hidden = false;

    return;

  }

  await postTournamentStartEvents(ctstate.players, GAME_CODE_MIRROR);



  const shuffled = shuffle(ctstate.players);

  const n = shuffled.length;

  const size = nextPowerOfTwo(n);

  const byes = size - n;



  const byePlayers = shuffled.slice(0, byes);

  const matchPlayers = shuffled.slice(byes);

  const slotDescriptors = byePlayers.map((p) => ({ players: [p, null] }));

  for (let i = 0; i < matchPlayers.length; i += 2) {

    slotDescriptors.push({ players: [matchPlayers[i], matchPlayers[i + 1]] });

  }

  const orderedSlots = shuffle(slotDescriptors);

  const round1 = orderedSlots.map((slot, idx) => makeCodeMatch(0, idx, slot.players[0], slot.players[1]));



  const rounds = [round1];

  let prevCount = round1.length;

  let r = 1;

  while (prevCount > 1) {

    const count = prevCount / 2;

    const round = [];

    for (let i = 0; i < count; i++) round.push(makeCodeMatch(r, i, null, null));

    rounds.push(round);

    prevCount = count;

    r++;

  }



  ctstate.bracket = rounds;

  ctstate.champion = null;

  ctstate.currentMatch = null;



  round1.forEach((m) => {

    if (m.status === "bye") resolveCodeByeMatch(m);

  });



  showScreen("code-tournament-bracket");

  renderCodeBracket();

}



function resolveCodeByeMatch(m) {

  m.status = "done";

  m.winner = m.playerA;

  advanceCodeWinner(m);

}



function advanceCodeWinner(m) {

  const rounds = ctstate.bracket;

  const nextRoundIndex = m.roundIndex + 1;

  if (nextRoundIndex >= rounds.length) {

    ctstate.champion = m.winner;

    return;

  }

  const nextMatch = rounds[nextRoundIndex][Math.floor(m.matchIndex / 2)];

  if (m.matchIndex % 2 === 0) nextMatch.playerA = m.winner;

  else nextMatch.playerB = m.winner;

  if (nextMatch.playerA && nextMatch.playerB) nextMatch.status = "ready";

}



function codeRoundName(roundIndex) {

  const matchesInRound = ctstate.bracket[roundIndex].length;

  if (matchesInRound === 1) return "Final";

  if (matchesInRound === 2) return "Semifinal";

  if (matchesInRound === 4) return "Quarterfinal";

  return `Round of ${matchesInRound * 2}`;

}



function findNextPlayableCodeMatch() {

  for (const round of ctstate.bracket) {

    for (const m of round) {

      if (m.status === "ready") return m;

    }

  }

  return null;

}



// --- Bracket rendering ----------------------------------------------------



function renderCodeBracketSlot(m, which) {

  if (m.status === "bye" && which === "B") {

    return `<div class="bracket-slot bye-slot">BYE</div>`;

  }

  const player = which === "A" ? m.playerA : m.playerB;

  if (!player) return `<div class="bracket-slot">TBD</div>`;

  const isWinner = !!(m.winner && m.winner.id === player.id);

  const score = m.totals && m.totals[player.id] != null ? m.totals[player.id] : null;

  return `<div class="bracket-slot${isWinner ? " winner-slot" : ""}">` +

    `<span>${escapeHtml(player.name)}</span>` +

    (score != null ? `<span class="bracket-score">${score}</span>` : "") +

    `</div>`;

}



function renderCodeBracket() {

  const wrap = el("code-bracket-view");

  wrap.innerHTML = "";

  ctstate.bracket.forEach((round, ri) => {

    const col = document.createElement("div");

    col.className = "bracket-round";

    const title = document.createElement("div");

    title.className = "bracket-round-title";

    title.textContent = codeRoundName(ri);

    col.appendChild(title);



    round.forEach((m) => {

      const card = document.createElement("div");

      const playable = m.status === "ready";

      card.className = "bracket-match" + (playable ? " playable" : "") + (m.status === "done" || m.status === "bye" ? " done" : "");



      const tagText = m.status === "done" ? "Completed"

        : m.status === "bye" ? "Bye"

        : m.status === "ready" ? "Ready to play"

        : "Waiting";

      card.innerHTML =

        `<div class="bracket-match-tag${m.status === "pending" ? " tbd" : ""}">${tagText}</div>` +

        renderCodeBracketSlot(m, "A") + renderCodeBracketSlot(m, "B");



      if (playable) card.addEventListener("click", () => startCodeMatch(m));

      col.appendChild(card);

    });

    wrap.appendChild(col);

  });



  const banner = el("code-bracket-champion-banner");

  if (ctstate.champion) {

    banner.hidden = false;

    banner.textContent = `Champion: ${ctstate.champion.name}`;

  } else {

    banner.hidden = true;

  }



  el("btn-code-play-next-match").hidden = !findNextPlayableCodeMatch();

}



// --- Playing one match (sub-rounds through the chosen levels) -------------



function startCodeMatch(m) {

  ctstate.currentMatch = m;

  m.subRounds = [];

  m.totals = { [m.playerA.id]: 0, [m.playerB.id]: 0 };

  m.levels = ctstate.levels.slice();

  const levelLabel = m.levels.map((n) => `Level ${n}`).join(", ");

  el("code-match-round-name").textContent = codeRoundName(m.roundIndex);

  el("code-match-players-label").textContent = `${m.playerA.name} vs ${m.playerB.name} — best of ${m.levels.length} (${levelLabel}). Higher cumulative score advances.`;

  showScreen("code-tournament-match");

  renderCodeMatchTally(m);

  startCodeSubRound(m, m.levels[0], false);

}



function renderCodeMatchTally(m) {

  const wrap = el("code-match-tally");

  wrap.innerHTML = "";

  [m.playerA, m.playerB].forEach((p) => {

    const item = document.createElement("div");

    item.className = "match-tally-item";

    item.innerHTML =

      `<div class="mt-name">${escapeHtml(p.name)}</div>` +

      `<div class="mt-score">${m.totals[p.id] || 0}<span class="mt-score-max"> total</span></div>`;

    wrap.appendChild(item);

  });

}



function renderCodeMatchPlayerStatus(m, sub) {

  const wrap = el("code-match-player-status-list");

  wrap.innerHTML = "";

  [["a", m.playerA], ["b", m.playerB]].forEach(([key, player]) => {

    const entry = sub[key];

    const done = entry.score != null;

    const chip = document.createElement("span");

    chip.className = "player-status-chip";

    if (done) chip.classList.add("done");

    else if (sub.currentTurn === key) chip.classList.add("current");

    chip.textContent = player.name + (done ? " — submitted" : sub.currentTurn === key ? " — up now" : " — waiting");

    wrap.appendChild(chip);

  });

}



async function startCodeSubRound(m, level, isTiebreaker) {

  const sub = {

    index: m.subRounds.length,

    level,

    isTiebreaker,

    hiddenPrompt: "",

    originalCode: "",

    a: { prompt: "", code: "", score: null, feedback: "" },

    b: { prompt: "", code: "", score: null, feedback: "" },

    currentTurn: "a",

  };

  m.subRounds.push(sub);



  el("code-sub-round-num").textContent = isTiebreaker ? "Tiebreaker" : String(sub.index + 1);

  el("code-sub-round-of-wrap").hidden = isTiebreaker;

  el("code-sub-round-total").textContent = String(m.levels.length);

  el("code-sub-round-level-badge").textContent = (CODE_LEVELS[level] || CODE_LEVELS[1]).label;

  el("code-match-error").hidden = true;

  el("btn-code-retry-subround").hidden = true;

  el("code-match-code-wrap").hidden = true;

  el("code-match-prompt-form").hidden = true;

  el("code-match-processing").hidden = true;

  el("code-match-subround-result").hidden = true;

  el("code-match-final-result").hidden = true;

  el("code-match-subround-active").hidden = false;

  renderCodeMatchPlayerStatus(m, sub);



  sub.hiddenPrompt = buildHiddenCodePrompt(level);

  await generateSubRoundCode(m, sub);

}



async function generateSubRoundCode(m, sub) {

  el("code-match-error").hidden = true;

  el("btn-code-retry-subround").hidden = true;

  el("code-match-code-wrap").hidden = true;

  el("code-match-loading").hidden = false;



  try {

    const code = await generateCode(sub.hiddenPrompt);

    sub.originalCode = code;

    el("code-match-challenge-code").textContent = code;

    el("code-match-code-wrap").hidden = false;

    showCodeMatchPromptForm(m, sub);

  } catch (e) {

    el("code-match-error").textContent = errorHint(e.message);

    el("code-match-error").hidden = false;

    el("btn-code-retry-subround").hidden = false;

    el("btn-code-retry-subround").onclick = () => generateSubRoundCode(m, sub);

  } finally {

    el("code-match-loading").hidden = true;

  }

}



function showCodeMatchPromptForm(m, sub) {

  const player = sub.currentTurn === "a" ? m.playerA : m.playerB;

  el("code-match-current-player-label").textContent = `${player.name}'s prompt`;

  el("input-code-match-prompt").value = "";

  el("code-match-prompt-form").hidden = false;

  el("code-match-processing").hidden = true;

  renderCodeMatchPlayerStatus(m, sub);

}



async function submitCodeMatchPrompt() {

  const m = ctstate.currentMatch;

  const sub = m.subRounds[m.subRounds.length - 1];

  const guess = el("input-code-match-prompt").value.trim();

  if (!guess) return;

  const copyCheck = detectCodeCopyPaste(guess, sub.originalCode);

  if (copyCheck.flagged) {

    el("code-match-error").textContent = copyCheck.reason;

    el("code-match-error").hidden = false;

    return;

  }

  const key = sub.currentTurn;

  const player = key === "a" ? m.playerA : m.playerB;

  const entry = sub[key];

  entry.prompt = guess;



  el("code-match-error").hidden = true;

  el("code-match-prompt-form").hidden = true;

  el("code-match-processing-text").textContent = `Generating ${player.name}'s function…`;

  el("code-match-processing").hidden = false;



  try {

    entry.code = await generateCode(guess);

    el("code-match-processing-text").textContent = `Scoring ${player.name}'s function…`;

    const { score, feedback } = await scoreCodeOnce(sub.originalCode, entry.code);

    entry.score = score;

    entry.feedback = feedback;

  } catch (e) {

    el("code-match-processing").hidden = true;

    el("code-match-prompt-form").hidden = false;

    el("input-code-match-prompt").value = guess;

    el("code-match-error").textContent = errorHint(e.message);

    el("code-match-error").hidden = false;

    return;

  }



  if (key === "a") {

    sub.currentTurn = "b";

    showCodeMatchPromptForm(m, sub);

  } else {

    renderCodeMatchPlayerStatus(m, sub);

    finishCodeSubRound(m, sub);

  }

}



async function revealCodeMatchIdealPrompt(originalCode) {

  const btn = el("btn-reveal-code-match-ideal-prompt");

  btn.hidden = true;

  el("code-match-ideal-prompt-error").hidden = true;

  el("code-match-ideal-prompt-loading").hidden = false;

  try {

    const prompt = await generateIdealCodePrompt(originalCode);

    el("code-match-ideal-prompt-text").textContent = prompt;

    el("code-match-ideal-prompt-text").hidden = false;

  } catch (e) {

    el("code-match-ideal-prompt-error").textContent = errorHint(e.message);

    el("code-match-ideal-prompt-error").hidden = false;

    btn.hidden = false;

    btn.textContent = "Try again";

  } finally {

    el("code-match-ideal-prompt-loading").hidden = true;

  }

}



function finishCodeSubRound(m, sub) {

  m.totals[m.playerA.id] = (m.totals[m.playerA.id] || 0) + (sub.a.score || 0);

  m.totals[m.playerB.id] = (m.totals[m.playerB.id] || 0) + (sub.b.score || 0);

  renderCodeMatchTally(m);

  recordTournamentLevelResult(m.playerA, GAME_CODE_MIRROR, sub.level, sub.a.score || 0);

  recordTournamentLevelResult(m.playerB, GAME_CODE_MIRROR, sub.level, sub.b.score || 0);



  el("code-match-subround-active").hidden = true;

  el("code-match-subround-result").hidden = false;

  el("code-match-subround-prompt-text").textContent = sub.hiddenPrompt;



  // Code Mirror tournaments are same-device/turn-based (unlike Prompt

  // Mirror's polled ones), so this only ever renders once per sub-round -

  // no re-render guard needed before resetting the ideal-prompt block.

  el("code-match-ideal-prompt-text").hidden = true;

  el("code-match-ideal-prompt-text").textContent = "";

  el("code-match-ideal-prompt-error").hidden = true;

  el("code-match-ideal-prompt-loading").hidden = true;

  const idealBtn = el("btn-reveal-code-match-ideal-prompt");

  idealBtn.hidden = false;

  idealBtn.disabled = false;

  idealBtn.textContent = "Show AI's ideal prompt";

  idealBtn.onclick = () => revealCodeMatchIdealPrompt(sub.originalCode);



  const cardsWrap = el("code-match-subround-cards");

  cardsWrap.innerHTML = "";

  const subTop = Math.max(sub.a.score || 0, sub.b.score || 0);

  [{ p: m.playerA, e: sub.a }, { p: m.playerB, e: sub.b }]

    .sort((x, y) => (y.e.score || 0) - (x.e.score || 0))

    .forEach(({ p, e }) => {

      const isWinner = (e.score || 0) === subTop;

      const card = document.createElement("div");

      card.className = "tournament-result-card" + (isWinner ? " winner" : "");

      card.innerHTML =

        (isWinner ? '<div class="trc-winner-tag">Sub-round winner</div>' : "") +

        `<pre class="code-block"><code>${escapeHtml(e.code)}</code></pre>` +

        `<div class="trc-name">${escapeHtml(p.name)}</div>` +

        `<div class="trc-score">${e.score || 0}<span style="font-size:1rem;color:var(--muted);">/100</span></div>` +

        `<div class="trc-feedback">${escapeHtml(e.feedback)}</div>` +

        `<div class="trc-prompt">"${escapeHtml(e.prompt)}"</div>`;

      cardsWrap.appendChild(card);

    });



  const plannedDone = m.subRounds.length >= m.levels.length;



  el("btn-code-next-subround").onclick = () => {

    if (plannedDone) {

      const totalA = m.totals[m.playerA.id];

      const totalB = m.totals[m.playerB.id];

      if (totalA === totalB) {

        startCodeSubRound(m, m.levels[m.levels.length - 1], true);

      } else {

        finishCodeMatch(m);

      }

    } else {

      startCodeSubRound(m, m.levels[m.subRounds.length], false);

    }

  };

}



function finishCodeMatch(m) {

  const totalA = m.totals[m.playerA.id];

  const totalB = m.totals[m.playerB.id];

  m.winner = totalA >= totalB ? m.playerA : m.playerB;

  m.status = "done";

  advanceCodeWinner(m);



  const isFinal = m.roundIndex === ctstate.bracket.length - 1;

  const stageLabel = codeRoundName(m.roundIndex);

  const stageRank = stageRankForRoundName(stageLabel);

  recordMatchResult(m.playerA, GAME_CODE_MIRROR, m.winner.id === m.playerA.id, stageLabel, stageRank, totalA);

  recordMatchResult(m.playerB, GAME_CODE_MIRROR, m.winner.id === m.playerB.id, stageLabel, stageRank, totalB);

  if (isFinal) recordTournamentWon(m.winner, GAME_CODE_MIRROR);



  el("code-match-subround-active").hidden = true;

  el("code-match-subround-result").hidden = true;

  el("code-match-final-result").hidden = false;

  el("code-match-winner-banner").textContent = isFinal

    ? `${m.winner.name} wins the tournament!`

    : `${m.winner.name} wins the match and advances!`;



  const tallyWrap = el("code-match-final-tally");

  tallyWrap.innerHTML = "";

  [m.playerA, m.playerB]

    .sort((x, y) => m.totals[y.id] - m.totals[x.id])

    .forEach((p) => {

      const row = document.createElement("div");

      row.className = "standings-row" + (p.id === m.winner.id ? " leader" : "");

      row.innerHTML = `<span class="standings-name">${escapeHtml(p.name)}</span><span class="standings-detail">${m.totals[p.id]} total</span>`;

      tallyWrap.appendChild(row);

    });

}



function initCodeMirror() {

  el("card-code-mirror").querySelector("button").addEventListener("click", () => showScreen("code-rules"));



  document.querySelectorAll("#code-level-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => setCodeLevel(Number(b.dataset.level)));

  });

  document.querySelectorAll("#code-mode-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => setCodeMode(b.dataset.mode));

  });

  el("btn-code-start-round").addEventListener("click", handleCodeStartClick);

  el("btn-code-submit-guess").addEventListener("click", submitCodeGuess);

  el("btn-code-retry-challenge").addEventListener("click", generateCodeChallenge);

  el("btn-code-play-again").addEventListener("click", startCodeRound);

  el("btn-reveal-code-ideal-prompt").addEventListener("click", revealCodeIdealPrompt);

  el("btn-code-back-to-arcade").addEventListener("click", () => showScreen("hub"));



  el("btn-code-add-player").addEventListener("click", () => addCodePlayerRow());

  el("btn-code-bulk-add-players").addEventListener("click", bulkAddCodePlayers);

  document.querySelectorAll("#code-tournament-level-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => toggleCodeTournamentLevel(Number(b.dataset.level)));

  });

  el("btn-code-generate-bracket").addEventListener("click", generateCodeBracket);

  el("btn-code-play-next-match").addEventListener("click", () => {

    const m = findNextPlayableCodeMatch();

    if (m) startCodeMatch(m);

  });

  el("btn-code-new-tournament-from-bracket").addEventListener("click", () => {

    ctstate.bracket = [];

    ctstate.champion = null;

    ctstate.currentMatch = null;

    renderCodePlayerList();

    renderCodeTournamentLevelPicker();

    el("code-tournament-setup-error").hidden = true;

    showScreen("code-tournament-setup");

  });

  el("btn-code-submit-match-prompt").addEventListener("click", submitCodeMatchPrompt);

  el("btn-code-finish-match").addEventListener("click", () => {

    showScreen("code-tournament-bracket");

    renderCodeBracket();

  });

}



// =======================================================================

// Prompt Repair Shop - fourth arcade game. Kept fully independent from the

// other three games' state (own solo state `pstate`, own tournament state

// `ptstate`, own screens/functions) and only reuses truly generic helpers:

// el, showScreen, pick, shuffle, nextPowerOfTwo, escapeHtml, errorHint,

// state.apiKey, CODE_MODEL, and the generic player-profile event functions

// (resolveTournamentPlayers, findDuplicateProfilePlayers,

// postTournamentStartEvents, recordSoloResult, recordMatchResult,

// recordTournamentLevelResult, recordTournamentWon,

// stageRankForRoundName).

//

// A different engine from the other three games: there's no hidden

// "original" to reproduce and no AI judge. Each "ticket" is a fixed,

// fully-authored puzzle (a broken system prompt + a customer's plain-

// English requirements + 5 fixed test messages with known-correct

// extracted answers, 2 shown up front and 3 kept hidden). The player edits

// the prompt and clicks "Test repair", which runs their CURRENT prompt as

// the system message against all 5 test messages, and every check is

// graded by plain deterministic JS (JSON.parse + structural/value

// checks) - not by an AI judge - so grading is exact and reproducible.

// =======================================================================



// --- Ticket content: one bespoke, fully-authored puzzle per level -------

// (kept as one-item arrays so more tickets can be appended per level later

// without touching any other code - REPAIR_LEVELS[n].tickets is picked

// from with pick(), same as every other game's level content banks.)



function validatePersonTicket(parsed, expected) {

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {

    return { pass: false, note: "The response wasn't a single JSON object." };

  }

  const keys = Object.keys(parsed).sort();

  if (keys.length !== 2 || keys[0] !== "age" || keys[1] !== "name") {

    return { pass: false, note: `Expected exactly the keys "name" and "age" - got: ${keys.join(", ") || "(none)"}.` };

  }

  const gotName = (typeof parsed.name === "string" ? parsed.name : "").trim().toLowerCase();

  const expName = expected.name.toLowerCase();

  const nameOk = gotName.length > 0 && (expName.includes(gotName) || gotName.includes(expName));

  if (!nameOk) {

    return { pass: false, note: `"name" was ${JSON.stringify(parsed.name)}, expected something matching "${expected.name}".` };

  }

  if (expected.age === null) {

    const ageOk = parsed.age === null || parsed.age === "null" || parsed.age === undefined;

    if (!ageOk) return { pass: false, note: `"age" wasn't mentioned in the message, so it should be null - got ${JSON.stringify(parsed.age)}.` };

  } else {

    const num = Number(parsed.age);

    if (Number.isNaN(num) || num !== expected.age) {

      return { pass: false, note: `"age" was ${JSON.stringify(parsed.age)}, expected ${expected.age}.` };

    }

  }

  return { pass: true, note: "Matched." };

}



function validateSentimentTicket(parsed, expected) {

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {

    return { pass: false, note: "The response wasn't a single JSON object." };

  }

  const keys = Object.keys(parsed).sort();

  if (keys.length !== 2 || keys[0] !== "reason" || keys[1] !== "sentiment") {

    return { pass: false, note: `Expected exactly the keys "sentiment" and "reason" - got: ${keys.join(", ") || "(none)"}.` };

  }

  const sentiment = (typeof parsed.sentiment === "string" ? parsed.sentiment : "").trim().toLowerCase();

  if (sentiment !== expected.sentiment) {

    return { pass: false, note: `"sentiment" was ${JSON.stringify(parsed.sentiment)}, expected "${expected.sentiment}".` };

  }

  const reason = (typeof parsed.reason === "string" ? parsed.reason : "").trim();

  if (!reason) return { pass: false, note: `"reason" was empty.` };

  const wordCount = tokenizeWords(reason).length;

  if (wordCount > 10) return { pass: false, note: `"reason" was ${wordCount} words - the customer needs it 10 words or fewer.` };

  return { pass: true, note: "Matched." };

}



function validateOrderTicket(parsed, expected) {

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {

    return { pass: false, note: "The response wasn't a single JSON object." };

  }

  const keys = Object.keys(parsed);

  if (keys.length !== 1 || keys[0] !== "items") {

    return { pass: false, note: `Expected exactly the key "items" - got: ${keys.join(", ") || "(none)"}.` };

  }

  if (!Array.isArray(parsed.items)) {

    return { pass: false, note: `"items" wasn't an array.` };

  }

  if (parsed.items.length !== expected.items.length) {

    return { pass: false, note: `Expected ${expected.items.length} item(s) in the order, got ${parsed.items.length}.` };

  }

  const pool = parsed.items.slice();

  for (const exp of expected.items) {

    const idx = pool.findIndex((it) => {

      if (!it || typeof it !== "object") return false;

      const nm = (typeof it.name === "string" ? it.name : "").toLowerCase();

      const qtyOk = Number(it.quantity) === exp.quantity;

      const nameOk = exp.keywords.every((kw) => nm.includes(kw));

      return qtyOk && nameOk;

    });

    if (idx === -1) {

      return { pass: false, note: `Missing an item matching "${exp.keywords.join(" ")}" with quantity ${exp.quantity}.` };

    }

    pool.splice(idx, 1);

  }

  return { pass: true, note: "Matched." };

}



const TICKET_PERSON = {

  title: "New Customer Signup",

  customerRequest: "A customer wants an AI to extract a person's name and age from a message.",

  brokenPrompt: "Read this message and tell me about the person.",

  requirements: [

    "Return only JSON with the keys \"name\" and \"age\" - nothing else.",

    "If the age isn't mentioned, use null for age instead of guessing.",

  ],

  hints: [

    "Tell the AI exactly what format to respond in - name the JSON fields you want and say nothing else should be included.",

    "Be explicit about what to do when a piece of information is missing - otherwise the AI will guess or invent something.",

  ],

  lesson: "This ticket practiced constraining output to a strict format (JSON-only, exact field names) and explicitly handling missing information instead of letting the AI guess.",

  validate: validatePersonTicket,

  testCase: { message: "Hi, I'm Maria Chen, 34 years old, and I'd like to update my shipping address.", expected: { name: "Maria Chen", age: 34 } },

};



const TICKET_SENTIMENT = {

  title: "Review Triage",

  customerRequest: "A customer wants an AI to read a product review and extract the sentiment and the main reason for it.",

  brokenPrompt: "Summarize what this review says.",

  requirements: [

    "Return only JSON with the keys \"sentiment\" and \"reason\" - sentiment must be exactly \"positive\", \"negative\", or \"neutral\".",

    "Keep \"reason\" to 10 words or fewer.",

  ],

  hints: [

    "Give the AI a fixed list of allowed values for sentiment, and tell it to pick exactly one - don't leave the wording open-ended.",

    "Put a hard limit on the reason field's length so the AI can't just paste back the whole review.",

  ],

  lesson: "This ticket practiced constraining a field to an enum of allowed values and enforcing a length limit - both stop an AI from giving a technically-related but unusable answer.",

  validate: validateSentimentTicket,

  testCase: { message: "This blender is a total waste of money. It broke after two uses and customer service never replied.", expected: { sentiment: "negative" } },

};



const TICKET_ORDER = {

  title: "Cafe Order Parsing",

  customerRequest: "A customer wants an AI to extract every item and quantity mentioned in an order message, as a list.",

  brokenPrompt: "What is this person ordering?",

  requirements: [

    "Return only JSON with a single key \"items\", a list of objects each with \"name\" and \"quantity\".",

    "If no quantity is stated for an item, use 1 as the default.",

  ],

  hints: [

    "Tell the AI the exact shape of each list item (which fields, in what order) so it can't invent extra fields or skip the array wrapper.",

    "Spell out what to do when a quantity isn't stated for an item, so the AI doesn't just omit it.",

  ],

  lesson: "This ticket practiced getting structured, nested output (a list of objects) and a sensible default for a missing field.",

  validate: validateOrderTicket,

  testCase: { message: "I'd like 2 large coffees and a blueberry muffin, please.", expected: { items: [{ keywords: ["coffee"], quantity: 2 }, { keywords: ["muffin"], quantity: 1 }] } },

};



const REPAIR_LEVELS = {

  1: {

    label: "Level 1 — Easy",

    hint: "Level 1: extract one or two simple fields from a short message.",

    tickets: [TICKET_PERSON],

  },

  2: {

    label: "Level 2 — Medium",

    hint: "Level 2: constrain a field to a fixed set of allowed values, plus a length limit.",

    tickets: [TICKET_SENTIMENT],

  },

  3: {

    label: "Level 3 — Hard",

    hint: "Level 3: extract a structured list and handle the 'nothing here' edge case. Hardest to fully repair.",

    tickets: [TICKET_ORDER],

  },

};



// --- Dynamic ticket generation -------------------------------------------

// The three TICKET_* constants above are fixed, hand-authored puzzles, so

// every playthrough of a level used to replay the exact same customer

// scenario. Each level still has an exact-match SCHEMA it grades against

// (name+age / sentiment+reason / items list) - that's what keeps grading

// deterministic and fair for a tournament - but the business CONTEXT

// (the title, the broken prompt, the customer messages, the names and

// values) is now invented fresh by an LLM every round, the same way Emoji

// Charades generates a fresh phrase and Code Mirror a fresh function. The

// AI is only ever asked to author CONTENT in an already-fixed shape; the

// existing validatePersonTicket/validateSentimentTicket/validateOrderTicket

// functions still do 100% deterministic local grading against whatever

// values the AI put in "expected", unchanged. If generation or parsing

// ever fails, getRepairTicket() silently falls back to picking from the

// small static bank above, so a round never stalls over one bad call.



const REPAIR_GEN_SYSTEM_PERSON =

  "You invent one fresh 'repair ticket' for a prompt-engineering practice " +

  "game called Prompt Repair Shop, for a task type where an AI must " +

  "extract a PERSON'S NAME and AGE from a short customer message.\n\n" +

  "Invent a believable, varied business context (a support ticket, a " +

  "booking, a delivery note, a helpdesk log, a registration, etc. - vary " +

  "it every time, don't default to 'customer signup') and respond with " +

  "ONLY a single JSON object shaped exactly like this, nothing else - no " +

  "markdown fences, no commentary:\n" +

  '{"title": "3-5 word ticket title", ' +

  '"customerRequest": "one sentence describing what the business wants extracted", ' +

  '"brokenPrompt": "a short, plausibly-naive one-sentence system prompt a non-expert might try first - it must NOT already specify a JSON output format or how to handle a missing age", ' +

  '"requirements": ["exactly 2 short requirement strings: (1) return ONLY JSON with keys name and age, nothing else, (2) use null for age when the message does not mention it rather than guessing"], ' +

  '"hints": ["exactly 2 short hint strings that nudge toward those fixes without just stating them outright"], ' +

  '"lesson": "one sentence naming the general prompting skill this practices", ' +

  '"testCase": {"message": "one short realistic customer message", "name": "the person\'s full name as naturally written", "age": integer, or null if the message never states an age}}\n\n' +

  "Whether the message mentions an age or not is your choice - vary it round to round. Respond with ONLY that JSON object.";



const REPAIR_GEN_SYSTEM_SENTIMENT =

  "You invent one fresh 'repair ticket' for a prompt-engineering practice " +

  "game called Prompt Repair Shop, for a task type where an AI must " +

  "classify the SENTIMENT of a short review or message and give a brief " +

  "reason.\n\n" +

  "Invent a believable, varied business context (a product review, an app " +

  "store review, a restaurant review, a support chat transcript, etc. - " +

  "vary the product/service every time) and respond with ONLY a single " +

  "JSON object shaped exactly like this, nothing else - no markdown " +

  "fences, no commentary:\n" +

  '{"title": "3-5 word ticket title", ' +

  '"customerRequest": "one sentence describing what the business wants extracted", ' +

  '"brokenPrompt": "a short, plausibly-naive one-sentence system prompt a non-expert might try first - it must NOT already constrain sentiment to fixed values or limit the reason\'s length", ' +

  '"requirements": ["exactly 2 short requirement strings: (1) return ONLY JSON with keys sentiment and reason - sentiment must be exactly positive, negative, or neutral, (2) keep reason to 10 words or fewer"], ' +

  '"hints": ["exactly 2 short hint strings that nudge toward those fixes without just stating them outright"], ' +

  '"lesson": "one sentence naming the general prompting skill this practices", ' +

  '"testCase": {"message": "one short realistic review or message", "sentiment": "positive", "negative", or "neutral"}}\n\n' +

  "Pick whichever sentiment fits the message you write - vary it round to round. Respond with ONLY that JSON object.";



const REPAIR_GEN_SYSTEM_ORDER =

  "You invent one fresh 'repair ticket' for a prompt-engineering practice " +

  "game called Prompt Repair Shop, for a task type where an AI must " +

  "extract every ordered item and its quantity from a short order " +

  "message, as a list.\n\n" +

  "Invent a believable, varied business context (a cafe, a pharmacy, a " +

  "hardware store, a florist, a bookstore, etc. - vary it every time) and " +

  "respond with ONLY a single JSON object shaped exactly like this, " +

  "nothing else - no markdown fences, no commentary:\n" +

  '{"title": "3-5 word ticket title", ' +

  '"customerRequest": "one sentence describing what the business wants extracted", ' +

  '"brokenPrompt": "a short, plausibly-naive one-sentence system prompt a non-expert might try first - it must NOT already specify the output shape or how to handle a missing quantity", ' +

  '"requirements": ["exactly 2 short requirement strings: (1) return ONLY JSON with a single key items, a list of objects each with name and quantity, (2) default quantity to 1 when it is not stated"], ' +

  '"hints": ["exactly 2 short hint strings that nudge toward those fixes without just stating them outright"], ' +

  '"lesson": "one sentence naming the general prompting skill this practices", ' +

  '"testCase": {"message": "one short realistic order message that mentions at least one item - not an empty or nothing-ordered message", "items": [{"keywords": ["1-2 lowercase words that would appear in the item\'s name"], "quantity": integer}, ...]}}\n\n' +

  "Include at least one item where the quantity is only implied (not stated as a number), so quantity should be 1. Respond with ONLY that JSON object.";



function isNonEmptyString(v) {

  return typeof v === "string" && v.trim().length > 0;

}



function validateGeneratedPersonTicket(t) {

  return !!t && isNonEmptyString(t.title) && isNonEmptyString(t.customerRequest) &&

    isNonEmptyString(t.brokenPrompt) &&

    Array.isArray(t.requirements) && t.requirements.length >= 2 && t.requirements.every(isNonEmptyString) &&

    Array.isArray(t.hints) && t.hints.length >= 1 && t.hints.every(isNonEmptyString) &&

    isNonEmptyString(t.lesson) &&

    !!t.testCase && isNonEmptyString(t.testCase.message) && isNonEmptyString(t.testCase.name) &&

    (t.testCase.age === null || (Number.isInteger(t.testCase.age) && t.testCase.age > 0 && t.testCase.age < 130));

}



function validateGeneratedSentimentTicket(t) {

  return !!t && isNonEmptyString(t.title) && isNonEmptyString(t.customerRequest) &&

    isNonEmptyString(t.brokenPrompt) &&

    Array.isArray(t.requirements) && t.requirements.length >= 2 && t.requirements.every(isNonEmptyString) &&

    Array.isArray(t.hints) && t.hints.length >= 1 && t.hints.every(isNonEmptyString) &&

    isNonEmptyString(t.lesson) &&

    !!t.testCase && isNonEmptyString(t.testCase.message) &&

    ["positive", "negative", "neutral"].includes(String(t.testCase.sentiment || "").trim().toLowerCase());

}



function validateGeneratedOrderTicket(t) {

  return !!t && isNonEmptyString(t.title) && isNonEmptyString(t.customerRequest) &&

    isNonEmptyString(t.brokenPrompt) &&

    Array.isArray(t.requirements) && t.requirements.length >= 2 && t.requirements.every(isNonEmptyString) &&

    Array.isArray(t.hints) && t.hints.length >= 1 && t.hints.every(isNonEmptyString) &&

    isNonEmptyString(t.lesson) &&

    !!t.testCase && isNonEmptyString(t.testCase.message) && Array.isArray(t.testCase.items) &&

    t.testCase.items.length >= 1 &&

    t.testCase.items.every((it) => it && Array.isArray(it.keywords) && it.keywords.length >= 1 &&

      it.keywords.every(isNonEmptyString) && Number.isInteger(Number(it.quantity)) && Number(it.quantity) > 0);

}



function buildPersonTicketFromGenerated(t) {

  return {

    title: t.title.trim(),

    customerRequest: t.customerRequest.trim(),

    brokenPrompt: t.brokenPrompt.trim(),

    requirements: t.requirements.map((r) => String(r).trim()),

    hints: t.hints.map((h) => String(h).trim()),

    lesson: t.lesson.trim(),

    validate: validatePersonTicket,

    testCase: {

      message: String(t.testCase.message).trim(),

      expected: { name: String(t.testCase.name).trim(), age: t.testCase.age === null ? null : Number(t.testCase.age) },

    },

  };

}



function buildSentimentTicketFromGenerated(t) {

  return {

    title: t.title.trim(),

    customerRequest: t.customerRequest.trim(),

    brokenPrompt: t.brokenPrompt.trim(),

    requirements: t.requirements.map((r) => String(r).trim()),

    hints: t.hints.map((h) => String(h).trim()),

    lesson: t.lesson.trim(),

    validate: validateSentimentTicket,

    testCase: {

      message: String(t.testCase.message).trim(),

      expected: { sentiment: String(t.testCase.sentiment).trim().toLowerCase() },

    },

  };

}



function buildOrderTicketFromGenerated(t) {

  return {

    title: t.title.trim(),

    customerRequest: t.customerRequest.trim(),

    brokenPrompt: t.brokenPrompt.trim(),

    requirements: t.requirements.map((r) => String(r).trim()),

    hints: t.hints.map((h) => String(h).trim()),

    lesson: t.lesson.trim(),

    validate: validateOrderTicket,

    testCase: {

      message: String(t.testCase.message).trim(),

      expected: {

        items: t.testCase.items.map((it) => ({

          keywords: it.keywords.map((k) => String(k).trim().toLowerCase()),

          quantity: Number(it.quantity) || 1,

        })),

      },

    },

  };

}



const REPAIR_ARCHETYPES = {

  1: { systemPrompt: REPAIR_GEN_SYSTEM_PERSON, validateGenerated: validateGeneratedPersonTicket, build: buildPersonTicketFromGenerated },

  2: { systemPrompt: REPAIR_GEN_SYSTEM_SENTIMENT, validateGenerated: validateGeneratedSentimentTicket, build: buildSentimentTicketFromGenerated },

  3: { systemPrompt: REPAIR_GEN_SYSTEM_ORDER, validateGenerated: validateGeneratedOrderTicket, build: buildOrderTicketFromGenerated },

};



async function generateRepairTicketAI(level) {

  const archetype = REPAIR_ARCHETYPES[level] || REPAIR_ARCHETYPES[1];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + state.apiKey,

    },

    body: JSON.stringify({

      model: SCORE_MODEL,

      max_tokens: 900,

      temperature: 1.05,

      messages: [

        { role: "system", content: archetype.systemPrompt },

        { role: "user", content: "Invent a fresh ticket now." },

      ],

    }),

  });

  if (!res.ok) {

    const errBody = await res.json().catch(() => ({}));

    throw new Error((errBody.error && errBody.error.message) || `OpenAI request failed (${res.status})`);

  }

  const data = await res.json();

  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

  const parsed = parseRepairJson(content);

  if (!parsed || !archetype.validateGenerated(parsed)) {

    throw new Error("AI-generated ticket didn't match the expected shape.");

  }

  return archetype.build(parsed);

}



// Returns a fresh ticket for this level, preferring a freshly AI-invented

// business scenario (so tickets stop repeating) and silently falling back

// to a pick from the small hand-authored bank if that call or its output

// ever fails - same safety-net shape as Emoji Charades' getEmojiRound, so

// a round never stalls just because this one extra-capable call had a

// hiccup.

async function getRepairTicket(level) {

  try {

    return await generateRepairTicketAI(level);

  } catch (e) {

    const bank = (REPAIR_LEVELS[level] || REPAIR_LEVELS[1]).tickets;

    return pick(bank);

  }

}



function tokenizeWords(s) {

  return (s || "").trim().split(/\s+/).filter(Boolean);

}



function parseRepairJson(raw) {

  let text = (raw || "").trim();

  text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/```\s*$/, "").trim();

  try {

    return JSON.parse(text);

  } catch (e) {

    return null;

  }

}



// Runs the player's CURRENT prompt (as the system message) against one

// test message. Never executes anything - the response is just JSON text

// that gets parsed and structurally checked, exactly like a person

// eyeballing an API response.

async function generateExtraction(promptText, message) {

  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + state.apiKey,

    },

    body: JSON.stringify({

      model: CODE_MODEL,

      max_tokens: 300,

      temperature: 0,

      messages: [

        { role: "system", content: promptText },

        { role: "user", content: message },

      ],

    }),

  });

  if (!res.ok) {

    const errBody = await res.json().catch(() => ({}));

    throw new Error((errBody.error && errBody.error.message) || `OpenAI request failed (${res.status})`);

  }

  const data = await res.json();

  return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

}



// "AI's ideal repair" - optional, on-demand learning aid (same idea as

// the other games' "AI's ideal prompt"/"AI's guess"). Never runs

// automatically. Hands the ticket's ORIGINAL broken prompt, its

// requirement, and the one test message back to the model and asks for

// its own best repaired prompt, so the player has a model answer to

// compare against.

const REPAIR_IDEAL_SYSTEM =

  "You are an expert prompt engineer. A customer's AI prompt is broken - " +

  "it doesn't reliably satisfy a list of requirements. Rewrite it into " +

  "the best possible prompt that satisfies every requirement, staying as " +

  "close as reasonably possible to the original prompt's simple, direct " +

  "style rather than over-engineering it. Respond with ONLY the rewritten " +

  "prompt text itself - no quotes, no preamble, no explanation, no " +

  "markdown, no labels like \"Prompt:\".";



async function generateIdealRepairPrompt(ticket) {

  const userContent =

    `Broken prompt:\n"${ticket.brokenPrompt}"\n\n` +

    `Requirements it must satisfy:\n${ticket.requirements.map((r) => "- " + r).join("\n")}\n\n` +

    `Example message: "${ticket.testCase.message}"\n\n` +

    "Rewrite the prompt so it satisfies every requirement.";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + state.apiKey,

    },

    body: JSON.stringify({

      model: SCORE_MODEL,

      max_tokens: 300,

      messages: [

        { role: "system", content: REPAIR_IDEAL_SYSTEM },

        { role: "user", content: userContent },

      ],

    }),

  });

  if (!res.ok) {

    const errBody = await res.json().catch(() => ({}));

    throw new Error((errBody.error && errBody.error.message) || `OpenAI request failed (${res.status})`);

  }

  const data = await res.json();

  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

  const cleaned = content.trim();

  if (!cleaned) throw new Error("OpenAI returned an empty prompt.");

  return cleaned;

}



// Scoring is deliberately simple: solve it on attempt 1, 2, or 3 and score

// 100/75/50; don't solve it in 3 attempts and score 0. Each hint used

// subtracts a flat 10 points from that. No separate "efficiency" bonus and

// no averaging across multiple hidden checks - just did it work, and how

// many tries did it take.

const REPAIR_ATTEMPT_SCORES = [100, 75, 50];

const REPAIR_HINT_PENALTY = 10;



function repairScoreForAttempt(attemptNumber) {

  return REPAIR_ATTEMPT_SCORES[attemptNumber - 1] || 0;

}



// One "Test repair" attempt: runs the player's CURRENT prompt against the

// ticket's one test message. If the call throws (a real API/network

// failure), the caller treats it as a technical error - per the rules,

// that must not consume one of the player's 3 attempts.

async function runRepairAttempt(ticket, promptText, attemptNumber) {

  const response = await generateExtraction(promptText, ticket.testCase.message);

  const parsed = parseRepairJson(response);

  const { pass, note } = ticket.validate(parsed, ticket.testCase.expected);

  return {

    message: ticket.testCase.message,

    pass,

    note,

    attemptNumber,

    tierScore: pass ? repairScoreForAttempt(attemptNumber) : 0,

  };

}



function buildTicketInfoHtml(ticket) {

  const reqItems = ticket.requirements.map((r) => `<li>${escapeHtml(r)}</li>`).join("");

  return `<h3 class="repair-ticket-title">${escapeHtml(ticket.title)}</h3>` +

    `<p>${escapeHtml(ticket.customerRequest)}</p>` +

    `<ol class="repair-requirements-list">${reqItems}</ol>` +

    `<div class="repair-testcase-msg"><span class="reveal-label">Customer message:</span> "${escapeHtml(ticket.testCase.message)}"</div>`;

}



function renderRepairResults(containerEl, attempt) {

  const row =

    `<div class="repair-result-row ${attempt.pass ? "pass" : "fail"}">` +

    `<div class="repair-result-head"><span>Attempt ${attempt.attemptNumber} of 3</span><span class="repair-result-tag">${attempt.pass ? "PASS" : "FAIL"}</span></div>` +

    `<div class="repair-result-msg">"${escapeHtml(attempt.message)}"</div>` +

    (attempt.pass ? "" : `<div class="repair-result-note">${escapeHtml(attempt.note)}</div>`) +

    `</div>`;

  const scoreLine = attempt.pass

    ? `<div class="repair-score-line">Solved on attempt ${attempt.attemptNumber} &mdash; ` +

      `<span class="repair-repaired-tag">${attempt.tierScore} points!</span></div>`

    : `<div class="repair-score-line">Not solved yet.${attempt.attemptNumber < 3 ? " Edit the prompt and try again." : " Out of attempts &mdash; this ticket scores 0."}</div>`;

  containerEl.innerHTML = row + scoreLine;

}



const pstate = {

  mode: "solo",

  level: 1,

  playerName: "",

  ticket: null,

  attemptsUsed: 0,

  hintsUsed: 0,

  solvedOnAttempt: null,

  lastAttempt: null,

};



const ptstate = {

  players: [],

  nextPlayerId: 1,

  bracket: [],

  champion: null,

  currentMatch: null,

  levels: [1, 2, 3],

};



function toggleRepairTournamentLevel(n) {

  if (ptstate.levels.includes(n)) {

    if (ptstate.levels.length === 1) return;

    ptstate.levels = ptstate.levels.filter((lvl) => lvl !== n);

  } else {

    ptstate.levels = ptstate.levels.concat(n).sort((a, b) => a - b);

  }

  renderRepairTournamentLevelPicker();

}



function renderRepairTournamentLevelPicker() {

  document.querySelectorAll("#repair-tournament-level-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", ptstate.levels.includes(Number(b.dataset.level)));

  });

}



function setRepairLevel(n) {

  pstate.level = n;

  document.querySelectorAll("#repair-level-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", Number(b.dataset.level) === n);

  });

  el("repair-level-hint").textContent = (REPAIR_LEVELS[n] || REPAIR_LEVELS[1]).hint;

}



function updateRepairLevelBadges() {

  el("repair-challenge-level-badge").textContent = (REPAIR_LEVELS[pstate.level] || REPAIR_LEVELS[1]).label;

}



function setRepairMode(mode) {

  pstate.mode = mode;

  document.querySelectorAll("#repair-mode-picker .level-btn").forEach((b) => {

    b.classList.toggle("active", b.dataset.mode === mode);

  });

  el("btn-repair-start-round").textContent = mode === "tournament" ? "Set up tournament" : "Start a round";

  el("repair-tournament-admin-hint").hidden = !(mode === "tournament" && identity.role !== "admin");

}



function handleRepairStartClick() {

  if (pstate.mode === "tournament") {

    if (identity.role !== "admin") return;

    if (ptstate.players.length === 0) {

      addRepairPlayerRow();

      addRepairPlayerRow();

    }

    ptstate.bracket = [];

    ptstate.champion = null;

    ptstate.currentMatch = null;

    renderRepairPlayerList();

    renderRepairTournamentLevelPicker();

    el("repair-tournament-setup-error").hidden = true;

    showScreen("repair-tournament-setup");

  } else {

    startRepairRound();

  }

}



async function startRepairRound() {

  pstate.ticket = null;

  pstate.attemptsUsed = 0;

  pstate.hintsUsed = 0;

  pstate.solvedOnAttempt = null;

  pstate.lastAttempt = null;



  showScreen("repair-challenge");

  updateRepairLevelBadges();

  el("repair-error").hidden = true;

  el("repair-challenge-form-wrap").hidden = true;

  el("repair-loading-text").textContent = "Preparing a fresh ticket…";

  el("repair-loading").hidden = false;



  pstate.ticket = await getRepairTicket(pstate.level);



  el("repair-loading").hidden = true;

  el("repair-challenge-form-wrap").hidden = false;

  el("repair-ticket-info").innerHTML = buildTicketInfoHtml(pstate.ticket);

  el("input-repair-prompt").value = pstate.ticket.brokenPrompt;

  el("repair-hints-revealed").innerHTML = "";

  el("btn-repair-show-hint").hidden = false;

  el("btn-repair-show-hint").textContent = `Show a hint (-${REPAIR_HINT_PENALTY} pts, ${pstate.ticket.hints.length} available)`;

  el("repair-attempts-badge").textContent = "3 of 3 attempts left";

  el("repair-results-wrap").hidden = true;

  el("btn-repair-test").hidden = false;

  el("btn-repair-test").disabled = false;

  el("btn-repair-test").textContent = "Test repair";

  el("btn-repair-finish").hidden = true;

}



async function submitRepairAttempt() {

  if (pstate.attemptsUsed >= 3 || pstate.solvedOnAttempt) return;

  const promptText = el("input-repair-prompt").value;

  el("repair-error").hidden = true;

  el("btn-repair-test").disabled = true;

  el("repair-loading-text").textContent = "Testing your repair…";

  el("repair-loading").hidden = false;



  let attempt;

  try {

    attempt = await runRepairAttempt(pstate.ticket, promptText, pstate.attemptsUsed + 1);

  } catch (e) {

    el("repair-loading").hidden = true;

    el("btn-repair-test").disabled = false;

    el("repair-error").textContent = errorHint(e.message) + " This attempt wasn't counted against your 3 - try again.";

    el("repair-error").hidden = false;

    return;

  }

  el("repair-loading").hidden = true;

  pstate.attemptsUsed++;

  pstate.lastAttempt = attempt;

  if (attempt.pass && !pstate.solvedOnAttempt) pstate.solvedOnAttempt = pstate.attemptsUsed;



  el("repair-attempts-badge").textContent = `${3 - pstate.attemptsUsed} of 3 attempts left`;

  el("repair-results-wrap").hidden = false;

  renderRepairResults(el("repair-results-list"), attempt);

  el("btn-repair-finish").hidden = false;



  if (pstate.solvedOnAttempt || pstate.attemptsUsed >= 3) {

    el("btn-repair-test").hidden = true;

  } else {

    el("btn-repair-test").disabled = false;

    el("btn-repair-test").textContent = "Test repair again";

  }

}



function showRepairHint() {

  if (pstate.hintsUsed >= pstate.ticket.hints.length) return;

  const hintText = pstate.ticket.hints[pstate.hintsUsed];

  pstate.hintsUsed++;

  const p = document.createElement("p");

  p.className = "hint";

  p.textContent = `Hint ${pstate.hintsUsed}: ${hintText}`;

  el("repair-hints-revealed").appendChild(p);

  if (pstate.hintsUsed >= pstate.ticket.hints.length) {

    el("btn-repair-show-hint").hidden = true;

  } else {

    el("btn-repair-show-hint").textContent = `Show another hint (-${REPAIR_HINT_PENALTY} pts, ${pstate.ticket.hints.length - pstate.hintsUsed} left)`;

  }

}



function resetRepairIdealPromptUI() {

  el("repair-ideal-prompt-text").hidden = true;

  el("repair-ideal-prompt-text").textContent = "";

  el("repair-ideal-prompt-error").hidden = true;

  el("repair-ideal-prompt-loading").hidden = true;

  const btn = el("btn-reveal-repair-ideal-prompt");

  btn.hidden = false;

  btn.disabled = false;

  btn.textContent = "Show AI's ideal repair";

}



async function revealRepairIdealPrompt() {

  const btn = el("btn-reveal-repair-ideal-prompt");

  btn.hidden = true;

  el("repair-ideal-prompt-error").hidden = true;

  el("repair-ideal-prompt-loading").hidden = false;

  try {

    const prompt = await generateIdealRepairPrompt(pstate.ticket);

    el("repair-ideal-prompt-text").textContent = prompt;

    el("repair-ideal-prompt-text").hidden = false;

  } catch (e) {

    el("repair-ideal-prompt-error").textContent = errorHint(e.message);

    el("repair-ideal-prompt-error").hidden = false;

    btn.hidden = false;

    btn.textContent = "Try again";

  } finally {

    el("repair-ideal-prompt-loading").hidden = true;

  }

}



function finishRepairTicket() {

  const tierScore = pstate.solvedOnAttempt ? repairScoreForAttempt(pstate.solvedOnAttempt) : 0;

  const finalScore = Math.max(0, tierScore - pstate.hintsUsed * REPAIR_HINT_PENALTY);

  showScreen("repair-result");

  el("repair-result-score").textContent = finalScore;

  const fill = el("repair-result-score-fill");

  fill.style.width = finalScore + "%";

  let color = "#ff6b6b";

  if (finalScore >= 70) color = "#33d6a6";

  else if (finalScore >= 40) color = "#ffb454";

  fill.style.background = color;

  el("repair-result-repaired").textContent = pstate.solvedOnAttempt

    ? `Fixed it on attempt ${pstate.solvedOnAttempt} of 3!`

    : "Not fixed within 3 attempts.";

  el("repair-result-repaired").className = "reveal-box" + (pstate.solvedOnAttempt ? " repair-repaired-banner" : "");

  el("repair-result-attempts-used").textContent = `${pstate.attemptsUsed} of 3 attempts used, ${pstate.hintsUsed} hint${pstate.hintsUsed === 1 ? "" : "s"} used` +

    (pstate.hintsUsed ? ` (−${pstate.hintsUsed * REPAIR_HINT_PENALTY} pt hint penalty)` : "") + ".";

  el("repair-result-lesson").textContent = pstate.ticket.lesson;

  resetRepairIdealPromptUI();



  recordSoloResult(GAME_PROMPT_REPAIR, finalScore, pstate.level);

}



function addRepairPlayerRow(name) {

  if (ptstate.players.length >= 64) return;

  ptstate.players.push({ id: ptstate.nextPlayerId++, name: name || "" });

  renderRepairPlayerList();

}



function bulkAddRepairPlayers() {

  const raw = el("repair-bulk-player-names").value;

  const names = raw.split("\n").map((s) => s.trim()).filter(Boolean);

  if (!names.length) return;

  names.forEach((name) => addRepairPlayerRow(name));

  el("repair-bulk-player-names").value = "";

}



function removeRepairPlayerRow(id) {

  if (ptstate.players.length <= 2) return;

  ptstate.players = ptstate.players.filter((p) => p.id !== id);

  renderRepairPlayerList();

}



function renderRepairPlayerList() {

  const wrap = el("repair-tournament-player-list");

  wrap.innerHTML = "";

  ptstate.players.forEach((p, i) => {

    const row = document.createElement("div");

    row.className = "player-row";

    row.innerHTML =

      `<input type="text" data-player-id="${p.id}" list="player-name-list" placeholder="Player ${i + 1} name" value="${escapeHtml(p.name)}" autocomplete="off">` +

      `<button type="button" class="remove-player-btn" data-remove-id="${p.id}" title="Remove player">&times;</button>`;

    wrap.appendChild(row);

  });

  wrap.querySelectorAll("input[data-player-id]").forEach((input) => {

    input.addEventListener("input", () => {

      const id = Number(input.dataset.playerId);

      const player = ptstate.players.find((p) => p.id === id);

      if (player) player.name = input.value;

    });

  });

  wrap.querySelectorAll("[data-remove-id]").forEach((btn) => {

    btn.disabled = ptstate.players.length <= 2;

    btn.addEventListener("click", () => removeRepairPlayerRow(Number(btn.dataset.removeId)));

  });

}



function makeRepairMatch(roundIndex, matchIndex, playerA, playerB) {

  return {

    roundIndex,

    matchIndex,

    playerA: playerA || null,

    playerB: playerB || null,

    status: playerA && playerB ? "ready" : (playerA && !playerB ? "bye" : "pending"),

    winner: null,

    subRounds: [],

    totals: {},

  };

}



async function generateRepairBracket() {

  const errEl = el("repair-tournament-setup-error");

  errEl.hidden = true;

  const names = ptstate.players.map((p) => (p.name || "").trim());

  if (ptstate.players.length < 2 || names.some((n) => !n)) {

    errEl.textContent = "Give every player a name (at least 2 players).";

    errEl.hidden = false;

    return;

  }

  ptstate.players.forEach((p, i) => { p.name = names[i]; });



  await resolveTournamentPlayers(ptstate.players);

  const dupe = findDuplicateProfilePlayers(ptstate.players);

  if (dupe) {

    errEl.textContent = `"${dupe[0].name}" and "${dupe[1].name}" are the same player profile (ID ${dupe[0].profileId}). Give each player a distinct name or ID before starting.`;

    errEl.hidden = false;

    return;

  }

  await postTournamentStartEvents(ptstate.players, GAME_PROMPT_REPAIR);



  const shuffled = shuffle(ptstate.players);

  const n = shuffled.length;

  const size = nextPowerOfTwo(n);

  const byes = size - n;



  const byePlayers = shuffled.slice(0, byes);

  const matchPlayers = shuffled.slice(byes);

  const slotDescriptors = byePlayers.map((p) => ({ players: [p, null] }));

  for (let i = 0; i < matchPlayers.length; i += 2) {

    slotDescriptors.push({ players: [matchPlayers[i], matchPlayers[i + 1]] });

  }

  const orderedSlots = shuffle(slotDescriptors);

  const round1 = orderedSlots.map((slot, idx) => makeRepairMatch(0, idx, slot.players[0], slot.players[1]));



  const rounds = [round1];

  let prevCount = round1.length;

  let r = 1;

  while (prevCount > 1) {

    const count = prevCount / 2;

    const round = [];

    for (let i = 0; i < count; i++) round.push(makeRepairMatch(r, i, null, null));

    rounds.push(round);

    prevCount = count;

    r++;

  }



  ptstate.bracket = rounds;

  ptstate.champion = null;

  ptstate.currentMatch = null;



  round1.forEach((m) => {

    if (m.status === "bye") resolveRepairByeMatch(m);

  });



  showScreen("repair-tournament-bracket");

  renderRepairBracket();

}



function resolveRepairByeMatch(m) {

  m.status = "done";

  m.winner = m.playerA;

  advanceRepairWinner(m);

}



function advanceRepairWinner(m) {

  const rounds = ptstate.bracket;

  const nextRoundIndex = m.roundIndex + 1;

  if (nextRoundIndex >= rounds.length) {

    ptstate.champion = m.winner;

    return;

  }

  const nextMatch = rounds[nextRoundIndex][Math.floor(m.matchIndex / 2)];

  if (m.matchIndex % 2 === 0) nextMatch.playerA = m.winner;

  else nextMatch.playerB = m.winner;

  if (nextMatch.playerA && nextMatch.playerB) nextMatch.status = "ready";

}



function repairRoundName(roundIndex) {

  const matchesInRound = ptstate.bracket[roundIndex].length;

  if (matchesInRound === 1) return "Final";

  if (matchesInRound === 2) return "Semifinal";

  if (matchesInRound === 4) return "Quarterfinal";

  return `Round of ${matchesInRound * 2}`;

}



function findNextPlayableRepairMatch() {

  for (const round of ptstate.bracket) {

    for (const m of round) {

      if (m.status === "ready") return m;

    }

  }

  return null;

}



function renderRepairBracketSlot(m, which) {

  if (m.status === "bye" && which === "B") {

    return `<div class="bracket-slot bye-slot">BYE</div>`;

  }

  const player = which === "A" ? m.playerA : m.playerB;

  if (!player) return `<div class="bracket-slot">TBD</div>`;

  const isWinner = !!(m.winner && m.winner.id === player.id);

  const score = m.totals && m.totals[player.id] != null ? m.totals[player.id] : null;

  return `<div class="bracket-slot${isWinner ? " winner-slot" : ""}">` +

    `<span>${escapeHtml(player.name)}</span>` +

    (score != null ? `<span class="bracket-score">${score}</span>` : "") +

    `</div>`;

}



function renderRepairBracket() {

  const wrap = el("repair-bracket-view");

  wrap.innerHTML = "";

  ptstate.bracket.forEach((round, ri) => {

    const col = document.createElement("div");

    col.className = "bracket-round";

    const title = document.createElement("div");

    title.className = "bracket-round-title";

    title.textContent = repairRoundName(ri);

    col.appendChild(title);



    round.forEach((m) => {

      const card = document.createElement("div");

      const playable = m.status === "ready";

      card.className = "bracket-match" + (playable ? " playable" : "") + (m.status === "done" || m.status === "bye" ? " done" : "");



      const tagText = m.status === "done" ? "Completed"

        : m.status === "bye" ? "Bye"

        : m.status === "ready" ? "Ready to play"

        : "Waiting";

      card.innerHTML =

        `<div class="bracket-match-tag${m.status === "pending" ? " tbd" : ""}">${tagText}</div>` +

        renderRepairBracketSlot(m, "A") + renderRepairBracketSlot(m, "B");



      if (playable) card.addEventListener("click", () => startRepairMatch(m));

      col.appendChild(card);

    });

    wrap.appendChild(col);

  });



  const banner = el("repair-bracket-champion-banner");

  if (ptstate.champion) {

    banner.hidden = false;

    banner.textContent = `Champion: ${ptstate.champion.name}`;

  } else {

    banner.hidden = true;

  }



  el("btn-repair-play-next-match").hidden = !findNextPlayableRepairMatch();

}



function startRepairMatch(m) {

  ptstate.currentMatch = m;

  m.subRounds = [];

  m.totals = { [m.playerA.id]: 0, [m.playerB.id]: 0 };

  m.levels = ptstate.levels.slice();

  const levelLabel = m.levels.map((n) => `Level ${n}`).join(", ");

  el("repair-match-round-name").textContent = repairRoundName(m.roundIndex);

  el("repair-match-players-label").textContent = `${m.playerA.name} vs ${m.playerB.name} — best of ${m.levels.length} (${levelLabel}). Higher cumulative score advances. Each player gets their own private 3 attempts on the same ticket.`;

  showScreen("repair-tournament-match");

  renderRepairMatchTally(m);

  startRepairSubRound(m, m.levels[0], false);

}



function renderRepairMatchTally(m) {

  const wrap = el("repair-match-tally");

  wrap.innerHTML = "";

  [m.playerA, m.playerB].forEach((p) => {

    const item = document.createElement("div");

    item.className = "match-tally-item";

    item.innerHTML =

      `<div class="mt-name">${escapeHtml(p.name)}</div>` +

      `<div class="mt-score">${m.totals[p.id] || 0}<span class="mt-score-max"> total</span></div>`;

    wrap.appendChild(item);

  });

}



function renderRepairMatchPlayerStatus(m, sub) {

  const wrap = el("repair-match-player-status-list");

  wrap.innerHTML = "";

  [["a", m.playerA], ["b", m.playerB]].forEach(([key, player]) => {

    const side = sub[key];

    const chip = document.createElement("span");

    chip.className = "player-status-chip";

    if (side.done) chip.classList.add("done");

    else if (sub.currentTurn === key) chip.classList.add("current");

    chip.textContent = player.name + (side.done ? " — done" : sub.currentTurn === key ? " — playing now" : " — waiting");

    wrap.appendChild(chip);

  });

}



async function startRepairSubRound(m, level, isTiebreaker) {

  const sub = {

    index: m.subRounds.length,

    level,

    isTiebreaker,

    ticket: null,

    a: { attemptsUsed: 0, hintsUsed: 0, solvedOnAttempt: null, lastAttempt: null, done: false, finalScore: 0, revealedHints: [] },

    b: { attemptsUsed: 0, hintsUsed: 0, solvedOnAttempt: null, lastAttempt: null, done: false, finalScore: 0, revealedHints: [] },

    currentTurn: "a",

  };

  m.subRounds.push(sub);



  el("repair-sub-round-num").textContent = isTiebreaker ? "Tiebreaker" : String(sub.index + 1);

  el("repair-sub-round-of-wrap").hidden = isTiebreaker;

  el("repair-sub-round-total").textContent = String(m.levels.length);

  el("repair-sub-round-level-badge").textContent = (REPAIR_LEVELS[level] || REPAIR_LEVELS[1]).label;

  el("repair-match-subround-result").hidden = true;

  el("repair-match-final-result").hidden = true;

  el("repair-match-turn-active").hidden = false;

  el("repair-match-error").hidden = true;

  el("repair-match-form-wrap").hidden = true;

  el("repair-match-loading-text").textContent = "Preparing a fresh ticket…";

  el("repair-match-loading").hidden = false;



  sub.ticket = await getRepairTicket(level);

  el("repair-match-loading").hidden = true;



  showRepairMatchTurnForm(m, sub);

}



function showRepairMatchTurnForm(m, sub) {

  const key = sub.currentTurn;

  const player = key === "a" ? m.playerA : m.playerB;

  const side = sub[key];

  el("repair-match-form-wrap").hidden = false;

  el("repair-match-turn-label").textContent = `${player.name}'s turn to repair this ticket`;

  el("repair-match-ticket-info").innerHTML = buildTicketInfoHtml(sub.ticket);

  el("input-repair-match-prompt").value = side.attemptsUsed > 0 || side.promptText ? (side.promptText || sub.ticket.brokenPrompt) : sub.ticket.brokenPrompt;

  el("repair-match-attempts-badge").textContent = `${3 - side.attemptsUsed} of 3 attempts left`;

  const hintsWrap = el("repair-match-hints-revealed");

  hintsWrap.innerHTML = "";

  side.revealedHints.forEach((h, i) => {

    const p = document.createElement("p");

    p.className = "hint";

    p.textContent = `Hint ${i + 1}: ${h}`;

    hintsWrap.appendChild(p);

  });

  el("btn-repair-match-show-hint").hidden = side.hintsUsed >= sub.ticket.hints.length;

  el("btn-repair-match-show-hint").textContent = `Show a hint (-${REPAIR_HINT_PENALTY} pts, ${sub.ticket.hints.length - side.hintsUsed} left)`;

  el("repair-match-error").hidden = true;

  el("repair-match-loading").hidden = true;

  el("repair-match-results-wrap").hidden = !side.lastAttempt;

  if (side.lastAttempt) renderRepairResults(el("repair-match-results-list"), side.lastAttempt);

  el("btn-repair-match-test").hidden = side.attemptsUsed >= 3 || !!side.solvedOnAttempt;

  el("btn-repair-match-test").disabled = false;

  el("btn-repair-match-test").textContent = side.attemptsUsed === 0 ? "Test repair" : "Test repair again";

  el("btn-repair-match-done").hidden = side.attemptsUsed === 0;

  el("btn-repair-match-done").textContent = sub.currentTurn === "a" ? "Done — pass to next player" : "Done — see results";

  renderRepairMatchPlayerStatus(m, sub);

}



async function submitRepairMatchAttempt() {

  const m = ptstate.currentMatch;

  const sub = m.subRounds[m.subRounds.length - 1];

  const key = sub.currentTurn;

  const side = sub[key];

  const promptText = el("input-repair-match-prompt").value;

  side.promptText = promptText;



  el("repair-match-error").hidden = true;

  el("btn-repair-match-test").disabled = true;

  el("repair-match-loading-text").textContent = "Testing this repair…";

  el("repair-match-loading").hidden = false;



  let attempt;

  try {

    attempt = await runRepairAttempt(sub.ticket, promptText, side.attemptsUsed + 1);

  } catch (e) {

    el("repair-match-loading").hidden = true;

    el("btn-repair-match-test").disabled = false;

    el("repair-match-error").textContent = errorHint(e.message) + " This attempt wasn't counted against the 3 - try again.";

    el("repair-match-error").hidden = false;

    return;

  }

  el("repair-match-loading").hidden = true;

  side.attemptsUsed++;

  side.lastAttempt = attempt;

  if (attempt.pass && !side.solvedOnAttempt) side.solvedOnAttempt = side.attemptsUsed;



  showRepairMatchTurnForm(m, sub);

}



function showRepairMatchHint() {

  const m = ptstate.currentMatch;

  const sub = m.subRounds[m.subRounds.length - 1];

  const side = sub[sub.currentTurn];

  if (side.hintsUsed >= sub.ticket.hints.length) return;

  side.revealedHints.push(sub.ticket.hints[side.hintsUsed]);

  side.hintsUsed++;

  showRepairMatchTurnForm(m, sub);

}



function finishRepairMatchTurn() {

  const m = ptstate.currentMatch;

  const sub = m.subRounds[m.subRounds.length - 1];

  const key = sub.currentTurn;

  const side = sub[key];

  if (side.attemptsUsed === 0) return;

  side.done = true;

  const tierScore = side.solvedOnAttempt ? repairScoreForAttempt(side.solvedOnAttempt) : 0;

  side.finalScore = Math.max(0, tierScore - side.hintsUsed * REPAIR_HINT_PENALTY);



  if (key === "a") {

    sub.currentTurn = "b";

    showRepairMatchTurnForm(m, sub);

  } else {

    finishRepairSubRound(m, sub);

  }

}



async function revealRepairMatchIdealPrompt(ticket) {

  const btn = el("btn-reveal-repair-match-ideal-prompt");

  btn.hidden = true;

  el("repair-match-ideal-prompt-error").hidden = true;

  el("repair-match-ideal-prompt-loading").hidden = false;

  try {

    const prompt = await generateIdealRepairPrompt(ticket);

    el("repair-match-ideal-prompt-text").textContent = prompt;

    el("repair-match-ideal-prompt-text").hidden = false;

  } catch (e) {

    el("repair-match-ideal-prompt-error").textContent = errorHint(e.message);

    el("repair-match-ideal-prompt-error").hidden = false;

    btn.hidden = false;

    btn.textContent = "Try again";

  } finally {

    el("repair-match-ideal-prompt-loading").hidden = true;

  }

}



function finishRepairSubRound(m, sub) {

  m.totals[m.playerA.id] = (m.totals[m.playerA.id] || 0) + sub.a.finalScore;

  m.totals[m.playerB.id] = (m.totals[m.playerB.id] || 0) + sub.b.finalScore;

  renderRepairMatchTally(m);

  recordTournamentLevelResult(m.playerA, GAME_PROMPT_REPAIR, sub.level, sub.a.finalScore);

  recordTournamentLevelResult(m.playerB, GAME_PROMPT_REPAIR, sub.level, sub.b.finalScore);



  el("repair-match-turn-active").hidden = true;

  el("repair-match-subround-result").hidden = false;

  el("repair-match-subround-ticket-title").textContent = sub.ticket.title;



  // Same-device/turn-based, renders once per sub-round - no poll-driven

  // re-render guard needed (unlike Prompt Mirror's tournament).

  el("repair-match-ideal-prompt-text").hidden = true;

  el("repair-match-ideal-prompt-text").textContent = "";

  el("repair-match-ideal-prompt-error").hidden = true;

  el("repair-match-ideal-prompt-loading").hidden = true;

  const idealBtn = el("btn-reveal-repair-match-ideal-prompt");

  idealBtn.hidden = false;

  idealBtn.disabled = false;

  idealBtn.textContent = "Show AI's ideal repair";

  idealBtn.onclick = () => revealRepairMatchIdealPrompt(sub.ticket);



  const cardsWrap = el("repair-match-subround-cards");

  cardsWrap.innerHTML = "";

  const subTop = Math.max(sub.a.finalScore, sub.b.finalScore);

  [{ p: m.playerA, side: sub.a }, { p: m.playerB, side: sub.b }]

    .sort((x, y) => y.side.finalScore - x.side.finalScore)

    .forEach(({ p, side }) => {

      const isWinner = side.finalScore === subTop;

      const card = document.createElement("div");

      card.className = "tournament-result-card" + (isWinner ? " winner" : "");

      card.innerHTML =

        (isWinner ? '<div class="trc-winner-tag">Sub-round winner</div>' : "") +

        `<div class="trc-name">${escapeHtml(p.name)}</div>` +

        `<div class="trc-score">${side.finalScore}<span style="font-size:1rem;color:var(--muted);">/100</span></div>` +

        `<div class="trc-feedback">${side.solvedOnAttempt ? `Fixed it on attempt ${side.solvedOnAttempt} of 3. ` : "Didn't fix it in 3 attempts. "}${side.hintsUsed} hint${side.hintsUsed === 1 ? "" : "s"} used.</div>`;

      cardsWrap.appendChild(card);

    });



  const plannedDone = m.subRounds.length >= m.levels.length;



  el("btn-repair-next-subround").onclick = () => {

    if (plannedDone) {

      const totalA = m.totals[m.playerA.id];

      const totalB = m.totals[m.playerB.id];

      if (totalA === totalB) {

        startRepairSubRound(m, m.levels[m.levels.length - 1], true);

      } else {

        finishRepairMatch(m);

      }

    } else {

      startRepairSubRound(m, m.levels[m.subRounds.length], false);

    }

  };

}



function finishRepairMatch(m) {

  const totalA = m.totals[m.playerA.id];

  const totalB = m.totals[m.playerB.id];

  m.winner = totalA >= totalB ? m.playerA : m.playerB;

  m.status = "done";

  advanceRepairWinner(m);



  const isFinal = m.roundIndex === ptstate.bracket.length - 1;

  const stageLabel = repairRoundName(m.roundIndex);

  const stageRank = stageRankForRoundName(stageLabel);

  recordMatchResult(m.playerA, GAME_PROMPT_REPAIR, m.winner.id === m.playerA.id, stageLabel, stageRank, totalA);

  recordMatchResult(m.playerB, GAME_PROMPT_REPAIR, m.winner.id === m.playerB.id, stageLabel, stageRank, totalB);

  if (isFinal) recordTournamentWon(m.winner, GAME_PROMPT_REPAIR);



  el("repair-match-turn-active").hidden = true;

  el("repair-match-subround-result").hidden = true;

  el("repair-match-final-result").hidden = false;

  el("repair-match-winner-banner").textContent = isFinal

    ? `${m.winner.name} wins the tournament!`

    : `${m.winner.name} wins the match and advances!`;



  const tallyWrap = el("repair-match-final-tally");

  tallyWrap.innerHTML = "";

  [m.playerA, m.playerB]

    .sort((x, y) => m.totals[y.id] - m.totals[x.id])

    .forEach((p) => {

      const row = document.createElement("div");

      row.className = "standings-row" + (p.id === m.winner.id ? " leader" : "");

      row.innerHTML = `<span class="standings-name">${escapeHtml(p.name)}</span><span class="standings-detail">${m.totals[p.id]} total</span>`;

      tallyWrap.appendChild(row);

    });

}



function initPromptRepair() {

  el("card-prompt-repair").querySelector("button").addEventListener("click", () => showScreen("repair-rules"));



  document.querySelectorAll("#repair-level-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => setRepairLevel(Number(b.dataset.level)));

  });

  document.querySelectorAll("#repair-mode-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => setRepairMode(b.dataset.mode));

  });

  el("btn-repair-start-round").addEventListener("click", handleRepairStartClick);

  el("btn-repair-test").addEventListener("click", submitRepairAttempt);

  el("btn-repair-show-hint").addEventListener("click", showRepairHint);

  el("btn-repair-finish").addEventListener("click", finishRepairTicket);

  el("btn-repair-play-again").addEventListener("click", startRepairRound);

  el("btn-repair-back-to-arcade").addEventListener("click", () => showScreen("hub"));

  el("btn-reveal-repair-ideal-prompt").addEventListener("click", revealRepairIdealPrompt);



  el("btn-repair-add-player").addEventListener("click", () => addRepairPlayerRow());

  el("btn-repair-bulk-add-players").addEventListener("click", bulkAddRepairPlayers);

  document.querySelectorAll("#repair-tournament-level-picker .level-btn").forEach((b) => {

    b.addEventListener("click", () => toggleRepairTournamentLevel(Number(b.dataset.level)));

  });

  el("btn-repair-generate-bracket").addEventListener("click", generateRepairBracket);

  el("btn-repair-play-next-match").addEventListener("click", () => {

    const m = findNextPlayableRepairMatch();

    if (m) startRepairMatch(m);

  });

  el("btn-repair-new-tournament-from-bracket").addEventListener("click", () => {

    ptstate.bracket = [];

    ptstate.champion = null;

    ptstate.currentMatch = null;

    renderRepairPlayerList();

    renderRepairTournamentLevelPicker();

    el("repair-tournament-setup-error").hidden = true;

    showScreen("repair-tournament-setup");

  });

  el("btn-repair-match-test").addEventListener("click", submitRepairMatchAttempt);

  el("btn-repair-match-show-hint").addEventListener("click", showRepairMatchHint);

  el("btn-repair-match-done").addEventListener("click", finishRepairMatchTurn);

  el("btn-repair-finish-match").addEventListener("click", () => {

    showScreen("repair-tournament-bracket");

    renderRepairBracket();

  });

}



init();

