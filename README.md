# Independent Mandate – voter app (frontend)

Digital voting prep app: register, find your station, learn how to vote, practise on screen. Voting itself happens on company-managed tablets (separate app). No paper ballots.

## Files
| File | What it does |
|---|---|
| `index.html` | All screens and markup (Tailwind via CDN) |
| `styles.css` | Shared styles and animation |
| `app.js` | Navigation, languages, registration, stations, guide, practice ballot |
| `accessibility.js` | Read aloud, speed, larger text, high contrast |
| `chatbot.js` | "I'am okay" helper (rule-based; set `API_URL` for a real backend later) |
| `binance.js` | Verify results on BNB Chain (read-only) |
| `logo.jpg` | Logo |
| `how-to-vote.mp4`, `how-to-vote-sasl.mp4` | Guide videos (add these) |

## Run locally
Open the folder in VS Code and start Live Server on `index.html`. Needs internet (Tailwind CDN).

## Videos
Name them `how-to-vote.mp4` and `how-to-vote-sasl.mp4` in the project root. GitHub blocks files over 100 MB, so compress first:
`ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow -acodec aac -b:a 96k how-to-vote.mp4`
Or host on YouTube (unlisted) and swap the `<video>` for an embed.

## Deploy on GitHub Pages
1. Create a repo on GitHub (e.g. `independent-mandate`).
2. In this folder: `git init`, `git add .`, `git commit -m "First version"`, `git branch -M main`, `git remote add origin <repo-url>`, `git push -u origin main`.
3. Repo → Settings → Pages → Source: "Deploy from a branch" → `main` / `(root)` → Save.
4. Your site appears at `https://<username>.github.io/<repo>/` after a minute.
5. Add teammates under Settings → Collaborators.

## Team workflow
Work on a branch (`git checkout -b feature/name`), open a Pull Request, get one review, then merge to `main`. Pages redeploys on every merge.

## Notes
- Demo data only (voter, stations, countdown). Replace in `app.js` (`CONFIG`, `STATIONS`).
- Never commit API keys, wallet keys or real voter data. Publishing results on BNB Chain must be done by the company's backend, not this frontend.
- Only a fingerprint of aggregate results should ever go on a public chain, never identities or individual votes.
- Race, gender and disability answers are sensitive personal information (POPIA). Keep them optional and store them securely.
