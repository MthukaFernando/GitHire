# GitHire 

> AI-powered GitHub recruitment tool — analyse any developer's GitHub profile instantly and rank candidates against your job requirements using AI.

🔗 **Live Demo:** [git-hire-xi.vercel.app](https://git-hire-xi.vercel.app)

---

## Tech Stack

**Frontend:** React, Vite, Recharts, React Router  
**Backend:** Node.js, Express.js  
**Database:** PostgreSQL (Supabase)  
**Authentication:** Supabase Auth  
**AI:** Google Gemini 2.5 Flash  
**APIs:** GitHub REST API  
**Infrastructure:** AWS EC2, Nginx, Let's Encrypt SSL  
**Deployment:** Vercel (frontend), AWS EC2 (backend)  
**CI/CD:** GitHub Actions  
**Email:** Brevo SMTP  

---

## What is GitHire?

GitHire is a recruitment tool that helps hiring managers evaluate developer candidates based on their public GitHub activity — not just their CV.

Recruiters can paste a candidate's GitHub profile URL and instantly see their language breakdown, repository activity, top projects, and technology usage. For signed-in users, candidates can be organised into hiring projects and ranked against job requirements using AI.

Job seekers and developers can analyse their own GitHub profile by signing up and running their profile against a real job description and discover which skills are missing before they apply.

---

## Features

### Free (No Sign Up Required)
- Paste any public GitHub profile URL and get an instant analysis
- View language breakdown with interactive pie chart
- Browse all public repositories with descriptions and languages
- See repository activity over the last 12 months
- View top repositories by stars

### Signed In (AI Features)
- Create multiple hiring projects (e.g. "Frontend Intern 2026", "DevOps Engineer")
- Add candidates to each project via their GitHub URL
- Live GitHub data fetched on every view — always up to date
- Paste job requirements or a full job description
- Run AI analysis to rank all candidates by match score
- View strengths, skill gaps, and a summary for each candidate
- Re-run analysis at any time with updated requirements

---

## How It Works

1. **Guest users** visit the landing page and paste any GitHub URL to get an instant profile analysis
2. **Recruiters sign up** to access project management and AI matching features
3. Recruiters **create a project** for each open role
4. They **add candidates** by pasting GitHub profile URLs
5. They **enter job requirements** — works best with technical skills visible on GitHub (languages, frameworks, tools)
6. They **run AI analysis** — Gemini analyses each candidate's repos, README files, topics, and languages against the requirements
7. Candidates are **ranked by match score** with detailed strengths and gaps

---

## AI Matching — How It Works

The AI analysis reads:
- Programming languages used across all repos
- Repository topics and tags
- README files of repositories with ambiguous languages (JavaScript, TypeScript, Python etc.) to detect frameworks like React, Next.js, Django, etc.
- Repository descriptions and names
- Overall activity and public repo count

> **Note:** For best results, enter technical skills that are visible on GitHub — such as programming languages, frameworks, databases, and tools. Soft skills and years of experience cannot be accurately assessed from GitHub data alone.

---

## Running Locally

### Prerequisites
- Node.js 18+
- A Supabase account
- A GitHub Personal Access Token
- A Google Gemini API key

### Backend Setup

```bash
git clone https://github.com/MthukaFernando/GitHire.git
cd GitHire/githire/backend
npm install
```

Create a `.env` file:

```
PORT=5000
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GITHUB_TOKEN=your_github_personal_access_token
GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd GitHire/githire/frontend
npm install
```

Create a `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

---


## Database Schema

- **projects** — hiring projects created by recruiters
- **candidates** — GitHub profiles added to each project
- **job_requirements** — requirements entered per project
- **ai_results** — stored AI analysis results per project

---

*Built by [Methuka Fernando](https://github.com/MthukaFernando)*
