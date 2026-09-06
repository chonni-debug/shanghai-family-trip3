'use strict';

let DAY2_USER_DETAILS=null;

async function loadDay2UserDetails(){
  if(DAY2_USER_DETAILS)return DAY2_USER_DETAILS;
  const r=await fetch('../data/day2-user-details.json',{cache:'no-store'});
  if(!r.ok)throw new Error('day2 user details');
  DAY2_USER_DETAILS=await r.json();
  return DAY2_USER_DETAILS;
}

function day2MergeLocalized(base,extra){
  if(!extra)return base;
  const out={...(base||{})};
  for(const lang of ['th','zh']){
    const a=String(out[lang]||'').trim();
    const b=String(extra[lang]||'').trim();
    if(b&&!a.includes(b))out[lang]=a?`${a} • ${b}`:b;
  }
  return out;
}

function day2StopKey(stop){
  if(typeof stop==='string')return stop.trim();
  return String(stop?.cn||stop?.copyText||stop?.th||'').trim();
}
function day2MergeStops(existing,...groups){
  const list=[];
  const add=stop=>{
    const key=day2StopKey(stop);if(!key)return;
    if(!list.some(x=>day2StopKey(x)===key))list.push(stop);
  };
  (existing||[]).forEach(add);
  groups.flat().filter(Boolean).forEach(add);
  return list;
}

function applyDay2UserDetails(data,payload){
  const day=data?.days?.find(d=>d.date===payload?.date);
  if(!day||!day.events?.some(e=>e.cn==='安福路'))return false;

  const lunch=day.events.find(e=>e.cn===payload.lunch?.anchor)||day.events.find(e=>e.time==='12:30'&&e.type==='food');
  if(lunch&&payload.lunch){
    Object.assign(lunch,JSON.parse(JSON.stringify(payload.lunch)));
    delete lunch.anchor;
  }

  // Consolidate the two historical Huaihai cards into one shopping block.
  const west=day.events.find(e=>e.time===payload.huaihaiWest?.anchorTime);
  const east=day.events.find(e=>e!==west&&((e.cn===payload.huaihaiEast?.anchor&&e.type==='shopping')||e.time==='15:15'));
  if(west&&payload.huaihaiWest){
    west.time=payload.huaihaiWest.anchorTime;
    west.name=JSON.parse(JSON.stringify(payload.huaihaiWest.name));
    west.en='Huaihai Middle Road shopping walk';
    west.cn='淮海中路';
    west.type='shopping';
    west.route=day2MergeLocalized(payload.huaihaiWest.route,payload.huaihaiEast?.route);
    delete west.meal;
    west.contentExtras=west.contentExtras||{};
    west.contentExtras.miniStops=day2MergeStops(
      west.contentExtras.miniStops,
      east?.contentExtras?.miniStops,
      payload.huaihaiWest.miniStops,
      payload.huaihaiEast?.miniStops
    );
    if(east){
      const idx=day.events.indexOf(east);
      if(idx>=0)day.events.splice(idx,1);
    }
  }

  const xintiandi=day.events.find(e=>e.cn===payload.xintiandi?.anchor);
  if(xintiandi&&payload.xintiandi){
    xintiandi.time=payload.xintiandi.time||xintiandi.time;
    xintiandi.route=day2MergeLocalized(xintiandi.route,payload.xintiandi.routeAppend);
  }

  const dinner=day.events.find(e=>e.cn===payload.dinner?.anchor)||day.events.find(e=>e.time==='18:00'&&e.type==='food');
  if(dinner&&payload.dinner){
    Object.assign(dinner,JSON.parse(JSON.stringify(payload.dinner)));
    delete dinner.anchor;
  }
  return true;
}

function mergeDay2Places(payload){
  if(!payload?.places?.length||!DATA?.places||typeof mergeExtendedPlace!=='function')return false;
  payload.places.forEach(mergeExtendedPlace);
  return true;
}

if(typeof applySep16HangzhouOverride==='function'){
  const day2PreviousItineraryOverride=applySep16HangzhouOverride;
  applySep16HangzhouOverride=async function(data){
    await day2PreviousItineraryOverride(data);
    const payload=await loadDay2UserDetails();
    applyDay2UserDetails(data,payload);
    return data;
  };
}

(async function keepDay2PlacesSynced(){
  try{
    const payload=await loadDay2UserDetails();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(DATA?.places&&typeof mergeExtendedPlace==='function'&&typeof CONTENT_LIBRARY!=='undefined'&&CONTENT_LIBRARY){
        mergeDay2Places(payload);
        if(typeof render==='function')render({preserveScroll:true});
        clearInterval(timer);
      }else if(tries>120)clearInterval(timer);
    },50);
  }catch(err){console.warn('Day 2 user detail overlay unavailable',err)}
})();
