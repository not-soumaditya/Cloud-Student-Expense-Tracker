# 💰 Student Expense Tracker

**BACSE344 — Cloud Infrastructure and Architecture | Digital Assignment**

A cloud-based web application that helps students track daily expenses, manage budgets, and visualize spending patterns. Built with modern web technologies and deployed across multiple cloud platforms.

---

## 🏗️ System Architecture

```
┌──────────────────────┐       HTTPS/REST       ┌──────────────────────┐      SQL/TCP       ┌──────────────────────┐
│    React Frontend    │  ◄─────────────────►   │   Express.js API     │  ◄──────────────►  │   PostgreSQL DB      │
│   Vercel (CDN)       │       JSON              │   Render (PaaS)      │    node-pg         │   Supabase (DBaaS)   │
│                      │                         │                      │                    │                      │
└──────────────────────┘                         └──────────────────────┘                    └──────────────────────┘
```

### Cloud Services Used

| Service | Provider | Purpose | Tier |
|---------|----------|---------|------|
| Vercel | Vercel | Frontend hosting (CDN) | Free |
| Render | Render.com | Backend API hosting (PaaS) | Free |
| Supabase | Supabase.com | PostgreSQL Database (DBaaS) | Free (500 MB) |

---

## ✨ Features

- **Dashboard** — Overview with spending summary cards and donut chart
- **Expense Management** — Full CRUD: Add, view, edit, and delete expenses
- **Budget Tracking** — Set monthly budgets per category with progress bars and over-budget alerts
- **Reports & Analytics** — Interactive charts (pie chart by category, bar chart by month)
- **Category Management** — 8 pre-configured categories with icons and colors
- **Filtering** — Filter expenses by category and date range

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Supabase) |
| API | RESTful JSON APIs (15 endpoints) |

---

## 📊 Database Design

### Tables

**categories** — Expense categories (Food, Transport, Books, etc.)
**expenses** — Individual expense records with amount, date, category, payment method
**budgets** — Monthly budget limits per category

### ER Diagram

```
categories (1) ──── (N) expenses
categories (1) ──── (N) budgets
```

---

## 🔌 REST API Endpoints

### Expenses (`/api/expenses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List all expenses (with filters) |
| GET | `/api/expenses/:id` | Get single expense |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/stats/summary` | Spending summary |

### Categories (`/api/categories`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Budgets (`/api/budgets`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | List budgets (filter by month) |
| GET | `/api/budgets/:id` | Get single budget |
| POST | `/api/budgets` | Set budget |
| PUT | `/api/budgets/:id` | Update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free) with a project created

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd cloudapp
```

### 2. Set up the database
1. Go to [supabase.com](https://supabase.com) → create a project
2. Open the SQL Editor
3. Copy and run the contents of `server/schema.sql`

### 3. Start the backend
```bash
cd server
cp .env.example .env
# Edit .env and add your Supabase DATABASE_URL
npm install
npm run dev
```

### 4. Start the frontend
```bash
cd client
npm install
npm run dev
```

### 5. Open the app
Visit `http://localhost:5173` in your browser.

---

## ☁️ Cloud Deployment

### Deploy Database (Supabase)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project → select a region
3. Run `server/schema.sql` in the SQL Editor
4. Copy the connection string from Settings → Database

### Deploy Backend (Render)
1. Sign up at [render.com](https://render.com)
2. Create a new **Web Service** → connect your GitHub repo
3. Root directory: `server`
4. Build command: `npm install`
5. Start command: `node src/index.js`
6. Add environment variables: `DATABASE_URL`, `PORT=10000`, `CLIENT_URL`

### Deploy Frontend (Vercel)
1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set the **Root Directory** to `client`
4. Set the **Framework Preset** to `Vite`
5. Add the environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`
6. Click **Deploy** — Vercel will automatically build and deploy
7. Every future `git push` will trigger an automatic redeployment

---

## 📁 Project Structure

```
cloudapp/
├── server/                     # Backend API
│   ├── package.json
│   ├── schema.sql              # Database schema + seed data
│   ├── .env.example
│   └── src/
│       ├── index.js            # Express app entry point
│       ├── config/db.js        # PostgreSQL connection
│       ├── models/             # Database query models
│       ├── routes/             # API route handlers
│       └── middleware/         # Error handling
├── client/                     # Frontend React app
│   ├── package.json
│   ├── index.html
│   ├── vercel.json             # Vercel SPA routing config
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx             # Root component
│       ├── api/axios.js        # API client
│       ├── pages/              # Page components
│       └── components/         # Shared components
├── .gitignore
└── README.md
```

---

## 👤 Author

**[Your Name]** — [Your Registration Number]
BACSE344 — Cloud Infrastructure and Architecture
