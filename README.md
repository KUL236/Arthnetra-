# ArthNetra v3 — India's AI Financial Intelligence Platform

> Next.js 14 · Supabase Auth · Groq AI · Netlify deployment

---

## 🚀 Deploy to Netlify

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "ArthNetra v3"
git remote add origin https://github.com/YOUR_USERNAME/arthnetra.git
git push -u origin main
```

### 2. Connect to Netlify
1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Select your repo
3. Build settings are auto-detected from `netlify.toml`:
   - **Build command:** `npm install --legacy-peer-deps && npm run build`
   - **Publish directory:** `.next`
4. Click **Deploy site**

### 3. Add Environment Variables
Go to **Site configuration → Environment variables** and add all variables from `netlify-env-vars.txt`.

---

## 🔐 Supabase Setup

### Step 1 — Run Database Schema
1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Paste and run `supabase-schema.sql`

### Step 2 — Configure Auth Providers

#### Email OTP (Magic Link)
- **Authentication → Providers → Email** — ensure it's enabled
- **Authentication → Email Templates** — OTP template is auto-configured
- Supabase sends a 6-digit code users enter in the app (no magic link click needed)

#### Google OAuth
1. **Google Cloud Console** → APIs & Services → Credentials → Create OAuth 2.0 Client
   - Application type: **Web application**
   - Authorized redirect URIs: `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback`
2. Copy **Client ID** and **Client Secret**
3. **Supabase → Authentication → Providers → Google** → enable and paste credentials

### Step 3 — URL Configuration
**Authentication → URL Configuration:**
```
Site URL:         https://arthnetra.netlify.app
Redirect URLs:    https://arthnetra.netlify.app/auth/callback
                  http://localhost:3000/auth/callback
```

---

## 🤖 Groq AI

Using **`llama-3.3-70b-versatile`** — latest Groq model (updated from llama3-70b-8192).

Get a free API key at [console.groq.com](https://console.groq.com).

---

## 🔑 Auth Flows

| Method | Flow |
|--------|------|
| **Email + Password** | Standard login / signup |
| **Email OTP** | Step 1: enter email → Step 2: enter 6-digit code from email |
| **Google OAuth** | Redirects to Google → returns to `/auth/callback` → auto-login |

All flows use **PKCE** (Proof Key for Code Exchange) for security.

---

## 🛠 Local Development

```bash
cp .env.example .env.local
# Fill in your actual keys

npm install --legacy-peer-deps
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── page.tsx          # Login / Signup / OTP page
│   │   └── callback/
│   │       └── route.ts      # Google OAuth callback handler
│   ├── api/
│   │   └── ai-chat/
│   │       └── route.ts      # Groq AI (llama-3.3-70b-versatile)
│   └── ...pages
├── components/
│   └── layout/
│       ├── Providers.tsx     # Theme + Supabase auth sync
│       └── Navbar.tsx
├── lib/
│   └── supabase.ts           # Supabase client (PKCE flow)
└── store/
    └── appStore.ts           # Zustand store
```
