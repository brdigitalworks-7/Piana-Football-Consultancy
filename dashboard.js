/* =========================================================================
   PIANA FOOTBALL CONSULTANCY — Member App
   Role-based dashboards: Player · Scout · Club · Agent · Admin
   Vanilla JS · localStorage persistence · Chart.js analytics
   ========================================================================= */
'use strict';
const PROJECT_ID = 'piana-football-consultancy-web-mry9va5b';
const CHECKOUT_BASE = 'https://aimarcus.eu/api/hosted-checkout/' + PROJECT_ID;

/* ---------- tiny helpers ---------- */
const $ = (s,r=document)=>r.querySelector(s);
const el = (t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const esc = s => (s==null?'':String(s)).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const initials = n => (n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
const money = n => '€'+Number(n).toLocaleString('en-IE');
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function toast(msg){const t=$('#toast');$('#toastMsg').textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2800);}
function icons(){if(window.lucide)lucide.createIcons();}

/* ---------- persistence ---------- */
const KEY='pfc_app_v1';
// Bumped whenever the seed schema changes — forces a reseed so stale localStorage
// from an earlier build can never leave a view blank by referencing missing data.
const SCHEMA_VER=3;
const REQUIRED_KEYS=['players','scouts','clubs','agents','reports','progress','assessments',
  'introductions','assignments','opportunities','messages','payments','notifications',
  'watchlist','savedSearches','documents','me'];
let DB=load();
function load(){
  try{
    const s=localStorage.getItem(KEY);
    if(s){
      const d=JSON.parse(s);
      // Reject stale/incompatible data: wrong version, missing keys, or empty player list.
      const ok=d&&d._v===SCHEMA_VER&&REQUIRED_KEYS.every(k=>k in d)
        &&Array.isArray(d.players)&&d.players.length&&d.players.some(p=>p.id===d.me);
      if(ok)return d;
    }
  }catch(e){}
  const fresh=seed();
  try{localStorage.setItem(KEY,JSON.stringify(fresh));}catch(e){}
  return fresh;
}
function save(){localStorage.setItem(KEY,JSON.stringify(DB));}
function reset(){localStorage.removeItem(KEY);DB=seed();save();go(state.view);toast('Demo data reset');}

/* ---------- sample data ---------- */
function seed(){
  const img=['images/player-1.webp','images/player-2.webp','images/player-3.webp'];
  const players=[
    {id:'p1',name:'Marco Piana',pic:img[0],pos:'Central Midfielder',foot:'Right',height:182,weight:74,age:19,nat:'Ireland',
     passports:'Ireland, Italy',club:'St. Kevin\'s FC',contract:'Under contract to Jun 2027',transfer:'Available (loan)',
     injury:'Fit',langs:'English, Italian',education:'Leaving Cert · Sports Science Y1',phone:'+353 87 000 0000',email:'marco@example.com',
     under18:false,parent:'',agent:'Seeking representation',membership:'Elite',member:true,
     tech:82,tac:78,phys:74,mental:80,ath:76,overall:79,
     strengths:'Vision, long passing, set pieces, composure under pressure',
     weakness:'Aerial duels, weak foot finishing',
     plan:'Add 3kg lean muscle, sharpen left foot, target a first-team debut and 15+ league starts this season.',
     targets:'8 gym sessions/mo · 2 finishing sessions/wk · match rating avg 7.0+',
     coachNotes:'Excellent tempo control. Push him into higher-intensity phases.',
     pfcNotes:'Prime loan candidate for League One clubs. Video package ready for distribution.'},
    {id:'p2',name:'Diego Fontana',pic:img[1],pos:'Right Winger',foot:'Left',height:176,weight:68,age:17,nat:'Italy',
     passports:'Italy',club:'AC Junior Roma',contract:'Youth scholarship',transfer:'Available',
     injury:'Minor knock (2wk)',langs:'Italian, English',education:'Secondary school Y5',phone:'+39 333 000 000',email:'diego@example.com',
     under18:true,parent:'Luca Fontana · +39 333 111 222 · luca@example.com',agent:'Represented (family)',membership:'Pro',member:true,
     tech:80,tac:70,phys:66,mental:72,ath:84,overall:75,
     strengths:'Explosive pace, 1v1 dribbling, direct running',weakness:'Decision-making, defensive work-rate',
     plan:'Structured pathway into a European academy; improve final-ball decisions.',
     targets:'6 sprint sessions/mo · 5 assists target · video review weekly',
     coachNotes:'Frightening acceleration. Needs game intelligence work.',
     pfcNotes:'Under-18 — parent consent on file. Trial interest from two Serie C academies.'},
    {id:'p3',name:'Kofi Mensah',pic:img[2],pos:'Centre-Back',foot:'Right',height:190,weight:84,age:21,nat:'Ghana',
     passports:'Ghana',club:'Free agent',contract:'Free agent',transfer:'Immediately available',
     injury:'Fit',langs:'English, Twi',education:'Diploma in Business',phone:'+233 24 000 000',email:'kofi@example.com',
     under18:false,parent:'',agent:'Represented',membership:'Elite',member:true,
     tech:70,tac:82,phys:88,mental:84,ath:82,overall:81,
     strengths:'Dominant in the air, leadership, positioning, tackling',weakness:'Ball progression under press',
     plan:'Secure a club before window closes; add composure on the ball.',
     targets:'Clean sheets 60%+ · win 75% of aerials · 4 gym sessions/wk',
     coachNotes:'Natural leader, organises the back line superbly.',
     pfcNotes:'Free agent — immediate placement opportunity. Two clubs requesting intro.'}
  ];
  const scouts=[
    {id:'s1',name:'Aidan Byrne',region:'UK & Ireland',assigned:['p1','p3'],reports:8,earnings:2400,rating:4.8},
    {id:'s2',name:'Paolo Ricci',region:'Southern Europe',assigned:['p2'],reports:5,earnings:1500,rating:4.6}
  ];
  const clubs=[
    {id:'c1',name:'Shelbourne FC',country:'Ireland',level:'League of Ireland Premier',contact:'recruitment@shels.ie'},
    {id:'c2',name:'FC Lugano',country:'Switzerland',level:'Swiss Super League',contact:'scout@lugano.ch'},
    {id:'c3',name:'Portsmouth Youth',country:'England',level:'EFL Academy',contact:'academy@pfc.co.uk'}
  ];
  const agents=[
    {id:'a1',name:'Sarah Nolan',license:'FIFA Licensed',region:'Europe',signed:['p3'],requests:3}
  ];
  const reports=[
    {id:'r1',player:'p1',scout:'s1',date:'2026-07-12',opp:'St Kevin\'s 2-1 Cabinteely',pos:'CM',minutes:90,
     tech:8,tac:7,phys:7,mental:8,personality:8,overall:78,potential:'High',league:'League of Ireland Premier',level:'Championship level within 2 yrs',
     strengths:'Ran the game from deep, 91% pass accuracy, scored a free-kick.',weakness:'Lost two aerial duels.',
     recommendation:'Recommend — loan to a Championship/League One side.',status:'Approved'},
    {id:'r2',player:'p2',scout:'s2',date:'2026-07-18',opp:'Junior Roma 3-0 Frosinone U18',pos:'RW',minutes:74,
     tech:8,tac:6,phys:6,mental:7,personality:7,overall:71,potential:'Very High',league:'Serie C',level:'Serie B potential',
     strengths:'Two assists, unplayable in transition.',weakness:'Switched off defensively.',
     recommendation:'Monitor — invite to trial.',status:'Pending'},
    {id:'r3',player:'p3',scout:'s1',date:'2026-07-20',opp:'Ghana Trial Match',pos:'CB',minutes:90,
     tech:7,tac:8,phys:9,mental:8,personality:8,overall:81,potential:'High',league:'Free agent',level:'Ready now — 2nd tier',
     strengths:'Commanded the box, won everything in the air.',weakness:'Rushed a couple of clearances.',
     recommendation:'Strongly recommend — sign immediately.',status:'Pending'}
  ];
  const progress=[
    {id:'pr1',player:'p1',month:'2026-07',minutes:540,starts:6,goals:2,assists:3,cleanSheets:2,rating:7.4,
     coach:'Best month yet — tempo and pressing much improved.',gym:9,sprint:'Top speed 31.2 km/h · 20m 2.98s',
     injuries:'None',achievements:'Player of the Month (club)',pfcReview:'On track for loan target. Distributing highlight reel to 3 clubs.'},
    {id:'pr2',player:'p2',month:'2026-07',minutes:420,starts:4,goals:1,assists:5,cleanSheets:0,rating:7.1,
     coach:'Devastating going forward, defensive drills continue.',gym:5,sprint:'Top speed 33.4 km/h · 20m 2.81s',
     injuries:'Minor knee knock wk3',achievements:'5 assists in a month',pfcReview:'Trial being arranged with Serie C academy.'},
    {id:'pr3',player:'p3',month:'2026-06',minutes:450,starts:5,goals:1,assists:0,cleanSheets:3,rating:7.6,
     coach:'Rock at the back, real presence.',gym:12,sprint:'Top speed 30.1 km/h',injuries:'None',
     achievements:'3 clean sheets',pfcReview:'Immediate placement — two clubs notified.'}
  ];
  const assessments=[
    {id:'as1',player:'Liam O\'Connor',type:'Full Assessment',date:'2026-08-02',status:'Confirmed'},
    {id:'as2',player:'Yusuf Demir',type:'Video Assessment',date:'2026-08-05',status:'Pending'}
  ];
  const introductions=[
    {id:'in1',player:'p1',from:'Shelbourne FC',fromType:'club',date:'2026-07-21',status:'Requested'},
    {id:'in2',player:'p3',from:'Sarah Nolan (Agent)',fromType:'agent',date:'2026-07-22',status:'Approved'},
    {id:'in3',player:'p3',from:'FC Lugano',fromType:'club',date:'2026-07-24',status:'Requested'}
  ];
  const assignments=[
    {id:'ra1',club:'FC Lugano',pos:'Centre-Back',age:'18-23',height:'186cm+',foot:'Any',nat:'Any',passport:'EU preferred',
     budget:'€250,000',salary:'€4k-6k/mo',style:'Ball-playing, aggressive',leagueExp:'2nd tier+',avail:'Jan window',
     deadline:'2026-09-30',notes:'Must be comfortable in a back three.',status:'Shortlist delivered'}
  ];
  const opportunities=[
    {id:'op1',title:'Trial — League of Ireland Premier',pos:'Midfielder',level:'Senior',deadline:'2026-08-15',status:'Open'},
    {id:'op2',title:'Academy Trial — Serie C',pos:'Winger',level:'U18',deadline:'2026-08-20',status:'Open'}
  ];
  const messages=[
    {id:'m1',from:'PFC Head Office',role:'admin',to:'all',subject:'Your July highlight reel is live',preview:'We\'ve distributed your video package to three clubs…',date:'2026-07-25',read:false},
    {id:'m2',from:'Aidan Byrne',role:'scout',to:'all',subject:'Match report uploaded',preview:'Full report from Saturday\'s game is now on your profile…',date:'2026-07-22',read:true},
    {id:'m3',from:'Shelbourne FC',role:'club',to:'admin',subject:'Introduction request — Marco Piana',preview:'We\'d like to arrange an introduction and a trial…',date:'2026-07-21',read:false}
  ];
  const payments=[
    {id:'pay1',member:'Marco Piana',plan:'Elite',amount:79,currency:'EUR',date:'2026-07-01',status:'Paid'},
    {id:'pay2',member:'Diego Fontana',plan:'Pro',amount:49,currency:'EUR',date:'2026-07-03',status:'Paid'},
    {id:'pay3',member:'Kofi Mensah',plan:'Elite',amount:79,currency:'EUR',date:'2026-07-05',status:'Paid'}
  ];
  const notifications=[
    {id:'n1',text:'Your introduction request for Kofi Mensah was approved.',date:'2026-07-24',read:false},
    {id:'n2',text:'New report available for Marco Piana.',date:'2026-07-22',read:false},
    {id:'n3',text:'2 players match your saved search "EU Centre-Backs".',date:'2026-07-20',read:true}
  ];
  const watchlist=['p1','p3'];
  const savedSearches=[{id:'ss1',name:'EU Centre-Backs U23',filters:'CB · U23 · EU passport · Available'},
    {id:'ss2',name:'Attacking wingers',filters:'RW/LW · U21 · Pace 80+'}];
  const documents=[
    {id:'d1',name:'PFC Membership Agreement.pdf',type:'Contract',size:'214 KB',date:'2026-07-01',status:'Signed'},
    {id:'d2',name:'Player Passport — Full Profile.pdf',type:'Profile',size:'1.2 MB',date:'2026-07-18',status:'Current'},
    {id:'d3',name:'July Scouting Report.pdf',type:'Report',size:'486 KB',date:'2026-07-20',status:'Approved'},
    {id:'d4',name:'Highlight Reel — Distribution Rights.pdf',type:'Media',size:'92 KB',date:'2026-07-22',status:'Signed'},
    {id:'d5',name:'Parental Consent Form.pdf',type:'Legal',size:'168 KB',date:'2026-06-30',status:'On file'},
    {id:'d6',name:'GDPR Data Processing Notice.pdf',type:'Legal',size:'120 KB',date:'2026-01-10',status:'Current'}
  ];
  return {_v:SCHEMA_VER,players,scouts,clubs,agents,reports,progress,assessments,introductions,assignments,
    opportunities,messages,payments,notifications,watchlist,savedSearches,documents,me:'p1'};
}

/* ---------- app state ---------- */
const state={role:'player',view:null};
const P=id=>DB.players.find(p=>p.id===id)||{};
const me=()=>P(DB.me);

/* ---------- navigation config per role ---------- */
// Shared "Account" group appended to every role so each dashboard has messages,
// notifications, documents and settings.
const ACCOUNT=['Account',[['messages','Messages','mail'],['notifications','Notifications','bell'],
  ['documents','Documents','folder'],['settings','Settings','settings']]];
const HOME=['Dashboard',[['overview','Dashboard','layout-dashboard']]];
const NAV={
  player:[
    HOME,
    ['My Player Hub',[['profile','My Profile','user-round'],['career','Career Plan','line-chart'],
      ['progress','Progress Tracker','activity'],['pvideos','Videos & CV','clapperboard'],
      ['membership','Membership','crown']]],
    ACCOUNT
  ],
  scout:[
    HOME,
    ['Scouting',[['assigned','Assigned Players','users'],['requests','Club Requests','inbox'],
      ['templates','Report Templates','file-text'],['upload-report','Upload Report','file-plus-2'],
      ['matches','Match History','history'],['earnings','Earnings','wallet']]],
    ACCOUNT
  ],
  club:[
    HOME,
    ['Recruitment',[['search','Search Players','search'],['watchlist','Watchlist','bookmark'],
      ['saved','Saved Searches','filter'],['assignment','Recruitment Assignment','clipboard-list'],
      ['introductions','Introductions','handshake']]],
    ['Resources',[['clubreports','Reports','folder-open'],['videos','Player Videos','clapperboard']]],
    ACCOUNT
  ],
  agent:[
    HOME,
    ['Talent',[['search','Search Players','search'],['saved','Saved Players','bookmark'],
      ['introductions','Introductions','handshake'],['representation','Representation','file-signature'],
      ['signed','Signed Players','badge-check']]],
    ['Resources',[['agentreports','Reports','folder-open'],['videos','Videos','clapperboard']]],
    ACCOUNT
  ],
  admin:[
    HOME,
    ['Directory',[['a-players','Players','users'],['a-scouts','Scouts','user-search'],
      ['a-agents','Agents','contact'],['a-clubs','Clubs','building-2']]],
    ['Operations',[['a-assessments','Assessments','clipboard-check'],['a-payments','Membership Payments','credit-card'],
      ['a-introductions','Introductions','handshake'],['a-assignments','Recruitment','clipboard-list'],
      ['a-opps','Trial Opportunities','trophy'],['a-approvals','Report Approvals','file-check-2']]],
    ['Insights',[['a-analytics','Analytics','bar-chart-3'],['a-legal','Legal & Business','scale']]],
    ACCOUNT
  ]
};
/* ---------- Super Admin: dedicated platform-owner dashboard ---------- */
NAV.super_admin=[
  ['Overview',[['sa-overview','Dashboard Overview','layout-dashboard']]],
  ['Account Control',[['sa-users','User Management','users'],['sa-admins','Admin Management','shield-check'],
    ['sa-players','Player Management','user-round'],['sa-clubs','Club Management','building-2'],
    ['sa-agents','Agent Management','briefcase'],['sa-scouts','Scout Management','binoculars']]],
  ['Operations',[['sa-memberships','Membership Management','crown'],['sa-finance','Payment & Subscription','credit-card'],
    ['sa-bookings','Consultation Bookings','calendar-check'],['sa-applications','Player Applications','file-input'],
    ['sa-reports','Scouting Reports','file-text'],['sa-messages','Messages','mail'],
    ['sa-notifications','Notifications','bell']]],
  ['Insights',[['sa-cms','Website Content (CMS)','layout-panel-top'],['sa-analytics','Analytics & Reports','bar-chart-3'],
    ['sa-audit','Audit Logs','scroll-text']]],
  ['System & Security',[['sa-security','Security Centre','shield-alert'],['sa-settings','Platform Settings','sliders-horizontal'],
    ['sa-database','Database Status','database'],['sa-backups','Backup & Restore','hard-drive'],
    ['sa-system','System Health','activity'],['sa-tickets','Support Tickets','life-buoy']]]
];
const USERS={player:['Marco Piana','Player'],scout:['Aidan Byrne','Scout'],club:['Shelbourne FC','Club'],
  agent:['Sarah Nolan','Agent'],admin:['PFC Admin','Administrator'],
  super_admin:['PFC Super Admin','Super Administrator']};
// Map ANY authenticated role (including aliases, super admin, or an unavailable/unknown
// value) to a role that has a real dashboard — so the layout ALWAYS renders, never blank.
function resolveRole(r){
  const k=String(r||'').toLowerCase().trim().replace(/[\s-]+/g,'_');
  if(NAV[k])return k;                                   // player/scout/club/agent/admin/super_admin
  if(k==='superadmin'||k==='super'||k==='owner'||k==='root')return 'super_admin';
  if(k==='administrator')return 'admin';
  if(k==='scouts')return 'scout';
  if(k==='clubs')return 'club';
  if(k==='agents')return 'agent';
  if(k==='players'||k==='member')return 'player';
  return 'player';                                      // safe default — dashboard still shows
}
const TITLES={}; // filled by builder below

/* ---------- render sidebar nav ---------- */
function buildNav(){
  const nav=$('#nav');nav.innerHTML='';
  NAV[state.role].forEach(([label,items])=>{
    nav.appendChild(el('div','grouplabel',label));
    items.forEach(([v,title,ic])=>{
      TITLES[v]=title;
      const a=el('a',state.view===v?'active':'',`<i data-lucide="${ic}"></i><span>${title}</span>`);
      a.onclick=()=>go(v);
      nav.appendChild(a);
    });
  });
  icons();
}

/* ---------- router ---------- */
function go(view){
  if(!view){view=NAV[state.role][0][1][0][0];}
  state.view=view;
  buildNav();
  const fn=VIEWS[view];
  const host=$('#view');host.innerHTML='';
  $('#pageTitle').textContent=TITLES[view]||'Dashboard';
  $('#pageSub').textContent=SUBS[view]||'';
  try{
    if(fn)fn(host);
    else host.appendChild(el('div','empty','<i data-lucide="construction"></i><p>Coming soon</p>'));
  }catch(err){
    // Never leave the panel blank — surface a recoverable message instead.
    console.error('View render failed:',view,err);
    host.innerHTML=`<div class="card card-p" style="text-align:center;padding:44px 24px">
      <div class="empty"><i data-lucide="alert-triangle"></i>
      <p style="margin-bottom:14px">This section couldn't load with your saved data.</p>
      <button class="btn btn-gold" onclick="reset()"><i data-lucide="rotate-ccw"></i> Reload demo data</button></div></div>`;
  }
  icons();
  closeSidebar();
  window.scrollTo(0,0);
  location.hash=view;
}
function setRole(r){
  state.role=r;state.view=null;
  const[u,label]=USERS[r];
  $('#userName').textContent=u;$('#userRole').textContent=label;$('#userAv').textContent=initials(u);
  go();
}

/* ---------- modal ---------- */
function modal(title,bodyHTML,footHTML){
  const box=$('#modalBox');
  box.innerHTML=`<div class="modal-head"><h3>${title}</h3><button onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <div class="modal-body">${bodyHTML}</div>${footHTML?`<div class="modal-foot">${footHTML}</div>`:''}`;
  $('#modal').classList.add('open');icons();
}
function closeModal(){$('#modal').classList.remove('open');}

/* ---------- sidebar mobile ---------- */
const isMobileNav=()=>matchMedia('(max-width:900px)').matches;
function openSidebar(){const s=$('#sidebar');if(!s)return;s.classList.add('open');const b=$('#backdrop');if(b)b.classList.add('show');document.body.style.overflow='hidden';}
function closeSidebar(){const s=$('#sidebar');if(s)s.classList.remove('open');const b=$('#backdrop');if(b)b.classList.remove('show');document.body.style.overflow='';}
function toggleCollapse(){const app=$('.app');if(!app)return;const c=app.classList.toggle('collapsed');try{sessionStorage.setItem('pfc_side_collapsed',c?'1':'0');}catch(e){}}
// All imperative DOM wiring lives here and runs INSIDE boot() (never at top level),
// so a single missing element can never abort the script before boot() registers.
function wireUI(){
  const modalEl=$('#modal');
  if(modalEl&&!modalEl._wired){modalEl._wired=true;modalEl.addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});}
  const burger=$('#burger');
  if(burger&&!burger._wired){burger._wired=true;burger.onclick=()=>{
    if(isMobileNav()){$('#sidebar').classList.contains('open')?closeSidebar():openSidebar();}
    else{toggleCollapse();}
  };}
  const bd=$('#backdrop');if(bd&&!bd._wired){bd._wired=true;bd.onclick=closeSidebar;}
  const rs=$('#roleSelect');if(rs)rs.onchange=e=>setRole(e.target.value);
  const app=$('.app');
  if(app){let saved='0';try{saved=sessionStorage.getItem('pfc_side_collapsed')||'0';}catch(e){}
    app.classList.toggle('collapsed',saved==='1');}
  if(!window._pfcNavWired){window._pfcNavWired=true;
    addEventListener('keydown',e=>{if(e.key==='Escape')closeSidebar();});
    addEventListener('resize',()=>{if(!isMobileNav())closeSidebar();});
  }
}

const SUBS={
  overview:'Your dashboard at a glance',documents:'Contracts, reports & signed paperwork',
  settings:'Account, profile & notification preferences',
  profile:'Your complete player passport',career:'Development scores, targets & PFC notes',
  progress:'Monthly performance uploaded by PFC & your coaches',pvideos:'Match footage, training clips & CV',
  membership:'Manage your monthly PFC membership',messages:'Your PFC inbox',
  assigned:'Players assigned to you for scouting',requests:'Reports requested by clubs',
  templates:'Standardised PFC scouting report','upload-report':'Submit a new scouting report',
  matches:'Matches you have covered',earnings:'Your scouting income',
  search:'Search the PFC talent database',watchlist:'Players you are tracking',saved:'Your saved search filters',
  assignment:'Brief PFC and receive a curated shortlist',introductions:'Introduction requests & status',
  clubreports:'Download scouting reports',videos:'Player match & training footage',
  representation:'Representation requests',signed:'Players you represent',notifications:'Your alerts',
  'a-players':'Every registered player','a-scouts':'Scouting network','a-agents':'Licensed agents',
  'a-clubs':'Club partners','a-assessments':'Booked player assessments','a-payments':'Membership revenue',
  'a-introductions':'All introduction requests','a-assignments':'Club recruitment briefs',
  'a-opps':'Trial & showcase opportunities','a-approvals':'Reports awaiting your sign-off',
  'a-messages':'Platform messages','a-analytics':'Platform-wide performance','a-legal':'Legal & business controls'
};

const VIEWS={};

/* ============ shared UI builders ============ */
function statCard(ico,n,l,cls){return `<div class="card stat ${cls||''}"><div class="ico"><i data-lucide="${ico}"></i></div><div class="n">${n}</div><div class="l">${l}</div></div>`;}
function scoreBar(label,v){return `<div class="scorebar"><div class="top"><span>${label}</span><b>${v}</b></div><div class="track"><div class="fill" style="width:${v}%"></div></div></div>`;}
function badge(status){
  const s=(status||'').toLowerCase();let c='b-grey';
  if(/(approved|paid|fit|available|confirmed|signed|open|delivered)/.test(s))c='b-ok';
  else if(/(pending|requested|monitor|shortlist|loan|minor|knock)/.test(s))c='b-warn';
  else if(/(injured|rejected|closed|expired|cancelled)/.test(s))c='b-danger';
  else if(/(elite|pro|high)/.test(s))c='b-gold';
  return `<span class="badge ${c}">${esc(status)}</span>`;
}
function pageHead(title,desc,actionHTML){
  return `<div class="page-head"><div><h2>${title}</h2>${desc?`<p>${desc}</p>`:''}</div><div>${actionHTML||''}</div></div>`;
}
function emptyState(msg){return `<div class="card"><div class="empty"><i data-lucide="inbox"></i><p>${msg}</p></div></div>`;}
function videoCard(img,cap){return `<div class="video" onclick="toast('Video player — demo')"><img src="${img}" alt="${esc(cap)}"><div class="play"><i data-lucide="play-circle"></i></div><div class="cap">${esc(cap)}</div></div>`;}

/* ============ OVERVIEW / DASHBOARD HOME (every role) ============ */
function roleStats(role){
  const unread=DB.messages.filter(m=>!m.read).length;
  const unseen=DB.notifications.filter(n=>!n.read).length;
  if(role==='player'){const p=me();const pr=DB.progress.filter(x=>x.player===DB.me)[0]||{};
    return [statCard('award',p.overall,'Overall rating','g'),
      statCard('trending-up',pr.rating||'—','Latest match rating','gr'),
      statCard('eye',DB.introductions.filter(i=>i.player===DB.me).length,'Club interest',''),
      statCard('mail',unread,'Unread messages','rd')];}
  if(role==='scout'){const sc=DB.scouts[0];
    return [statCard('users',sc.assigned.length,'Assigned players',''),
      statCard('file-text',sc.reports,'Reports filed','g'),
      statCard('wallet',money(sc.earnings),'Earnings','gr'),
      statCard('star',sc.rating,'Scout rating','g')];}
  if(role==='club'){
    return [statCard('bookmark',DB.watchlist.length,'Watchlisted',''),
      statCard('clipboard-list',DB.assignments.length,'Active briefs','g'),
      statCard('handshake',DB.introductions.length,'Introductions','gr'),
      statCard('folder-open',DB.reports.length,'Reports available','')];}
  if(role==='agent'){const ag=DB.agents[0];
    return [statCard('badge-check',ag.signed.length,'Signed players','g'),
      statCard('file-signature',ag.requests,'Representation requests',''),
      statCard('handshake',DB.introductions.length,'Introductions','gr'),
      statCard('bell',unseen,'New alerts','rd')];}
  const rev=DB.payments.reduce((s,p)=>s+Number(p.amount||0),0);
  return [statCard('users',DB.players.length,'Players',''),
    statCard('user-search',DB.scouts.length,'Scouts','g'),
    statCard('credit-card',money(rev),'Monthly revenue','gr'),
    statCard('file-check-2',DB.reports.filter(r=>r.status==='Pending').length,'Reports to approve','rd')];
}
function activityFeed(){
  const items=[];
  DB.notifications.forEach(n=>items.push({ic:'bell',text:n.text,date:n.date}));
  DB.introductions.forEach(i=>{const p=P(i.player);
    items.push({ic:'handshake',text:`${esc(i.from)} — introduction ${esc((i.status||'').toLowerCase())} for ${esc(p.name||'a player')}`,date:i.date});});
  DB.payments.forEach(pay=>items.push({ic:'credit-card',text:`${esc(pay.member)} paid ${money(pay.amount)} — ${esc(pay.plan)} membership`,date:pay.date}));
  DB.reports.forEach(r=>{const p=P(r.player);items.push({ic:'file-text',text:`Scouting report ${esc((r.status||'').toLowerCase())} for ${esc(p.name||'a player')}`,date:r.date});});
  return items.sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,6);
}
function overviewIdentity(role){
  const[uname,label]=USERS[role];
  if(role==='player'){const p=me();return `<div class="card card-p" style="text-align:center;display:flex;flex-direction:column">
    <img src="${p.pic}" class="avatar-lg" style="margin:0 auto 12px" alt="${esc(p.name)}">
    <h3>${esc(p.name)}</h3>
    <p style="color:var(--muted);font-size:13px;margin:2px 0 12px">${esc(p.pos)} · ${esc(p.club)}</p>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${badge(p.membership)}${badge(p.injury)}</div>
    <button class="btn btn-line btn-block" style="margin-top:auto;margin-top:16px" onclick="go('profile')"><i data-lucide="user-round"></i> View full profile</button></div>`;}
  const meta={scout:['Regional Scout',DB.scouts[0].region],club:['Club Partner',(DB.clubs[0]||{}).level||''],
    agent:[DB.agents[0].license,DB.agents[0].region],admin:['Head Office','Full platform access']}[role]||['',''];
  return `<div class="card card-p" style="text-align:center;display:flex;flex-direction:column">
    <div style="width:76px;height:76px;border-radius:20px;background:var(--ink);color:var(--gold);display:grid;place-items:center;font-weight:800;font-size:26px;margin:0 auto 12px">${initials(uname)}</div>
    <h3>${esc(uname)}</h3>
    <p style="color:var(--muted);font-size:13px;margin:2px 0 12px">${esc(meta[0])}</p>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><span class="badge b-gold">${esc(label)}</span>${meta[1]?`<span class="badge b-grey">${esc(meta[1])}</span>`:''}</div>
    <button class="btn btn-line btn-block" style="margin-top:16px" onclick="go('settings')"><i data-lucide="settings"></i> Account settings</button></div>`;
}
function overviewFeatures(role){
  const map={
    player:[['Update your progress','activity','progress'],['Manage membership','crown','membership'],['Upload match footage','clapperboard','pvideos']],
    scout:[['Upload a new report','file-plus-2','upload-report'],['View assigned players','users','assigned'],['Check club requests','inbox','requests']],
    club:[['Search the talent database','search','search'],['Brief a recruitment assignment','clipboard-list','assignment'],['Review your watchlist','bookmark','watchlist']],
    agent:[['Find new talent','search','search'],['Manage representation','file-signature','representation'],['View signed players','badge-check','signed']],
    admin:[['Approve pending reports','file-check-2','a-approvals'],['Review membership payments','credit-card','a-payments'],['Open platform analytics','bar-chart-3','a-analytics']]
  };
  const acts=map[role]||map.admin;
  return `<div class="card"><div class="card-head"><h3>Quick actions</h3></div>
    <div class="card-p" style="display:grid;gap:10px">
    ${acts.map(([t,ic,v])=>`<button class="btn btn-line btn-block" style="justify-content:flex-start" onclick="go('${v}')"><i data-lucide="${ic}"></i> ${t} <i data-lucide="arrow-right" style="margin-left:auto"></i></button>`).join('')}
    </div></div>`;
}
VIEWS.overview=host=>{
  const role=state.role;const[uname]=USERS[role];
  const hour=new Date().getHours();const greet=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const unread=DB.messages.filter(m=>!m.read).length;
  const feed=activityFeed();
  const msgs=DB.messages.slice(0,3);
  const notes=DB.notifications.slice(0,4);
  host.innerHTML=
    `<div class="welcome">
      <div><span class="welcome-eyebrow">${greet}</span>
        <h2 style="font-size:26px;margin:2px 0 4px">Welcome back, ${esc(uname.split(' ')[0])}</h2>
        <p style="color:var(--muted);font-size:13.5px;margin:0">Here's everything happening across your PFC ${esc(role)} account · ${new Date().toLocaleDateString('en-IE',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div>
      <button class="btn btn-gold" onclick="go('messages')"><i data-lucide="mail"></i> ${unread} new message${unread===1?'':'s'}</button>
    </div>
    <div class="grid g4" style="margin:20px 0">${roleStats(role).join('')}</div>
    <div class="grid g2" style="align-items:start;margin-bottom:18px">
      ${overviewIdentity(role)}
      <div class="card"><div class="card-head"><h3>Recent activity</h3><span class="badge b-grey">${feed.length}</span></div>
        <div class="card-p" style="padding-top:6px">
        ${feed.length?feed.map(f=>`<div class="notif read"><span class="dot"></span><div style="flex:1"><b style="font-weight:500;color:var(--body)">${f.text}</b><br><time>${esc(f.date)}</time></div><i data-lucide="${f.ic}" style="width:16px;height:16px;color:var(--muted)"></i></div>`).join(''):'<p style="color:var(--muted);padding:14px 0">No recent activity.</p>'}
        </div></div>
    </div>
    <div class="grid g2" style="align-items:start;margin-bottom:18px">
      <div class="card"><div class="card-head"><h3>Messages</h3><button class="btn btn-sm btn-line" onclick="go('messages')">View all</button></div>
        ${msgs.map(m=>`<div class="msg-row" onclick="openMsg('${m.id}')"><div class="av">${initials(m.from)}</div>
          <div style="flex:1;min-width:0"><div class="mtop"><b>${esc(m.from)} ${m.read?'':'<span class="badge b-info" style="margin-left:6px">New</span>'}</b><time>${esc(m.date)}</time></div>
          <p>${esc(m.subject)}</p></div></div>`).join('')}</div>
      <div class="card"><div class="card-head"><h3>Notifications</h3><button class="btn btn-sm btn-line" onclick="go('notifications')">View all</button></div>
        <div class="card-p" style="padding-top:6px">
        ${notes.map(n=>`<div class="notif ${n.read?'read':''}"><span class="dot"></span><div style="flex:1"><b style="font-weight:500;color:var(--body)">${esc(n.text)}</b><br><time>${esc(n.date)}</time></div></div>`).join('')}
        </div></div>
    </div>
    ${overviewFeatures(role)}`;
  icons();
};

/* ============ DOCUMENTS (every role) ============ */
VIEWS.documents=host=>{
  host.innerHTML=pageHead('Documents','Your contracts, reports, media rights and signed paperwork — all in one place.',
    `<button class="btn btn-gold" onclick="uploadDoc()"><i data-lucide="upload"></i> Upload document</button>`)+
  `<div class="grid g4" style="margin-bottom:20px">
    ${statCard('folder',DB.documents.length,'Total documents')}
    ${statCard('file-check-2',DB.documents.filter(d=>/signed|approved|current|on file/i.test(d.status)).length,'Signed / current','g')}
    ${statCard('scroll-text',DB.documents.filter(d=>d.type==='Contract'||d.type==='Legal').length,'Contracts & legal','gr')}
    ${statCard('clapperboard',DB.documents.filter(d=>d.type==='Media').length,'Media rights','')}</div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Document</th><th>Type</th><th>Size</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>
    ${DB.documents.map(d=>`<tr>
      <td class="t-name"><div class="ph" style="display:grid;place-items:center;background:#fdf6e3;color:#a17b0b;border-radius:9px"><i data-lucide="file-text" style="width:17px;height:17px"></i></div><div><b>${esc(d.name)}</b></div></td>
      <td><span class="pill">${esc(d.type)}</span></td><td>${esc(d.size)}</td><td>${esc(d.date)}</td><td>${badge(d.status)}</td>
      <td style="text-align:right"><button class="btn btn-sm btn-line" onclick="toast('Downloading ${esc(d.name)} — demo')"><i data-lucide="download"></i> Download</button></td>
    </tr>`).join('')}
    </tbody></table></div></div>`;
  icons();
};
function uploadDoc(){modal('Upload document',
  `<form id="udf"><div class="field"><label>Document name</label><input name="name" placeholder="e.g. Loan Agreement 2026.pdf"></div>
   <div class="field"><label>Type</label><select name="type"><option>Contract</option><option>Report</option><option>Profile</option><option>Media</option><option>Legal</option></select></div>
   <div class="field"><label>File</label><input type="file"></div></form>`,
  `<button class="btn btn-line" onclick="closeModal()">Cancel</button><button class="btn btn-gold" onclick="saveDoc()"><i data-lucide="upload"></i> Upload</button>`);}
function saveDoc(){const fd=new FormData($('#udf'));const o={id:uid(),size:'—',date:new Date().toISOString().slice(0,10),status:'Current'};
  fd.forEach((v,k)=>{if(k!=='file')o[k]=v;});if(!o.name)o.name='Untitled document.pdf';
  DB.documents.unshift(o);save();closeModal();go('documents');toast('Document uploaded');}

/* ============ SETTINGS (every role) ============ */
VIEWS.settings=host=>{
  const[uname,label]=USERS[state.role];
  const email=state.role==='player'?me().email:(state.role+'@pianafc.com');
  host.innerHTML=pageHead('Settings','Manage your account details, notification preferences and security.')+
  `<div class="grid g2" style="align-items:start">
    <div class="card"><div class="card-head"><h3>Account details</h3></div>
      <div class="card-p"><form id="setf">
        <div class="form-grid">
          <div class="field"><label>Full name</label><input name="name" value="${esc(uname)}"></div>
          <div class="field"><label>Role</label><input value="${esc(label)}" disabled></div>
          <div class="field full"><label>Email</label><input name="email" value="${esc(email)}"></div>
          <div class="field"><label>Phone</label><input name="phone" value="${esc(state.role==='player'?me().phone:'+353 1 000 0000')}"></div>
          <div class="field"><label>Language</label><select><option>English</option><option>Italian</option><option>French</option></select></div>
        </div>
        <button type="button" class="btn btn-gold" onclick="saveSettings()"><i data-lucide="check"></i> Save changes</button>
      </form></div></div>
    <div style="display:grid;gap:18px">
      <div class="card"><div class="card-head"><h3>Notification preferences</h3></div>
        <div class="card-p" style="display:grid;gap:12px">
          ${[['Email me about new messages',true],['Alert me on introduction requests',true],['Monthly progress summary',true],['Marketing & product updates',false]].map((o,i)=>
            `<label style="display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13.5px;color:var(--ink);cursor:pointer">
              ${o[0]}<input type="checkbox" ${o[1]?'checked':''} style="width:18px;height:18px;accent-color:var(--gold)"></label>`).join('')}
        </div></div>
      <div class="card"><div class="card-head"><h3>Security</h3></div>
        <div class="card-p" style="display:grid;gap:10px">
          <button class="btn btn-line btn-block" style="justify-content:flex-start" onclick="toast('Password reset link sent — demo')"><i data-lucide="key-round"></i> Change password</button>
          <button class="btn btn-line btn-block" style="justify-content:flex-start" onclick="reset()"><i data-lucide="rotate-ccw"></i> Reset demo data</button>
          <button class="btn btn-danger btn-block" style="justify-content:flex-start" onclick="logout()"><i data-lucide="log-out"></i> Log out</button>
        </div></div>
    </div>
  </div>`;
  icons();
};
function saveSettings(){const fd=new FormData($('#setf'));const name=fd.get('name');
  if(name){USERS[state.role][0]=name;if(state.role==='player')me().name=name;
    const s=getSession();if(s){s.name=name;s.role=state.role;try{localStorage.setItem('pfc_session',JSON.stringify(s));}catch(e){}}
    $('#userName').textContent=name;$('#userAv').textContent=initials(name);}
  if(state.role==='player'&&fd.get('email'))me().email=fd.get('email');
  save();toast('Settings saved');}

/* ============ PLAYER ============ */
VIEWS.profile=host=>{
  const p=me();
  host.innerHTML=pageHead('My Profile','Your complete PFC player passport — keep every field current for scouts, clubs and agents.',
    `<button class="btn btn-line" onclick="editProfile()"><i data-lucide="pencil"></i> Edit profile</button>`)+
  `<div class="grid g3" style="align-items:start">
    <div class="card card-p" style="text-align:center">
      <img src="${p.pic}" class="avatar-lg" style="margin:0 auto 14px" alt="${esc(p.name)}">
      <h3>${esc(p.name)}</h3>
      <p style="color:var(--muted);font-size:13px;margin:2px 0 12px">${esc(p.pos)} · ${esc(p.club)}</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${badge(p.membership)}${badge(p.injury)}${badge(p.transfer)}</div>
      <div style="margin-top:16px;text-align:left">
        <div class="section-title">Contact</div>
        <dl class="kv"><dt>Phone</dt><dd>${esc(p.phone)}</dd><dt>Email</dt><dd>${esc(p.email)}</dd></dl>
      </div>
      ${p.under18?`<div style="margin-top:14px;text-align:left"><div class="section-title">Parent / Guardian</div><p style="font-size:12.5px;color:var(--body)">${esc(p.parent)}</p></div>`:''}
    </div>
    <div class="card card-p">
      <div class="section-title">Player Details</div>
      <dl class="kv">
        <dt>Position</dt><dd>${esc(p.pos)}</dd>
        <dt>Preferred foot</dt><dd>${esc(p.foot)}</dd>
        <dt>Height</dt><dd>${p.height} cm</dd>
        <dt>Weight</dt><dd>${p.weight} kg</dd>
        <dt>Age</dt><dd>${p.age}</dd>
        <dt>Nationality</dt><dd>${esc(p.nat)}</dd>
        <dt>Passport(s)</dt><dd>${esc(p.passports)}</dd>
        <dt>Languages</dt><dd>${esc(p.langs)}</dd>
      </dl>
    </div>
    <div class="card card-p">
      <div class="section-title">Career Status</div>
      <dl class="kv">
        <dt>Current club</dt><dd>${esc(p.club)}</dd>
        <dt>Contract</dt><dd>${esc(p.contract)}</dd>
        <dt>Transfer</dt><dd>${esc(p.transfer)}</dd>
        <dt>Injury</dt><dd>${esc(p.injury)}</dd>
        <dt>Agent</dt><dd>${esc(p.agent)}</dd>
        <dt>Education</dt><dd>${esc(p.education)}</dd>
        <dt>Membership</dt><dd>${esc(p.membership)}</dd>
      </dl>
    </div>
  </div>`;
};
function editProfile(){
  const p=me();
  const f=(l,k,t)=>`<div class="field"><label>${l}</label><input name="${k}" value="${esc(p[k])}" ${t?`type="${t}"`:''}></div>`;
  modal('Edit Profile',`<form id="pf"><div class="form-grid">
    ${f('Full name','name')}${f('Position','pos')}
    ${f('Preferred foot','foot')}${f('Nationality','nat')}
    ${f('Height (cm)','height','number')}${f('Weight (kg)','weight','number')}
    ${f('Age','age','number')}${f('Passport(s)','passports')}
    ${f('Current club','club')}${f('Contract status','contract')}
    ${f('Transfer availability','transfer')}${f('Injury status','injury')}
    ${f('Languages','langs')}${f('Education','education')}
    ${f('Phone','phone')}${f('Email','email','email')}
    <div class="field full"><label>Agent status</label><input name="agent" value="${esc(p.agent)}"></div>
    <div class="field full"><label>Parent / guardian details (if under 18)</label><input name="parent" value="${esc(p.parent)}"></div>
  </div></form>`,
  `<button class="btn btn-line" onclick="closeModal()">Cancel</button><button class="btn btn-gold" onclick="saveProfile()"><i data-lucide="save"></i> Save</button>`);
}
function saveProfile(){
  const fd=new FormData($('#pf'));const p=me();
  fd.forEach((v,k)=>{p[k]=(k==='height'||k==='weight'||k==='age')?Number(v):v;});
  p.under18=Number(p.age)<18;save();closeModal();go('profile');toast('Profile updated');
}

VIEWS.career=host=>{
  const p=me();
  host.innerHTML=pageHead('Career Plan','Your development scores, plan and confidential PFC notes.',
    `<span class="badge b-gold" style="font-size:13px;padding:7px 14px">Overall Rating ${p.overall}</span>`)+
  `<div class="grid g2" style="align-items:start">
    <div class="card card-p"><div class="section-title">Ability Radar</div><canvas id="radar" height="230"></canvas></div>
    <div class="card card-p"><div class="section-title">Score Breakdown</div>
      ${scoreBar('Technical',p.tech)}${scoreBar('Tactical',p.tac)}${scoreBar('Physical',p.phys)}
      ${scoreBar('Mental',p.mental)}${scoreBar('Athletic',p.ath)}
      <div style="border-top:1px solid var(--line);margin-top:8px;padding-top:12px">${scoreBar('Overall Rating',p.overall)}</div>
    </div>
  </div>
  <div class="grid g2" style="margin-top:18px;align-items:start">
    <div class="card card-p"><div class="section-title">Strengths</div><div class="taglist">${p.strengths.split(',').map(s=>`<span class="pill ok">${esc(s.trim())}</span>`).join('')}</div>
      <div class="section-title" style="margin-top:18px">Weaknesses</div><div class="taglist">${p.weakness.split(',').map(s=>`<span class="pill warn">${esc(s.trim())}</span>`).join('')}</div></div>
    <div class="card card-p"><div class="section-title">Monthly Targets</div><p style="color:var(--body)">${esc(p.targets)}</p>
      <div class="section-title" style="margin-top:16px">Development Plan</div><p style="color:var(--body)">${esc(p.plan)}</p></div>
  </div>
  <div class="grid g2" style="margin-top:18px;align-items:start">
    <div class="card card-p" style="border-left:3px solid var(--info)"><div class="section-title">Coach Notes</div><p style="color:var(--body)">${esc(p.coachNotes)}</p></div>
    <div class="card card-p" style="border-left:3px solid var(--gold)"><div class="section-title">PFC Notes</div><p style="color:var(--body)">${esc(p.pfcNotes)}</p></div>
  </div>`;
  drawRadar(p);
};
function drawRadar(p){
  const cv=$('#radar');if(!cv||!window.Chart)return;
  new Chart(cv,{type:'radar',data:{labels:['Technical','Tactical','Physical','Mental','Athletic'],
    datasets:[{data:[p.tech,p.tac,p.phys,p.mental,p.ath],
      backgroundColor:'rgba(212,175,55,.18)',borderColor:'#d4af37',pointBackgroundColor:'#d4af37',borderWidth:2}]},
    options:{plugins:{legend:{display:false}},scales:{r:{min:0,max:100,ticks:{display:false,stepSize:20},
      grid:{color:'#e2e8f0'},angleLines:{color:'#e2e8f0'},pointLabels:{font:{size:12,weight:'600'},color:'#334155'}}}}});
}

VIEWS.progress=host=>{
  const rows=DB.progress.filter(r=>r.player===DB.me).sort((a,b)=>b.month.localeCompare(a.month));
  const latest=rows[0];
  host.innerHTML=pageHead('Monthly Progress Tracker','Uploaded each month by PFC and your coaches — performance data, media & profile updates.',
    `<button class="btn btn-line" onclick="uploadProgress()"><i data-lucide="upload"></i> Upload month</button>`)+
  (latest?`<div class="grid g4" style="margin-bottom:20px">
    ${statCard('timer',latest.minutes,'Minutes played')}
    ${statCard('play',latest.starts,'Starts','g')}
    ${statCard('target',latest.goals,'Goals','gr')}
    ${statCard('star',latest.rating,'Avg match rating','g')}
  </div>`:'')+
  rows.map(r=>`<div class="card" style="margin-bottom:16px">
    <div class="card-head"><h3>${new Date(r.month+'-01').toLocaleString('en',{month:'long',year:'numeric'})}</h3><span class="badge b-gold">Match rating ${r.rating}</span></div>
    <div class="card-p"><div class="grid g4" style="gap:12px;margin-bottom:16px">
      <div><div class="l" style="font-size:11px;color:var(--muted)">Minutes / Starts</div><b>${r.minutes} · ${r.starts}</b></div>
      <div><div class="l" style="font-size:11px;color:var(--muted)">Goals / Assists</div><b>${r.goals} · ${r.assists}</b></div>
      <div><div class="l" style="font-size:11px;color:var(--muted)">Clean sheets</div><b>${r.cleanSheets}</b></div>
      <div><div class="l" style="font-size:11px;color:var(--muted)">Gym sessions</div><b>${r.gym}</b></div>
    </div>
    <div class="grid g2" style="gap:14px">
      <div><div class="section-title">Sprint / Athletic data</div><p style="font-size:13px">${esc(r.sprint)}</p>
        <div class="section-title" style="margin-top:12px">Injuries</div><p style="font-size:13px">${esc(r.injuries)}</p>
        <div class="section-title" style="margin-top:12px">New achievements</div><p style="font-size:13px">${esc(r.achievements)}</p></div>
      <div><div class="section-title">Coach feedback</div><p style="font-size:13px">${esc(r.coach)}</p>
        <div class="section-title" style="margin-top:12px">PFC review & updates</div><p style="font-size:13px">${esc(r.pfcReview)}</p></div>
    </div>
    <div style="margin-top:16px"><div class="section-title">Match videos & training clips</div>
      <div class="video-grid">${videoCard('images/action.webp','Match highlights — '+r.month)}${videoCard('images/hero.webp','Training clip')}</div></div>
    </div></div>`).join('')||emptyState('No progress uploaded yet.');
};
function uploadProgress(){
  const f=(l,k,t)=>`<div class="field"><label>${l}</label><input name="${k}" ${t?`type="${t}"`:''}></div>`;
  modal('Upload Monthly Progress',`<form id="upf"><div class="form-grid">
    <div class="field"><label>Month</label><input name="month" type="month" value="2026-08"></div>
    ${f('Minutes played','minutes','number')}${f('Starts','starts','number')}${f('Goals','goals','number')}
    ${f('Assists','assists','number')}${f('Clean sheets','cleanSheets','number')}${f('Avg match rating','rating','number')}
    ${f('Gym sessions','gym','number')}
    <div class="field full">${''}<label>Sprint / athletic data</label><input name="sprint"></div>
    <div class="field full"><label>Injuries</label><input name="injuries" placeholder="None"></div>
    <div class="field full"><label>New achievements</label><input name="achievements"></div>
    <div class="field full"><label>Coach feedback</label><textarea name="coach"></textarea></div>
    <div class="field full"><label>PFC review & profile updates</label><textarea name="pfcReview"></textarea></div>
  </div></form>`,
  `<button class="btn btn-line" onclick="closeModal()">Cancel</button><button class="btn btn-gold" onclick="saveProgress()"><i data-lucide="upload"></i> Upload</button>`);
}
function saveProgress(){
  const fd=new FormData($('#upf'));const o={id:uid(),player:DB.me};
  fd.forEach((v,k)=>{o[k]=['minutes','starts','goals','assists','cleanSheets','rating','gym'].includes(k)?Number(v||0):v;});
  DB.progress.push(o);save();closeModal();go('progress');toast('Monthly progress uploaded');
}

VIEWS.pvideos=host=>{
  const p=me();
  host.innerHTML=pageHead('Videos & Football CV','Your match footage, training clips and downloadable CV — shared with clubs, scouts and agents.',
    `<button class="btn btn-gold" onclick="toast('CV PDF generated — demo')"><i data-lucide="download"></i> Download CV</button>`)+
  `<div class="card card-p" style="margin-bottom:18px"><div class="section-title">Football CV Summary</div>
    <div class="grid g2"><dl class="kv"><dt>Position</dt><dd>${esc(p.pos)}</dd><dt>Foot</dt><dd>${esc(p.foot)}</dd>
      <dt>Height / Weight</dt><dd>${p.height}cm · ${p.weight}kg</dd><dt>Current club</dt><dd>${esc(p.club)}</dd></dl>
    <dl class="kv"><dt>Overall rating</dt><dd>${p.overall}</dd><dt>Nationality</dt><dd>${esc(p.nat)}</dd>
      <dt>Passports</dt><dd>${esc(p.passports)}</dd><dt>Availability</dt><dd>${esc(p.transfer)}</dd></dl></div></div>
  <div class="card card-p"><div class="section-title">Video Library</div>
    <div class="video-grid">
      ${videoCard('images/action.webp','Season highlights 2026')}
      ${videoCard('images/hero.webp','Full match — vs Cabinteely')}
      ${videoCard(p.pic,'Skills & technical reel')}
      ${videoCard('images/network.webp','Training session')}
    </div></div>`;
};
/* ============ MEMBERSHIP (Stripe via hosted checkout) ============ */
const PLANS=[
  {id:'Starter',price:29,feat:false,items:['Verified player profile','Football CV builder','1 video upload / month','Listed in PFC database']},
  {id:'Pro',price:49,feat:true,items:['Everything in Starter','Career plan & ability scores','Monthly progress tracker','Unlimited video uploads','Scout report access']},
  {id:'Elite',price:79,feat:false,items:['Everything in Pro','Priority club introductions','Dedicated PFC advisor','Curated trial opportunities','Agent connection service']}
];
VIEWS.membership=host=>{
  const p=me();
  host.innerHTML=pageHead('Membership','Choose your monthly PFC membership. Secure card payment powered by Stripe.',
    `<span class="badge b-gold" style="padding:7px 14px;font-size:13px">Current: ${esc(p.membership||'None')}</span>`)+
  `<div class="plans">${PLANS.map(pl=>`
    <div class="plan ${pl.feat?'feat':''}">${pl.feat?'<span class="tag">Most popular</span>':''}
      <h3>${pl.id}</h3><div class="price">${money(pl.price)}<span>/month</span></div>
      <ul>${pl.items.map(i=>`<li><i data-lucide="check"></i>${i}</li>`).join('')}</ul>
      <button class="btn ${pl.feat?'btn-gold':'btn-dark'} btn-block" onclick="pay('${pl.id}',${pl.price})">
        ${p.membership===pl.id?'Renew':'Choose'} ${pl.id} <i data-lucide="arrow-right"></i></button>
    </div>`).join('')}</div>
  <div class="card card-p" style="margin-top:22px;display:flex;gap:14px;align-items:center">
    <i data-lucide="shield-check" style="width:26px;height:26px;color:var(--ok)"></i>
    <div><b style="color:var(--ink)">Secure checkout</b><p style="font-size:13px;color:var(--muted)">Payments are processed by Stripe. Cancel anytime. VAT handled at checkout.</p></div>
  </div>`;
};
async function pay(plan,price){
  const p=me();
  toast('Opening secure Stripe checkout…');
  try{
    const r=await fetch(CHECKOUT_BASE+'/create',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({product_name:'PFC '+plan+' Membership (monthly)',price:price,currency:'EUR',
        customer_email:p.email||'member@example.com',customer_name:p.name||'PFC Member',
        success_url:location.origin+location.pathname+'?paid='+plan,cancel_url:location.href})});
    const d=await r.json();
    if(d&&d.url){window.location.href=d.url;return;}
    payFallback(plan,price,(d&&d.reason)||'Checkout is not enabled yet.');
  }catch(e){payFallback(plan,price,'Could not reach the payment service.');}
}
function payFallback(plan,price,reason){
  modal('Membership — '+plan,
    `<p style="color:var(--body)">${esc(reason)} Card payments go live once Stripe is connected for this site.</p>
     <div class="card card-p" style="margin-top:14px;background:#fafbfc">
       <dl class="kv"><dt>Plan</dt><dd>PFC ${plan}</dd><dt>Price</dt><dd>${money(price)}/month</dd></dl></div>
     <p style="font-size:13px;color:var(--muted);margin-top:14px">You can activate this plan in demo mode to preview the member experience.</p>`,
    `<button class="btn btn-line" onclick="closeModal()">Close</button>
     <button class="btn btn-gold" onclick="activatePlan('${plan}',${price})"><i data-lucide="check"></i> Activate (demo)</button>`);
}
function activatePlan(plan,price){
  const p=me();p.membership=plan;p.member=true;
  DB.payments.unshift({id:uid(),member:p.name,plan:plan,amount:price,currency:'EUR',
    date:new Date().toISOString().slice(0,10),status:'Paid'});
  save();closeModal();go('membership');toast(plan+' membership activated');
}

/* ============ MESSAGES (shared) ============ */
VIEWS.messages=host=>{
  host.innerHTML=pageHead('Messages','Your PFC inbox — communicate with head office, scouts and clubs.',
    `<button class="btn btn-gold" onclick="composeMsg()"><i data-lucide="pencil"></i> New message</button>`)+
  `<div class="card">${DB.messages.map(m=>`
    <div class="msg-row" onclick="openMsg('${m.id}')">
      <div class="av">${initials(m.from)}</div>
      <div style="flex:1;min-width:0"><div class="mtop"><b>${esc(m.from)} ${m.read?'':'<span class="badge b-info" style="margin-left:6px">New</span>'}</b><time>${esc(m.date)}</time></div>
      <div style="font-size:13.5px;color:var(--ink);font-weight:600">${esc(m.subject)}</div><p>${esc(m.preview)}</p></div>
    </div>`).join('')}</div>`;
};
function openMsg(id){const m=DB.messages.find(x=>x.id===id);if(!m)return;m.read=true;save();
  modal(esc(m.subject),`<p style="color:var(--muted);font-size:12.5px;margin-bottom:12px">From <b>${esc(m.from)}</b> · ${esc(m.date)}</p>
    <p style="color:var(--body)">${esc(m.preview)} This is a demo message thread. In production, full conversation history and attachments appear here.</p>
    <div class="field" style="margin-top:16px"><label>Reply</label><textarea placeholder="Type a reply…"></textarea></div>`,
    `<button class="btn btn-line" onclick="closeModal()">Close</button><button class="btn btn-gold" onclick="closeModal();toast('Reply sent')"><i data-lucide="send"></i> Send</button>`);
  go(state.view);}
function composeMsg(){modal('New Message',
  `<form id="mf"><div class="field"><label>To</label><select name="to"><option>PFC Head Office</option><option>My Scout</option><option>Support</option></select></div>
   <div class="field"><label>Subject</label><input name="subject"></div>
   <div class="field"><label>Message</label><textarea name="body"></textarea></div></form>`,
  `<button class="btn btn-line" onclick="closeModal()">Cancel</button><button class="btn btn-gold" onclick="closeModal();toast('Message sent')"><i data-lucide="send"></i> Send</button>`);}

/* ============ SCOUT ============ */
VIEWS.assigned=host=>{
  const sc=DB.scouts[0];const list=sc.assigned.map(P);
  host.innerHTML=pageHead('Assigned Players','Players PFC has assigned to you for scouting and reporting.')+
  `<div class="grid g4" style="margin-bottom:20px">
    ${statCard('users',list.length,'Assigned')}${statCard('file-text',sc.reports,'Reports filed','g')}
    ${statCard('wallet',money(sc.earnings),'Earnings','gr')}${statCard('star',sc.rating,'Scout rating','g')}</div>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Player</th><th>Position</th><th>Age</th><th>Club</th><th>Status</th><th></th></tr></thead><tbody>
  ${list.map(p=>`<tr><td class="t-name"><img src="${p.pic}" alt="${esc(p.name)}"><div><b>${esc(p.name)}</b><span>${esc(p.nat)}</span></div></td>
    <td>${esc(p.pos)}</td><td>${p.age}</td><td>${esc(p.club)}</td><td>${badge(p.transfer)}</td>
    <td style="text-align:right"><button class="btn btn-sm btn-line" onclick="go('upload-report')"><i data-lucide="file-plus-2"></i> Report</button></td></tr>`).join('')}
  </tbody></table></div></div>`;
};
VIEWS.requests=host=>{
  host.innerHTML=pageHead('Club Requests','Scouting reports requested by clubs through PFC.')+
  `<div class="card"><div class="table-wrap"><table><thead><tr><th>Club</th><th>Player</th><th>Requested</th><th>Status</th><th></th></tr></thead><tbody>
  ${DB.assignments.map(a=>`<tr><td><b>${esc(a.club)}</b></td><td>${esc(a.pos)} target</td><td>${esc(a.deadline)}</td><td>${badge(a.status)}</td>
    <td style="text-align:right"><button class="btn btn-sm btn-gold" onclick="go('upload-report')">Fulfil</button></td></tr>`).join('')}
  <tr><td><b>Shelbourne FC</b></td><td>Marco Piana</td><td>2026-08-01</td><td>${badge('Pending')}</td>
    <td style="text-align:right"><button class="btn btn-sm btn-gold" onclick="go('upload-report')">Fulfil</button></td></tr>
  </tbody></table></div></div>`;
};
VIEWS.templates=host=>{
  host.innerHTML=pageHead('Report Templates','The standardised PFC scouting report. Every report you submit uses these fields.',
    `<button class="btn btn-gold" onclick="go('upload-report')"><i data-lucide="file-plus-2"></i> Use template</button>`)+
  `<div class="card card-p"><div class="section-title">PFC Standard Scout Report — fields</div>
   <div class="grid g3" style="gap:10px">${['Match details','Position','Minutes watched','Technical','Tactical','Physical','Mental','Personality','Strengths','Weaknesses','Development potential','Best league','Estimated level','Overall rating','Recommendation'].map(f=>`<div class="pill">${f}</div>`).join('')}</div>
   <p style="margin-top:16px;color:var(--muted);font-size:13px">All fields are mandatory. Ratings use a 1–10 scale except Overall Rating (0–100).</p></div>`;
};
VIEWS['upload-report']=host=>{
  const opts=DB.players.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
  const r10='<option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option>';
  host.innerHTML=pageHead('Upload Scouting Report','Complete every field of the PFC standard report. It is submitted to admin for approval.')+
  `<form id="srf" class="card card-p">
    <div class="form-grid">
      <div class="field"><label>Player</label><select name="player">${opts}</select></div>
      <div class="field"><label>Match details</label><input name="opp" placeholder="e.g. St Kevin's 2-1 Cabinteely, 12 Jul"></div>
      <div class="field"><label>Position played</label><input name="pos" placeholder="CM"></div>
      <div class="field"><label>Minutes watched</label><input name="minutes" type="number" value="90"></div>
      <div class="field"><label>Technical (1-10)</label><select name="tech">${r10}</select></div>
      <div class="field"><label>Tactical (1-10)</label><select name="tac">${r10}</select></div>
      <div class="field"><label>Physical (1-10)</label><select name="phys">${r10}</select></div>
      <div class="field"><label>Mental (1-10)</label><select name="mental">${r10}</select></div>
      <div class="field"><label>Personality (1-10)</label><select name="personality">${r10}</select></div>
      <div class="field"><label>Overall rating (0-100)</label><input name="overall" type="number" value="75"></div>
      <div class="field"><label>Development potential</label><select name="potential"><option>Very High</option><option>High</option><option>Medium</option><option>Limited</option></select></div>
      <div class="field"><label>Best league</label><input name="league" placeholder="Serie B"></div>
      <div class="field full"><label>Estimated level</label><input name="level" placeholder="Championship level within 2 years"></div>
      <div class="field full"><label>Strengths</label><textarea name="strengths"></textarea></div>
      <div class="field full"><label>Weaknesses</label><textarea name="weakness"></textarea></div>
      <div class="field full"><label>Recommendation</label><textarea name="recommendation" placeholder="Recommend / Monitor / Pass — with reasoning"></textarea></div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:6px">
      <button type="button" class="btn btn-line" onclick="go('templates')">Cancel</button>
      <button type="button" class="btn btn-gold" onclick="saveReport()"><i data-lucide="send"></i> Submit report</button></div>
  </form>`;
};
function saveReport(){
  const fd=new FormData($('#srf'));const o={id:uid(),scout:DB.scouts[0].id,date:new Date().toISOString().slice(0,10),status:'Pending'};
  fd.forEach((v,k)=>{o[k]=['minutes','tech','tac','phys','mental','personality','overall'].includes(k)?Number(v):v;});
  DB.reports.unshift(o);save();toast('Report submitted for approval');go('matches');
}
VIEWS.matches=host=>{
  host.innerHTML=pageHead('Match History','Matches you have covered and the reports produced.')+
  `<div class="card"><div class="table-wrap"><table><thead><tr><th>Date</th><th>Match</th><th>Player</th><th>Pos</th><th>Overall</th><th>Recommendation</th><th>Status</th></tr></thead><tbody>
  ${DB.reports.filter(r=>r.scout==='s1').map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.opp)}</td><td>${esc(P(r.player).name)}</td><td>${esc(r.pos)}</td>
    <td><b>${r.overall}</b></td><td>${esc((r.recommendation||'').split('—')[0])}</td><td>${badge(r.status)}</td></tr>`).join('')}
  </tbody></table></div></div>`;
};
VIEWS.earnings=host=>{
  const sc=DB.scouts[0];
  host.innerHTML=pageHead('Earnings','Your scouting income and payout history.')+
  `<div class="grid g3" style="margin-bottom:20px">
    ${statCard('wallet',money(sc.earnings),'Total earned','gr')}${statCard('file-text',sc.reports,'Reports paid','g')}
    ${statCard('trending-up',money(300),'This month','g')}</div>
  <div class="card"><div class="card-head"><h3>Payout history</h3></div><div class="table-wrap"><table>
   <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead><tbody>
   <tr><td>2026-07-20</td><td>Report — Kofi Mensah</td><td>${money(300)}</td><td>${badge('Paid')}</td></tr>
   <tr><td>2026-07-12</td><td>Report — Marco Piana</td><td>${money(300)}</td><td>${badge('Paid')}</td></tr>
   <tr><td>2026-07-01</td><td>Monthly retainer</td><td>${money(800)}</td><td>${badge('Paid')}</td></tr>
   <tr><td>2026-07-28</td><td>Report — pending approval</td><td>${money(300)}</td><td>${badge('Pending')}</td></tr>
   </tbody></table></div></div>`;
};
/* ============ SHARED: search / player database ============ */
let SEARCH={q:'',pos:'',foot:''};
function playerRow(p,ctx){
  return `<tr><td class="t-name"><img src="${p.pic}" alt="${esc(p.name)}"><div><b>${esc(p.name)}</b><span>${esc(p.nat)} · ${p.age}y</span></div></td>
    <td>${esc(p.pos)}</td><td>${esc(p.foot)}</td><td>${p.height}cm</td><td>${esc(p.club)}</td>
    <td>${badge(p.transfer)}</td>
    <td style="text-align:right;white-space:nowrap">
      <button class="btn btn-sm btn-line" onclick="viewPlayer('${p.id}')"><i data-lucide="eye"></i></button>
      <button class="btn btn-sm btn-line" onclick="toggleWatch('${p.id}')"><i data-lucide="${DB.watchlist.includes(p.id)?'bookmark-check':'bookmark'}"></i></button>
      <button class="btn btn-sm btn-gold" onclick="requestIntro('${p.id}')">Intro</button>
    </td></tr>`;
}
function filteredPlayers(){
  return DB.players.filter(p=>{
    if(SEARCH.q&&!(p.name+p.club+p.nat).toLowerCase().includes(SEARCH.q.toLowerCase()))return false;
    if(SEARCH.pos&&!p.pos.includes(SEARCH.pos))return false;
    if(SEARCH.foot&&p.foot!==SEARCH.foot)return false;
    return true;
  });
}
function renderSearch(host,title,desc){
  host.innerHTML=pageHead(title,desc)+
  `<div class="toolbar">
    <div class="search"><i data-lucide="search"></i><input id="sq" placeholder="Search name, club, nationality…" value="${esc(SEARCH.q)}"></div>
    <select id="sp" class="chip" style="padding:8px 12px"><option value="">Any position</option><option>Midfielder</option><option>Winger</option><option>Back</option><option>Forward</option></select>
    <select id="sf" class="chip" style="padding:8px 12px"><option value="">Any foot</option><option>Right</option><option>Left</option></select>
    <button class="btn btn-line btn-sm" onclick="saveSearch()"><i data-lucide="save"></i> Save search</button>
  </div>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Player</th><th>Position</th><th>Foot</th><th>Height</th><th>Club</th><th>Availability</th><th></th></tr></thead>
   <tbody id="ptbody"></tbody></table></div></div>`;
  const draw=()=>{const b=$('#ptbody');const rows=filteredPlayers();
    b.innerHTML=rows.length?rows.map(p=>playerRow(p)).join(''):'<tr><td colspan="7"><div class="empty"><i data-lucide="search-x"></i><p>No players match these filters.</p></div></td></tr>';icons();};
  $('#sq').oninput=e=>{SEARCH.q=e.target.value;draw();};
  $('#sp').onchange=e=>{SEARCH.pos=e.target.value;draw();};
  $('#sf').onchange=e=>{SEARCH.foot=e.target.value;draw();};
  draw();
}
VIEWS.search=host=>renderSearch(host,'Search Players','Advanced filters across the full PFC talent database. View profiles, videos and request introductions.');
function toggleWatch(id){const i=DB.watchlist.indexOf(id);if(i>-1)DB.watchlist.splice(i,1);else DB.watchlist.push(id);save();go(state.view);toast(i>-1?'Removed from watchlist':'Added to watchlist');}
function saveSearch(){DB.savedSearches.push({id:uid(),name:'Search '+(DB.savedSearches.length+1),
  filters:[SEARCH.pos||'Any pos',SEARCH.foot||'Any foot',SEARCH.q||'—'].join(' · ')});save();toast('Search saved');}
function requestIntro(id){const p=P(id);
  DB.introductions.unshift({id:uid(),player:id,from:USERS[state.role][0],fromType:state.role,date:new Date().toISOString().slice(0,10),status:'Requested'});
  save();toast('Introduction requested for '+p.name);go(state.view==='search'?'introductions':state.view);}
function viewPlayer(id){const p=P(id);
  modal(esc(p.name),`<div style="display:flex;gap:16px;margin-bottom:16px"><img src="${p.pic}" class="avatar-lg" alt="${esc(p.name)}">
    <div><h3>${esc(p.name)}</h3><p style="color:var(--muted);font-size:13px">${esc(p.pos)} · ${esc(p.club)}</p>
    <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${badge(p.transfer)}${badge(p.injury)}<span class="badge b-gold">Overall ${p.overall}</span></div></div></div>
    <div class="grid g2"><dl class="kv"><dt>Foot</dt><dd>${esc(p.foot)}</dd><dt>Height/Weight</dt><dd>${p.height}cm·${p.weight}kg</dd>
      <dt>Age</dt><dd>${p.age}</dd><dt>Nationality</dt><dd>${esc(p.nat)}</dd><dt>Passports</dt><dd>${esc(p.passports)}</dd></dl>
    <dl class="kv"><dt>Contract</dt><dd>${esc(p.contract)}</dd><dt>Agent</dt><dd>${esc(p.agent)}</dd>
      <dt>Languages</dt><dd>${esc(p.langs)}</dd><dt>Membership</dt><dd>${esc(p.membership)}</dd></dl></div>
    <div class="section-title" style="margin-top:16px">Strengths</div><p style="font-size:13px">${esc(p.strengths)}</p>`,
    `<button class="btn btn-line" onclick="closeModal()">Close</button>
     <button class="btn btn-line" onclick="closeModal();toast('Opening video reel — demo')"><i data-lucide="play"></i> Videos</button>
     <button class="btn btn-gold" onclick="closeModal();requestIntro('${id}')"><i data-lucide="handshake"></i> Request intro</button>`);}

VIEWS.watchlist=host=>{
  const list=DB.watchlist.map(P);
  host.innerHTML=pageHead('Watchlist','Players you are actively tracking.')+
  (list.length?`<div class="card"><div class="table-wrap"><table><thead><tr><th>Player</th><th>Position</th><th>Foot</th><th>Height</th><th>Club</th><th>Availability</th><th></th></tr></thead>
    <tbody>${list.map(p=>playerRow(p)).join('')}</tbody></table></div></div>`:emptyState('Your watchlist is empty. Add players from Search.'));
};
VIEWS.saved=host=>{
  const isAgent=state.role==='agent';
  if(isAgent){const list=DB.watchlist.map(P);
    host.innerHTML=pageHead('Saved Players','Players you have shortlisted.')+
    (list.length?`<div class="card"><div class="table-wrap"><table><thead><tr><th>Player</th><th>Position</th><th>Foot</th><th>Height</th><th>Club</th><th>Availability</th><th></th></tr></thead>
      <tbody>${list.map(p=>playerRow(p)).join('')}</tbody></table></div></div>`:emptyState('No saved players yet.'));return;}
  host.innerHTML=pageHead('Saved Searches','Re-run your saved filter sets in one click.',
    `<button class="btn btn-line" onclick="go('search')"><i data-lucide="plus"></i> New search</button>`)+
  `<div class="grid g2">${DB.savedSearches.map(s=>`<div class="card card-p" style="display:flex;justify-content:space-between;align-items:center">
    <div><b style="color:var(--ink)">${esc(s.name)}</b><p style="font-size:12.5px;color:var(--muted)">${esc(s.filters)}</p></div>
    <button class="btn btn-sm btn-gold" onclick="go('search')">Run</button></div>`).join('')}</div>`;
};
VIEWS.introductions=host=>{
  host.innerHTML=pageHead('Introductions','Introduction requests and their current status with PFC.')+
  `<div class="card"><div class="table-wrap"><table><thead><tr><th>Player</th><th>Requested by</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>
  ${DB.introductions.map(i=>`<tr><td class="t-name"><img src="${P(i.player).pic}" alt=""><b>${esc(P(i.player).name)}</b></td>
    <td>${esc(i.from)}</td><td>${esc(i.date)}</td><td>${badge(i.status)}</td>
    <td style="text-align:right"><button class="btn btn-sm btn-line" onclick="viewPlayer('${i.player}')">View</button></td></tr>`).join('')}
  </tbody></table></div></div>`;
};
/* ---- club-specific ---- */
VIEWS.assignment=host=>{
  host.innerHTML=pageHead('Recruitment Assignment','Brief PFC with exactly what you need. We deliver a curated shortlist — no more searching alone.')+
  `<div class="card card-p" style="margin-bottom:18px;background:#fdf6e3;border-color:var(--gold)">
    <div style="display:flex;gap:12px;align-items:center"><i data-lucide="sparkles" style="width:22px;height:22px;color:#a17b0b"></i>
    <p style="color:#8a6d0f;font-size:13.5px">Complete this brief and PFC will return a hand-picked shortlist of players matching your criteria, with reports and video.</p></div></div>
  <form id="raf" class="card card-p"><div class="form-grid">
    <div class="field"><label>Position required</label><input name="pos" placeholder="Centre-Back"></div>
    <div class="field"><label>Age range</label><input name="age" placeholder="18-23"></div>
    <div class="field"><label>Minimum height</label><input name="height" placeholder="186cm+"></div>
    <div class="field"><label>Preferred foot</label><select name="foot"><option>Any</option><option>Right</option><option>Left</option></select></div>
    <div class="field"><label>Nationality preference</label><input name="nat" placeholder="Any"></div>
    <div class="field"><label>Passport requirement</label><input name="passport" placeholder="EU preferred"></div>
    <div class="field"><label>Transfer budget</label><input name="budget" placeholder="€250,000"></div>
    <div class="field"><label>Salary range</label><input name="salary" placeholder="€4k-6k / month"></div>
    <div class="field"><label>Playing style</label><input name="style" placeholder="Ball-playing, aggressive"></div>
    <div class="field"><label>League experience</label><input name="leagueExp" placeholder="2nd tier+"></div>
    <div class="field"><label>Availability</label><input name="avail" placeholder="January window"></div>
    <div class="field"><label>Deadline</label><input name="deadline" type="date"></div>
    <div class="field full"><label>Additional notes</label><textarea name="notes"></textarea></div>
  </div>
  <div style="display:flex;justify-content:flex-end;gap:10px"><button type="button" class="btn btn-gold" onclick="saveAssignment()"><i data-lucide="send"></i> Submit brief to PFC</button></div>
  </form>
  <div class="card" style="margin-top:20px"><div class="card-head"><h3>Your submitted briefs</h3></div>
    <div class="table-wrap"><table><thead><tr><th>Position</th><th>Budget</th><th>Deadline</th><th>Status</th></tr></thead>
    <tbody id="ratbody"></tbody></table></div></div>`;
  drawAssignments();
};
function drawAssignments(){const b=$('#ratbody');if(!b)return;
  b.innerHTML=DB.assignments.map(a=>`<tr><td><b>${esc(a.pos)}</b><br><span style="font-size:11.5px;color:var(--muted)">${esc(a.style||'')}</span></td>
    <td>${esc(a.budget)}</td><td>${esc(a.deadline)}</td><td>${badge(a.status)}</td></tr>`).join('');}
function saveAssignment(){const fd=new FormData($('#raf'));const o={id:uid(),club:USERS[state.role][0],status:'Received — shortlist in progress'};
  fd.forEach((v,k)=>o[k]=v);DB.assignments.unshift(o);save();toast('Brief submitted — PFC will deliver a shortlist');go('assignment');}
VIEWS.clubreports=host=>renderReports(host,'Reports','Download scouting reports for players you are tracking.');
VIEWS.agentreports=host=>renderReports(host,'Reports','Scouting reports for players in your pipeline.');
function renderReports(host,title,desc){
  host.innerHTML=pageHead(title,desc)+
  `<div class="card"><div class="table-wrap"><table><thead><tr><th>Player</th><th>Match</th><th>Date</th><th>Overall</th><th>Potential</th><th></th></tr></thead><tbody>
  ${DB.reports.filter(r=>r.status==='Approved').concat(DB.reports.filter(r=>r.status!=='Approved')).map(r=>`<tr>
    <td>${esc(P(r.player).name)}</td><td>${esc(r.opp)}</td><td>${esc(r.date)}</td><td><b>${r.overall}</b></td><td>${badge(r.potential)}</td>
    <td style="text-align:right"><button class="btn btn-sm btn-line" onclick="viewReport('${r.id}')"><i data-lucide="eye"></i> View</button>
      <button class="btn btn-sm btn-gold" onclick="toast('Report PDF downloaded — demo')"><i data-lucide="download"></i></button></td></tr>`).join('')}
  </tbody></table></div></div>`;
}
function viewReport(id){const r=DB.reports.find(x=>x.id===id);if(!r)return;
  modal('Scout Report — '+esc(P(r.player).name),
    `<p style="color:var(--muted);font-size:12.5px;margin-bottom:12px">${esc(r.opp)} · ${esc(r.date)} · ${esc(r.pos)} · ${r.minutes} min · Scout: ${esc((DB.scouts.find(s=>s.id===r.scout)||{}).name||'PFC')}</p>
    <div class="grid g2" style="margin-bottom:14px">
      ${scoreBar('Technical',r.tech*10)}${scoreBar('Tactical',r.tac*10)}${scoreBar('Physical',r.phys*10)}${scoreBar('Mental',r.mental*10)}${scoreBar('Personality',r.personality*10)}</div>
    <dl class="kv" style="margin-bottom:14px"><dt>Overall rating</dt><dd>${r.overall}/100</dd><dt>Development potential</dt><dd>${esc(r.potential)}</dd>
      <dt>Best league</dt><dd>${esc(r.league)}</dd><dt>Estimated level</dt><dd>${esc(r.level)}</dd></dl>
    <div class="section-title">Strengths</div><p style="font-size:13px">${esc(r.strengths)}</p>
    <div class="section-title" style="margin-top:10px">Weaknesses</div><p style="font-size:13px">${esc(r.weakness)}</p>
    <div class="section-title" style="margin-top:10px">Recommendation</div><p style="font-size:13px;font-weight:600;color:var(--ink)">${esc(r.recommendation)}</p>`,
    `<button class="btn btn-line" onclick="closeModal()">Close</button><button class="btn btn-gold" onclick="closeModal();toast('Report PDF downloaded — demo')"><i data-lucide="download"></i> Download PDF</button>`);}
VIEWS.videos=host=>{
  host.innerHTML=pageHead('Player Videos','Match footage and training clips for players in the PFC database.')+
  `<div class="video-grid">${DB.players.map(p=>videoCard(p.pic,p.name+' — highlight reel')).concat([videoCard('images/action.webp','Featured match action'),videoCard('images/hero.webp','Training showcase')]).join('')}</div>`;
};
/* ---- agent-specific ---- */
VIEWS.representation=host=>{
  host.innerHTML=pageHead('Representation','Players who have requested — or are open to — representation.')+
  `<div class="card"><div class="table-wrap"><table><thead><tr><th>Player</th><th>Position</th><th>Agent status</th><th>Availability</th><th></th></tr></thead><tbody>
  ${DB.players.map(p=>`<tr><td class="t-name"><img src="${p.pic}" alt=""><b>${esc(p.name)}</b></td><td>${esc(p.pos)}</td>
    <td>${badge(p.agent)}</td><td>${badge(p.transfer)}</td>
    <td style="text-align:right"><button class="btn btn-sm btn-gold" onclick="toast('Representation request sent to '+'${esc(p.name)}')">Request</button></td></tr>`).join('')}
  </tbody></table></div></div>`;
};
VIEWS.signed=host=>{
  const list=(DB.agents[0].signed||[]).map(P);
  host.innerHTML=pageHead('Signed Players','Players you currently represent.')+
  (list.length?`<div class="grid g3">${list.map(p=>`<div class="card card-p" style="text-align:center">
    <img src="${p.pic}" class="avatar-lg" style="margin:0 auto 12px" alt="${esc(p.name)}"><h3>${esc(p.name)}</h3>
    <p style="font-size:13px;color:var(--muted)">${esc(p.pos)} · ${esc(p.club)}</p>
    <div style="margin-top:10px">${badge('Signed')}</div>
    <button class="btn btn-line btn-block btn-sm" style="margin-top:14px" onclick="viewPlayer('${p.id}')">View profile</button></div>`).join('')}</div>`
    :emptyState('You have no signed players yet.'));
};
VIEWS.notifications=host=>{
  host.innerHTML=pageHead('Notifications','Your latest alerts and updates.',
    `<button class="btn btn-line btn-sm" onclick="markAllRead()">Mark all read</button>`)+
  `<div class="card card-p">${DB.notifications.map(n=>`<div class="notif ${n.read?'read':''}"><div class="dot"></div>
    <div><b>${esc(n.text)}</b><br><time>${esc(n.date)}</time></div></div>`).join('')}</div>`;
};
function markAllRead(){DB.notifications.forEach(n=>n.read=true);save();go('notifications');toast('All notifications read');}
/* ============ ADMIN ============ */
function adminTable(cols,rows){
  return `<div class="card"><div class="table-wrap"><table><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${rows||''}</tbody></table></div></div>`;
}
VIEWS['a-players']=host=>{
  host.innerHTML=pageHead('Players','Every registered player across the PFC platform.')+
  `<div class="grid g4" style="margin-bottom:20px">
    ${statCard('users',DB.players.length,'Total players')}
    ${statCard('badge-check',DB.players.filter(p=>p.member).length,'Paying members','gr')}
    ${statCard('activity',DB.players.filter(p=>/available|immediately/i.test(p.transfer)).length,'Available','g')}
    ${statCard('heart-pulse',DB.players.filter(p=>p.injury!=='Fit').length,'With injuries','rd')}</div>`+
  adminTable(['Player','Position','Age','Club','Membership','Availability','Overall'],
    DB.players.map(p=>`<tr><td class="t-name"><img src="${p.pic}" alt=""><div><b>${esc(p.name)}</b><span>${esc(p.nat)}</span></div></td>
      <td>${esc(p.pos)}</td><td>${p.age}</td><td>${esc(p.club)}</td><td>${badge(p.membership)}</td><td>${badge(p.transfer)}</td><td><b>${p.overall}</b></td></tr>`).join(''));
};
VIEWS['a-scouts']=host=>{
  host.innerHTML=pageHead('Scouts','The PFC scouting network.')+
  adminTable(['Scout','Region','Assigned','Reports','Rating','Earnings'],
    DB.scouts.map(s=>`<tr><td class="t-name"><div class="ph"></div><b>${esc(s.name)}</b></td><td>${esc(s.region)}</td>
      <td>${s.assigned.length}</td><td>${s.reports}</td><td>${badge('High')} ${s.rating}</td><td>${money(s.earnings)}</td></tr>`).join(''));
};
VIEWS['a-agents']=host=>{
  host.innerHTML=pageHead('Agents','Licensed agents connected to PFC.')+
  adminTable(['Agent','License','Region','Signed','Requests'],
    DB.agents.map(a=>`<tr><td class="t-name"><div class="ph"></div><b>${esc(a.name)}</b></td><td>${badge(a.license)}</td>
      <td>${esc(a.region)}</td><td>${(a.signed||[]).length}</td><td>${a.requests}</td></tr>`).join(''));
};
VIEWS['a-clubs']=host=>{
  host.innerHTML=pageHead('Clubs','Club partners using the PFC platform.')+
  adminTable(['Club','Country','Level','Contact'],
    DB.clubs.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.country)}</td><td>${esc(c.level)}</td><td>${esc(c.contact)}</td></tr>`).join(''));
};
VIEWS['a-assessments']=host=>{
  host.innerHTML=pageHead('Assessments Booked','Player assessments booked through the website.')+
  adminTable(['Player','Type','Date','Status'],
    DB.assessments.map(a=>`<tr><td><b>${esc(a.player)}</b></td><td>${esc(a.type)}</td><td>${esc(a.date)}</td><td>${badge(a.status)}</td></tr>`).join(''));
};
VIEWS['a-payments']=host=>{
  const total=DB.payments.reduce((s,p)=>s+Number(p.amount),0);
  host.innerHTML=pageHead('Membership Payments','All membership revenue processed via Stripe.')+
  `<div class="grid g3" style="margin-bottom:20px">
    ${statCard('credit-card',money(total),'Total revenue','gr')}
    ${statCard('repeat',money(total)+'/mo','Recurring MRR','g')}
    ${statCard('users',DB.payments.length,'Active members')}</div>`+
  adminTable(['Member','Plan','Amount','Date','Status'],
    DB.payments.map(p=>`<tr><td><b>${esc(p.member)}</b></td><td>${badge(p.plan)}</td><td>${money(p.amount)}</td><td>${esc(p.date)}</td><td>${badge(p.status)}</td></tr>`).join(''));
};
VIEWS['a-introductions']=host=>{
  host.innerHTML=pageHead('Introductions','All introduction requests from clubs and agents.')+
  adminTable(['Player','Requested by','Type','Date','Status','Action'],
    DB.introductions.map(i=>`<tr><td>${esc(P(i.player).name)}</td><td>${esc(i.from)}</td><td>${badge(i.fromType)}</td><td>${esc(i.date)}</td><td>${badge(i.status)}</td>
      <td style="text-align:right">${i.status==='Requested'?`<button class="btn btn-sm btn-gold" onclick="approveIntro('${i.id}')">Approve</button>`:'<span class="badge b-ok">Done</span>'}</td></tr>`).join(''));
};
function approveIntro(id){const i=DB.introductions.find(x=>x.id===id);if(i)i.status='Approved';save();go('a-introductions');toast('Introduction approved');}
VIEWS['a-assignments']=host=>{
  host.innerHTML=pageHead('Recruitment Assignments','Club recruitment briefs awaiting curated shortlists.')+
  adminTable(['Club','Position','Budget','Deadline','Status'],
    DB.assignments.map(a=>`<tr><td><b>${esc(a.club)}</b></td><td>${esc(a.pos)}</td><td>${esc(a.budget)}</td><td>${esc(a.deadline)}</td><td>${badge(a.status)}</td></tr>`).join(''));
};
VIEWS['a-opps']=host=>{
  host.innerHTML=pageHead('Trial Opportunities','Trials and showcases managed by PFC.',
    `<button class="btn btn-gold" onclick="addOpp()"><i data-lucide="plus"></i> Add opportunity</button>`)+
  adminTable(['Opportunity','Position','Level','Deadline','Status'],
    DB.opportunities.map(o=>`<tr><td><b>${esc(o.title)}</b></td><td>${esc(o.pos)}</td><td>${esc(o.level)}</td><td>${esc(o.deadline)}</td><td>${badge(o.status)}</td></tr>`).join(''));
};
function addOpp(){modal('Add Trial Opportunity',
  `<form id="opf"><div class="field"><label>Title</label><input name="title"></div>
   <div class="form-grid"><div class="field"><label>Position</label><input name="pos"></div>
   <div class="field"><label>Level</label><input name="level"></div>
   <div class="field"><label>Deadline</label><input name="deadline" type="date"></div>
   <div class="field"><label>Status</label><select name="status"><option>Open</option><option>Closed</option></select></div></div></form>`,
  `<button class="btn btn-line" onclick="closeModal()">Cancel</button><button class="btn btn-gold" onclick="saveOpp()">Add</button>`);}
function saveOpp(){const fd=new FormData($('#opf'));const o={id:uid()};fd.forEach((v,k)=>o[k]=v);DB.opportunities.unshift(o);save();closeModal();go('a-opps');toast('Opportunity added');}
VIEWS['a-approvals']=host=>{
  const pending=DB.reports.filter(r=>r.status==='Pending');
  host.innerHTML=pageHead('Reports Awaiting Approval','Scouting reports submitted by scouts, awaiting your sign-off before release.')+
  (pending.length?adminTable(['Player','Match','Scout','Overall','Recommendation','Action'],
    pending.map(r=>`<tr><td>${esc(P(r.player).name)}</td><td>${esc(r.opp)}</td><td>${esc((DB.scouts.find(s=>s.id===r.scout)||{}).name||'—')}</td><td><b>${r.overall}</b></td>
      <td>${esc((r.recommendation||'').split('—')[0])}</td>
      <td style="text-align:right;white-space:nowrap"><button class="btn btn-sm btn-line" onclick="viewReport('${r.id}')">Review</button>
      <button class="btn btn-sm btn-gold" onclick="approveReport('${r.id}')">Approve</button></td></tr>`).join(''))
    :emptyState('No reports awaiting approval.'));
};
function approveReport(id){const r=DB.reports.find(x=>x.id===id);if(r)r.status='Approved';save();go('a-approvals');toast('Report approved & released');}
VIEWS['a-messages']=host=>{
  host.innerHTML=pageHead('Messages','All platform messages routed through PFC.')+
  `<div class="card">${DB.messages.map(m=>`<div class="msg-row" onclick="openMsg('${m.id}')"><div class="av">${initials(m.from)}</div>
    <div style="flex:1;min-width:0"><div class="mtop"><b>${esc(m.from)} <span class="badge b-grey" style="margin-left:6px">${esc(m.role)}</span></b><time>${esc(m.date)}</time></div>
    <div style="font-size:13.5px;color:var(--ink);font-weight:600">${esc(m.subject)}</div><p>${esc(m.preview)}</p></div></div>`).join('')}</div>`;
};
VIEWS['a-analytics']=host=>{
  host.innerHTML=pageHead('Analytics','Platform-wide performance across members, revenue and scouting activity.')+
  `<div class="grid g4" style="margin-bottom:20px">
    ${statCard('users',DB.players.length,'Players')}${statCard('user-search',DB.scouts.length,'Scouts','g')}
    ${statCard('building-2',DB.clubs.length,'Clubs','gr')}${statCard('credit-card',money(DB.payments.reduce((s,p)=>s+ +p.amount,0)),'MRR','g')}</div>
  <div class="grid g2" style="align-items:start">
    <div class="card card-p"><div class="section-title">Membership revenue (2026)</div><canvas id="revChart" height="220"></canvas></div>
    <div class="card card-p"><div class="section-title">Members by plan</div><canvas id="planChart" height="220"></canvas></div>
  </div>
  <div class="card card-p" style="margin-top:18px"><div class="section-title">Introductions & reports (last 6 months)</div><canvas id="actChart" height="130"></canvas></div>`;
  drawAdminCharts();
};
function drawAdminCharts(){
  if(!window.Chart)return;
  const gold='#d4af37',ink='#0f172a',grid='#eef1f4';
  new Chart($('#revChart'),{type:'line',data:{labels:['Feb','Mar','Apr','May','Jun','Jul'],
    datasets:[{data:[210,340,480,620,780,950],borderColor:gold,backgroundColor:'rgba(212,175,55,.14)',fill:true,tension:.35,pointBackgroundColor:gold,borderWidth:2}]},
    options:{plugins:{legend:{display:false}},scales:{y:{grid:{color:grid},ticks:{callback:v=>'€'+v}},x:{grid:{display:false}}}}});
  const byPlan={};DB.payments.forEach(p=>byPlan[p.plan]=(byPlan[p.plan]||0)+1);
  new Chart($('#planChart'),{type:'doughnut',data:{labels:Object.keys(byPlan),
    datasets:[{data:Object.values(byPlan),backgroundColor:['#0f172a',gold,'#e6c65c','#94a3b8']}]},
    options:{plugins:{legend:{position:'bottom'}},cutout:'62%'}});
  new Chart($('#actChart'),{type:'bar',data:{labels:['Feb','Mar','Apr','May','Jun','Jul'],
    datasets:[{label:'Introductions',data:[2,4,5,7,9,12],backgroundColor:gold,borderRadius:5},
      {label:'Reports',data:[3,5,6,8,7,10],backgroundColor:ink,borderRadius:5}]},
    options:{plugins:{legend:{position:'bottom'}},scales:{y:{grid:{color:grid}},x:{grid:{display:false}}}}});
}
VIEWS['a-legal']=host=>{
  host.innerHTML=pageHead('Legal & Business','Contracts, compliance and business operations — integration in progress.')+
  `<div class="grid g3" style="margin-bottom:20px">
    ${statCard('file-signature','—','Contracts','g')}${statCard('shield-check','—','Compliance','gr')}${statCard('landmark','—','Invoicing')}</div>
  <div class="legal-note"><b>Coming soon.</b> Legal &amp; business controls — representation contracts, FIFA compliance checks, invoicing and payouts — will be integrated in a later phase. Admin will manage all documents and workflows from this panel.</div>`;
};

/* =========================================================================
   SUPER ADMIN — dedicated platform-owner control centre (interface only)
   Full oversight of every account, membership, payment, report and system.
   Demo actions mutate local demo data; auth/routing are intentionally untouched.
   ========================================================================= */

/* ---- Super Admin subtitles ---- */
Object.assign(SUBS,{
  'sa-overview':'Platform command centre — full owner oversight',
  'sa-users':'Every account across the platform',
  'sa-admins':'Administrators, roles & privileges',
  'sa-players':'All registered players',
  'sa-agents':'Licensed agents',
  'sa-scouts':'Scouting network',
  'sa-clubs':'Club partners',
  'sa-memberships':'Plans, subscriptions & lifecycle',
  'sa-finance':'Revenue, subscriptions, refunds & payouts',
  'sa-bookings':'Consultations, assessments & briefings',
  'sa-applications':'New players applying to join Piana FC',
  'sa-reports':'Moderate all scouting reports & content',
  'sa-messages':'Every message routed through the platform',
  'sa-notifications':'Platform-wide alerts & system events',
  'sa-tickets':'Member support requests & resolutions',
  'sa-analytics':'Platform-wide growth & performance',
  'sa-cms':'Homepage content & media',
  'sa-security':'Sessions, 2FA, access & threats',
  'sa-audit':'Complete administrative audit trail',
  'sa-system':'Service health & uptime',
  'sa-database':'Tables, storage & integrity',
  'sa-backups':'Snapshots, schedule & restore',
  'sa-settings':'Global platform configuration'
});

/* ---- Super Admin demo datasets (kept out of persisted DB, auth untouched) ---- */
const SA_ADMINS=[
  {id:'ad1',name:'PFC Super Admin',email:'owner@pianafc.com',role:'super_admin',level:'Owner',status:'Active',twofa:true,joined:'2024-01-05',lastActive:'Just now'},
  {id:'ad2',name:'PFC Admin',email:'admin@pianafc.com',role:'admin',level:'Administrator',status:'Active',twofa:true,joined:'2024-03-11',lastActive:'2h ago'},
  {id:'ad3',name:"Grace O'Neill",email:'grace@pianafc.com',role:'admin',level:'Operations',status:'Active',twofa:false,joined:'2025-02-20',lastActive:'Yesterday'},
  {id:'ad4',name:'Tom Reilly',email:'tom@pianafc.com',role:'admin',level:'Finance',status:'Suspended',twofa:true,joined:'2025-06-02',lastActive:'12d ago'}
];
const SA_AUDIT=[
  {ts:'2026-07-29 09:14',actor:'PFC Super Admin',action:'Approved scouting report',target:'Kofi Mensah — Ghana Trial',ip:'86.44.12.9',type:'Content'},
  {ts:'2026-07-29 08:51',actor:'PFC Super Admin',action:'Reset password',target:'grace@pianafc.com',ip:'86.44.12.9',type:'Security'},
  {ts:'2026-07-28 21:07',actor:'PFC Admin',action:'Refunded payment',target:'Diego Fontana — €49',ip:'92.11.3.44',type:'Finance'},
  {ts:'2026-07-28 16:32',actor:'PFC Super Admin',action:'Suspended admin',target:'tom@pianafc.com',ip:'86.44.12.9',type:'Security'},
  {ts:'2026-07-28 11:20',actor:'System',action:'Automatic backup completed',target:'snapshot-2026-07-28',ip:'internal',type:'System'},
  {ts:'2026-07-27 19:44',actor:'PFC Admin',action:'Edited player profile',target:'Marco Piana',ip:'92.11.3.44',type:'Content'},
  {ts:'2026-07-27 09:05',actor:'PFC Super Admin',action:'Force logout',target:'All sessions — Kofi Mensah',ip:'86.44.12.9',type:'Security'}
];
const SA_BACKUPS=[
  {id:'bk1',date:'2026-07-29 03:00',size:'48.2 MB',type:'Automatic',status:'Complete',dur:'12s'},
  {id:'bk2',date:'2026-07-28 03:00',size:'47.9 MB',type:'Automatic',status:'Complete',dur:'11s'},
  {id:'bk3',date:'2026-07-27 14:22',size:'47.6 MB',type:'Manual',status:'Complete',dur:'13s'},
  {id:'bk4',date:'2026-07-27 03:00',size:'47.4 MB',type:'Automatic',status:'Complete',dur:'12s'}
];
const SA_LOGINS=[
  {who:'unknown@—',ip:'201.55.9.11',loc:'São Paulo, BR',when:'2026-07-29 07:41',attempts:5,status:'Blocked'},
  {who:'admin@pianafc.com',ip:'92.11.3.44',loc:'Dublin, IE',when:'2026-07-29 06:02',attempts:1,status:'Success'},
  {who:'tom@pianafc.com',ip:'45.9.148.2',loc:'Unknown VPN',when:'2026-07-28 23:18',attempts:3,status:'Challenged'}
];
const SA_SERVICES=[
  {name:'Web Application',status:'Operational',uptime:'99.98%',latency:'82ms'},
  {name:'Authentication API',status:'Operational',uptime:'99.99%',latency:'44ms'},
  {name:'Payments (Stripe)',status:'Operational',uptime:'100%',latency:'120ms'},
  {name:'Media / Video CDN',status:'Degraded',uptime:'99.71%',latency:'310ms'},
  {name:'Email Delivery',status:'Operational',uptime:'99.95%',latency:'—'},
  {name:'Background Jobs',status:'Operational',uptime:'99.90%',latency:'—'}
];
const SA_TABLES=[
  {name:'players',rows:128,size:'6.4 MB',health:'Healthy'},
  {name:'scouts',rows:34,size:'0.9 MB',health:'Healthy'},
  {name:'agents',rows:19,size:'0.4 MB',health:'Healthy'},
  {name:'clubs',rows:57,size:'1.1 MB',health:'Healthy'},
  {name:'reports',rows:412,size:'18.2 MB',health:'Healthy'},
  {name:'payments',rows:296,size:'2.7 MB',health:'Healthy'},
  {name:'messages',rows:1840,size:'9.6 MB',health:'Optimise'},
  {name:'sessions',rows:73,size:'0.3 MB',health:'Healthy'}
];
const SA_STATUS={}; // status overrides for accounts without a native status field
const LASTSEEN=['Just now','12m ago','2h ago','Yesterday','3d ago','1w ago'];

function saLog(action,target,type){
  const now=new Date();const ts=now.toISOString().slice(0,10)+' '+now.toTimeString().slice(0,5);
  SA_AUDIT.unshift({ts,actor:'PFC Super Admin',action,target,ip:'86.44.12.9',type:type||'System'});
}
function saBadge(s){
  const t=(s||'').toLowerCase();let c='b-grey';
  if(/(active|operational|complete|success|healthy|paid|approved|verified|confirm|resolved)/.test(t))c='b-ok';
  else if(/(suspended|blocked|failed|error|down|overdue|removed|deleted|reject|cancel|urgent)/.test(t))c='b-danger';
  else if(/(pending|degraded|challenged|optimise|review|warning|trial|progress|high|\bopen\b)/.test(t))c='b-warn';
  else if(/(owner|super|elite|pro)/.test(t))c='b-gold';
  return `<span class="badge ${c}">${esc(s)}</span>`;
}
/* Unified account list assembled from live demo data */
function saAccounts(){
  const rows=[];
  SA_ADMINS.forEach(a=>rows.push({key:'admin:'+a.id,name:a.name,email:a.email,role:a.level,rk:a.role,joined:a.joined,last:a.lastActive,_ref:a}));
  (DB.players||[]).forEach((p,i)=>rows.push({key:'player:'+p.id,name:p.name,email:p.email||'—',role:'Player',rk:'player',joined:'2025',last:LASTSEEN[i%LASTSEEN.length],_ref:p}));
  (DB.scouts||[]).forEach((s,i)=>rows.push({key:'scout:'+s.id,name:s.name,email:(s.name.split(' ')[0]||'scout').toLowerCase()+'@pianafc.com',role:'Scout',rk:'scout',joined:'2025',last:LASTSEEN[(i+2)%LASTSEEN.length],_ref:s}));
  (DB.agents||[]).forEach((a,i)=>rows.push({key:'agent:'+a.id,name:a.name,email:(a.name.split(' ')[0]||'agent').toLowerCase()+'@agency.com',role:'Agent',rk:'agent',joined:'2024',last:LASTSEEN[(i+3)%LASTSEEN.length],_ref:a}));
  (DB.clubs||[]).forEach((c,i)=>rows.push({key:'club:'+c.id,name:c.name,email:c.contact||'—',role:'Club',rk:'club',joined:'2024',last:LASTSEEN[(i+1)%LASTSEEN.length],_ref:c}));
  return rows;
}
function accStatus(a){if(a._ref&&a._ref.status)return a._ref.status;return SA_STATUS[a.key]||'Active';}
function setAccStatus(a,s){if(a._ref&&('status' in a._ref))a._ref.status=s;else SA_STATUS[a.key]=s;}
function accByKey(k){return saAccounts().find(a=>a.key===k);}

/* ---- Super Admin account actions (demo) ---- */
function saToggleSuspend(k,view){const a=accByKey(k);if(!a)return;const now=accStatus(a);const next=now==='Suspended'?'Active':'Suspended';
  setAccStatus(a,next);saLog(next==='Suspended'?'Suspended account':'Reactivated account',a.name,'Security');save();go(view||state.view);toast(a.name+' '+(next==='Suspended'?'suspended':'reactivated'));}
function saForceLogout(k,view){const a=accByKey(k);if(!a)return;saLog('Force logout — all sessions',a.name,'Security');go(view||state.view);toast('All sessions ended for '+a.name);}
function saResetPw(k){const a=accByKey(k);if(!a)return;saLog('Password reset link sent',a.email||a.name,'Security');toast('Password reset link sent to '+a.name);}
function saDeleteAccount(k,view){const a=accByKey(k);if(!a)return;
  modal('Delete account',`<p style="color:var(--body)">Permanently delete <b>${esc(a.name)}</b> (${esc(a.role)})? This removes every associated record. This cannot be undone.</p>`,
  `<button class="btn btn-line" onclick="closeModal()">Cancel</button><button class="btn btn-danger" onclick="saDeleteConfirm('${k}','${view||state.view}')">Delete permanently</button>`);}
function saDeleteConfirm(k,view){const [r,id]=k.split(':');
  if(r==='admin'){const i=SA_ADMINS.findIndex(x=>x.id===id);if(i>-1)SA_ADMINS.splice(i,1);}
  else{const arr=DB[r+'s'];if(arr){const i=arr.findIndex(x=>x.id===id);if(i>-1)arr.splice(i,1);save();}}
  saLog('Deleted account',k,'Security');closeModal();go(view||state.view);toast('Account deleted');}
function saCreateAccount(view){
  modal('Create account',
   `<form id="saNewForm"><div class="form-grid">
      <div class="field"><label>Full name</label><input name="name" placeholder="Jane Doe"></div>
      <div class="field"><label>Email</label><input name="email" type="email" placeholder="jane@pianafc.com"></div>
      <div class="field"><label>Role</label><select name="role"><option value="player">Player</option><option value="scout">Scout</option><option value="agent">Agent</option><option value="club">Club</option><option value="admin">Admin</option></select></div>
      <div class="field"><label>Status</label><select name="status"><option>Active</option><option>Pending</option><option>Suspended</option></select></div>
    </div>
    <div class="field" style="margin-top:12px"><label>Temporary password</label><input name="pw" type="text" placeholder="Auto-generated if blank"></div>
    <label style="display:flex;align-items:center;gap:9px;margin-top:12px;font-size:13.5px;color:var(--ink);cursor:pointer"><input type="checkbox" name="invite" checked style="width:17px;height:17px;accent-color:var(--gold)"> Send welcome / verification email</label></form>`,
   `<button class="btn btn-line" onclick="closeModal()">Cancel</button><button class="btn btn-gold" onclick="saCreateConfirm('${view||'sa-users'}')">Create account</button>`);
}
function saCreateConfirm(view){
  const fd=new FormData($('#saNewForm'));const o={};fd.forEach((v,k)=>o[k]=v);
  if(!o.name){toast('Name is required');return;}
  const id=uid();
  if(o.role==='admin'){SA_ADMINS.push({id,name:o.name,email:o.email||'—',role:'admin',level:'Administrator',status:o.status||'Active',twofa:false,joined:new Date().toISOString().slice(0,10),lastActive:'Never'});}
  else if(o.role==='player'){DB.players.push({id,name:o.name,email:o.email||'—',pic:'images/player-1.webp',pos:'—',nat:'—',age:'—',club:'—',membership:'—',member:false,transfer:'—',injury:'Fit',overall:'—',status:o.status||'Active'});save();}
  else if(o.role==='scout'){DB.scouts.push({id,name:o.name,region:'—',assigned:[],reports:0,earnings:0,rating:'—',status:o.status||'Active'});save();}
  else if(o.role==='agent'){DB.agents.push({id,name:o.name,license:'Pending',region:'—',signed:[],requests:0,status:o.status||'Active'});save();}
  else if(o.role==='club'){DB.clubs.push({id,name:o.name,country:'—',level:'—',contact:o.email||'—',status:o.status||'Active'});save();}
  saLog('Created account',o.name+' ('+o.role+')','Security');closeModal();go(view);toast('Account created — '+o.name);
}
function saPromote(id){const a=SA_ADMINS.find(x=>x.id===id);if(!a)return;
  if(a.role==='admin'){a.role='super_admin';a.level='Owner';saLog('Promoted to Super Admin',a.name,'Security');toast(a.name+' promoted to Super Admin');}
  else{a.role='admin';a.level='Administrator';saLog('Granted Admin',a.name,'Security');toast(a.name+' is now an Admin');}
  go('sa-admins');}
function saDemote(id){const a=SA_ADMINS.find(x=>x.id===id);if(!a)return;
  a.role='admin';a.level='Administrator';saLog('Demoted from Super Admin',a.name,'Security');go('sa-admins');toast(a.name+' demoted to Admin');}
function saRowMenu(k,view){
  const a=accByKey(k);if(!a)return;const susp=accStatus(a)==='Suspended';
  return `<div class="rowacts">
    <button class="btn btn-sm btn-line" title="Edit" onclick="saEditAccount('${k}','${view}')"><i data-lucide="pencil"></i></button>
    <button class="btn btn-sm btn-line" title="Reset password" onclick="saResetPw('${k}')"><i data-lucide="key-round"></i></button>
    <button class="btn btn-sm btn-line" title="Force logout" onclick="saForceLogout('${k}','${view}')"><i data-lucide="power"></i></button>
    <button class="btn btn-sm ${susp?'btn-gold':'btn-line'}" title="${susp?'Reactivate':'Suspend'}" onclick="saToggleSuspend('${k}','${view}')"><i data-lucide="${susp?'circle-check':'ban'}"></i></button>
    <button class="btn btn-sm btn-danger" title="Delete" onclick="saDeleteAccount('${k}','${view}')"><i data-lucide="trash-2"></i></button>
  </div>`;
}
function saEditAccount(k,view){const a=accByKey(k);if(!a)return;
  modal('Edit account',
   `<form id="saEditForm"><div class="form-grid">
      <div class="field"><label>Full name</label><input name="name" value="${esc(a.name)}"></div>
      <div class="field"><label>Email</label><input name="email" value="${esc(a.email)}"></div>
    </div>
    <div class="field" style="margin-top:12px"><label>Status</label><select name="status"><option ${accStatus(a)==='Active'?'selected':''}>Active</option><option ${accStatus(a)==='Suspended'?'selected':''}>Suspended</option><option ${accStatus(a)==='Pending'?'selected':''}>Pending</option></select></div></form>`,
   `<button class="btn btn-line" onclick="closeModal()">Cancel</button><button class="btn btn-gold" onclick="saEditConfirm('${k}','${view}')">Save changes</button>`);
}
function saEditConfirm(k,view){const a=accByKey(k);if(!a)return;const fd=new FormData($('#saEditForm'));
  const name=fd.get('name'),email=fd.get('email'),status=fd.get('status');
  if(a._ref){a._ref.name=name;if('email' in a._ref)a._ref.email=email;else if('contact' in a._ref)a._ref.contact=email;}
  setAccStatus(a,status);save();saLog('Edited account',name,'Content');closeModal();go(view);toast('Account updated');}

/* ============ SUPER ADMIN — DASHBOARD HOME ============ */
VIEWS['sa-overview']=host=>{
  const accts=saAccounts();
  const rev=(DB.payments||[]).reduce((s,p)=>s+Number(p.amount||0),0);
  const suspended=accts.filter(a=>accStatus(a)==='Suspended').length;
  host.innerHTML=
  `<div class="sa-hero">
     <div>
       <span class="welcome-eyebrow" style="color:var(--gold)">Owner console · full platform authority</span>
       <h2 style="font-size:26px;margin:4px 0 4px;color:#fff">Super Admin Control Centre</h2>
       <p style="color:rgba(255,255,255,.68);font-size:13.5px;margin:0">Every account, payment, report and system on Piana FC — under one roof.</p>
     </div>
     <div class="sa-hero-acts">
       <button class="btn btn-gold" onclick="saCreateAccount('sa-users')"><i data-lucide="user-plus"></i> New account</button>
       <button class="btn btn-ghost-light" onclick="go('sa-audit')"><i data-lucide="scroll-text"></i> Audit logs</button>
     </div>
   </div>
   <div class="sa-kpis" style="margin:20px 0">
     ${statCard('users',accts.length,'Total users')}
     ${statCard('user-round',(DB.players||[]).length,'Active players','g')}
     ${statCard('building-2',(DB.clubs||[]).length,'Clubs registered','gr')}
     ${statCard('briefcase',(DB.agents||[]).length,'Agents registered')}
     ${statCard('binoculars',(DB.scouts||[]).length,'Scouts registered','g')}
     ${statCard('crown',(DB.players||[]).filter(p=>p.member).length,'Active memberships','gr')}
     ${statCard('credit-card',money(rev),'Monthly revenue','gr')}
     ${statCard('shield-check',SA_VERIFY.filter(v=>v.status==='Pending').length,'Pending verifications','rd')}
     ${statCard('calendar-check',SA_BOOKINGS.filter(b=>b.status==='Pending').length,'Pending consultations','rd')}
     ${statCard('life-buoy',SA_TICKETS.filter(t=>t.status!=='Closed').length,'Open support tickets')}
     ${statCard('user-plus',3,'New today','g')}
   </div>
   <div class="sa-charts" style="margin-bottom:18px">
     <div class="card card-p"><div class="section-title">User growth</div><div class="sa-chart-box"><canvas id="saCUsers"></canvas></div></div>
     <div class="card card-p"><div class="section-title">Membership growth</div><div class="sa-chart-box"><canvas id="saCMembers"></canvas></div></div>
     <div class="card card-p"><div class="section-title">Monthly revenue</div><div class="sa-chart-box"><canvas id="saCRevenue"></canvas></div></div>
     <div class="card card-p"><div class="section-title">Player registrations</div><div class="sa-chart-box"><canvas id="saCPlayers"></canvas></div></div>
     <div class="card card-p"><div class="section-title">Club registrations</div><div class="sa-chart-box"><canvas id="saCClubs"></canvas></div></div>
     <div class="card card-p"><div class="section-title">Platform activity</div><div class="sa-chart-box"><canvas id="saCActivity"></canvas></div></div>
   </div>
   <div class="grid g2" style="align-items:start;margin-bottom:18px">
     <div class="card"><div class="card-head"><h3>Platform health</h3><span class="badge b-warn">1 degraded</span></div>
       <div class="card-p" style="display:grid;gap:12px">
         ${SA_SERVICES.slice(0,4).map(s=>`<div class="hrow"><span class="hdot ${/oper/i.test(s.status)?'ok':'warn'}"></span><b style="color:var(--ink);flex:1;font-size:13.5px">${esc(s.name)}</b><span style="color:var(--muted);font-size:12.5px">${esc(s.uptime)}</span>${saBadge(s.status)}</div>`).join('')}
         <button class="btn btn-line btn-block" style="margin-top:4px" onclick="go('sa-system')">Open System Status <i data-lucide="arrow-right" style="margin-left:auto"></i></button>
       </div></div>
     <div class="card"><div class="card-head"><h3>Recent admin activity</h3><span class="badge b-grey">${SA_AUDIT.length}</span></div>
       <div class="card-p" style="padding-top:6px">
         ${SA_AUDIT.slice(0,6).map(l=>`<div class="notif read"><span class="dot"></span><div style="flex:1"><b style="font-weight:500;color:var(--body)">${esc(l.actor)} — ${esc(l.action)}: <span style="color:var(--ink)">${esc(l.target)}</span></b><br><time>${esc(l.ts)}</time></div><i data-lucide="scroll-text" style="width:15px;height:15px;color:var(--muted)"></i></div>`).join('')}
       </div></div>
   </div>
   <div class="card"><div class="card-head"><h3>Owner quick actions</h3></div>
     <div class="card-p sa-quick">
       ${[['sa-users','Manage users','users'],['sa-admins','Manage admins','shield-check'],['sa-reports','Moderate reports','file-check-2'],['sa-finance','Payments & finance','credit-card'],['sa-security','Security centre','shield-alert'],['sa-backups','Run a backup','hard-drive']]
         .map(([v,t,ic])=>`<button class="sa-quick-btn" onclick="go('${v}')"><i data-lucide="${ic}"></i><span>${t}</span><i data-lucide="arrow-up-right" class="ar"></i></button>`).join('')}
     </div></div>`;
  icons();
  saOverviewCharts();
};

/* ============ USER MANAGEMENT (all accounts) ============ */
VIEWS['sa-users']=host=>{
  const accts=saAccounts();
  host.innerHTML=pageHead('User Management','Create, edit, suspend, reset and delete any account on the platform.',
    `<button class="btn btn-gold" onclick="saCreateAccount('sa-users')"><i data-lucide="user-plus"></i> New account</button>`)+
  `<div class="grid g4" style="margin-bottom:18px">
     ${statCard('users',accts.length,'All accounts')}
     ${statCard('circle-check',accts.filter(a=>accStatus(a)==='Active').length,'Active','g')}
     ${statCard('ban',accts.filter(a=>accStatus(a)==='Suspended').length,'Suspended','rd')}
     ${statCard('shield-check',SA_ADMINS.length,'Admins','gr')}</div>
   <div class="card">
     <div class="sa-toolbar">
       <div class="sa-search"><i data-lucide="search"></i><input id="saUserSearch" placeholder="Search by name, email or role…" oninput="saFilterUsers()"></div>
       <div class="sa-chips">
         ${['All','Player','Scout','Agent','Club','Admin'].map((r,i)=>`<button class="sa-chip${i===0?' on':''}" data-role="${r}" onclick="saChipFilter(this)">${r}</button>`).join('')}
       </div>
     </div>
     <div class="table-wrap"><table><thead><tr><th>Account</th><th>Role</th><th>Email</th><th>Last active</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
     <tbody id="saUserBody">${accts.map(a=>saUserRow(a)).join('')}</tbody></table></div>
   </div>`;
  icons();
};
function saUserRow(a){
  return `<tr data-name="${esc((a.name+' '+a.email+' '+a.role).toLowerCase())}" data-role="${esc(a.role.toLowerCase().includes('owner')||a.rk==='admin'||a.rk==='super_admin'?'admin':a.rk)}">
    <td class="t-name"><div class="ph" style="display:grid;place-items:center;background:var(--ink);color:var(--gold);font-weight:700;font-size:12px">${initials(a.name)}</div><div><b>${esc(a.name)}</b><span>${esc(a.rk)}</span></div></td>
    <td>${saBadge(a.role)}</td><td style="color:var(--muted)">${esc(a.email)}</td><td>${esc(a.last)}</td><td>${saBadge(accStatus(a))}</td>
    <td>${saRowMenu(a.key,'sa-users')}</td></tr>`;
}
function saFilterUsers(){const q=($('#saUserSearch').value||'').toLowerCase();
  document.querySelectorAll('#saUserBody tr').forEach(tr=>{tr.style.display=tr.dataset.name.includes(q)?'':'none';});}
function saChipFilter(btn){document.querySelectorAll('.sa-chip').forEach(c=>c.classList.remove('on'));btn.classList.add('on');
  const r=btn.dataset.role.toLowerCase();
  document.querySelectorAll('#saUserBody tr').forEach(tr=>{tr.style.display=(r==='all'||tr.dataset.role===r)?'':'none';});}

/* ============ ADMIN MANAGEMENT ============ */
VIEWS['sa-admins']=host=>{
  host.innerHTML=pageHead('Admin Management','Promote, demote, suspend and control administrator privileges.',
    `<button class="btn btn-gold" onclick="saCreateAccount('sa-admins')"><i data-lucide="user-plus"></i> Add admin</button>`)+
  `<div class="grid g3" style="margin-bottom:18px">
     ${statCard('crown',SA_ADMINS.filter(a=>a.role==='super_admin').length,'Super Admins','g')}
     ${statCard('shield-check',SA_ADMINS.filter(a=>a.role==='admin').length,'Admins','gr')}
     ${statCard('shield',SA_ADMINS.filter(a=>a.twofa).length+'/'+SA_ADMINS.length,'2FA enabled')}</div>
   <div class="card"><div class="table-wrap"><table>
     <thead><tr><th>Administrator</th><th>Level</th><th>2FA</th><th>Joined</th><th>Last active</th><th>Status</th><th style="text-align:right">Privileges</th></tr></thead>
     <tbody>${SA_ADMINS.map(a=>{const owner=a.role==='super_admin';return `<tr>
       <td class="t-name"><div class="ph" style="display:grid;place-items:center;background:var(--ink);color:var(--gold);font-weight:700;font-size:12px">${initials(a.name)}</div><div><b>${esc(a.name)}</b><span>${esc(a.email)}</span></div></td>
       <td>${saBadge(a.level)}</td><td>${a.twofa?'<span class="badge b-ok">On</span>':'<span class="badge b-warn">Off</span>'}</td><td>${esc(a.joined)}</td><td>${esc(a.lastActive)}</td><td>${saBadge(a.status)}</td>
       <td><div class="rowacts">
         ${owner?'<span class="badge b-gold">Full access</span>':`<button class="btn btn-sm btn-gold" onclick="saPromote('${a.id}')"><i data-lucide="arrow-up"></i> Promote</button>`}
         ${owner&&SA_ADMINS.filter(x=>x.role==='super_admin').length>1?`<button class="btn btn-sm btn-line" onclick="saDemote('${a.id}')"><i data-lucide="arrow-down"></i></button>`:''}
         ${owner?'':`<button class="btn btn-sm ${a.status==='Suspended'?'btn-gold':'btn-line'}" onclick="saToggleSuspend('admin:${a.id}','sa-admins')"><i data-lucide="${a.status==='Suspended'?'circle-check':'ban'}"></i></button>
         <button class="btn btn-sm btn-danger" onclick="saDeleteAccount('admin:${a.id}','sa-admins')"><i data-lucide="trash-2"></i></button>`}
       </div></td></tr>`;}).join('')}</tbody></table></div></div>`;
  icons();
};

/* ============ ENTITY MANAGEMENT (players / agents / scouts / clubs) ============ */
function saEntityView(host,opts){
  const list=opts.list();
  host.innerHTML=pageHead(opts.title,opts.desc,
    `<button class="btn btn-gold" onclick="saCreateAccount('${opts.view}')"><i data-lucide="plus"></i> ${opts.add}</button>`)+
  (opts.stats?`<div class="grid g4" style="margin-bottom:18px">${opts.stats}</div>`:'')+
  `<div class="card"><div class="table-wrap"><table><thead><tr>${opts.cols.map(c=>`<th>${c}</th>`).join('')}<th style="text-align:right">Actions</th></tr></thead>
   <tbody>${list.map(x=>`<tr>${opts.row(x)}<td>${saRowMenu(opts.rk+':'+x.id,opts.view)}</td></tr>`).join('')}</tbody></table></div></div>`;
  icons();
}
VIEWS['sa-players']=host=>saEntityView(host,{title:'Player Management',desc:'Full control over every player profile, membership and availability.',
  view:'sa-players',rk:'player',add:'Add player',list:()=>DB.players||[],
  stats:`${statCard('users',DB.players.length,'Players')}${statCard('badge-check',DB.players.filter(p=>p.member).length,'Members','g')}${statCard('crown',DB.players.filter(p=>/elite/i.test(p.membership)).length,'Elite','gr')}${statCard('ban',DB.players.filter(p=>p.status==='Suspended').length,'Suspended','rd')}`,
  cols:['Player','Position','Club','Membership','Availability','Status'],
  row:p=>`<td class="t-name"><img src="${p.pic||'images/player-1.webp'}" alt="${esc(p.name)}" style="object-position:center 20%"><div><b>${esc(p.name)}</b><span>${esc(p.nat||'')}</span></div></td><td>${esc(p.pos)}</td><td>${esc(p.club)}</td><td>${saBadge(p.membership)}</td><td>${badge(p.transfer)}</td><td>${saBadge(p.status||'Active')}</td>`});
VIEWS['sa-agents']=host=>saEntityView(host,{title:'Agent Management',desc:'Manage licensed agents, their rosters and representation access.',
  view:'sa-agents',rk:'agent',add:'Add agent',list:()=>DB.agents||[],
  stats:`${statCard('briefcase',DB.agents.length,'Agents')}${statCard('badge-check',DB.agents.filter(a=>/licensed/i.test(a.license)).length,'FIFA licensed','g')}${statCard('file-signature',DB.agents.reduce((s,a)=>s+(a.signed||[]).length,0),'Signed players','gr')}${statCard('inbox',DB.agents.reduce((s,a)=>s+(a.requests||0),0),'Open requests')}`,
  cols:['Agent','License','Region','Signed','Status'],
  row:a=>`<td class="t-name"><div class="ph" style="display:grid;place-items:center;background:var(--ink);color:var(--gold);font-weight:700;font-size:12px">${initials(a.name)}</div><div><b>${esc(a.name)}</b><span>agent</span></div></td><td>${saBadge(a.license)}</td><td>${esc(a.region)}</td><td>${(a.signed||[]).length}</td><td>${saBadge(a.status||'Active')}</td>`});
VIEWS['sa-scouts']=host=>saEntityView(host,{title:'Scout Management',desc:'Oversee the scouting network, assignments, earnings and access.',
  view:'sa-scouts',rk:'scout',add:'Add scout',list:()=>DB.scouts||[],
  stats:`${statCard('binoculars',DB.scouts.length,'Scouts')}${statCard('file-text',DB.scouts.reduce((s,x)=>s+(x.reports||0),0),'Reports filed','g')}${statCard('wallet',money(DB.scouts.reduce((s,x)=>s+(x.earnings||0),0)),'Total paid','gr')}${statCard('star',(DB.scouts.reduce((s,x)=>s+(+x.rating||0),0)/(DB.scouts.length||1)).toFixed(1),'Avg rating')}`,
  cols:['Scout','Region','Assigned','Reports','Status'],
  row:s=>`<td class="t-name"><div class="ph" style="display:grid;place-items:center;background:var(--ink);color:var(--gold);font-weight:700;font-size:12px">${initials(s.name)}</div><div><b>${esc(s.name)}</b><span>scout</span></div></td><td>${esc(s.region)}</td><td>${(s.assigned||[]).length}</td><td>${s.reports||0}</td><td>${saBadge(s.status||'Active')}</td>`});
VIEWS['sa-clubs']=host=>saEntityView(host,{title:'Club Management',desc:'Manage club partners, access levels and recruitment permissions.',
  view:'sa-clubs',rk:'club',add:'Add club',list:()=>DB.clubs||[],
  stats:`${statCard('building-2',DB.clubs.length,'Clubs')}${statCard('globe',new Set(DB.clubs.map(c=>c.country)).size,'Countries','g')}${statCard('clipboard-list',DB.assignments.length,'Active briefs','gr')}${statCard('handshake',DB.introductions.length,'Introductions')}`,
  cols:['Club','Country','Level','Contact','Status'],
  row:c=>`<td class="t-name"><div class="ph" style="display:grid;place-items:center;background:var(--ink);color:var(--gold)"><i data-lucide="shield" style="width:16px;height:16px"></i></div><div><b>${esc(c.name)}</b><span>club</span></div></td><td>${esc(c.country)}</td><td>${esc(c.level)}</td><td style="color:var(--muted)">${esc(c.contact)}</td><td>${saBadge(c.status||'Active')}</td>`});

/* ============ MEMBERSHIP MANAGEMENT ============ */
VIEWS['sa-memberships']=host=>{
  const members=(DB.players||[]).filter(p=>p.member);
  const plans=[['Elite',79,'#0f172a'],['Pro',49,'#d4af37'],['Starter',29,'#94a3b8']];
  const counts={};(DB.players||[]).forEach(p=>{if(p.member)counts[p.membership]=(counts[p.membership]||0)+1;});
  host.innerHTML=pageHead('Membership Management','Manage subscription plans, upgrades, comps and cancellations.',
    `<button class="btn btn-gold" onclick="toast('New plan editor — demo')"><i data-lucide="plus"></i> New plan</button>`)+
  `<div class="grid g3" style="margin-bottom:18px">
     ${plans.map(([n,pr,col])=>`<div class="card card-p sa-plan"><div class="sa-plan-top"><b>${n}</b><span class="badge b-gold">€${pr}/mo</span></div>
        <div class="sa-plan-n">${counts[n]||0}</div><div class="sa-plan-l">active members</div>
        <div class="sa-plan-bar"><span style="width:${Math.min(100,(counts[n]||0)*22)}%;background:${col}"></span></div></div>`).join('')}</div>
   <div class="card"><div class="card-head"><h3>Active subscriptions</h3><span class="badge b-grey">${members.length}</span></div>
     <div class="table-wrap"><table><thead><tr><th>Member</th><th>Plan</th><th>Price</th><th>Renews</th><th>Status</th><th style="text-align:right">Manage</th></tr></thead>
     <tbody>${members.map(p=>`<tr><td class="t-name"><img src="${p.pic||'images/player-1.webp'}" alt="${esc(p.name)}" style="object-position:center 20%"><div><b>${esc(p.name)}</b><span>${esc(p.club||'')}</span></div></td>
       <td>${saBadge(p.membership)}</td><td>${money((p.membership==='Elite')?79:(p.membership==='Pro')?49:29)}/mo</td><td>1 Aug 2026</td><td>${saBadge('Active')}</td>
       <td><div class="rowacts">
         <button class="btn btn-sm btn-line" onclick="toast('Upgrade — demo')"><i data-lucide="arrow-up-circle"></i> Upgrade</button>
         <button class="btn btn-sm btn-line" onclick="toast('Comp month granted — demo')"><i data-lucide="gift"></i></button>
         <button class="btn btn-sm btn-danger" onclick="toast('Subscription cancelled — demo')"><i data-lucide="x-circle"></i></button>
       </div></td></tr>`).join('')}</tbody></table></div></div>`;
  icons();
};

/* ============ PAYMENTS & FINANCE ============ */
VIEWS['sa-finance']=host=>{
  const pays=DB.payments||[];const total=pays.reduce((s,p)=>s+Number(p.amount||0),0);
  host.innerHTML=pageHead('Payments & Finance','Revenue, invoices, refunds and payouts across the platform.',
    `<button class="btn btn-line" onclick="toast('Exporting CSV — demo')"><i data-lucide="download"></i> Export</button>`)+
  `<div class="grid g4" style="margin-bottom:18px">
     ${statCard('credit-card',money(total),'Total revenue','gr')}${statCard('repeat',money(total)+'/mo','Recurring MRR','g')}
     ${statCard('receipt',pays.length,'Transactions')}${statCard('rotate-ccw','€0','Refunds (30d)','rd')}</div>
   <div class="grid g2" style="align-items:start;margin-bottom:18px">
     <div class="card card-p"><div class="section-title">Revenue trend (2026)</div><canvas id="saRevChart" height="200"></canvas></div>
     <div class="card card-p"><div class="section-title">Revenue by plan</div><canvas id="saPlanChart" height="200"></canvas></div></div>
   <div class="card"><div class="card-head"><h3>Transactions</h3></div><div class="table-wrap"><table>
     <thead><tr><th>Member</th><th>Plan</th><th>Amount</th><th>Date</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
     <tbody>${pays.map(p=>`<tr><td><b>${esc(p.member)}</b></td><td>${saBadge(p.plan)}</td><td>${money(p.amount)}</td><td>${esc(p.date)}</td><td>${saBadge(p.status)}</td>
       <td><div class="rowacts"><button class="btn btn-sm btn-line" onclick="toast('Invoice — demo')"><i data-lucide="file-text"></i></button>
       <button class="btn btn-sm btn-danger" onclick="toast('Refund issued — demo')"><i data-lucide="rotate-ccw"></i> Refund</button></div></td></tr>`).join('')}</tbody></table></div></div>`;
  icons();
  if(window.Chart){const gold='#d4af37',ink='#0f172a',grid='#eef1f4';
    new Chart($('#saRevChart'),{type:'line',data:{labels:['Feb','Mar','Apr','May','Jun','Jul'],datasets:[{data:[210,340,480,620,780,950],borderColor:gold,backgroundColor:'rgba(212,175,55,.14)',fill:true,tension:.35,borderWidth:2,pointBackgroundColor:gold}]},options:{plugins:{legend:{display:false}},scales:{y:{grid:{color:grid},ticks:{callback:v=>'€'+v}},x:{grid:{display:false}}}}});
    const byPlan={};pays.forEach(p=>byPlan[p.plan]=(byPlan[p.plan]||0)+Number(p.amount||0));
    new Chart($('#saPlanChart'),{type:'doughnut',data:{labels:Object.keys(byPlan),datasets:[{data:Object.values(byPlan),backgroundColor:[ink,gold,'#e6c65c','#94a3b8']}]},options:{plugins:{legend:{position:'bottom'}},cutout:'62%'}});
  }
};

/* ============ REPORTS (content moderation) ============ */
VIEWS['sa-reports']=host=>{
  const reps=DB.reports||[];
  host.innerHTML=pageHead('Reports & Content Moderation','Approve, reject or remove any scouting report or player content.')+
  `<div class="grid g4" style="margin-bottom:18px">
     ${statCard('file-text',reps.length,'Total reports')}${statCard('file-check-2',reps.filter(r=>r.status==='Approved').length,'Approved','g')}
     ${statCard('clock',reps.filter(r=>r.status==='Pending').length,'Pending','rd')}${statCard('flag',0,'Flagged')}</div>
   <div class="card"><div class="table-wrap"><table>
     <thead><tr><th>Player</th><th>Match</th><th>Scout</th><th>Overall</th><th>Status</th><th style="text-align:right">Moderate</th></tr></thead>
     <tbody>${reps.map(r=>`<tr><td><b>${esc((P(r.player)||{}).name||'—')}</b></td><td>${esc(r.opp)}</td><td>${esc((DB.scouts.find(s=>s.id===r.scout)||{}).name||'—')}</td><td><b>${esc(r.overall)}</b></td><td>${saBadge(r.status)}</td>
       <td><div class="rowacts">
         <button class="btn btn-sm btn-line" onclick="viewReport('${r.id}')"><i data-lucide="eye"></i></button>
         <button class="btn btn-sm btn-gold" onclick="saModReport('${r.id}','Approved')"><i data-lucide="check"></i></button>
         <button class="btn btn-sm btn-line" onclick="saModReport('${r.id}','Pending')"><i data-lucide="undo-2"></i></button>
         <button class="btn btn-sm btn-danger" onclick="saRemoveReport('${r.id}')"><i data-lucide="trash-2"></i></button>
       </div></td></tr>`).join('')}</tbody></table></div></div>`;
  icons();
};
function saModReport(id,st){const r=DB.reports.find(x=>x.id===id);if(r){r.status=st;save();saLog('Set report '+st.toLowerCase(),(P(r.player)||{}).name||'report','Content');}go('sa-reports');toast('Report '+st.toLowerCase());}
function saRemoveReport(id){const i=DB.reports.findIndex(x=>x.id===id);if(i>-1){const r=DB.reports[i];DB.reports.splice(i,1);save();saLog('Removed report',(P(r.player)||{}).name||'report','Content');}go('sa-reports');toast('Report removed');}

/* ============ ANALYTICS ============ */
VIEWS['sa-analytics']=host=>{
  host.innerHTML=pageHead('Platform Analytics','Growth, engagement and revenue across the entire platform.')+
  `<div class="grid g4" style="margin-bottom:18px">
     ${statCard('users',DB.players.length,'Players')}${statCard('user-search',DB.scouts.length,'Scouts','g')}
     ${statCard('building-2',DB.clubs.length,'Clubs','gr')}${statCard('credit-card',money(DB.payments.reduce((s,p)=>s+ +p.amount,0)),'MRR','g')}</div>
   <div class="grid g2" style="align-items:start">
     <div class="card card-p"><div class="section-title">Account growth</div><canvas id="saGrowth" height="220"></canvas></div>
     <div class="card card-p"><div class="section-title">Accounts by role</div><canvas id="saRoles" height="220"></canvas></div></div>
   <div class="card card-p" style="margin-top:18px"><div class="section-title">Introductions & reports (6 months)</div><canvas id="saAct" height="120"></canvas></div>`;
  icons();
  if(window.Chart){const gold='#d4af37',ink='#0f172a',grid='#eef1f4';
    new Chart($('#saGrowth'),{type:'line',data:{labels:['Feb','Mar','Apr','May','Jun','Jul'],datasets:[{label:'Accounts',data:[42,61,88,110,134,162],borderColor:ink,backgroundColor:'rgba(15,23,42,.08)',fill:true,tension:.35,borderWidth:2,pointBackgroundColor:ink}]},options:{plugins:{legend:{display:false}},scales:{y:{grid:{color:grid}},x:{grid:{display:false}}}}});
    new Chart($('#saRoles'),{type:'doughnut',data:{labels:['Players','Scouts','Agents','Clubs','Admins'],datasets:[{data:[DB.players.length,DB.scouts.length,DB.agents.length,DB.clubs.length,SA_ADMINS.length],backgroundColor:[gold,ink,'#e6c65c','#94a3b8','#475569']}]},options:{plugins:{legend:{position:'bottom'}},cutout:'60%'}});
    new Chart($('#saAct'),{type:'bar',data:{labels:['Feb','Mar','Apr','May','Jun','Jul'],datasets:[{label:'Introductions',data:[2,4,5,7,9,12],backgroundColor:gold,borderRadius:5},{label:'Reports',data:[3,5,6,8,7,10],backgroundColor:ink,borderRadius:5}]},options:{plugins:{legend:{position:'bottom'}},scales:{y:{grid:{color:grid}},x:{grid:{display:false}}}}});
  }
};

/* ============ MESSAGES (moderation) ============ */
VIEWS['sa-messages']=host=>{
  host.innerHTML=pageHead('Messages','Every message routed through the platform — read, respond or remove.')+
  `<div class="card">${(DB.messages||[]).map(m=>`<div class="msg-row"><div class="av">${initials(m.from)}</div>
     <div style="flex:1;min-width:0" onclick="openMsg('${m.id}')"><div class="mtop"><b>${esc(m.from)} <span class="badge b-grey" style="margin-left:6px">${esc(m.role)}</span></b><time>${esc(m.date)}</time></div>
       <div style="font-size:13.5px;color:var(--ink);font-weight:600">${esc(m.subject)}</div><p>${esc(m.preview)}</p></div>
     <button class="btn btn-sm btn-danger" style="align-self:center" onclick="saRemoveMsg('${m.id}')"><i data-lucide="trash-2"></i></button></div>`).join('')}</div>`;
  icons();
};
function saRemoveMsg(id){const i=DB.messages.findIndex(x=>x.id===id);if(i>-1){DB.messages.splice(i,1);save();saLog('Removed message',id,'Content');}go('sa-messages');toast('Message removed');}

/* ============ WEBSITE CONTENT (CMS) ============ */
VIEWS['sa-cms']=host=>{
  const blocks=[['Hero headline','Elite pathways for the next generation of footballers','type'],
    ['Hero subtext','Global scouting, player development and club introductions — run by professionals.','align-left'],
    ['About section','PFC represents ambitious players and connects them with clubs worldwide.','info'],
    ['Membership pricing','Elite €79 · Pro €49 · Starter €29','tag'],
    ['Contact email','hello@pianafc.com','mail']];
  host.innerHTML=pageHead('Website Content (CMS)','Edit homepage copy, media and published content — no code required.',
    `<button class="btn btn-gold" onclick="toast('Published to live site — demo')"><i data-lucide="rocket"></i> Publish</button>`)+
  `<div class="grid g3" style="margin-bottom:18px">${statCard('layout-panel-top',6,'Live sections')}${statCard('image',DB.players.length+4,'Media assets','g')}${statCard('history','2h ago','Last publish','gr')}</div>
   <div class="card"><div class="card-head"><h3>Editable blocks</h3></div>
     <div class="card-p" style="display:grid;gap:12px">
       ${blocks.map(([t,v,ic])=>`<div class="sa-cms-row"><div class="sa-cms-ic"><i data-lucide="${ic}"></i></div>
         <div style="flex:1;min-width:0"><b style="color:var(--ink);font-size:13.5px;display:block">${t}</b><span style="color:var(--muted);font-size:12.5px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(v)}</span></div>
         <button class="btn btn-sm btn-line" onclick="toast('Editing “${esc(t)}” — demo')"><i data-lucide="pencil"></i> Edit</button></div>`).join('')}
     </div></div>`;
  icons();
};

/* ============ SECURITY CENTRE ============ */
VIEWS['sa-security']=host=>{
  host.innerHTML=pageHead('Security Centre','Sessions, two-factor, access policy and threat monitoring.')+
  `<div class="grid g4" style="margin-bottom:18px">
     ${statCard('shield-check','TLS 1.3','Encryption','g')}${statCard('key-round',SA_ADMINS.filter(a=>a.twofa).length+'/'+SA_ADMINS.length,'Admins with 2FA','gr')}
     ${statCard('user-x',1,'Blocked (24h)','rd')}${statCard('activity',73,'Active sessions')}</div>
   <div class="grid g2" style="align-items:start">
     <div class="card"><div class="card-head"><h3>Security policy</h3></div><div class="card-p" style="display:grid;gap:12px">
       ${[['Enforce 2FA for all admins',true],['Require strong passwords',true],['Auto-logout after 30 min idle',true],['Block logins from new countries',false],['IP allow-list for admin panel',false]]
         .map(([l,on])=>`<label class="sa-toggle"><span>${l}</span><input type="checkbox" ${on?'checked':''} onchange="toast('Policy updated — demo')"></label>`).join('')}
     </div></div>
     <div class="card"><div class="card-head"><h3>Failed & suspicious logins</h3></div><div class="table-wrap"><table>
       <thead><tr><th>Account</th><th>IP / Location</th><th>When</th><th>Status</th></tr></thead>
       <tbody>${SA_LOGINS.map(l=>`<tr><td style="color:var(--body)">${esc(l.who)}</td><td>${esc(l.ip)}<br><span style="color:var(--muted);font-size:11.5px">${esc(l.loc)}</span></td><td>${esc(l.when)}</td><td>${saBadge(l.status)}</td></tr>`).join('')}</tbody></table></div></div>
   </div>`;
  icons();
};

/* ============ AUDIT LOGS ============ */
VIEWS['sa-audit']=host=>{
  host.innerHTML=pageHead('Audit Logs','A complete, tamper-evident record of every administrative action.',
    `<button class="btn btn-line" onclick="toast('Exporting audit trail — demo')"><i data-lucide="download"></i> Export</button>`)+
  `<div class="card">
     <div class="sa-toolbar"><div class="sa-search"><i data-lucide="search"></i><input id="saAuditSearch" placeholder="Search actor, action or target…" oninput="saFilterAudit()"></div>
       <div class="sa-chips">${['All','Security','Finance','Content','System'].map((t,i)=>`<button class="sa-chip${i===0?' on':''}" data-t="${t}" onclick="saAuditChip(this)">${t}</button>`).join('')}</div></div>
     <div class="table-wrap"><table><thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Target</th><th>IP</th><th>Type</th></tr></thead>
     <tbody id="saAuditBody">${SA_AUDIT.map(l=>`<tr data-t="${esc(l.type.toLowerCase())}" data-q="${esc((l.actor+' '+l.action+' '+l.target).toLowerCase())}">
       <td style="white-space:nowrap;color:var(--muted)">${esc(l.ts)}</td><td><b>${esc(l.actor)}</b></td><td>${esc(l.action)}</td><td style="color:var(--ink)">${esc(l.target)}</td><td style="color:var(--muted)">${esc(l.ip)}</td><td>${saBadge(l.type)}</td></tr>`).join('')}</tbody></table></div>
   </div>`;
  icons();
};
function saFilterAudit(){const q=($('#saAuditSearch').value||'').toLowerCase();document.querySelectorAll('#saAuditBody tr').forEach(tr=>{tr.style.display=tr.dataset.q.includes(q)?'':'none';});}
function saAuditChip(btn){document.querySelectorAll('.sa-chip').forEach(c=>c.classList.remove('on'));btn.classList.add('on');const t=btn.dataset.t.toLowerCase();
  document.querySelectorAll('#saAuditBody tr').forEach(tr=>{tr.style.display=(t==='all'||tr.dataset.t===t)?'':'none';});}

/* ============ SYSTEM STATUS ============ */
VIEWS['sa-system']=host=>{
  const down=SA_SERVICES.filter(s=>!/oper/i.test(s.status)).length;
  host.innerHTML=pageHead('System Status',(down?down+' service(s) need attention.':'All core services operational.'))+
  `<div class="sa-status-banner ${down?'warn':'ok'}"><i data-lucide="${down?'alert-triangle':'check-circle-2'}"></i><b>${down?'Partial degradation detected':'All systems operational'}</b><span>Updated just now</span></div>
   <div class="grid g4" style="margin:18px 0">
     ${statCard('activity','99.94%','30-day uptime','g')}${statCard('server',SA_SERVICES.length,'Services')}${statCard('cpu','38%','CPU load','gr')}${statCard('gauge','0.42','Load avg')}</div>
   <div class="card"><div class="card-head"><h3>Services</h3></div><div class="table-wrap"><table>
     <thead><tr><th>Service</th><th>Status</th><th>Uptime (30d)</th><th>Latency</th></tr></thead>
     <tbody>${SA_SERVICES.map(s=>`<tr><td><b>${esc(s.name)}</b></td><td>${saBadge(s.status)}</td><td>${esc(s.uptime)}</td><td>${esc(s.latency)}</td></tr>`).join('')}</tbody></table></div></div>`;
  icons();
};

/* ============ DATABASE STATUS ============ */
VIEWS['sa-database']=host=>{
  const rows=SA_TABLES.reduce((s,t)=>s+t.rows,0);
  host.innerHTML=pageHead('Database Status','Tables, storage, integrity and maintenance.',
    `<button class="btn btn-line" onclick="toast('Running optimisation — demo')"><i data-lucide="wand-2"></i> Optimise</button>`)+
  `<div class="grid g4" style="margin-bottom:18px">
     ${statCard('database',SA_TABLES.length,'Tables')}${statCard('rows-3',rows.toLocaleString(),'Total rows','g')}${statCard('hard-drive','39.6 MB','Storage used','gr')}${statCard('shield-check','Healthy','Integrity','g')}</div>
   <div class="card"><div class="card-head"><h3>Tables</h3><span class="badge b-ok">Connected</span></div><div class="table-wrap"><table>
     <thead><tr><th>Table</th><th>Rows</th><th>Size</th><th>Health</th><th style="text-align:right">Action</th></tr></thead>
     <tbody>${SA_TABLES.map(t=>`<tr><td class="t-name"><div class="ph" style="display:grid;place-items:center;background:#fdf6e3;color:#a17b0b;border-radius:9px"><i data-lucide="table" style="width:16px;height:16px"></i></div><b>${esc(t.name)}</b></td><td>${t.rows.toLocaleString()}</td><td>${esc(t.size)}</td><td>${saBadge(t.health)}</td>
       <td style="text-align:right"><button class="btn btn-sm btn-line" onclick="toast('Inspecting ${esc(t.name)} — demo')"><i data-lucide="search"></i> Inspect</button></td></tr>`).join('')}</tbody></table></div></div>`;
  icons();
};

/* ============ BACKUPS ============ */
VIEWS['sa-backups']=host=>{
  host.innerHTML=pageHead('Backups','Automated snapshots, schedule and one-click restore.',
    `<button class="btn btn-gold" onclick="saRunBackup()"><i data-lucide="hard-drive-download"></i> Run backup now</button>`)+
  `<div class="grid g4" style="margin-bottom:18px">
     ${statCard('hard-drive',SA_BACKUPS.length,'Snapshots')}${statCard('clock','Daily 03:00','Schedule','g')}${statCard('check-circle-2','Complete','Last backup','gr')}${statCard('database',(SA_BACKUPS[0]||{}).size||'—','Latest size')}</div>
   <div class="card"><div class="card-head"><h3>Snapshots</h3></div><div class="table-wrap"><table>
     <thead><tr><th>Date</th><th>Type</th><th>Size</th><th>Duration</th><th>Status</th><th style="text-align:right">Restore</th></tr></thead>
     <tbody id="saBackupBody">${SA_BACKUPS.map(b=>`<tr><td><b>${esc(b.date)}</b></td><td>${saBadge(b.type)}</td><td>${esc(b.size)}</td><td>${esc(b.dur)}</td><td>${saBadge(b.status)}</td>
       <td><div class="rowacts"><button class="btn btn-sm btn-line" onclick="toast('Downloading ${esc(b.date)} — demo')"><i data-lucide="download"></i></button>
       <button class="btn btn-sm btn-gold" onclick="saRestore('${b.id}')"><i data-lucide="rotate-ccw"></i> Restore</button></div></td></tr>`).join('')}</tbody></table></div></div>`;
  icons();
};
function saRunBackup(){const now=new Date();const date=now.toISOString().slice(0,10)+' '+now.toTimeString().slice(0,5);
  SA_BACKUPS.unshift({id:uid(),date,size:'48.3 MB',type:'Manual',status:'Complete',dur:'12s'});saLog('Manual backup created',date,'System');go('sa-backups');toast('Backup completed');}
function saRestore(id){const b=SA_BACKUPS.find(x=>x.id===id);if(!b)return;
  modal('Restore snapshot',`<p style="color:var(--body)">Restore the platform from <b>${esc(b.date)}</b>? Current data will be replaced by this snapshot.</p>`,
  `<button class="btn btn-line" onclick="closeModal()">Cancel</button><button class="btn btn-gold" onclick="closeModal();toast('Restore started — demo')">Restore now</button>`);}

/* ============ SUPER ADMIN SETTINGS ============ */
VIEWS['sa-settings']=host=>{
  host.innerHTML=pageHead('Platform Settings','Global configuration for the entire Piana FC platform.')+
  `<div class="grid g2" style="align-items:start">
     <div class="card"><div class="card-head"><h3>General</h3></div><div class="card-p" style="display:grid;gap:14px">
       <div class="field"><label>Platform name</label><input value="Piana Football Consultancy"></div>
       <div class="field"><label>Support email</label><input value="hello@pianafc.com"></div>
       <div class="field"><label>Default currency</label><select><option>EUR (€)</option><option>GBP (£)</option><option>USD ($)</option></select></div>
       <div class="field"><label>Timezone</label><select><option>Europe/Dublin</option><option>Europe/London</option><option>UTC</option></select></div>
       <button class="btn btn-gold" onclick="toast('Settings saved — demo')" style="justify-self:start"><i data-lucide="save"></i> Save changes</button>
     </div></div>
     <div class="card"><div class="card-head"><h3>Platform controls</h3></div><div class="card-p" style="display:grid;gap:12px">
       ${[['Allow new registrations',true],['Public player search',true],['Maintenance mode',false],['Accept online payments',true],['Email notifications',true]]
         .map(([l,on])=>`<label class="sa-toggle"><span>${l}</span><input type="checkbox" ${on?'checked':''} onchange="toast('Updated — demo')"></label>`).join('')}
       <div class="sa-danger">
         <b><i data-lucide="alert-triangle" style="width:15px;height:15px;vertical-align:-2px"></i> Danger zone</b>
         <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
           <button class="btn btn-sm btn-line" onclick="go('sa-backups')">Backup before changes</button>
           <button class="btn btn-sm btn-danger" onclick="toast('This action is disabled in demo')">Purge inactive accounts</button>
         </div></div>
     </div></div>
   </div>`;
  icons();
};

/* ============ SUPER ADMIN — OPERATIONAL DATASETS (demo) ============ */
const SA_VERIFY=[
  {id:'v1',name:'Marco Piana',type:'Player',doc:'Passport + club letter',submitted:'2026-07-24',status:'Pending'},
  {id:'v2',name:'Shelbourne FC',type:'Club',doc:'Club registration',submitted:'2026-07-23',status:'Approved'},
  {id:'v3',name:'Sarah Nolan',type:'Agent',doc:'FIFA licence',submitted:'2026-07-22',status:'Pending'},
  {id:'v4',name:'Aidan Byrne',type:'Scout',doc:'ID + references',submitted:'2026-07-20',status:'Pending'},
  {id:'v5',name:'Kofi Mensah',type:'Player',doc:'Passport',submitted:'2026-07-19',status:'Approved'}
];
const SA_BOOKINGS=[
  {id:'cb1',client:'Diego Fontana',type:'Career consultation',date:'2026-08-02 14:00',channel:'Video call',status:'Pending'},
  {id:'cb2',client:"Liam O'Connor",type:'Full assessment',date:'2026-08-04 11:00',channel:'In person — Dublin',status:'Confirmed'},
  {id:'cb3',client:'Yusuf Demir',type:'Video assessment',date:'2026-08-05 16:30',channel:'Video call',status:'Pending'},
  {id:'cb4',client:'FC Lugano',type:'Recruitment briefing',date:'2026-08-06 10:00',channel:'Video call',status:'Confirmed'},
  {id:'cb5',client:'Marco Piana',type:'Progress review',date:'2026-07-28 09:00',channel:'Phone',status:'Completed'}
];
const SA_APPS=[
  {id:'ap1',name:'Tobias Frei',pos:'Goalkeeper',nat:'Switzerland',age:18,date:'2026-07-27',status:'Pending'},
  {id:'ap2',name:'Ade Okafor',pos:'Striker',nat:'Nigeria',age:19,date:'2026-07-26',status:'Pending'},
  {id:'ap3',name:'Luca Moretti',pos:'Left-Back',nat:'Italy',age:17,date:'2026-07-25',status:'Approved'},
  {id:'ap4',name:'Sean Murphy',pos:'Winger',nat:'Ireland',age:20,date:'2026-07-24',status:'Rejected'},
  {id:'ap5',name:'Marek Nowak',pos:'Central Midfielder',nat:'Poland',age:18,date:'2026-07-23',status:'Pending'}
];
const SA_TICKETS=[
  {id:'tk1',subject:'Cannot upload highlight video',user:'Diego Fontana',role:'Player',priority:'High',date:'2026-07-28',status:'Open'},
  {id:'tk2',subject:'Payment failed but card charged',user:'Kofi Mensah',role:'Player',priority:'Urgent',date:'2026-07-27',status:'Open'},
  {id:'tk3',subject:'Update club contact email',user:'Shelbourne FC',role:'Club',priority:'Low',date:'2026-07-26',status:'In progress'},
  {id:'tk4',subject:'Request data export (GDPR)',user:'Sarah Nolan',role:'Agent',priority:'Medium',date:'2026-07-24',status:'Open'},
  {id:'tk5',subject:'Password reset not received',user:'Aidan Byrne',role:'Scout',priority:'Medium',date:'2026-07-22',status:'Closed'}
];
const SA_NOTIFS=[
  {id:'nt1',icon:'user-plus',text:'New player application — Tobias Frei (GK, Switzerland)',time:'12m ago',unread:true},
  {id:'nt2',icon:'credit-card',text:'Payment received — Elite membership €79 (Marco Piana)',time:'1h ago',unread:true},
  {id:'nt3',icon:'calendar-check',text:'New consultation booking — Diego Fontana, 2 Aug',time:'3h ago',unread:true},
  {id:'nt4',icon:'shield-alert',text:'5 failed login attempts blocked from São Paulo, BR',time:'6h ago',unread:false},
  {id:'nt5',icon:'file-text',text:'Scouting report submitted for approval — Kofi Mensah',time:'Yesterday',unread:false},
  {id:'nt6',icon:'hard-drive',text:'Automatic backup completed — snapshot-2026-07-29',time:'Yesterday',unread:false}
];

/* ---- Overview charts (responsive, clean resize) ---- */
function saChartBase(){return {responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'#eef1f4'},ticks:{color:'#94a3b8'}},x:{grid:{display:false},ticks:{color:'#94a3b8'}}}};}
function saOverviewCharts(){
  if(!window.Chart)return;
  const gold='#d4af37',ink='#0f172a',mo=['Feb','Mar','Apr','May','Jun','Jul'];
  const mk=(id,type,data,color,fill)=>{const c=document.getElementById(id);if(!c)return;
    new Chart(c,{type,data:{labels:mo,datasets:[{data,borderColor:color,backgroundColor:fill||color,borderWidth:2,borderRadius:6,tension:.35,fill:!!fill,pointBackgroundColor:color,pointRadius:3}]},options:saChartBase()});};
  mk('saCUsers','line',[42,61,88,110,134,162],ink,'rgba(15,23,42,.08)');
  mk('saCMembers','line',[8,14,21,29,38,47],gold,'rgba(212,175,55,.16)');
  mk('saCRevenue','bar',[210,340,480,620,780,950],gold);
  mk('saCPlayers','bar',[6,9,13,18,22,28],ink);
  mk('saCClubs','line',[3,5,8,10,12,15],gold,'rgba(212,175,55,.16)');
  const ac=document.getElementById('saCActivity');
  if(ac)new Chart(ac,{type:'bar',data:{labels:mo,datasets:[{label:'Reports',data:[3,5,6,8,7,10],backgroundColor:gold,borderRadius:5},{label:'Introductions',data:[2,4,5,7,9,12],backgroundColor:ink,borderRadius:5}]},options:Object.assign(saChartBase(),{plugins:{legend:{position:'bottom',labels:{color:'#64748b',boxWidth:12}}}})});
}

/* ============ CONSULTATION BOOKINGS ============ */
VIEWS['sa-bookings']=host=>{
  host.innerHTML=pageHead('Consultation Bookings','Career consultations, assessments and recruitment briefings requested through the platform.',
    `<button class="btn btn-gold" onclick="toast('New booking — demo')"><i data-lucide="plus"></i> New booking</button>`)+
  `<div class="grid g4" style="margin-bottom:18px">
     ${statCard('calendar-check',SA_BOOKINGS.length,'Total bookings')}
     ${statCard('clock',SA_BOOKINGS.filter(b=>b.status==='Pending').length,'Pending','rd')}
     ${statCard('circle-check',SA_BOOKINGS.filter(b=>b.status==='Confirmed').length,'Confirmed','g')}
     ${statCard('check-circle-2',SA_BOOKINGS.filter(b=>b.status==='Completed').length,'Completed','gr')}</div>
   <div class="card"><div class="card-head"><h3>Requests</h3></div><div class="table-wrap"><table>
     <thead><tr><th>Client</th><th>Type</th><th>When</th><th>Channel</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
     <tbody>${SA_BOOKINGS.map(b=>`<tr><td><b>${esc(b.client)}</b></td><td>${esc(b.type)}</td><td>${esc(b.date)}</td><td style="color:var(--muted)">${esc(b.channel)}</td><td>${saBadge(b.status)}</td>
       <td><div class="rowacts">
         <button class="btn btn-sm btn-gold" title="Confirm" onclick="saBookingSet('${b.id}','Confirmed')"><i data-lucide="check"></i></button>
         <button class="btn btn-sm btn-line" title="Reschedule" onclick="toast('Reschedule — demo')"><i data-lucide="calendar"></i></button>
         <button class="btn btn-sm btn-danger" title="Cancel" onclick="saBookingSet('${b.id}','Cancelled')"><i data-lucide="x"></i></button>
       </div></td></tr>`).join('')}</tbody></table></div></div>`;
  icons();
};
function saBookingSet(id,st){const b=SA_BOOKINGS.find(x=>x.id===id);if(b){b.status=st;saLog('Consultation '+st.toLowerCase(),b.client,'System');}go('sa-bookings');toast('Booking '+st.toLowerCase());}

/* ============ PLAYER APPLICATIONS ============ */
VIEWS['sa-applications']=host=>{
  host.innerHTML=pageHead('Player Applications','New players applying to join Piana FC — review, approve or reject.',
    `<button class="btn btn-line" onclick="toast('Export — demo')"><i data-lucide="download"></i> Export</button>`)+
  `<div class="grid g4" style="margin-bottom:18px">
     ${statCard('file-input',SA_APPS.length,'Applications')}
     ${statCard('clock',SA_APPS.filter(a=>a.status==='Pending').length,'Awaiting review','rd')}
     ${statCard('user-check',SA_APPS.filter(a=>a.status==='Approved').length,'Approved','g')}
     ${statCard('user-x',SA_APPS.filter(a=>a.status==='Rejected').length,'Rejected')}</div>
   <div class="card"><div class="card-head"><h3>Applicants</h3></div><div class="table-wrap"><table>
     <thead><tr><th>Applicant</th><th>Position</th><th>Nationality</th><th>Age</th><th>Applied</th><th>Status</th><th style="text-align:right">Decision</th></tr></thead>
     <tbody>${SA_APPS.map(a=>`<tr><td class="t-name"><div class="ph" style="display:grid;place-items:center;background:var(--ink);color:var(--gold);font-weight:700;font-size:12px">${initials(a.name)}</div><b>${esc(a.name)}</b></td>
       <td>${esc(a.pos)}</td><td>${esc(a.nat)}</td><td>${esc(a.age)}</td><td style="color:var(--muted)">${esc(a.date)}</td><td>${saBadge(a.status)}</td>
       <td><div class="rowacts">
         <button class="btn btn-sm btn-gold" onclick="saAppSet('${a.id}','Approved')"><i data-lucide="check"></i> Approve</button>
         <button class="btn btn-sm btn-danger" onclick="saAppSet('${a.id}','Rejected')"><i data-lucide="x"></i></button>
       </div></td></tr>`).join('')}</tbody></table></div></div>`;
  icons();
};
function saAppSet(id,st){const a=SA_APPS.find(x=>x.id===id);if(a){a.status=st;saLog('Application '+st.toLowerCase(),a.name,'Content');}go('sa-applications');toast(a?a.name+' '+st.toLowerCase():'Updated');}

/* ============ NOTIFICATIONS ============ */
VIEWS['sa-notifications']=host=>{
  const unread=SA_NOTIFS.filter(n=>n.unread).length;
  host.innerHTML=pageHead('Notifications','Platform-wide alerts, events and system messages.',
    `<button class="btn btn-line" onclick="saMarkAllNotifs()"><i data-lucide="check-check"></i> Mark all read</button>`)+
  `<div class="grid g3" style="margin-bottom:18px">
     ${statCard('bell',SA_NOTIFS.length,'Total')}
     ${statCard('bell-dot',unread,'Unread','rd')}
     ${statCard('shield-alert',SA_NOTIFS.filter(n=>n.icon==='shield-alert').length,'Security alerts','g')}</div>
   <div class="card"><div class="card-p">
     ${SA_NOTIFS.map(n=>`<div class="sa-nrow${n.unread?' unread':''}"><div class="ni"><i data-lucide="${n.icon}"></i></div>
       <div class="nb"><b>${esc(n.text)}</b><time>${esc(n.time)}</time></div>
       ${n.unread?'<span class="badge b-gold" style="align-self:center">New</span>':''}</div>`).join('')}
   </div></div>`;
  icons();
};
function saMarkAllNotifs(){SA_NOTIFS.forEach(n=>n.unread=false);go('sa-notifications');toast('All notifications marked read');}

/* ============ SUPPORT TICKETS ============ */
VIEWS['sa-tickets']=host=>{
  host.innerHTML=pageHead('Support Tickets','Member support requests — triage, respond and resolve.',
    `<button class="btn btn-gold" onclick="toast('New ticket — demo')"><i data-lucide="plus"></i> New ticket</button>`)+
  `<div class="grid g4" style="margin-bottom:18px">
     ${statCard('life-buoy',SA_TICKETS.length,'All tickets')}
     ${statCard('inbox',SA_TICKETS.filter(t=>t.status==='Open').length,'Open','rd')}
     ${statCard('loader',SA_TICKETS.filter(t=>t.status==='In progress').length,'In progress')}
     ${statCard('check-circle-2',SA_TICKETS.filter(t=>t.status==='Closed').length,'Closed','g')}</div>
   <div class="card"><div class="card-head"><h3>Tickets</h3></div><div class="table-wrap"><table>
     <thead><tr><th>Subject</th><th>Requester</th><th>Role</th><th>Priority</th><th>Opened</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
     <tbody>${SA_TICKETS.map(t=>`<tr><td><b>${esc(t.subject)}</b></td><td>${esc(t.user)}</td><td>${saBadge(t.role)}</td><td>${saBadge(t.priority)}</td><td style="color:var(--muted)">${esc(t.date)}</td><td>${saBadge(t.status)}</td>
       <td><div class="rowacts">
         <button class="btn btn-sm btn-line" title="Reply" onclick="toast('Reply sent — demo')"><i data-lucide="reply"></i></button>
         <button class="btn btn-sm btn-gold" onclick="saTicketSet('${t.id}','Closed')"><i data-lucide="check"></i> Resolve</button>
       </div></td></tr>`).join('')}</tbody></table></div></div>`;
  icons();
};
function saTicketSet(id,st){const t=SA_TICKETS.find(x=>x.id===id);if(t){t.status=st;saLog('Ticket '+st.toLowerCase(),t.subject,'System');}go('sa-tickets');toast('Ticket '+st.toLowerCase());}

/* ============ AUTH SESSION ============ */
function getSession(){try{return JSON.parse(localStorage.getItem('pfc_session'));}catch(e){return null;}}
// Demo Preview mode runs only inside the editor's preview iframe. The published
// site loads top-level, so window.self===window.top there. Cross-origin access
// throws inside the iframe → treated as preview.
function isEditorPreview(){try{return window.self!==window.top;}catch(e){return true;}}
function logout(){try{localStorage.removeItem('pfc_session');sessionStorage.removeItem('pfc_session');}catch(e){}window.location.replace('../index.html?login=1');}

/* ============ BOOT ============ */
// In-page role picker — shown instead of a blank shell when no identity is present.
function showRolePicker(){
  const host=$('#view');if(!host)return;
  $('#pageTitle').textContent='Choose a dashboard';
  $('#pageSub').textContent='Select a role to open its dashboard';
  const roles=[
    ['admin','Administrator','shield-check','Members, payments & full oversight'],
    ['agent','Agent','briefcase','Client roster, placements & deals'],
    ['scout','Scout','binoculars','Assigned players & match reports'],
    ['player','Player','user-round','Profile, football CV & progress'],
    ['club','Club','building-2','Shortlists & scouting requests']];
  host.innerHTML=`<div class="grid g3">${roles.map(([r,label,ic,desc])=>
    `<div class="card card-p role-pick" onclick="previewRole('${r}')" style="cursor:pointer;display:flex;flex-direction:column">
      <div class="ico"><i data-lucide="${ic}"></i></div>
      <h3 style="margin:12px 0 4px">${label}</h3>
      <p style="color:#64748b;font-size:14px;margin:0 0 14px">${desc}</p>
      <div class="btn btn-gold" style="margin-top:auto">Open dashboard <i data-lucide="arrow-right"></i></div>
    </div>`).join('')}</div>`;
  icons();
}
function previewRole(r){
  if(!isEditorPreview())return; // Demo Preview only — never recreate a session on the published site
  if(!USERS[r])return;
  const s={role:r,name:USERS[r][0],ts:Date.now()};
  try{localStorage.setItem('pfc_session',JSON.stringify(s));}catch(e){}
  setRole(r);
}
function boot(){
 try{
  wireUI();
  const params=new URLSearchParams(location.search);
  // ?role= acts as a preview login and is the robust fallback when the session
  // did not survive the redirect (e.g. sandboxed preview iframes).
  const roleParam=params.get('role');
  let session=getSession();
  const preview=isEditorPreview();
  // Demo Preview mode: ?role= acts as a preview login, but ONLY inside the editor
  // preview iframe. On the published site it must never recreate a session.
  if(preview&&roleParam&&NAV[resolveRole(roleParam)]){
    const rp=resolveRole(roleParam);
    if(!session||session.role!==rp){
      session={role:rp,name:USERS[rp][0],ts:Date.now()};
      try{localStorage.setItem('pfc_session',JSON.stringify(session));}catch(e){}
    }
  }
  // Real Authentication mode: on the published site a valid session is required.
  // After logout there is no session — redirect once to the Login page and STOP,
  // so no code below can recreate pfc_session or grant dashboard access.
  if(!preview&&!session){window.location.replace('../index.html?login=1');return;}
  // The dashboard layout must ALWAYS display. If the user object is temporarily
  // unavailable or the role is unknown, resolveRole() falls back to a working
  // dashboard instead of leaving a blank shell or forcing a role picker.
  const role=resolveRole(session&&session.role);

  // reflect the logged-in identity on their dashboard (falls back to the demo name)
  if(session&&session.name)USERS[role][0]=session.name;
  const sel=$('#roleSelect');if(sel)sel.value=role;

  // handle Stripe success redirect
  if(params.get('paid')){const plan=params.get('paid');const p=me();p.membership=plan;p.member=true;
    DB.payments.unshift({id:uid(),member:p.name,plan:plan,amount:(PLANS.find(x=>x.id===plan)||{}).price||0,currency:'EUR',date:new Date().toISOString().slice(0,10),status:'Paid'});
    save();history.replaceState({},'',location.pathname);toast('Payment successful — '+plan+' active');}
  // capture the current section BEFORE setRole()/go() overwrites location.hash
  const h=location.hash.slice(1);
  setRole(role);
  // restore the section from the URL so a refresh stays on the same page
  if(h){
    if(TITLES[h]||VIEWS[h])go(h);
    else if(h==='membership')go('membership');
  }
  icons();
 }catch(err){
  // Absolute last-resort guard: a thrown boot must never leave the static blank shell.
  console.error('Dashboard boot failed:',err);
  try{showRolePicker();}catch(e){
    const host=$('#view');
    if(host)host.innerHTML=`<div class="card card-p" style="text-align:center;padding:44px">
      <div class="empty"><i data-lucide="alert-triangle"></i><p style="margin-bottom:14px">The dashboard hit a problem loading.</p>
      <button class="btn btn-gold" onclick="reset()">Reload demo data</button></div></div>`;
    icons();
  }
 }
}
// Run boot() immediately if the DOM is already parsed (e.g. builder preview iframes
// where DOMContentLoaded has already fired by the time this deferred script executes),
// otherwise wait for it. This is the fix for the "blank after login" shell.
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();
