# CLAUDE.md — Project WDD (KotoKotha / কতকথা)

> **Context for Claude Code / LLM Developer:**  
> This file preserves the full context, architectural decisions, and conversation history from Antigravity so you can continue development seamlessly in Claude Code.

---

## 1. Project Overview

**KotoKotha (কতকথা)** is an anonymous, community-driven experience-sharing platform for citizens in Bangladesh to report, read, and vote on real experiences with institutions and public/private services (government offices, hospitals, banks, utility providers, schools, universities, ISPs, etc.).

- **Target Audience:** General public in Bangladesh.
- **Privacy Philosophy:** Zero login, zero user accounts, zero personal tracking. Complete anonymity.
- **Moderation Model:** Submitted posts are held for admin review before going live (`is_approved = true`).

---

## 2. Tech Stack & Architecture

- **Frontend:** Pure HTML5, CSS3, vanilla ES6+ JavaScript.
  - No build step, no npm/bundler, no framework dependencies. Runs directly in any browser or static host.
- **Backend / Database:** **Supabase** (Hosted PostgreSQL):
  - Row-Level Security (RLS) enabled.
  - Serverless PostgreSQL stored procedure for atomic voting (`vote_post`).
- **CDN Libraries:**
  - Supabase JS Client (`@supabase/supabase-js` via CDN)
  - Feather Icons (lightweight icon set)
  - DOMPurify (XSS sanitization for user-generated content)

---

## 3. Directory Structure

```
Project WDD/
├── index.html              # Home page — Hero intro, stats, 6 latest approved posts
├── posts.html              # Browse all posts with division/district/category filters & search
├── post.html               # Single post detail view with discussion and voting
├── top.html                # Leaderboard — Posts ranked by net score (upvotes - downvotes)
├── submit.html             # Multi-step post submission form (category, rating, location, text)
├── about.html              # Platform mission & FAQ
├── privacy.html            # Anonymity policy & privacy statement
├── terms.html              # Community guidelines & terms of use
├── css/
│   └── style.css           # Complete responsive stylesheet (light/dark theme variables)
├── js/
│   ├── config.js           # Supabase project URL & Anon Public Key (configure here)
│   ├── locations.js        # All 8 divisions and 64 districts of Bangladesh
│   ├── db.js               # Supabase API abstraction layer (all DB calls isolated here)
│   └── app.js              # UI controller, theme toggle, card rendering, local vote deduplication
├── supabase/
│   ├── schema.sql          # Postgres table definitions, RLS policies, indexes, vote_post RPC
│   └── seed.sql            # 12 realistic sample posts across categories for demo/testing
└── assets/                 # Static assets & brand graphics
```

---

## 4. Key Implementation Details & Decisions

1. **Brand Identity:** The official Bengali name is **কতকথা** (spelled `কতকথা`, NOT `কথকথা`). All student/class project disclaimers have been purged so the UI looks 100% professional and trustworthy.
2. **Vote Deduplication:** Voting is stored locally in `localStorage` to prevent duplicate votes per browser session without requiring authentication. The server increments `upvotes` or `downvotes` via atomic Postgres RPC `vote_post`.
3. **Database Security (RLS):**
   - `SELECT`: Public can read posts where `is_approved = true`.
   - `INSERT`: Public can submit new posts (default `is_approved = false`).
   - `UPDATE / DELETE`: Disallowed for public anon role. Admin moderation occurs directly in Supabase dashboard or via service role.
4. **Geography Engine (`locations.js`):** Contains full structured mapping of Bangladesh:
   - Divisions: Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, Mymensingh.
   - 64 Districts dynamically populated in dropdowns upon division selection.

---

## 5. Current State & What Was Accomplished

- ✅ All 8 HTML pages designed, styled, responsive, and checked.
- ✅ Full light/dark mode with automatic OS detection + persistent manual toggle.
- ✅ Supabase database schema (`schema.sql`) and seed data (`seed.sql`) ready.
- ✅ Clean separation of concerns (`db.js` handles data, `app.js` handles DOM).
- ✅ XSS prevention using DOMPurify before inserting dynamic user HTML.

---

## 6. Next Steps for Development

1. **Supabase Setup:**
   - Create a project on [Supabase](https://supabase.com).
   - In Supabase SQL Editor, run `supabase/schema.sql` (and optionally `supabase/seed.sql`).
   - Copy your Project URL and Anon Key into `js/config.js`.
2. **Deployment:**
   - Ready for one-click static hosting: Netlify, Vercel, Cloudflare Pages, or GitHub Pages.
   - No build command needed. Publish directory is root (`.`).
3. **Admin Moderation:**
   - Set up either a password-protected admin page or moderate posts directly in the Supabase Table Editor by flipping `is_approved` to `TRUE`.
