/* ============================================================
   WINLINE GIVEAWAY — mini app logic
   Демо-версия: хранение в localStorage. Точки интеграции с
   бэкендом (Winline API / проверка подписок / Google Sheets)
   помечены комментариями TODO:BACKEND.
   ============================================================ */
'use strict';

/* ---------- Telegram WebApp ---------- */
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
function haptic(type='light'){ try{ tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred(type); }catch(e){} }
if (tg) {
  try {
    tg.ready(); tg.expand();
    tg.setHeaderColor('#121212'); tg.setBackgroundColor('#121212');
    tg.BackButton.onClick(goBack);
  } catch(e){}
}

/* ---------- helpers ---------- */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const el = (tag,cls,html)=>{const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e;};
const ico = id=>`<svg class="icon"><use href="#${id}"/></svg>`;
const icoSm = id=>`<svg class="icon sm"><use href="#${id}"/></svg>`;
const esc = s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* seeded PRNG, чтобы итоги/аналитика были стабильны для одного розыгрыша */
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* ---------- store ---------- */
const KEY='wl_giveaways_v1';
function load(){ try{return JSON.parse(localStorage.getItem(KEY))||[];}catch(e){return [];} }
function save(arr){ localStorage.setItem(KEY,JSON.stringify(arr)); }
function seedIfEmpty(){
  let a=load(); if(a.length) return a;
  a=[
    {id:'GA-2041',title:'Розыгрыш 50 000 ₽',text:'Разыгрываем 50 000 ₽ среди подписчиков! Условия — ниже 👇',
     button:'УЧАСТВОВАТЬ',channels:['@winline_official','@winline_esports'],promo:'ESPORTS2026',
     bet:500,category:'Киберспорт',catLink:'',places:50,pubChannel:'@winline_official',
     date:'01.07.26 18:00',createdAt:'15.06.26',status:'finished'},
    {id:'GA-2050',title:'iPhone 17 Pro',text:'Разыгрываем iPhone 17 Pro! Сделай ставку и участвуй 🎁',
     button:'УЧАСТВУЮ',channels:['@winline_official'],promo:'IPHONE',
     bet:1000,category:'Все события',catLink:'',places:1,pubChannel:'@winline_official',
     date:'20.06.26 20:00',createdAt:'12.06.26',status:'active'}
  ];
  save(a); return a;
}

/* ---------- навигация ---------- */
let navStack=['menu'];
const backBtn=$('#backBtn');
function syncBack(){
  const show = navStack.length>1;
  backBtn.classList.toggle('show',show);
  if(tg){ try{ show?tg.BackButton.show():tg.BackButton.hide(); }catch(e){} }
}
function show(name,push=true){
  $$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===name));
  if(push){ if(navStack[navStack.length-1]!==name) navStack.push(name); }
  $('#main').scrollTop=0; window.scrollTo(0,0);
  syncBack();
  if(name==='create') initWizard();
  if(name==='my') renderMy();
  if(name==='menu') renderMenu();
}
function goBack(){ if(navStack.length>1){ navStack.pop(); show(navStack[navStack.length-1],false);} }
backBtn.addEventListener('click',()=>{haptic();goBack();});
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-go]'); if(!t)return; haptic(); show(t.dataset.go);
});

/* ---------- toast ---------- */
const toast=$('#toast'),toastMsg=$('#toastMsg');
let toastT;
function ping(msg){ toastMsg.textContent=msg; toast.classList.add('show'); haptic('medium');
  clearTimeout(toastT); toastT=setTimeout(()=>toast.classList.remove('show'),2400); }

/* ---------- меню ---------- */
function renderMenu(){
  const a=load(); $('#activeCount').textContent=a.filter(g=>g.status==='active').length;
}

/* ============================================================
   ВИЗАРД СОЗДАНИЯ
   ============================================================ */
const TOTAL=9;
let step=1, draft=null;
function freshDraft(){ return {text:'',image:null,button:'УЧАСТВОВАТЬ',channels:['@winline_official'],
  promo:'',bet:'',category:'Киберспорт',catLink:'',places:'',pubChannel:'@winline_official',date:''}; }

function initWizard(){
  draft=freshDraft(); step=1;
  // сброс полей
  $('#f-text').value=''; $('#f-btn-custom').value=''; $('#f-channel').value='';
  $('#f-promo').value=''; $('#f-bet').value=''; $('#f-catlink').value='';
  $('#f-places').value=''; $('#f-date').value='';
  $('#uploadLabel').textContent='Нажмите, чтобы выбрать изображение';
  $('#uploader').classList.remove('has');
  // дефолтные чипы
  setSingle('btn','УЧАСТВОВАТЬ'); setSingle('cat','КИБЕРСПОРТ'); setSingle('pub','@winline_official');
  $('#catLink').style.display='none';
  renderChannels(); buildSteps(); showStep(1);
}
function buildSteps(){
  const host=$('#steps'); host.innerHTML='';
  for(let i=1;i<=TOTAL;i++){ const s=el('i','s'); s.dataset.i=i; host.appendChild(s); }
}
function paintSteps(){
  $$('#steps .s').forEach(s=>{const i=+s.dataset.i; s.classList.toggle('done',i<step); s.classList.toggle('cur',i===step);});
}
function showStep(n){
  step=n;
  $$('.wstep').forEach(w=>w.hidden=(+w.dataset.step!==n));
  paintSteps();
  $('#wBack').innerHTML = n===1 ? ico('i-back')+'Отмена' : ico('i-back')+'Назад';
  $('#wNext').innerHTML = n===TOTAL ? ico('i-bolt')+'Опубликовать' : 'Далее'+ico('i-next');
  if(n===9) renderReview();
  $('#main').scrollTop=0; window.scrollTo(0,0);
}

/* чипы single-select */
function setSingle(group,label){
  $$(`.chips[data-single="${group}"] .chip`).forEach(c=>{
    c.classList.toggle('sel', c.textContent.trim()===label);
  });
}
$$('.chips[data-single]').forEach(grp=>{
  grp.addEventListener('click',e=>{
    const c=e.target.closest('.chip'); if(!c)return; haptic();
    grp.querySelectorAll('.chip').forEach(x=>x.classList.remove('sel')); c.classList.add('sel');
    const g=grp.dataset.single, val=c.textContent.trim();
    if(g==='btn') draft.button=val;
    if(g==='pub') draft.pubChannel=val;
    if(g==='cat'){ draft.category=val; $('#catLink').style.display = val==='ДРУГОЕ'?'block':'none'; }
  });
});

/* каналы */
function renderChannels(){
  const host=$('#channel-list'); host.innerHTML='';
  draft.channels.forEach((ch,idx)=>{
    const def = idx===0;
    const row=el('div','card');
    row.style.cssText='display:flex;align-items:center;gap:10px;padding:12px 14px;margin-bottom:8px';
    row.innerHTML = `<span class="pill ${def?'o':'g'}">${def?'по умолч.':'✓ админ'}</span>
      <b style="font-size:13.5px">${esc(ch)}</b>`;
    if(!def){ const x=el('span','',icoSm('i-x')); x.style.cssText='margin-left:auto;color:var(--muted-2);cursor:pointer';
      x.onclick=()=>{haptic();draft.channels.splice(idx,1);renderChannels();}; row.appendChild(x);}
    host.appendChild(row);
  });
}
$('#addChannel').addEventListener('click',()=>{
  const v=$('#f-channel').value.trim(); if(!v)return;
  // TODO:BACKEND — проверка, что бот админ канала
  draft.channels.push(v.startsWith('@')||v.startsWith('http')?v:'@'+v);
  $('#f-channel').value=''; renderChannels(); haptic();
});

/* загрузка картинки (превью локально) */
$('#fileInput').addEventListener('change',e=>{
  const f=e.target.files[0]; if(!f)return;
  const r=new FileReader(); r.onload=()=>{ draft.image=r.result;
    $('#uploadLabel').textContent=f.name; $('#uploader').classList.add('has'); }; r.readAsDataURL(f);
});

/* захват полей шага */
function capture(n){
  if(n===1) draft.text=$('#f-text').value.trim();
  if(n===2){ const cu=$('#f-btn-custom').value.trim(); if(cu) draft.button=cu; }
  if(n===4) draft.promo=$('#f-promo').value.trim();
  if(n===5) draft.bet=$('#f-bet').value.trim();
  if(n===6) draft.catLink=$('#f-catlink').value.trim();
  if(n===7) draft.places=$('#f-places').value.trim();
  if(n===9) draft.date=$('#f-date').value.trim();
}
/* лёгкая валидация */
function validate(n){
  if(n===1 && !draft.text){ ping('Добавьте текст розыгрыша'); return false; }
  if(n===7 && (!draft.places || +draft.places<1)){ ping('Укажите количество мест'); return false; }
  return true;
}

$('#wNext').addEventListener('click',()=>{
  capture(step); if(!validate(step)) return; haptic();
  if(step<TOTAL) showStep(step+1); else publish();
});
$('#wBack').addEventListener('click',()=>{
  capture(step); haptic();
  if(step>1) showStep(step-1); else show('menu');
});

/* дата / сейчас */
$('#nowBtn').addEventListener('click',()=>{ $('#f-date').value='Сейчас'; draft.date='Сейчас'; haptic();
  $('#nowBtn').classList.add('btn-primary'); });
$('#schedBtn').addEventListener('click',()=>{ $('#f-date').focus(); haptic(); });

/* предпросмотр + сводка (шаг 9) */
function renderReview(){
  const d=draft;
  const cond=[];
  if(d.places) cond.push(`${d.places} ${plural(+d.places,'победитель','победителя','победителей')}`);
  if(d.channels.length) cond.push(`подписка (${d.channels.length})`);
  if(d.bet) cond.push(`ставка от ${d.bet} ₽`);
  if(d.category) cond.push(d.category.toLowerCase());
  if(d.promo) cond.push(`промокод ${d.promo}`);
  const media = d.image ? `<img src="${d.image}" alt="">` : 'Изображение розыгрыша';
  $('#pv-host').innerHTML = `
    <div class="preview">
      <div class="pv-media">${d.image?'':'<span class="pv-tag">'+icoSm('i-gift')+'Розыгрыш</span>'}${media}</div>
      <div class="pv-body"><h5>${esc(title(d))}</h5><p>${esc(d.text)}</p></div>
      <div class="pv-cta">${esc(d.button)}</div>
    </div>`;
  const rows=[
    ['Каналы', d.channels.length+' '+plural(d.channels.length,'канал','канала','каналов')],
    ['Промокод', d.promo||'—'],
    ['Ставка', d.bet?('от '+d.bet+' ₽ · '+d.category):d.category],
    ['Мест', d.places||'—'],
    ['Публикация', d.pubChannel],
    ['Итоги', d.date||'—']
  ];
  $('#summary-host').innerHTML = rows.map(r=>`<div class="row"><span>${r[0]}</span><b>${esc(r[1])}</b></div>`).join('');
}
function title(d){ const f=(d.text||'').split('\n')[0].trim(); return f? (f.length>40?f.slice(0,40)+'…':f) : 'Розыгрыш'; }
function plural(n,a,b,c){ n=Math.abs(n)%100; const n1=n%10; if(n>10&&n<20)return c; if(n1>1&&n1<5)return b; if(n1===1)return a; return c; }

/* публикация */
function publish(){
  capture(9);
  const arr=load();
  const id='GA-'+(2060+arr.length+Math.floor(Math.random()*30));
  const g={ id, title:title(draft), text:draft.text, image:draft.image, button:draft.button,
    channels:draft.channels.slice(), promo:draft.promo, bet:draft.bet, category:draft.category,
    catLink:draft.catLink, places:+draft.places||1, pubChannel:draft.pubChannel,
    date:draft.date||'Сейчас', createdAt:today(), status:'active' };
  arr.unshift(g); save(arr);
  // TODO:BACKEND — отправка карточки в Telegram-канал, планирование итогов
  $('#pubMsg').textContent = `Карточка ушла в ${g.pubChannel}. Итоги — ${g.date==='Сейчас'?'по готовности':g.date}.`;
  show('published');
}
function today(){ const d=new Date(); const p=n=>String(n).padStart(2,'0');
  return `${p(d.getDate())}.${p(d.getMonth()+1)}.${String(d.getFullYear()).slice(2)}`; }

/* ============================================================
   МОИ РОЗЫГРЫШИ
   ============================================================ */
function renderMy(){
  const arr=load(); const host=$('#my-host');
  if(!arr.length){ host.innerHTML=`<div class="empty">${ico('i-gift')}<div>Пока нет розыгрышей</div>
    <div style="margin-top:14px"><button class="btn btn-primary" data-go="create">${ico('i-plus')}Создать первый</button></div></div>`; return; }
  host.innerHTML = arr.map(g=>{
    const st = g.status==='finished' ? `<span class="pill g">завершён</span>` : `<span class="pill o">● идёт</span>`;
    const thumb = g.places>=10? g.places : (g.places||'★');
    return `<div class="ga" data-open="${g.id}">
      <div class="thumb">${esc(thumb)}</div>
      <div class="meta">
        <h6>${esc(g.title)}</h6>
        <div class="ln"><span>ID <b>${esc(g.id)}</b></span><span>·</span><span>${g.bet?('<b>'+esc(g.bet)+'₽</b> '):''}${esc((g.category||'').toLowerCase())}</span></div>
        <div class="ln" style="margin-top:4px"><span>${esc(g.createdAt)} — ${esc(g.date)}</span><span style="margin-left:auto">${st}</span></div>
      </div>
      <span class="arr">${ico('i-next')}</span>
    </div>`;
  }).join('');
  $$('[data-open]',host).forEach(c=>c.onclick=()=>{haptic();openResults(c.dataset.open);});
}

/* ============================================================
   ИТОГИ
   ============================================================ */
const NAMES=['alex','maria','dmitry','nika','pro_bet','egor','sofia','kirill','vlad','anna','max_cs','lena',
  'roman','daria','artem','ivan','olga','pavel','yana','denis','timur','kate','sergey','mila'];
function maskId(rng,len){ let s=''; for(let i=0;i<len;i++) s+=Math.floor(rng()*10); return '···'+s; }
function genWinners(g){
  const rng=mulberry32(hashStr(g.id)); const n=Math.min(g.places||1, 12); const out=[];
  const used=new Set();
  for(let i=0;i<n;i++){ let nm; do{ nm=NAMES[Math.floor(rng()*NAMES.length)]+'_'+Math.floor(rng()*90+10);}while(used.has(nm)); used.add(nm);
    out.push({u:'@'+nm, wl:maskId(rng,4), tg:maskId(rng,4)}); }
  return out;
}
let currentId=null;
function openResults(id){ currentId=id; renderResults(id); show('results'); }
function renderResults(id){
  const g=load().find(x=>x.id===id); if(!g)return;
  const winners=genWinners(g); const extra=(g.places||1)-winners.length;
  const st = g.status==='finished' ? `<span class="pill g">завершён</span>` : `<span class="pill o">● идёт</span>`;
  $('#results-host').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <span class="pill d">ID ${esc(g.id)}</span><span style="margin-left:auto">${st}</span></div>
    <div class="h1">${ico('i-trophy')} Итоги розыгрыша</div>
    <div class="lead">${esc(g.title)} · ${g.places} ${plural(g.places,'место','места','мест')}. Победители выбраны случайно среди участников, выполнивших все условия.</div>
    <div id="winlist">${winners.map((w,i)=>`
      <div class="win ${i<3?'top'+(i+1):''}"><div class="num">${i+1}</div>
        <div><div class="u">${esc(w.u)}</div><div class="id">WL ${w.wl} · TG ${w.tg}</div></div></div>`).join('')}
    </div>
    ${extra>0?`<div class="card" style="text-align:center;color:var(--muted);font-size:12.5px">… и ещё ${extra} ${plural(extra,'победитель','победителя','победителей')}</div>`:''}
    <button class="btn btn-primary" style="margin-top:14px" id="pubResults">${ico('i-mega')}Опубликовать итоги в канал</button>
    <div style="height:10px"></div>
    <button class="btn btn-ghost" id="reroll">${ico('i-loader')}Перекрутить победителей</button>
    <div style="height:10px"></div>
    <button class="btn btn-ghost" data-go="analytics" id="toAnalytics">${ico('i-chart')}Открыть аналитику</button>
    <div style="height:10px"></div>
    <button class="btn btn-ghost" id="toParticipant">${ico('i-eye')}Как видит участник</button>`;
  $('#pubResults').onclick=()=>{haptic();ping('Итоги опубликованы в '+g.pubChannel);
    const a=load(); const gg=a.find(x=>x.id===id); if(gg){gg.status='finished';save(a);} renderResults(id);};
  $('#reroll').onclick=()=>{ haptic('heavy'); rerollAnim(id); };
  $('#toAnalytics').onclick=()=>{haptic();openAnalytics(id);};
  $('#toParticipant').onclick=()=>{haptic();openParticipant(id);};
}
/* анимация перекрутки (визуальная) */
function rerollAnim(id){
  const list=$('#winlist'); if(!list)return; const g=load().find(x=>x.id===id);
  let ticks=0; const t=setInterval(()=>{
    $$('.win .u',list).forEach(u=>{u.textContent='@'+NAMES[Math.floor(Math.random()*NAMES.length)]+'_'+Math.floor(Math.random()*90+10);});
    if(++ticks>10){ clearInterval(t); renderResults(id); ping('Победители перевыбраны'); }
  },70);
}

/* ============================================================
   АНАЛИТИКА
   ============================================================ */
function openAnalytics(id){ currentId=id; renderAnalytics(id); show('analytics'); }
function renderAnalytics(id){
  const g=load().find(x=>x.id===id); if(!g)return;
  const rng=mulberry32(hashStr(g.id+'a'));
  const total=Math.floor(rng()*1500)+300;
  const passed=Math.floor(total*(0.6+rng()*0.2));
  const linked=Math.floor(total*(0.6+rng()*0.25));
  const rows=[]; for(let i=0;i<6;i++){ rows.push({tg:maskId(rng,4),wl:maskId(rng,4),
    sub:rng()>0.15,promo:rng()>0.25,bet:rng()>0.3}); }
  const dot=v=>v?'<span class="dotg">●</span>':'<span class="dotr">●</span>';
  $('#analytics-host').innerHTML = `
    <div class="h1">${ico('i-chart')} Аналитика</div>
    <div class="lead">${esc(g.id)} · ${esc(g.title)}. Данные синхронизируются с Google Таблицей.</div>
    <div class="kpis">
      <div class="kpi"><div class="v o">${total.toLocaleString('ru')}</div><div class="k">Всего участников</div></div>
      <div class="kpi"><div class="v g">${passed.toLocaleString('ru')}</div><div class="k">Прошли все условия</div></div>
      <div class="kpi"><div class="v">${linked.toLocaleString('ru')}</div><div class="k">Привязали Winline ID</div></div>
      <div class="kpi"><div class="v">${g.places}</div><div class="k">Победителей</div></div>
    </div>
    <div class="eyebrow">Участники</div>
    <div class="card" style="padding:8px 12px;overflow-x:auto">
      <table class="tbl"><tr><th>TG</th><th>WL ID</th><th>Подп.</th><th>Промо</th><th>Ставка</th></tr>
      ${rows.map(r=>`<tr><td>${r.tg}</td><td>${r.wl}</td><td>${dot(r.sub)}</td><td>${dot(r.promo)}</td><td>${dot(r.bet)}</td></tr>`).join('')}
      </table>
    </div>
    <div class="hint" style="gap:16px"><span><span class="dotg">●</span> выполнено</span><span><span class="dotr">●</span> не выполнено</span></div>
    <button class="btn btn-primary" style="margin-top:14px" id="exportBtn">${ico('i-sheet')}Выгрузить в Google Sheets</button>`;
  // TODO:BACKEND — реальная выгрузка через Google Sheets API
  $('#exportBtn').onclick=()=>{haptic();ping('Данные выгружены в Google Sheets');};
}

/* ============================================================
   ПРЕДПРОСМОТР УЧАСТНИКА + авторизация
   ============================================================ */
function openParticipant(id){ currentId=id; renderParticipant(id); show('participant'); }
function renderParticipant(id){
  const g=load().find(x=>x.id===id); if(!g)return;
  const media=g.image?`<img src="${g.image}" alt="">`:'Изображение розыгрыша';
  $('#participant-host').innerHTML=`
    <div class="preview">
      <div class="pv-media">${g.image?'':'<span class="pv-tag">'+icoSm('i-gift')+'Розыгрыш</span>'}${media}</div>
      <div class="pv-body"><h5>${esc(g.title)}</h5><p>${esc(g.text)}</p></div>
    </div>
    <div class="eyebrow">Условия участия</div>
    <div class="check-list">
      ${g.channels.map(c=>`<div class="check"><span>${icoSm('i-mega')}</span>Подписка ${esc(c)}<span class="st">${icoSm('i-info')}</span></div>`).join('')}
      ${g.promo?`<div class="check"><span>${icoSm('i-ticket')}</span>Промокод ${esc(g.promo)}<span class="st">${icoSm('i-info')}</span></div>`:''}
      ${g.bet?`<div class="check"><span>${icoSm('i-coin')}</span>Ставка от ${esc(g.bet)} ₽ · ${esc(g.category)}<span class="st">${icoSm('i-info')}</span></div>`:''}
    </div>
    <button class="btn btn-primary" id="participateBtn">${esc(g.button)}</button>`;
  $('#participateBtn').onclick=()=>{haptic();openAuth(g);};
}

/* модалка авторизации Winline + проверка условий (демо-анимация) */
const modal=$('#modal'),sheet=$('#sheet');
function closeModal(){ modal.classList.remove('show'); }
modal.addEventListener('click',e=>{ if(e.target===modal) closeModal(); });
function openAuth(g){
  sheet.innerHTML=`
    <h3>${ico('i-shield')} Авторизация Winline</h3>
    <p>Войдите в личный кабинет Winline, чтобы привязать аккаунт и подтвердить участие.</p>
    <div class="field"><label>Логин / ID Winline</label><input class="input" id="wl-login" placeholder="Ваш Winline ID"></div>
    <div class="field"><label>Пароль</label><input class="input" id="wl-pass" type="password" placeholder="••••••••"></div>
    <button class="btn btn-primary" id="wl-go">Войти и проверить условия</button>
    <div style="height:8px"></div>
    <button class="btn btn-ghost" id="wl-cancel">Отмена</button>`;
  modal.classList.add('show');
  $('#wl-cancel').onclick=()=>{haptic();closeModal();};
  $('#wl-go').onclick=()=>{ haptic(); runChecks(g); };
}
function runChecks(g){
  // TODO:BACKEND — реальная авторизация через Winline API + проверка подписок/промо/ставки
  const items=[];
  g.channels.forEach(c=>items.push('Подписка '+c));
  if(g.promo) items.push('Промокод '+g.promo);
  if(g.bet) items.push('Ставка от '+g.bet+' ₽');
  sheet.innerHTML=`<h3>${ico('i-loader')} Проверяем условия…</h3>
    <p>Привязываем Winline ID к Telegram и проверяем выполнение условий.</p>
    <div class="check-list" id="checks">
      ${items.map(t=>`<div class="check wait"><span>${icoSm('i-clock')}</span>${esc(t)}<span class="st"><svg class="icon sm spin"><use href="#i-loader"/></svg></span></div>`).join('')}
    </div>`;
  const rows=$$('#checks .check'); let i=0;
  const t=setInterval(()=>{
    if(i>=rows.length){ clearInterval(t); finishAuth(g); return; }
    const r=rows[i]; r.classList.remove('wait'); r.classList.add('ok');
    r.querySelector('.st').innerHTML=icoSm('i-checkc'); i++;
  },650);
}
function finishAuth(g){
  setTimeout(()=>{
    sheet.innerHTML=`<div class="center" style="min-height:auto;padding:10px 0 4px">
      <div class="burst">${ico('i-checkc')}</div>
      <h3>Вы участвуете! 🎉</h3>
      <p style="text-align:center">Аккаунт привязан, все условия выполнены. Удачи в розыгрыше <b>${esc(g.title)}</b>!</p>
      <button class="btn btn-primary" id="done">Отлично</button></div>`;
    $('#done').onclick=()=>{haptic();closeModal();};
  },400);
}

/* ---------- init ---------- */
seedIfEmpty();
renderMenu();
syncBack();
