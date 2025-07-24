# 🧠 Neuromap

> Visualize your React app as an interactive file dependency graph.

![Neuromap Screenshot](./assets/neuromap-preview.png) <!-- optional: add a real screenshot later -->

---

## ✨ What is Neuromap?

**Neuromap** is a developer tool built with Next.js that lets you:
- Paste a GitHub link to a vanilla React repo
- Parse its `.js`, `.jsx`, `.ts`, `.tsx` files into an **abstract syntax tree (AST)**
- Build an **interactive dependency map** with React Flow & Dagre layout
- Explore the repo’s folder structure with a familiar sidebar
- Quickly see stars, forks, and metadata from GitHub

Ideal for:
- Onboarding into new projects
- Visualizing your own side project structure
- Teaching & code walkthroughs

---

## 🚀 Features

✅ **File dependency graph** using React Flow  
✅ **Folder sidebar** (like VSCode) built with Radix UI & Shadcn  
✅ **Dark/light mode toggle** (Tailwind)  
✅ **GitHub API integration**: title, stars, forks  
✅ **Babel parser** to analyze imports/exports  
✅ **IP-based rate limiting** (Upstash Redis) – 1 request/day per IP  
✅ **Caching**: same repo → cached for 1 hour (via Redis)  
✅ **Clean UI & animations** – built with Shadcn, Radix UI, Tailwind

---

## 📦 Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [React Flow](https://reactflow.dev/) + [Dagre](https://github.com/dagrejs/dagre) for layout
- [Babel parser](https://babeljs.io/docs/babel-parser) to parse ASTs
- [Shadcn/UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) + Tailwind CSS for design
- [Upstash Redis](https://upstash.com/) for caching & rate limiting
- [GitHub REST API](https://docs.github.com/en/rest)

---

## ⚙️ How it works (high-level)

1. User submits a public React repo URL.
2. GitHub REST API fetches file list & metadata.
3. Babel parser builds AST & extracts import/export dependencies.
4. React Flow + Dagre visualize the file graph.
5. Folder tree built using file paths.
6. Results cached in Upstash Redis.
7. Rate limit: each IP can map only once/day (except your own dev IP).

---

## 🧩 Limitations (MVP)

🚫 Only supports **vanilla React** (no Next.js, Remix, Gatsby, etc.)  
🚫 Max ~55 `.js/.jsx/.ts/.tsx` files per repo (for performance & rate limit)  
🚫 Repo must not be a monorepo; root must be the React app  
🚫 Dynamic imports & aliases aren't yet handled

> ⚠️ It’s an MVP, intentionally limited to stay fast & focused.

---

## 📋 Installation

```
git clone https://github.com/yourusername/neuromap.git
cd neuromap
npm install
```

Create a .env file:

```
GITHUB_TOKEN=ghp_yourgithubtoken
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
MY_IPS=127.0.0.1,::1,152.58.34.170
```

MY_IPS: Comma-separated list; add your own IPs to bypass rate limit locally.

## 🧪 Running locally

```
npm run dev
```

## 🛡 Rate limiting & caching
- 1 request/day per IP (stored in Redis key: rate_limit:{IP})
- Same repo within 1 hour → uses Redis cache → no extra GitHub API calls
- This keeps the free GitHub API within limits (5000 calls/hour per IP).

## 🌱 Roadmap/Future Plans
 - TypeScript rewrite
 - Larger repos (pagination / chunked parsing)
 - Support for Next.js & monorepos
 - Custom themes & layouts
 - Plugin system (e.g., highlight test files, visualize component trees)

## 🫶 Contributing

We welcome anyone who wants to help — whether by suggesting features, reporting bugs, or coding new functionality.

### 📝 Feature Requests
If you have an idea:
- Create a new GitHub issue using the **Feature Request** template (see format below).
- Describe your idea clearly and why it helps users.
- Optionally, volunteer to build it yourself (see below).

### 🛠 Volunteering to Build
Want to work on a feature (yours or existing)?
- Comment on the issue saying you'd like to implement it.
- Share a **technical plan** (see format below): describe the approach, affected files, libraries you’ll use, etc.
- After approval, create a branch, implement, and raise a PR.

### 🐞 Picking Up Existing Issues
We’ll keep a list of open issues anyone can pick up.
- Comment to claim it.
- Share your **technical plan** before starting.
- Once approved, follow the usual fork → branch → PR process.

### ❗ Creating New Issues
When creating an issue (bug, enhancement, question):
- Follow the **Issue Format** below.
- Write a clear title, description, steps to reproduce (if bug), and screenshots if helpful.

---

## 📦 Formats

### ✅ Feature Request Format
## ✨ Feature Request
**Describe the feature:**
A short, clear description of what you'd like to add.

**Why is it useful?**
Explain how this helps users, improves UX, or adds new capability.

**Screenshots / References (optional):**
If applicable.
\`\`\`

---

### 🛠 Technical Plan Format (for building a feature or fixing an issue)
## 🛠 Technical Plan
**Summary:**
One-paragraph explanation of what you'll do.

**Approach:**
Step-by-step plan or algorithm.

**Files / components affected:**
List of files you'll touch or create.

**Dependencies / tools:**
Any libraries or packages you plan to add or use.
\`\`\`

---

### 🐞 Issue Format
## 🐞 Issue
**Summary:**
Clear, one-sentence description of the problem.

**Steps to reproduce:**
(if applicable)

**Expected behavior:**
What should happen.

**Actual behavior:**
What currently happens.

**Screenshots / logs:**
(if helpful)

**Environment:**
Browser, OS, etc.
\`\`\`

---
## ✅ Pull Request Process

1. Fork → create a branch (`feat/feature-name`)
2. Code & test locally
3. Raise PR with:
   - Reference to issue/feature
   - Clear description of what you did
4. PR will be reviewed → merged or feedback shared

---

⭐ Even if this is just a side project, having a real process helps everyone (and shows you think like a maintainer).

## 📢 License
MIT

🧠 Built with love by Your Name

Neuromap — see your code before you read it.
