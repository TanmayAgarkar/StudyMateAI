# Module 4: StudyMate AI with Gemini

## Start the application

Requires Node.js 22 or later. Dependencies have been installed during setup.

1. Get a Gemini API key from https://aistudio.google.com/apikey.
2. Open `D:\StudyMateAI\server\.env` locally and fill in `GEMINI_API_KEY=`. Never paste the key into chat or a React file. The file is ignored by Git. Do not prefix the key with `VITE_`: Vite exposes those variables to the browser.
3. Open a terminal in `D:\StudyMateAI\server` and run `npm run dev`.
4. Open a second terminal in `D:\StudyMateAI\client` and run `npm run dev`.
5. Open the local URL Vite prints. Paste notes and click Generate Study Material.

Restart the backend after editing `.env`. `GEMINI_MODEL` selects the model; the default is `gemini-3.8-flash`. Model availability depends on your Google project. If changing `PORT`, also change the target port in `client/vite.config.js`.

## How it works

Node.js runs JavaScript outside the browser. Express receives HTTP requests and sends responses. React sends `POST /api/generate` with a JSON body such as `{"notes":"React is a library for building user interfaces."}`. Vite forwards `/api` requests to the local Express server on port 3001, so development does not need CORS configuration.

The server reads its key from `.env`, checks the notes, and calls Google's Gemini REST API using Node's built-in fetch. Only notes and instructions go in the prompt; the key goes in an authentication header. Notes are sent to Google, so avoid entering sensitive material.

The JSON Schema describes two arrays: flashcards with `question` and `answer`, and quiz questions with `question`, four `options`, and a zero-based `correctAnswer` (0 means the first option). Gemini receives the schema. Ajv checks the reply again, including text lengths and answer indexes; additional checks reject duplicate options. The server assigns unique IDs for the existing quiz scoring logic. Shape validation cannot guarantee factual accuracy: review AI answers against your notes.

React uses `isLoading` to disable repeated submissions and show progress. `error` displays a retry message. Only successful generation replaces `studyData`, resets the flashcard position, and starts a fresh quiz. A failed request keeps the previous study set and entered notes. Existing quiz scoring, restart, and retry-incorrect behavior remain in place.

## Files to understand

- `server/index.js`: loads environment variables and starts Express on localhost.
- `server/app.js`: validates requests, calls Gemini with a timeout, and returns safe JSON errors.
- `server/schema.js`: defines the output contract and validates returned data.
- `client/src/App.jsx`: requests generated content and manages loading, errors, and study state.
- `client/src/components/NotesInput.jsx`: notes form and progress/error messages.
- `client/vite.config.js`: development proxy.

## Checks and troubleshooting

Run `npm test` in `server` for automated API tests with simulated Gemini replies; these consume no credits. Run `npm run build` and `npm run lint` in `client`. Existing quiz tests run with `node --test src/utils/quizUtils.test.js`.

- Cannot connect: start both terminals and check the proxy port.
- Configuration unavailable: set the key and a supported model in server `.env`, then restart.
- Request limit: wait and check the Google project's quota.
- Invalid output or timeout: retry with clearer or shorter notes.
- HTTP 400/413: provide nonempty notes of at most 10,000 characters.

The backend returns friendly errors without provider response bodies, credentials, stack traces, or note logging. It is bound to localhost for this local assignment. Before public deployment, add authentication, rate limits, and a production reverse proxy for `/api`; Vite's development proxy does not run in a static production build.

References: https://ai.google.dev/gemini-api/docs/structured-output and https://ai.google.dev/api/generate-content.
