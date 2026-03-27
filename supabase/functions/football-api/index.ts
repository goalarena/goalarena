import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const API_FOOTBALL_KEY = Deno.env.get('API_FOOTBALL_KEY');
const API_FOOTBALL_BASE_URL = (Deno.env.get('API_FOOTBALL_BASE_URL') ?? 'https://v3.football.api-sports.io').replace(/\/$/, '');
const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

// ── Tiered cache TTLs (milliseconds) ──
const CACHE_TTL = {
  live:       60_000,       // 60s – live fixtures
  today:      60_000,       // 60s – today fixtures
  yesterday:  600_000,      // 10 min – finished/yesterday
  tomorrow:   300_000,      // 5 min – upcoming
  standings:  1_800_000,    // 30 min
  leagues:    3_600_000,    // 60 min
  default:    120_000,      // 2 min – everything else
};

function getCacheTtl(endpoint: string, params: Record<string, string>): number {
  if (endpoint === 'standings') return CACHE_TTL.standings;
  if (endpoint === 'leagues') return CACHE_TTL.leagues;
  if (endpoint === 'fixtures') {
    if (params.live) return CACHE_TTL.live;
    if (params.date) {
      const today = getDateString(0);
      const yesterday = getDateString(-1);
      if (params.date === today) return CACHE_TTL.today;
      if (params.date === yesterday) return CACHE_TTL.yesterday;
      if (params.date > today) return CACHE_TTL.tomorrow;
      return CACHE_TTL.yesterday; // older dates cached longer
    }
    // Single fixture by id – cache 60s (may be live)
    if (params.id) return CACHE_TTL.live;
  }
  // Events, lineups, statistics for a fixture
  if (endpoint.startsWith('fixtures/')) return CACHE_TTL.live;
  return CACHE_TTL.default;
}

type ApiFootballResponse = {
  get?: string;
  parameters?: Record<string, string>;
  errors?: Record<string, string>;
  results?: number;
  response?: unknown[];
  [key: string]: unknown;
};

type CacheEntry = {
  expiresAt: number;
  payload: ApiFootballResponse;
  ttl: number;
};

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<ApiFootballResponse>>();

// ── Request counter for monitoring ──
const requestCounter: Record<string, { total: number; cached: number; upstream: number }> = {};

function trackRequest(endpoint: string, source: 'cache' | 'upstream' | 'inflight') {
  if (!requestCounter[endpoint]) {
    requestCounter[endpoint] = { total: 0, cached: 0, upstream: 0 };
  }
  requestCounter[endpoint].total++;
  if (source === 'cache' || source === 'inflight') {
    requestCounter[endpoint].cached++;
  } else {
    requestCounter[endpoint].upstream++;
  }
}

const LIVE_STATUSES = new Set(['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'INT', 'BT']);
const UPCOMING_STATUSES = new Set(['NS', 'TBD']);
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN', 'AWD', 'WO']);

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: jsonHeaders });
}

function getDateString(dayOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function normalizeParams(input: Record<string, unknown>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, rawValue] of Object.entries(input)) {
    if (rawValue === null || rawValue === undefined || rawValue === '') continue;
    if (key === 'date' && typeof rawValue === 'string') {
      if (rawValue === 'today') { normalized[key] = getDateString(0); continue; }
      if (rawValue === 'yesterday') { normalized[key] = getDateString(-1); continue; }
      if (rawValue === 'tomorrow') { normalized[key] = getDateString(1); continue; }
    }
    normalized[key] = String(rawValue);
  }
  return normalized;
}

function buildCacheKey(endpoint: string, params: Record<string, string>) {
  const ordered = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  return `${endpoint}::${JSON.stringify(ordered)}`;
}

function cleanupExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of responseCache.entries()) {
    if (entry.expiresAt <= now) responseCache.delete(key);
  }
}

async function fetchProvider(
  endpoint: string,
  params: Record<string, unknown>,
  requestId: string,
): Promise<{ payload: ApiFootballResponse; source: 'cache' | 'upstream' | 'inflight' }> {
  cleanupExpiredCache();

  const normalizedParams = normalizeParams(params);
  const cacheKey = buildCacheKey(endpoint, normalizedParams);
  const now = Date.now();
  const cached = responseCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    trackRequest(endpoint, 'cache');
    return { payload: cached.payload, source: 'cache' };
  }

  const existingRequest = inFlightRequests.get(cacheKey);
  if (existingRequest) {
    trackRequest(endpoint, 'inflight');
    const payload = await existingRequest;
    return { payload, source: 'inflight' };
  }

  const ttl = getCacheTtl(endpoint, normalizedParams);

  const requestPromise = (async (): Promise<ApiFootballResponse> => {
    const queryParams = new URLSearchParams();
    Object.entries(normalizedParams).forEach(([key, value]) => queryParams.append(key, value));

    const url = `${API_FOOTBALL_BASE_URL}/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.info(`[football-api:${requestId}] upstream request`, { endpoint, params: normalizedParams });

    const response = await fetch(url, {
      headers: {
        'x-apisports-key': API_FOOTBALL_KEY!,
        'Accept': 'application/json',
      },
    });

    const rawBody = await response.text();
    if (!response.ok) {
      console.error(`[football-api:${requestId}] upstream error`, { status: response.status, endpoint, body: rawBody });
      throw new Error(`Football provider failed with status ${response.status}`);
    }

    let payload: ApiFootballResponse;
    try {
      payload = rawBody ? JSON.parse(rawBody) as ApiFootballResponse : {};
    } catch {
      console.error(`[football-api:${requestId}] invalid JSON`, { endpoint, body: rawBody });
      throw new Error('Invalid JSON response from football provider');
    }

    if (payload.errors && Object.keys(payload.errors).length > 0) {
      console.warn(`[football-api:${requestId}] provider errors`, { endpoint, errors: payload.errors });
    }

    const resultsCount = Array.isArray(payload.response) ? payload.response.length : 0;
    console.info(`[football-api:${requestId}] upstream response`, { endpoint, results: resultsCount, cacheTtl: ttl / 1000 });

    responseCache.set(cacheKey, { expiresAt: Date.now() + ttl, payload, ttl });
    trackRequest(endpoint, 'upstream');
    return payload;
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  try {
    const payload = await requestPromise;
    return { payload, source: 'upstream' };
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

function extractFixtures(payload: ApiFootballResponse): unknown[] {
  return Array.isArray(payload.response) ? payload.response : [];
}

function getFixtureId(item: unknown): number | null {
  if (!item || typeof item !== 'object') return null;
  const id = (item as { fixture?: { id?: unknown } }).fixture?.id;
  return typeof id === 'number' ? id : null;
}

function getFixtureTimestamp(item: unknown): number {
  if (!item || typeof item !== 'object') return Number.MAX_SAFE_INTEGER;
  const ts = (item as { fixture?: { timestamp?: unknown } }).fixture?.timestamp;
  return typeof ts === 'number' ? ts : Number.MAX_SAFE_INTEGER;
}

function getFixtureStatus(item: unknown): string {
  if (!item || typeof item !== 'object') return '';
  const status = (item as { fixture?: { status?: { short?: unknown } } }).fixture?.status?.short;
  return typeof status === 'string' ? status : '';
}

function dedupeFixtures(fixtures: unknown[]): unknown[] {
  const map = new Map<number, unknown>();
  for (const fixture of fixtures) {
    const id = getFixtureId(fixture);
    if (id !== null) map.set(id, fixture);
  }
  return Array.from(map.values()).sort((a, b) => getFixtureTimestamp(a) - getFixtureTimestamp(b));
}

function categorizeFixtures(fixtures: unknown[]) {
  const live: unknown[] = [];
  const upcoming: unknown[] = [];
  const finished: unknown[] = [];

  for (const fixture of fixtures) {
    const status = getFixtureStatus(fixture);
    if (LIVE_STATUSES.has(status)) { live.push(fixture); continue; }
    if (UPCOMING_STATUSES.has(status)) { upcoming.push(fixture); continue; }
    if (FINISHED_STATUSES.has(status)) { finished.push(fixture); continue; }
    if (status) upcoming.push(fixture);
  }

  return { live, upcoming, finished };
}

function mergeErrors(...errorsList: Array<Record<string, string> | undefined>) {
  const merged: Record<string, string> = {};
  errorsList.forEach((errors) => {
    if (!errors) return;
    Object.entries(errors).forEach(([key, value]) => {
      if (value && !merged[key]) merged[key] = value;
    });
  });
  return merged;
}

async function buildLiveFeed(requestId: string) {
  // Fetch live + today + tomorrow in parallel (3 calls, all cached)
  const [liveResult, todayResult, tomorrowResult] = await Promise.all([
    fetchProvider('fixtures', { live: 'all' }, requestId),
    fetchProvider('fixtures', { date: 'today' }, requestId),
    fetchProvider('fixtures', { date: 'tomorrow' }, requestId),
  ]);

  const liveFixtures = extractFixtures(liveResult.payload);
  const todayFixtures = extractFixtures(todayResult.payload);
  const tomorrowFixtures = extractFixtures(tomorrowResult.payload);

  // Dedupe today (may overlap with live)
  const todayDeduped = dedupeFixtures([...liveFixtures, ...todayFixtures]);

  let fallbackApplied = false;
  let yesterdayFixtures: unknown[] = [];
  let yesterdayResult: { payload: ApiFootballResponse; source: string } | null = null;

  // If today is empty, fetch yesterday as fallback
  if (todayDeduped.length === 0 && tomorrowFixtures.length === 0) {
    fallbackApplied = true;
    yesterdayResult = await fetchProvider('fixtures', { date: 'yesterday' }, requestId);
    yesterdayFixtures = extractFixtures(yesterdayResult.payload);
  }

  // Categorize today's fixtures
  const todayCategorized = categorizeFixtures(todayDeduped);

  const allFixtures = dedupeFixtures([
    ...todayDeduped,
    ...tomorrowFixtures,
    ...yesterdayFixtures,
  ]);

  const errors = mergeErrors(
    liveResult.payload.errors,
    todayResult.payload.errors,
    tomorrowResult.payload.errors,
    yesterdayResult?.payload.errors,
  );

  const sources: Record<string, string> = {
    live: liveResult.source,
    today: todayResult.source,
    tomorrow: tomorrowResult.source,
  };
  if (yesterdayResult) sources.yesterday = yesterdayResult.source;

  console.info(`[football-api:${requestId}] live-feed summary`, {
    total: allFixtures.length,
    live: todayCategorized.live.length,
    todayUpcoming: todayCategorized.upcoming.length,
    todayFinished: todayCategorized.finished.length,
    tomorrow: tomorrowFixtures.length,
    yesterday: yesterdayFixtures.length,
    fallbackApplied,
    sources,
  });

  return {
    get: 'fixtures/live-feed',
    response: {
      all: allFixtures,
      live: todayCategorized.live,
      upcoming: todayCategorized.upcoming,
      finished: todayCategorized.finished,
      tomorrow: tomorrowFixtures,
      yesterday: yesterdayFixtures,
    },
    results: allFixtures.length,
    errors,
    meta: {
      refreshedAt: new Date().toISOString(),
      cacheTtlSeconds: CACHE_TTL.live / 1000,
      fallbackApplied,
      sources,
    },
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();

  try {
    if (!API_FOOTBALL_KEY) {
      return jsonResponse({ error: 'API key not configured' }, 500);
    }

    let body: { endpoint?: string; params?: Record<string, unknown> };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const endpoint = typeof body.endpoint === 'string' ? body.endpoint.trim() : '';
    const params = typeof body.params === 'object' && body.params ? { ...body.params } : {};

    if (!endpoint) {
      return jsonResponse({ error: 'Missing endpoint parameter' }, 400);
    }

    // ── Stats endpoint for monitoring ──
    if (endpoint === 'stats') {
      return jsonResponse({
        requestCounter,
        cacheSize: responseCache.size,
        cacheTtls: CACHE_TTL,
      });
    }

    if (endpoint === 'fixtures/live-feed') {
      const feed = await buildLiveFeed(requestId);
      return jsonResponse(feed, 200);
    }

    const { payload, source } = await fetchProvider(endpoint, params, requestId);
    const normalizedParams = normalizeParams(params);
    const ttl = getCacheTtl(endpoint, normalizedParams);

    return jsonResponse({
      ...payload,
      meta: {
        ...(payload.meta && typeof payload.meta === 'object' ? payload.meta as Record<string, unknown> : {}),
        source,
        cacheTtlSeconds: ttl / 1000,
      },
    }, 200);
  } catch (error) {
    console.error(`[football-api:${requestId}] internal error`, error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Internal server error' }, 500);
  }
});
