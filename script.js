
// =================================
// بطولة رقي - النسخة الثالثة
// بيانات تجريبية قابلة للاستبدال
// =================================

const tournament = {
  name: "بطولة رقي",
  edition: "النسخة الثالثة",
  venue: "ملعب بوطريفية"
};

// الفرق التجريبية
const teams = [
  "فريق النسور",
  "فريق الأمل",
  "فريق النجوم",
  "فريق الصقور",
  "فريق الوحدة",
  "فريق السلام",
  "فريق الوفاق",
  "فريق الشروق"
];

// مباريات تجريبية
const matches = [
  {
    home: "فريق النسور",
    away: "فريق الأمل",
    date: "قريبًا",
    status: "لم تبدأ"
  },
  {
    home: "فريق النجوم",
    away: "فريق الصقور",
    date: "قريبًا",
    status: "لم تبدأ"
  }
];

// ترتيب تجريبي
const standings = teams.map((name, index) => ({
  position: index + 1,
  name: name,
  played: 0,
  points: 0
}));

// قائمة الهدافين
const scorers = [];

// عرض المباريات
function renderMatches() {
  const container = document.querySelector(".match-card");

  if (!container) return;

  container.innerHTML = `
    <span class="demo-label">
      بيانات تجريبية
    </span>

    ${matches.map(match => `
      <div class="match-card-item">

        <div class="teams">
          <div class="team">
            <div class="team-logo">⚽</div>
            <h3>${match.home}</h3>
          </div>

          <div class="match-center">
            <span>VS</span>
            <small>${match.date}</small>
          </div>

          <div class="team">
            <div class="team-logo">⚽</div>
            <h3>${match.away}</h3>
          </div>
        </div>

        <div class="match-info">
          ${tournament.venue} - ${match.status}
        </div>

      </div>
    `).join("")}
  `;
}

// عرض الترتيب
function renderStandings() {
  const tbody = document.querySelector("tbody");

  if (!tbody) return;

  tbody.innerHTML = standings.map(team => `
    <tr>
      <td>${team.position}</td>
      <td>${team.name}</td>
      <td>${team.played}</td>
      <td>${team.points}</td>
    </tr>
  `).join("");
}

// عرض الهدافين
function renderScorers() {
  const container = document.querySelector(".empty-state");

  if (!container) return;

  if (scorers.length === 0) {
    container.innerHTML = `
      <span>⚽</span>
      <p>لم يتم تسجيل أهداف بعد</p>
    `;
  }
}

// تشغيل الموقع
document.addEventListener("DOMContentLoaded", () => {
  renderMatches();
  renderStandings();
  renderScorers();

  console.log("بطولة رقي جاهزة!");
});
