const agentMemoryStore = new Map();
const sharedMemoryStore = new Map();

function normalizeScopePart(value) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const normalized = String(value).trim();
  return normalized || null;
}

export function createMemoryScope(context = {}) {
  const explicitScope = normalizeScopePart(context.memoryScopeId);
  if (explicitScope) {
    return explicitScope;
  }

  const userId = normalizeScopePart(context.userId);
  const sessionId = normalizeScopePart(context.sessionId);
  const projectId = normalizeScopePart(context.projectId);
  const chatId = normalizeScopePart(context.chatId);

  if (!userId && !sessionId && !projectId && !chatId) {
    return null;
  }

  return [
    `user:${userId || 'anonymous'}`,
    `session:${sessionId || 'none'}`,
    `project:${projectId || 'none'}`,
    `chat:${chatId || 'none'}`,
  ].join('|');
}

function getAgentScopeStore(scopeId, shouldCreate = false) {
  if (!scopeId) {
    return null;
  }

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

// Test-only utility to clear module-level state
export function clearMemoryStores() {
  agentMemoryStore.clear();
  sharedMemoryStore.clear();
}
