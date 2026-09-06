'use strict';

let SEP15_USER_DETAILS=null;

async function loadSep15UserDetails(){
  if(SEP15_USER_DETAILS)return SEP15_USER_DETAILS;
  const r=await fetch('../data/sep15-user-details.json',{cache:'no-store'});
  if(!r.ok)throw new Error('sep15 user details');
  SEP15_USER_DETAILS=await r.json();
  return SEP15_USER_DETAILS;
}

function sep15MergeLocalized(base,extra){
  if(!extra)return base;
  const out={...(base||{})};
  for(const lang of ['th','zh']){
    const a=String(out[lang]||'').trim();
    const b=String(extra[lang]||'').trim();
    if(b)out[lang]=a?`${a} • ${b}`:b;
  }
  return out;
}

function sep15MergeStops(existing,extra){
  const list=[...(existing||[])];
  for(const stop of extra||[]){
    const key=typeof stop==='string'?stop:(stop.cn||stop.copyText||stop.th||'');
    if(!list.some(x=>{
      const k=typeof x==='string'?x:(x.cn||x.copyText||x.th||'');
      return k===key;
    }))list.push(stop);
  }
  return list;
}

function applySep15UserDetails(data,payload){
  const day=data?.days?.find(d=>d.date===payload?.date);
  if(!day||!day.events?.some(e=>e.cn==='静安寺'))return false;

  const lunch=day.events.find(e=>e.cn==='南京西路附近餐厅');
  if(lunch&&payload.jinganMeal){
    const keepTime=lunch.time;
    Object.assign(lunch,JSON.parse(JSON.stringify(payload.jinganMeal)));
    lunch.time=keepTime||payload.jinganMeal.time||'12:30';
  }

  const west=day.events.find(e=>e.cn===payload.westNanjing?.anchor||String(e.cn||'').includes('南京西路'));
  if(west&&payload.westNanjing){
    west.route=sep15MergeLocalized(west.route,payload.westNanjing.routeAppend);
    west.contentExtras=west.contentExtras||{};
    west.contentExtras.miniStops=sep15MergeStops(west.contentExtras.miniStops,payload.westNanjing.miniStops);
  }

  const north=day.events.find(e=>e.cn===payload.northBund?.anchor&&e.type==='sight')||day.events.find(e=>e.cn===payload.northBund?.anchor);
  if(north&&payload.northBund){
    north.route=JSON.parse(JSON.stringify(payload.northBund.route));
    north.contentExtras=north.contentExtras||{};
    north.contentExtras.miniStops=sep15MergeStops(north.contentExtras.miniStops,payload.northBund.miniStops);
  }

  const dinner=day.events.find(e=>e.cn===payload.dinner?.anchor)||day.events.find(e=>e.time==='19:00'&&e.type==='food');
  if(dinner&&payload.dinner){
    Object.assign(dinner,JSON.parse(JSON.stringify(payload.dinner)));
    delete dinner.anchor;
  }
  return true;
}

function mergeSep15Places(payload){
  if(!payload?.places?.length||!DATA?.places||typeof mergeExtendedPlace!=='function')return false;
  payload.places.forEach(mergeExtendedPlace);
  return true;
}

if(typeof applySep16HangzhouOverride==='function'){
  const sep15PreviousHangzhouOverride=applySep16HangzhouOverride;
  applySep16HangzhouOverride=async function(data){
    await sep15PreviousHangzhouOverride(data);
    const payload=await loadSep15UserDetails();
    applySep15UserDetails(data,payload);
    return data;
  };
}

if(typeof requiredOfflineUrls==='function'){
  const sep15RequiredOfflineUrls=requiredOfflineUrls;
  requiredOfflineUrls=function(){
    const req=sep15RequiredOfflineUrls();
    req.app.push(new URL('sep15-user-details.js',document.baseURI).href);
    req.data.push(new URL('../data/sep15-user-details.json',document.baseURI).href);
    return req;
  };
}

(async function keepSep15PlacesSynced(){
  try{
    const payload=await loadSep15UserDetails();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(DATA?.places&&typeof mergeExtendedPlace==='function'&&typeof CONTENT_LIBRARY!=='undefined'&&CONTENT_LIBRARY){
        mergeSep15Places(payload);
        if(typeof render==='function')render({preserveScroll:true});
        clearInterval(timer);
      }else if(tries>120)clearInterval(timer);
    },50);
  }catch(err){console.warn('Sep 15 user detail overlay unavailable',err)}
})();
