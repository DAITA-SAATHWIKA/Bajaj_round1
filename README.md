# Hierarchical Node Visualizer

This is a full-stack project utilizing a beautiful, glassmorphic UI built in plain HTML/CSS/JS with an Express/Node.js backend for resolving directed graphs, separating node trees from cycles efficiently.

## Features

- Dynamic Tree evaluation computing depth and roots.
- Cycle Detection identifying invalid acyclic relationships.
- Elegant Edge parsing resolving incorrect inputs based on multiple-parent constraint.
- Glassmorphic Premium Frontend interface.

## Prerequisites

- Node.js (v14+)
- npm (v6+)

## Project Structure
```text
/backend
  - server.js
  - routes/bfhl.js
/frontend
  - index.html
  - script.js
  - styles.css
```

---

## Local Setup

### 1. Run Backend
1. Open a terminal and navigate to the `backend` directory.
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (runs on `http://localhost:3000`):
   ```bash
   node server.js
   ```

### 2. Run Frontend
The frontend requires no build steps. 
1. Open `frontend/index.html` in your web browser. 
2. Use Live Server (VS Code Extension) or double-click to view the interface.

---

## Deployment Steps

This project is modular and perfectly suited for cloud hosting:

### Backend Deployment (Render)
1. Commit this project to a GitHub repository.
2. Go to [Render](https://render.com/), sign in, and click "New Web Service".
3. Connect your repository.
4. Set the "Root Directory" to `backend`.
5. Set Build Command: `npm install`
6. Set Start Command: `node server.js`
7. Click **Deploy Web Service**.

*Note: Update `script.js` in the frontend to point to your new Render URL instead of `http://localhost:3000`!*

### Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com/) and sign in.
2. Click **Add New Project** and link your GitHub repo.
3. Keep the Root directory as the base or set it explicitly to `frontend`.
4. Leave Build Command empty. Vercel will map raw `HTML/CSS/JS` beautifully.
5. Click **Deploy** to take your SPA live.
