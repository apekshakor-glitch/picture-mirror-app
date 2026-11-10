/**
 * DaRI AI Mobile & Desktop Standalone Adapter
 * 
 * Provides transparent offline & local storage emulation for:
 *   - /api/key
 *   - /api/players
 *   - /api/tournaments
 * 
 * Allows the app to run 100% standalone on Android (Capacitor/APK), iOS, and Desktop (Electron)
 * without requiring an active Python server, while seamlessly supporting a LAN server connection
 * when available.
 */

(function () {
  const STORAGE_KEY_API_KEY = "dariai_openai_key";
  const STORAGE_KEY_PLAYERS = "dariai_players_data";
  const STORAGE_KEY_TOURNAMENTS = "dariai_tournaments_data";
  const STORAGE_KEY_SERVER_URL = "dariai_server_url";
  const STORAGE_KEY_GOOGLE_CLIENT_ID = "dariai_google_client_id";

  const localVerificationCodes = new Map(); // email -> { code, expires }

  const defaultPlayersData = {
    statsSchemaVersion: 2,
    players: {
      "P1001": {
        id: "P1001",
        name: "DaRI Player",
        role: "participant",
        createdAt: Date.now() / 1000,
        games: {}
      }
    }
  };

  function getLocalPlayers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PLAYERS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(defaultPlayersData));
        return JSON.parse(JSON.stringify(defaultPlayersData));
      }
      return JSON.parse(raw);
    } catch (e) {
      return JSON.parse(JSON.stringify(defaultPlayersData));
    }
  }

  function saveLocalPlayers(data) {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save local players", e);
    }
  }

  function getLocalTournaments() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TOURNAMENTS);
      if (!raw) return { tournaments: {} };
      return JSON.parse(raw);
    } catch (e) {
      return { tournaments: {} };
    }
  }

  function saveLocalTournaments(data) {
    try {
      localStorage.setItem(STORAGE_KEY_TOURNAMENTS, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save local tournaments", e);
    }
  }

  function generatePlayerId(existingIds) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let attempts = 0; attempts < 100; attempts++) {
      let id = "";
      for (let i = 0; i < 5; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
      }
      if (!existingIds.includes(id)) return id;
    }
    return "P" + Math.floor(1000 + Math.random() * 9000);
  }

  // Intercept window.fetch for /api/* calls when running standalone or when server is unavailable
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (resource, init) {
    let url = typeof resource === "string" ? resource : (resource && resource.url) || "";

    // If it's not an internal API call or external OpenAI call, pass straight through
    if (!url.startsWith("/api/")) {
      return originalFetch(resource, init);
    }

    const customServer = localStorage.getItem(STORAGE_KEY_SERVER_URL);
    if (customServer && customServer.startsWith("http")) {
      try {
        const fullUrl = customServer.replace(/\/+$/, "") + url;
        const resp = await originalFetch(fullUrl, init);
        if (resp.ok || resp.status < 500) {
          return resp;
        }
      } catch (e) {
        console.warn("Custom server unreachable, falling back to local storage adapter:", e);
      }
    }

    // Try live server first if not file:// or capacitor://
    const isLocalAppProtocol = window.location.protocol === "file:" || 
                               window.location.protocol === "capacitor:" ||
                               window.location.protocol === "ionic:";

    if (!isLocalAppProtocol) {
      try {
        const testResp = await originalFetch(resource, init);
        return testResp;
      } catch (err) {
        // Server unreachable -> fallback to mock
      }
    }

    // --- Standalone In-App Mock API Handler ---
    const method = (init && init.method ? init.method.toUpperCase() : "GET");
    let body = {};
    if (init && init.body) {
      try {
        body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
      } catch (e) {
        body = {};
      }
    }

    const createJsonResponse = (data, status = 200) => {
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const initResp = {
        status: status,
        statusText: status === 200 ? "OK" : "Error",
        headers: { "Content-Type": "application/json" }
      };
      return new Response(blob, initResp);
    };

    // 1. /api/key
    if (url === "/api/key") {
      if (method === "GET") {
        const key = localStorage.getItem(STORAGE_KEY_API_KEY) || "";
        return createJsonResponse({ has_key: !!key, api_key: key });
      }
      if (method === "POST") {
        const key = (body.api_key || "").trim();
        if (!key) return createJsonResponse({ ok: false, error: "Please paste a valid API key." }, 400);
        localStorage.setItem(STORAGE_KEY_API_KEY, key);
        return createJsonResponse({ ok: true });
      }
    }

    if (url === "/api/key/clear") {
      localStorage.removeItem(STORAGE_KEY_API_KEY);
      return createJsonResponse({ ok: true });
    }

    // --- Authentication & Google OAuth Handlers (Offline / Standalone Adapter) ---
    if (url === "/api/auth/google/config") {
      if (method === "GET") {
        return createJsonResponse({ ok: true, clientId: localStorage.getItem(STORAGE_KEY_GOOGLE_CLIENT_ID) || "" });
      }
      if (method === "POST") {
        const cid = (body.clientId || "").trim();
        localStorage.setItem(STORAGE_KEY_GOOGLE_CLIENT_ID, cid);
        return createJsonResponse({ ok: true, clientId: cid });
      }
    }

    if (url === "/api/auth/check-email" && method === "POST") {
      const email = (body.email || "").trim().toLowerCase();
      if (!email) return createJsonResponse({ ok: false, error: "Email is required" }, 400);
      const data = getLocalPlayers();
      const player = Object.values(data.players || {}).find(p => (p.email || "").toLowerCase() === email);
      return createJsonResponse({ ok: true, exists: !!player, player: player || null });
    }

    if (url === "/api/auth/send-verification" && method === "POST") {
      const email = (body.email || "").trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return createJsonResponse({ ok: false, error: "Please enter a valid email address." }, 400);
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      localVerificationCodes.set(email, { code, expires: Date.now() + 10 * 60 * 1000 });
      return createJsonResponse({
        ok: true,
        code: code,
        message: `Verification code generated for ${email}`
      });
    }

    if (url === "/api/auth/verify-code" && method === "POST") {
      const email = (body.email || "").trim().toLowerCase();
      const code = (body.code || "").trim();
      const record = localVerificationCodes.get(email);
      if (!record) {
        return createJsonResponse({ ok: false, error: "No verification code found. Please request a new code." }, 400);
      }
      if (Date.now() > record.expires) {
        localVerificationCodes.delete(email);
        return createJsonResponse({ ok: false, error: "Verification code has expired. Please request a new code." }, 400);
      }
      if (record.code !== code) {
        return createJsonResponse({ ok: false, error: "Invalid verification code. Please check and try again." }, 400);
      }
      return createJsonResponse({ ok: true, verified: true });
    }

    if (url === "/api/auth/signup" && method === "POST") {
      const name = (body.name || "").trim();
      const email = (body.email || "").trim().toLowerCase();
      const role = (body.role || "participant").trim().toLowerCase();
      const googleId = body.googleId || null;
      const avatar = body.avatar || null;

      if (!name) return createJsonResponse({ ok: false, error: "Name is required." }, 400);
      if (!email) return createJsonResponse({ ok: false, error: "Email is required." }, 400);

      const data = getLocalPlayers();
      const existing = Object.values(data.players || {}).find(p => 
        (p.email && p.email.toLowerCase() === email) || (googleId && p.googleId === googleId)
      );
      if (existing) {
        return createJsonResponse({ ok: false, error: "An account with this email already exists. Please log in.", player: existing, exists: true }, 409);
      }

      const newId = generatePlayerId(Object.keys(data.players));
      const player = {
        id: newId,
        name,
        email,
        role: role === "admin" ? "admin" : "participant",
        googleId,
        avatar,
        emailVerified: true,
        authProvider: googleId ? "google" : "email",
        createdAt: Date.now() / 1000,
        games: {}
      };
      data.players[newId] = player;
      saveLocalPlayers(data);
      return createJsonResponse({ ok: true, player });
    }

    if (url === "/api/auth/login" && method === "POST") {
      const email = (body.email || "").trim().toLowerCase();
      const pid = (body.id || "").trim().toUpperCase();
      const data = getLocalPlayers();
      let player = null;
      if (email) {
        player = Object.values(data.players || {}).find(p => (p.email || "").toLowerCase() === email);
      }
      if (!player && pid) {
        player = data.players[pid] || Object.values(data.players || {}).find(p => (p.name || "").toLowerCase() === pid.toLowerCase());
      }
      if (!player) {
        return createJsonResponse({ ok: false, notFound: true, error: "No account found. Please sign up first." }, 404);
      }
      return createJsonResponse({ ok: true, player });
    }

    if (url === "/api/auth/google" && method === "POST") {
      const { email, name, picture, sub } = body;
      const cleanEmail = (email || "").trim().toLowerCase();
      if (!cleanEmail) {
        return createJsonResponse({ ok: false, error: "Google account email missing." }, 400);
      }
      const data = getLocalPlayers();
      let player = Object.values(data.players || {}).find(p => 
        (p.googleId && p.googleId === sub) || (p.email && p.email.toLowerCase() === cleanEmail)
      );

      if (player) {
        if (!player.googleId && sub) player.googleId = sub;
        if (picture && !player.avatar) player.avatar = picture;
        saveLocalPlayers(data);
        return createJsonResponse({ ok: true, isNew: false, player });
      }

      return createJsonResponse({
        ok: true,
        isNew: true,
        googleUser: {
          name: name || cleanEmail.split("@")[0],
          email: cleanEmail,
          googleId: sub || "G-" + Date.now(),
          avatar: picture || ""
        }
      });
    }

    // 2. /api/players
    if (url === "/api/players" && method === "GET") {
      const data = getLocalPlayers();
      const list = Object.values(data.players || {});
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      return createJsonResponse({ players: list });
    }

    if (url.startsWith("/api/players/") && method === "GET") {
      const pid = url.replace("/api/players/", "").split("?")[0].trim().toUpperCase();
      const data = getLocalPlayers();
      const p = data.players[pid];
      if (p) return createJsonResponse({ ok: true, player: p });
      return createJsonResponse({ ok: false, error: "Unknown player ID." }, 404);
    }

    if (url === "/api/players/resolve" && method === "POST") {
      const name = (body.name || "").trim();
      if (!name) return createJsonResponse({ ok: false, error: "Name is required." }, 400);
      const data = getLocalPlayers();
      let found = Object.values(data.players).find(p => p.name.toLowerCase() === name.toLowerCase());
      if (!found) {
        const newId = generatePlayerId(Object.keys(data.players));
        found = {
          id: newId,
          name: name,
          role: "participant",
          createdAt: Date.now() / 1000,
          games: {}
        };
        data.players[newId] = found;
        saveLocalPlayers(data);
      }
      return createJsonResponse({ ok: true, player: found });
    }

    if (url === "/api/players/create" && method === "POST") {
      const name = (body.name || "").trim();
      const role = (body.role || "participant").trim().toLowerCase();
      if (!name) return createJsonResponse({ ok: false, error: "Name is required." }, 400);
      const data = getLocalPlayers();
      const newId = generatePlayerId(Object.keys(data.players));
      const newPlayer = {
        id: newId,
        name: name,
        role: role === "admin" ? "admin" : "participant",
        createdAt: Date.now() / 1000,
        games: {}
      };
      data.players[newId] = newPlayer;
      saveLocalPlayers(data);
      return createJsonResponse({ ok: true, player: newPlayer });
    }

    if (url === "/api/players/login" && method === "POST") {
      const pid = (body.id || "").trim().toUpperCase();
      const data = getLocalPlayers();
      const p = data.players[pid];
      if (!p) return createJsonResponse({ ok: false, error: "Unknown player ID." }, 404);
      return createJsonResponse({ ok: true, player: p });
    }

    if (url === "/api/players/logout" && method === "POST") {
      return createJsonResponse({ ok: true });
    }

    if (url === "/api/players/delete" && method === "POST") {
      const pid = (body.playerId || "").trim().toUpperCase();
      const data = getLocalPlayers();
      delete data.players[pid];
      saveLocalPlayers(data);
      return createJsonResponse({ ok: true });
    }

    if (url === "/api/players/role" && method === "POST") {
      const pid = (body.playerId || "").trim().toUpperCase();
      const role = (body.role || "participant").trim().toLowerCase();
      const data = getLocalPlayers();
      if (data.players[pid]) {
        data.players[pid].role = role;
        saveLocalPlayers(data);
        return createJsonResponse({ ok: true, player: data.players[pid] });
      }
      return createJsonResponse({ ok: false, error: "Player not found" }, 404);
    }

    if (url === "/api/players/event" && method === "POST") {
      const pid = (body.playerId || "").trim().toUpperCase();
      const game = body.game || "prompt-mirror";
      const etype = body.type;
      const data = getLocalPlayers();
      const player = data.players[pid];
      if (player) {
        if (!player.games[game]) {
          player.games[game] = { solo: { roundsPlayed: 0, highScores: {} }, tournaments: { matchesPlayed: 0, matchesWon: 0 } };
        }
        const g = player.games[game];
        if (etype === "solo-round-finished") {
          g.solo.roundsPlayed = (g.solo.roundsPlayed || 0) + 1;
          const score = Math.round(Number(body.score) || 0);
          const lvl = String(body.level || 1);
          g.solo.highScores[lvl] = Math.max(g.solo.highScores[lvl] || 0, score);
        }
        saveLocalPlayers(data);
        return createJsonResponse({ ok: true, player: player });
      }
      return createJsonResponse({ ok: false, error: "Player not found" }, 404);
    }

    // 3. /api/tournaments
    if (url.startsWith("/api/tournaments")) {
      const tdata = getLocalTournaments();
      if (url === "/api/tournaments" && method === "GET") {
        const list = Object.values(tdata.tournaments || []);
        return createJsonResponse({ tournaments: list });
      }
      if (url === "/api/tournaments/create" && method === "POST") {
        const tid = "T" + Math.floor(1000 + Math.random() * 9000);
        const newT = {
          id: tid,
          name: body.name || "Local Tournament",
          game: body.game || "prompt-mirror",
          createdAt: Date.now() / 1000,
          status: "ready",
          bracket: body.bracket || [],
          players: body.players || {},
          levels: body.levels || [1, 2]
        };
        tdata.tournaments[tid] = newT;
        saveLocalTournaments(tdata);
        return createJsonResponse({ ok: true, tournament: newT });
      }
      // tournament detail
      const matchT = url.match(/\/api\/tournaments\/([A-Z0-9]+)/);
      if (matchT) {
        const tid = matchT[1];
        const t = tdata.tournaments[tid];
        if (t) return createJsonResponse({ ok: true, tournament: t, levels: t.levels || [1], game: t.game });
      }
    }

    return createJsonResponse({ ok: false, error: "Endpoint not found in standalone mode" }, 404);
  };

  // Global DaRI Mobile helper API
  window.DaRIMobile = {
    isNative: !!window.Capacitor || navigator.userAgent.includes("wv") || navigator.userAgent.includes("Android"),
    vibrate: function (duration = 15) {
      if (navigator.vibrate) {
        try { navigator.vibrate(duration); } catch (e) {}
      }
    },
    setServerUrl: function (url) {
      if (!url) localStorage.removeItem(STORAGE_KEY_SERVER_URL);
      else localStorage.setItem(STORAGE_KEY_SERVER_URL, url.trim());
    },
    getServerUrl: function () {
      return localStorage.getItem(STORAGE_KEY_SERVER_URL) || "";
    }
  };

  // Mobile Back Button Navigation Handler for Android
  document.addEventListener("backbutton", function (e) {
    e.preventDefault();
    const activeScreen = document.querySelector(".screen.active");
    if (!activeScreen) return;
    const currentId = activeScreen.id;
    if (currentId === "screen-wings") {
      // Exit or minimize app
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.exitApp();
      }
    } else {
      const backBtn = activeScreen.querySelector(".back-link, [data-back]");
      if (backBtn) {
        backBtn.click();
      } else {
        if (typeof showScreen === "function") showScreen("wings");
      }
    }
  }, false);

  console.log("DaRI AI Mobile & Desktop Standalone Adapter loaded successfully.");
})();
