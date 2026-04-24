const BAGGY_CACHE_NAME       = 'baggy-assets-v1';
const BAGGY_BASE             = 'https://strmods.github.io/';
const BAGGY_MANIFEST_URL     = BAGGY_BASE + 'site/cache-manifest.json';
const BAGGY_MANIFEST_KEY     = 'baggy-cache-manifest';
const BAGGY_LAST_CHECK_KEY   = 'baggy-cache-last-check';
const BAGGY_CHECK_INTERVAL   = 6 * 60 * 60 * 1000; // 6 hours

async function baggyCachedFetch(url) {
  try {
    const cache  = await caches.open(BAGGY_CACHE_NAME);
    const cached = await cache.match(url);
    if (cached) return cached.clone();

    const fresh = await fetch(url);
    if (fresh.ok) await cache.put(url, fresh.clone());
    return fresh;
  } catch {
    return fetch(url);
  }
}

async function baggyCheckForUpdates(force = false) {
  const now       = Date.now();
  const lastCheck = parseInt(localStorage.getItem(BAGGY_LAST_CHECK_KEY) || '0', 10);

  if (!force && (now - lastCheck) < BAGGY_CHECK_INTERVAL) return;
  localStorage.setItem(BAGGY_LAST_CHECK_KEY, String(now));

  let remote;
  try {
    const res = await fetch(BAGGY_MANIFEST_URL, { cache: 'no-store' });
    remote = await res.json();
  } catch {
    return; // offline — silently use existing cache
  }

  const storedRaw = localStorage.getItem(BAGGY_MANIFEST_KEY);
  const stored    = storedRaw ? JSON.parse(storedRaw) : { assets: {} };

  if (remote.version === stored.version) return;

  const cache   = await caches.open(BAGGY_CACHE_NAME);
  const changed = [];

  for (const [path, hash] of Object.entries(remote.assets)) {
    if (stored.assets[path] !== hash) changed.push(path);
  }

  // Bust and re-fetch changed files
  await Promise.all(changed.map(async path => {
    const url = BAGGY_BASE + path;
    await cache.delete(url);
    try {
      const fresh = await fetch(url, { cache: 'no-store' });
      if (fresh.ok) await cache.put(url, fresh.clone());
    } catch { /* ignore individual fetch failures */ }
  }));

  // Remove deleted files from cache
  for (const path of Object.keys(stored.assets)) {
    if (!remote.assets[path]) await cache.delete(BAGGY_BASE + path);
  }

  localStorage.setItem(BAGGY_MANIFEST_KEY, JSON.stringify(remote));
  console.log(`[Baggy Cache] Updated ${changed.length} file(s)`);
}

async function baggyInitCache() {
  await baggyCheckForUpdates();
}
