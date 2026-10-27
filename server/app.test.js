import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';

const study = { flashcards: [{ question: 'What is React?', answer: 'A UI library.' }], quiz: [{ question: 'React builds?', options: ['UI', 'Databases', 'Networks', 'Operating systems'], correctAnswer: 0 }] };
const reply = data => ({ ok: true, json: async () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(data) }] } }] }) });
async function request(options, body = { notes: 'React is a UI library.' }, raw) {
  const server = createApp(options).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: raw ?? JSON.stringify(body) });
    return { status: res.status, data: await res.json() };
  } finally { await new Promise(resolve => server.close(resolve)); }
}
test('generates validated data and supplies key only in upstream header', async () => {
  const result = await request({ apiKey: 'test-secret', fetchImpl: async (url, init) => {
    assert.ok(!url.includes('test-secret'));
    assert.equal(init.headers['x-goog-api-key'], 'test-secret');
    const body = JSON.parse(init.body);
    assert.equal(body.generationConfig.responseMimeType, 'application/json');
    assert.ok(body.generationConfig.responseJsonSchema);
    return reply(study);
  } });
  assert.equal(result.status, 200);
  assert.equal(result.data.quiz[0].id, 1);
  assert.equal(result.data.quiz[0].correctAnswer, 0);
});
test('rejects invalid notes before calling Gemini', async () => {
  for (const notes of ['', '  ', 12, 'x'.repeat(19), ' '.repeat(30) + 'short', 'x'.repeat(10001), null]) {
    assert.equal((await request({ fetchImpl: () => assert.fail() }, { notes })).status, 400);
  }
});

test('accepts exact notes length boundaries', async () => {
  for (const size of [20, 10000]) assert.equal((await request({ apiKey: 'test', fetchImpl: async () => reply(study) }, { notes: 'x'.repeat(size) })).status, 200);
});

test('rejects malformed provider JSON, invalid shapes and missing fields safely', async () => {
  const invalid = [null, {}, { ...study, flashcards: [] }, { ...study, flashcards: [{ question: 'Missing answer' }] },
    { ...study, flashcards: [{ question: ' ', answer: 'answer' }] },
    { ...study, quiz: [{ ...study.quiz[0], options: ['A', 'B', 'C'] }] },
    { ...study, quiz: [{ ...study.quiz[0], correctAnswer: 1.5 }] },
    { ...study, flashcards: [{ ...study.flashcards[0], id: 1 }] }];
  for (const value of invalid) assert.equal((await request({ apiKey: 'secret', fetchImpl: async () => reply(value) })).status, 502);
  for (const fetchImpl of [
    async () => ({ ok: true, json: async () => { throw new SyntaxError('secret'); } }),
    async () => ({ ok: true, json: async () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{secret' }] } }] }) }),
    async () => { throw new TypeError('secret'); }
  ]) {
    const result = await request({ apiKey: 'secret', fetchImpl });
    assert.equal(result.status, 502);
    assert.ok(!JSON.stringify(result).includes('secret'));
  }
});

test('real upstream timeout covers a hanging request', async () => {
  const result = await request({ apiKey: 'secret', timeoutMs: 10, fetchImpl: (_url, init) => new Promise((_, reject) => {
    init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
  }) });
  assert.equal(result.status, 504);
});
test('handles missing key and malformed JSON', async () => {
  assert.equal((await request({})).status, 503);
  assert.equal((await request({}, {}, '{')).status, 400);
  assert.equal((await request({}, {}, JSON.stringify({ notes: 'x'.repeat(70000) }))).status, 413);
});
test('rejects invalid indexes, duplicate options, and incomplete generation', async () => {
  for (const data of [{}, { ...study, quiz: [{ ...study.quiz[0], correctAnswer: 4 }] }, { ...study, quiz: [{ ...study.quiz[0], options: ['A', 'a', 'B', 'C'] }] }]) {
    assert.equal((await request({ apiKey: 'secret', fetchImpl: async () => reply(data) })).status, 502);
  }
  assert.equal((await request({ apiKey: 'secret', fetchImpl: async () => ({ ok: true, json: async () => ({ candidates: [{ finishReason: 'MAX_TOKENS' }] }) }) })).status, 502);
});
test('sanitizes provider failures and maps timeouts', async () => {
  for (const [upstream, expected] of [[429,429], [403,503], [500,502]]) {
    const result = await request({ apiKey: 'secret', fetchImpl: async () => ({ ok: false, status: upstream }) });
    assert.equal(result.status, expected);
    assert.ok(!JSON.stringify(result).includes('secret'));
  }
  const result = await request({ apiKey: 'secret', fetchImpl: async () => { throw new DOMException('secret', 'TimeoutError'); } });
  assert.equal(result.status, 504);
  assert.ok(!JSON.stringify(result).includes('secret'));
});
