# CodeReviewAI — Multi-Agent Code Review System

**CodeReviewAI** is a full-stack web application that reviews source code with a team of specialised AI agents. Instead of returning one broad response, it runs focused checks for security, performance, logic, and code style, then combines and de-duplicates the findings into an actionable review.

## Features

- Secure sign-up, login, logout, and password-reset flows powered by Supabase Auth
- AI code review with four independent specialist agents:
  - **Security** — identifies vulnerabilities and unsafe patterns
  - **Performance** — highlights inefficient code and bottlenecks
  - **Logic** — detects likely bugs and incorrect behaviour
  - **Style** — suggests readability and maintainability improvements
- Concurrent agent execution for faster reviews
- Synthesised, de-duplicated findings with severity, explanation, suggested fix, and confidence
- Per-user review history with saved findings
- Dashboard analytics for review counts and High/Medium/Low severity totals
- Per-user review drafts kept locally during a session
- Responsive React interface with a Monaco code editor

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Monaco Editor |
| Backend | Python, FastAPI, Uvicorn |
| AI | Groq API (`openai/gpt-oss-20b`) |
| Data & Authentication | Supabase |
| Deployment | Vercel (frontend), Render (backend) |

## Project Structure

```text
multi-agent-code-review-system/
├── frontend/              # React/Vite client
│   └── src/
├── backend/               # FastAPI API and AI agents
│   └── app/
│       ├── agents/        # Security, performance, logic, style, synthesis
│       ├── api/           # Review and analytics endpoints
│       └── services/      # Groq and Supabase integrations
└── tests/
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/hemarhs/multi-agent-code-review-system.git
cd multi-agent-code-review-system
```

### 2. Configure the backend

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key
CORS_ORIGINS=http://localhost:5173
```

Create and activate a virtual environment, then install the dependencies:

```bash
cd backend
python -m venv .venv
```

On Windows:

```powershell
.venv\Scripts\Activate.ps1
```

On macOS/Linux:

```bash
source .venv/bin/activate
```

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will run at `http://127.0.0.1:8000`.

### 3. Configure the frontend

In a second terminal, create `frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=/api
```

Then start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Vite proxies `/api` requests to the local FastAPI server.

## Supabase Data Model

The backend expects two tables: `reviews` and `findings`. `reviews` stores the submitted code and the Supabase user ID. `findings` stores the agent name, severity, title, explanation, suggested fix, confidence, and the associated `review_id`.

Enable Supabase Email authentication and configure the site URL/redirect URL for your frontend address before testing password reset or email confirmation flows.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/review` | Run an AI review and save its findings |
| `GET` | `/reviews/user/{user_id}` | Get a user’s saved reviews |
| `GET` | `/reviews/{review_id}` | Get findings for a review |
| `GET` | `/analytics/{user_id}` | Get dashboard totals by severity |

## Deployment Notes

Deploy the frontend to Vercel with `frontend` as the root directory, `npm run build` as the build command, and `dist` as the output directory. Set these Vercel environment variables:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_BACKEND_URL=https://your-render-service.onrender.com
```

Deploy the backend to Render with `backend` as the root directory and this start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

On Render, set `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`, and `CORS_ORIGINS` (to the Vercel production URL).

## License

This project is intended for educational and portfolio use.
