export const MIN_NOTES = 20;
export const MAX_NOTES = 10000;
export function notesError(notes) {
  return typeof notes !== 'string' || notes.trim().length < MIN_NOTES || notes.length > MAX_NOTES
    ? 'Enter at least 20 non-padding characters and at most 10,000 characters of study notes.' : '';
}

const messages = {
  400: 'Check your notes: enter at least 20 characters and at most 10,000.',
  413: 'Use at most 10,000 characters of notes.',
  429: 'The AI request limit was reached. Please wait and try again.',
  502: 'The AI could not create a valid study set. Please try again.',
  503: 'Generation is unavailable. Check server/.env and restart the backend.',
  504: 'Generation took too long. Please try again.'
};
const text = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 2000;
export function validStudyData(data) {
  const list = items => Array.isArray(items) && items.length > 0 && items.length <= 10 &&
    items.every(item => item && Number.isInteger(item.id) && item.id > 0 && text(item.question)) &&
    new Set(items.map(item => item.id)).size === items.length;
  return list(data?.flashcards) && list(data?.quiz) &&
    data.flashcards.every(card => text(card.answer)) &&
    data.quiz.every(question => Array.isArray(question.options) && question.options.length === 4 &&
      question.options.every(text) && new Set(question.options.map(option => option.trim().toLowerCase())).size === 4 &&
      Number.isInteger(question.correctAnswer) && question.correctAnswer >= 0 && question.correctAnswer <= 3);
}

// Every attempt gets an ID. Superseded requests cannot update any React state.
export function createGenerationClient({ onState, onSuccess, fetchImpl = fetch, timeoutMs = 130000 }) {
  let sequence = 0;
  let active;
  let lastNotes;
  let disposed = false;
  async function generate(notes) {
    if (disposed) return;
    const id = ++sequence;
    active?.abort();
    const validation = notesError(notes);
    if (validation) { onState({ isLoading: false, error: validation }); return; }
    lastNotes = notes;
    const controller = new AbortController();
    active = controller;
    onState({ isLoading: true, error: '' });
    let timer;
    let timedOut = false;
    const cancelled = new Promise((_, reject) => {
      controller.signal.addEventListener('abort', () => reject(new Error('Cancelled')), { once: true });
      timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    });
    try {
      const operation = (async () => {
        const response = await fetchImpl('/api/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes }), signal: controller.signal
        });
        if (!response.ok) throw new Error(messages[response.status] || 'Generation failed. Please try again later.');
        const data = await response.json().catch(() => null);
        if (!validStudyData(data)) throw new Error('The server returned an invalid study set. Please try again.');
        return data;
      })();
      const data = await Promise.race([operation, cancelled]);
      if (id !== sequence || disposed) return;
      onSuccess(data);
      onState({ isLoading: false, error: '' });
    } catch (error) {
      if (id !== sequence || disposed) return;
      onState({ isLoading: false, error: timedOut ? messages[504] : error instanceof TypeError
        ? 'Cannot reach the server. Check your connection and that the backend is running.' : error.message });
    } finally {
      clearTimeout(timer);
      if (id === sequence) active = undefined;
    }
  }
  return {
    generate,
    retry: () => lastNotes !== undefined && generate(lastNotes),
    dispose() { disposed = true; ++sequence; active?.abort(); }
  };
}
