# WAR Washerman Panel (Next.js 15)

This project has been rebuilt on Next.js 15 (App Router) while preserving the original UI and features.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Environment Variables

Create a `.env` file from the template and set your backend URL:

```bash
cp .env.example .env
```

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_DEBUG=false
```

## Routes

- `/login`
- `/orders`
- `/students`
- `/settings`
- `/statistics`

The root route (`/`) redirects to `/orders`.
