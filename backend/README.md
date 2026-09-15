# iWallet FastAPI AI Backend

Minimal Python backend for the iWallet AI assistant.

## Local Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Required env values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
FRONTEND_ORIGIN=http://localhost:3000
```

The backend can read these from the project root `.env.local` during local development.

The frontend calls:

```text
POST /api/ai/chat/stream
Authorization: Bearer <Supabase access token>
```

The response is Server-Sent Events.

## Deploy

Deploy `backend/` as a Python service.

Railway / Render settings:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
FRONTEND_ORIGIN=https://your-vercel-domain.vercel.app
```

Use commas when multiple frontend domains need access:

```env
FRONTEND_ORIGIN=https://your-production-domain.com,https://your-preview-domain.vercel.app
```

Frontend Vercel variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-fastapi-backend-domain
```
