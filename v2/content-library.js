'use strict';

let CONTENT_LIBRARY=null;
state.foodRole=state.foodRole||'all';

const CL_TEXT={
  detailRoute:{th:'เส้นเดินฉบับละเอียด',zh:'详细步行路线'},
  routeStops:{th:'จุดแวะระหว่างทาง',zh:'沿途停留点'},
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
  backup:{th:'↔ Backup',zh:'↔ 备用'}
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
    const oldName=existing.name||{},oldNote=existing.note,oldImage=existing.image;
    Object.assign(existing,p);
    existing.name={...oldName,...(p.name||{})};
    if(!p.note&&oldNote)existing.note=oldNote;
    if(!p.image&&oldImage)existing.image=oldImage;
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
    const [places,food,reference,revised,walk]=await Promise.all([
      fetch('../data/content-places.json').then(r=>{if(!r.ok)throw new Error('places');return r.json()}),
      fetch('../data/content-food.json').then(r=>{if(!r.ok)throw new Error('food');return r.json()}),
      fetch('../data/reference-itinerary-ideas.json').then(r=>{if(!r.ok)throw new Error('reference');return r.json()}),
      fetch('../data/revised-plan-content.json').then(r=>{if(!r.ok)throw new Error('revised');return r.json()}),
      fetch('../data/day1-citywalk.json').then(r=>{if(!r.ok)throw new Error('walk');return r.json()})
    ]);
    CONTENT_LIBRARY={places:[...(places.places||[]),...(food.places||[]),...(reference.places||[]),...(revised.places||[])],foodStatusLabels:food.foodStatusLabels||{},walk,referenceSourceNote:reference.sourceNote||null};
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
  const html=eventCardBeforeContent(e,di,ei),stops=e.contentExtras?.miniStops||[];
  if(state.tab!=='plan'||!stops.length)return html;
  const block=`<div class="content-mini-stops"><b>${clt('routeStops')}</b><div>${stops.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>`;
  return html.replace('<div class="actions event-primary-actions">',block+'<div class="actions event-primary-actions">');
};

const renderPlanBeforeContent=renderPlan;
renderPlan=function(){
  let html=renderPlanBeforeContent();
  const d=DATA?.days?.[state.selectedDay],route=d?.contentRoute;
  if(!route?.sequence?.length)return html;
  const dayNo=(DATA.days.findIndex(x=>x.date===route.date)+1)||state.selectedDay+1;
  const card=`<section class="content-route-card"><div class="content-route-head"><div><small>DAY ${dayNo} · CITY WALK</small><h3>${esc(clLoc(route.routeTitle)||clt('detailRoute'))}</h3></div><span>${route.sequence.length} stops</span></div><div class="content-route-sequence">${route.sequence.map((x,i)=>`<div><i>${i+1}</i><span><b>${esc(state.lang==='zh'?x.cn:x.th)}</b><small>${esc(state.lang==='zh'?x.th:x.cn)}</small></span></div>`).join('')}</div></section>`;
  const marker='<div class="section-head"><h2>';
  return html.includes(marker)?html.replace(marker,card+marker):card+html;
};

const placeCardBeforeContent=placeCard;
placeCard=function(p){
  let html=placeCardBeforeContent(p);
  const role=clRole(p),days=clDays(p),copy=p.copyText||p.addr||p.cn;
  const badges=(role||days)?`<div class="content-badges">${role?`<span>${esc(role)}</span>`:''}${days?`<span>${esc(days)}</span>`:''}</div>`:'';
  const extras=`${p.addr?`<p class="content-address"><b>${tr('address')}</b> ${esc(p.addr)}</p>`:''}${p.menu?`<div class="content-food-detail"><b>${clt('menu')}</b><span>${esc(clLoc(p.menu))}</span></div>`:''}${p.avgPrice||p.hours?`<div class="content-meta">${p.avgPrice?`<span><b>${clt('avgPrice')}</b> ${esc(p.avgPrice)}</span>`:''}${p.hours?`<span><b>${clt('hours')}</b> ${esc(p.hours)}</span>`:''}</div>`:''}${p.verifyBeforeTrip?`<div class="content-verify">${clt('verify')}</div>`:''}${p.sourceUrl?`<a class="content-source" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener">↗ ${clt('source')}: ${esc(clLoc(p.sourceLabel)||'Official')}</a>`:''}`;
  html=html.replace('<article class="place-card','<article class="place-card content-place-card');
  if(badges)html=html.replace('<div class="place-head">',badges+'<div class="place-head">');
  if(extras||copy)html=html.replace('<div class="actions">',extras+`<div class="actions">${copy?`<button class="btn ghost" data-copy="${encodeURIComponent(copy)}">${tr('copyChinese')}</button>`:''}`);
  return html;
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
