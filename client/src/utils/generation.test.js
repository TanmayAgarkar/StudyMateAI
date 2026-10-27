import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGenerationClient, notesError, validStudyData } from './generation.js';
const notes = 'React builds interactive user interfaces.';
const study = { flashcards: [{ id: 1, question: 'What?', answer: 'React' }], quiz: [{ id: 1, question: 'Which?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 }] };
const response = data => ({ ok: true, json: async () => data });
function setup(fetchImpl, timeoutMs) {
  const states = [], successes = [];
  const client = createGenerationClient({ fetchImpl, timeoutMs, onState: state => states.push(state), onSuccess: data => successes.push(data) });
  return { client, states, successes };
}
test('validates boundaries consistently, including padding', () => {
  for (const value of ['', ' ', 'x'.repeat(19), 'x'.repeat(10001), null, ' '.repeat(30) + 'short']) assert.ok(notesError(value));
  for (const value of ['x'.repeat(20), 'x'.repeat(10000)]) assert.equal(notesError(value), '');
});
test('validates data before rendering, including duplicate IDs', () => {
  assert.equal(validStudyData(study), true);
  for (const data of [null, {}, { ...study, flashcards: [...study.flashcards, ...study.flashcards] }, { ...study, quiz: [{ ...study.quiz[0], correctAnswer: 4 }] }]) assert.ok(!validStudyData(data));
});
test('loading, success, and invalid input without network request', async () => {
  const { client, states, successes } = setup(async () => response(study));
  await client.generate('short');
  assert.equal(successes.length, 0);
  await client.generate(notes);
  assert.equal(states.at(-2).isLoading, true);
  assert.deepEqual(states.at(-1), { isLoading: false, error: '' });
  assert.deepEqual(successes, [study]);
});
test('network error and explicit retry use the same submitted notes', async () => {
  let calls = 0;
  const { client, states, successes } = setup(async (_url, init) => {
    assert.equal(JSON.parse(init.body).notes, notes);
    if (++calls === 1) throw new TypeError('network');
    return response(study);
  });
  await client.generate(notes);
  assert.match(states.at(-1).error, /Cannot reach/);
  await client.retry();
  assert.equal(calls, 2);
  assert.equal(successes.length, 1);
});
test('maps HTTP failures without displaying raw server errors', async () => {
  for (const status of [400, 413, 429, 500, 502, 503, 504]) {
    const { client, states } = setup(async () => ({ ok: false, status, json: async () => ({ error: 'secret' }) }));
    await client.generate(notes);
    assert.ok(states.at(-1).error);
    assert.ok(!states.at(-1).error.includes('secret'));
  }
});
test('rejects malformed JSON and invalid success responses', async () => {
  for (const reply of [response({}), { ok: true, json: async () => { throw new SyntaxError('secret'); } }]) {
    const { client, states, successes } = setup(async () => reply);
    await client.generate(notes);
    assert.match(states.at(-1).error, /invalid study set/);
    assert.equal(successes.length, 0);
  }
});
test('timeout aborts even an uncooperative fetch and ignores its late success', async () => {
  let finish, signal;
  const { client, states, successes } = setup((_url, init) => { signal = init.signal; return new Promise(resolve => { finish = resolve; }); }, 10);
  await client.generate(notes);
  assert.equal(signal.aborted, true);
  assert.match(states.at(-1).error, /too long/);
  finish(response(study));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(successes.length, 0);
});
test('older successes, failures, and cleanup cannot overwrite a newer request', async () => {
  for (const rejectOld of [false, true]) {
    let finish, fail, oldSignal, calls = 0;
    const { client, states, successes } = setup((_url, init) => {
      if (++calls === 1) { oldSignal = init.signal; return new Promise((resolve, reject) => { finish = resolve; fail = reject; }); }
      return Promise.resolve(response(study));
    });
    const first = client.generate(notes);
    await client.generate(notes + ' New notes.');
    const count = states.length;
    if (rejectOld) fail(new TypeError('old failure')); else finish(response(study));
    await first;
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(oldSignal.aborted, true);
    assert.equal(states.length, count);
    assert.equal(successes.length, 1);
    client.dispose();
  }
});
test('unmount cancellation suppresses all subsequent state updates', async () => {
  const { client, states, successes } = setup(() => new Promise(() => {}));
  const pending = client.generate(notes);
  client.dispose();
  await pending;
  assert.equal(states.length, 1);
  assert.equal(successes.length, 0);
});
