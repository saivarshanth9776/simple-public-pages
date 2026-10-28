const pagesEl = document.getElementById("pages");
const messageEl = document.getElementById("message");
async function loadPages() {
  try {
    const res = await fetch("/api/pages");
    const pages = await res.json();
    if (!pages.length) {
      pagesEl.innerHTML = '<div class="card empty"><h2>Your first page starts here</h2><p class="muted">Create a page, add your text, then publish it.</p><button class="small-btn dark" onclick="createPage()">＋ Create your first page</button></div>';
      return;
    }
    pagesEl.innerHTML = pages.map(p => `<article class="card page-row">
      <div><h3>${escapeHtml(p.title)}<span class="badge ${p.published ? "published" : "draft"}">${p.published ? "Published" : "Draft"}</span></h3>
      <p>Updated ${new Date(p.updated_at).toLocaleString()}</p></div>
      <div class="row-actions"><a class="small-btn" href="/editor/${encodeURIComponent(p.id)}">Edit</a>
      ${p.published ? `<a class="small-btn" target="_blank" rel="noopener" href="/p/${encodeURIComponent(p.id)}">View page ↗</a><button class="small-btn" onclick="copyLink('${p.id}')">Copy link</button>` : ""}
      <button class="small-btn" onclick="deletePage('${p.id}')">Delete</button></div></article>`).join("");
  } catch { pagesEl.innerHTML = '<div class="card error">Could not load pages. Please refresh.</div>'; }
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
async function createPage() {
  const res = await fetch("/api/pages", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:"Untitled page",body:""})});
  const page = await res.json();
  location.href = `/editor/${page.id}`;
}
document.getElementById("createBtn").addEventListener("click", createPage);
async function deletePage(id) {
  if (!confirm("Delete this page permanently?")) return;
  const res = await fetch(`/api/pages/${id}`, {method:"DELETE"});
  if (res.ok) { messageEl.innerHTML = '<div class="notice">Page deleted.</div>'; loadPages(); }
}
async function copyLink(id) {
  const url = `${location.origin}/p/${id}`;
  try { await navigator.clipboard.writeText(url); messageEl.innerHTML = '<div class="notice">Public link copied: ' + escapeHtml(url) + '</div>'; }
  catch { prompt("Copy this public link:", url); }
}
loadPages();