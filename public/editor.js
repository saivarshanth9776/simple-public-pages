const id = location.pathname.split("/").filter(Boolean).pop();
const titleEl = document.getElementById("title");
const bodyEl = document.getElementById("body");
const messageEl = document.getElementById("message");
const statusEl = document.getElementById("status");
const linkBox = document.getElementById("publicLinkBox");
const linkEl = document.getElementById("publicLink");
const openBtn = document.getElementById("openBtn");
let published = false;
function notice(text, error=false) { messageEl.innerHTML = `<div class="notice ${error ? "error" : ""}">${text}</div>`; }
async function load() {
  const res = await fetch(`/api/pages/${encodeURIComponent(id)}`);
  if (!res.ok) { notice("Page not found. Return to the dashboard and create a new page.", true); document.getElementById("editorForm").hidden = true; return; }
  const p = await res.json();
  titleEl.value = p.title; bodyEl.value = p.body; published = !!p.published;
  statusEl.textContent = published ? "Published" : "Draft";
  updateLink();
}
function updateLink() {
  linkBox.hidden = !published;
  linkEl.value = `${location.origin}/p/${id}`;
  openBtn.href = linkEl.value;
}
async function save(makePublished) {
  const title = titleEl.value.trim();
  if (!title) { notice("Please enter a page title.", true); titleEl.focus(); return; }
  const res = await fetch(`/api/pages/${encodeURIComponent(id)}`, {method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,body:bodyEl.value,published:makePublished ? true : published})});
  if (!res.ok) { notice("Could not save your page. Please try again.", true); return; }
  const p = await res.json(); published = !!p.published;
  statusEl.textContent = published ? "Published" : "Draft";
  updateLink();
  notice(published ? "Your page is published! Copy the public link below and share it anywhere." : "Draft saved.");
}
document.getElementById("saveBtn").addEventListener("click", () => save(false));
document.getElementById("publishBtn").addEventListener("click", () => save(true));
document.getElementById("copyBtn").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(linkEl.value); notice("Public link copied to clipboard."); }
  catch { linkEl.select(); document.execCommand("copy"); notice("Public link copied."); }
});
load();