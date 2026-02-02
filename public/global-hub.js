// global-hub.js
// Handles accent, theme, background, tab cloaking, anti-close, about:blank launch.

(function () {
  const ACCENT_KEY = "s0laceAccent";
  const CLOAK_KEY = "s0laceTabCloak";
  const THEME_KEY = "s0laceTheme";
  const BG_MODE_KEY = "s0laceBgMode";
  const BG_URL_KEY = "s0laceBgUrl";

  const STARTUP_KEY = "s0laceStartupBlank";
  const ANTI_CLOSE_KEY = "s0laceAntiClose";

  const STAR_GIF = "background.gif";

  const ACCENTS = {
    green: { accent: "#00ff7f", soft: "rgba(0,255,127,0.12)" },
    violet: { accent: "#a855f7", soft: "rgba(168,85,247,0.12)" },
    amber: { accent: "#fbbf24", soft: "rgba(251,191,36,0.12)" },
    white: { accent: "#ffffff", soft: "rgba(255,255,255,0.18)" }
  };

  function setVar(n, v) {
    document.documentElement.style.setProperty(n, v);
  }

  // Function to apply custom cursor globally
function applyCustomCursor() {
    const style = document.createElement('style');
    style.innerHTML = `
        * {
            cursor: url('thumbs/cursor.png'), auto !important;
        }
        
        /* Optional: Change cursor when hovering over links or buttons */
        a:hover, button:hover {
            cursor: url('thumbs/cursor.png'), pointer !important;
        }
    `;
    document.head.appendChild(style);
}

// Run the function
applyCustomCursor();

  /* ===========================================================
      ACCENT COLOR (NOW ALSO UPDATES data-accent FOR ICON SWAP)
     =========================================================== */
  function applyAccent(key, save = true) {
    const a = ACCENTS[key] || ACCENTS.green;

    setVar("--accent", a.accent);
    setVar("--accent-soft", a.soft);

    // ⭐ REQUIRED FOR ACCOUNT ICON SWITCHING ⭐
    document.documentElement.setAttribute("data-accent", key);

    if (save) localStorage.setItem(ACCENT_KEY, key);
  }

  function loadAccent() {
    const key = localStorage.getItem(ACCENT_KEY) || "green";
    applyAccent(key, false);
    return key;
  }

  /* ===========================================================
      TAB CLOAK
     =========================================================== */
  function faviconEl() {
    return (
      document.querySelector('link[rel="icon"]') ||
      document.querySelector('link[rel="shortcut icon"]') ||
      (() => {
        const l = document.createElement("link");
        l.rel = "icon";
        document.head.appendChild(l);
        return l;
      })()
    );
  }

  function applyTabCloak(cfg, save = true) {
    if (!cfg?.enabled) return;
    document.title = cfg.title || document.title;
    if (cfg.iconHref) faviconEl().href = cfg.iconHref;
    if (save) localStorage.setItem(CLOAK_KEY, JSON.stringify(cfg));
  }

  function clearTabCloak(save = true) {
    const og = document.documentElement.dataset.originalTitle;
    if (og) document.title = og;
    if (save) localStorage.removeItem(CLOAK_KEY);
  }

  function loadTabCloak() {
    const raw = localStorage.getItem(CLOAK_KEY);
    if (!raw) return;
    const cfg = JSON.parse(raw);
    if (cfg.enabled) applyTabCloak(cfg, false);
  }

  (() => {
  if (window.__GLOBAL_LOADER__) return;
  window.__GLOBAL_LOADER__ = true;

  const overlay = document.createElement("div");
  overlay.id = "loading-overlay";

  overlay.innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <p id="loading-text"></p>
    </div>
  `;

  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(overlay);

    const messages = window.LOADER_MESSAGES || ["Loading…"];
    const text = overlay.querySelector("#loading-text");

    text.textContent =
      messages[Math.floor(Math.random() * messages.length)];

    // Hide after full load
    window.addEventListener("load", () => {
  setTimeout(() => {
    hideLoader();
  }, 1500); // extra 3 seconds
});

  });

  window.showLoader = () => {
    overlay.classList.remove("hidden");
    const messages = window.LOADER_MESSAGES || ["Loading…"];
    overlay.querySelector("#loading-text").textContent =
      messages[Math.floor(Math.random() * messages.length)];
  };

  window.hideLoader = () => {
    overlay.classList.add("hidden");
  };
})();


  /* ===========================================================
      THEME
     =========================================================== */
  function applyTheme(theme, save = true) {
    document.documentElement.setAttribute("data-theme", theme);
    if (save) localStorage.setItem(THEME_KEY, theme);
  }

  function loadTheme() {
    const t = localStorage.getItem(THEME_KEY) || "dark";
    applyTheme(t, false);
    return t;
  }

  /* ===========================================================
      BACKGROUND
     =========================================================== */
  function applyBackground(mode, url, save = true) {
    const b = document.body;

    // reset only background-image, keep CRT grid
    b.style.backgroundImage = "";
    b.style.backgroundSize = "";
    b.style.backgroundAttachment = "";

    if (mode === "gif-stars") {
      b.style.backgroundImage = `url("${STAR_GIF}")`;
      b.style.backgroundSize = "cover";
      b.style.backgroundAttachment = "fixed";
    }

    if (mode === "custom" && url) {
      b.style.backgroundImage = `url("${url}")`;
      b.style.backgroundSize = "cover";
      b.style.backgroundAttachment = "fixed";
    }

    if (save) {
      localStorage.setItem(BG_MODE_KEY, mode);
      if (mode === "custom") localStorage.setItem(BG_URL_KEY, url || "");
      else localStorage.removeItem(BG_URL_KEY);
    }
  }

  function loadBackground() {
    const mode = localStorage.getItem(BG_MODE_KEY) || "default";
    const url = localStorage.getItem(BG_URL_KEY) || "";
    applyBackground(mode, url, false);
    return { mode, url };
  }

  /* ===========================================================
      ANTI-CLOSE
     =========================================================== */

  function preventClose(e) {
    e.preventDefault();
    e.returnValue = "";
  }

  function enableAntiClose() {
    window.addEventListener("beforeunload", preventClose);
  }

  function disableAntiClose() {
    window.removeEventListener("beforeunload", preventClose);
  }

  function loadAntiClose() {
    const enabled = localStorage.getItem(ANTI_CLOSE_KEY) === "1";
    if (enabled) enableAntiClose();
    return enabled;
  }

  function patchInternalNavigation() {
    document.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        disableAntiClose();
        setTimeout(() => {
          if (localStorage.getItem(ANTI_CLOSE_KEY) === "1")
            enableAntiClose();
        }, 400);
      });
    });
  }

  /* ===========================================================
      ABOUT:BLANK STARTUP
     =========================================================== */

  function launchIntoBlank() {
    if (localStorage.getItem(STARTUP_KEY) !== "1") return;
    if (!location.pathname.endsWith("settings.html")) return;

    const win = window.open("about:blank", "_blank");
    if (!win) return alert("Popup blocked — enable popups to use about:blank mode.");

    win.document.write(`
      <style>
        body { margin:0; background:black; display:flex; align-items:center; justify-content:center; }
        iframe { border:none; width:100vw; height:100vh; }
      </style>
      <iframe src="${location.origin}/index.html"></iframe>
    `);
  }

  /* ===========================================================
      INIT
     =========================================================== */

  function boot() {
    document.documentElement.dataset.originalTitle = document.title;

    const accent = loadAccent();   // now applies data-accent
    const theme = loadTheme();
    const bg = loadBackground();
    loadTabCloak();

    window.dispatchEvent(
      new CustomEvent("s0lace:settingsLoaded", {
        detail: { accent, theme, bgMode: bg.mode, bgUrl: bg.url }
      })
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    boot();
    loadAntiClose();
    patchInternalNavigation();
    launchIntoBlank();
  });

  /* ===========================================================
      EXPORT API
     =========================================================== */

  window.S0LACE = {
    applyAccent,
    applyTabCloak,
    clearTabCloak,
    applyTheme,
    applyBackground,

    enableAntiClose: () => {
      localStorage.setItem(ANTI_CLOSE_KEY, "1");
      enableAntiClose();
    },
    disableAntiClose: () => {
      localStorage.removeItem(ANTI_CLOSE_KEY);
      disableAntiClose();
    },

    enableBlankStartup: () => localStorage.setItem(STARTUP_KEY, "1"),
    disableBlankStartup: () => localStorage.removeItem(STARTUP_KEY)
  };
})();
