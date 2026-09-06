'use strict';

let BUND_PHOTO_WALK=null;

function bundWalkLoc(v){return typeof v==='string'?v:(v?.[state.lang]||v?.th||v?.zh||'')}
function applyBundPhotoWalk(route){
  if(!DATA?.days||!route)return false;
  const day=DATA.days.find(d=>d.date===route.date);if(!day)return false;
  day.contentRoute=route;
  Object.entries(route.eventExtras||{}).forEach(([cn,extra])=>{
    const e=day.events.find(x=>x.cn===cn||String(x.cn||'').includes(cn));
    if(e)e.contentExtras={...(e.contentExtras||{}),...extra};
  });
  return true;
}

const v3DetailedWalkBeforeBund=v3DetailedWalk;
v3DetailedWalk=function(d){
  const route=d?.contentRoute;
  if(route?.kind!=='photo_walk')return v3DetailedWalkBeforeBund(d);
  const title=bundWalkLoc(route.routeTitle)||'Bund Photo Walk';
  const rows=route.sequence.map((x,i)=>{
    const primary=state.lang==='zh'?x.cn:x.th;
    const secondary=state.lang==='zh'?x.th:x.cn;
    const note=bundWalkLoc(x.note);
    const copy=x.copyText||x.cn;
    return `<div><i>${i+1}</i><span style="flex:1"><b>${esc(primary)}</b><small>${esc(secondary)}</small>${note?`<small>• ${esc(note)}</small>`:''}</span><button class="btn ghost" style="margin-left:auto;padding:5px 8px;min-height:0;font-size:10px;white-space:nowrap" type="button" data-copy="${encodeURIComponent(copy)}">${state.lang==='zh'?'复制':'Copy 中文'}</button></div>`;
  }).join('');
  return `<details class="v3-walk-detail bund-photo-walk"><summary><span>📸</span><div><b>${esc(title)}</b><small>${route.sequence.length} ${state.lang==='zh'?'个拍照点':'จุดถ่ายรูป'} · ${state.lang==='zh'?'点击展开':'แตะเพื่อดูเส้นถ่ายรูป'}</small></div></summary><div class="v3-walk-sequence">${rows}</div></details>`;
};

(async function loadBundPhotoWalk(){
  try{
    const r=await fetch('../data/day1-bund-photo-walk.json');
    if(!r.ok)throw new Error('bund photo walk');
    BUND_PHOTO_WALK=await r.json();
    const apply=()=>{
      if(!applyBundPhotoWalk(BUND_PHOTO_WALK))return false;
      if(typeof render==='function')render();
      return true;
    };
    if(!apply()){
      let tries=0;const timer=setInterval(()=>{tries++;if(apply()||tries>80)clearInterval(timer)},50);
    }
  }catch(err){console.warn('Bund photo walk unavailable',err)}
})();
