'use strict';

state.planExpanded=state.planExpanded||'';

const V3_TEXT={
  base:{th:'ฐานที่พัก',zh:'住宿基地'},
  overview:{th:'ภาพรวมวันนี้',zh:'今日概览'},
  detail:{th:'แตะเพื่อดูรายละเอียด',zh:'点击查看详情'},
  collapse:{th:'ย่อรายละเอียด',zh:'收起详情'},
  expand:{th:'ดูรายละเอียด',zh:'查看详情'},
  route:{th:'วิธีเดินทาง',zh:'出行方式'},
  meal:{th:'อาหาร / เมนู',zh:'餐饮 / 菜单'},
  arrival:{th:'เมื่อถึงแล้ว',zh:'到达后'},
  exactChinese:{th:'ข้อความจีนสำหรับค้นหา / ให้คนดู',zh:'用于搜索 / 给别人看的中文'},
  copy:{th:'Copy 中文',zh:'复制中文'},
  show:{th:'中文 ให้คนดู',zh:'展示中文'},
  speak:{th:'🔊 ฟังเสียง',zh:'🔊 播放'},
  arrived:{th:'ถึงแล้ว',zh:'已到达'},
  skip:{th:'ข้าม',zh:'跳过'},
  unskip:{th:'คืนกิจกรรม',zh:'恢复'},
  done:{th:'ไปแล้ว',zh:'已完成'},
  skipped:{th:'ข้ามแล้ว',zh:'已跳过'},
  optional:{th:'Optional',zh:'可选'},
  routePlan:{th:'เส้น City Walk แบบละเอียด',zh:'详细 City Walk 路线'},
  stops:{th:'จุด',zh:'站'},
  noVerifiedPhoto:{th:'ยังไม่มีรูปยืนยัน',zh:'暂无核实照片'},
  map:{th:'เปิด AMap',zh:'打开高德地图'},
  transport:{th:'เส้นทาง',zh:'路线'},
  walk:{th:'เดิน',zh:'步行'},
  taxi:{th:'DiDi / รถ',zh:'滴滴 / 汽车'},
  metro:{th:'Metro',zh:'地铁'},
  train:{th:'รถไฟ',zh:'火车'},
  flight:{th:'เที่ยวบิน',zh:'航班'},
  ferry:{th:'เรือ',zh:'轮渡'},
  items:{th:'รายการ',zh:'项'},
  completed:{th:'เสร็จแล้ว',zh:'已完成'}
};
function v3t(k){const v=V3_TEXT[k];return v?(v[state.lang]||v.th):k}
function v3Names(e){
  const th=e?.name?.th||loc(e?.name)||e?.en||'';
  const zh=e?.name?.zh||e?.cn||'';
  return state.lang==='zh'
    ? `<h3>${esc(zh||th)}</h3><div class="v3-second-name">ไทย · ${esc(th)}</div>`
    : `<h3>${esc(th)}</h3><div class="v3-cn-name">${esc(zh)}</div>`;
}
function v3DayDate(d){
  const x=new Date(`${d.date}T12:00:00`),wdTh=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์'],wdZh=['周日','周一','周二','周三','周四','周五','周六'];
  return state.lang==='zh'?`${wdZh[x.getDay()]} ${x.getMonth()+1}/${x.getDate()}`:`${wdTh[x.getDay()]} ${x.getDate()}/${x.getMonth()+1}`;
}
function v3Category(e){
  const labels={rest:{th:'พัก',zh:'休息'},flight:{th:'เที่ยวบิน',zh:'航班'},train:{th:'รถไฟ',zh:'高铁'},hotel:{th:'โรงแรม',zh:'酒店'}};
  if(labels[e.type])return labels[e.type][state.lang]||labels[e.type].th;
  const translated=UI[e.type];return translated?(translated[state.lang]||translated.th):e.type||'';
}
function v3Transport(e){
  const s=[e?.route?.th,e?.route?.zh,e?.cn,e?.type].filter(Boolean).join(' ');
  if(/DiDi|滴滴|รถรับ|汽车|car/i.test(s))return {icon:'🚕',label:v3t('taxi')};
  if(/Metro|地铁/i.test(s))return {icon:'🚇',label:v3t('metro')};
  if(/เดิน|步行|walk/i.test(s))return {icon:'🚶',label:v3t('walk')};
  if(/轮渡|ferry|เรือ/i.test(s))return {icon:'⛴',label:v3t('ferry')};
  if(e?.type==='train'||/高铁|火车/i.test(s))return {icon:'🚆',label:v3t('train')};
  if(e?.type==='flight'||/航班|airport|机场/i.test(s))return {icon:'✈️',label:v3t('flight')};
  return {icon:'↳',label:v3t('transport')};
}
function v3IsSkipped(di,ei,e){return typeof eventIsSkipped==='function'?eventIsSkipped(di,ei,e):false}
function v3IsOptional(e){return typeof isOptionalEvent==='function'?isOptionalEvent(e):false}
function v3Thumb(e){
  if(e.image)return `<div class="v3-thumb"><img src="${esc(e.image)}" alt="${esc(e.name?.th||e.name?.zh||'')}" loading="lazy" referrerpolicy="no-referrer"></div>`;
  return `<div class="v3-thumb v3-thumb-empty"><span>▧</span><small>${v3t('noVerifiedPhoto')}</small></div>`;
}
function v3Connector(e){
  const m=v3Transport(e);return `<div class="v3-connector"><span>${m.icon}</span><b>${esc(m.label)}</b><i></i><small>${v3t('transport')}</small></div>`;
}
function v3InfoBlock(title,value){return value?`<div class="v3-detail-block"><b>${title}</b><p>${esc(loc(value))}</p></div>`:''}
function v3PhotoCredit(e){return e.photoCredit&&typeof photoCreditBadge==='function'?`<div class="v3-photo-credit">${photoCreditBadge(e)}</div>`:''}
function v3MiniStops(e){
  const stops=e?.contentExtras?.miniStops||[];if(!stops.length)return '';
  return `<div class="v3-detail-block"><b>${state.lang==='zh'?'沿途停留点':'จุดแวะระหว่างทาง'}</b><div class="v3-mini-stops">${stops.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>`;
}
function v3Expanded(e,di,ei){
  const key=eventKey(di,ei,e),done=getSet('sh-done').has(key),skipped=v3IsSkipped(di,ei,e),exact=e.cn||e.name?.zh||'';
  const context=typeof contextualCard==='function'?contextualCard(di,e):'';
  return `<div class="v3-card-detail">
    <div class="v3-cn-copy"><div><small>${v3t('exactChinese')}</small><b>${esc(exact)}</b></div><button class="btn" data-copy="${encodeURIComponent(exact)}">${v3t('copy')}</button></div>
    ${v3InfoBlock(v3t('route'),e.route)}${v3InfoBlock(v3t('meal'),e.meal)}${v3InfoBlock(v3t('arrival'),e.arrival)}${v3MiniStops(e)}${v3PhotoCredit(e)}
    <div class="v3-detail-actions">
      <a class="btn primary" href="${amapUrl(e)}" target="_blank" rel="noopener">${v3t('map')}</a>
      <button class="btn" data-show-cn-day="${di}" data-show-cn-event="${ei}">${v3t('show')}</button>
      <button class="btn" data-speak="${encodeURIComponent(exact)}">${v3t('speak')}</button>
      <button class="btn ${done?'danger':''}" data-done="${esc(key)}">${done?tr('undoDone'):v3t('arrived')}</button>
      <button class="btn ${skipped?'primary':'ghost'}" data-skip-event="${di}:${ei}">${skipped?v3t('unskip'):v3t('skip')}</button>
    </div>
    ${context}
  </div>`;
}
function v3Card(e,di,ei){
  const key=`${di}:${ei}`,expanded=state.planExpanded===key,done=getSet('sh-done').has(eventKey(di,ei,e)),skipped=v3IsSkipped(di,ei,e),optional=v3IsOptional(e);
  return `<article class="v3-itinerary-card ${expanded?'expanded':''} ${done?'done':''} ${skipped?'skipped':''}">
    <button class="v3-card-summary" type="button" data-v3-toggle="${key}" aria-expanded="${expanded?'true':'false'}">
      <span class="v3-seq">${ei+1}</span>
      <span class="v3-card-copy">
        <span class="v3-time">${esc(e.time)}</span>
        ${v3Names(e)}
        <span class="v3-badges"><em>${esc(v3Category(e))}</em>${optional?`<em class="optional">◇ ${v3t('optional')}</em>`:''}${done?`<em class="done">✓ ${v3t('done')}</em>`:''}${skipped?`<em class="skipped">↷ ${v3t('skipped')}</em>`:''}</span>
        <small class="v3-expand-hint">${expanded?'⌃ '+v3t('collapse'):'⌄ '+v3t('expand')}</small>
      </span>
      ${v3Thumb(e)}
    </button>
    ${expanded?v3Expanded(e,di,ei):''}
  </article>`;
}
function v3DetailedWalk(d){
  const route=d?.contentRoute;if(!route?.sequence?.length)return '';
  return `<details class="v3-walk-detail"><summary><span>↝</span><div><b>${v3t('routePlan')}</b><small>${route.sequence.length} ${v3t('stops')}</small></div></summary><div class="v3-walk-sequence">${route.sequence.map((x,i)=>`<div><i>${i+1}</i><span><b>${esc(state.lang==='zh'?x.cn:x.th)}</b><small>${esc(state.lang==='zh'?x.th:x.cn)}</small></span></div>`).join('')}</div></details>`;
}
function v3DayChips(){return `<div class="v3-day-chips" aria-label="${tr('plan')}">${DATA.days.map((d,i)=>`<button class="v3-day-chip ${i===state.selectedDay?'active':''}" data-day="${i}" type="button"><small>Day ${i+1}</small><b>${esc(v3DayDate(d))}</b></button>`).join('')}</div>`}

renderPlan=function(){
  const d=DATA.days[state.selectedDay],done=getSet('sh-done'),skip=typeof skippedSet==='function'?skippedSet():new Set();
  const doneCount=d.events.filter((e,i)=>done.has(eventKey(state.selectedDay,i,e))).length,skipCount=d.events.filter((e,i)=>skip.has(eventKey(state.selectedDay,i,e))).length;
  const hotel=DATA.trip?.hotel;
  const cards=d.events.map((e,i)=>`${i?v3Connector(e):''}${v3Card(e,state.selectedDay,i)}`).join('');
  return `<section class="v3-plan">
    ${v3DayChips()}
    <header class="v3-day-header"><div><small>DAY ${state.selectedDay+1} · ${esc(v3DayDate(d))}</small><h1>${esc(state.lang==='zh'?d.title.zh:d.title.th)}</h1><div class="v3-day-zh">${esc(state.lang==='zh'?d.title.th:d.title.zh)}</div><p>${esc(loc(d.theme))}</p></div><div class="v3-day-stats"><b>${doneCount}/${d.events.length}</b><small>${v3t('completed')}</small>${skipCount?`<span>↷ ${skipCount}</span>`:''}</div></header>
    ${hotel?`<div class="v3-hotel-strip"><span>🏨</span><div><small>${v3t('base')}</small><b>${esc(loc(hotel.name))}</b><em>${esc(hotel.cn)}</em></div><button class="btn ghost" data-driver="hotel">中文</button></div>`:''}
    ${v3DetailedWalk(d)}
    <div class="v3-overview-label"><b>${v3t('overview')}</b><small>${d.events.length} ${v3t('items')} · ${v3t('detail')}</small></div>
    <div class="v3-timeline">${cards}</div>
  </section>`;
};

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-v3-toggle]');if(!b)return;
  const key=b.dataset.v3Toggle;state.planExpanded=state.planExpanded===key?'':key;render();
});
