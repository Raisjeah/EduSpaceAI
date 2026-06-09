import { describe, it } from 'node:test';
import assert from 'node:assert';
import { summarizeAgentResults } from './tools.js';

describe('summarizeAgentResults', () => {
  it('should return an empty string when results array is empty', () => {
    assert.strictEqual(summarizeAgentResults([]), '');
  });

  it('should handle undefined input by using the default parameter', () => {
    assert.strictEqual(summarizeAgentResults(), '');
  });

  it('should format a single result correctly', () => {
    const results = [{ agentName: 'Agent A', output: 'Output A' }];
    assert.strictEqual(summarizeAgentResults(results), '### Agent A\nOutput A');
  });

  it('should format multiple results separated by double newlines', () => {
    const results = [
      { agentName: 'Agent A', output: 'Output A' },
      { agentName: 'Agent B', output: 'Output B' }
    ];
    assert.strictEqual(summarizeAgentResults(results), '### Agent A\nOutput A\n\n### Agent B\nOutput B');
  });

  it('should gracefully handle missing properties', () => {
    const results = [
      { agentName: 'Agent A' }, // missing output
      { output: 'Output B' }    // missing agentName
    ];
    assert.strictEqual(
      summarizeAgentResults(results),
      '### Agent A\nundefined\n\n### undefined\nOutput B'
    );
  });
});
