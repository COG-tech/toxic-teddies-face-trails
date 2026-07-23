const STORAGE_KEY = 'analytics:event-queue-v1';
const RESEARCH_KEY = 'analytics:research-build-v1';
const MAX_EVENTS = 1000;

const APPROVED_EVENTS = new Set([
  'app_open',
  'app_pause',
  'app_resume',
  'tutorial_open',
  'tutorial_complete',
  'level_load',
  'path_select',
  'path_remove',
  'path_blocked',
  'path_missed',
  'hint_used',
  'level_restart',
  'progress_saved',
  'progress_restored',
  'level_complete',
  'next_expression',
  'feed_unlock',
  'feed_open',
  'feed_post_view',
  'result_shared',
  'settings_changed',
  'research_export',
]);

const APPROVED_PROPERTIES = new Set([
  'platform', 'app_version', 'native_build', 'build_id', 'content_version',
  'compiler_version', 'level_version', 'teddy_id', 'expression_id', 'level',
  'remaining_paths', 'total_paths', 'removed_paths', 'blocker_count', 'region',
  'input_type', 'response_ms', 'elapsed_ms', 'restored_paths', 'restore_source',
  'reason', 'setting', 'enabled', 'research_build', 'integrity_status',
  'completed_expressions', 'unlock_source', 'post_id',
]);

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function safeValue(value) {
  if (typeof value === 'string') return value.slice(0, 120);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'boolean') return value;
  return undefined;
}

function sanitizeProperties(properties = {}) {
  const safe = {};
  for (const [key, value] of Object.entries(properties)) {
    if (!APPROVED_PROPERTIES.has(key)) continue;
    const sanitized = safeValue(value);
    if (sanitized !== undefined) safe[key] = sanitized;
  }
  return safe;
}

function randomSessionId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createAnalytics({bridge, buildInfo, now = () => Date.now()}) {
  let queue = [];
  let researchBuild = false;
  let sessionId = randomSessionId();
  let initialized = false;
  let writeChain = Promise.resolve();

  const baseProperties = Object.freeze({
    platform: bridge.platform,
    app_version: buildInfo.appVersion,
    native_build: bridge.platform === 'ios'
      ? Number(buildInfo.iosBuildNumber)
      : bridge.platform === 'android'
        ? Number(buildInfo.androidVersionCode)
        : 0,
    build_id: buildInfo.buildId,
    content_version: buildInfo.contentVersion,
    integrity_status: buildInfo.integrity?.verified ? 'verified' : 'unverified',
  });

  async function persist() {
    const serialized = JSON.stringify(queue.slice(-MAX_EVENTS));
    writeChain = writeChain.catch(() => {}).then(() => bridge.saveSetting(STORAGE_KEY, serialized));
    await writeChain;
  }

  async function initialize() {
    const [storedQueue, storedResearch] = await Promise.all([
      bridge.loadSetting(STORAGE_KEY),
      bridge.loadSetting(RESEARCH_KEY),
    ]);
    queue = Array.isArray(parseJson(storedQueue, [])) ? parseJson(storedQueue, []) : [];
    const queryResearch = new URLSearchParams(globalThis.location?.search || '').get('research');
    researchBuild = queryResearch === '1' || storedResearch === 'true';
    initialized = true;
    await track('app_open', {research_build: researchBuild});
  }

  async function track(name, properties = {}) {
    if (!APPROVED_EVENTS.has(name)) throw new Error(`Unapproved analytics event: ${name}`);
    const event = {
      schema_version: 1,
      event_name: name,
      event_id: globalThis.crypto?.randomUUID?.() || `${now()}-${Math.random().toString(36).slice(2)}`,
      session_id: sessionId,
      occurred_at: new Date(now()).toISOString(),
      properties: {
        ...baseProperties,
        ...sanitizeProperties(properties),
        research_build: researchBuild,
      },
    };
    queue.push(event);
    if (queue.length > MAX_EVENTS) queue = queue.slice(-MAX_EVENTS);
    await persist();
    globalThis.dispatchEvent?.(new CustomEvent('toxic-analytics-event', {detail: event}));
    return event;
  }

  async function setResearchBuild(enabled) {
    researchBuild = Boolean(enabled);
    await bridge.saveSetting(RESEARCH_KEY, String(researchBuild));
  }

  async function clear() {
    queue = [];
    sessionId = randomSessionId();
    await persist();
  }

  async function exportResearchData() {
    const payload = {
      schema_version: 1,
      exported_at: new Date(now()).toISOString(),
      build: baseProperties,
      research_build: researchBuild,
      event_count: queue.length,
      events: queue.map(event => ({...event})),
      privacy: {
        contains_raw_touch_coordinates: false,
        contains_name_email_or_account_id: false,
        transmission: 'local_export_only',
      },
    };
    await track('research_export', {research_build: researchBuild});
    return payload;
  }

  return Object.freeze({
    initialize,
    track,
    clear,
    exportResearchData,
    setResearchBuild,
    isResearchBuild: () => researchBuild,
    isInitialized: () => initialized,
    getEvents: () => queue.map(event => ({...event, properties: {...event.properties}})),
    approvedEvents: [...APPROVED_EVENTS],
  });
}
