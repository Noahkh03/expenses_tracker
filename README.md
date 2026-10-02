# Expense Tracker

A full-stack expense tracker built with Node.js, Express, PostgreSQL, and
Bootstrap. Add, edit, delete, and filter expenses, with live summary cards
and a category breakdown chart.

## Project structure

```
expense-tracker/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── routes/
│   │   └── expensesRoutes.js
│   ├── controllers/
│   │   └── expensesController.js
│   ├── schema.sql
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html
    ├── css/style.css
    └── js/app.js
```

## Setup

### 1. Database
In pgAdmin, create a database named `expense_tracker`, then run
`backend/schema.sql` against it (Query Tool) to create the `expenses` table
and sample data.

### 2. Backend
```bash
cd backend
npm install
```
Copy `.env.example` to `.env` and fill in your own PostgreSQL password:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=expense_tracker
```
Start the server:
```bash
npm start
```
The API runs at `http://localhost:3000/api/expenses`.

### 3. Frontend
Open `frontend/index.html` with Live Server (or any static server). The
backend must be running first, since every page load fetches from it.

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | /api/expenses | List all expenses |
| GET | /api/expenses/:id | Get one expense |
| POST | /api/expenses | Create an expense |
| PUT | /api/expenses/:id | Update an expense |
| DELETE | /api/expenses/:id | Delete an expense |

Allowed categories: `Food`, `Transport`, `Bills`, `Entertainment`, `Other`.

## Features

- Add, edit, and delete expenses, each synced to PostgreSQL
- Filter by category, search by title, sort by column
- Summary cards: total, count, and highest expense (always based on all
  expenses, not the filtered view)
- Category breakdown chart (Chart.js)
- CSV export
- Dark mode toggle
- Loading spinner and Bootstrap alerts for every error case

## Demo video

[https://drive.google.com/file/d/19gkBowlia8YF5iYkGUYWNKDFPMYLSTl-/view?usp=sharing]

## GitHub repository

[Add your GitHub repo link here]

## Notes

- `.env` is not included in this delivery; recreate it from `.env.example`.
- `node_modules` is not included; run `npm install` in `backend/` first.