'use strict';

let CONTEXT_GUIDE=null;

const CT_TEXT={
  title:{th:'แนะนำในโซนนี้',zh:'这个区域可顺路考虑'},
  basedOnPlan:{th:'อิงจากจุดในแผน · ไม่ใช้ GPS',zh:'按行程地点推荐 · 不使用 GPS'},
  optional:{th:'ไม่ต้องไปให้ครบ เลือกเฉพาะที่เหมาะตอนนั้น',zh:'不必全部去，只选当下合适的'},
  details:{th:'ดูรายละเอียด',zh:'查看详情'},
  exactText:{th:'ข้อความสำหรับค้นหา/ให้คนดู',zh:'用于搜索/给别人看的文字'},
  menu:{th:'เมนูที่เล็งไว้',zh:'推荐菜单'},
  verify:{th:'⚠ ตรวจอีกครั้งก่อนเดินทาง',zh:'⚠ 出发前再次确认'},
  tired:{th:'โหมดประหยัดแรง: แสดงเฉพาะตัวเลือกกิน/พักที่เด่นที่สุด',zh:'省体力模式：只显示最值得考虑的餐饮/休息选择'}
};
function ctt(k){const v=CT_TEXT[k];return v?(v[state.lang]||v.th):k}
function ctLoc(v){return typeof v==='string'?v:(v?.[state.lang]||v?.th||v?.zh||'')}

function ctPlace(cn){
  if(!DATA?.places)return null;
  return DATA.places.find(p=>p.cn===cn)||null;
}
function ctContext(dayIndex,event){
  if(!CONTEXT_GUIDE?.contexts?.length||!event)return null;
  const anchor=String(event.cn||'').trim();
  return CONTEXT_GUIDE.contexts.find(c=>Number(c.day)===dayIndex+1&&(c.anchors||[]).some(a=>anchor===a||anchor.includes(a)||String(a).includes(anchor)))||null;
}
function ctRole(p){
  if(typeof clRole==='function')return clRole(p);
  return p.foodStatus||p.tripRole||'';
}
function ctCandidates(ctx){
  let list=(ctx?.suggestions||[]).map(ctPlace).filter(Boolean);
  if(state.family==='rest')return [];
  if(state.family==='tired'){
    list=list.filter(p=>p.cat==='food'||p.cat==='cafe');
    return list.slice(0,1);
  }
  return list.slice(0,Number(ctx?.max)||3);
}
function ctMiniCard(p){
  const role=ctRole(p),fav=getSet('sh-favorites').has(placeKey(p));
  const detail=p.menu?ctLoc(p.menu):ctLoc(p.note);
  return `<article class="context-mini-card"><div class="context-mini-head"><div><div class="context-mini-badges">${role?`<span>${esc(role)}</span>`:''}${p.cat?`<span>${esc(tr(p.cat))}</span>`:''}${fav?'<span>★</span>':''}</div><h4>${esc(loc(p.name))}</h4><small>${esc(p.cn)}</small></div></div>${detail?`<p>${esc(detail)}</p>`:''}<div class="context-mini-actions"><a class="btn primary" href="${amapUrl({...p,cn:p.copyText||p.cn})}" target="_blank" rel="noopener">${tr('openAmap')}</a><button class="btn" type="button" data-context-detail="${esc(p.cn)}">${ctt('details')}</button></div></article>`;
}
function contextualCard(dayIndex,event){
  const ctx=ctContext(dayIndex,event);if(!ctx)return '';
  const list=ctCandidates(ctx);if(!list.length)return '';
  return `<section class="context-suggestions" data-context-anchor="${esc(event.cn||'')}"><div class="context-head"><div><small>${ctt('basedOnPlan')}</small><h3>✨ ${ctt('title')}</h3></div><span>${esc(event.cn||'')}</span></div><p class="context-reason">${esc(ctLoc(ctx.reason))}</p>${state.family==='tired'?`<div class="context-family-note">😮‍💨 ${ctt('tired')}</div>`:''}<div class="context-list">${list.map(ctMiniCard).join('')}</div><small class="context-foot">${ctt('optional')}</small></section>`;
}

const renderHomeBeforeContext=renderHome;
renderHome=function(){
  const html=renderHomeBeforeContext();
  if(!CONTEXT_GUIDE||!DATA||state.family==='rest')return html;
  const s=tripStatus();
  if(s.phase==='before'||s.phase==='after')return html;
  const current=nextContext(s.day,s.minutes)?.current;
  const card=contextualCard(s.day,current);
  if(!card)return html;
  const marker='<button class="btn full-day-btn"';
  const at=html.lastIndexOf(marker);
  return at>=0?html.slice(0,at)+card+html.slice(at):html+card;
};

function openContextDetail(cn){
  const p=ctPlace(cn);if(!p)return;
  const exact=p.copyText||[p.cn,p.addr].filter(Boolean).join(' ');
  const role=ctRole(p);
  openModal(loc(p.name),role||ctt('title'),`<div class="context-modal-cn">${esc(exact)}</div>${p.note?`<p>${esc(ctLoc(p.note))}</p>`:''}${p.menu?`<div class="event-detail"><b>${ctt('menu')}</b><br>${esc(ctLoc(p.menu))}</div>`:''}${p.avgPrice||p.hours?`<p class="secondary">${p.avgPrice?esc(p.avgPrice):''}${p.avgPrice&&p.hours?' · ':''}${p.hours?esc(p.hours):''}</p>`:''}${p.verifyBeforeTrip?`<div class="notice">${ctt('verify')}</div>`:''}<div class="actions"><a class="btn primary" href="${amapUrl({...p,cn:exact})}" target="_blank" rel="noopener">${tr('openAmap')}</a><button class="btn" data-copy="${encodeURIComponent(exact)}">${tr('copyChinese')}</button><button class="btn" data-speak="${encodeURIComponent(p.cn)}">${tr('speak')}</button></div>`);
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-context-detail]');
  if(b){openContextDetail(b.dataset.contextDetail);return;}
});

async function loadContextGuide(){
  try{
    const r=await fetch('../data/contextual-suggestions.json');if(!r.ok)throw new Error('context');
    CONTEXT_GUIDE=await r.json();
    if(DATA&&typeof render==='function')render();
  }catch(err){console.warn('Contextual suggestions unavailable',err)}
}
loadContextGuide();
