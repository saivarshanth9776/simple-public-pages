# Simple Pages (Windows-friendly edition)

This version removes `better-sqlite3`, so it does not require Visual Studio C++ build tools. It uses Express plus a JSON file for local persistence.

## Run on Windows

1. Extract the ZIP.
2. Open the extracted folder in VS Code.
3. In the terminal, run:
   ```powershell
   npm install
   npm start
   ```
4. Open `http://localhost:3000`.
5. Dashboard: `http://localhost:3000/dashboard`.

Page content is stored in `data/pages.json` locally.

## Routes

- `/` — homepage
- `/dashboard` — page dashboard
- `/editor/:id` — editor
- `/p/:id` — public page (published pages only)

## Important before online hosting

The JSON file is useful for local testing, but many free web hosts use temporary filesystems. If deployed on such a host, pages may disappear after a restart/redeploy. For reliable online use, connect a persistent hosted database or a host with durable persistent storage.

This starter has no login, as requested. Anyone who can access the dashboard can create, edit, or delete pages. Do not use it for private or sensitive information.
