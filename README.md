# KotoKotha কতকথা

KotoKotha is an anonymous platform where people in Bangladesh share their real experiences with services and institutions — hospitals, government offices, banks, schools, ISPs, and more. Other visitors can upvote or downvote each post. No accounts, no login, no personal information collected.

## Features

- **Submit an experience** — pick a category, location, star rating, and describe what happened
- **Review before publishing** — every post is checked by an admin before it goes live
- **Browse and filter** — filter by category, division, and district
- **Search** — find posts by keyword across titles, institutions, and body text
- **Voting** — upvote or downvote posts (once per post per browser)
- **Top posts** — see posts ranked by net votes
- **Dark mode** — follows your system setting, with a manual toggle that remembers your choice

## Tech Stack

- **HTML, CSS, vanilla JavaScript** — no frameworks, no build step
- **Supabase** — hosted Postgres database with Row Level Security and a serverless function for voting

## Folder Structure

```
kotokotha/
├── index.html              Home page — intro + 6 latest posts
├── posts.html              Browse all posts with filters and search
├── post.html               Single post view with vote buttons
├── top.html                Posts ranked by net votes
├── submit.html             Submit a new experience
├── about.html              About page
├── privacy.html            Privacy page
├── terms.html              Terms of use
├── css/
│   └── style.css           All styling — light/dark themes, responsive
├── js/
│   ├── config.js           Supabase URL and anon key (you fill these in)
│   ├── locations.js        8 divisions and 64 districts of Bangladesh
│   ├── db.js               All Supabase calls — the only file that talks to the database
│   └── app.js              Page logic — cards, filters, votes, form, theme toggle
├── supabase/
│   ├── schema.sql          Table, RLS policies, and vote function
│   └── seed.sql            12 sample posts for demo
├── assets/                 Images and icons (empty for now)
└── .gitignore
```

## How It Works

### The `posts` table

Every experience is one row with: title, category, institution, division, district, rating (1–5), body text, approval status, upvote count, downvote count, and timestamp.

### Approval

When someone submits a post, it is saved with `approved = false`. It does not appear on the site. An admin opens the Supabase Table Editor and sets `approved` to `true` to publish it.

### Row Level Security (RLS)

The database has rules that control what anonymous visitors can do:

- **Read** — visitors can only see posts where `approved = true`. Hidden posts are invisible.
- **Insert** — visitors can submit new posts, but only with `approved = false`, `upvotes = 0`, and `downvotes = 0`. The database rejects any attempt to submit an already-approved post or one with inflated votes.
- **Update / Delete** — not allowed. Visitors cannot edit or remove any post.

### The `vote_post` function

Voting goes through a database function (`vote_post`) that runs with elevated permissions. It is the only way a visitor can change a row, and it only touches the upvotes or downvotes column on approved posts. The browser remembers each vote in localStorage so a visitor can only vote once per post.

## Run Locally

1. Open a terminal in the project folder
2. Start a local server:
   ```
   python -m http.server 8000
   ```
3. Open **http://localhost:8000** in your browser

> Do not open `index.html` directly from the file explorer — the `file://` protocol blocks the Supabase connection.

## Set Up Your Own Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the Supabase dashboard, open **SQL Editor**
3. Paste the contents of `supabase/schema.sql` and click **Run**
4. Open a new query, paste `supabase/seed.sql`, and click **Run** (this adds 12 sample posts)
5. Go to **Settings → API** and copy your **Project URL** and **anon / public key**
6. Open `js/config.js` and paste them in:
   ```js
   var SUPABASE_URL = 'https://your-project.supabase.co';
   var SUPABASE_KEY = 'eyJhbGciOi...your-anon-key...';
   ```

> Never put the `secret` or `service_role` key in this file. The anon key is safe to publish because RLS limits what it can do.

## Approving Posts

1. Open your Supabase dashboard
2. Go to **Table Editor** → click the `posts` table
3. Find the post you want to approve
4. Click the `approved` cell and change it from `false` to `true`
5. The post will now appear on the site

## Deploy on GitHub Pages

1. Push the project to a GitHub repository
2. Go to the repository **Settings → Pages**
3. Under "Source", select **Deploy from a branch**
4. Choose the `main` branch and `/ (root)` folder
5. Click **Save** — the site will be live at `https://your-username.github.io/your-repo-name/`

## Known Limitations

- **Voting is per-browser** — votes are tracked in localStorage, which can be cleared or bypassed by using a different browser or incognito mode.
- **Manual approval** — there is no admin panel; posts are approved by editing the database directly in the Supabase dashboard.
- **No accounts** — there is no way to track who posted what, edit your own posts, or build a profile.

## Disclaimer

KotoKotha is a platform for anonymous personal experiences. Posts reflect the views of their authors, are not verified by KotoKotha, and do not amount to a final legal judgment. KotoKotha is not a court or an enforcement authority.
