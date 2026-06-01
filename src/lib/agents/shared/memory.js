const agentMemoryStore = new Map();
const sharedMemoryStore = new Map();

function getScopedStore(agentId) {
  if (!agentMemoryStore.has(agentId)) {
    agentMemoryStore.set(agentId, new Map());
  }
  return agentMemoryStore.get(agentId);
}

export function updateAgentMemory(agentId, key, value) {
  getScopedStore(agentId).set(key, value);
  return value;
}

export function getAgentMemory(agentId, key) {
  return getScopedStore(agentId).get(key);
}

export function updateSharedMemory(key, value) {
  sharedMemoryStore.set(key, value);
  return value;
}

export function getSharedMemory(key) {
  return sharedMemoryStore.get(key);
}

export function snapshotMemory(agentId) {
  return {
    agent: Object.fromEntries(getScopedStore(agentId)),
    shared: Object.fromEntries(sharedMemoryStore),
  };
}
