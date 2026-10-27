# StudyMate AI

Turn your study notes into interactive flashcards and a practice quiz using Google Gemini.

Repository: https://github.com/TanmayAgarkar/StudyMateAI

## Features

- AI-generated flashcards with flip, previous, and next controls.
- Multiple-choice quizzes, scores, retry incorrect answers, and restart.
- Responsive layout and keyboard-accessible controls.
- Loading messages, explicit retry, request cancellation, and stale-response protection.
- Input validation and Zod validation of generated content.
- Server-only API key and safe error messages.

## Technology

React + Vite, plain CSS, Node.js + Express, Gemini REST API, Zod, Node test runner, and Oxlint.

## Requirements

Use Node.js 22.21 or a compatible newer version, npm, and a Gemini API key with access to your chosen model. Node 22.21 and npm 10.9 were used locally. Git is needed to publish the repository.

## Setup on Windows

Download or clone this repository, then open a terminal in its root folder. The examples below assume `D:\StudyMateAI`; use your actual folder if different.

### 1. Install dependencies

```powershell
cd D:\StudyMateAI\server
npm ci
cd ..\client
npm ci
```

### 2. Configure the backend

```powershell
cd D:\StudyMateAI\server
Copy-Item .env.example .env
notepad .env
```

Set these values in the local file:

```dotenv
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
PORT=3001
```

The example model is the model last verified during Module 4. Availability depends on your Gemini account; change it if needed. Never put the key in React, a `VITE_` variable, a screenshot, or a Git commit. `.env` is ignored; `.env.example` contains no key. Restart the backend after changing configuration.

### 3. Start both processes

Terminal 1:

```powershell
cd D:\StudyMateAI\server
npm run dev
```

Terminal 2:

```powershell
cd D:\StudyMateAI\client
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Keep both terminals running. Vite forwards `/api` requests to `http://127.0.0.1:3001`.

If you change the backend port, update the target in `client/vite.config.js` as well.

## How to use it

1. Paste notes with at least 20 characters after removing surrounding whitespace and no more than 10,000 total characters.
2. Select **Generate Study Material** and wait for generation.
3. Flip through the flashcards, then select **Practice Quiz**.
4. Answer each question and submit to view your score.
5. Retry incorrect answers or restart the quiz.

The prompt asks for five cards and five questions. Validation accepts 1–10 items in each collection. Questions require four distinct options and a zero-based answer index. The server assigns unique IDs after validating Gemini output. Generated answers can be inaccurate; compare them with your notes.

## Project structure

```text
client/
  src/
    components/       Notes, flashcards, quiz, and results
    utils/            Request handling, validation, quiz helpers, tests
    App.jsx           Main application state
    App.css           Responsive visual styles
  vite.config.js      Local API proxy
server/
  index.js            Environment loading and server startup
  app.js              API route and safe error handling
  schema.js           Gemini JSON Schema and local Zod validation
  app.test.js         Backend tests with simulated Gemini responses
  .env.example        Safe configuration example
.github/workflows/
  ci.yml              Tests, lint, and build on GitHub
```

## API

`GET /api/health` returns `{ "status": "ok" }`.

`POST /api/generate` accepts `{ "notes": "Your study notes, at least 20 characters." }` and returns:

```json
{
  "flashcards": [{ "id": 1, "question": "What is React?", "answer": "A UI library." }],
  "quiz": [{ "id": 1, "question": "What does React build?", "options": ["User interfaces", "Databases", "Networks", "Operating systems"], "correctAnswer": 0 }]
}
```

Error responses use `{ "error": "A safe explanation." }`. Statuses include 400 for invalid input/JSON, 413 for oversized requests, 429 for provider rate limits, 502 for invalid output or provider failure, 503 for configuration failures, and 504 for provider timeout. The backend waits up to 120 seconds; the browser waits up to 130 seconds. Retry starts a new request and can consume additional API quota.

## Tests and production build

From the server folder:

```powershell
npm test
```

From the client folder:

```powershell
npm test
npm run lint
npm run build
```

Tests use simulated Gemini responses, so they do not need an API key or consume quota. Backend tests create temporary local HTTP servers; restricted environments may block them. Build output is written to `client/dist`.

The Vite development proxy is configured for `npm run dev`. `npm run preview` previews the static build and is not an end-to-end production deployment. Hosting requires serving the frontend and routing `/api` to the backend. Before exposing the API publicly, add authentication, rate limiting, and deployment-specific configuration.

## Troubleshooting

| Symptom | Action |
|---|---|
| Cannot reach server | Start the backend and check the proxy port. |
| Generation unavailable | Verify the key and model in `server/.env`; restart the backend. |
| Request limit reached | Wait, then check Gemini quota and account billing settings. |
| Invalid study set | Try clearer notes and retry. Invalid output is intentionally rejected. |
| Generation timed out | Try shorter notes or retry later. |
| Port already in use | Close the old development process or choose another port. |
| Changes seem missing | Confirm your terminals point at the copy you are editing. |

## Submission

See [GITHUB-SETUP.md](GITHUB-SETUP.md) for publication steps and [UI-REVIEW.md](UI-REVIEW.md) for review status and final checks. Include the repository URL and your required demo recording in your assignment submission. A GitHub repository does not automatically host the working Express backend.

