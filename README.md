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