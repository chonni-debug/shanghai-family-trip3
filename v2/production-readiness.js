'use strict';

const PROD_TEXT={
  offlineReady:{th:'พร้อมใช้ Offline',zh:'可离线使用'},offlinePartial:{th:'กำลังเตรียม Offline',zh:'正在准备离线'},offlineNo:{th:'ยังไม่พร้อม Offline',zh:'尚未准备离线'},
  offlineDetail:{th:'ตรวจความพร้อม Offline',zh:'检查离线准备'},offlineHint:{th:'ควรเปิดเว็บออนไลน์อย่างน้อยหนึ่งครั้งก่อนเดินทาง',zh:'出发前请至少在线打开一次网页'},offlineTest:{th:'ตรวจอีกครั้ง',zh:'重新检查'},
  skip:{th:'ข้ามจุดนี้',zh:'跳过此站'},unskip:{th:'คืนกิจกรรมนี้',zh:'恢复此站'},skipped:{th:'ข้ามแล้ว',zh:'已跳过'},optional:{th:'Optional',zh:'可选'},
  simplify:{th:'ลดแผนวันนี้',zh:'精简今日行程'},simplified:{th:'ข้ามจุด Optional ที่เหลือแล้ว',zh:'已跳过剩余可选行程'},noOptional:{th:'ไม่มีจุด Optional ที่เหลือ',zh:'没有剩余可选行程'},
  tiredTitle:{th:'โหมดประหยัดแรง',zh:'省体力模式'},tiredHint:{th:'แนะนำ DiDi ก่อน และตัดจุด Optional ออกถ้าจำเป็น',zh:'优先打车，必要时减少可选行程'},
  restTitle:{th:'ควรพักก่อน',zh:'建议先休息'},restHint:{th:'กลับโรงแรมได้ทันที หรือกดลดแผนเพื่อข้ามจุด Optional',zh:'可直接返回酒店，或精简行程跳过可选站点'},
  onboardTitle:{th:'วิธีใช้เว็บนี้ใน 1 นาที',zh:'1分钟学会使用'},next:{th:'ถัดไป',zh:'下一步'},back:{th:'ย้อนกลับ',zh:'上一步'},finish:{th:'พร้อมใช้งาน',zh:'开始使用'},resetGuide:{th:'ดูวิธีใช้อีกครั้ง',zh:'重新查看使用指南'},
  ob1Title:{th:'เปิด “วันนี้” แล้วดูแค่จุดถัดไป',zh:'打开“今天”，只看下一站'},ob1Text:{th:'เว็บจะบอกว่าควรออกกี่โมง ไปไหน และมีปุ่มเริ่มเดินทางให้ทันที ไม่ต้องอ่านแผนทั้งวัน',zh:'网页会直接告诉你何时出发、去哪里，并提供开始出发按钮，无需一次读完整天行程'},
  ob2Title:{th:'ถ้าสื่อสารไม่ได้ ใช้ 中文 หรือกลับโรงแรม',zh:'不会沟通时，用中文展示或直接回酒店'},ob2Text:{th:'กด 中文 เพื่อยื่นให้คนจีนดู และกด 🏨 ด้านบนเมื่ออยากกลับโรงแรม',zh:'点击中文展示给当地人看；想回酒店时点击顶部 🏨'},
  ob3Title:{th:'เตรียม Offline + Private Wallet',zh:'准备离线 + 私人旅行钱包'},ob3Text:{th:'เปิดเว็บออนไลน์หนึ่งครั้ง แล้วตรวจสถานะ Offline จากเมนูเพิ่มเติม ข้อมูลส่วนตัวและ Flight Ticket เก็บเฉพาะในเครื่อง',zh:'先在线打开一次，再在“更多”检查离线状态。私人资料和机票仅保存在本机'},
  remaining:{th:'จุดที่เหลือ',zh:'剩余站点'},allDone:{th:'วันนี้ไม่มีจุดที่เหลือแล้ว',zh:'今天已没有剩余行程'},
  cacheApp:{th:'ไฟล์แอป',zh:'应用文件'},cacheData:{th:'ข้อมูลทริป',zh:'行程数据'},serviceWorker:{th:'ระบบ Offline',zh:'离线系统'},network:{th:'สถานะเน็ต',zh:'网络状态'},
  online:{th:'ออนไลน์',zh:'在线'},offline:{th:'ออฟไลน์',zh:'离线'}
};
function pt(k){const v=PROD_TEXT[k];return v?(v[state.lang]||v.th):k}

const SKIP_KEY='sh-skipped';
const ONBOARD_KEY='sh-onboarding-v1';
const offlineState={ready:false,checking:false,app:false,data:false,sw:false,online:navigator.onLine};
let onboardingStep=0;

function skippedSet(){return getSet(SKIP_KEY)}
function eventIsSkipped(di,ei,e){return skippedSet().has(eventKey(di,ei,e))}
function setEventSkipped(di,ei,e,yes){const s=skippedSet(),k=eventKey(di,ei,e);if(yes)s.add(k);else s.delete(k);saveSet(SKIP_KEY,s)}
function eventText(e){return [e?.name?.th,e?.name?.zh,e?.route?.th,e?.route?.zh,e?.meal?.th,e?.meal?.zh].filter(Boolean).join(' ')}
function isOptionalEvent(e){return /(optional|可选|ถ้ายังไหว|ถ้ามีแรง|有体力再去)/i.test(eventText(e))}

/* The existing Journey Controller now ignores deliberately skipped stops. */
nextContext=function(dayIndex,nowMinutes){
  const d=DATA.days[dayIndex],done=getSet('sh-done'),skip=skippedSet();
  const usable=(e,i)=>!done.has(eventKey(dayIndex,i,e))&&!skip.has(eventKey(dayIndex,i,e));
  let idx=d.events.findIndex((e,i)=>usable(e,i)&&minutes(e.time)>=nowMinutes-20);
  if(idx<0)idx=d.events.findIndex(usable);
  if(idx<0)return {idx:-1,prev:d.events.filter((e,i)=>!skip.has(eventKey(dayIndex,i,e))).at(-1)||null,current:null,next:null};
  let pi=idx-1;while(pi>=0&&skip.has(eventKey(dayIndex,pi,d.events[pi])))pi--;
  let ni=idx+1;while(ni<d.events.length&&skip.has(eventKey(dayIndex,ni,d.events[ni])))ni++;
  return {idx,prev:pi>=0?d.events[pi]:null,current:d.events[idx],next:ni<d.events.length?d.events[ni]:null};
};

function prodEventPhoto(e){
  if(typeof compactEventPhoto==='function')return compactEventPhoto(e);
  if(!e.image)return '';
  return `<div class="event-photo"><img src="${esc(e.image)}" alt="${esc(loc(e.name))}" loading="lazy" referrerpolicy="no-referrer"></div>`;
}

/* Plan cards clearly distinguish Done vs Skipped and keep the primary surface simple. */
eventCard=function(e,di,ei){
  const k=eventKey(di,ei,e),done=getSet('sh-done').has(k),skipped=eventIsSkipped(di,ei,e),hasPhoto=Boolean(e.image),optional=isOptionalEvent(e);
  const integrity=e.photoIntegrity==='unverified'&&typeof photoMissingLabel==='function'?`<div class="photo-integrity-note"><b>📷 ${photoMissingLabel()}</b><small>${photoMissingHint()}</small></div>`:'';
  const statuses=`<div class="event-status-row">${optional?`<span class="event-status optional">◇ ${pt('optional')}</span>`:''}${skipped?`<span class="event-status skipped">↷ ${pt('skipped')}</span>`:''}</div>`;
  const actions=skipped
    ? `<div class="actions event-primary-actions"><button class="btn primary" data-skip-event="${di}:${ei}">${pt('unskip')}</button><button class="btn ghost" data-event-more="${di}:${ei}">••• ${typeof ux==='function'?ux('moreActions'):'More'}</button></div>`
    : `<div class="actions event-primary-actions"><a class="btn primary" href="${amapUrl(e)}" target="_blank" rel="noopener">${typeof ux==='function'?ux('start'):tr('startTravel')}</a><button class="btn ${done?'danger':''}" data-done="${esc(k)}">${done?tr('undoDone'):(typeof ux==='function'?ux('arrived'):tr('arrived'))}</button></div><button class="event-more-btn" data-event-more="${di}:${ei}" type="button">••• ${typeof ux==='function'?ux('moreActions'):'More'}</button>`;
  return `<article class="event-card ${done?'done':''} ${skipped?'skipped':''} ${hasPhoto?'':'no-photo'}">${prodEventPhoto(e)}<div class="event-body">${integrity}<div class="event-top"><span class="time">${esc(e.time)}</span><div class="event-title"><h3>${esc(loc(e.name))}</h3>${state.lang==='th'?`<span class="cn">${esc(e.cn)}</span>`:`<span class="secondary">泰: ${esc(e.name.th||'')}</span>`}</div></div>${statuses}${e.route?`<div class="event-detail"><b>${tr('route')}</b><br>${esc(loc(e.route))}</div>`:''}${e.meal?`<div class="event-detail"><b>${tr('meal')}</b><br>${esc(loc(e.meal))}</div>`:''}${e.arrival?`<div class="event-detail"><b>${tr('arrival')}</b><br>${esc(loc(e.arrival))}</div>`:''}${actions}</div></article>`;
};

openEventMore=function(di,ei){
  const e=DATA.days?.[di]?.events?.[ei];if(!e)return;
  const skipped=eventIsSkipped(di,ei,e),google=typeof googleUrl==='function'?googleUrl(e):'';
  openModal(typeof ux==='function'?ux('moreActions'):tr('details'),loc(e.name),`<div class="quick-action-grid"><button class="btn primary" data-show-cn-day="${di}" data-show-cn-event="${ei}">${tr('showChinese')}</button><button class="btn" data-copy="${encodeURIComponent(e.cn||'')}">${tr('copyChinese')}</button><button class="btn" data-speak="${encodeURIComponent(e.cn||'')}">${tr('speak')}</button><a class="btn" href="${amapUrl(e)}" target="_blank" rel="noopener">${tr('openAmap')}</a>${google?`<a class="btn" href="${google}" target="_blank" rel="noopener">${tr('openGoogle')}</a>`:''}<button class="btn ghost" data-driver="hotel">🏨 ${tr('backHotel')}</button><button class="btn ${skipped?'primary':'danger'}" data-skip-event="${di}:${ei}">${skipped?pt('unskip'):pt('skip')}</button></div>`);
};

function remainingOptional(dayIndex,fromIndex){const d=DATA.days[dayIndex];return d.events.map((e,i)=>({e,i})).filter(x=>x.i>=Math.max(0,fromIndex)&&isOptionalEvent(x.e)&&!eventIsSkipped(dayIndex,x.i,x.e)&&!getSet('sh-done').has(eventKey(dayIndex,x.i,x.e)))}
function adaptiveFamilyCard(dayIndex,fromIndex){
  if(state.family==='normal')return '';
  const opts=remainingOptional(dayIndex,fromIndex),rest=state.family==='rest';
  return `<div class="adaptive-card ${rest?'rest':''}"><b>${rest?'🛋 '+pt('restTitle'):'😮‍💨 '+pt('tiredTitle')}</b><small>${rest?pt('restHint'):pt('tiredHint')}</small><div class="adaptive-actions">${opts.length?`<button class="btn" data-family-simplify="${dayIndex}:${Math.max(0,fromIndex)}">${pt('simplify')} · ${opts.length}</button>`:''}<button class="btn primary" data-driver="hotel">🏨 ${tr('backHotel')}</button></div></div>`;
}

/* Today stays focused on the next usable stop and never surfaces skipped stops as the next step. */
renderHome=function(){
  const s=tripStatus(),d=DATA.days[s.day],done=getSet('sh-done'),skip=skippedSet(),todayDone=d.events.filter((e,i)=>done.has(eventKey(s.day,i,e))).length,total=getExpenses().reduce((a,x)=>a+Number(x.amount||0),0);
  let label=s.phase==='before'?`${tr('countdown')} · ${tr('daysLeft',{n:s.daysLeft})}`:s.phase==='after'?tr('tripEnded'):`Day ${s.day+1} · ${loc(d.short)}`;if(s.sim)label=s.label;
  let startIdx=0,journey='';
  if(s.phase==='before'){
    const e=d.events.find((x,i)=>!skip.has(eventKey(s.day,i,x)))||d.events[0];
    journey=`<section class="journey-card"><div class="journey-kicker">${tr('nextStep')}</div><h2>${tr('countdown')}</h2><div class="cn-primary">${esc(loc(e.name))}</div><p class="secondary">${esc(e.cn)}</p><div class="notice">${tr('daysLeft',{n:s.daysLeft})}</div><div class="actions"><button class="btn primary" data-tab-go="plan">${tr('plan')}</button><button class="btn" data-more-go="settings">${tr('simulator')}</button></div></section>`;
  }else if(s.phase==='after'){
    startIdx=d.events.length;journey=`<section class="journey-card"><div class="journey-kicker">${tr('nextStep')}</div><h2>${tr('tripEnded')}</h2><button class="btn" data-tab-go="budget">${tr('expenses')}</button></section>`;
  }else{
    const c=nextContext(s.day,s.minutes),e=c.current;startIdx=c.idx<0?d.events.length:c.idx;const leave=e?hhmm(minutes(e.time)-bufferFor(e)):'';
    journey=`<section class="journey-card">${s.sim?`<div class="sim-banner">${tr('simulation')}</div>`:''}<div class="journey-top"><span class="journey-kicker">${tr('nextStep')}</span><span class="pill">${esc(s.time)}</span></div>${e?`<h2>${esc(loc(e.name))}</h2><div class="cn-primary">${esc(e.cn)}</div><div class="journey-strip"><div><small>${tr('previous')}</small><b>${esc(c.prev?loc(c.prev.name):'—')}</b></div><div><small>${tr('current')}</small><b>${esc(loc(e.name))}</b></div><div><small>${tr('next')}</small><b>${esc(c.next?loc(c.next.name):'—')}</b></div></div><div class="travel-grid"><div><small>${tr('leaveAt')}</small><b>${esc(leave)}</b></div><div><small>${tr('arriveAt')}</small><b>${esc(e.time)}</b></div></div>${e.route?`<div class="event-detail"><b>${tr('route')}</b><br>${esc(loc(e.route))}</div>`:''}${adaptiveFamilyCard(s.day,c.idx)}<div class="actions"><a class="btn primary" href="${amapUrl(e)}" target="_blank" rel="noopener">${typeof ux==='function'?ux('start'):tr('startTravel')}</a><button class="btn" data-done="${esc(eventKey(s.day,c.idx,e))}">${done.has(eventKey(s.day,c.idx,e))?tr('undoDone'):(typeof ux==='function'?ux('arrived'):tr('arrived'))}</button></div><button class="btn ghost hotel-inline" data-driver="hotel">🏨 ${tr('backHotel')}</button>`:`<p>${pt('allDone')}</p><button class="btn primary" data-driver="hotel">🏨 ${tr('backHotel')}</button>`}</section>`;
  }
  const upcoming=d.events.map((e,i)=>({e,i})).filter(x=>x.i>=startIdx&&!skip.has(eventKey(s.day,x.i,x.e))&&!done.has(eventKey(s.day,x.i,x.e))).slice(0,2);
  return `${hero(d,label)}<div class="stats"><div class="stat"><b>${todayDone}/${d.events.length}</b><small>${tr('doneToday')}</small></div><div class="stat"><b>★ ${getSet('sh-favorites').size}</b><small>${tr('favorites')}</small></div><div class="stat"><b>¥${total.toFixed(0)}</b><small>${tr('expenses')}</small></div></div>${journey}${upcoming.length?`<div class="section-head"><h2>${typeof ux==='function'?ux('nextTwo'):pt('remaining')}</h2><span>${loc(d.short)}</span></div>${upcoming.map(x=>eventCard(x.e,s.day,x.i)).join('')}`:''}<button class="btn full-day-btn" data-today-plan="${s.day}">${typeof ux==='function'?ux('viewFullDay'):tr('plan')}</button>`;
};

function requiredOfflineUrls(){return {
  app:[new URL('index.html',document.baseURI).href,new URL('app-core.js',document.baseURI).href,new URL('app-events.js',document.baseURI).href,new URL('usability.js',document.baseURI).href,new URL('production-readiness.js',document.baseURI).href],
  data:[new URL('../data/app-trip.json',document.baseURI).href,new URL('../data/app-days-1.json',document.baseURI).href,new URL('../data/app-days-2.json',document.baseURI).href,new URL('../data/app-days-3.json',document.baseURI).href,new URL('../data/app-support.json',document.baseURI).href]
}}
async function allCached(urls){if(!('caches' in window))return false;const found=await Promise.all(urls.map(u=>caches.match(u)));return found.every(Boolean)}
async function checkOfflineReadiness(){
  if(offlineState.checking)return offlineState;offlineState.checking=true;offlineState.online=navigator.onLine;
  try{const req=requiredOfflineUrls();offlineState.app=await allCached(req.app);offlineState.data=await allCached(req.data);const reg='serviceWorker' in navigator?await navigator.serviceWorker.getRegistration():null;offlineState.sw=Boolean(reg?.active);offlineState.ready=offlineState.app&&offlineState.data&&offlineState.sw;}catch{offlineState.ready=false}finally{offlineState.checking=false;updateOfflineBadge()}
  return offlineState;
}
function offlineLabel(){return offlineState.ready?pt('offlineReady'):(offlineState.app||offlineState.data||offlineState.sw)?pt('offlinePartial'):pt('offlineNo')}
function updateOfflineBadge(){const b=document.getElementById('offlineBadge');if(!b)return;b.className=`offline-badge ${offlineState.ready?'ready':'partial'}`;b.innerHTML=`<span class="offline-dot"></span> <span class="offline-label">${esc(offlineLabel())}</span>`;b.title=offlineLabel();const c=document.getElementById('offlineCardStatus');if(c)c.textContent=offlineLabel()}
function installOfflineBadge(){const brand=document.querySelector('.brand');if(!brand||document.getElementById('offlineBadge'))return;const b=document.createElement('button');b.id='offlineBadge';b.type='button';b.className='offline-badge partial';b.innerHTML='<span class="offline-dot"></span> Offline';brand.appendChild(b);b.addEventListener('click',openOfflineStatus)}
function qaRow(ok,title,detail){return `<div class="qa-row ${ok?'ok':'warn'}"><span>${ok?'✓':'!'}</span><div><b>${esc(title)}</b><small>${esc(detail)}</small></div></div>`}
async function openOfflineStatus(){await checkOfflineReadiness();openModal(pt('offlineDetail'),offlineLabel(),`<div class="qa-list">${qaRow(offlineState.sw,pt('serviceWorker'),offlineState.sw?'OK':pt('offlineHint'))}${qaRow(offlineState.app,pt('cacheApp'),offlineState.app?'OK':pt('offlineHint'))}${qaRow(offlineState.data,pt('cacheData'),offlineState.data?'OK':pt('offlineHint'))}${qaRow(true,pt('network'),offlineState.online?pt('online'):pt('offline'))}</div><div class="notice">${pt('offlineHint')}</div><button class="btn primary" data-offline-check="1">${pt('offlineTest')}</button>`)}

const renderMoreBeforeProd=renderMore;
renderMore=function(){const html=renderMoreBeforeProd();if(state.moreView!=='menu')return html;const status=`<div class="more-section"><h3>${pt('offlineDetail')}</h3><div class="card offline-card"><span class="status-icon">${offlineState.ready?'🟢':'🟡'}</span><div><b id="offlineCardStatus">${esc(offlineLabel())}</b><small>${pt('offlineHint')}</small></div><button class="btn" data-offline-check="1">${pt('offlineTest')}</button></div></div>`;return status+html};

if(typeof renderSettings==='function'){
  const renderSettingsBeforeProd=renderSettings;
  renderSettings=function(){return renderSettingsBeforeProd()+`<div class="card"><h3>?</h3><p>${pt('onboardTitle')}</p><button class="btn" data-reset-onboarding="1">${pt('resetGuide')}</button></div>`};
}

function onboardDots(step){return `<div class="onboarding-steps">${[0,1,2].map(i=>`<i class="${i===step?'active':''}"></i>`).join('')}</div>`}
function showOnboarding(step=0){onboardingStep=Math.max(0,Math.min(2,step));const content=[
  {icon:'⌂',title:pt('ob1Title'),text:pt('ob1Text'),demo:`<b>${tr('nextStep')}</b><span>08:20 → 豫园</span><span>${tr('startTravel')}</span>`},
  {icon:'中文',title:pt('ob2Title'),text:pt('ob2Text'),demo:`<span class="big-cn">和颐至尚酒店</span><span>🏨 ${tr('backHotel')}</span>`},
  {icon:'✓',title:pt('ob3Title'),text:pt('ob3Text'),demo:`<b>🟢 ${pt('offlineReady')}</b><span>🔐 Private Travel Wallet</span>`}
][onboardingStep];
  const prev=onboardingStep>0?`<button class="btn" data-onboard-back="1">${pt('back')}</button>`:'<span></span>',next=onboardingStep<2?`<button class="btn primary" data-onboard-next="1">${pt('next')}</button>`:`<button class="btn primary finish" data-onboard-finish="1">${pt('finish')}</button>`;
  openModal(pt('onboardTitle'),`${onboardingStep+1}/3`,`${onboardDots(onboardingStep)}<div class="onboarding-hero"><div class="onboarding-icon">${content.icon}</div><h3>${content.title}</h3><p>${content.text}</p></div><div class="onboarding-demo">${content.demo}</div><div class="onboarding-actions">${prev}${next}</div>`)
}
function maybeShowOnboarding(){if(localStorage.getItem(ONBOARD_KEY)==='done')return;let tries=0;const timer=setInterval(()=>{tries++;if(DATA){clearInterval(timer);showOnboarding(0)}else if(tries>80)clearInterval(timer)},100)}

/* Production-only interactions. Existing app-events continues to own the legacy actions. */
document.addEventListener('click',e=>{
  let b=e.target.closest('[data-skip-event]');if(b){const [di,ei]=b.dataset.skipEvent.split(':').map(Number),ev=DATA.days?.[di]?.events?.[ei];if(ev){const yes=!eventIsSkipped(di,ei,ev);setEventSkipped(di,ei,ev,yes);closeModal();toast(yes?pt('skipped'):pt('unskip'));render()}return}
  b=e.target.closest('[data-family-simplify]');if(b){const [di,from]=b.dataset.familySimplify.split(':').map(Number),items=remainingOptional(di,from);items.forEach(x=>setEventSkipped(di,x.i,x.e,true));toast(items.length?pt('simplified'):pt('noOptional'));render();return}
  if(e.target.closest('[data-offline-check]')){checkOfflineReadiness().then(openOfflineStatus);return}
  if(e.target.closest('[data-onboard-next]')){showOnboarding(onboardingStep+1);return}
  if(e.target.closest('[data-onboard-back]')){showOnboarding(onboardingStep-1);return}
  if(e.target.closest('[data-onboard-finish]')){localStorage.setItem(ONBOARD_KEY,'done');closeModal();checkOfflineReadiness();return}
  if(e.target.closest('[data-reset-onboarding]')){localStorage.removeItem(ONBOARD_KEY);showOnboarding(0);return}
});
window.addEventListener('online',()=>{offlineState.online=true;checkOfflineReadiness()});
window.addEventListener('offline',()=>{offlineState.online=false;updateOfflineBadge()});
window.addEventListener('load',()=>{installOfflineBadge();setTimeout(checkOfflineReadiness,600);setTimeout(maybeShowOnboarding,900)});
