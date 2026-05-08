# 🟢 CSSnap.
### Precision CSS Dueling Engine v2.0

![Stack](https://img.shields.io/badge/Stack-React_|_Node_|_Socket.io_|_Supabase-10b981?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

CSSnap is a high-speed, real-time multiplayer dueling game where precision meets code. Compete against stylists worldwide to replicate complex designs using pure CSS. Authorized for Bio-Grid integration.

---

## 🚀 Key Features

*   **Real-time Multi-element Duels:** Powered by Socket.io for sub-50ms synchronization.
*   **Bio-Grid Training Protocol:** Interactive, narrative-driven tutorial with spotlight guidance and real-time validation.
*   **Pro Scoring Engine:** Accurate, server-side validated scoring that supports Hex and RGB colors.
*   **Game Modes:**
    *   **Standard:** Classic head-to-head precision matches.
    *   **Daily Mission:** 2X XP rewards for a unique global design changed every 24h.
    *   **Blind Array:** Hardcore mode where the target design disappears after 5 seconds.
*   **Global Persistence:** XP, Ranks (Novice to CSS Deity), and match history powered by Supabase.
*   **Bio-Emerald Aesthetic:** Nature-inspired high-tech HUD with scanlines and nature-professional glassmorphism.

---

## 🛠️ Neural Stack

*   **Frontend:** React 18, Vite, TailwindCSS, Canvas-Confetti.
*   **Backend:** Node.js, TypeScript, Express, Socket.io.
*   **Database:** Supabase (PostgreSQL) for authoritative player data.
*   **Infrastructure:** Monorepo architecture using npm workspaces.

---

## 🕹️ Local Neural Link (Setup)

### Prerequisites
*   Node.js (v18+)
*   A Supabase project (URL and Anon Key)

### Installation

1.  **Clone the grid:**
    ```bash
    git clone https://github.com/youruser/cssnap.git
    cd cssnap
    ```

2.  **Initialize dependencies:**
    ```bash
    npm run install:all
    ```

3.  **Configure environment:**
    Create a `.env` file in the `server/` directory:
    ```env
    SUPABASE_URL=your_supabase_url
    SUPABASE_ANON_KEY=your_supabase_key
    PORT=3001
    ```

4.  **Boot the system:**
    ```bash
    npm run dev
    ```
    *Access the uplink at `http://localhost:5173`*

---

## 🛰️ Deployment Guide (The Free Path)

### 1. Database (Supabase)
Run the following schema in your Supabase SQL Editor:
```sql
CREATE TABLE users (
  nickname TEXT PRIMARY KEY,
  xp INTEGER DEFAULT 0,
  last_daily_date TEXT
);

CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  player1 TEXT, player2 TEXT, winner TEXT,
  score1 INTEGER, score2 INTEGER, mode TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Backend (Render.com)
*   **Type:** Web Service
*   **Root Directory:** `server`
*   **Build Command:** `npm install && npm run build`
*   **Start Command:** `npm start`
*   **Env Vars:** Add `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### 3. Frontend (Vercel)
*   **Root Directory:** `client`
*   **Env Vars:** Add `VITE_SERVER_URL` pointing to your Render URL.

---

## 📜 License
MIT © 2026 CSSnap Grid Authority.
