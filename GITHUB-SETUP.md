# Publish StudyMate AI on GitHub

The submission copy is a local Git repository. Publication is still pending; no remote repository was created during preparation.

## Create an empty repository

1. Sign in to your GitHub account.
2. Create a repository named `StudyMateAI`.
3. Choose visibility appropriate for your assignment. Public allows evaluators to view it without an invitation; private requires inviting them.
4. Leave automatic README, license, and .gitignore creation unchecked.
5. Copy the repository HTTPS URL.

## Push the prepared project

Open a terminal inside this submission copy. If you move the folder, use its new path. Run `git status` first to confirm you are in the prepared repository.

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/StudyMateAI.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your account name. If origin already exists, inspect `git remote -v` before changing anything. Complete GitHub authentication when prompted. Do not paste a password or token into source files or command history.

If the local repository has no commit yet, run these before pushing:

```powershell
git add .
git diff --cached --name-only
git commit -m "Prepare StudyMate AI submission"
```

The staged list should contain source, tests, lockfiles, documentation, and `.env.example`. It must not contain `.env`, node_modules, dist, backups, or credentials.

## Verify after upload

- Open the repository and confirm the README displays.
- Confirm `server/.env` is absent.
- Open the Actions tab and inspect the Checks workflow. Local checks do not prove the hosted workflow has passed.
- Follow the README setup instructions from a fresh clone.
- Record your required demo and submit the repository URL.

GitHub Pages alone cannot run this Express backend. Publishing source and deploying a live application are separate steps.
