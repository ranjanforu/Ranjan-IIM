# Taskflow — Task Manager

A responsive task manager built with React + Vite. It includes task creation and editing, completion tracking, a monthly calendar, due-date indicators, filters, and a progress dashboard.

## Features

- Create, edit, complete, and delete tasks
- Assign a due date and priority to each task
- Monthly calendar with task counts on each day
- Dashboard for total, completed, pending, due today, overdue, and completion rate
- Views for all, pending, completed, and overdue tasks
- Search tasks by title or description
- Data persists in the browser with `localStorage`
- Responsive layout for desktop and mobile

## Run locally

Install Node.js 18 or newer, then:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build for production

```bash
npm run build
npm run preview
```

Vite creates the production site in `dist/`.

## Publish to GitHub

1. Create a new empty repository on GitHub.
2. Extract this ZIP.
3. In a terminal, open the extracted project folder and run:

```bash
git init
git add .
git commit -m "Build Taskflow task manager"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the remote URL with your repository URL.

## Deploy to Vercel

1. Sign in to [Vercel](https://vercel.com/) and choose **Add New → Project**.
2. Import your GitHub repository.
3. Vercel should detect **Vite** automatically.
4. Keep the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
5. Select **Deploy**.

Every push to the connected GitHub branch can trigger a new deployment.

## Important data note

This starter app stores tasks in the current browser's `localStorage`. That means tasks stay on the same browser/device, but they are not synced between devices and are not backed up to a server. Clearing browser storage removes the saved tasks. For multi-device access, accounts, or shared tasks, connect a database and authentication service (for example, Supabase) in a later version.

## Customize

- Main app: `src/App.jsx`
- Styling: `src/styles.css`
- App entry: `src/main.jsx`
