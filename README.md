<div align="center">

# 🌳 Rooted
**[Try Rooted Now](https://rooted-murex.vercel.app)**

### *Grow Your Impact. Nurture Your World.*

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.x-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Zustand](https://img.shields.io/badge/Zustand-5.x-orange?style=for-the-badge)](https://zustand-demo.pmnd.rs/)

**A living, breathing carbon footprint tracker — where every green choice makes your tree grow.**

</div>

---

## 🌿 What is Rooted?

Rooted is a **dark-mode-only, gamified carbon footprint awareness platform** built as an immersive web experience. Instead of cold spreadsheets and guilt-laden statistics, Rooted gives every user a **living digital tree** — a personalised botanical companion that flourishes or withers in direct response to the lifestyle choices they make every day.

Users begin with a detailed carbon footprint onboarding quiz, receive a calculated baseline score, and are then guided through daily eco-actions — cycling instead of driving, eating plant-based meals, line-drying laundry — each of which chips away at their footprint and feeds XP into their tree. Through five distinct visual growth stages, a community grove of neighbours, progressive challenges, and real-time emissions charts, Rooted transforms climate anxiety into **purposeful, joyful action**. The design philosophy is intentional: deep forest greens, warm organic shapes, and glowing Framer Motion animations make sustainability feel less like a sacrifice and more like tending a garden you genuinely love.

---

## ✨ Key Features

### 🏡 Personalised Dashboard
- **3-column responsive layout** — sidebar stats, centre tree, and emissions breakdown
- Animated **Growth Progress bar** with stage milestones (0% → 100%)
- **XP contribution breakdown** — footprint reduction, logged actions, streak bonus
- Real-time **Monthly Emissions Trend** area chart
- Collapsible **Emissions Breakdown** cards (Transport, Diet, Energy, Flights, Shopping)
- Per-category **quick-log** buttons to offset from the dashboard itself
- Recent activity feed with CO₂e savings per action

### 🌱 Onboarding Carbon Calculator
- Illustrated, multi-step quiz with custom SVG icons
- Covers: commute mode, weekly distance, diet type, home energy, flights, and shopping habits
- Calculates a precise **annual baseline footprint** using IPCC-aligned emission factors
- Beautiful sprouting animation and motivational success modal on completion

### 🌳 Animated Living Tree (SVG)
- Fully procedural SVG tree rendered with **Framer Motion**
- **5 distinct visual growth stages** with progressive trunk height, branch count, leaf density, and colour palette
- **Pollen particles** floating upward — deterministic (hydration-safe) animations
- Glowing canopy effects and sparkle overlays for the Ancient Tree stage
- Organic outer **Progress Ring** driven by footprint reduction percentage

### 📋 Action Logger
- **12 loggable eco-actions** across Transport, Food, Energy, and Waste categories
- Filterable category tabs with emoji labels
- Per-action **log count badges** (shows how many times you've done each)
- Animated success feedback with a "Logged!" confirmation state
- Running **total CO₂e offset** and today's offset stats header
- Loading skeleton cards during hydration; empty state for first-time users

### 📊 Insights & Analytics
- **Bar chart** comparing your emissions to US, EU, and Global averages (with Paris 2°C target reference line)
- **Cumulative CO₂e savings** line chart that rises as you log more choices
- Progress rings per challenge with completion status
- Detailed axis labels and Recharts tooltips styled to the dark forest theme

### 🏆 Challenges & Achievements
- Progressive challenges (e.g. *"Walk or Cycle 10 times"*, *"Log 5 plant-based meals"*)
- Visual ProgressRing per challenge with animated fill
- One-click **Resolve** button to mark completion and earn XP
- Badge gallery with unlock timestamps and hover tooltips

### 🌲 Community Grove
- Mock community of four neighbours, each with a procedurally styled mini-tree
- Animated leaf-sway with per-neighbour delay offsets
- Blossom dot indicators for high-XP neighbours
- Click-to-inspect neighbour card showing tree species, level, and annual emissions

### ⚡ Floating Action Button
- Fixed quick-log FAB with expandable menu
- 4 one-tap green actions (Walk/Bike, Vegan Meal, Line Dry, Unplug Standby)
- Success toast notification with tree-growth confirmation
- "All Actions" shortcut link

### 🛡️ Stability, Security & Accessibility
- **Comprehensive Unit Testing** — 55 unit tests using **Vitest** validating calculations, badge unlocks, streak progression, and mock data generators.
- **Enterprise-Grade Security Headers** — Configured via `next.config.ts`, featuring a strict `Content-Security-Policy` (CSP), `X-Frame-Options: DENY` (clickjacking protection), HSTS (HTTPS preload), `X-Content-Type-Options: nosniff` (MIME-sniffing protection), and `Referrer-Policy`.
- **Sanitized localStorage Persistence** — Robust schema validation and exception handling when reading/writing client state.
- **Accessibility (WCAG 2.1 AA) Compliance**:
  - **High Contrast Mode** toggle to enhance readability for low-vision users.
  - Full keyboard accessibility and focus trapping on the expandable FAB menu.
  - Descriptive ARIA attributes (`role="img"`, `<title>`, `<desc>`) dynamically describing the tree growth stage and health.
  - Visual color-only states supplemented by pattern overlays and textual labels.
- **Global React Error Boundary** — Graceful recovery UI instead of a blank screen.
- **Hydration-safe animations** — Pre-seeded LCG pseudo-random number generator for particles to avoid hydration mismatches.
- **Full TypeScript** — Zero `any` escapes in business logic.
- **Responsive Navigation** — Desktop top-bar plus a mobile-first bottom nav bar.

---

## 🌳 Tree Growth System

Your tree is a living metric. It grows through **five distinct stages**, driven by three weighted factors:

| Factor | Weight | Target for 100% contribution |
|---|---|---|
| 🌍 Carbon Footprint Reduction | **50%** | Reduce baseline by 35% |
| ⚡ Actions Logged | **40%** | Complete 50 impactful actions |
| 🔥 Consistency Streak | **10%** | Maintain a 7-day daily streak |

### The Five Stages

| Stage | Name | Progress | Visual |
|---|---|---|---|
| 🌱 1 | **Sapling** | 0 – 20% | Thin trunk, 2 small pale-green leaf clusters |
| 🌿 2 | **Young Tree** | 21 – 45% | Sturdier trunk, lower branches sprouting |
| 🌲 3 | **Growing Tree** | 46 – 70% | Mid-branches appear, denser vibrant foliage |
| 🌳 4 | **Mature Tree** | 71 – 90% | Upper canopy forms, deep lush greens |
| ✨ 5 | **Ancient Tree** | 91 – 100% | Full canopy, glowing emerald leaves, radiant pollen particles, golden ring |

> **Full Growth Unlocked** at 100% — a pulsing "✨ Fully Grown" badge appears, the SVG gains an electric-green canopy glow, and an in-app celebration banner announces the milestone.

The formula:

```
growthProgress = (footprintFactor × 0.50) + (actionFactor × 0.40) + (streakFactor × 0.10)

footprintFactor = min(100, reductionPercent / 35 × 100)
actionFactor    = min(100, actionsCount   / 50 × 100)
streakFactor    = min(100, streakDays     / 7  × 100)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | SSR, routing, static generation |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Type-safe components and logic |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first dark forest design system |
| **Animation** | [Framer Motion 11](https://www.framer.com/motion/) | Tree SVG, page transitions, micro-interactions |
| **Charts** | [Recharts](https://recharts.org/) | Bar, Area, and Line charts on Insights page |
| **State** | [Zustand 5](https://zustand-demo.pmnd.rs/) | Persistent global store (localStorage) |
| **Icons** | [Lucide React](https://lucide.dev/) | Crisp, consistent icon set |
| **Fonts** | [Fraunces](https://fonts.google.com/specimen/Fraunces) + [Outfit](https://fonts.google.com/specimen/Outfit) | Serif headings + clean sans body |

### Design System Colours

```css
--background:   #0B1C12   /* Deep forest green-black */
--card-bg:      #11261D   /* Rich dark green surface */
--card-border:  #2A4A3A   /* Subtle botanical border */
--foreground:   #E8EDE9   /* Warm off-white body text */
--muted-text:   #A3C4B1   /* Bright sage secondary text */
--accent-teal:  #3D9E8F   /* Vibrant teal accent */
--accent-coral: #E07A5F   /* Warm coral CTA */
--forest-400:   #52b788   /* Primary green / tree leaves */
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or pnpm / yarn)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/rooted.git
cd rooted

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will hot-reload as you edit files.

### Production Build

```bash
# Build and verify
npm run build

# Start the production server
npm start
```

> **Note:** No environment variables or external APIs are required. All state is persisted client-side via Zustand + `localStorage`.

---

## 📖 How to Use

```
1. Land on the Home page  →  click "Plant Your Tree"
2. Complete the 6-step Onboarding Quiz
      → choose commute, diet, energy, flights, shopping habits
      → your baseline carbon footprint is calculated
3. Arrive at your Dashboard
      → your Sapling is waiting 🌱
      → explore your Emissions Breakdown cards
4. Navigate to Actions
      → log eco-friendly choices (cycling, vegan meals, unplugging devices…)
      → watch your Growth Progress bar rise and your tree evolve
5. Visit Insights
      → compare your footprint to global averages
      → complete Challenges to earn XP and unlock Badges
      → explore the Community Grove
6. Return daily to maintain your streak 🔥
      → every logged action brings your tree closer to full bloom ✨
```

---

## 📸 Screenshots

| Dashboard | Tree (Stage 5) | Actions | Insights |
|:---------:|:--------------:|:-------:|:--------:|
| *(Add screenshot)* | *(Add screenshot)* | *(Add screenshot)* | *(Add screenshot)* |

> To add screenshots: place images in `/public/screenshots/` and update the table above.

---

## 🎨 Design Philosophy

### Why Dark Mode Only?

The forest doesn't switch to "light mode" at dawn — and neither does Rooted. The decision to build a **dark-mode-only** experience was deliberate and holistic:

- **Immersion:** A deep forest-green palette (`#0B1C12` background, `#11261D` cards) creates the sensation of being inside a living woodland. Light mode would shatter that atmosphere instantly.
- **Emotional resonance:** Research shows that darker, warmer palettes reduce anxiety and increase feelings of calm focus — exactly what we want users to feel when confronting their carbon data.
- **Visual hierarchy:** Glowing teal accents (`#3D9E8F`), warm coral CTAs (`#E07A5F`), and bright sage text (`#A3C4B1`) all pop dramatically against the dark canvas. The same palette on white would feel flat.
- **Energy awareness:** Dark interfaces on OLED screens consume meaningfully less power — a small but symbolically fitting choice for a sustainability app.

### Emotional Design Approach

Rooted treats climate action as a **garden, not a scoreboard.** Every design decision is guided by three principles:

1. **Hope over guilt** — We never show red warnings or shame users. Poor habits grow a withered tree; better habits bloom it back. The metaphor is gentle and forgiving.
2. **Tangibility** — Abstract CO₂ numbers mean nothing. A tree that visibly sprouts new branches when you log a vegan meal means everything.
3. **Delight in the micro** — Pollen particles drifting upward, leaves swaying in the Community Grove, the satisfying "Logged!" button flash — these tiny moments of joy compound into lasting habit change.

---

## 🔮 Future Enhancements

| Feature | Description |
|---|---|
| 🌍 **Real emissions API** | Connect to a live carbon intensity API (e.g. Electricity Maps) for regional energy data |
| 👥 **Social groves** | Real user accounts with shareable grove profiles and leaderboards |
| 🗺️ **Geo-aware tips** | Contextual action suggestions based on local transit, weather, or seasonal food availability |
| 🌸 **Tree species unlocks** | Earn different tree species (Birch, Spruce, Sakura) at milestones |
| 📱 **PWA + offline mode** | Install as a mobile app with offline action logging and sync |
| 🤖 **AI footprint assistant** | Chat interface to get personalised reduction tips from your profile |
| 📅 **Monthly PDF reports** | Auto-generated carbon report cards with trend analysis |
| 🔔 **Streak notifications** | Browser push reminders to maintain daily logging streaks |

---

## 📁 Project Structure

```
rooted/
├── app/
│   ├── page.tsx               # Landing / Hero page
│   ├── layout.tsx             # Root layout with ErrorBoundary + Navigation
│   ├── globals.css            # Tailwind v4 theme + custom CSS variables
│   ├── dashboard/page.tsx     # Main dashboard (tree, breakdown, charts)
│   ├── actions/page.tsx       # Action logger with category filters
│   ├── insights/page.tsx      # Charts, challenges, community grove
│   └── onboarding/page.tsx    # Multi-step carbon footprint quiz
├── components/
│   ├── tree/
│   │   ├── AnimatedTreeSVG.tsx  # Procedural SVG tree with Framer Motion
│   │   └── ForestBackground.tsx # Parallax forest background
│   ├── ui/
│   │   ├── OrganicCard.tsx      # Glassmorphism card component
│   │   ├── OrganicButton.tsx    # Animated button with variants
│   │   ├── ProgressRing.tsx     # SVG circular progress indicator
│   │   └── ErrorBoundary.tsx    # Global React error boundary
│   ├── Navigation.tsx           # Top bar + mobile bottom nav
│   └── FloatingActionButton.tsx # Quick-log FAB
├── store/
│   └── useRootedStore.ts        # Zustand global store (localStorage persisted)
└── lib/
    ├── calculations.ts          # Footprint calculation engine
    └── emissionFactors.ts       # IPCC-aligned emission factor constants
```

---

## 🌱 Emission Factors

All carbon calculations use **IPCC and peer-reviewed emission factors**:

| Category | Source | Factor |
|---|---|---|
| Petrol car | DEFRA 2023 | 170 g CO₂e / km |
| Electric car | Lifecycle grid mix | 47 g CO₂e / km |
| Public transit | Average bus/rail | 35 g CO₂e / km |
| Short-haul flight | ICAO average | 150 kg CO₂e / flight |
| Long-haul flight | ICAO average | 950 kg CO₂e / flight |
| Meat-heavy diet | Oxford Food Study | 7.26 kg CO₂e / day |
| Vegan diet | Oxford Food Study | 2.89 kg CO₂e / day |
| Grid electricity | IEA average | 385 g CO₂e / kWh |

---

<div align="center">

Made with 🌿 and care for the planet.

*"The best time to plant a tree was 20 years ago. The second best time is now."*

**— Chinese Proverb**

</div>
