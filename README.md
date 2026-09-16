# Sahayak

Voice-first companion for people living with dementia, plus a caregiver portal.
Smart India Hackathon 2026, Problem Statement 26003.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 — use **Load demo family (Guwahati)** on the login screen for a full walkthrough.

## Notes

- Auth and data are local (browser storage). Not a clinical product.
- Hindi and Assamese UI strings are machine-assisted drafts pending native review.
- House map is a static stub; the caregiver map editor was cut for the MVP.
- Voice uses the browser Web Speech API (best in Chrome / Edge).
