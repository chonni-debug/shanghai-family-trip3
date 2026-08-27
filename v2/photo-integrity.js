'use strict';

/*
 * Photo integrity policy
 * ----------------------
 * A photo is displayed only when its file has been explicitly approved for
 * the Chinese place name below. Reused neighbourhood/fallback photos are
 * removed at runtime instead of being presented as if they were the exact
 * destination. Day hero images are intentionally not audited because they
 * represent the day's overall mood/area rather than a single destination.
 */
const VERIFIED_PLACE_PHOTOS={
  '../images/photo-002.jpg':[/^外滩$/],
  '../images/photo-003.jpg':[/^豫园$/],
  '../images/photo-004.jpg':[/^武康大楼$/],
  '../images/photo-005.jpg':[/^玉佛禅寺$/],
  '../images/photo-006.jpg':[/^杭州西湖风景名胜区$/],
  '../images/photo-008.jpg':[/^新天地$/],
  '../images/photo-009.jpg':[/^静安寺$/],
  '../images/photo-010.jpg':[/^南京路步行街$/],
  '../images/photo-012.jpg':[/^陆家嘴$/],
  '../images/photo-041.jpg':[/^上海邮政博物馆$/],
  '../images/photo-042.jpg':[/^乍浦路桥\s*→\s*外白渡桥$/],
  '../images/photo-043.jpg':[/^田子坊$/],
  '../images/photo-044.jpg':[/^松鹤楼/],
  '../images/photo-046.jpg':[/^味香斋$/],
  '../images/photo-047.jpg':[/^裕兴记$/],
  '../images/photo-048.jpg':[/^大壶春$/],
  '../images/photo-049.jpg':[/^人和馆$/],
  '../images/photo-050.jpg':[/^国际饭店西饼屋$/],
  '../images/photo-052.jpg':[/^南翔馒头店/]
};

function photoMatchesPlace(image,cn){
  const rules=VERIFIED_PLACE_PHOTOS[image];
  return Boolean(rules&&rules.some(rule=>rule.test(String(cn||'').trim())));
}
function auditPlacePhoto(item){
  if(!item||!item.image)return;
  if(photoMatchesPlace(item.image,item.cn)){
    item.photoIntegrity='verified';
    return;
  }
  item.photoRemoved=item.image;
  delete item.image;
  item.photoIntegrity='unverified';
}
function applyPhotoIntegrity(data){
  if(!data)return data;
  (data.days||[]).forEach(day=>(day.events||[]).forEach(auditPlacePhoto));
  (data.places||[]).forEach(auditPlacePhoto);
  return data;
}
function photoMissingLabel(){
  return state.lang==='zh'?'暂无已核实的地点照片':'ยังไม่มีรูปสถานที่ที่ยืนยันแล้ว';
}
function photoMissingHint(){
  return state.lang==='zh'?'为避免误导，已隐藏不匹配或仅代表附近区域的照片。':'ซ่อนภาพที่ไม่ตรงหรือเป็นเพียงภาพย่าน เพื่อไม่ให้เข้าใจผิด';
}

/* Replace the two card renderers with integrity-aware versions. */
eventCard=function(e,di,ei){
  const k=eventKey(di,ei,e),done=getSet('sh-done').has(k),hasPhoto=Boolean(e.image);
  const photo=hasPhoto?`<div class="event-photo"><img src="${esc(e.image)}" alt="${esc(loc(e.name))}" loading="lazy"><span class="photo-verified-badge">✓ ${state.lang==='zh'?'地点照片':'รูปสถานที่'}</span></div>`:'';
  const integrity=e.photoIntegrity==='unverified'?`<div class="photo-integrity-note"><b>📷 ${photoMissingLabel()}</b><small>${photoMissingHint()}</small></div>`:'';
  return `<article class="event-card ${done?'done':''} ${hasPhoto?'':'no-photo'}">${photo}<div class="event-body">${integrity}<div class="event-top"><span class="time">${esc(e.time)}</span><div class="event-title"><h3>${esc(loc(e.name))}</h3>${state.lang==='th'?`<span class="cn">${esc(e.cn)}</span>`:`<span class="secondary">泰: ${esc(e.name.th||'')}</span>`}</div></div>${e.route?`<div class="event-detail"><b>${tr('route')}</b><br>${esc(loc(e.route))}</div>`:''}${e.meal?`<div class="event-detail"><b>${tr('meal')}</b><br>${esc(loc(e.meal))}</div>`:''}${e.arrival?`<div class="event-detail"><b>${tr('arrival')}</b><br>${esc(loc(e.arrival))}</div>`:''}<div class="actions"><a class="btn primary" href="${amapUrl(e)}" target="_blank" rel="noopener">${tr('openAmap')}</a><button class="btn" data-show-cn-day="${di}" data-show-cn-event="${ei}">${tr('showChinese')}</button><button class="btn ghost" data-copy="${encodeURIComponent(e.cn)}">${tr('copyChinese')}</button><button class="btn ${done?'danger':''}" data-done="${esc(k)}">${done?tr('undoDone'):tr('arrived')}</button></div></div></article>`;
};

placeCard=function(p){
  const k=placeKey(p),fav=getSet('sh-favorites').has(k),hasPhoto=Boolean(p.image);
  const photo=hasPhoto?`<div class="place-photo verified"><img src="${esc(p.image)}" alt="${esc(loc(p.name))}" loading="lazy"><span class="photo-verified-badge">✓</span></div>`:`<div class="place-photo placeholder"><span>📍</span><small>${p.photoIntegrity==='unverified'?photoMissingLabel():(state.lang==='zh'?'暂无照片':'ยังไม่มีรูป')}</small></div>`;
  return `<article class="place-card">${photo}<div class="place-body"><div class="place-head"><div><h3>${esc(loc(p.name))}</h3>${state.lang==='th'?`<div class="cn">${esc(p.cn)}</div>`:`<div class="secondary">泰: ${esc(p.name?.th||'')}</div>`}</div><button class="fav" data-fav="${esc(k)}">${fav?'★':'☆'}</button></div><p>${esc(loc(p.note)||'')}</p>${p.photoIntegrity==='unverified'?`<p class="photo-inline-warning">📷 ${photoMissingHint()}</p>`:''}${p.addr?`<p class="secondary">${tr('address')}: ${esc(p.addr)}</p>`:''}<div class="actions"><a class="btn primary" href="${amapUrl(p)}" target="_blank" rel="noopener">${tr('openAmap')}</a><a class="btn" href="${googleUrl(p)}" target="_blank" rel="noopener">${tr('openGoogle')}</a><button class="btn ghost" data-show-place="${esc(p.cn)}">${tr('showChinese')}</button></div></div></article>`;
};
