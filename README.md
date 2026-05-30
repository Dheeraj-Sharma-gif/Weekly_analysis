# Founder's Weekly Tracker

A Vite + React app for running a weekly founder task board with archive and team management views.

## Project structure

- `src/pages`: route-level screens
- `src/components/tracker`: tracker-specific UI
- `src/components/ui`: shared UI primitives
- `src/lib/tracker`: local storage data model and date helpers
- `src/hooks`: reusable React hooks

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run check
```

## Vercel deployment

This repository is configured for a standard Vercel static deployment:

- install command: `npm install`
- build command: `npm run build`
- output directory: `dist`
- SPA rewrites: handled in `vercel.json`

On Vercel, import the repository as a Vite project and keep the detected root directory at the repository root.
