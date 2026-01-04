# EduGen Frontend

React + Vite + Tailwind CSS frontend for EduGen educational platform.

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Backend Integration

- Login: POST `/auth/login` → Returns JWT token
- Signup: POST `/auth/signup` → Creates user account
- Token stored in localStorage
- All content APIs require Bearer authentication

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
