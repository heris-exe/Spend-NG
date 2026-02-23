# Expense Tracker 2026 (React)

A simple **React** web app to track daily expenses in **₦ (Naira)**. No Excel — add expenses, see dashboard totals, and filter the log by date. Data is stored in your browser (localStorage).

## Why React?

- **Components**: Dashboard, form, and log are separate components — easy to change or reuse.
- **State in one place**: `App.jsx` holds expenses and passes handlers down; no DOM queries.
- **Vite**: Fast dev server and builds; `npm run dev` and `npm run build` are all you need.
- **Easier to extend**: Add export, charts, or a backend later by adding components or hooks.

## What it does

- **Dashboard**: Today’s total, this month’s total, all-time total.
- **Add expense**: Date, category, description, amount (₦), payment method, notes. Edit existing entries by clicking Edit in the table.
- **Daily log**: Table of expenses with optional date filter; Edit and Delete per row.
- **Persistence**: Same `localStorage` key as before (`expense-tracker-2026`), so existing data from the vanilla app still loads.

## Prerequisites

- **Node.js** (v18 or newer). Check: `node -v`
- **npm** (comes with Node). Check: `npm -v`

## Run locally

```bash
cd /home/heris/Documents/expense-tracker
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Build for production (e.g. to host)

```bash
npm run build
```

Output is in the **dist/** folder. Upload that folder to any static host (Netlify, Vercel, GitHub Pages, or your own server). Data still lives in the user’s browser (localStorage).

Preview the production build locally:

```bash
npm run preview
```

## Project structure

```
expense-tracker/
  index.html          # Vite entry
  package.json
  vite.config.js
  src/
    main.jsx          # React entry
    App.jsx           # State, localStorage, layout
    App.css           # App styles
    index.css         # Global (e.g. CSS variables)
    constants.js      # STORAGE_KEY, CATEGORIES, PAYMENT_METHODS
    utils/
      helpers.js      # formatAmount, getDayOfWeek, todayStr
    components/
      Dashboard.jsx   # Today / month / all-time stats
      ExpenseForm.jsx # Add or edit expense
      ExpenseLog.jsx  # Filter + table + edit/delete
  README.md
```

## Tips

- **Change categories**: Edit `CATEGORIES` in `src/constants.js`.
- **Change payment methods**: Edit `PAYMENT_METHODS` in `src/constants.js`.
- **New features**: Add a new component (e.g. `ExportButton.jsx`) and use it in `App.jsx`; keep state in `App` or in a custom hook.
