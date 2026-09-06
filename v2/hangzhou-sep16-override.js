'use strict';

let HZ_SEP16_PLAN=null;

function hzClone(v){return JSON.parse(JSON.stringify(v))}
function hzSetDate(day,date,th,zh){
  const d=hzClone(day);d.date=date;d.short={th,zh};return d;
}

async function loadHangzhouSep16Plan(){
  if(HZ_SEP16_PLAN)return HZ_SEP16_PLAN;
  const r=await fetch('../data/hangzhou-sep16-plan.json',{cache:'no-store'});
  if(!r.ok)throw new Error('hangzhou sep16 plan');
  HZ_SEP16_PLAN=await r.json();return HZ_SEP16_PLAN;
}

async function applySep16HangzhouOverride(data){
  if(!data?.days?.length)return data;
  const plan=await loadHangzhouSep16Plan();
  const i15=data.days.findIndex(d=>d.date==='2026-09-15');
  const i16=data.days.findIndex(d=>d.date==='2026-09-16');
  const i17=data.days.findIndex(d=>d.date==='2026-09-17');
  if(i15<0||i16<0||i17<0)return data;

  const old16=hzClone(data.days[i16]);
  const old17=hzClone(data.days[i17]);

  data.days[i15]=hzSetDate(old17,'2026-09-15','15 ก.ย.','9月15日');
  data.days[i16]=hzClone(plan.day);
  data.days[i17]=hzSetDate(old16,'2026-09-17','17 ก.ย.','9月17日');
  return data;
}

// Extend the existing Offline Readiness probe so it cannot report "ready" unless the new runtime itinerary layer is cached too.
if(typeof requiredOfflineUrls==='function'){
  const hzRequiredOfflineUrls=requiredOfflineUrls;
  requiredOfflineUrls=function(){
    const req=hzRequiredOfflineUrls();
    req.app.push(new URL('hangzhou-sep16-override.js',document.baseURI).href);
    req.data.push(new URL('../data/hangzhou-sep16-plan.json',document.baseURI).href);
    return req;
  };
}
