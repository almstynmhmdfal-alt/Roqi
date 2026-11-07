
/* =========================================
   بطولة رقي - لوحة الإدارة
   جدولة المباريات وإدارة الأحداث
========================================= */

const STORAGE_KEY = "roqi-admin-demo-v1";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const makeId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

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

let data = loadData();
let editingMatchId = null;
let editingEventId = null;
let editingTeamId = null;
let editingPlayerId = null;

/* =========================================
   تحميل وحفظ البيانات
========================================= */

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(defaultData);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(defaultData),
      ...parsed,
      settings: {
        ...defaultData.settings,
        ...(parsed.settings || {})
      },
      teams: Array.isArray(parsed.teams) ? parsed.teams : [],
      players: Array.isArray(parsed.players) ? parsed.players : [],
      matches: Array.isArray(parsed.matches) ? parsed.matches : [],
      events: Array.isArray(parsed.events) ? parsed.events : []
    };
  } catch (error) {
    console.error("تعذر تحميل البيانات:", error);
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return map[char];
  });
}

function showToast(message, type = "success") {
  const container = $("#toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3200);
}

/* =========================================
   أدوات عامة
========================================= */

function getTeam(teamId) {
  return data.teams.find((team) => team.id === teamId);
}

function getPlayer(playerId) {
  return data.players.find((player) => player.id === playerId);
}

function getMatch(matchId) {
  return data.matches.find((match) => match.id === matchId);
}

function teamName(teamId) {
  return getTeam(teamId)?.name || "فريق غير معروف";
}

function playerName(playerId) {
  return getPlayer(playerId)?.name || "لاعب غير معروف";
}

function formatDate(dateValue) {
  if (!dateValue) return "لم يحدد";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "موعد غير صالح";

  return new Intl.DateTimeFormat("ar-MR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function getMatchEvents(matchId) {
  return data.events.filter((event) => event.matchId === matchId);
}

function getMatchScore(matchId) {
  const match = getMatch(matchId);

  if (!match) return { home: 0, away: 0 };

  const goals = getMatchEvents(matchId).filter(
    (event) => event.type === "goal"
  );

  return {
    home: goals.filter((event) => event.teamId === match.homeTeamId).length,
    away: goals.filter((event) => event.teamId === match.awayTeamId).length
  };
}

function getAddedMinutes(match) {
  return Number(match.firstHalfAdded || 0) +
    Number(match.secondHalfAdded || 0);
}

/* =========================================
   حالة المباراة تلقائيًا
========================================= */

function getMatchStatus(match) {
  if (match.manualStatus === "finished") {
    return "finished";
  }

  if (match.manualStatus === "live") {
    return "live";
  }

  if (!match.dateTime) {
    return "upcoming";
  }

  const start = new Date(match.dateTime).getTime();

  if (Number.isNaN(start)) {
    return "upcoming";
  }

  const now = Date.now();

  if (now < start) {
    return "upcoming";
  }

  const duration = Number(
    match.duration || data.settings.matchDuration || 60
  );

  const added = getAddedMinutes(match);

  const endTime = start + (duration + added) * 60 * 1000;

  if (now >= endTime) {
    return "finished";
  }

  return "live";
}

function statusLabel(status) {
  const labels = {
    upcoming: "قادمة",
    live: "جارية",
    finished: "انتهت"
  };

  return labels[status] || "غير محددة";
}

function statusClass(status) {
  return status || "upcoming";
}

function matchStatusHTML(match) {
  const status = getMatchStatus(match);

  return `
    <span class="match-status ${statusClass(status)}">
      ${statusLabel(status)}
    </span>
  `;
}

/* =========================================
   التنقل بين صفحات الإدارة
========================================= */

function openSection(sectionId) {
  $$(".page-section").forEach((section) => {
    section.classList.toggle("active", section.id === sectionId);
  });

  $$(".nav-item").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.section === sectionId
    );
  });

  const activeButton = $(`.nav-item[data-section="${sectionId}"]`);

  if (activeButton) {
    $("#pageTitle").textContent =
      activeButton.querySelector("span:last-child")?.textContent ||
      "لوحة الإدارة";
  }

  $("#sidebar")?.classList.remove("open");
}

$$(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    openSection(button.dataset.section);
  });
});

$$("[data-open-section]").forEach((button) => {
  button.addEventListener("click", () => {
    openSection(button.dataset.openSection);
  });
});

$("#menuToggle")?.addEventListener("click", () => {
  $("#sidebar")?.classList.toggle("open");
});

/* =========================================
   النافذة المنبثقة
========================================= */

function openModal(title, content) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = content;
  $("#modalOverlay").classList.add("open");
}

function closeModal() {
  $("#modalOverlay").classList.remove("open");
  $("#modalBody").innerHTML = "";

  editingMatchId = null;
  editingEventId = null;
  editingTeamId = null;
  editingPlayerId = null;
}

$("#modalClose")?.addEventListener("click", closeModal);

$("#modalOverlay")?.addEventListener("click", (event) => {
  if (event.target === $("#modalOverlay")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

/* =========================================
   خيارات الفرق واللاعبين
========================================= */

function teamOptions(selectedId = "", includeEmpty = false) {
  let html = includeEmpty
    ? `<option value="">اختر الفريق</option>`
    : "";

  html += data.teams.map((team) => `
    <option
      value="${escapeHTML(team.id)}"
      ${team.id === selectedId ? "selected" : ""}
    >
      ${escapeHTML(team.name)} - المجموعة ${escapeHTML(team.group)}
    </option>
  `).join("");

  return html;
}

function playerOptions(teamId = "", selectedId = "", includeEmpty = true) {
  const players = data.players.filter((player) => {
    return !teamId || player.teamId === teamId;
  });

  let html = includeEmpty
    ? `<option value="">لا يوجد / غير محدد</option>`
    : "";

  html += players.map((player) => `
    <option
      value="${escapeHTML(player.id)}"
      ${player.id === selectedId ? "selected" : ""}
    >
      ${escapeHTML(player.name)}
    </option>
  `).join("");

  return html;
}

function matchOptions(selectedId = "") {
  let html = `<option value="">اختر المباراة</option>`;

  html += data.matches.map((match) => `
    <option
      value="${escapeHTML(match.id)}"
      ${match.id === selectedId ? "selected" : ""}
    >
      ${escapeHTML(teamName(match.homeTeamId))}
      ×
      ${escapeHTML(teamName(match.awayTeamId))}
      — ${escapeHTML(formatDate(match.dateTime))}
    </option>
  `).join("");

  return html;
}

/* =========================================
   إضافة وتعديل مباراة
========================================= */

function openMatchForm(matchId = null) {
  const match = matchId ? getMatch(matchId) : null;

  editingMatchId = matchId;

  const currentDate = match?.dateTime
    ? new Date(match.dateTime)
    : null;

  const localDateTime = currentDate
    ? new Date(
        currentDate.getTime() -
        currentDate.getTimezoneOffset() * 60000
      ).toISOString().slice(0, 16)
    : "";

  const content = `
    <form id="matchForm">

      <div class="form-grid">

        <div class="form-group">
          <label>الفريق الأول</label>
          <select name="homeTeamId" required>
            ${teamOptions(match?.homeTeamId || "", true)}
          </select>
        </div>

        <div class="form-group">
          <label>الفريق الثاني</label>
          <select name="awayTeamId" required>
            ${teamOptions(match?.awayTeamId || "", true)}
          </select>
        </div>

        <div class="form-group">
          <label>المجموعة</label>
          <select name="group" required>
            <option value="A" ${match?.group === "A" ? "selected" : ""}>
              المجموعة A
            </option>
            <option value="B" ${match?.group === "B" ? "selected" : ""}>
              المجموعة B
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>تاريخ ووقت المباراة</label>
          <input
            type="datetime-local"
            name="dateTime"
            value="${escapeHTML(localDateTime)}"
            required
          >
        </div>

        <div class="form-group">
          <label>حكم اللقاء</label>
          <input
            type="text"
            name="referee"
            value="${escapeHTML(
              match?.referee || data.settings.defaultReferee
            )}"
            placeholder="اسم الحكم"
            required
          >
        </div>

        <div class="form-group">
          <label>الملعب</label>
          <input
            type="text"
            name="stadium"
            value="${escapeHTML(
              match?.stadium || data.settings.stadiumName
            )}"
            placeholder="اسم الملعب"
          >
        </div>

        <div class="form-group">
          <label>مدة المباراة بالدقائق</label>
          <input
            type="number"
            name="duration"
            min="1"
            value="${escapeHTML(
              match?.duration || data.settings.matchDuration
            )}"
            required
          >
          <small>يمكن تخصيص مدة مختلفة لهذه المباراة.</small>
        </div>

        <div class="form-group">
          <label>الجولة</label>
          <input
            type="text"
            name="round"
            value="${escapeHTML(match?.round || "")}"
            placeholder="مثال: الجولة الأولى"
          >
        </div>

      </div>

      <div class="form-actions">
        <button class="primary-btn" type="submit">
          ${match ? "حفظ التعديلات" : "إضافة المباراة"}
        </button>

        <button class="secondary-btn" type="button" id="cancelMatch">
          إلغاء
        </button>
      </div>

    </form>
  `;

  openModal(match ? "تعديل المباراة" : "جدولة مباراة جديدة", content);

  $("#cancelMatch").addEventListener("click", closeModal);

  $("#matchForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const homeTeamId = form.get("homeTeamId");
    const awayTeamId = form.get("awayTeamId");

    if (homeTeamId === awayTeamId) {
      showToast("يجب اختيار فريقين مختلفين", "error");
      return;
    }

    const homeTeam = getTeam(homeTeamId);
    const awayTeam = getTeam(awayTeamId);

    if (!homeTeam || !awayTeam) {
      showToast("الفريق غير موجود", "error");
      return;
    }

    if (homeTeam.group !== awayTeam.group) {
      showToast("يجب أن يكون الفريقان من المجموعة نفسها", "error");
      return;
    }

    const matchData = {
      id: match?.id || makeId(),
      homeTeamId,
      awayTeamId,
      group: form.get("group"),
      dateTime: new Date(form.get("dateTime")).toISOString(),
      referee: form.get("referee").trim(),
      stadium: form.get("stadium").trim(),
      duration: Number(form.get("duration")),
      round: form.get("round").trim(),
      firstHalfAdded: match?.firstHalfAdded || 0,
      secondHalfAdded: match?.secondHalfAdded || 0,
      manualStatus: match?.manualStatus || "auto"
    };

    if (!matchData.duration || matchData.duration < 1) {
      showToast("أدخل مدة صحيحة للمباراة", "error");
      return;
    }

    if (match) {
      data.matches = data.matches.map((item) =>
        item.id === match.id ? matchData : item
      );
    } else {
      data.matches.push(matchData);
    }

    saveData();
    closeModal();
    renderAll();

    showToast(match ? "تم تعديل المباراة" : "تمت جدولة المباراة");
  });
}

$("#addMatchBtn")?.addEventListener("click", () => {
  openMatchForm();
});

/* =========================================
   إدارة أحداث المباراة
========================================= */

function openEventForm(eventId = null, presetMatchId = "") {
  const existing = eventId
    ? data.events.find((item) => item.id === eventId)
    : null;

  editingEventId = eventId;

  const selectedMatchId = existing?.matchId || presetMatchId;
  const selectedMatch = getMatch(selectedMatchId);

  const selectedTeamId = existing?.teamId ||
    selectedMatch?.homeTeamId ||
    "";

  const content = `
    <form id="eventForm">

      <div class="form-grid">

        <div class="form-group full-width">
          <label>المباراة</label>
          <select name="matchId" id="eventMatchSelect" required>
            ${matchOptions(selectedMatchId)}
          </select>
        </div>

        <div class="form-group">
          <label>نوع الحدث</label>
          <select name="type" id="eventTypeSelect" required>
            <option value="goal" ${existing?.type === "goal" ? "selected" : ""}>
              ⚽ هدف
            </option>
            <option value="yellow" ${existing?.type === "yellow" ? "selected" : ""}>
              🟨 بطاقة صفراء
            </option>
            <option value="red" ${existing?.type === "red" ? "selected" : ""}>
              🟥 بطاقة حمراء
            </option>
            <option value="substitution" ${existing?.type === "substitution" ? "selected" : ""}>
              🔄 تبديل
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>الفريق</label>
          <select name="teamId" id="eventTeamSelect" required>
            ${teamOptions(selectedTeamId, true)}
          </select>
        </div>

        <div class="form-group">
          <label>دقيقة الحدث</label>
          <input
            type="number"
            name="minute"
            min="0"
            value="${escapeHTML(existing?.minute ?? 1)}"
            required
          >
          <small>أدخل الدقيقة الأساسية، مثل 45 أو 90.</small>
        </div>

        <div class="form-group">
          <label>الوقت بدل الضائع</label>
          <input
            type="number"
            name="addedMinute"
            min="0"
            value="${escapeHTML(existing?.addedMinute ?? 0)}"
          >
          <small>مثال: 45+3، أدخل هنا 3.</small>
        </div>

        <div class="form-group full-width">
          <label>اللاعب</label>
          <select name="playerId" id="eventPlayerSelect">
            ${playerOptions(selectedTeamId, existing?.playerId || "")}
          </select>
        </div>

        <div class="form-group full-width" id="assistGroup">
          <label>صانع الهدف</label>
          <select name="assistPlayerId" id="assistPlayerSelect">
            ${playerOptions(selectedTeamId, existing?.assistPlayerId || "")}
          </select>
        </div>

        <div class="form-group full-width" id="substitutionGroup">
          <label>اللاعب البديل</label>
          <select name="substitutePlayerId" id="substitutePlayerSelect">
            ${playerOptions(selectedTeamId, existing?.substitutePlayerId || "")}
          </select>
        </div>

        <div class="form-group full-width">
          <label>ملاحظات</label>
          <input
            type="text"
            name="notes"
            value="${escapeHTML(existing?.notes || "")}"
            placeholder="ملاحظات اختيارية"
          >
        </div>

      </div>

      <div class="form-actions">
        <button class="primary-btn" type="submit">
          ${existing ? "حفظ التعديل" : "إضافة الحدث"}
        </button>

        <button class="secondary-btn" type="button" id="cancelEvent">
          إلغاء
        </button>
      </div>

    </form>
  `;

  openModal(existing ? "تعديل حدث" : "إضافة حدث للمباراة", content);

  const matchSelect = $("#eventMatchSelect");
  const teamSelect = $("#eventTeamSelect");
  const typeSelect = $("#eventTypeSelect");

  function refreshEventPlayerOptions() {
    const teamId = teamSelect.value;

    $("#eventPlayerSelect").innerHTML = playerOptions(
      teamId,
      existing?.playerId || ""
    );

    $("#assistPlayerSelect").innerHTML = playerOptions(
      teamId,
      existing?.assistPlayerId || ""
    );

    $("#substitutePlayerSelect").innerHTML = playerOptions(
      teamId,
      existing?.substitutePlayerId || ""
    );
  }

  function refreshEventTeamOptions() {
    const match = getMatch(matchSelect.value);

    if (!match) {
      teamSelect.innerHTML = teamOptions("", true);
      refreshEventPlayerOptions();
      return;
    }

    const previousTeamId = teamSelect.value;

    teamSelect.innerHTML = `
      <option value="${match.homeTeamId}">
        ${escapeHTML(teamName(match.homeTeamId))}
      </option>
      <option value="${match.awayTeamId}">
        ${escapeHTML(teamName(match.awayTeamId))}
      </option>
    `;

    if (
      previousTeamId === match.homeTeamId ||
      previousTeamId === match.awayTeamId
    ) {
      teamSelect.value = previousTeamId;
    }

    refreshEventPlayerOptions();
  }

  function refreshEventTypeFields() {
    const type = typeSelect.value;

    $("#assistGroup").style.display =
      type === "goal" ? "" : "none";

    $("#substitutionGroup").style.display =
      type === "substitution" ? "" : "none";
  }

  matchSelect.addEventListener("change", refreshEventTeamOptions);
  teamSelect.addEventListener("change", refreshEventPlayerOptions);
  typeSelect.addEventListener("change", refreshEventTypeFields);

  $("#cancelEvent").addEventListener("click", closeModal);

  refreshEventTeamOptions();
  refreshEventTypeFields();

  $("#eventForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const matchId = form.get("matchId");
    const match = getMatch(matchId);
    const teamId = form.get("teamId");
    const type = form.get("type");
    const playerId = form.get("playerId") || "";
    const assistPlayerId = form.get("assistPlayerId") || "";
    const substitutePlayerId = form.get("substitutePlayerId") || "";

    if (!match) {
      showToast("اختر مباراة صحيحة", "error");
      return;