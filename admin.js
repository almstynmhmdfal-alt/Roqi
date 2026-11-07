/* =========================================
   بطولة رقي - لوحة الإدارة (admin.js)
   نسخة مُعاد إنشاؤها · تعمل مع admin.html الحالي
========================================= */

const STORAGE_KEY = "roqi-admin-demo-v1"; // نفس المفتاح القديم، فلا تضيع بياناتك

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const makeId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const POSITIONS = ["حارس مرمى", "مدافع", "وسط", "مهاجم"];
const EVENT_LABELS = {
  goal: "⚽ هدف",
  yellow: "🟨 بطاقة صفراء",
  red: "🟥 بطاقة حمراء",
  substitution: "🔄 تبديل"
};

const defaultData = {
  settings: {
    tournamentName: "بطولة رقي",
    tournamentEdition: "النسخة الثالثة",
    matchDuration: 60,
    defaultReferee: "محمد يحي ربيع",
    stadiumName: "ملعب بوطريفية",
    accentColor: "#12b8b0"
  },
  teams: [
    { id: "team1", name: "السنوارييون", group: "A" },
    { id: "team2", name: "فلسطين", group: "A" },
    { id: "team3", name: "كتائب القسام", group: "A" },
    { id: "team4", name: "النصر", group: "A" },
    { id: "team5", name: "البركة", group: "B" },
    { id: "team6", name: "النسور", group: "B" },
    { id: "team7", name: "الأسود", group: "B" },
    { id: "team8", name: "غزة", group: "B" }
  ],
  players: [],
  matches: [],
  events: []
};

/* =========================================
   طبقة التخزين (هنا سنستبدل localStorage بـ Firebase لاحقًا)
========================================= */

function normalize(parsed) {
  const base = structuredClone(defaultData);
  return {
    settings: { ...base.settings, ...(parsed.settings || {}) },
    teams: Array.isArray(parsed.teams) ? parsed.teams : [],
    players: Array.isArray(parsed.players) ? parsed.players : [],
    match