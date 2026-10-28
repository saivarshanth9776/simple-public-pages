const express = require("express");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "pages.json");

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "[]", "utf8");

function readPages() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function writePages(pages) {
  const tempFile = DB_FILE + ".tmp";
  fs.writeFileSync(tempFile, JSON.stringify(pages, null, 2), "utf8");
  fs.renameSync(tempFile, DB_FILE);
}
function findPage(id) { return readPages().find(p => p.id === id); }

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/pages", (_req, res) => {
  const pages = readPages()
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .map(({ id, title, published, created_at, updated_at }) => ({ id, title, published, created_at, updated_at }));
  res.json(pages);
});

app.post("/api/pages", (req, res) => {
  const pages = readPages();
  const title = String(req.body.title || "Untitled page").trim().slice(0, 160) || "Untitled page";
  const body = String(req.body.body || "").slice(0, 100000);
  const now = new Date().toISOString();
  const page = { id: crypto.randomBytes(6).toString("hex"), title, body, published: false, created_at: now, updated_at: now };
  pages.push(page);
  writePages(pages);
  res.status(201).json(page);
});

app.get("/api/pages/:id", (req, res) => {
  const page = findPage(req.params.id);
  if (!page) return res.status(404).json({ error: "Page not found" });
  res.json({ ...page, published: page.published ? 1 : 0 });
});

app.put("/api/pages/:id", (req, res) => {
  const pages = readPages();
  const index = pages.findIndex(p => p.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: "Page not found" });
  const title = String(req.body.title || "Untitled page").trim().slice(0, 160) || "Untitled page";
  const body = String(req.body.body || "").slice(0, 100000);
  pages[index] = { ...pages[index], title, body, published: !!req.body.published, updated_at: new Date().toISOString() };
  writePages(pages);
  res.json({ ...pages[index], published: pages[index].published ? 1 : 0 });
});

app.delete("/api/pages/:id", (req, res) => {
  const pages = readPages();
  const filtered = pages.filter(p => p.id !== req.params.id);
  if (filtered.length === pages.length) return res.status(404).json({ error: "Page not found" });
  writePages(filtered);
  res.json({ success: true });
});

app.get("/p/:id", (req, res) => {
  const page = findPage(req.params.id);
  if (!page || !page.published) return res.status(404).sendFile(path.join(__dirname, "public", "not-found.html"));
  res.sendFile(path.join(__dirname, "public", "public-page.html"));
});
app.get("/editor/:id", (_req, res) => res.sendFile(path.join(__dirname, "public", "editor.html")));
app.get("/dashboard", (_req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

app.listen(PORT, "0.0.0.0", () => console.log(`Simple Pages running on port ${PORT}`));