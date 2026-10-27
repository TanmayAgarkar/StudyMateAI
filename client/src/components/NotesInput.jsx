import { useState } from "react";
import { notesError } from "../utils/generation";

function NotesInput({ onGenerate, isLoading, error, onRetry }) {
  const [notes, setNotes] = useState("");

  const validation = notesError(notes);

  function handleSubmit(event) {
    event.preventDefault();

    if (isLoading || validation) {
      return;
    }

    onGenerate(notes);
  }

  return (
    <section className="input-card">
      <div className="section-heading">
        <span className="eyebrow">START LEARNING</span>
        <h2>What would you like to study?</h2>
        <p>
          Paste your notes or enter a topic to create
          interactive study material.
        </p>
      </div>

      <form onSubmit={handleSubmit} aria-busy={isLoading}>
        <label htmlFor="study-notes">
          Your study notes
        </label>

        <textarea
          id="study-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Example: React is a JavaScript library used for building interactive user interfaces..."
          rows={7}
          maxLength={10000}
          disabled={isLoading}
          aria-describedby="notes-validation generation-status"
          aria-invalid={Boolean(notes && validation)}
          required
        />

        <p id="notes-validation">{validation || "Notes are ready to generate."}</p>
        <div className="input-footer">
          <span>{notes.length} / 10000 characters</span>

          <button
            className="primary-button"
            type="submit"
            disabled={isLoading || validation}
          >
            {isLoading ? "Creating your study set…" : "✨ Generate Study Material"}
          </button>
        </div>
        <p id="generation-status" role="status" aria-live="polite">
          {isLoading ? "Turning your notes into flashcards and questions. This may take up to two minutes." : ""}
        </p>
        {error && <div><p className="generation-error" role="alert">{error}</p><button className="secondary-button" type="button" onClick={onRetry} disabled={isLoading}>Retry generation</button></div>}
        <p className="generation-hint">Your notes are sent to Google Gemini to create study material. AI can make mistakes; check answers against your notes.</p>
      </form>
    </section>
  );
}

export default NotesInput;
