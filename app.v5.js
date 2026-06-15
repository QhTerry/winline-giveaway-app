/* ============================================================
   WINLINE GIVEAWAY - mini app (role-aware SPA) · v5
   Без общей ленты. Каналы: свободный ввод + «недавние», основной @winlinesports.
   Гиперссылки в тексте, обложки в списках, плиточное управление,
   роли супер/админ по TG ID. Демо: localStorage. Бэкенд - TODO:BACKEND.
   ============================================================ */
'use strict';

/* ---------- Telegram ---------- */
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
function haptic(t='light'){ try{ tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred(t); }catch(e){} }
function openTg(url){ if(!url)return; try{ if(tg&&tg.openTelegramLink&&/^https?:\/\/t\.me\//.test(url)){tg.openTelegramLink(url);return;} if(tg&&tg.openLink){tg.openLink(url);return;} }catch(e){} try{window.open(url,'_blank');}catch(e){} }
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
/* гиперссылки: [текст](url) и голые ссылки -> кликабельно; \n -> <br> */
function linkify(t){
  let s=esc(t);
  s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,(m,a,u)=>`<a class="ln-a" href="${u}" target="_blank" rel="noopener">${a}</a>`);
  s=s.replace(/(^|[^"=>\]])(https?:\/\/[^\s<]+)/g,(m,p,u)=>`${p}<a class="ln-a" href="${u}" target="_blank" rel="noopener">${u}</a>`);
  return s.replace(/\n/g,'<br>');
}

/* ---------- storage ---------- */
const K_GA='wl_giveaways_v2', K_MY='wl_my_v1', K_ROLE='wl_role', K_LINK='wl_link', K_ADMINS='wl_admins', K_ONB='wl_onboarded', K_SEED='wl_seed_v5', K_RECENT='wl_recent_chan';
const MAIN_CHANNEL='@winlinesports';
const lj=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}};
const sj=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const DAY=864e5, HR=36e5;
function seed(){
  if(localStorage.getItem(K_SEED)) return;
  if(lj(K_GA,null)==null) sj(K_GA,[]);
  if(lj(K_MY,null)==null) sj(K_MY,{entered:[],won:[]});
  if(lj(K_LINK,null)==null) sj(K_LINK,{linked:false,winlineId:''});
  if(lj(K_ADMINS,null)==null) sj(K_ADMINS,[{u:'@artem',role:'Супер-админ',self:true}]);
  if(lj(K_RECENT,null)==null) sj(K_RECENT,[MAIN_CHANNEL]);
  localStorage.setItem(K_SEED,'1');
}
const GA=()=>lj(K_GA,[]);
const setGA=a=>sj(K_GA,a);
const getGA=id=>GA().find(g=>g.id===id);
const MY=()=>lj(K_MY,{entered:[],won:[]});
const role=()=>localStorage.getItem(K_ROLE)||'user';
const isAdmin=()=>role()!=='user';
const setRole=r=>localStorage.setItem(K_ROLE,r);
const link=()=>lj(K_LINK,{linked:false,winlineId:''});
const recent=()=>lj(K_RECENT,[MAIN_CHANNEL]);
/* данные Telegram-аккаунта (имя/юзернейм) из WebApp */
function tgUser(){
  try{ const u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;
    if(u) return { name:[u.first_name,u.last_name].filter(Boolean).join(' ')||u.username||'Пользователь', uname:u.username?('@'+u.username):'' }; }
  catch(e){}
  return { name:'Гость', uname:'' };
}
function addRecent(chs){ let r=recent(); (chs||[]).forEach(c=>{ c=(c||'').trim(); if(!c)return; r=r.filter(x=>x!==c); r.unshift(c); }); sj(K_RECENT,r.slice(0,8)); }
function normChan(v){ v=(v||'').trim(); if(!v)return ''; if(/^https?:\/\/t\.me\//i.test(v)){ v='@'+v.replace(/^https?:\/\/t\.me\//i,'').replace(/\/$/,''); } if(!v.startsWith('@')&&!/^https?:/i.test(v)) v='@'+v; return v; }

/* ---------- condition meta ---------- */
function condMeta(c){
  if(c.type==='sub')   return {icon:'i-mega',  title:'Подписка на канал', sub:(c.channels||[]).join(', ')||'-'};
  if(c.type==='promo') return {icon:'i-ticket',title:'Регистрация по промокоду', sub:c.code||'-'};
  if(c.type==='bet')   return {icon:'i-coin',  title:`Ставка от ${c.amount||0} ₽`, sub:c.category||'-'};
  return {icon:'i-info',title:'Условие',sub:''};
}
function thumbBox(g,fallbackIcon){
  return g.image
    ? `<div class="thumb img" style="background-image:url('${g.image}')"></div>`
    : `<div class="thumb">${fallbackIcon||ico('i-gift')}</div>`;
}

/* ============================================================ НАВИГАЦИЯ ============================================================ */
const view=$('#view'), backBtn=$('#backBtn'), tabbar=$('#tabbar'), hdr=$('.hdr');
const ROLE_LABEL={user:'Участник',admin:'Админ',super:'Супер-админ'};

let state={tab:'mine', stack:[{name:'mine'}]};

function tabsForRole(){
  const t=[{id:'mine',icon:'i-ticket',label:'Мои'}];
  if(isAdmin()) t.push({id:'admin',icon:'i-grid',label:'Админка'});
  t.push({id:'profile',icon:'i-user',label:'Профиль'});
  return t;
}
function tabRoot(tab){return tab==='admin'?{name:'adminDash'}:{name:tab};}
function setTab(tab){ state.tab=tab; state.stack=[tabRoot(tab)]; render(); }
function push(route){ state.stack.push(route); render(); }
function pop(){ if(state.stack.length>1){state.stack.pop();render();} }
backBtn.addEventListener('click',()=>{haptic();pop();});

/* открытие экрана с короткой загрузкой-скелетоном */
let fxLoading=false;
function openFx(route){ fxLoading=true; push(route); setTimeout(()=>{ fxLoading=false; const cur=state.stack[state.stack.length-1]; if(cur&&cur.name===route.name) render(); }, 480); }
function skeleton(kind){
  const line=w=>`<div class="skel skel-line" style="width:${w}"></div>`;
  if(kind==='giveaway') return `<div class="skel skel-card"></div>${line('55%')}${line('90%')}${line('80%')}<div style="height:14px"></div><div class="skel" style="height:48px;border-radius:14px;border:0"></div>`;
  return `${line('45%')}<div class="skel skel-card" style="height:84px"></div>${line('72%')}${line('88%')}${line('60%')}`;
}

function renderTabbar(){
  tabbar.innerHTML=tabsForRole().map(t=>`<button data-tab="${t.id}" class="${state.tab===t.id?'on':''}">${ico(t.icon)}${t.label}</button>`).join('');
}
function render(){
  const route=state.stack[state.stack.length-1];
  const fn=ROUTES[route.name]; if(!fn)return;
  view.innerHTML=fn(route.params||{});
  const onboard = route.name==='onboarding';
  if(hdr) hdr.style.display = onboard?'none':'flex';
  tabbar.style.display = onboard?'none':'flex';
  const showBack=state.stack.length>1 && !onboard;
  backBtn.classList.toggle('show',showBack);
  if(tg){try{showBack?tg.BackButton.show():tg.BackButton.hide();}catch(e){}}
  if(!onboard) renderTabbar();
  view.scrollTop=0; window.scrollTo(0,0);
}

/* делегирование */
document.addEventListener('click',e=>{
  const aLink=e.target.closest('a.ln-a');
  if(aLink){ if(tg&&tg.openLink){e.preventDefault();try{tg.openLink(aLink.href);}catch(_){}} return; }
  const tabBtn=e.target.closest('[data-tab]');
  if(tabBtn){haptic();setTab(tabBtn.dataset.tab);return;}
  const a=e.target.closest('[data-act]'); if(!a)return;
  const [act,...rest]=a.dataset.act.split(':'); const arg=rest.join(':');
  handle(act,arg,a);
});
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

/* ---------- ОНБОРДИНГ ---------- */
ROUTES.onboarding=()=>{
  const feat=(i,t,s)=>`<div class="onb-feat"><div class="ci">${ico(i)}</div><div><b>${t}</b><span>${s}</span></div></div>`;
  return `<div class="onb">
    <div class="onb-hero"><img src="logo.svg" class="onb-logo" alt="Winline"><div class="onb-badge">GIVEAWAY</div></div>
    <div class="onb-content">
      <div class="h1" style="font-size:30px">Розыгрыши Winline</div>
      <p class="lead">Участвуй в розыгрышах из каналов Winline, выполняй условия и забирай призы - фрибеты, девайсы, мерч и билеты.</p>
      ${feat('i-shield','Безопасно через Winline','Привязка аккаунта по API')}
      ${feat('i-trophy','Честный розыгрыш','Случайный выбор с проверкой результата')}
      ${feat('i-ticket','Всё в «Моих»','Твои участия и выигрыши в одном месте')}
    </div>
    <div class="onb-cta"><button class="btn btn-primary" data-act="start">Начать</button></div>
  </div>`;
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
      const done=g.conditions.length, live=g.status==='active';
      const st=live?`<span class="pill o">● идёт</span>`:`<span class="pill g">завершён</span>`;
      const right=live?`<span class="mono" style="color:var(--brand-300);font-size:11.5px" data-ends="${g.endsAt}">${timeLeft(g.endsAt)}</span>`:'';
      return `<div class="ga" data-act="open-ga:${g.id}">${thumbBox(g,ico('i-ticket'))}
        <div class="meta"><h6>${esc(g.title)}</h6>
          <div class="ln"><span class="pill g" style="padding:3px 8px">${done}/${done} условий</span>${st}${right}</div></div>
        <span class="arr">${ico('i-next')}</span></div>`;}).join('')
      :emptyBlock('Ты пока не участвуешь','Открой розыгрыш из поста в канале Winline - он появится здесь.',`<button class="btn btn-ghost" data-act="rules">${ico('i-info')}Как это работает</button>`);
  }else{
    const items=my.won.map(getGA).filter(Boolean);
    body=items.length?items.map(g=>`<div class="ga" data-act="open-win:${g.id}">${thumbBox(g,ico('i-trophy'))}
      <div class="meta"><h6>${esc(g.prize)}</h6>
        <div class="ln"><span>${esc(g.title)}</span></div>
        <div class="ln" style="margin-top:4px"><span class="pill o">приз ждёт получения</span></div></div>
      <span class="arr">${ico('i-next')}</span></div>`).join('')
      :emptyBlock('Выигрышей пока нет','Участвуй в розыгрышах - победители выбираются случайно по таймеру.','');
  }
  return `<div class="h1">Мои розыгрыши</div>${seg}${body}`;
};

/* ---------- КАРТОЧКА РОЗЫГРЫША (участник) ---------- */
ROUTES.giveaway=({id})=>{
  if(fxLoading) return skeleton('giveaway');
  const g=getGA(id); if(!g)return emptyBlock('Розыгрыш не найден','Возможно, он завершён или ссылка устарела.','');
  const entered=MY().entered.includes(id);
  const conds=g.conditions.length?g.conditions.map(c=>{const m=condMeta(c);
    return `<div class="cond ${entered?'ok':'no'}"><div class="ci">${ico(m.icon)}</div>
      <div class="cx"><b>${esc(m.title)}</b><span>${esc(m.sub)}</span></div>
      <div class="st">${entered?ico('i-checkc'):ico('i-next','sm')}</div></div>`;}).join('')
    :`<div class="hint">${ico('i-info','sm')}Особых условий нет - участвуют все авторизованные.</div>`;
  const cover=g.image?`<img src="${g.image}" alt=""><div class="veil"></div>`:'';
  const live=g.status==='active'; const hot=live&&(g.endsAt-Date.now())<DAY;
  return `<div class="gcover detail">${cover}
      <div class="timer ${hot?'hot':''}">${ico('i-clock','sm')}<span data-ends="${g.endsAt}">${live?timeLeft(g.endsAt):'завершён'}</span></div>
      <div class="ct">${esc(g.coverLabel||g.title)}</div></div>
    <div class="h1">${esc(g.title)}</div>
    <div class="gmeta"><span class="pill o">${ico('i-trophy','sm')}${esc(g.prize)}</span>
      <span class="pill d">${ico('i-users','sm')}${g.places} ${plural(g.places,'место','места','мест')}</span></div>
    <div class="act-grid two" style="margin-top:12px">
      <button class="act-tile" data-act="open-post:${id}">${ico('i-mega')}Пост в канале</button>
      <button class="act-tile" data-act="rules">${ico('i-info')}Правила</button></div>
    <p class="lead" style="margin-top:14px">${linkify(g.text)}</p>
    <div class="sect">Условия участия</div>${conds}
    ${live?(entered
      ?`<div class="card okcard">${ico('i-checkc')}<span>Вы участвуете</span></div>`
      :`<button class="btn btn-primary" style="margin-top:6px" data-act="participate:${id}">${esc(g.button)}</button>`)
      :`<div class="card" style="text-align:center;color:var(--muted)">Розыгрыш завершён</div>
        <button class="btn btn-ghost" style="margin-top:10px" data-act="open-results:${id}">${ico('i-trophy')}Смотреть итоги</button>`}`;
};

/* ---------- ВЫИГРЫШ ---------- */
ROUTES.win=({id})=>{
  const g=getGA(id); if(!g)return emptyBlock('Не найдено');
  return `<div class="center" style="min-height:auto;padding-top:10px"><div class="burst">${ico('i-trophy')}</div>
    <div class="h1">Вы выиграли</div><div class="lead" style="max-width:300px">${esc(g.prize)} · розыгрыш «${esc(g.title)}»</div></div>
    <div class="sect">Получение приза</div>
    <div class="card"><p style="font-size:13px;color:var(--muted);line-height:1.55">Подтвердите получение приза - мы свяжемся с вами в этом боте с инструкцией. Денежные призы начисляются на баланс Winline.</p></div>
    <button class="btn btn-primary" style="margin-top:12px" data-act="claim:${id}">${ico('i-checkc')}Забрать приз</button>
    <div style="height:10px"></div>
    <button class="btn btn-ghost" data-act="open-post:${id}">${ico('i-mega')}Пост с итогами</button>`;
};

/* ---------- ПРАВИЛА / FAQ ---------- */
ROUTES.rules=()=>{
  const item=(q,a)=>`<div class="faq"><b>${q}</b><p>${a}</p></div>`;
  return `<div class="h1">Правила и FAQ</div>
    <div class="lead">Как устроены розыгрыши Winline Giveaway.</div>
    ${item('Как участвовать?','Откройте розыгрыш из поста в канале, авторизуйтесь через личный кабинет Winline и выполните условия (подписка, промокод или ставка). После проверки участие подтверждается автоматически.')}
    ${item('Как выбираются победители?','Случайно среди участников, выполнивших все условия, по таймеру. Розыгрыш честный: публикуется проверочный хеш, по которому результат можно перепроверить (provably-fair).')}
    ${item('Один аккаунт - одно участие','Один Winline ID привязывается к одному Telegram. Мультиаккаунты и боты исключаются из розыгрыша.')}
    ${item('Как получить приз?','Победители получают уведомление в боте и видят приз во вкладке «Мои → Выигрыши». Денежные призы начисляются на баланс Winline, остальные - по инструкции в личке.')}
    ${item('Если не забрал приз?','Если победитель не откликнулся в отведённое время, организатор может выбрать замену.')}`;
};

/* ---------- ПРОФИЛЬ ---------- */
ROUTES.profile=()=>{
  const l=link();
  const linkRow=l.linked
    ?`<div class="prow"><div class="ci">${ico('i-shield')}</div><div class="px"><b>Winline привязан</b><span>ID ${esc(l.winlineId)}</span></div>
        <button class="btn btn-ghost btn-sm" data-act="unlink" style="width:auto">Отвязать</button></div>`
    :`<div class="prow"><div class="ci">${ico('i-link')}</div><div class="px"><b>Winline не привязан</b><span>Войдите, чтобы участвовать</span></div>
        <button class="btn btn-primary btn-sm" data-act="link" style="width:auto">Привязать</button></div>`;
  const u=tgUser();
  return `<div class="h1">Профиль</div>
    <div class="prow"><div class="ci">${ico('i-user')}</div><div class="px"><b>${esc(u.name)}</b><span>${u.uname?('Telegram '+esc(u.uname)):'Telegram'}</span></div></div>
    ${linkRow}
    <div class="prow link-row" data-act="rules"><div class="ci">${ico('i-info')}</div><div class="px"><b>Правила и FAQ</b><span>Как участвовать и получать призы</span></div><span class="arr">${ico('i-next')}</span></div>
    ${isAdmin()?`<div class="prow"><div class="ci">${ico('i-shield')}</div><div class="px"><b>Доступ: ${ROLE_LABEL[role()]}</b><span>Выдан по вашему Telegram ID</span></div></div>`:''}
    <p class="footnote">Winline Giveaway</p>`;
};

/* ---------- АДМИН: ДАШБОРД ---------- */
ROUTES.adminDash=()=>{
  const all=GA();
  const sup=role()==='super';
  const mine=sup?all:all.filter(g=>g.owner==='me');
  const groups=[['active','Идут'],['draft','Черновики'],['finished','Завершённые']];
  let body=groups.map(([st,label])=>{
    const items=mine.filter(g=>g.status===st);
    if(!items.length)return '';
    return `<div class="sect">${label} <span class="badge">${items.length}</span></div>`+items.map(g=>gaRow(g,sup)).join('');
  }).join('');
  if(!body) body=emptyBlock('Розыгрышей пока нет','Создай первый - это займёт минуту.','');
  return `<div class="h1">Админка</div>
    <button class="btn btn-primary" data-act="create">${ico('i-plus')}Создать розыгрыш</button>
    ${sup?`<button class="btn btn-ghost" style="margin-top:10px" data-act="open-team">${ico('i-users')}Команда и доступы</button>`:''}
    ${body}`;
};
function gaRow(g,showOwner){
  const st=g.status==='active'?`<span class="pill o">● идёт</span>`:g.status==='draft'?`<span class="pill d">черновик</span>`:`<span class="pill g">завершён</span>`;
  return `<div class="ga" data-act="open-manage:${g.id}">${thumbBox(g,'<span class="display" style="font-size:17px">'+esc(String(g.places>=10?g.places:(g.places||'★')))+'</span>')}
    <div class="meta"><h6>${esc(g.title)}</h6>
      <div class="ln"><span>ID <b>${esc(g.id)}</b></span>${showOwner&&g.ownerName?`<span>·</span><span>${esc(g.ownerName)}</span>`:''}<span>·</span><span>${esc(g.prizeType||'')}</span></div>
      <div class="ln" style="margin-top:4px"><span>${g.status==='finished'?'итоги '+esc(g.createdAt):'до '+dstr(g.endsAt)}</span><span style="margin-left:auto">${st}</span></div></div>
    <span class="arr">${ico('i-next')}</span></div>`;
}

/* ---------- АДМИН: УПРАВЛЕНИЕ (плитки) ---------- */
function tile(act,icon,label,cls){return `<button class="act-tile ${cls||''}" data-act="${act}">${ico(icon)}${label}</button>`;}
ROUTES.manage=({id})=>{
  const g=getGA(id); if(!g)return emptyBlock('Не найдено');
  const rng=mulberry32(hashStr(g.id+'p')); const cnt=g.status==='finished'?Math.floor(rng()*1500)+300:Math.floor(rng()*800)+40;
  const live=g.status==='active'; const paused=g.status==='paused'; const finished=g.status==='finished';
  const conds=g.conditions.map(c=>{const m=condMeta(c);return `<span class="pill d">${ico(m.icon,'sm')}${esc(m.title)}</span>`;}).join(' ')||'<span class="pill d">без условий</span>';
  let manageTiles='';
  if(live){ manageTiles=tile('pause:'+id,'i-pause','Пауза')+tile('finish:'+id,'i-stop','Завершить','danger')+tile('edit:'+id,'i-edit','Изменить')+tile('crosspost:'+id,'i-mega','Кросспост'); }
  else if(paused){ manageTiles=tile('resume:'+id,'i-bolt','Возобновить','primary')+tile('finish:'+id,'i-stop','Завершить','danger')+tile('edit:'+id,'i-edit','Изменить')+tile('crosspost:'+id,'i-mega','Кросспост'); }
  else { manageTiles=tile('duplicate:'+id,'i-copy','Дублировать')+tile('edit:'+id,'i-edit','Изменить')+tile('crosspost:'+id,'i-mega','Кросспост'); }
  return `<div class="stat-row" style="margin-bottom:12px"><span class="pill d">ID ${esc(g.id)}</span>
    <span>${live?`<span class="pill o">● идёт</span>`:paused?`<span class="pill r">на паузе</span>`:`<span class="pill g">завершён</span>`}</span></div>
    <div class="h1">${esc(g.title)}</div>
    <div class="lead">${esc(g.prize)} · ${g.places} ${plural(g.places,'место','места','мест')}</div>
    <div class="card"><div class="stat-row"><div><div style="font-size:12px;color:var(--muted)">Участников сейчас</div>
      <div class="display" style="font-size:30px">${cnt.toLocaleString('ru')}</div></div>
      <span class="pill ${live?'o':'d'}">${live?'● live':'итог'}</span></div>
      <div class="gmeta" style="margin:12px 0 0">${conds}</div></div>

    <div class="act-grid two" style="margin-top:12px">
      ${tile('open-post:'+id,'i-mega','Пост в канале')}${tile('preview:'+id,'i-eye','Как участник')}</div>

    ${finished?`<button class="btn btn-primary" style="margin-top:14px" data-act="open-results:${id}">${ico('i-trophy')}Подвести итоги</button>`:''}

    <div class="sect">Управление</div>
    <div class="act-grid two">${manageTiles}</div>

    <div class="sect">Аналитика</div>
    <button class="btn btn-ghost" data-act="open-analytics:${id}">${ico('i-chart')}Участники и выгрузка</button>`;
};

/* ---------- ИТОГИ (role-aware) ---------- */
const NAMES=['alex','maria','dmitry','nika','pro_bet','egor','sofia','kirill','vlad','anna','max_cs','lena','roman','daria','artem','ivan','olga','pavel','yana','denis'];
function maskId(rng,len){let s='';for(let i=0;i<len;i++)s+=Math.floor(rng()*10);return '···'+s;}
function genWinners(g){const rng=mulberry32(hashStr(g.id+(g.seedNonce||'')));const n=Math.min(g.places||1,12);const out=[],used=new Set();
  for(let i=0;i<n;i++){let nm;do{nm=NAMES[Math.floor(rng()*NAMES.length)]+'_'+Math.floor(rng()*90+10);}while(used.has(nm));used.add(nm);
    out.push({u:'@'+nm,wl:maskId(rng,4),tg:maskId(rng,4)});}return out;}
ROUTES.results=({id})=>{
  if(fxLoading) return skeleton('results');
  const g=getGA(id); if(!g)return emptyBlock('Не найдено');
  const admin=isAdmin();
  const w=genWinners(g); const extra=(g.places||1)-w.length;
  const seedHash=(hashStr(g.id+(g.seedNonce||''))>>>0).toString(16).padStart(8,'0');
  return `<div class="stat-row" style="margin-bottom:10px"><span class="pill d">ID ${esc(g.id)}</span>
    <span>${g.status==='finished'?`<span class="pill g">завершён</span>`:`<span class="pill o">готов к итогам</span>`}</span></div>
    <div class="h1">Итоги</div>
    <div class="lead">${esc(g.title)} · ${g.places} ${plural(g.places,'место','места','мест')}. Случайно среди выполнивших условия.</div>
    <div id="winlist">${w.map((x,i)=>`<div class="win ${i<3?'top'+(i+1):''}"><div class="num">${i+1}</div>
      <div><div class="u">${esc(x.u)}</div>${admin?`<div class="id">WL ${x.wl} · TG ${x.tg}</div>`:''}</div></div>`).join('')}</div>
    ${extra>0?`<div class="card" style="text-align:center;color:var(--muted);font-size:12.5px">… и ещё ${extra} ${plural(extra,'победитель','победителя','победителей')}</div>`:''}
    <div class="card" style="margin-top:12px"><div style="font-size:11.5px;color:var(--muted)">Проверочный хеш (provably-fair)</div>
      <div class="mono" style="font-size:13px;margin-top:4px;color:var(--brand-300)">${seedHash}</div>
      <div class="hint" style="margin-top:6px">${ico('i-info','sm')}Сид публикуется после итогов - любой может пересчитать список.</div></div>
    ${admin
      ?`<button class="btn btn-primary" style="margin-top:12px" data-act="pub-results:${id}">${ico('i-mega')}Опубликовать итоги</button>
        <div class="act-grid two" style="margin-top:10px">
          ${tile('reroll:'+id,'i-loader','Рерол')}${tile('open-analytics:'+id,'i-chart','Аналитика')}</div>`
      :`<button class="btn btn-ghost" style="margin-top:12px" data-act="open-post:${id}">${ico('i-mega')}Пост с итогами в канале</button>`}`;
};

/* ---------- АДМИН: АНАЛИТИКА (только админ) ---------- */
ROUTES.analytics=({id})=>{
  if(fxLoading) return skeleton('analytics');
  if(!isAdmin()) return emptyBlock('Недоступно','Аналитика доступна только администратору.','');
  const g=getGA(id); if(!g)return emptyBlock('Не найдено');
  const rng=mulberry32(hashStr(g.id+'a'));
  const total=Math.floor(rng()*1500)+300, passed=Math.floor(total*(0.6+rng()*0.2)), linkedN=Math.floor(total*(0.6+rng()*0.25));
  const dot=v=>v?'<span class="dotg">●</span>':'<span class="dotr">●</span>';
  const rows=[];for(let i=0;i<6;i++)rows.push({tg:maskId(rng,4),wl:maskId(rng,4),s:rng()>.15,p:rng()>.25,b:rng()>.3});
  return `<div class="h1">Аналитика</div>
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
let newAdminRole='Админ';
ROUTES.team=()=>{
  if(role()!=='super') return emptyBlock('Недоступно','Управление командой доступно супер-админу.','');
  const admins=lj(K_ADMINS,[]);
  const rows=admins.map((a,i)=>{
    const right=a.self?`<span class="pill o">вы</span>`
      :`<div style="display:flex;gap:6px;flex:0 0 auto">
          <button class="btn btn-ghost btn-sm" data-act="admrole:${i}" style="width:auto">${a.role==='Супер-админ'?'→ Админ':'→ Супер'}</button>
          <button class="btn btn-ghost btn-sm" data-act="rm-admin:${i}" style="width:auto">${ico('i-x','sm')}</button></div>`;
    return `<div class="prow"><div class="ci">${ico(a.role==='Супер-админ'?'i-shield':'i-user')}</div>
      <div class="px"><b>${esc(a.u)}</b><span>${esc(a.role)}</span></div>${right}</div>`;
  }).join('');
  return `<div class="h1">Команда</div>
    <div class="lead">Доступ по Telegram @username или ID. Админ ведёт свои розыгрыши; супер-админ видит все и управляет командой.</div>
    ${rows}
    <div class="sect">Выдать доступ</div>
    <div class="field"><label>Telegram @username или ID</label><input class="input" id="newAdmin" placeholder="@user или 123456789"></div>
    <div class="seg">
      <button class="${newAdminRole==='Админ'?'on':''}" data-act="setrole:Админ">Админ</button>
      <button class="${newAdminRole==='Супер-админ'?'on':''}" data-act="setrole:Супер-админ">Супер-админ</button></div>
    <button class="btn btn-primary" data-act="add-admin">${ico('i-plus')}Выдать доступ</button>
    <div class="hint" style="margin-top:10px">${ico('i-info','sm')}Админ - для модераторов инфлюенсеров (розыгрыши в их каналах). Супер-админ - для стаффа Winline.</div>`;
};

/* ---------- УСПЕХ ---------- */
ROUTES.published=({msg})=>`<div class="center"><div class="burst">${ico('i-checkc')}</div>
  <div class="h1">Опубликовано</div><div class="lead" style="max-width:300px">${esc(msg||'Розыгрыш создан.')}</div>
  <button class="btn btn-primary" data-act="go-admin">${ico('i-grid')}В админку</button></div>`;

/* ============================================================ КОНСТРУКТОР ============================================================ */
let draft=null;
function freshDraft(){return {text:'',image:null,button:'УЧАСТВОВАТЬ',conditions:[],places:'',pubChannels:[MAIN_CHANNEL],dateStr:'',endsAt:Date.now()+3*DAY,editId:null};}

let cstep=1;
function stepper(cur){
  const labels=['Оформление','Условия','Параметры','Итог'];
  const total=labels.length, progf=((cur-1)/(total-1)).toFixed(3);
  const nodes=labels.map((l,i)=>{const n=i+1;const cls=n<cur?'done':n===cur?'cur':'';
    return `<div class="node ${cls}"><div class="dot">${n<cur?ico('i-check','sm'):n}</div><div class="lbl">${l}</div></div>`;}).join('');
  return `<div class="steps2" style="--progf:${progf}">${nodes}</div>`;
}
function summaryHtml(){
  const d=draft, cond=d.conditions.map(c=>condMeta(c).title).join(', ')||'без условий';
  const t=(d.text||'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1');
  const rows=[['Текст',(t||'—').slice(0,42)+(t.length>42?'…':'')],['Кнопка',d.button],['Условия',cond],
    ['Мест',d.places||'—'],['Каналы',d.pubChannels.join(', ')||'—'],['Итоги',d.dateStr||'через 3 дня']];
  return `<div class="summary">${rows.map(r=>`<div class="row"><span>${r[0]}</span><b>${esc(r[1])}</b></div>`).join('')}</div>`;
}
ROUTES.constructor=()=>{
  if(!draft) draft=freshDraft();
  const head=`<div class="h1">${draft.editId?'Редактирование':'Новый розыгрыш'}</div>${stepper(cstep)}`;
  let body='';
  if(cstep===1){
    body=`<div class="sect">Оформление</div>
      <div class="upload ${draft.image?'has':''}" data-act="pick-image">${ico('i-img')}<span id="upLabel">${draft.image?'Изображение выбрано':'Выбрать обложку'}</span></div>
      <div class="field" style="margin-top:12px"><label>Текст розыгрыша</label>
        <textarea class="textarea" data-model="text" placeholder="Разыгрываем iPhone 17 Pro. Подробнее на сайте.">${esc(draft.text)}</textarea>
        <div style="margin-top:8px"><button class="btn btn-ghost btn-sm" data-act="add-link" style="width:auto">${ico('i-link','sm')}Вставить ссылку</button></div>
        <div class="hint">${ico('i-info','sm')}Премиум-эмодзи и форматирование Telegram добавятся при постинге через бота.</div></div>
      <div class="field"><label>Текст кнопки</label>
        <div class="chips" id="btnChips">${['УЧАСТВОВАТЬ','ПРИНЯТЬ УЧАСТИЕ','УЧАСТВУЮ'].map(b=>`<div class="chip ${draft.button===b?'sel':''}" data-act="pick-btn:${b}">${b}</div>`).join('')}</div>
        <input class="input" style="margin-top:8px" data-model="button" value="${esc(draft.button)}"></div>`;
  } else if(cstep===2){
    body=`<div class="sect">Условия участия <span class="badge" id="condBadge">${draft.conditions.length}</span></div>
      <div class="lead" style="margin:-2px 0 12px">Обязательных нет. Добавляйте нужные блоки.</div>
      <div id="condHost">${renderCondEditors()}</div>
      <div class="builder-add">
        <div class="add-cond" data-act="add-cond:sub"><div class="ci">${ico('i-mega','sm')}</div>Подписка на канал<span class="plus">${ico('i-plus','sm')}</span></div>
        <div class="add-cond" data-act="add-cond:promo"><div class="ci">${ico('i-ticket','sm')}</div>Регистрация по промокоду<span class="plus">${ico('i-plus','sm')}</span></div>
        <div class="add-cond" data-act="add-cond:bet"><div class="ci">${ico('i-coin','sm')}</div>Ставка / депозит<span class="plus">${ico('i-plus','sm')}</span></div>
      </div>`;
  } else if(cstep===3){
    body=`<div class="sect">Параметры</div>
      <div class="field"><label>Количество мест (победителей)</label><input class="input" type="number" inputmode="numeric" data-model="places" value="${esc(draft.places)}" placeholder="50"></div>
      <div class="field"><label>Каналы публикации</label>
        <div class="chips" id="pubChips">${pubChipsHtml()}</div>
        <div style="display:flex;gap:8px;margin-top:8px"><input class="input" id="pubNew" placeholder="@username или ссылка"><button class="btn btn-ghost icon-btn btn-sm" data-act="add-pub">＋</button></div>
        <div class="hint">${ico('i-info','sm')}Бот должен быть админом канала. Показаны недавние.</div></div>
      <div class="field"><label>Дата и время итогов</label><input class="input" data-model="dateStr" value="${esc(draft.dateStr)}" placeholder="01.07.26 18:00">
        <div style="margin-top:8px"><button class="btn btn-ghost btn-sm" data-act="pub-now" style="width:auto">${ico('i-bolt','sm')}Подвести сейчас</button></div></div>`;
  } else {
    body=`<div class="sect">Предпросмотр</div>${renderPreview()}
      <div class="sect">Проверьте перед публикацией</div>${summaryHtml()}
      <div style="height:8px"></div>
      <button class="btn btn-ghost" data-act="save-draft">${ico('i-edit')}Сохранить как черновик</button>`;
  }
  const nav=`<div class="btn-row" style="margin-top:18px">
    ${cstep>1?`<button class="btn btn-ghost" data-act="cstep-back">${ico('i-back')}Назад</button>`:`<button class="btn btn-ghost" data-act="go-admin">Отмена</button>`}
    ${cstep<4?`<button class="btn btn-primary" data-act="cstep-next">Далее${ico('i-next')}</button>`:`<button class="btn btn-primary" data-act="publish">${ico('i-bolt')}Опубликовать</button>`}</div>`;
  return head+body+nav;
};
function validateStep(n){
  if(n===1 && !draft.text.trim()){ ping('Добавьте текст розыгрыша'); return false; }
  if(n===3){ if(!draft.places||+draft.places<1){ ping('Укажите количество мест'); return false; }
    if(!draft.pubChannels.length){ ping('Выберите канал публикации'); return false; } }
  return true;
}
function pubChipsHtml(){
  const opts=Array.from(new Set([...draft.pubChannels, ...recent()]));
  return opts.map(c=>`<div class="chip ${draft.pubChannels.includes(c)?'sel':''}" data-act="toggle-pub:${c}">${ico('i-mega','sm')}${esc(c)}</div>`).join('');
}
function paintPub(){const h=$('#pubChips');if(h)h.innerHTML=pubChipsHtml();}
function renderCondEditors(){
  if(!draft.conditions.length) return `<div class="hint" style="margin-bottom:6px">${ico('i-info','sm')}Условия не добавлены - розыгрыш открыт для всех. Добавьте при необходимости.</div>`;
  return draft.conditions.map((c,i)=>{
    const m=condMeta(c); let body='';
    if(c.type==='sub'){
      const sugg=recent().filter(r=>!(c.channels||[]).includes(r));
      body=`<div class="chips" style="margin-bottom:8px">${(c.channels||[]).map((ch,ci)=>`<div class="chip sel">${esc(ch)} <span data-act="rm-chan:${i}:${ci}" style="margin-left:4px">✕</span></div>`).join('')}</div>
        ${sugg.length?`<div class="chips" style="margin-bottom:8px">${sugg.map(r=>`<div class="chip" data-act="add-chanq:${i}:${r}">+ ${esc(r)}</div>`).join('')}</div>`:''}
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
    <div class="pb"><h5>${esc(draftTitle())}</h5><p>${linkify(d.text||'Текст розыгрыша появится здесь')}</p>${sub?`<p style="margin-top:6px;color:var(--brand-300)">${esc(sub)}</p>`:''}</div>
    <div class="pc">${esc(d.button)}</div></div>`;
}
function draftTitle(){const f=(draft.text||'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').split('\n')[0].trim();return f?(f.length>40?f.slice(0,40)+'…':f):'Розыгрыш';}
function paintConds(){const host=$('#condHost');if(host)host.innerHTML=renderCondEditors();const b=$('#condBadge');if(b&&draft)b.textContent=draft.conditions.length;}

/* ---------- model update ---------- */
function modelUpdate(key,val,node){ if(!draft)return; if(['text','button','places','dateStr'].includes(key)){ draft[key]=val; refreshPreviewLive(); } }
function refreshPreviewLive(){ const host=$('.preview'); if(host&&draft) host.outerHTML=renderPreview(); }

/* ============================================================ ОБРАБОТЧИК ============================================================ */
function handle(act,arg,node){
  haptic();
  switch(act){
    case 'start': localStorage.setItem(K_ONB,'1'); setTab('mine'); break;
    case 'open-ga': openFx({name:'giveaway',params:{id:arg}}); break;
    case 'open-win': push({name:'win',params:{id:arg}}); break;
    case 'preview': openFx({name:'giveaway',params:{id:arg}}); break;
    case 'open-manage': push({name:'manage',params:{id:arg}}); break;
    case 'open-results': openFx({name:'results',params:{id:arg}}); break;
    case 'open-analytics': openFx({name:'analytics',params:{id:arg}}); break;
    case 'cstep-next': if(validateStep(cstep)){ cstep=Math.min(4,cstep+1); render(); } break;
    case 'cstep-back': cstep=Math.max(1,cstep-1); render(); break;
    case 'open-team': push({name:'team'}); break;
    case 'rules': push({name:'rules'}); break;
    case 'open-post': { const g=getGA(arg); const u=g&&(g.postUrl||('https://t.me/'+((g.pubChannels&&g.pubChannels[0]||'').replace('@','')))); if(u)openTg(u); ping('Открываем пост в канале'); break; }
    case 'go-admin': setTab('admin'); break;

    case 'seg': mineSeg=arg; render(); break;
    case 'role': setRole(arg); ping('Роль: '+ROLE_LABEL[arg]); setTab(role()==='user'?'mine':'admin'); break;
    case 'link': case 'unlink': toggleLink(act); break;

    case 'participate': participate(arg); break;
    case 'claim': ping('Заявка на приз отправлена'); break;

    case 'create': draft=freshDraft(); cstep=1; push({name:'constructor'}); break;
    case 'edit': editGiveaway(arg); break;
    case 'add-link': linkSheet(); break;
    case 'pick-image': $('#fileInput').click(); break;
    case 'pick-btn': draft.button=arg; $$('#btnChips .chip').forEach(c=>c.classList.toggle('sel',c.dataset.act===`pick-btn:${arg}`)); { const bi=$('input[data-model="button"]'); if(bi)bi.value=arg; } refreshPreviewLive(); break;
    case 'toggle-pub': { const i=draft.pubChannels.indexOf(arg); if(i>=0){ if(draft.pubChannels.length>1) draft.pubChannels.splice(i,1); } else draft.pubChannels.push(arg); paintPub(); break; }
    case 'add-pub': { const inp=$('#pubNew'); const v=normChan(inp&&inp.value); if(v){ if(!draft.pubChannels.includes(v))draft.pubChannels.push(v); addRecent([v]); if(inp)inp.value=''; paintPub(); } break; }
    case 'pub-now': draft.dateStr='Сейчас'; { const di=$('input[data-model="dateStr"]'); if(di)di.value='Сейчас'; } ping('Публикация сразу'); break;
    case 'add-cond': addCond(arg); break;
    case 'rm-cond': draft.conditions.splice(+arg,1); paintConds(); break;
    case 'add-chan': addChan(+arg); break;
    case 'add-chanq': { const [i,ch]=arg.split(':'); const a=draft.conditions[+i]; if(a&&!a.channels.includes(ch))a.channels.push(ch); paintConds(); break; }
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

    case 'setrole': newAdminRole=arg; render(); break;
    case 'add-admin': addAdmin(); break;
    case 'admrole': { const a=lj(K_ADMINS,[]); if(a[+arg]&&!a[+arg].self){ a[+arg].role=a[+arg].role==='Супер-админ'?'Админ':'Супер-админ'; sj(K_ADMINS,a); render(); ping('Роль изменена'); } break; }
    case 'rm-admin': { const a=lj(K_ADMINS,[]); if(a[+arg]&&!a[+arg].self){ a.splice(+arg,1); sj(K_ADMINS,a); render(); ping('Доступ отозван'); } break; }

    case 'modal-close': closeSheet(); break;
  }
}

/* ---------- реализация ---------- */
function toggleLink(act){ if(act==='unlink'){ sj(K_LINK,{linked:false,winlineId:''}); render(); ping('Winline отвязан'); } else openAuth(null); }
function addCond(type){ const c=type==='sub'?{type:'sub',channels:[MAIN_CHANNEL]}:type==='promo'?{type:'promo',code:''}:{type:'bet',amount:'',category:'Все события',link:''}; draft.conditions.push(c); paintConds(); }
function addChan(i){ const inp=$(`input[data-chan="${i}"]`); if(!inp)return; const v=normChan(inp.value); if(!v)return; draft.conditions[i].channels.push(v); paintConds(); }
function linkSheet(){
  openSheet(`<h3>Вставить ссылку</h3><p>Текст ссылки и адрес. В тексте появится кликабельная ссылка.</p>
    <div class="field"><label>Текст</label><input class="input" id="lnText" placeholder="Подробнее"></div>
    <div class="field"><label>URL</label><input class="input" id="lnUrl" placeholder="https://winline.ru/..."></div>
    <button class="btn btn-primary" id="lnGo">Вставить</button>
    <div style="height:8px"></div><button class="btn btn-ghost" data-act="modal-close">Отмена</button>`);
  $('#lnGo').onclick=()=>{ const t=($('#lnText').value||'ссылка').trim(); let u=($('#lnUrl').value||'').trim(); if(!u){closeSheet();return;} if(!/^https?:\/\//i.test(u))u='https://'+u;
    draft.text=(draft.text?draft.text+' ':'')+`[${t}](${u})`; const ta=$('textarea[data-model="text"]'); if(ta)ta.value=draft.text; refreshPreviewLive(); closeSheet(); haptic(); };
}
function publish(asDraft){
  if(!asDraft){
    if(!draft.text.trim()){ping('Добавьте текст розыгрыша');return;}
    if(!draft.places||+draft.places<1){ping('Укажите количество мест');return;}
    if(!draft.pubChannels.length){ping('Выберите канал публикации');return;}
  }
  const arr=GA();
  if(draft.editId){ const g=arr.find(x=>x.id===draft.editId); if(g) Object.assign(g,buildFromDraft(g.id,g.createdAt)); setGA(arr); collectRecent(); push({name:'published',params:{msg:'Изменения сохранены.'}}); draft=null; return; }
  const id='GA-'+(2061+arr.length+Math.floor(Math.random()*40));
  const g=buildFromDraft(id,today()); g.status=asDraft?'draft':'active';
  arr.unshift(g); setGA(arr); collectRecent();
  push({name:'published',params:{msg:asDraft?'Черновик сохранён.':`Розыгрыш ушёл в ${g.pubChannels.join(', ')}.`}});
  draft=null;
}
function collectRecent(){ const subs=draft.conditions.filter(c=>c.type==='sub').reduce((a,c)=>a.concat(c.channels||[]),[]); addRecent([...draft.pubChannels,...subs]); }
function buildFromDraft(id,createdAt){
  let endsAt=draft.endsAt;
  const m=(draft.dateStr||'').match(/(\d{2})\.(\d{2})\.(\d{2})\s+(\d{1,2}):(\d{2})/);
  if(m) endsAt=new Date(2000+ +m[3],+m[2]-1,+m[1],+m[4],+m[5]).getTime();
  else if(draft.dateStr==='Сейчас') endsAt=Date.now()+DAY;
  const ch=(draft.pubChannels[0]||'').replace('@','');
  return {id,title:draftTitle(),prize:draftTitle(),prizeType:'Приз',coverLabel:draftTitle(),
    text:draft.text,image:draft.image,button:draft.button,conditions:JSON.parse(JSON.stringify(draft.conditions)),
    places:+draft.places||1,pubChannels:draft.pubChannels.slice(),
    postUrl: ch?('https://t.me/'+ch):'', /* TODO:BACKEND - точная ссылка на пост после публикации */
    endsAt,createdAt,status:'active',owner:'me',ownerName:'@artem'};
}
function editGiveaway(id){
  const g=getGA(id); if(!g)return;
  draft=freshDraft(); draft.text=g.text;draft.image=g.image;draft.button=g.button;
  draft.conditions=JSON.parse(JSON.stringify(g.conditions));draft.places=g.places;draft.pubChannels=g.pubChannels.slice();
  draft.dateStr=dstr(g.endsAt);draft.endsAt=g.endsAt;draft.editId=id; cstep=1; push({name:'constructor'});
}
function changeStatus(id,st,msg){const a=GA();const g=a.find(x=>x.id===id);if(g){g.status=st;setGA(a);}ping(msg);render();}
function duplicate(id){const g=getGA(id);if(!g)return;draft=freshDraft();draft.text=g.text;draft.image=g.image;draft.button=g.button;
  draft.conditions=JSON.parse(JSON.stringify(g.conditions));draft.places=g.places;draft.pubChannels=g.pubChannels.slice();
  cstep=1; push({name:'constructor'});ping('Создана копия - отредактируйте и опубликуйте');}
function crosspost(id){
  const opts=Array.from(new Set([MAIN_CHANNEL,...recent()]));
  openSheet(`<h3>Кросспостинг</h3><p>Выберите каналы, где наш бот админ - туда уйдёт карточка розыгрыша.</p>
    <div class="chips" id="cpChips">${opts.map(c=>`<div class="chip block" data-cp="${c}">${ico('i-mega','sm')}${esc(c)}</div>`).join('')}</div>
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
function addAdmin(){const el=$('#newAdmin');if(!el||!el.value.trim())return;const a=lj(K_ADMINS,[]);let v=el.value.trim();if(/^\d+$/.test(v))v='ID '+v;else if(!v.startsWith('@'))v='@'+v;a.push({u:v,role:newAdminRole});sj(K_ADMINS,a);render();ping(newAdminRole+' выдан');}

/* ---------- участие + авторизация (заглушки) ---------- */
function participate(id){ const g=getGA(id); if(!g)return; if(!link().linked){ openAuth(g); return; } runChecks(g); }
function openAuth(g){
  openSheet(`<h3>Вход в Winline</h3>
    <p>Войдите в личный кабинет, чтобы привязать аккаунт${g?' и подтвердить участие':''}.</p>
    <div class="field"><label>Логин / ID Winline</label><input class="input" id="wlLogin" placeholder="Ваш Winline ID"></div>
    <div class="field"><label>Пароль</label><input class="input" type="password" id="wlPass" placeholder="••••••••"></div>
    <button class="btn btn-primary" id="wlGo">${g?'Войти и проверить':'Войти и привязать'}</button>
    <div style="height:8px"></div><button class="btn btn-ghost" data-act="modal-close">Отмена</button>`);
  $('#wlGo').onclick=()=>{ haptic();
    const v=($('#wlLogin').value||'').trim();
    // TODO:BACKEND - реальная авторизация Winline + проверка 1 WL = 1 TG
    sj(K_LINK,{linked:true,winlineId:v.startsWith('WL')?v:('WL-'+Math.floor(Math.random()*9e6+1e6))});
    if(g) runChecks(g); else { closeSheet(); render(); ping('Winline привязан'); }
  };
}
function runChecks(g){
  const items=[]; g.conditions.forEach(c=>items.push(condMeta(c).title)); if(!items.length) items.push('Привязка аккаунта');
  openSheet(`<h3>Проверяем условия…</h3><p>Привязываем Winline ID к Telegram и проверяем выполнение.</p>
    <div class="check-list" id="checks">${items.map(t=>`<div class="check wait"><span>${ico('i-clock','sm')}</span>${esc(t)}<span class="st">${ico('i-loader','sm spin')}</span></div>`).join('')}</div>`);
  const rows=$$('#checks .check'); let i=0;
  const iv=setInterval(()=>{ if(i>=rows.length){clearInterval(iv);finishParticipate(g);return;}
    rows[i].classList.remove('wait');rows[i].classList.add('ok');rows[i].querySelector('.st').innerHTML=ico('i-checkc','sm');i++;},600);
}
function finishParticipate(g){
  const my=MY(); if(!my.entered.includes(g.id)){my.entered.push(g.id);sj(K_MY,my);}
  setTimeout(()=>{
    openSheet(`<div class="center" style="min-height:auto;padding:8px 0"><div class="burst">${ico('i-checkc')}</div>
      <h3>Вы участвуете</h3><p style="text-align:center">Все условия выполнены. Удачи в розыгрыше «${esc(g.title)}»!</p>
      <button class="btn btn-primary" data-act="modal-close">Отлично</button></div>`);
  },350);
  setTimeout(()=>{ if(state.stack[state.stack.length-1].name==='giveaway') render(); },360);
}

/* ---------- empty ---------- */
function emptyBlock(title,desc,cta){return `<div class="empty">${ico('i-gift')}<div class="et">${esc(title)}</div>${desc?`<div class="ed">${esc(desc)}</div>`:''}${cta||''}</div>`;}

/* ---------- file input ---------- */
$('#fileInput').addEventListener('change',e=>{
  const f=e.target.files[0]; if(!f||!draft)return; const r=new FileReader();
  r.onload=()=>{draft.image=r.result; const l=$('#upLabel'); if(l){l.textContent='Изображение выбрано'; l.closest('.upload').classList.add('has');} refreshPreviewLive();};
  r.readAsDataURL(f); e.target.value='';
});

/* ---------- spotlight на карточках (десктоп: есть hover) ---------- */
if (window.matchMedia && matchMedia('(hover:hover)').matches){
  document.addEventListener('pointermove',(e)=>{
    const c=e.target.closest('.gcard,.ga,.act-tile,.card,.kpi,.prow'); if(!c)return;
    const r=c.getBoundingClientRect();
    c.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
    c.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
  },{passive:true});
}

/* ---------- таймеры ---------- */
setInterval(()=>{ $$('[data-ends]').forEach(elm=>{const t=+elm.dataset.ends; elm.textContent=Date.now()>=t?'завершён':timeLeft(t);}); },1000);

/* ---------- deep-link ---------- */
function startParam(){
  try{ if(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.start_param) return tg.initDataUnsafe.start_param; }catch(e){}
  const m=(location.hash||'').match(/ga=([\w-]+)/)||(location.search||'').match(/ga=([\w-]+)/);
  return m?m[1]:null;
}

/* ---------- init ---------- */
seed();
function applyRoute(){
  const sp=startParam();
  if(sp&&getGA(sp)){ state.tab='mine'; state.stack=[tabRoot('mine'),{name:'giveaway',params:{id:sp}}]; render(); return; }
  if(localStorage.getItem(K_ONB)){ setTab('mine'); return; }
  state.tab=null; state.stack=[{name:'onboarding'}]; render();
}
(async function boot(){
  // Роль - строго по TG ID с бэкенда. Дефолт: обычный пользователь (без доступа).
  if(window.WL_API && WL_API.enabled()){
    try{ const me=await WL_API.me(); localStorage.setItem(K_ROLE, ({SUPER:'super',ADMIN:'admin'}[me.role]||'user'));
      if(me.linked) sj(K_LINK,{linked:true,winlineId:me.winlineId}); }
    catch(e){ localStorage.setItem(K_ROLE,'user'); }
  } else {
    // Превью админки без бэкенда (только для разработки): ?preview=super|admin.
    // В проде, когда задан apiBase, этот параметр игнорируется - роль приходит с сервера.
    const m=(location.hash+' '+location.search).match(/preview=(admin|super)/);
    localStorage.setItem(K_ROLE, m ? m[1] : 'user');
  }
  applyRoute();
})();
