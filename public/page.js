const id = location.pathname.split("/").filter(Boolean).pop();
fetch(`/api/pages/${encodeURIComponent(id)}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(p => {
  if (!p.published) throw new Error();
  document.title = p.title + " · Simple Pages";
  document.getElementById("title").textContent = p.title;
  document.getElementById("body").textContent = p.body;
}).catch(() => { document.getElementById("title").textContent = "Page not found"; document.getElementById("body").textContent = "This page may have been unpublished or deleted."; });