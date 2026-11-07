const SUPABASE_URL = "https://dymdsrzahlsnxbaefano.supabase.co";
const SUPABASE_KEY = "sb_publishable_1M188MN2wyKEWFo8h6uXMg_NcVEY6k5";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $ = (id) => document.getElementById(id);

function esc(v) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(v ?? "").replace(/[&<>"']/g, (c) => map[c]);
}

function toast(text, bad = false) {
  const t = document.createElement("div");
  t.className = "toast" + (bad ? " bad" : "");
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function friendlyError(error) {
  if (error.code === "23503") return "لا يمكن الحذف: مرتبط ببيانات أخرى";
  if (error.code === "23505") return "هذا الاسم موجود مسبقًا";
  if (error.code === "42501") return "ليست لديك صلاحية، سجّل الدخول من جديد";
  return error.message;
}

async function requireLogin() {
  const { data } = await db.auth.getSession();
  if (!data.session) {
    location.href = "login.html";
    return null;
  }
  return data.session.user;
}

async function logout() {
  await db.auth.signOut();
  location.href = "login.html";
}