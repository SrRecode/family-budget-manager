# Family Budget Manager

A local-first family budget and expense manager PWA built with React, TypeScript, Vite, Tailwind CSS, and IndexedDB (Dexie). Track income and expenses, set monthly budgets, save toward goals, and visualize spending — all stored locally on your device.

## Features

- **Income & Expense Tracking** — Add, edit, and delete transactions with categories, amounts, dates, and descriptions
- **Monthly Budgets** — Set spending limits per category and track progress at a glance
- **Savings Goals** — Create goals with target amounts, deadlines, and visual progress bars
- **Reports** — 6-month income vs expense bar charts, category breakdowns, and monthly summary tables
- **CSV Export** — Export all transaction data for external analysis
- **Local-First** — All data stored in IndexedDB on your device; works fully offline
- **Dark Mode** — Automatic dark/light theme via CSS custom properties
- **Responsive** — Mobile-first design that works on any screen size

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS v4 |
| Database | IndexedDB via Dexie |
| Routing | React Router v7 |
| Build | Vite |
| Deployment | Netlify |

## Getting Started

### Prerequisites

- Node.js 22 or newer
- npm

### Installation

```bash
git clone https://github.com/SrRecode/family-budget-manager.git
cd family-budget-manager
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
family-budget-manager/
├── .github/workflows/showcase.yml   # CI pipeline for automated screenshots
├── e2e/
│   └── showcase.spec.ts             # Playwright screenshot capture
├── public/
├── scripts/
│   └── generate-assets.mjs          # Showcase asset generator
├── src/
│   ├── components/
│   │   └── Layout.tsx               # App shell with navigation
│   ├── db/
│   │   └── database.ts              # Dexie IndexedDB setup
│   ├── pages/
│   │   ├── Dashboard.tsx            # Summary cards, spending charts
│   │   ├── Transactions.tsx         # Full transaction CRUD
│   │   ├── Budgets.tsx              # Monthly budget management
│   │   ├── Savings.tsx              # Savings goals with progress
│   │   └── Reports.tsx              # Charts and CSV export
│   ├── types/
│   │   └── index.ts                 # TypeScript types and constants
│   ├── App.tsx                      # Router setup
│   ├── index.css                    # Tailwind + design tokens
│   └── main.tsx                     # Entry point
├── index.html
├── package.json
├── project.json                     # Showcase metadata
├── tsconfig.json
└── vite.config.ts
```

## Data Model

### Transaction
| Field | Type | Description |
|---|---|---|
| id | string | UUID |
| type | 'income' \| 'expense' | Transaction type |
| amount | number | Amount in local currency |
| category | string | Category from predefined list |
| description | string | Optional description |
| date | string | ISO date (YYYY-MM-DD) |
| createdAt | number | Unix timestamp |

### Budget
| Field | Type | Description |
|---|---|---|
| id | string | UUID |
| category | string | Expense category |
| limit | number | Monthly limit amount |
| month | string | Month (YYYY-MM) |
| createdAt | number | Unix timestamp |

### Savings Goal
| Field | Type | Description |
|---|---|---|
| id | string | UUID |
| name | string | Goal name |
| targetAmount | number | Target savings amount |
| currentAmount | number | Current saved amount |
| deadline | string | Target date |
| createdAt | number | Unix timestamp |

## Design Decisions

- **Local-first**: All data lives in IndexedDB — no account, no server, no data leaves the device
- **No AI slop UI**: Purposeful, dense interface with clear visual hierarchy — no purple gradients or decorative blobs
- **Category-based budgeting**: Simple per-category monthly limits that anyone can understand
- **Offline-ready**: Works without internet once loaded; installable as PWA

## Development

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run showcase:test` | Run Playwright screenshot tests |
| `npm run showcase:generate` | Generate showcase assets (README, LinkedIn, card) |

## Contributing

This is a personal portfolio project. Issues and suggestions are welcome.

## License

MIT
