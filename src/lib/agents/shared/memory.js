const agentMemoryStore = new Map();
const sharedMemoryStore = new Map();
const scopeTimestamps = new Map();

const MEMORY_TTL = 30 * 60 * 1000;
const MAX_SCOPES = 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function normalizeScopePart(value) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const normalized = String(value).trim();
  return normalized || null;
}

function touchScope(scopeId) {
  if (!scopeId) {
    return;
  }

  scopeTimestamps.set(scopeId, Date.now());

  if (scopeTimestamps.size > MAX_SCOPES) {
    cleanupOldScopes();
  }
}

export function cleanupOldScopes() {
  const now = Date.now();
  const expiredScopes = [];

  for (const [scopeId, timestamp] of scopeTimestamps.entries()) {
    if (now - timestamp > MEMORY_TTL) {
      expiredScopes.push(scopeId);
    }
  }

  for (const scopeId of expiredScopes) {
    agentMemoryStore.delete(scopeId);
    sharedMemoryStore.delete(scopeId);
    scopeTimestamps.delete(scopeId);
  }

  if (scopeTimestamps.size > MAX_SCOPES) {
    const sortedScopes = Array.from(scopeTimestamps.entries()).sort((a, b) => a[1] - b[1]);
    const scopesToRemove = sortedScopes.slice(0, sortedScopes.length - MAX_SCOPES);

    for (const [scopeId] of scopesToRemove) {
      agentMemoryStore.delete(scopeId);
      sharedMemoryStore.delete(scopeId);
      scopeTimestamps.delete(scopeId);
    }
  }
}

if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(cleanupOldScopes, CLEANUP_INTERVAL);
  cleanupTimer.unref?.();
}

export function createMemoryScope(context = {}) {
  const explicitScope = normalizeScopePart(context.memoryScopeId);
  if (explicitScope) {
    touchScope(explicitScope);
    return explicitScope;
  }

  const userId = normalizeScopePart(context.userId);
  const sessionId = normalizeScopePart(context.sessionId);
  const projectId = normalizeScopePart(context.projectId);
  const chatId = normalizeScopePart(context.chatId);

  if (!userId && !sessionId && !projectId && !chatId) {
    return null;
  }

  const scopeId = [
    `user:${userId || 'anonymous'}`,
    `session:${sessionId || 'none'}`,
    `project:${projectId || 'none'}`,
    `chat:${chatId || 'none'}`,
  ].join('|');

  touchScope(scopeId);
  return scopeId;
}

function getAgentScopeStore(scopeId, shouldCreate = false) {
  if (!scopeId) {
    return null;
  }

  touchScope(scopeId);

  if (!agentMemoryStore.has(scopeId)) {
    if (!shouldCreate) {
      return null;
    }
    agentMemoryStore.set(scopeId, new Map());
  }

  return agentMemoryStore.get(scopeId);
}

function getAgentStore(agentId, context = {}, shouldCreate = false) {
  const scopeStore = getAgentScopeStore(createMemoryScope(context), shouldCreate);
  if (!scopeStore) {
    return null;
  }

  if (!scopeStore.has(agentId)) {
    if (!shouldCreate) {
      return null;
    }
    scopeStore.set(agentId, new Map());
  }

  return scopeStore.get(agentId);
}

function getSharedStore(context = {}, shouldCreate = false) {
  const scopeId = createMemoryScope(context);
  if (!scopeId) {
    return null;
  }

  touchScope(scopeId);

  if (!sharedMemoryStore.has(scopeId)) {
    if (!shouldCreate) {
      return null;
    }
    sharedMemoryStore.set(scopeId, new Map());
  }

  return sharedMemoryStore.get(scopeId);
}

export function updateAgentMemory(agentId, key, value, context = {}) {
  const store = getAgentStore(agentId, context, true);
  if (store) {
    store.set(key, value);
  }
  return value;
}

export function getAgentMemory(agentId, key, context = {}) {
  return getAgentStore(agentId, context)?.get(key);
}

export function updateSharedMemory(key, value, context = {}) {
  const store = getSharedStore(context, true);
  if (store) {
    store.set(key, value);
  }
  return value;
}

export function getSharedMemory(key, context = {}) {
  return getSharedStore(context)?.get(key);
}

export function snapshotMemory(agentId, context = {}) {
  return {
    agent: Object.fromEntries(getAgentStore(agentId, context) || []),
    shared: Object.fromEntries(getSharedStore(context) || []),
  };
}
