# IEFA Portal — Frontend

A full-featured Islamic Finance & Economics Association portal built with React 19, TypeScript, and Vite.

## Tech Stack

- **React 19** — UI library
- **TypeScript** — Type safety
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Utility-first CSS framework
- **shadcn/ui** (Radix UI) — Accessible component library
- **Framer Motion** — Page and UI animations
- **React Router DOM v7** — Client-side routing
- **TanStack React Query v5** — Server-state management and data fetching
- **Axios** — HTTP client
- **Zustand** — Lightweight client-state management
- **Tiptap** — Rich-text editor (community discussions)
- **Recharts & Nivo** — Data visualisation charts
- **Lucide React** — Icon library
- **Vitest + Testing Library** — Unit testing

## Getting Started

### Prerequisites

- Node.js v18 or higher
- [pnpm](https://pnpm.io/) (recommended) — `npm install -g pnpm`

### Installation

```bash
pnpm install
```

### Development server

```bash
pnpm dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
pnpm build
```

Output is written to `dist/`.

### Preview production build

```bash
pnpm preview
```

### Run tests

```bash
pnpm test          # single run
pnpm test:watch    # watch mode
```

## Project Structure

```
src/
├── App.tsx                    # Root router and layout wiring
├── main.tsx                   # Application entry point
├── style.css                  # Global styles (Tailwind)
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── layout/                # MainLayout, Header, Sidebar, Footer
│   ├── admin/                 # AdminLayout, AdminSidebar, AdminHeader
│   ├── community/             # Discussion modals and profile popups
│   ├── learning/              # Course explorer dialog
│   └── resources/             # Resource cards, filters, preview
├── pages/
│   ├── Login, Signup, ForgotPassword, ResetPassword
│   ├── Questionnaire          # Onboarding flow
│   ├── Dashboard
│   ├── News
│   ├── MarketInsights, GlobalIslamicMarket
│   ├── Academy, CourseResults
│   ├── Community
│   ├── Directory, IFProfessionals
│   ├── Resources, ResearchReports
│   ├── Data
│   ├── Podcast
│   ├── Notifications, Profile, Settings, Support
│   ├── tools/                 # ZakatCalculator, HalalStockScreening, HalalCryptoScreening
│   └── admin/                 # Full admin panel (users, content, settings)
├── hooks/                     # Feature-level data hooks (useNews, useLearning, …)
├── lib/                       # API client (axios), service modules, utils
├── contexts/                  # AuthContext, AdminAuthContext
├── stores/                    # Zustand stores (auth)
└── types/                     # Shared TypeScript types
```

## Features

### User-facing
| Area | Description |
|---|---|
| Auth | Login, signup, forgot/reset password, onboarding questionnaire |
| Dashboard | Personalised overview |
| News | Islamic finance news feed |
| Market Insights | Market data and analysis |
| Global Islamic Market | Regional market explorer |
| Academy | Courses, learning paths, progress tracking |
| Community | Threaded discussions with rich-text posting |
| IF Professionals Directory | Searchable professional directory |
| Resources | Downloadable documents, glossary, filters |
| Research Reports | Academic and industry research |
| Data | Interactive datasets and charts |
| Podcast | Episode listing and playback |
| Tools | Zakat Calculator, Halal Stock Screening, Halal Crypto Screening |

### Admin panel (`/admin`)
User management, content moderation for News, Podcasts, Learning, Academy, Resources, Data, Community, Directory, and IF Professionals.

## Configuration files

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS configuration |
| `components.json` | shadcn/ui CLI configuration |
| `vitest.config.ts` | Vitest test configuration |
| `vercel.json` | Vercel deployment configuration |

## License

MIT
# IEFA-Portal
