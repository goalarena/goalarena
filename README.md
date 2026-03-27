# ⚽ GoalArena — Live Football Scores, News & Highlights

GoalArena is a professional football platform providing live scores, match results, fixtures, transfer news, league standings, and video highlights.

🌐 **Live Site**: [goalarena.lovable.app](https://goalarena.lovable.app)

---

## 🚀 Features

- **Live Scores** — Real-time match updates across all major leagues
- **Match Details** — Lineups, events, statistics, and H2H records
- **News** — Breaking football news with category filtering
- **Transfers** — Latest rumours and confirmed deals
- **Highlights** — YouTube-integrated match highlights with in-app playback
- **Leagues** — Standings, fixtures, and results
- **Dark/Light Mode** — Full theme support
- **PWA Ready** — Installable as a mobile app
- **GDPR Compliant** — Cookie consent with granular preferences

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| State | Zustand, TanStack React Query |
| Animation | Framer Motion |
| Backend | Supabase |
| Edge Functions | Deno |
| Data Source | API-Football via backend proxy |

---

## 📁 Project Structure

```
src/
├── assets/          # Logo, icons, images
├── components/
│   ├── common/      # SearchModal, CookieConsent, LoadingStates
│   ├── highlights/  # VideoCard, VideoModal, FeaturedVideo
│   ├── layout/      # Navbar, Footer, MobileBottomNav, AppLayout
│   ├── live/        # MatchCard
│   └── ui/          # shadcn/ui components
├── hooks/           # useAuth, useFootballData, useHighlights
├── integrations/    # Supabase client & types
├── lib/             # API helpers, utils
├── pages/           # All route pages
├── store/           # Zustand global store
└── types/           # TypeScript type definitions

supabase/
├── config.toml
└── functions/
    ├── football-api/    # API-Football proxy with caching
    ├── generate-news/   # AI news generation
    └── youtube-search/  # Highlights search
```

---

## ⚙️ Environment Variables

### Frontend (`.env`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Edge Function Secrets

| Secret | Description |
|--------|------------|
| `API_FOOTBALL_KEY` | API key from [api-football.com](https://www.api-football.com/) |

---

## 🏃 Running Locally

```bash
git clone https://github.com/YOUR_USERNAME/goalarena.git
cd goalarena
npm install
# Create .env with your Supabase credentials
npm run dev
# Open http://localhost:5173
```

---

## 🚢 Deployment

```bash
npm run build
# Deploy dist/ to Vercel, Netlify, Cloudflare Pages, etc.
```

For self-hosting you need a Supabase project with the database tables and edge functions deployed.

---

## 📱 Native Android (Capacitor)

```bash
npm install @capacitor/core @capacitor/cli
npx cap init GoalArena com.goalarena.app --web-dir dist
npm install @capacitor/android
npx cap add android
npm run build && npx cap sync
npx cap open android
```

---

## 🔐 Admin Setup

1. Register a regular account
2. Run in your database:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_UUID', 'admin');
```
3. Access `/admin`

---

## 📄 Legal

`/privacy` · `/terms` · `/contact` · `/about`

---

Built with ❤️ by GoalArena Team
