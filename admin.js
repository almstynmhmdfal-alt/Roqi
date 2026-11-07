(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const storageKey = "roqi-admin-demo-v1";

  const initial = {
    teams: [
      "السنوارييون",
      "فلسطين",
      "كتائب القسام",
      "النصر",
      "البركة",
      "النسور",
      "الأسود",
      "غزة"
    ].map((name, i) => ({
      id: i + 1,
      name,
      group: i < 4 ? "A" : "B"
    })),

    matches: [
      {
        id: 1,
        home: "السنوارييون",
        away: "فلسطين",
        homeScore: 2,
        awayScore: 1,
        status: "finished"
      },
      {
        id: 2,
        home: "كتائب القسام",
        away: "النصر",
        homeScore: 0,
        awayScore: 0,
        status: "finished"
      },
      {
        id: 3,
        home: "البركة",
        away: "النسور",
        homeScore: 1,
        awayScore: 3,
        status: "finished"
      },
      {
        id: 4,
        home: "الأسود",
        away: "غزة",
        homeScore: 2,
        awayScore: 2,
        status: "finished"
      },
      {
        id: 5,
        home: "السنوارييون",
        away: "كتائب القسام",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming"
      },
      {
        id: 6,
        home: "فلسطين",
        away: "النصر",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming"
      },
      {
        id: 7,
        home: "البركة",
        away: "الأسود",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming"
      },
      {
        id: 8,
        home: "النسور",
        away: "غزة",
        homeScore: 0,
        awayScore: 0,
        status: "upcoming"
      }
    ],

    players: [],
    events: [],

    settings: {
      title: "بطولة رقي – النسخة الثالثة",
      association: "رابطة بطولة رقي",
      stadium: "ملعب بوطريفية",
      referee: "محمد يحي ربيع",
      accent: "#12b8b0"
    }
  };

  let data;

  try {
    data = JSON.parse(localStorage.getItem(storageKey))
      || structuredClone(initial);
  } catch {
    data = JSON.parse(JSON.stringify(initial));
  }

  let modalAction = null;
  let toastTimer;

  const save = () =>
    localStorage.setItem(storageKey, JSON.stringify(data));

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));

  const statusText = (s) => ({
    finished: "انتهت",
    upcoming: "لم تبدأ",
    live: "جارية"
  }[s] || s);

  const statusClass = (s) => ({
    finished: "finished",
    upcoming: "upcoming",
    live: "live"
  }[s] || "upcoming");

  const toast = (msg) => {
    const el = $("#toast");

    el.textContent = msg;
    el.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 2400);
  };

  function switchView(name) {
    $$(".view").forEach(v =>
      v.classList.toggle("active", v.id === `view-${name}`)
    );

    $$(".nav-item").forEach(b =>
      b.classList.toggle("active", b.dataset.view === name)
    );

    const labels = {
      overview: "نظرة عامة",
      matches: "إدارة المباريات",
      teams: "إدارة الفرق",
      players: "إدارة اللاعبين",
      events: "أحداث المباريات",
      settings: "إعدادات البطولة"
    };

    $("#pageTitle").textContent = labels[name] || "لوحة الإدارة";

    $("#sidebar").classList.remove("open");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function matchCard(m) {
    return `
      <div class="mini-match">
        <div>
          <div class="teams">
            ${esc(m.home)}
            <span style="color:#9aa6ae">×</span>
            ${esc(m.away)}
          </div>
          <div class="state">${statusText(m.status)}</div>
        </div>

        <div class="score">
          ${
            m.status === "upcoming"
              ? "—"
              : `${m.homeScore} : ${m.awayScore}`
          }
        </div>
      </div>
    `;
  }

  function renderOverview() {
    $("#statMatches").textContent = data.matches.length;
    $("#statTeams").textContent = data.teams.length;
    $("#statPlayers").textContent = data.players.length;
    $("#statEvents").textContent = data.events.length;

    $("#overviewMatches").innerHTML =
      data.matches.slice(0, 4).map(matchCard).join("")
      || '<p class="empty">لا توجد مباريات بعد.</p>';
  }

  function renderMatches() {
    const q = $("#matchSearch").value.trim().toLowerCase();
    const f = $("#matchFilter").value;

    const rows = data.matches.filter(m =>
      (f === "all" || m.status === f)
      && `${m.home} ${m.away}`.toLowerCase().includes(q)
    );

    $("#matchesTable").innerHTML = rows.map(m => `
      <tr>
        <td>
          <div class="match-name">
            ${esc(m.home)}
            <span style="color:#91a0a8">×</span>
            ${esc(m.away)}
          </div>
          <div class="match-sub">مباراة تجريبية · #${m.id}</div>
        </td>

        <td class="score-cell">
          ${
            m.status === "upcoming"
              ? "—"
              : `${m.homeScore} : ${m.awayScore}`
          }
        </td>

        <td>
          <span class="status ${statusClass(m.status)}">
            ${statusText(m.status)}
          </span>
        </td>

        <td>
          <button class="action-button" data-edit-match="${m.id}">
            تعديل
          </button>

          <button class="action-button delete" data-delete-match="${m.id}">
            حذف
          </button>
        </td>
      </tr>
    `).join("") || `
      <tr>
        <td colspan="4">لا توجد مباريات مطابقة.</td>
      </tr>
    `;
  }

  function renderTeams() {
    $("#teamsGrid").innerHTML = data.teams.map(t => `
      <article class="team-card">
        <div class="team-badge">${esc(t.name.slice(0, 1))}</div>

        <div class="team-info">
          <b>${esc(t.name)}</b>
          <small>المجموعة ${esc(t.group || "—")}</small>

          <button class="action-button" data-edit-team="${t.id}">
            تعديل
          </button>

          <button class="action-button delete" data-delete-team="${t.id}">
            حذف
          </button>
        </div>
      </article>
    `).join("") || "<p>لم تُضف فرق بعد.</p>";
  }

  function renderPlayers() {
    const filter = $("#playerTeamFilter").value || "all";
    const q = $("#playerSearch").value.trim().toLowerCase();

    $("#playerTeamFilter").innerHTML =
      '<option value="all">كل الفرق</option>'
      + data.teams.map(t => `
        <option value="${esc(t.name)}">${esc(t.name)}</option>
      `).join("");

    $("#playerTeamFilter").value = filter;

    const rows = data.players.filter(p =>
      (filter === "all" || p.team === filter)
      && p.name.toLowerCase().includes(q)
    );

    $("#playersTable").innerHTML = rows.map(p => `
      <tr>
        <td><b>${esc(p.name)}</b></td>
        <td>${esc(p.team)}</td>

        <td>
          <button class="action-button" data-edit-player="${p.id}">
            تعديل
          </button>

          <button class="action-button delete" data-delete-player="${p.id}">
            حذف
          </button>
        </td>
      </tr>
    `).join("") || `
      <tr>
        <td colspan="3">لا يوجد لاعبون مضافون بعد.</td>
      </tr>
    `;
  }

  function renderEvents() {
    $("#eventsList").innerHTML = data.events.map(e => `
      <div class="event-row">
        <span class="event-type">
          ${
            e.type === "هدف"
              ? "⚽"
              : e.type === "بطاقة صفراء"
                ? "🟨"
                : e.type === "بطاقة حمراء"
                  ? "🟥"
                  : "↔"
          }
        </span>

        <div class="event-info">
          <b>${esc(e.type)} · ${esc(e.player)}</b>

          <small>
            ${esc(e.team)}
            ·
            ${esc(e.match || "حدث تجريبي")}
            ${e.minute ? ` · ${esc(e.minute)}'` : ""}
          </small>
        </div>

        <button class="action-button delete" data-delete-event="${e.id}">
          حذف
        </button>
      </div>
    `).join("") || `
      <p style="color:#87959e;text-align:center;padding:25px">
        لا توجد أحداث مسجلة. يمكنك إضافتها من الزر أعلاه.
      </p>
    `;
  }

  function renderAll() {
    renderOverview();
    renderMatches();
    renderTeams();
    renderPlayers();
    renderEvents();
  }

  function field(
    label,
    name,
    type = "text",
    value = "",
    options = null,
    required = true
  ) {
    let input = options
      ? `
        <select name="${name}" ${required ? "required" : ""}>
          ${options.map(o => `
            <option
              value="${esc(o.value)}"
              ${String(o.value) === String(value) ? "selected" : ""}
            >
              ${esc(o.label)}
            </option>
          `).join("")}
        </select>
      `
      : `
        <input
          name="${name}"
          type="${type}"
          value="${esc(value)}"
          ${required ? "required" : ""}
          ${type === "number" ? 'min="0"' : ""}
        >
      `;

    return `<label>${label}${input}</label>`;
  }

  function openModal(title, fields, handler) {
    $("#modalTitle").textContent = title;
    $("#modalFields").innerHTML = fields;
    modalAction = handler;
    $("#modalBackdrop").hidden = false;
  }

  function closeModal() {
    $("#modalBackdrop").hidden = true;
    $("#modalForm").reset();
    modalAction = null;
  }

  function submitModal(e) {
    e.preventDefault();

    if (!modalAction) return;

    const values = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    );

    modalAction(values);

    closeModal();
    save();
    renderAll();
  }

  function addMatch(existing = null) {
    const m = existing || {
      home: data.teams[0]?.name || "",
      away: data.teams[1]?.name || "",
      homeScore: 0,
      awayScore: 0,
      status: "upcoming"
    };

    const teamOptions = data.teams.map(t => ({
      value: t.name,
      label: t.name
    }));

    openModal(
      existing ? "تعديل المباراة" : "إضافة مباراة",

      field("الفريق الأول", "home", "text", m.home, teamOptions)
      + field("الفريق الثاني", "away", "text", m.away, teamOptions)
      + field("نتيجة الفريق الأول", "homeScore", "number", m.homeScore)
      + field("نتيجة الفريق الثاني", "awayScore", "number", m.awayScore)
      + field(
        "حالة المباراة",
        "status",
        "text",
        m.status,
        [
          { value: "upcoming", label: "لم تبدأ" },
          { value: "live", label: "جارية" },
          { value: "finished", label: "انتهت" }
        ]
      ),

      v => {
        if (v.home === v.away) {
          toast("اختر فريقين مختلفين.");
          return;
        }

        if (existing) {
          Object.assign(existing, v, {
            homeScore: +v.homeScore,
            awayScore: +v.awayScore
          });
        } else {
          data.matches.push({
            ...v,
            id: Date.now(),
            homeScore: +v.homeScore,
            awayScore: +v.awayScore
          });
        }

        toast("تم حفظ المباراة على هذا الجهاز.");
      }
    );
  }

  function addTeam(existing = null) {
    const t = existing || {
      name: "",
      group: "A"
    };

    openModal(
      existing ? "تعديل الفريق" : "إضافة فريق",

      field("اسم الفريق", "name", "text", t.name)
      + field(
        "المجموعة",
        "group",
        "text",
        t.group,
        [
          { value: "A", label: "A" },
          { value: "B", label: "B" }
        ]
      ),

      v => {
        if (existing) {
          Object.assign(existing, v);
        } else {
          data.teams.push({
            ...v,
            id: Date.now()
          });
        }

        toast("تم حفظ الفريق محليًا.");
      }
    );
  }

  function addPlayer(existing = null) {
    const p = existing || {
      name: "",
      team: data.teams[0]?.name || ""
    };

    const opts = data.teams.map(t => ({
      value: t.name,
      label: t.name
    }));

    openModal(
      existing ? "تعديل اللاعب" : "إضافة لاعب",

      field("اسم اللاعب", "name", "text", p.name)
      + field("الفريق", "team", "text", p.team, opts),

      v => {
        if (existing) {
          Object.assign(existing, v);
        } else {
          data.players.push({
            ...v,
            id: Date.now()
          });
        }

        toast("تم حفظ اللاعب محليًا.");
      }
    );
  }

  function addEvent() {
    const matchOpts = data.matches.map(m => ({
      value: `${m.home} × ${m.away}`,
      label: `${m.home} × ${m.away}`
    }));

    const teamOpts = data.teams.map(t => ({
      value: t.name,
      label: t.name
    }));

    const playerOpts = [
      { value: "غير محدد", label: "غير محدد" },
      ...data.players.map(p => ({
        value: p.name,
        label: `${p.name} — ${p.team}`
      }))
    ];

    openModal(
      "إضافة حدث للمباراة",

      field(
        "نوع الحدث",
        "type",
        "text",
        "هدف",
        [
          { value: "هدف", label: "هدف" },
          { value: "بطاقة صفراء", label: "بطاقة صفراء" },
          { value: "بطاقة حمراء", label: "بطاقة حمراء" },
          { value: "تبديل", label: "تبديل" }
        ]
      )
      + field(
        "المباراة",
        "match",
        "text",
        matchOpts[0]?.value || "",
        matchOpts,
        false
      )
      + field(
        "الفريق",
        "team",
        "text",
        teamOpts[0]?.value || "",
        teamOpts
      )
      + field(
        "اللاعب",
        "player",
        "text",
        "غير محدد",
        playerOpts,
        false
      )
      + field(
        "الدقيقة",
        "minute",
        "number",
        "",
        null,
        false
      ),

      v => {
        data.events.push({
          ...v,
          id: Date.now()
        });

        toast("تم تسجيل الحدث محليًا.");
      }
    );
  }

  $$(".nav-item").forEach(b =>
    b.addEventListener("click", () => switchView(b.dataset.view))
  );

  $$("[data-go]").forEach(b =>
    b.addEventListener("click", () => switchView(b.dataset.go))
  );

  $("#menuToggle").addEventListener("click", () =>
    $("#sidebar").classList.toggle("open")
  );

  $("#addMatchBtn").addEventListener("click", () => addMatch());
  $("#addTeamBtn").addEventListener("click", () => addTeam());
  $("#addPlayerBtn").addEventListener("click", () => addPlayer());
  $("#addEventBtn").addEventListener("click", addEvent);

  $("#matchSearch").addEventListener("input", renderMatches);
  $("#matchFilter").addEventListener("change", renderMatches);

  $("#playerSearch").addEventListener("input", renderPlayers);
  $("#playerTeamFilter").addEventListener("change", renderPlayers);

  $("#closeModal").addEventListener("click", closeModal);
  $("#cancelModal").addEventListener("click", closeModal);

  $("#modalBackdrop").addEventListener("click", e => {
    if (e.target === $("#modalBackdrop")) {
      closeModal();
    }
  });

  $("#modalForm").addEventListener("submit", submitModal);

  document.addEventListener("click", e => {
    const b = e.target.closest("button");

    if (!b) return;

    if (b.dataset.editMatch) {
      const m = data.matches.find(
        x => x.id === +b.dataset.editMatch
      );

      if (m) addMatch(m);
    }

    if (b.dataset.deleteMatch) {
      data.matches = data.matches.filter(
        x => x.id !== +b.dataset.deleteMatch
      );

      save();
      renderAll();
      toast("حُذفت المباراة من التخزين المحلي.");
    }

    if (b.dataset.editTeam) {
      const t = data.teams.find(
        x => x.id === +b.dataset.editTeam
      );

      if (t) addTeam(t);
    }

    if (b.dataset.deleteTeam) {
      const t = data.teams.find(
        x => x.id === +b.dataset.deleteTeam
      );

      if (t && confirm(`حذف فريق ${t.name}؟`)) {
        data.teams = data.teams.filter(x => x.id !== t.id);

        save();
        renderAll();
        toast("حُذف الفريق محليًا.");
      }
    }

    if (b.dataset.editPlayer) {
      const p = data.players.find(
        x => x.id === +b.dataset.editPlayer
      );

      if (p) addPlayer(p);
    }

    if (b.dataset.deletePlayer) {
      data.players = data.players.filter(
        x => x.id !== +b.dataset.deletePlayer
      );

      save();
      renderAll();
      toast("حُذف اللاعب محليًا.");
    }

    if (b.dataset.deleteEvent) {
      data.events = data.events.filter(
        x => x.id !== +b.dataset.deleteEvent
      );

      save();
      renderAll();
      toast("حُذف الحدث محليًا.");
    }
  });

  $("#settingsForm").addEventListener("submit", e => {
    e.preventDefault();

    data.settings = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    );

    document.documentElement.style.setProperty(
      "--turquoise",
      data.settings.accent
    );

    save();

    toast("حُفظت الإعدادات على هذا الجهاز.");
  });

  if (data.settings?.accent) {
    document.documentElement.style.setProperty(
      "--turquoise",
      data.settings.accent
    );
  }

  renderAll();
})();