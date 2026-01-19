// register-sw.js
(async () => {
  if (!("serviceWorker" in navigator)) return;

  const SW_URL = "/sw.js";
  const SW_SCOPE = "/";

  try {
    const hasController = !!navigator.serviceWorker.controller;
    const bootstrapped = sessionStorage.getItem("sw_bootstrap_done");

    // FIRST EVER VISIT → register SW → reload once
    if (!hasController && !bootstrapped) {
      sessionStorage.setItem("sw_bootstrap_done", "1");

      try {
        await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
        console.log("[SW] Registered. Reloading once so this tab gets SW control…");
      } catch (err) {
        console.error("[SW] Registration failed:", err);
      }

      location.reload();
      return;
    }

    // If after reload there is STILL no controller → proxy won’t work
    if (!navigator.serviceWorker.controller) {
      console.warn("[SW] No controller after bootstrap. Proxy may not function this visit.");
      return;
    }

    console.log("[SW] Controller active:", navigator.serviceWorker.controller);
  } catch (err) {
    console.error("[SW] bootstrap error:", err);
  }
})();
