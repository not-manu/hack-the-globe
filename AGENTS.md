# AGENTS.md — ScrapYard (Hack the Globe 2026)

Construction surplus materials marketplace with carbon accounting.
Hackathon project for Hack the Globe 2026 (Sustainable Infrastructure theme).

## Project Structure

```
hack-the-globe/
  scrapyard/          # PRIMARY APP — React 19 + Vite 8 (JavaScript/JSX)
    src/
      components/     # Shared components (Layout, Logo)
      pages/          # Route-level page components
      data/           # Mock data (listings.js)
      assets/         # Static assets
    package.json
    eslint.config.js
    vite.config.js
  web/                # UNUSED — Next.js 16 scaffold (TypeScript, do not develop here)
  docs/               # Hackathon guides, brainstorming, research
  .agents/skills/     # Convex agent skill definitions (not yet integrated)
```

All active development happens in `scrapyard/`. The `web/` directory is an unused scaffold.

## Build / Lint / Dev Commands

Package manager: **Bun**

```bash
# Install dependencies
cd scrapyard && bun install

# Development server
bun run dev

# Production build
bun run build

# Lint (ESLint 9 flat config)
bun run lint

# Preview production build
bun run preview
```

There is **no test framework** configured. No `test` script exists.
There is **no Prettier** configured. No formatting tool beyond ESLint.

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Language    | JavaScript (JSX) — no TypeScript    |
| Framework   | React 19.2 + Vite 8                |
| Routing     | react-router-dom 7 (BrowserRouter) |
| Icons       | lucide-react                        |
| Styling     | Vanilla CSS + CSS custom properties |
| Backend     | None (all data is hardcoded mocks)  |
| Pkg manager | Bun                                 |

## ESLint Configuration

- Flat config format (ESLint 9) in `scrapyard/eslint.config.js`
- Extends: `@eslint/js` recommended, `react-hooks` flat, `react-refresh` vite
- `no-unused-vars`: error, but ignores vars matching `^[A-Z_]` (PascalCase and CONSTANTS)
- Targets `**/*.{js,jsx}`, ignores `dist/`

## Code Style Guidelines

### No Semicolons

The entire codebase omits semicolons. Do not add them.

### Imports

- Order: React/hooks, third-party (react-router-dom, lucide-react), local components, local data, CSS
- Single quotes for all import strings
- Destructured named imports: `import { useState, useEffect } from 'react'`
- Individual icon imports: `import { Search, Leaf, Clock } from 'lucide-react'`
- Relative paths for local modules: `'../data/listings'`, `'./components/Logo'`
- CSS imports at the end: `import './App.css'`

### Component Patterns

- **Default exports**: `export default function ComponentName() { ... }`
- **One page component per file**, using PascalCase filenames (`Home.jsx`, `ListingDetail.jsx`)
- **Sub-components** that are page-specific are defined as plain `function` declarations in the same file (not exported)
- Props are destructured in parameters: `function MaterialCard({ listing, index })`
- No prop-types, no TypeScript interfaces
- Use fragments (`<>...</>`) for page-level wrappers when no extra DOM node is needed

### Naming Conventions

| Kind                   | Convention            | Example                          |
|------------------------|-----------------------|----------------------------------|
| Components             | PascalCase            | `PostMaterial`, `ListingDetail`  |
| Files (components)     | PascalCase.jsx        | `ScanMaterial.jsx`               |
| Files (data)           | camelCase.js          | `listings.js`                    |
| State variables        | camelCase             | `searchQuery`, `activeCategory`  |
| Handler functions      | camelCase             | `startScan`, `addMockPhoto`      |
| Top-level constants    | SCREAMING_SNAKE_CASE  | `CATEGORIES`, `LISTINGS`         |
| CSS classes            | kebab-case            | `page-header`, `btn-primary`     |
| CSS custom properties  | `--kebab-case`        | `--bg-primary`, `--green`        |

### Styling

- **Inline styles** via `style={{}}` are common for one-off/dynamic styles
- **CSS custom properties** defined in `index.css` `:root` for theming (colors, radii, shadows, fonts)
- Global/reusable classes in `App.css` and `index.css`
- Animation classes: `fade-up`, with stagger pattern `fade-up stagger-${i + 1}`
- No CSS modules, no styled-components, no Tailwind in scrapyard

### State Management

- Local `useState` only — no global state (no Context, Redux, Zustand)
- Navigation: `useNavigate()` from react-router-dom
- Route params: `useParams()`
- Location: `useLocation()`

### Error Handling

- This is a prototype — error handling is minimal
- Guard clauses for missing data: `if (!listing) { return <fallback UI> }`
- Placeholder actions use `alert('Feature description (mockup)')` 
- No try/catch, no error boundaries, no loading states (except scan animation)

### JSX Patterns

- Conditional rendering: `{condition && <element>}` or ternary `{cond ? <a> : <b>}`
- List rendering: `.map((item, i) => (<JSX key={...}>))`
- Accessibility: `aria-label` on interactive elements, `role` on nav/tab elements
- Images: `loading="lazy"` attribute
- Form state pattern: `const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }))`

### Data Layer

All data is hardcoded in `scrapyard/src/data/listings.js`:
- `CATEGORIES` — array of `{ id, label, icon (emoji), count }`
- `LISTINGS` — array of listing objects with title, price, location, lat/lng, carbon stats
- `CARBON_STATS` — aggregate carbon impact metrics
- `REQUESTS` — array of material request objects

Convex is planned as the backend (agent skills are present in `.agents/skills/`) but not yet integrated.

## Routes

| Path               | Component       | Description                    |
|--------------------|-----------------|--------------------------------|
| `/`                | Home            | Search, categories, listings   |
| `/browse/:category`| Browse          | Filtered listing grid          |
| `/listing/:id`    | ListingDetail   | Single listing detail          |
| `/post`           | PostMaterial    | Multi-step post form           |
| `/scan`           | ScanMaterial    | AI material scanner (mock)     |
| `/map`            | MapView         | Map with listing pins          |
| `/carbon`         | Carbon          | Carbon impact dashboard        |
| `/profile`        | Profile         | User profile                   |
| `/request`        | RequestPage     | Post a material request        |

## Key Reminders for Agents

1. Work in `scrapyard/` — ignore `web/` unless explicitly asked
2. Use Bun, not npm/yarn
3. No semicolons in JS
4. No TypeScript in the active app
5. Run `bun run lint` after changes to catch issues
6. Keep styling consistent: CSS custom properties for theme values, inline styles for one-offs
7. New pages go in `src/pages/`, new shared components in `src/components/`
8. Register new routes in `App.jsx`
