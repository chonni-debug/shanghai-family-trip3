'use strict';

let CONTENT_LIBRARY=null;
state.foodRole=state.foodRole||'all';

const CL_TEXT={
  detailRoute:{th:'เส้นเดินฉบับละเอียด',zh:'详细步行路线'},
  routeStops:{th:'จุดแวะระหว่างทาง',zh:'沿途停留点'},
  day:{th:'Day',zh:'Day'},
  allFood:{th:'ร้านอาหารทั้งหมด',zh:'全部餐厅'},
  hours:{th:'เวลา',zh:'时间'},
  avgPrice:{th:'ราคาเฉลี่ย',zh:'人均'},
  menu:{th:'เมนูที่เล็งไว้',zh:'推荐菜单'},
  verify:{th:'⚠ ตรวจอีกครั้งก่อนเดินทาง',zh:'⚠ 出发前再次确认'},
  source:{th:'แหล่งข้อมูล',zh:'资料来源'},
  planned:{th:'● อยู่ในแผน',zh:'● 已在计划中'},
  flexible:{th:'◇ แวะได้ถ้าเหมาะ',zh:'◇ 顺路可去'},
  optional:{th:'○ Optional',zh:'○ 可选'},
  pending:{th:'? รอตัดสินใจ',zh:'? 待决定'},
  route_stop:{th:'→ จุดแวะในเส้น',zh:'→ 路线停留点'},
  must_try:{th:'⭐ Must Try if Nearby',zh:'⭐ 顺路必试'},
  backup:{th:'↔ Backup',zh:'↔ 备用'},
  contentLoading:{th:'กำลังโหลดคลังสถานที่เพิ่มเติม…',zh:'正在加载扩展地点资料…'}
};
function clt(k){const v=CL_TEXT[k];return v?(v[state.lang]||v.th):k}
function clLoc(v){return typeof v==='string'?v:(v?.[state.lang]||v?.th||v?.zh||'')}
function clRole(p){
  if(p.foodStatus&&CONTENT_LIBRARY?.foodStatusLabels?.[p.foodStatus])return clLoc(CONTENT_LIBRARY.foodStatusLabels[p.foodStatus]);
  return p.tripRole?clt(p.tripRole):'';
}
function clDays(p){return Array.isArray(p.dayHint)&&p.dayHint.length?p.dayHint.map(n=>`Day ${n}`).join(' · '):''}
function mergeExtendedPlace(p){
  if(!DATA?.places)return;
  const existing=DATA.places.find(x=>x.cn===p.cn);
  if(existing){
    const oldName=existing.name||{},oldNote=existing.note;
    Object.assign(existing,p);
    existing.name={...oldName,...(p.name||{})};
    if(!p.note&&oldNote)existing.note=oldNote;
    return;
  }
  DATA.places.push(p);
}
function applyDayEnhancement(walk){
  if(!DATA?.days||!walk)return;
  const day=DATA.days.find(d=>d.date===walk.date);if(!day)return;
  day.contentRoute=walk;
  Object.entries(walk.eventExtras||{}).forEach(([cn,extra])=>{const e=day.events.find(x=>x.cn===cn);if(e)e.contentExtras={...(e.contentExtras||{}),...extra};});
}
async function loadContentLibrary(){
  try{
    const [places,food,walk]=await Promise.all([
      fetch('../data/content-places.json').then(r=>{if(!r.ok)throw new Error('places');return r.json()}),
      fetch('../data/content-food.json').then(r=>{if(!r.ok)throw new Error('food');return r.json()}),
      fetch('../data/day1-citywalk.json').then(r=>{if(!r.ok)throw new Error('walk');return r.json()})
    ]);
    CONTENT_LIBRARY={places:[...(places.places||[]),...(food.places||[])],foodStatusLabels:food.foodStatusLabels||{},walk};
    const apply=()=>{
      if(!DATA?.places||!DATA?.days)return false;
      CONTENT_LIBRARY.places.forEach(mergeExtendedPlace);
      applyDayEnhancement(walk);
      if(typeof render==='function')render();
      return true;
    };
    if(!apply()){
      let tries=0;const timer=setInterval(()=>{tries++;if(apply()||tries>80)clearInterval(timer)},50);
    }
  }catch(err){console.warn('Extended content library unavailable',err)}
}

const eventCardBeforeContent=eventCard;
eventCard=function(e,di,ei){
  let html=eventCardBeforeContent(e,di,ei);
  const stops=e.contentExtras?.miniStops||[];
  if(!stops.length)return html;
  const block=`<div class="content-mini-stops"><b>${clt('routeStops')}</b><div>${stops.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>`;
  return html.replace('<div class="actions">',block+'<div class="actions">');
};

const renderPlanBeforeContent=renderPlan;
renderPlan=function(){
  let html=renderPlanBeforeContent();
  const d=DATA?.days?.[state.selectedDay],route=d?.contentRoute;
  if(!route?.sequence?.length)return html;
  const card=`<section class="content-route-card"><div class="content-route-head"><div><small>DAY 1 · CITY WALK</small><h3>${esc(clLoc(route.routeTitle)||clt('detailRoute'))}</h3></div><span>${route.sequence.length} stops</span></div><div class="content-route-sequence">${route.sequence.map((x,i)=>`<div><i>${i+1}</i><span><b>${esc(state.lang==='zh'?x.cn:x.th)}</b><small>${esc(state.lang==='zh'?x.th:x.cn)}</small></span></div>`).join('')}</div></section>`;
  const marker='<div class="section-head"><h2>';
  return html.includes(marker)?html.replace(marker,card+marker):card+html;
};

placeCard=function(p){
  const k=placeKey(p),fav=getSet('sh-favorites').has(k),role=clRole(p),days=clDays(p),copy=p.copyText||p.addr||p.cn;
  return `<article class="place-card content-place-card">${p.image?`<div class="place-photo"><img src="${esc(p.image)}" alt="${esc(loc(p.name))}" loading="lazy"></div>`:`<div class="place-photo"></div>`}<div class="place-body"><div class="place-head"><div><div class="content-badges">${role?`<span>${esc(role)}</span>`:''}${days?`<span>${esc(days)}</span>`:''}</div><h3>${esc(loc(p.name))}</h3>${state.lang==='th'?`<div class="cn">${esc(p.cn)}</div>`:`<div class="secondary">泰: ${esc(p.name?.th||'')}</div>`}</div><button class="fav" data-fav="${esc(k)}">${fav?'★':'☆'}</button></div>${p.note?`<p>${esc(loc(p.note))}</p>`:''}${p.addr?`<p class="content-address"><b>${tr('address')}</b> ${esc(p.addr)}</p>`:''}${p.menu?`<div class="content-food-detail"><b>${clt('menu')}</b><span>${esc(clLoc(p.menu))}</span></div>`:''}${p.avgPrice||p.hours?`<div class="content-meta">${p.avgPrice?`<span><b>${clt('avgPrice')}</b> ${esc(p.avgPrice)}</span>`:''}${p.hours?`<span><b>${clt('hours')}</b> ${esc(p.hours)}</span>`:''}</div>`:''}${p.verifyBeforeTrip?`<div class="content-verify">${clt('verify')}</div>`:''}${p.sourceUrl?`<a class="content-source" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener">↗ ${clt('source')}: ${esc(clLoc(p.sourceLabel)||'Official')}</a>`:''}<div class="actions"><a class="btn primary" href="${amapUrl({...p,cn:p.copyText||p.cn})}" target="_blank" rel="noopener">${tr('openAmap')}</a><button class="btn ghost" data-copy="${encodeURIComponent(copy)}">${tr('copyChinese')}</button><button class="btn" data-show-place="${esc(p.copyText||p.cn)}">${tr('showChinese')}</button></div></div></article>`;
};

renderExplore=function(){
  const cats=['all','favorites','sight','food','cafe','shopping','museum','transport','temple','market','walk'];
  const fav=getSet('sh-favorites'),q=state.placeQuery.trim().toLowerCase();
  let list=uniqueExplorePlaces().filter(p=>(state.placeFilter==='all'||(state.placeFilter==='favorites'&&fav.has(placeKey(p)))||p.cat===state.placeFilter)&&(!q||[loc(p.name),p.name?.th,p.name?.zh,p.en,p.cn,p.addr,p.copyText,loc(p.note),loc(p.menu)].filter(Boolean).join(' ').toLowerCase().includes(q)));
  if(state.placeFilter==='food'&&state.foodRole!=='all')list=list.filter(p=>p.foodStatus===state.foodRole);
  const foodFilters=state.placeFilter==='food'?`<div class="content-food-filters"><button class="chip ${state.foodRole==='all'?'active':''}" data-food-role="all">${clt('allFood')}</button>${['planned','must_try','backup'].map(x=>`<button class="chip ${state.foodRole===x?'active':''}" data-food-role="${x}">${esc(clLoc(CONTENT_LIBRARY?.foodStatusLabels?.[x])||clt(x))}</button>`).join('')}</div>`:'';
  return `<input id="placeSearch" class="search" placeholder="${tr('searchPlaceholder')}" value="${esc(state.placeQuery)}"><div class="chips">${cats.map(c=>`<button class="chip ${state.placeFilter===c?'active':''}" data-filter="${c}">${c==='favorites'?'★ '+tr('favorites'):tr(c)}</button>`).join('')}</div>${foodFilters}<div>${list.map(placeCard).join('')}</div>${list.length?'':`<div class="empty">${tr('noPlaces')}</div>`}`;
};

document.addEventListener('click',e=>{const b=e.target.closest('[data-food-role]');if(!b)return;state.foodRole=b.dataset.foodRole;render();});

loadContentLibrary();
