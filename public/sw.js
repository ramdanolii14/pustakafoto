const CACHE_VERSION = "v1";
const IMAGE_CACHE = `pf-images-${CACHE_VERSION}`;
const API_CACHE = `pf-api-${CACHE_VERSION}`;
const STATIC_CACHE = `pf-static-${CACHE_VERSION}`;

// Max images to keep in cache (each ~100-200KB after CF resize)
const MAX_IMAGE_CACHE = 500;

// CDN hostname — update kalau domain berubah
const CDN_HOST = "cdn.pustakafoto.nyanpixel.my.id";

// ============================================================
// Install — skip waiting so new SW activates immediately
// ============================================================
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

// ============================================================
// Activate — delete old caches
// ============================================================
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== IMAGE_CACHE && k !== API_CACHE && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ============================================================
// Fetch — intercept requests
// ============================================================
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // 1. CDN images — Cache First, long TTL
  if (url.hostname === CDN_HOST) {
    e.respondWith(handleImage(e.request));
    return;
  }

  // 2. API posts list — Stale While Revalidate (fast + fresh)
  if (url.pathname === "/api/posts" && e.request.method === "GET") {
    e.respondWith(handleApiStaleWhileRevalidate(e.request));
    return;
  }

  // 3. API post detail — Stale While Revalidate
  if (url.pathname.startsWith("/api/posts/") && e.request.method === "GET") {
    e.respondWith(handleApiStaleWhileRevalidate(e.request));
    return;
  }

  // 4. API tags — Cache aggressively, rarely changes
  if (url.pathname === "/api/tags") {
    e.respondWith(handleApiStaleWhileRevalidate(e.request, 60 * 60 * 24));
    return;
  }

  // Everything else — network only
});

// ============================================================
// Strategy: Cache First for images
// ============================================================
async function handleImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    // Serve from cache immediately
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Clone and cache
      cache.put(request, response.clone());
      // Trim cache if too large (FIFO)
      trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE);
    }
    return response;
  } catch {
    return new Response("Image unavailable offline", { status: 503 });
  }
}

// ============================================================
// Strategy: Stale While Revalidate for API
// ============================================================
async function handleApiStaleWhileRevalidate(request, maxAgeSeconds = 60) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);

  const now = Date.now();

  if (cached) {
    const cachedAt = cached.headers.get("sw-cached-at");
    const age = cachedAt ? (now - parseInt(cachedAt)) / 1000 : Infinity;

    // Revalidate in background if stale
    if (age > maxAgeSeconds) {
      fetchAndCache(request, cache);
    }

    return cached;
  }

  // No cache — fetch and cache
  return fetchAndCache(request, cache);
}

async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Add timestamp header so we know when it was cached
      const headers = new Headers(response.headers);
      headers.set("sw-cached-at", String(Date.now()));

      const timestamped = new Response(await response.clone().blob(), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });

      cache.put(request, timestamped);
      return response;
    }
    return response;
  } catch {
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ============================================================
// Trim image cache to max N entries (keep most recent)
// ============================================================
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    // Delete oldest entries
    const toDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(toDelete.map((k) => cache.delete(k)));
  }
}