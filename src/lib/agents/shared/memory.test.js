import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from 'node:test';
import {
  updateAgentMemory,
  getAgentMemory,
  clearMemoryStores
} from './memory.js';

describe('updateAgentMemory', () => {
  beforeEach(() => {
    clearMemoryStores();
  });

  afterEach(() => {
    clearMemoryStores();
  });

  it('stores and retrieves values using explicit memoryScopeId', () => {
    const context = { memoryScopeId: 'test-scope-1' };
    const agentId = 'agent-1';

    const result = updateAgentMemory(agentId, 'key1', 'value1', context);

    assert.strictEqual(result, 'value1', 'should return the stored value');

    const stored = getAgentMemory(agentId, 'key1', context);
    assert.strictEqual(stored, 'value1', 'should store the value in agent memory');
  });

  it('stores and retrieves values using composite scope IDs', () => {
    const context = {
      userId: 'user-1',
      sessionId: 'sess-1',
      projectId: 'proj-1',
      chatId: 'chat-1'
    };
    const agentId = 'agent-2';

    const result = updateAgentMemory(agentId, 'key1', 'value1', context);

    assert.strictEqual(result, 'value1', 'should return the stored value');

    const stored = getAgentMemory(agentId, 'key1', context);
    assert.strictEqual(stored, 'value1', 'should store the value in agent memory');
  });

  it('does not store value if context lacks identifying information', () => {
    const context = {}; // No explicit scope, userId, sessionId, etc.
    const agentId = 'agent-3';

    const result = updateAgentMemory(agentId, 'key2', 'value2', context);

    assert.strictEqual(result, 'value2', 'should still return the value even if not stored');

    const stored = getAgentMemory(agentId, 'key2', context);
    assert.strictEqual(stored, undefined, 'should not store the value since no scope was created');
  });

  it('isolates memory between different agents in the same scope', () => {
    const context = { memoryScopeId: 'shared-scope' };

    updateAgentMemory('agent-A', 'color', 'blue', context);
    updateAgentMemory('agent-B', 'color', 'red', context);

    assert.strictEqual(getAgentMemory('agent-A', 'color', context), 'blue');
    assert.strictEqual(getAgentMemory('agent-B', 'color', context), 'red');
  });

  it('isolates memory between different scopes for the same agent', () => {
    const context1 = { memoryScopeId: 'scope-1' };
    const context2 = { memoryScopeId: 'scope-2' };

    updateAgentMemory('agent-C', 'theme', 'dark', context1);
    updateAgentMemory('agent-C', 'theme', 'light', context2);

    assert.strictEqual(getAgentMemory('agent-C', 'theme', context1), 'dark');
    assert.strictEqual(getAgentMemory('agent-C', 'theme', context2), 'light');
  });

  it('handles object values correctly', () => {
    const context = { memoryScopeId: 'object-scope' };
    const complexValue = { id: 1, tags: ['a', 'b'] };

    updateAgentMemory('agent-D', 'data', complexValue, context);

    const stored = getAgentMemory('agent-D', 'data', context);
    assert.deepStrictEqual(stored, { id: 1, tags: ['a', 'b'] });
    // Verify it is the exact same reference
    assert.strictEqual(stored, complexValue);
  });
});
