// معاينة البطولة - النتائج واللاعبون والأحداث كلها تجريبية
const clubs={A:["السنوارييون","فلسطين","كتائب القسام","النصر"],B:["البركة","النسور","الأسود","غزة"]};

const matches=[
{id:1,g:"A",round:1,home:"السنوارييون",away:"فلسطين",hs:2,as:1,status:"finished",date:"الجولة التجريبية · اليوم الأول",time:"16:30",venue:"ملعب بوطريفية",ref:"محمد يحي ربيع",events:[{min:12,team:"home",kind:"goal",player:"سيدي أحمد",assist:"محمد الأمين"},{min:29,team:"away",kind:"yellow",player:"عبدالله"},{min:44,team:"away",kind:"goal",player:"أحمد سالم",assist:"باباه"},{min:71,team:"home",kind:"goal",player:"محمد الأمين",assist:"سيدي أحمد"}]},
{id:2,g:"A",round:1,home:"كتائب القسام",away:"النصر",hs:1,as:1,status:"finished",date:"الجولة التجريبية · اليوم الأول",time:"18:00",venue:"ملعب بوطريفية",ref:"محمد يحي ربيع",events:[{min:21,team:"home",kind:"goal",player:"الشيخ",assist:"عالي"},{min:52,team:"away",kind:"yellow",player:"إبراهيم"},{min:66,team:"away",kind:"goal",player:"يحي",assist:"محمد"}]},
{id:3,g:"B",round:1,home:"البركة",away:"النسور",hs:3,as:0,status:"finished",date:"الجولة التجريبية · اليوم الأول",time:"16:30",venue:"ملعب بوطريفية",ref:"محمد يحي ربيع",events:[{min:8,team:"home",kind:"goal",player:"البركة ولد أحمد",assist:"سالم"},{min:35,team:"home",kind:"goal",player:"سالم",assist:"البركة ولد أحمد"},{min:60,team:"home",kind:"yellow",player:"محمد"},{min:77,team:"home",kind:"goal",player:"عبدالرحمن",assist:"سالم"}]},
{id:4,g:"B",round:1,home:"الأسود",away:"غزة",hs:2,as:2,status:"finished",date:"الجولة التجريبية · اليوم الأول",time:"18:00",venue:"ملعب بوطريفية",ref:"محمد يحي ربيع",events:[{min:15,team:"home",kind:"goal",player:"عبدالرحمن",assist:"باباه"},{min:33,team:"away",kind:"goal",player:"باباه بدري",assist:"الشيخ"},{min:48,team:"away",kind:"yellow",player:"الشيخ"},{min:83,team:"home",kind:"goal",player:"سيدي",assist:"عبدالرحمن"},{min:90,team:"away",kind:"goal",player:"الشيخ الطالب",assist:"باباه بدري"}]},
{id:5,g:"A",round:2,home:"السنوارييون",away:"كتائب القسام",hs:null,as:null,status:"upcoming",date:"موعد الجولة الثانية",time:"16:30",venue:"ملعب بوطريفية",ref:"محمد يحي ربيع",events:[]},
{id:6,g:"A",round:2,home:"فلسطين",away:"النصر",hs:null,as:null,status:"upcoming",date:"موعد الجولة الثانية",time:"18:00",venue:"ملعب بوطريفية",ref:"محمد يحي ربيع",events:[]},
{id:7,g:"B",round:2,home:"البركة",away:"الأسود",hs:null,as:null,status:"upcoming",date:"موعد الجولة الثانية",time:"16:30",venue:"ملعب بوطريفية",ref:"محمد يحي ربيع",events:[]},
{id:8,g:"B",round:2,home:"النسور",away:"غزة",hs:null,as:null,status:"upcoming",date:"موعد الجولة الثانية",time:"18:00",venue:"ملعب بوطريفية",ref:"محمد يحي ربيع",events:[]}
];

let filter="all";
const $=id=>document.getElementById(id);

function showSection(id){
 document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===id));
 document.querySelectorAll(".nav,.bottom-nav button").forEach(x=>x.classList.toggle("active",x.dataset.section===id));
 window.scrollTo({top:0,behavior:"smooth"});
 if(id==="standings")renderStandings("A");
}

function showAllMatches(){
 $("matches-list").hidden=false;
 $("match-view").hidden=true;
 filter="all";
 updateFilters();
 renderMatches();
 window.scrollTo({top:0,behavior:"smooth"});
}

function filterMatches(g){
 filter=g;
 $("matches-list").hidden=false;
 $("match-view").hidden=true;
 updateFilters();
 renderMatches();
}

function updateFilters(){
 document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===filter));
}

function matchCard(m){
 let done=m.status==="finished";
 return `<article class="match-card" onclick="openMatch(${m.id})">
 <div class="card-top">
 <span class="pill">المجموعة ${m.g} · الجولة ${m.round}</span>
 <span>${done?"انتهت":"قادمة"}</span>
 </div>
 <div class="teams-row">
 <div class="team">
 <div class="crest"><i class="fa-solid fa-shield-halved"></i></div>
 <div class="team-name">${m.home}</div>
 </div>
 <div>
 <div class="score">${done?m.hs:"-"}<em>:</em>${done?m.as:"-"}</div>
 <div class="status ${done?"finished":"upcoming"}">${done?"النتيجة النهائية":"موعد المباراة"}</div>
 </div>
 <div class="team">
 <div class="crest"><i class="fa-solid fa-shield-halved"></i></div>
 <div class="team-name">${m.away}</div>
 </div>
 </div>
 <div class="card-bottom">
 <span><i class="fa-regular fa-clock"></i>${m.time}</span>
 <span><i class="fa-solid fa-location-dot"></i>${m.venue}</span>
 </div>
 <div class="open-details">
 <span>تفاصيل المباراة والأحداث</span>
 <i class="fa-solid fa-arrow-left"></i>
 </div>
 </article>`;
}

function renderMatches(){
 $("matches-container").innerHTML=matches
 .filter(m=>filter==="all"||m.g===filter)
 .map(matchCard).join("");
}

function openMatch(id){
 let m=matches.find(x=>x.id===id);
 let done=m.status==="finished";

 $("matches-list").hidden=true;
 $("match-view").hidden=false;

 let events=done?m.events.map((e,i)=>`
 <div class="event ${e.team}">
 <div class="event-text">
 ${e.team==="home"?`<b>${e.player}</b><small>${eventName(e.kind)}${e.assist?` · صناعة ${e.assist}`:""}</small>`:""}
 </div>
 <div class="event-icon">${eventIcon(e.kind)}</div>
 <div class="event-text">
 ${e.team==="away"?`<b>${e.player}</b><small>${eventName(e.kind)}${e.assist?` · صناعة ${e.assist}`:""}</small>`:""}
 </div>
 <div class="event-time">${e.min}'</div>
 </div>`).join(""):`<div class="empty">لم تُسجل أحداث بعد.</div>`;

 $("match-detail").innerHTML=`
 <article class="detail-card">
 <div class="detail-banner">
 <span>المجموعة ${m.g} · الجولة ${m.round}</span>
 <span>${done?"مباراة منتهية":"مباراة قادمة"}</span>
 </div>

 <div class="detail-scoreboard">
 <div class="detail-team">
 <div class="crest"><i class="fa-solid fa-shield-halved"></i></div>
 <h3>${m.home}</h3>
 </div>

 <div>
 <div class="detail-score">${done?m.hs:"-"}<small>:</small>${done?m.as:"-"}</div>
 <div class="detail-status">${done?"النتيجة النهائية":"تبدأ عند "+m.time}</div>
 </div>

 <div class="detail-team">
 <div class="crest"><i class="fa-solid fa-shield-halved"></i></div>
 <h3>${m.away}</h3>
 </div>
 </div>

 <div class="detail-meta">
 <div class="meta-box"><i class="fa-regular fa-calendar"></i><div><span>التاريخ / الجولة</span><b>${m.date}</b></div></div>
 <div class="meta-box"><i class="fa-regular fa-clock"></i><div><span>التوقيت</span><b>${m.time}</b></div></div>
 <div class="meta-box"><i class="fa-solid fa-location-dot"></i><div><span>الملعب</span><b>${m.venue}</b></div></div>
 <div class="meta-box"><i class="fa-solid fa-whistle"></i><div><span>حكم المباراة</span><b>${m.ref}</b></div></div>
 <div class="meta-box"><i class="fa-solid fa-flag"></i><div><span>الحالة</span><b>${done?"انتهت":"لم تبدأ بعد"}</b></div></div>
 <div class="meta-box"><i class="fa-solid fa-users"></i><div><span>المجموعة</span><b>${m.g}</b></div></div>
 </div>

 <div class="event-area">
 <h3>${done?"أحداث المباراة":"معلومات اللقاء"}</h3>
 ${done?`<div class="timeline">${events}</div>`:`<div class="empty">ترقبوا انطلاق المباراة. ستظهر الأحداث هنا بعد بدايتها.</div>`}
 </div>

 <div class="detail-note">
 <i class="fa-solid fa-circle-info"></i>
 تفاصيل ونتائج تجريبية للعرض فقط، وليست بيانات رسمية.
 </div>
 </article>`;

 window.scrollTo({top:0,behavior:"smooth"});
}

function eventIcon(k){
 return k==="goal"
 ?'<i class="fa-solid fa-futbol"></i>'
 :k==="yellow"
 ?'<i class="fa-solid fa-square" style="color:#e8bd37"></i>'
 :'<i class="fa-solid fa-square" style="color:#d94a4a"></i>';
}

function eventName(k){
 return k==="goal"?"هدف":k==="yellow"?"بطاقة صفراء":"بطاقة حمراء";
}

function calculate(group){
 let rows=clubs[group].map(name=>({
 name,pl:0,w:0,d:0,l:0,gf:0,ga:0,pts:0
 }));

 matches.filter(m=>m.g===group&&m.status==="finished").forEach(m=>{
 let h=rows.find(t=>t.name===m.home);
 let a=rows.find(t=>t.name===m.away);

 h.pl++;
 a.pl++;
 h.gf+=m.hs;
 h.ga+=m.as;
 a.gf+=m.as;
 a.ga+=m.hs;

 if(m.hs>m.as){
 h.w++;
 a.l++;
 h.pts+=3;
 }else if(m.hs<m.as){
 a.w++;
 h.l++;
 a.pts+=3;
 }else{
 h.d++;
 a.d++;
 h.pts++;
 a.pts++;
 }
 });

 return rows.sort((a,b)=>
 b.pts-a.pts||
 (b.gf-b.ga)-(a.gf-a.ga)||
 b.gf-a.gf
 );
}

function renderStandings(group,btn){
 if(btn){
 document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
 btn.classList.add("active");
 }

 let rows=calculate(group);

 $("standings-content").innerHTML=`
 <div class="notice">ترتيب محسوب من نتائج الجولة التجريبية الأولى.</div>
 <div class="table-wrap">
 <table class="standing-table">
 <thead>
 <tr>
 <th>#</th><th>الفريق</th><th>لعب</th><th>فاز</th>
 <th>تعادل</th><th>خسر</th><th>له</th><th>عليه</th>
 <th>الفارق</th><th>النقاط</th>
 </tr>
 </thead>
 <tbody>
 ${rows.map((t,i)=>`
 <tr>
 <td><span class="rank">${i+1}</span></td>
 <td>${t.name}</td>
 <td>${t.pl}</td>
 <td>${t.w}</td>
 <td>${t.d}</td>
 <td>${t.l}</td>
 <td>${t.gf}</td>
 <td>${t.ga}</td>
 <td>${t.gf-t.ga>0?"+":""}${t.gf-t.ga}</td>
 <td><b>${t.pts}</b></td>
 </tr>`).join("")}
 </tbody>
 </table>
 </div>`;
}

const scorers=[
 {name:"سيدي أحمد",team:"السنوارييون",n:1},
 {name:"محمد الأمين",team:"السنوارييون",n:1},
 {name:"أحمد سالم",team:"فلسطين",n:1},
 {name:"الشيخ",team:"كتائب القسام",n:1},
 {name:"يحي",team:"النصر",n:1},
 {name:"البركة ولد أحمد",team:"البركة",n:1},
 {name:"سالم",team:"البركة",n:1},
 {name:"عبدالرحمن",team:"البركة",n:1},
 {name:"باباه بدري",team:"غزة",n:1},
 {name:"سيدي",team:"الأسود",n:1},
 {name:"الشيخ الطالب",team:"غزة",n:1}
];

const assists=[
 {name:"سالم",team:"البركة",n:2},
 {name:"سيدي أحمد",team:"السنوارييون",n:1},
 {name:"محمد الأمين",team:"السنوارييون",n:1},
 {name:"باباه بدري",team:"غزة",n:2},
 {name:"عالي",team:"كتائب القسام",n:1},
 {name:"محمد",team:"النصر",n:1},
 {name:"الشيخ",team:"غزة",n:1},
 {name:"عبدالرحمن",team:"الأسود",n:1}
];

function renderPlayers(list,target,unit){
 $(target).innerHTML=`
 <div class="player-list">
 ${list.sort((a,b)=>b.n-a.n).map((p,i)=>`
 <div class="player-row">
 <span class="player-rank">${i+1}</span>
 <span class="player-avatar"><i class="fa-solid fa-user"></i></span>
 <div class="player-info"><b>${p.name}</b><small>${p.team}</small></div>
 <span class="player-count">${p.n}<small style="font-size:11px"> ${unit}</small></span>
 </div>`).join("")}
 </div>`;
}

function renderClubs(){
 $("clubs-content").innerHTML=[
 ...clubs.A.map(n=>({n,g:"A"})),
 ...clubs.B.map(n=>({n,g:"B"}))
 ].map(t=>`
 <article class="club">
 <div class="crest"><i class="fa-solid fa-shield-halved"></i></div>
 <h3>${t.n}</h3>
 <small>المجموعة ${t.g}</small>
 </article>`).join("");
}

renderMatches();
renderStandings("A");
renderPlayers(scorers,"scorers-content","هدف");
renderPlayers(assists,"assists-content","صناعة");
renderClubs();