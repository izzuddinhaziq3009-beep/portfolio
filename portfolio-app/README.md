# Haziq — Developer Portfolio

A single-page developer portfolio built with **Angular 18** (standalone
components, no NgModules) and **Angular Material** as the only UI library.

## Stack

- Angular 18 (standalone components + built-in control flow)
- Angular Material (M3 theme, light/dark mode)
- SCSS
- Angular animations for lightweight scroll-reveal effects

## Getting started

```bash
npm install
ng serve
```

Then open [http://localhost:4200](http://localhost:4200). The app reloads
automatically as you edit files.

## Editing content

**All editable content lives in one file:** [`src/app/portfolio-data.ts`](src/app/portfolio-data.ts).

It exports a single typed `portfolioData` object covering every section —
nav links, hero copy, about bio, experience timeline, projects, skills, and
contact details. Update the values there; you should never need to touch
component code to change what's on the page.

```ts
export const portfolioData: PortfolioData = {
  hero: { name: 'Haziq', title: 'Full-Stack Developer', /* ... */ },
  experience: [ /* add more roles here — it's an array */ ],
  projects: [ /* add/remove project cards here */ ],
  // ...
};
```

A few things to know:

- **Layout**: the page is a sticky left profile card (`hero.name`,
  `hero.tagline`, photo, `contact.socials`) next to a scrolling right column
  (Hero → Stats → Feature tiles → Projects → Experience → Stack → About →
  Certificates → Contact). On mobile the card stacks on top.
- **Stats row**: top-level `stats: StatEntry[]` — 3 honest, editable numbers
  (not inflated "years of experience" claims). Can have any number of entries.
- **Feature tiles**: top-level `featureTiles: FeatureTile[]` — the two
  callout links under the stats row; each just needs a `label` and the
  `fragment` (section id) it scrolls to.
- **Stack**: `stack: StackEntry[]` — flat list of technologies, each with a
  `name` + short `role` label and an optional `logoUrl` (falls back to a
  monogram if omitted or broken).
- **Experience, Certificates & Projects** are arrays — add or remove entries
  freely, the layout adapts automatically.
- **Contact form** is a client-only Angular reactive form (name, email,
  message, all validated). On submit it opens a pre-filled `mailto:` link
  to the address in `portfolioData.contact.email` — there is no backend.

## Project structure

```
src/app/
  portfolio-data.ts        # <-- all editable content
  core/                    # theme + active-section services
  directives/              # scroll-reveal & section-observer directives
  animations/              # shared Angular animation trigger
  sections/                # one standalone component per page section
    navbar/ hero/ about/ experience/ projects/ skills/ contact/ footer/
```

## Build

```bash
ng build
```

Output goes to `dist/portfolio-app/browser`. This has been verified to build
cleanly with no errors or budget warnings.

## Deployment

The app builds to static files, so any static host works.

### Vercel

```bash
npm i -g vercel
vercel --cwd .
```

Vercel auto-detects Angular; if prompted, set the output directory to
`dist/portfolio-app/browser`.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --dir=dist/portfolio-app/browser --prod
```

Or connect the repo in the Netlify dashboard with:
- Build command: `ng build`
- Publish directory: `dist/portfolio-app/browser`

### GitHub Pages

```bash
npm install -g angular-cli-ghpages
ng build --base-href "https://<username>.github.io/<repo-name>/"
npx angular-cli-ghpages --dir=dist/portfolio-app/browser
```

## Testing

```bash
ng test
```

Runs unit tests via Karma/Jasmine.
