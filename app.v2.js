/* ============================================================
   WINLINE GIVEAWAY — mini app (role-aware SPA)
   Демо: данные в localStorage. Точки бэкенда помечены TODO:BACKEND.
   Роли: user / admin / super (переключается в Профиле для демо).
   ============================================================ */
'use strict';

/* ---------- Telegram ---------- */
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
function haptic(t='light'){ try{ tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred(t); }catch(e){} }
if (tg){ try{ tg.ready(); tg.expand(); tg.setHeaderColor('#0C0C0E'); tg.setBackgroundColor('#0C0C0E'); tg.BackButton.onClick(()=>pop()); }catch(e){} }

/* ---------- helpers ---------- */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ico=(id,c='')=>`<svg class="icon ${c}"><use href="#${id}"/></svg>`;
function plural(n,a,b,c){n=Math.abs(n)%100;const n1=n%10;if(n>10&&n<20)return c;if(n1>1&&n1<5)return b;if(n1===1)return a;return c;}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function today(){const d=new Date(),p=n=>String(n).padStart(2,'0');return `${p(d.getDate())}.${p(d.getMonth()+1)}.${String(d.getFullYear()).slice(2)}`;}
function dstr(ms){const d=new Date(ms),p=n=>String(n).padStart(2,'0');return `${p(d.getDate())}.${p(d.getMonth()+1)}.${String(d.getFullYear()).slice(2)} ${p(d.getHours())}:${p(d.getMinutes())}`;}
function timeLeft(ms){let s=Math.max(0,Math.floor((ms-Date.now())/1000));const d=Math.floor(s/86400);s%=86400;const h=Math.floor(s/3600);s%=3600;const m=Math.floor(s/60);const ss=s%60;const p=n=>String(n).padStart(2,'0');return d>0?`${d}д ${p(h)}:${p(m)}:${p(ss)}`:`${p(h)}:${p(m)}:${p(ss)}`;}

/* ---------- storage ---------- */
const K_GA='wl_giveaways_v2', K_MY='wl_my_v1', K_ROLE='wl_role', K_LINK='wl_link', K_ADMINS='wl_admins';
const lj=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}};
const sj=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const DAY=864e5, HR=36e5;
function seed(){
  if(lj(K_GA,null)) return;
  const now=Date.now();
  sj(K_GA,[
    {id:'GA-2050',title:'iPhone 17 Pro',prize:'iPhone 17 Pro',prizeType:'Девайс',coverLabel:'iPhone 17 Pro',
     text:'Разыгрываем iPhone 17 Pro среди подписчиков! Выполни условия и участвуй 🎁',button:'УЧАСТВОВАТЬ',
     conditions:[{type:'sub',channels:['@winline_official']},{type:'bet',amount:1000,category:'Все события',link:''}],
     places:1,pubChannels:['@winline_official'],endsAt:now+5*DAY,createdAt:today(),status:'active',owner:'me'},
    {id:'GA-2055',title:'Мерч Winline',prize:'Комплект мерча ×3',prizeType:'Мерч',coverLabel:'Мерч Winline ×3',
     text:'Дарим фирменный мерч Winline! Три комплекта победителям 🔥',button:'УЧАСТВУЮ',
     conditions:[{type:'sub',channels:['@winline_official','@winline_esports']},{type:'promo',code:'MERCH'}],
     places:3,pubChannels:['@winline_official'],endsAt:now+2*DAY,createdAt:today(),status:'active',owner:'me'},
    {id:'GA-2060',title:'Билеты на матч',prize:'2 билета на матч',prizeType:'Билеты',coverLabel:'Билеты на матч',
     text:'Два билета на топовый матч! Сделай ставку и участвуй ⚽',button:'ПРИНЯТЬ УЧАСТИЕ',
     conditions:[{type:'sub',channels:['@winline_sport']},{type:'bet',amount:500,category:'Киберспорт',link:''},{type:'promo',code:'MATCH'}],
     places:5,pubChannels:['@winline_sport'],endsAt:now+12*HR,createdAt:today(),status:'active',owner:'me'},
    {id:'GA-2041',title:'Розыгрыш 50 000 ₽',prize:'50 000 ₽ фрибетом',prizeType:'Фрибет',coverLabel:'50 000 ₽',
     text:'Разыгрываем 50 000 ₽ фрибетом среди подписчиков!',button:'УЧАСТВОВАТЬ',
     conditions:[{type:'sub',channels:['@winline_official','@winline_esports']},{type:'promo',code:'ESPORTS2026'},{type:'bet',amount:500,category:'Киберспорт',link:''}],
     places:50,pubChannels:['@winline_official'],endsAt:now-2*DAY,createdAt:'10.06.26',status:'finished',owner:'me'}
  ]);
  sj(K_MY,{entered:['GA-2050'],won:['GA-2041']});
  sj(K_LINK,{linked:true,winlineId:'WL-7421902'});
  sj(K_ADMINS,[{u:'@artem',role:'Супер-админ'},{u:'@manager_cs',role:'Админ'},{u:'@smm_winline',role:'Админ'}]);
}
const GA=()=>lj(K_GA,[]);
const setGA=a=>sj(K_GA,a);
const getGA=id=>GA().find(g=>g.id===id);
const MY=()=>lj(K_MY,{entered:[],won:[]});
const role=()=>localStorage.getItem(K_ROLE)||'user';
const setRole=r=>localStorage.setItem(K_ROLE,r);
const link=()=>lj(K_LINK,{linked:false,winlineId:''});

/* ---------- condition meta ---------- */
function condMeta(c){
  if(c.type==='sub')   return {icon:'i-mega',  title:'Подписка на канал', sub:(c.channels||[]).join(', ')||'—'};
  if(c.type==='promo') return {icon:'i-ticket',title:'Регистрация по промокоду', sub:c.code||'—'};
  if(c.type==='bet')   return {icon:'i-coin',  title:`Ставка от ${c.amount||0} ₽`, sub:c.category||'—'};
  return {icon:'i-info',title:'Условие',sub:''};
}

/* ============================================================ НАВИГАЦИЯ ============================================================ */
const view=$('#view'), backBtn=$('#backBtn'), hTitle=$('#hTitle'), roleChip=$('#roleChip'), tabbar=$('#tabbar');
const ROLE_LABEL={user:'Участник',admin:'Админ',super:'Супер-админ'};
const TITLES={feed:'Розыгрыши',mine:'Мои',profile:'Профиль',adminDash:'Админка',giveaway:'Розыгрыш',
  constructor:'Создание',manage:'Управление',results:'Итоги',analytics:'Аналитика',team:'Команда',published:'Готово'};

let state={tab:'feed', stack:[{name:'feed'}]};

function tabsForRole(){
  const t=[{id:'feed',icon:'i-gift',label:'Лента'},{id:'mine',icon:'i-ticket',label:'Мои'}];
  if(role()!=='user') t.push({id:'admin',icon:'i-grid',label:'Админка'});
  t.push({id:'profile',icon:'i-user',label:'Профиль'});
  return t;
}
function tabRoot(tab){return tab==='admin'?{name:'adminDash'}:{name:tab};}
function setTab(tab){ state.tab=tab; state.stack=[tabRoot(tab)]; render(); }
function push(route){ state.stack.push(route); render(); }
function pop(){ if(state.stack.length>1){state.stack.pop();render();} }
backBtn.addEventListener('click',()=>{haptic();pop();});

function renderTabbar(){
  tabbar.innerHTML=tabsForRole().map(t=>`<button data-tab="${t.id}" class="${state.tab===t.id?'on':''}">${ico(t.icon)}${t.label}</button>`).join('');
}
function render(){
  const route=state.stack[state.stack.length-1];
  const fn=ROUTES[route.name]; if(!fn)return;
  view.innerHTML=fn(route.params||{});
  hTitle.textContent=TITLES[route.name]||'';
  roleChip.textContent=ROLE_LABEL[role()];
  const showBack=state.stack.length>1;
  backBtn.classList.toggle('show',showBack);
  if(tg){try{showBack?tg.BackButton.show():tg.BackButton.hide();}catch(e){}}
  renderTabbar();
  view.scrollTop=0; window.scrollTo(0,0);
}

/* делегирование кликов */
document.addEventListener('click',e=>{
  const tabBtn=e.target.closest('[data-tab]');
  if(tabBtn){haptic();setTab(tabBtn.dataset.tab);return;}
  const a=e.target.closest('[data-act]'); if(!a)return;
  const [act,...rest]=a.dataset.act.split(':'); const arg=rest.join(':');
  handle(act,arg,a);
});
/* делегирование input для модели (конструктор/поля) */
document.addEventListener('input',e=>{
  const m=e.target.closest('[data-model]'); if(m){ modelUpdate(m.dataset.model,e.target.value,m); return; }
  const c=e.target.closest('[data-cond]'); if(c&&draft){const [i,f]=c.dataset.cond.split(':');draft.conditions[+i][f]=e.target.value; if(f==='category')paintConds();}
});

/* ---------- toast / modal ---------- */
const toast=$('#toast'),toastMsg=$('#toastMsg'),modal=$('#modal'),sheet=$('#sheet');
let toastT; function ping(m){toastMsg.textContent=m;toast.classList.add('show');haptic('medium');clearTimeout(toastT);toastT=setTimeout(()=>toast.classList.remove('show'),2400);}
function openSheet(html){sheet.innerHTML=html;modal.classList.add('show');}
function closeSheet(){modal.classList.remove('show');}
modal.addEventListener('click',e=>{if(e.target===modal)closeSheet();});

/* ============================================================ РОУТЫ ============================================================ */
const ROUTES={};

/* ---------- ЛЕНТА ---------- */
ROUTES.feed=()=>{
  const list=GA().filter(g=>g.status==='active').sort((a,b)=>a.endsAt-b.endsAt);
  const cards=list.map(g=>{
    const conds=g.conditions.map(c=>`<span class="pill d">${ico(condMeta(c).icon,'sm')}</span>`).join('');
    const cover=g.image?`<img src="${g.image}" alt=""><div class="veil"></div>`:'';
    return `<div class="gcard" data-act="open-ga:${g.id}">
      <div class="gcover">${cover}<div class="timer">${ico('i-clock','sm')}<span data-ends="${g.endsAt}">${timeLeft(g.endsAt)}</span></div>
        <div class="ct">${esc(g.coverLabel||g.title)}</div></div>
      <div class="gbody"><h3>${esc(g.title)}</h3>
        <div class="gmeta"><span class="pill o">${ico('i-trophy','sm')}${esc(g.prizeType||'Приз')}</span>
          <span class="pill d">${ico('i-users','sm')}${g.places} ${plural(g.places,'место','места','мест')}</span>${conds}</div>
        <div class="gcta"><button class="btn btn-primary btn-sm" data-act="open-ga:${g.id}">${esc(g.button)}</button></div>
      </div></div>`;
  }).join('');
  return `<div class="h1">Активные розыгрыши</div>
    <div class="lead">Выполняй условия и участвуй. Победители — случайно по таймеру.</div>
    ${list.length?cards:emptyBlock('Пока нет активных розыгрышей')}`;
};

/* ---------- КАРТОЧКА РОЗЫГРЫША ---------- */
ROUTES.giveaway=({id})=>{
  const g=getGA(id); if(!g)return emptyBlock('Розыгрыш не найден');
  const entered=MY().entered.includes(id);
  const conds=g.conditions.map(c=>{const m=condMeta(c);
    return `<div class="cond ${entered?'ok':'no'}"><div class="ci">${ico(m.icon)}</div>
      <div class="cx"><b>${esc(m.title)}</b><span>${esc(m.sub)}</span></div>
      <div class="st">${entered?ico('i-checkc'):ico('i-next','sm')}</div></div>`;}).join('');
  const cover=g.image?`<img src="${g.image}" alt=""><div class="veil"></div>`:'';
  const live=g.status==='active';
  return `<div class="gcover" style="border-radius:18px;overflow:hidden;margin-bottom:14px">${cover}
      <div class="timer">${ico('i-clock','sm')}<span data-ends="${g.endsAt}">${live?timeLeft(g.endsAt):'завершён'}</span></div>
      <div class="ct">${esc(g.coverLabel||g.title)}</div></div>
    <div class="h1">${esc(g.title)}</div>
    <div class="gmeta"><span class="pill o">${ico('i-trophy','sm')}${esc(g.prize)}</span>
      <span class="pill d">${ico('i-users','sm')}${g.places} ${plural(g.places,'место','места','мест')}</span></div>
    <p class="lead" style="margin-top:12px">${esc(g.text)}</p>
    <div class="sect">Условия участия</div>${conds}
    ${live?(entered
      ?`<div class="card" style="text-align:center;color:var(--green);font-weight:700;margin-top:6px">${ico('i-checkc')} Вы участвуете</div>`
      :`<button class="btn btn-primary" style="margin-top:6px" data-act="participate:${id}">${esc(g.button)}</button>`)
      :`<div class="card" style="text-align:center;color:var(--muted)">Розыгрыш завершён</div>
        <button class="btn btn-ghost" style="margin-top:10px" data-act="open-results:${id}">${ico('i-trophy')}Смотреть итоги</button>`}`;
};

/* ---------- МОИ ---------- */
let mineSeg='entered';
ROUTES.mine=()=>{
  const my=MY();
  const seg=`<div class="seg"><button class="${mineSeg==='entered'?'on':''}" data-act="seg:entered">Участия</button>
    <button class="${mineSeg==='won'?'on':''}" data-act="seg:won">Выигрыши</button></div>`;
  let body;
  if(mineSeg==='entered'){
    const items=my.entered.map(getGA).filter(Boolean);
    body=items.length?items.map(g=>{
      const done=g.conditions.length;
      const st=g.status==='active'?`<span class="pill o">● идёт</span>`:`<span class="pill g">завершён</span>`;
      return `<div class="ga" data-act="open-ga:${g.id}"><div class="thumb">${ico('i-ticket')}</div>
        <div class="meta"><h6>${esc(g.title)}</h6>
          <div class="ln"><span class="pill g" style="padding:3px 8px">${done}/${done} условий</span>${st}</div></div>
        <span class="arr">${ico('i-next')}</span></div>`;}).join('')
      :emptyBlock('Ты пока нигде не участвуешь');
  }else{
    const items=my.won.map(getGA).filter(Boolean);
    body=items.length?items.map(g=>`<div class="ga"><div class="thumb">${ico('i-trophy')}</div>
      <div class="meta"><h6>${esc(g.prize)}</h6>
        <div class="ln"><span>${esc(g.title)}</span></div>
        <div class="ln" style="margin-top:4px"><span class="pill o">приз ждёт получения</span></div></div>
      <button class="btn btn-primary btn-sm" data-act="claim:${g.id}" style="width:auto;padding:9px 14px">Забрать</button></div>`).join('')
      :emptyBlock('Выигрышей пока нет — но всё впереди');
  }
  return `<div class="h1">Мои розыгрыши</div>${seg}${body}`;
};

/* ---------- ПРОФИЛЬ ---------- */
ROUTES.profile=()=>{
  const l=link();
  const linkRow=l.linked
    ?`<div class="prow"><div class="ci">${ico('i-shield')}</div><div class="px"><b>Winline привязан</b><span>ID ${esc(l.winlineId)}</span></div>
        <button class="btn btn-ghost btn-sm" data-act="unlink" style="width:auto">Отвязать</button></div>`
    :`<div class="prow"><div class="ci">${ico('i-link')}</div><div class="px"><b>Winline не привязан</b><span>Войдите, чтобы участвовать</span></div>
        <button class="btn btn-primary btn-sm" data-act="link" style="width:auto">Привязать</button></div>`;
  return `<div class="h1">Профиль</div>
    <div class="prow"><div class="ci">${ico('i-user')}</div><div class="px"><b>Тёма</b><span>Telegram @artem</span></div></div>
    ${linkRow}
    <div class="prow"><div class="ci">${ico('i-checkc')}</div><div class="px"><b>Возраст 18+</b><span>Подтверждено через Winline</span></div></div>
    <div class="sect">Режим (демо)</div>
    <div class="lead" style="margin-bottom:10px">Переключи роль, чтобы посмотреть интерфейс админа. В бою роль выдаётся по TG-юзеру.</div>
    <div class="seg">
      <button class="${role()==='user'?'on':''}" data-act="role:user">Участник</button>
      <button class="${role()==='admin'?'on':''}" data-act="role:admin">Админ</button>
      <button class="${role()==='super'?'on':''}" data-act="role:super">Супер</button>
    </div>
    <p class="footnote">Winline Giveaway · демо-режим. Данные хранятся локально в браузере.</p>`;
};

/* ---------- АДМИН: ДАШБОРД ---------- */
ROUTES.adminDash=()=>{
  const all=GA();
  const mine=role()==='super'?all:all.filter(g=>g.owner==='me');
  const groups=[['active','Идут'],['draft','Черновики'],['finished','Завершённые']];
  let body=groups.map(([st,label])=>{
    const items=mine.filter(g=>g.status===st);
    if(!items.length)return '';
    return `<div class="sect">${label} <span class="badge">${items.length}</span></div>`+items.map(gaRow).join('');
  }).join('');
  if(!body) body=emptyBlock('Розыгрышей пока нет');
  return `<div class="h1">Админка</div>
    <button class="btn btn-primary" data-act="create">${ico('i-plus')}Создать розыгрыш</button>
    ${role()==='super'?`<button class="btn btn-ghost" style="margin-top:10px" data-act="open-team">${ico('i-users')}Команда и доступы</button>`:''}
    ${body}`;
};
function gaRow(g){
  const st=g.status==='active'?`<span class="pill o">● идёт</span>`:g.status==='draft'?`<span class="pill d">черновик</span>`:`<span class="pill g">завершён</span>`;
  const thumb=g.places>=10?g.places:(g.places||'★');
  return `<div class="ga" data-act="open-manage:${g.id}"><div class="thumb">${esc(String(thumb))}</div>
    <div class="meta"><h6>${esc(g.title)}</h6>
      <div class="ln"><span>ID <b>${esc(g.id)}</b></span><span>·</span><span>${esc(g.prizeType||'')}</span></div>
      <div class="ln" style="margin-top:4px"><span>${g.status==='finished'?'итоги '+esc(g.createdAt):'до '+dstr(g.endsAt)}</span><span style="margin-left:auto">${st}</span></div></div>
    <span class="arr">${ico('i-next')}</span></div>`;
}

/* ---------- АДМИН: УПРАВЛЕНИЕ ---------- */
ROUTES.manage=({id})=>{
  const g=getGA(id); if(!g)return emptyBlock('Не найдено');
  const rng=mulberry32(hashStr(g.id+'p')); const cnt=g.status==='finished'?Math.floor(rng()*1500)+300:Math.floor(rng()*800)+40;
  const live=g.status==='active';
  const conds=g.conditions.map(c=>{const m=condMeta(c);return `<span class="pill d">${ico(m.icon,'sm')}${esc(m.title)}</span>`;}).join(' ');
  return `<div class="stat-row" style="margin-bottom:12px"><span class="pill d">ID ${esc(g.id)}</span>
    <span>${live?`<span class="pill o">● идёт</span>`:g.status==='paused'?`<span class="pill r">на паузе</span>`:`<span class="pill g">завершён</span>`}</span></div>
    <div class="h1">${esc(g.title)}</div>
    <div class="lead">${esc(g.prize)} · ${g.places} ${plural(g.places,'место','места','мест')}</div>
    <div class="card"><div class="stat-row"><div><div style="font-size:12px;color:var(--muted)">Участников сейчас</div>
      <div class="display" style="font-size:30px">${cnt.toLocaleString('ru')}</div></div>
      <span class="pill ${live?'o':'d'}">${live?'● live':'итог'}</span></div>
      <div class="gmeta" style="margin:12px 0 0">${conds}</div></div>
    <div class="sect">Действия</div>
    <div class="row2">
      ${live?`<button class="btn btn-ghost btn-sm" data-act="pause:${id}">${ico('i-pause','sm')}Пауза</button>
              <button class="btn btn-ghost btn-sm" data-act="finish:${id}">${ico('i-stop','sm')}Завершить</button>`
            :g.status==='paused'?`<button class="btn btn-primary btn-sm" data-act="resume:${id}">${ico('i-bolt','sm')}Возобновить</button>
              <button class="btn btn-ghost btn-sm" data-act="finish:${id}">${ico('i-stop','sm')}Завершить</button>`
            :`<button class="btn btn-ghost btn-sm" data-act="open-results:${id}">${ico('i-trophy','sm')}Итоги</button>
              <button class="btn btn-ghost btn-sm" data-act="duplicate:${id}">${ico('i-copy','sm')}Дублировать</button>`}
    </div>
    <div class="row2" style="margin-top:10px">
      <button class="btn btn-ghost btn-sm" data-act="edit:${id}">${ico('i-edit','sm')}Редактировать</button>
      <button class="btn btn-ghost btn-sm" data-act="crosspost:${id}">${ico('i-mega','sm')}Кросспост</button>
    </div>
    <div class="sect">Аналитика</div>
    <button class="btn btn-ghost" data-act="open-analytics:${id}">${ico('i-chart')}Участники и выгрузка</button>
    ${live?'':`<div style="height:10px"></div><button class="btn btn-primary" data-act="open-results:${id}">${ico('i-trophy')}Подвести итоги</button>`}`;
};

/* ---------- АДМИН: ИТОГИ ---------- */
const NAMES=['alex','maria','dmitry','nika','pro_bet','egor','sofia','kirill','vlad','anna','max_cs','lena','roman','daria','artem','ivan','olga','pavel','yana','denis'];
function maskId(rng,len){let s='';for(let i=0;i<len;i++)s+=Math.floor(rng()*10);return '···'+s;}
function genWinners(g){const rng=mulberry32(hashStr(g.id+(g.seedNonce||'')));const n=Math.min(g.places||1,12);const out=[],used=new Set();
  for(let i=0;i<n;i++){let nm;do{nm=NAMES[Math.floor(rng()*NAMES.length)]+'_'+Math.floor(rng()*90+10);}while(used.has(nm));used.add(nm);
    out.push({u:'@'+nm,wl:maskId(rng,4),tg:maskId(rng,4)});}return out;}
ROUTES.results=({id})=>{
  const g=getGA(id); if(!g)return emptyBlock('Не найдено');
  const w=genWinners(g); const extra=(g.places||1)-w.length;
  const seedHash=(hashStr(g.id+(g.seedNonce||''))>>>0).toString(16).padStart(8,'0');
  return `<div class="stat-row" style="margin-bottom:10px"><span class="pill d">ID ${esc(g.id)}</span>
    <span>${g.status==='finished'?`<span class="pill g">завершён</span>`:`<span class="pill o">готов к итогам</span>`}</span></div>
    <div class="h1">${ico('i-trophy')} Итоги</div>
    <div class="lead">${esc(g.title)} · ${g.places} ${plural(g.places,'место','места','мест')}. Случайно среди выполнивших условия.</div>
    <div id="winlist">${w.map((x,i)=>`<div class="win ${i<3?'top'+(i+1):''}"><div class="num">${i+1}</div>
      <div><div class="u">${esc(x.u)}</div><div class="id">WL ${x.wl} · TG ${x.tg}</div></div></div>`).join('')}</div>
    ${extra>0?`<div class="card" style="text-align:center;color:var(--muted);font-size:12.5px">… и ещё ${extra} ${plural(extra,'победитель','победителя','победителей')}</div>`:''}
    <div class="card" style="margin-top:12px"><div style="font-size:11.5px;color:var(--muted)">Проверочный хеш (provably-fair)</div>
      <div class="mono" style="font-size:13px;margin-top:4px;color:var(--brand-300)">${seedHash}</div>
      <div class="hint" style="margin-top:6px">${ico('i-info','sm')}Сид публикуется после итогов — любой может пересчитать список.</div></div>
    <button class="btn btn-primary" style="margin-top:12px" data-act="pub-results:${id}">${ico('i-mega')}Опубликовать итоги</button>
    <div class="row2" style="margin-top:10px">
      <button class="btn btn-ghost btn-sm" data-act="reroll:${id}">${ico('i-loader','sm')}Рерол</button>
      <button class="btn btn-ghost btn-sm" data-act="open-analytics:${id}">${ico('i-chart','sm')}Аналитика</button></div>`;
};

/* ---------- АДМИН: АНАЛИТИКА ---------- */
ROUTES.analytics=({id})=>{
  const g=getGA(id); if(!g)return emptyBlock('Не найдено');
  const rng=mulberry32(hashStr(g.id+'a'));
  const total=Math.floor(rng()*1500)+300, passed=Math.floor(total*(0.6+rng()*0.2)), linkedN=Math.floor(total*(0.6+rng()*0.25));
  const dot=v=>v?'<span class="dotg">●</span>':'<span class="dotr">●</span>';
  const rows=[];for(let i=0;i<6;i++)rows.push({tg:maskId(rng,4),wl:maskId(rng,4),s:rng()>.15,p:rng()>.25,b:rng()>.3});
  return `<div class="h1">${ico('i-chart')} Аналитика</div>
    <div class="lead">${esc(g.id)} · ${esc(g.title)}. Синхронизация с Google Таблицей.</div>
    <div class="kpis">
      <div class="kpi"><div class="v o">${total.toLocaleString('ru')}</div><div class="k">Всего участников</div></div>
      <div class="kpi"><div class="v g">${passed.toLocaleString('ru')}</div><div class="k">Прошли условия</div></div>
      <div class="kpi"><div class="v">${linkedN.toLocaleString('ru')}</div><div class="k">Привязали Winline</div></div>
      <div class="kpi"><div class="v">${g.places}</div><div class="k">Победителей</div></div></div>
    <div class="sect">Участники</div>
    <div class="card" style="padding:8px 12px;overflow-x:auto"><table class="tbl">
      <tr><th>TG</th><th>WL ID</th><th>Подп.</th><th>Промо</th><th>Ставка</th></tr>
      ${rows.map(r=>`<tr><td>${r.tg}</td><td>${r.wl}</td><td>${dot(r.s)}</td><td>${dot(r.p)}</td><td>${dot(r.b)}</td></tr>`).join('')}</table></div>
    <div class="hint" style="gap:16px"><span><span class="dotg">●</span> выполнено</span><span><span class="dotr">●</span> нет</span></div>
    <button class="btn btn-primary" style="margin-top:14px" data-act="export:${id}">${ico('i-sheet')}Выгрузить в Google Sheets</button>`;
};

/* ---------- АДМИН: КОМАНДА (супер) ---------- */
ROUTES.team=()=>{
  const admins=lj(K_ADMINS,[]);
  const rows=admins.map((a,i)=>`<div class="prow"><div class="ci">${ico('i-user')}</div>
    <div class="px"><b>${esc(a.u)}</b><span>${esc(a.role)}</span></div>
    ${a.role==='Супер-админ'?'':`<button class="btn btn-ghost btn-sm" data-act="rm-admin:${i}" style="width:auto">Отозвать</button>`}</div>`).join('');
  return `<div class="h1">Команда</div>
    <div class="lead">Доступ выдаётся по TG-юзеру. Админ создаёт и ведёт свои розыгрыши.</div>
    ${rows}
    <div class="sect">Выдать доступ</div>
    <div class="field" style="display:flex;gap:8px"><input class="input" id="newAdmin" placeholder="@username">
      <button class="btn btn-primary icon-btn" data-act="add-admin">Добавить</button></div>`;
};

/* ---------- УСПЕХ ПУБЛИКАЦИИ ---------- */
ROUTES.published=({msg})=>`<div class="center"><div class="burst">${ico('i-checkc')}</div>
  <div class="h1">Опубликовано!</div><div class="lead" style="max-width:300px">${esc(msg||'Розыгрыш создан.')}</div>
  <button class="btn btn-primary" data-act="go-admin">${ico('i-grid')}В админку</button></div>`;

/* ============================================================ КОНСТРУКТОР ============================================================ */
let draft=null;
function freshDraft(){return {text:'',image:null,button:'УЧАСТВОВАТЬ',conditions:[],places:'',pubChannels:['@winline_official'],dateStr:'',endsAt:Date.now()+3*DAY,editId:null};}
const PUB_CHANNELS=['@winline_official','@winline_esports','@winline_sport'];

ROUTES.constructor=()=>{
  if(!draft) draft=freshDraft();
  return `<div class="h1">${draft.editId?'Редактирование':'Новый розыгрыш'}</div>
    <div class="lead">Соберите розыгрыш из блоков. Обязательных условий нет — добавляйте нужные.</div>

    <div class="sect">Оформление</div>
    <div class="upload ${draft.image?'has':''}" data-act="pick-image">${ico('i-img')}<span id="upLabel">${draft.image?'Изображение выбрано':'Выбрать обложку'}</span></div>
    <div class="field" style="margin-top:12px"><label>Текст розыгрыша</label>
      <textarea class="textarea" data-model="text" placeholder="Разыгрываем iPhone 17 Pro! Условия — ниже 👇">${esc(draft.text)}</textarea></div>
    <div class="field"><label>Текст кнопки</label>
      <div class="chips" id="btnChips">
        ${['УЧАСТВОВАТЬ','ПРИНЯТЬ УЧАСТИЕ','УЧАСТВУЮ'].map(b=>`<div class="chip ${draft.button===b?'sel':''}" data-act="pick-btn:${b}">${b}</div>`).join('')}
      </div>
      <input class="input" style="margin-top:8px" data-model="button" value="${esc(draft.button)}"></div>

    <div class="sect">Условия участия <span class="badge" id="condBadge">${draft.conditions.length}</span></div>
    <div id="condHost">${renderCondEditors()}</div>
    <div class="builder-add">
      <div class="add-cond" data-act="add-cond:sub"><div class="ci">${ico('i-mega','sm')}</div>Подписка на канал<span class="plus">${ico('i-plus','sm')}</span></div>
      <div class="add-cond" data-act="add-cond:promo"><div class="ci">${ico('i-ticket','sm')}</div>Регистрация по промокоду<span class="plus">${ico('i-plus','sm')}</span></div>
      <div class="add-cond" data-act="add-cond:bet"><div class="ci">${ico('i-coin','sm')}</div>Ставка / депозит<span class="plus">${ico('i-plus','sm')}</span></div>
    </div>

    <div class="sect">Параметры</div>
    <div class="field"><label>Количество мест (победителей)</label><input class="input" type="number" inputmode="numeric" data-model="places" value="${esc(draft.places)}" placeholder="50"></div>
    <div class="field"><label>Каналы публикации (кросспост)</label>
      <div class="chips">${PUB_CHANNELS.map(c=>`<div class="chip ${draft.pubChannels.includes(c)?'sel':''}" data-act="toggle-pub:${c}">${ico('i-mega','sm')}${c}</div>`).join('')}</div></div>
    <div class="field"><label>Дата и время итогов</label><input class="input" data-model="dateStr" value="${esc(draft.dateStr)}" placeholder="01.07.26 18:00"></div>
    <div class="btn-row" style="margin-top:0"><button class="btn btn-ghost btn-sm" data-act="pub-now">${ico('i-bolt','sm')}Сейчас</button></div>

    <div class="sect">Предпросмотр</div>${renderPreview()}

    <button class="btn btn-primary" style="margin-top:8px" data-act="publish">${ico('i-bolt')}Опубликовать</button>
    <div style="height:10px"></div>
    <button class="btn btn-ghost" data-act="save-draft">${ico('i-edit')}Сохранить черновик</button>`;
};
function renderCondEditors(){
  if(!draft.conditions.length) return `<div class="hint" style="margin-bottom:6px">${ico('i-info','sm')}Условия не добавлены — розыгрыш открыт для всех. Добавьте при необходимости.</div>`;
  return draft.conditions.map((c,i)=>{
    const m=condMeta(c); let body='';
    if(c.type==='sub'){
      body=`<div class="chips" style="margin-bottom:8px">${(c.channels||[]).map((ch,ci)=>`<div class="chip">${esc(ch)} <span data-act="rm-chan:${i}:${ci}" style="margin-left:4px;color:var(--muted-2)">✕</span></div>`).join('')}</div>
        <div style="display:flex;gap:8px"><input class="input" data-chan="${i}" placeholder="@username или ссылка"><button class="btn btn-ghost icon-btn btn-sm" data-act="add-chan:${i}">+</button></div>`;
    }else if(c.type==='promo'){
      body=`<input class="input" data-cond="${i}:code" value="${esc(c.code||'')}" placeholder="Промокод, напр. ESPORTS2026">`;
    }else if(c.type==='bet'){
      body=`<div class="row2"><input class="input" type="number" data-cond="${i}:amount" value="${esc(c.amount||'')}" placeholder="Сумма ₽">
        <select class="input" data-cond="${i}:category">
          ${['Все события','Киберспорт','Другое'].map(o=>`<option ${c.category===o?'selected':''}>${o}</option>`).join('')}
        </select></div>
        ${c.category==='Другое'?`<input class="input" style="margin-top:8px" data-cond="${i}:link" value="${esc(c.link||'')}" placeholder="Ссылка на событие Winline">`:''}`;
    }
    return `<div class="cond-edit"><div class="ceh">${ico(m.icon,'sm')}${esc(m.title)}<span class="rm" data-act="rm-cond:${i}">${ico('i-x','sm')}</span></div>${body}</div>`;
  }).join('');
}
function renderPreview(){
  const d=draft;
  const media=d.image?`<img src="${d.image}" alt="">`:'Обложка';
  const cond=d.conditions.map(c=>condMeta(c).title.toLowerCase());
  const sub=[d.places?`${d.places} ${plural(+d.places||0,'победитель','победителя','победителей')}`:''].concat(cond).filter(Boolean).join(' · ');
  return `<div class="preview"><div class="pm">${media}</div>
    <div class="pb"><h5>${esc(draftTitle())}</h5><p>${esc(d.text||'Текст розыгрыша появится здесь')}</p>${sub?`<p style="margin-top:6px;color:var(--brand-300)">${esc(sub)}</p>`:''}</div>
    <div class="pc">${esc(d.button)}</div></div>`;
}
function draftTitle(){const f=(draft.text||'').split('\n')[0].trim();return f?(f.length>40?f.slice(0,40)+'…':f):'Розыгрыш';}
function paintConds(){const host=$('#condHost');if(host)host.innerHTML=renderCondEditors();const b=$('#condBadge');if(b&&draft)b.textContent=draft.conditions.length;}

/* ---------- model update ---------- */
function modelUpdate(key,val,node){
  if(!draft)return;
  if(['text','button','places','dateStr'].includes(key)){ draft[key]=val; refreshPreviewLive(); }
}
function refreshPreviewLive(){ const host=$('.preview'); if(host&&draft) host.outerHTML=renderPreview(); }

/* ============================================================ ОБРАБОТЧИК ============================================================ */
function handle(act,arg,node){
  haptic();
  switch(act){
    case 'open-ga': push({name:'giveaway',params:{id:arg}}); break;
    case 'open-manage': push({name:'manage',params:{id:arg}}); break;
    case 'open-results': push({name:'results',params:{id:arg}}); break;
    case 'open-analytics': push({name:'analytics',params:{id:arg}}); break;
    case 'open-team': push({name:'team'}); break;
    case 'go-admin': setTab('admin'); break;

    case 'seg': mineSeg=arg; render(); break;
    case 'role': setRole(arg); ping('Роль: '+ROLE_LABEL[arg]); setTab(role()==='user'?'feed':'admin'); break;
    case 'link': case 'unlink': toggleLink(act); break;

    case 'participate': participate(arg); break;
    case 'claim': ping('Заявка на приз отправлена'); break;

    case 'create': draft=freshDraft(); push({name:'constructor'}); break;
    case 'edit': editGiveaway(arg); break;
    case 'pick-image': $('#fileInput').click(); break;
    case 'pick-btn': draft.button=arg; $$('#btnChips .chip').forEach(c=>c.classList.toggle('sel',c.dataset.act===`pick-btn:${arg}`)); { const bi=$('input[data-model="button"]'); if(bi)bi.value=arg; } refreshPreviewLive(); break;
    case 'toggle-pub': togglePub(arg,node); break;
    case 'pub-now': draft.dateStr='Сейчас'; { const di=$('input[data-model="dateStr"]'); if(di)di.value='Сейчас'; } ping('Публикация сразу'); break;
    case 'add-cond': addCond(arg); break;
    case 'rm-cond': draft.conditions.splice(+arg,1); paintConds(); break;
    case 'add-chan': addChan(+arg); break;
    case 'rm-chan': { const [i,ci]=arg.split(':'); draft.conditions[+i].channels.splice(+ci,1); paintConds(); break; }
    case 'publish': publish(false); break;
    case 'save-draft': publish(true); break;

    case 'pause': changeStatus(arg,'paused','Розыгрыш на паузе'); break;
    case 'resume': changeStatus(arg,'active','Розыгрыш возобновлён'); break;
    case 'finish': changeStatus(arg,'finished','Розыгрыш завершён'); break;
    case 'duplicate': duplicate(arg); break;
    case 'crosspost': crosspost(arg); break;
    case 'reroll': reroll(arg); break;
    case 'pub-results': changeStatus(arg,'finished','Итоги опубликованы'); break;
    case 'export': ping('Данные выгружены в Google Sheets'); break;

    case 'add-admin': addAdmin(); break;
    case 'rm-admin': { const a=lj(K_ADMINS,[]); a.splice(+arg,1); sj(K_ADMINS,a); render(); ping('Доступ отозван'); break; }

    case 'modal-close': closeSheet(); break;
  }
}

/* ---------- реализация действий ---------- */
function toggleLink(act){ if(act==='unlink'){ sj(K_LINK,{linked:false,winlineId:''}); render(); ping('Winline отвязан'); } else openAuth(null); }
function togglePub(c,node){ const i=draft.pubChannels.indexOf(c); if(i>=0){ if(draft.pubChannels.length>1) draft.pubChannels.splice(i,1); } else draft.pubChannels.push(c); node.classList.toggle('sel',draft.pubChannels.includes(c)); }
function addCond(type){ const c=type==='sub'?{type:'sub',channels:['@winline_official']}:type==='promo'?{type:'promo',code:''}:{type:'bet',amount:'',category:'Все события',link:''}; draft.conditions.push(c); paintConds(); }
function addChan(i){ const inp=$(`input[data-chan="${i}"]`); if(!inp)return; const v=inp.value.trim(); if(!v)return; draft.conditions[i].channels.push(v.startsWith('@')||v.startsWith('http')?v:'@'+v); paintConds(); }
function publish(asDraft){
  if(!asDraft){
    if(!draft.text.trim()){ping('Добавьте текст розыгрыша');return;}
    if(!draft.places||+draft.places<1){ping('Укажите количество мест');return;}
  }
  const arr=GA();
  if(draft.editId){ const g=arr.find(x=>x.id===draft.editId); if(g) Object.assign(g,buildFromDraft(g.id,g.createdAt)); setGA(arr); push({name:'published',params:{msg:'Изменения сохранены.'}}); draft=null; return; }
  const id='GA-'+(2061+arr.length+Math.floor(Math.random()*40));
  const g=buildFromDraft(id,today()); g.status=asDraft?'draft':'active';
  arr.unshift(g); setGA(arr);
  push({name:'published',params:{msg:asDraft?'Черновик сохранён.':`Розыгрыш ушёл в ${g.pubChannels.join(', ')}.`}});
  draft=null;
}
function buildFromDraft(id,createdAt){
  let endsAt=draft.endsAt;
  const m=(draft.dateStr||'').match(/(\d{2})\.(\d{2})\.(\d{2})\s+(\d{1,2}):(\d{2})/);
  if(m) endsAt=new Date(2000+ +m[3],+m[2]-1,+m[1],+m[4],+m[5]).getTime();
  else if(draft.dateStr==='Сейчас') endsAt=Date.now()+DAY;
  return {id,title:draftTitle(),prize:draftTitle(),prizeType:'Приз',coverLabel:draftTitle(),
    text:draft.text,image:draft.image,button:draft.button,conditions:JSON.parse(JSON.stringify(draft.conditions)),
    places:+draft.places||1,pubChannels:draft.pubChannels.slice(),endsAt,createdAt,status:'active',owner:'me'};
}
function editGiveaway(id){
  const g=getGA(id); if(!g)return;
  draft=freshDraft(); draft.text=g.text;draft.image=g.image;draft.button=g.button;
  draft.conditions=JSON.parse(JSON.stringify(g.conditions));draft.places=g.places;draft.pubChannels=g.pubChannels.slice();
  draft.dateStr=dstr(g.endsAt);draft.endsAt=g.endsAt;draft.editId=id; push({name:'constructor'});
}
function changeStatus(id,st,msg){const a=GA();const g=a.find(x=>x.id===id);if(g){g.status=st;setGA(a);}ping(msg);render();}
function duplicate(id){const g=getGA(id);if(!g)return;draft=freshDraft();draft.text=g.text;draft.image=g.image;draft.button=g.button;
  draft.conditions=JSON.parse(JSON.stringify(g.conditions));draft.places=g.places;draft.pubChannels=g.pubChannels.slice();
  push({name:'constructor'});ping('Создана копия — отредактируйте и опубликуйте');}
function crosspost(id){
  openSheet(`<h3>${ico('i-mega')} Кросспостинг</h3><p>Выберите каналы, где наш бот админ — туда уйдёт карточка розыгрыша.</p>
    <div class="chips" id="cpChips">${PUB_CHANNELS.map(c=>`<div class="chip block" data-cp="${c}">${ico('i-mega','sm')}${c}</div>`).join('')}</div>
    <button class="btn btn-primary" style="margin-top:14px" id="cpGo">Запостить</button>
    <div style="height:8px"></div><button class="btn btn-ghost" data-act="modal-close">Отмена</button>`);
  $$('#cpChips .chip').forEach(c=>c.onclick=()=>{c.classList.toggle('sel');haptic();});
  $('#cpGo').onclick=()=>{const n=$$('#cpChips .chip.sel').length;closeSheet();ping(n?`Запощено в ${n} ${plural(n,'канал','канала','каналов')}`:'Каналы не выбраны');};
}
function reroll(id){
  const list=$('#winlist'); if(!list)return; let t=0;
  const iv=setInterval(()=>{$$('.win .u',list).forEach(u=>u.textContent='@'+NAMES[Math.floor(Math.random()*NAMES.length)]+'_'+Math.floor(Math.random()*90+10));
    if(++t>10){clearInterval(iv);const a=GA();const g=a.find(x=>x.id===id);if(g){g.seedNonce=(g.seedNonce||0)+1;setGA(a);}render();ping('Победители перевыбраны');}},70);
}
function addAdmin(){const el=$('#newAdmin');if(!el||!el.value.trim())return;const a=lj(K_ADMINS,[]);const v=el.value.trim();a.push({u:v.startsWith('@')?v:'@'+v,role:'Админ'});sj(K_ADMINS,a);render();ping('Доступ выдан');}

/* ---------- участие + авторизация ---------- */
function participate(id){ const g=getGA(id); if(!g)return; if(!link().linked){ openAuth(g); return; } runChecks(g); }
function openAuth(g){
  openSheet(`<h3>${ico('i-shield')} Вход в Winline</h3>
    <p>Войдите в личный кабинет, чтобы привязать аккаунт${g?' и подтвердить участие':''}.</p>
    <div class="field"><label>Логин / ID Winline</label><input class="input" id="wlLogin" placeholder="Ваш Winline ID"></div>
    <div class="field"><label>Пароль</label><input class="input" type="password" id="wlPass" placeholder="••••••••"></div>
    <button class="btn btn-primary" id="wlGo">${g?'Войти и проверить':'Войти и привязать'}</button>
    <div style="height:8px"></div><button class="btn btn-ghost" data-act="modal-close">Отмена</button>`);
  $('#wlGo').onclick=()=>{ haptic();
    const v=($('#wlLogin').value||'').trim();
    // TODO:BACKEND — реальная авторизация Winline + проверка 1 WL = 1 TG
    sj(K_LINK,{linked:true,winlineId:v.startsWith('WL')?v:('WL-'+Math.floor(Math.random()*9e6+1e6))});
    if(g) runChecks(g); else { closeSheet(); render(); ping('Winline привязан'); }
  };
}
function runChecks(g){
  const items=[]; g.conditions.forEach(c=>items.push(condMeta(c).title)); if(!items.length) items.push('Привязка аккаунта');
  openSheet(`<h3>${ico('i-loader')} Проверяем условия…</h3><p>Привязываем Winline ID к Telegram и проверяем выполнение.</p>
    <div class="check-list" id="checks">${items.map(t=>`<div class="check wait"><span>${ico('i-clock','sm')}</span>${esc(t)}<span class="st">${ico('i-loader','sm spin')}</span></div>`).join('')}</div>`);
  const rows=$$('#checks .check'); let i=0;
  const iv=setInterval(()=>{ if(i>=rows.length){clearInterval(iv);finishParticipate(g);return;}
    rows[i].classList.remove('wait');rows[i].classList.add('ok');rows[i].querySelector('.st').innerHTML=ico('i-checkc','sm');i++;},600);
}
function finishParticipate(g){
  const my=MY(); if(!my.entered.includes(g.id)){my.entered.push(g.id);sj(K_MY,my);}
  setTimeout(()=>{
    openSheet(`<div class="center" style="min-height:auto;padding:8px 0"><div class="burst">${ico('i-checkc')}</div>
      <h3>Вы участвуете! 🎉</h3><p style="text-align:center">Все условия выполнены. Удачи в розыгрыше «${esc(g.title)}»!</p>
      <button class="btn btn-primary" data-act="modal-close">Отлично</button></div>`);
  },350);
  setTimeout(()=>{ if(state.stack[state.stack.length-1].name==='giveaway') render(); },360);
}

/* ---------- empty ---------- */
function emptyBlock(t){return `<div class="empty">${ico('i-gift')}<div>${esc(t)}</div></div>`;}

/* ---------- file input (обложка) ---------- */
$('#fileInput').addEventListener('change',e=>{
  const f=e.target.files[0]; if(!f||!draft)return; const r=new FileReader();
  r.onload=()=>{draft.image=r.result; const l=$('#upLabel'); if(l){l.textContent='Изображение выбрано'; l.closest('.upload').classList.add('has');} refreshPreviewLive();};
  r.readAsDataURL(f); e.target.value='';
});

/* ---------- живые таймеры ---------- */
setInterval(()=>{ $$('[data-ends]').forEach(elm=>{const t=+elm.dataset.ends; elm.textContent=Date.now()>=t?'завершён':timeLeft(t);}); },1000);

/* ---------- init ---------- */
seed();
setTab('feed');
