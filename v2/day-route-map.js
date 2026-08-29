'use strict';

let DAY_ROUTE_MAPS=null;
state.dayMapSegment=state.dayMapSegment||{};

const DRM_TEXT={
  title:{th:'Google Maps · เส้นทางวันนี้',zh:'Google Maps · 今日路线'},
  subtitle:{th:'จุดหลักเรียงตามลำดับของวัน',zh:'按当天顺序排列的主要地点'},
  open:{th:'เปิดใน Google Maps',zh:'在 Google Maps 打开'},
  segment:{th:'ช่วง',zh:'分段'},
  optional:{th:'Optional',zh:'可选'},
  online:{th:'แผนที่ต้องใช้อินเทอร์เน็ต',zh:'地图需要网络连接'},
  overview:{th:'ใช้ดูภาพรวมตำแหน่ง — วิธีเดินทางจริงให้ยึด AMap/รายละเอียดในการ์ด',zh:'仅用于查看位置概览 — 实际交通请以高德地图和行程卡片为准'},
  fallback:{th:'ถ้าแผนที่ไม่โหลด ให้กด “เปิดใน Google Maps”',zh:'若地图无法加载，请点击“在 Google Maps 打开”'}
};
function drmt(k){const v=DRM_TEXT[k];return v?(v[state.lang]||v.th):k}
function drmDay(date){return DAY_ROUTE_MAPS?.days?.find(x=>x.date===date)||null}
function drmChunk(stops,max=5){
  if(stops.length<=max)return [stops];
  const out=[];let i=0;
  while(i<stops.length-1){const part=stops.slice(i,Math.min(stops.length,i+max));out.push(part);if(i+max>=stops.length)break;i+=max-1}
  return out;
}
function drmQ(s){return s?.query||s?.zh||s?.th||''}
function drmGoogleUrl(stops){
  if(!stops?.length)return 'https://www.google.com/maps';
  if(stops.length===1)return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(drmQ(stops[0]))}`;
  const origin=encodeURIComponent(drmQ(stops[0])),destination=encodeURIComponent(drmQ(stops.at(-1)));
  const way=stops.slice(1,-1).map(x=>drmQ(x)).filter(Boolean);
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${way.length?`&waypoints=${encodeURIComponent(way.join('|'))}`:''}`;
}
/* Compatibility preview: official no-key Maps URLs are used for opening the route. The iframe uses Google's classic embed endpoint so the plan still has an inline preview without storing an API key in this public repo. */
function drmEmbedUrl(stops){
  if(!stops?.length)return '';
  if(stops.length===1)return `https://www.google.com/maps?q=${encodeURIComponent(drmQ(stops[0]))}&output=embed`;
  const origin=encodeURIComponent(drmQ(stops[0]));
  const dest=stops.slice(1).map(x=>encodeURIComponent(drmQ(x))).join('+to:');
  return `https://www.google.com/maps?output=embed&f=d&saddr=${origin}&daddr=${dest}`;
}
function drmStopLink(s){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(drmQ(s))}`}
function dayRouteMapCard(dayIndex){
  const d=DATA?.days?.[dayIndex],cfg=d?drmDay(d.date):null;if(!cfg?.stops?.length)return '';
  const segments=drmChunk(cfg.stops,5),raw=Number(state.dayMapSegment?.[d.date]||0),seg=Math.max(0,Math.min(segments.length-1,raw)),active=segments[seg];
  const segmentTabs=segments.length>1?`<div class="drm-segments">${segments.map((x,i)=>`<button type="button" class="chip ${i===seg?'active':''}" data-drm-segment="${dayIndex}:${i}">${drmt('segment')} ${i+1}</button>`).join('')}</div>`:'';
  return `<section class="day-route-map" data-day-route-map="${dayIndex}">
    <div class="drm-head"><div><small>${drmt('subtitle')}</small><h2>${drmt('title')}</h2></div><span>📍 ${cfg.stops.length}</span></div>
    <div class="drm-map-wrap"><iframe class="drm-map" title="${esc(drmt('title'))}" src="${esc(drmEmbedUrl(active))}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><div class="drm-online">Google Maps · ${drmt('online')}</div></div>
    ${segmentTabs}
    <div class="drm-actions"><a class="btn primary" href="${esc(drmGoogleUrl(active))}" target="_blank" rel="noopener">↗ ${drmt('open')}${segments.length>1?` · ${drmt('segment')} ${seg+1}`:''}</a></div>
    <div class="drm-stops">${cfg.stops.map((s,i)=>`<a href="${esc(drmStopLink(s))}" target="_blank" rel="noopener" class="drm-stop ${s.optional?'optional':''}"><i>${i+1}</i><span><b>${esc(state.lang==='zh'?s.zh:s.th)}</b><small>${esc(state.lang==='zh'?s.th:s.zh)}</small></span>${s.optional?`<em>${drmt('optional')}</em>`:''}</a>`).join('')}</div>
    <p class="drm-note">${esc(loc(DAY_ROUTE_MAPS.note))}</p><p class="drm-fallback">${drmt('fallback')}</p>
  </section>`;
}

async function loadDayRouteMaps(){
  try{
    const r=await fetch('../data/day-route-maps.json');if(!r.ok)throw new Error('route map data');DAY_ROUTE_MAPS=await r.json();
    if(typeof render==='function')render();
  }catch(err){console.warn('Daily route maps unavailable',err)}
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-drm-segment]');if(!b)return;
  const [di,si]=b.dataset.drmSegment.split(':').map(Number),d=DATA?.days?.[di];if(!d)return;
  state.dayMapSegment[d.date]=si;render();
});

loadDayRouteMaps();
