
# Rev9 — Revenue Analytics Dashboard (React + TypeScript + Tailwind + Node/Express + MongoDB)

A sleek analytics dashboard with light/dark theming, animated UI, and a production-ready backend.  
Frontend is built with **React + TypeScript + Tailwind + Framer Motion**.  
Backend provides **JWT auth**, **user APIs**, and **MongoDB** integration.

---


[Live Project](https://cosmax.vercel.app/)

---

## Preview


<br><br>

![Rev9 Login UI](public/screenshots/Rev9-login.png)

<br><br>

![Rev9 Dashboard UI](public/screenshots/Rev9-dashboard.png)

---

## Features

- **Modern Dashboard UI**
  - KPI cards (Users, Revenue, Conversion, Sales, Engagement, Bounce)
  - Revenue Trend, Distribution, and Analytical Overview sections
  - Light/Dark theme with Tailwind tokens & CSS variables
  - Smooth hover/entry animations via Framer Motion
  - Fully responsive layout

- **Performance & UX**
  - Transform-gpu animations, reduced repaints
  - Flat card style (no borders/shadows) for clean look
  - Accessible color contrast and keyboard-friendly focus states

- **Backend & Auth**
  - Node/Express-style server (TypeScript → compiled to `dist/`)
  - JWT authentication middleware
  - User model & routes (signup/login/profile)
  - CORS, dotenv config, structured project layout

---

## Tech Stack

| Frontend           | Styling         | Charts / Animations | Backend / DB     | Tooling           |
|--------------------|-----------------|---------------------|------------------|-------------------|
| React + Vite (TS)  | Tailwind CSS    | Framer Motion       | Node/Express     | ESLint, Vitest    |
| React Router       | CSS Variables   | (Add your chart lib)| MongoDB + Mongoose | Vercel/Render/Any |

---

## Project Structure

### Frontend (`src/`)

```
src
 ┣ assets/
 ┃ ┣ admin.png
 ┃ ┣ user 1.png
 ┃ ┣ user 2.png
 ┃ ┗ user 3.png
 ┣ components/
 ┃ ┣ header/
 ┃ ┃ ┣ BrandMark.tsx
 ┃ ┃ ┣ HeaderActions.tsx
 ┃ ┃ ┣ HeaderBar.tsx
 ┃ ┃ ┣ HeaderSearch.tsx
 ┃ ┃ ┣ Rev9Logo.tsx
 ┃ ┃ ┣ Rev9Wordmark.tsx
 ┃ ┃ ┗ TopNavIcons.tsx
 ┃ ┣ ui/
 ┃ ┃ ┣ Card.tsx
 ┃ ┃ ┣ Toast.tsx
 ┃ ┃ ┗ button.tsx
 ┃ ┣ ConfirmLogoutModal.tsx
 ┃ ┣ PageTitle.tsx
 ┃ ┣ PeriodTabs.tsx
 ┃ ┣ ProtectedRoute.tsx
 ┃ ┣ ThemeToggle.tsx
 ┃ ┣ UserModal.tsx
 ┃ ┣ footer.tsx
 ┃ ┗ react.svg
 ┣ layout/
 ┃ ┗ AppLayout.tsx
 ┣ lib/
 ┃ ┗ api.ts
 ┣ pages/
 ┃ ┣ dashboard/
 ┃ ┃ ┣ AnalyticalOverview.tsx
 ┃ ┃ ┣ DashboardHeader.tsx
 ┃ ┃ ┣ MetricsGrid.tsx
 ┃ ┃ ┣ PeriodToggle.tsx
 ┃ ┃ ┣ RevenueDistribution.tsx
 ┃ ┃ ┣ RevenueTrend.tsx
 ┃ ┃ ┣ constants.ts
 ┃ ┃ ┣ dashboard.tsx
 ┃ ┃ ┣ useAnimatedCounters.ts
 ┃ ┃ ┗ utils.ts
 ┃ ┣ users/
 ┃ ┃ ┣ RolesCard.tsx
 ┃ ┃ ┣ UserList.tsx
 ┃ ┃ ┣ UserRow.tsx
 ┃ ┃ ┣ helpers.ts
 ┃ ┃ ┣ pagination.tsx
 ┃ ┃ ┗ types.ts
 ┃ ┣ Users.tsx
 ┃ ┣ login.tsx
 ┃ ┣ settings.tsx
 ┃ ┗ signup.tsx
 ┣ router/
 ┃ ┗ index.tsx
 ┣ tests/
 ┃ ┗ MainLayout.test.tsx
 ┣ theme/
 ┃ ┗ useTheme.ts
 ┣ App.tsx
 ┣ index.css
 ┣ main.tsx
 ┣ vite-env.d.ts
 ┗ vitest.setup.ts
```

### Backend

```
backend
 ┣ dist/
 ┃ ┣ middleware/
 ┃ ┃ ┗ auth.js
 ┃ ┣ models/
 ┃ ┃ ┗ User.js
 ┃ ┣ routes/
 ┃ ┃ ┣ auth.js
 ┃ ┃ ┗ userRoutes.js
 ┃ ┗ index.js
 ┣ node_modules/
 ┗ package.json
```

---

## Environment Variables

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:5000
```

### Backend (`.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rev9
JWT_SECRET=your-strong-secret
CORS_ORIGIN=http://localhost:5173
```

---

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Author

**Archit Sharma** — Full-Stack Developer (Chandigarh, India)  
- GitHub: https://github.com/archit-react  
- LinkedIn: https://www.linkedin.com/in/archit-react

---

## License

MIT License
