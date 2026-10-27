# StudyMate AI on GitHub

Repository: https://github.com/TanmayAgarkar/StudyMateAI

The prepared application, README, tests, and workflow are published on `main`. Environment secrets, dependencies, builds, and backup folders are excluded.

## Work from a fresh clone

```powershell
git clone https://github.com/TanmayAgarkar/StudyMateAI.git
cd StudyMateAI
```

Follow the root README to install dependencies, create your local `server/.env`, and start both processes. Keep your existing D:\StudyMateAI folder until you have verified the clone. The original project folder was not modified by Module 6.

The submission copy was published through the GitHub connector, which created remote commit history independently from its initial local commit. Use a fresh clone for future pushes; do not force-push the older local history.

## Publish future changes

From your fresh clone:

```powershell
git status
git add .
git diff --cached --name-only
git commit -m "Describe your change"
git push
```

Inspect the staged file list before committing. It should contain source, tests, lockfiles, documentation, and `.env.example`. It must not contain `.env`, node_modules, dist, backups, or credentials.

## Submission checks

- Confirm the README displays on GitHub.
- Confirm `server/.env` is absent.
- Inspect the Checks workflow in the Actions tab.
- Follow the README setup steps from a fresh clone.
- Complete the manual UI checks in UI-REVIEW.md and record the required demo.
- Submit the repository URL and demo recording.

GitHub Pages alone cannot run this Express backend. Publishing source and deploying a live application are separate steps.
