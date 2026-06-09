import assert from 'node:assert';
import test from 'node:test';
import { createMemoryScope } from './memory.js';

test('createMemoryScope', async (t) => {
  await t.test('returns null when no context is provided', () => {
    assert.strictEqual(createMemoryScope(), null);
    assert.strictEqual(createMemoryScope(null), null);
    assert.strictEqual(createMemoryScope(undefined), null);
  });

  await t.test('returns null when context contains no valid properties', () => {
    assert.strictEqual(createMemoryScope({}), null);
    assert.strictEqual(createMemoryScope({ randomProp: 'value' }), null);
    assert.strictEqual(createMemoryScope({ userId: {}, sessionId: [] }), null);
  });

  await t.test('returns explicit scope if memoryScopeId is provided', () => {
    assert.strictEqual(createMemoryScope({ memoryScopeId: 'explicit-scope-123' }), 'explicit-scope-123');
    assert.strictEqual(
      createMemoryScope({ memoryScopeId: 'explicit-scope-123', userId: 'user-1' }),
      'explicit-scope-123'
    );
  });

  await t.test('normalizes memoryScopeId correctly', () => {
    assert.strictEqual(createMemoryScope({ memoryScopeId: '   explicit-scope-123   ' }), 'explicit-scope-123');
    assert.strictEqual(createMemoryScope({ memoryScopeId: 12345 }), '12345');
    assert.strictEqual(createMemoryScope({ memoryScopeId: '   ' }), null);
  });

  await t.test('generates scope with valid userId and default fallbacks', () => {
    const expected = 'user:user-123|session:none|project:none|chat:none';
    assert.strictEqual(createMemoryScope({ userId: 'user-123' }), expected);
  });

  await t.test('generates scope with valid sessionId and default fallbacks', () => {
    const expected = 'user:anonymous|session:session-123|project:none|chat:none';
    assert.strictEqual(createMemoryScope({ sessionId: 'session-123' }), expected);
  });

  await t.test('generates scope with valid projectId and default fallbacks', () => {
    const expected = 'user:anonymous|session:none|project:project-123|chat:none';
    assert.strictEqual(createMemoryScope({ projectId: 'project-123' }), expected);
  });

  await t.test('generates scope with valid chatId and default fallbacks', () => {
    const expected = 'user:anonymous|session:none|project:none|chat:chat-123';
    assert.strictEqual(createMemoryScope({ chatId: 'chat-123' }), expected);
  });

  await t.test('generates scope with all properties provided', () => {
    const expected = 'user:u1|session:s1|project:p1|chat:c1';
    assert.strictEqual(
      createMemoryScope({
        userId: 'u1',
        sessionId: 's1',
        projectId: 'p1',
        chatId: 'c1'
      }),
      expected
    );
  });

  await t.test('normalizes individual properties', () => {
    const expected = 'user:123|session:456|project:none|chat:none';
    assert.strictEqual(
      createMemoryScope({
        userId: '   123   ',
        sessionId: 456,
        projectId: '   ',
        chatId: {}
      }),
      expected
    );
  });
});
