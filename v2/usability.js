'use strict';

const UX_TEXT={
  moreActions:{th:'ตัวเลือกเพิ่มเติม',zh:'更多操作'},
  viewFullDay:{th:'ดูแผนทั้งวัน',zh:'查看全天行程'},
  nextTwo:{th:'2 จุดถัดไป',zh:'接下来2站'},
  backHotel:{th:'กลับโรงแรม',zh:'返回酒店'},
  preTrip:{th:'ก่อนเดินทาง',zh:'出发前'},
  duringTrip:{th:'ช่วยระหว่างเที่ยว',zh:'旅途中帮助'},
  privateData:{th:'ข้อมูลส่วนตัว',zh:'私人资料'},
  preferences:{th:'ตั้งค่า',zh:'设置'},
  quickExpense:{th:'เพิ่มค่าใช้จ่ายแบบเร็ว',zh:'快速记一笔'},
  expenseNote:{th:'ใส่ยอดก่อน ส่วนที่เหลือใช้ค่าล่าสุด/หารทุกคนเป็นค่าเริ่มต้น',zh:'先输入金额，其余默认使用上次设置并平均分摊'},
  optionalTitle:{th:'รายละเอียด (ไม่บังคับ)',zh:'备注（可选）'},
  splitOptions:{th:'ปรับคนที่หาร',zh:'调整分摊成员'},
  membersInWallet:{th:'ชื่อสมาชิกจัดการใน Private Travel Wallet เพื่อมีแหล่งเดียว',zh:'成员姓名统一在私人旅行钱包中管理'},
  openWallet:{th:'เปิด Private Travel Wallet',zh:'打开私人旅行钱包'},
  familyTired:{th:'ครอบครัวเริ่มเหนื่อย — แนะนำ DiDi และตัดจุด Optional ออกก่อน',zh:'家人开始累了 — 优先打车并减少可选行程'},
  familyRest:{th:'ควรพักก่อน — ใช้ “กลับโรงแรม” ได้ทันที',zh:'建议先休息 — 可直接点击“返回酒店”'},
  start:{th:'เริ่มเดินทาง',zh:'开始出发'},
  arrived:{th:'ถึงแล้ว',zh:'已到达'}
};
function ux(k){const v=UX_TEXT[k];return v?(v[state.lang]||v.th):k}

/* Global hotel shortcut: icon only so it remains usable on narrow iPhones. */
(function addHotelShortcut(){
  const actions=document.querySelector('.header-actions');
  if(!actions||document.getElementById('quickHotelBtn'))return;
  const b=document.createElement('button');
  b.className='header-btn hotel-quick-btn';b.id='quickHotelBtn';b.type='button';b.textContent='🏨';
  actions.insertBefore(b,document.getElementById('langBtn'));
  b.addEventListener('click',()=>{if(DATA)openDriver();});
})();

function familyAdvice(){
  if(state.family==='rest')return `<div class="family-advice rest">🛋 ${ux('familyRest')}</div>`;
  if(state.family==='tired')return `<div class="family-advice tired">😮‍💨 ${ux('familyTired')}</div>`;
  return '';
}

function compactEventPhoto(e){
  if(!e.image)return '';
  return `<div class="event-photo"><img src="${esc(e.image)}" alt="${esc(loc(e.name))}" loading="lazy" referrerpolicy="no-referrer"><span class="photo-verified-badge">✓ ${state.lang==='zh'?'地点照片':'รูปสถานที่'}</span>${typeof photoCreditBadge==='function'?photoCreditBadge(e):''}</div>`;
}

/* Two primary actions only. Everything else lives behind •••. */
eventCard=function(e,di,ei){
  const k=eventKey(di,ei,e),done=getSet('sh-done').has(k),hasPhoto=Boolean(e.image);
  const integrity=e.photoIntegrity==='unverified'?`<div class="photo-integrity-note"><b>📷 ${photoMissingLabel()}</b><small>${photoMissingHint()}</small></div>`:'';
  return `<article class="event-card ${done?'done':''} ${hasPhoto?'':'no-photo'}">${compactEventPhoto(e)}<div class="event-body">${integrity}<div class="event-top"><span class="time">${esc(e.time)}</span><div class="event-title"><h3>${esc(loc(e.name))}</h3>${state.lang==='th'?`<span class="cn">${esc(e.cn)}</span>`:`<span class="secondary">泰: ${esc(e.name.th||'')}</span>`}</div></div>${e.route?`<div class="event-detail"><b>${tr('route')}</b><br>${esc(loc(e.route))}</div>`:''}${e.meal?`<div class="event-detail"><b>${tr('meal')}</b><br>${esc(loc(e.meal))}</div>`:''}${e.arrival?`<div class="event-detail"><b>${tr('arrival')}</b><br>${esc(loc(e.arrival))}</div>`:''}<div class="actions event-primary-actions"><a class="btn primary" href="${amapUrl(e)}" target="_blank" rel="noopener">${ux('start')}</a><button class="btn ${done?'danger':''}" data-done="${esc(k)}">${done?tr('undoDone'):ux('arrived')}</button></div><button class="event-more-btn" data-event-more="${di}:${ei}" type="button">••• ${ux('moreActions')}</button></div></article>`;
};

function openEventMore(di,ei){
  const e=DATA.days?.[di]?.events?.[ei];if(!e)return;
  const google=typeof googleUrl==='function'?googleUrl(e):'';
  openModal(ux('moreActions'),loc(e.name),`<div class="quick-action-grid"><button class="btn primary" data-show-cn-day="${di}" data-show-cn-event="${ei}">${tr('showChinese')}</button><button class="btn" data-copy="${encodeURIComponent(e.cn||'')}">${tr('copyChinese')}</button><button class="btn" data-speak="${encodeURIComponent(e.cn||'')}">${tr('speak')}</button><a class="btn" href="${amapUrl(e)}" target="_blank" rel="noopener">${tr('openAmap')}</a>${google?`<a class="btn" href="${google}" target="_blank" rel="noopener">${tr('openGoogle')}</a>`:''}<button class="btn ghost" data-driver="hotel">🏨 ${ux('backHotel')}</button></div>`);
}

document.addEventListener('click',e=>{
  const more=e.target.closest('[data-event-more]');
  if(more){const [di,ei]=more.dataset.eventMore.split(':').map(Number);openEventMore(di,ei);return;}
  if(e.target.closest('[data-today-plan]')){state.selectedDay=Number(e.target.closest('[data-today-plan]').dataset.todayPlan)||0;state.tab='plan';render();return;}
});

/* Today becomes a controller + only two upcoming cards. Full timeline stays in Plan. */
renderHome=function(){
  const s=tripStatus(),d=DATA.days[s.day],done=getSet('sh-done'),todayDone=d.events.filter((e,i)=>done.has(eventKey(s.day,i,e))).length,total=getExpenses().reduce((a,x)=>a+Number(x.amount||0),0);
  let label=s.phase==='before'?`${tr('countdown')} · ${tr('daysLeft',{n:s.daysLeft})}`:s.phase==='after'?tr('tripEnded'):`Day ${s.day+1} · ${loc(d.short)}`;if(s.sim)label=s.label;
  let startIdx=0,journey='';
  if(s.phase==='before'){
    const e=d.events[0];
    journey=`<section class="journey-card"><div class="journey-kicker">${tr('nextStep')}</div><h2>${tr('countdown')}</h2><div class="cn-primary">${esc(loc(e.name))}</div><p class="secondary">${esc(e.cn)}</p><div class="notice">${tr('daysLeft',{n:s.daysLeft})}</div><div class="actions"><button class="btn primary" data-tab-go="plan">${tr('plan')}</button><button class="btn" data-more-go="settings">${tr('simulator')}</button></div></section>`;
  }else{
    const c=nextContext(s.day,s.minutes),e=c.current;startIdx=Math.max(0,c.idx||0);const leave=e?hhmm(minutes(e.time)-bufferFor(e)):'';
    journey=`<section class="journey-card">${s.sim?`<div class="sim-banner">${tr('simulation')}</div>`:''}<div class="journey-top"><span class="journey-kicker">${tr('nextStep')}</span><span class="pill">${esc(s.time)}</span></div>${e?`<h2>${esc(loc(e.name))}</h2><div class="cn-primary">${esc(e.cn)}</div><div class="journey-strip"><div><small>${tr('previous')}</small><b>${esc(c.prev?loc(c.prev.name):'—')}</b></div><div><small>${tr('current')}</small><b>${esc(loc(e.name))}</b></div><div><small>${tr('next')}</small><b>${esc(c.next?loc(c.next.name):'—')}</b></div></div><div class="travel-grid"><div><small>${tr('leaveAt')}</small><b>${esc(leave)}</b></div><div><small>${tr('arriveAt')}</small><b>${esc(e.time)}</b></div></div>${e.route?`<div class="event-detail"><b>${tr('route')}</b><br>${esc(loc(e.route))}</div>`:''}${familyAdvice()}<div class="actions"><a class="btn primary" href="${amapUrl(e)}" target="_blank" rel="noopener">${ux('start')}</a><button class="btn" data-done="${esc(eventKey(s.day,c.idx,e))}">${done.has(eventKey(s.day,c.idx,e))?tr('undoDone'):ux('arrived')}</button></div><button class="btn ghost hotel-inline" data-driver="hotel">🏨 ${ux('backHotel')}</button>`:`<p>${tr('tripEnded')}</p>`}</section>`;
  }
  const next=d.events.slice(startIdx,startIdx+2);
  return `${hero(d,label)}<div class="stats"><div class="stat"><b>${todayDone}/${d.events.length}</b><small>${tr('doneToday')}</small></div><div class="stat"><b>★ ${getSet('sh-favorites').size}</b><small>${tr('favorites')}</small></div><div class="stat"><b>¥${total.toFixed(0)}</b><small>${tr('expenses')}</small></div></div>${journey}<div class="section-head"><h2>${ux('nextTwo')}</h2><span>${loc(d.short)}</span></div>${next.map((e,i)=>eventCard(e,s.day,startIdx+i)).join('')}<button class="btn full-day-btn" data-today-plan="${s.day}">${ux('viewFullDay')}</button>`;
};

/* Quick expense entry: amount first, remember payer/category, split all by default. */
renderBudget=function(){
  const ex=getExpenses(),total=ex.reduce((a,x)=>a+Number(x.amount||0),0),members=getMembers(),settle=settlements(ex),lastPayer=localStorage.getItem('sh-last-payer')||members[0]||'',lastCat=localStorage.getItem('sh-last-category')||'food';
  const day=DATA.days[Math.max(0,Math.min(DATA.days.length-1,tripStatus().day))];
  return `<div class="budget-summary"><div class="card"><div class="money">¥${total.toFixed(2)}</div><small>${tr('totalSpent')}</small></div><div class="card"><div class="money">${ex.length}</div><small>${tr('records')}</small></div></div><div class="card quick-expense-card"><h3>${ux('quickExpense')}</h3><p class="secondary">${ux('expenseNote')}</p><form id="expenseForm" class="quick-expense-form"><input class="input amount-big" name="amount" type="number" min="0" step="0.01" inputmode="decimal" placeholder="¥ 0.00" required><input class="input" name="title" placeholder="${ux('optionalTitle')}"><div class="quick-categories">${Object.keys(UI.categories).map(k=>`<label><input type="radio" name="category" value="${k}" ${k===lastCat?'checked':''}><span>${esc(categoryLabel(k))}</span></label>`).join('')}</div><select class="input" name="payer">${members.map(m=>`<option ${m===lastPayer?'selected':''}>${esc(m)}</option>`).join('')}</select><input type="hidden" name="date" value="${esc(day.date)}"><details class="split-details"><summary>${ux('splitOptions')}</summary><div class="member-chips">${members.map(m=>`<label class="member-check"><input type="checkbox" name="split" value="${esc(m)}" checked> ${esc(m)}</label>`).join('')}</div></details><button class="btn primary" type="submit">${tr('save')}</button></form></div><div class="card"><h3>${tr('settlement')}</h3>${settle.length?settle.map(x=>`<p>💸 ${esc(x)}</p>`).join(''):`<p>${tr('noSettlement')}</p>`}</div><div class="card"><h3>${tr('recent')}</h3>${ex.length?ex.slice().reverse().map((e,ri)=>{const idx=ex.length-1-ri;return `<div class="expense-row"><div><b>${esc(e.title||categoryLabel(e.category))}</b><small>${esc(e.date)} · ${esc(categoryLabel(e.category))} · ${esc(e.payer)}</small></div><div><b>¥${Number(e.amount).toFixed(2)}</b><button class="btn danger" data-del-expense="${idx}">${tr('delete')}</button></div></div>`}).join(''):`<div class="empty">${tr('noExpense')}</div>`}</div>`;
};
document.addEventListener('submit',e=>{if(e.target.id!=='expenseForm')return;const fd=new FormData(e.target);localStorage.setItem('sh-last-payer',String(fd.get('payer')||''));localStorage.setItem('sh-last-category',String(fd.get('category')||'food'));});

/* More is grouped by user goal. Existing detail screens remain unchanged. */
const renderMoreBeforeUx=renderMore;
renderMore=function(){
  if(state.moreView!=='menu')return renderMoreBeforeUx();
  return `<div class="more-section"><h3>${ux('preTrip')}</h3><div class="more-grid"><button class="more-btn" data-more="checklist"><b>✓ ${tr('checklist')}</b><small>${tr('checklistProgress')}</small></button><button class="more-btn" data-more="trip"><b>ⓘ ${tr('tripInfo')}</b><small>${tr('flights')} · ${tr('hotelInfo')}</small></button></div></div><div class="more-section"><h3>${ux('duringTrip')}</h3><div class="more-grid"><button class="more-btn" data-more="signs"><b>字 ${tr('signs')}</b><small>出口 · 换乘 · 检票口</small></button><button class="more-btn" data-more="restaurant"><b>🍜 ${tr('restaurant')}</b><small>不要辣 · 买单 · 打包</small></button><button class="more-btn danger-zone" data-emergency="1"><b>✚ ${tr('sos')}</b><small>110 · 119 · 120</small></button><button class="more-btn" data-driver="hotel"><b>🏨 ${ux('backHotel')}</b><small>${esc(DATA.trip.hotel.cn)}</small></button></div></div><div class="more-section"><h3>${ux('privateData')}</h3><div class="more-grid"><button class="more-btn" data-more="wallet"><b>🔐 Private Travel Wallet</b><small>${state.lang==='zh'?'成员 · 保单 · 机票':'สมาชิก · ประกัน · Flight Ticket'}</small></button><button class="more-btn" data-more="backup"><b>💾 ${tr('backup')}</b><small>JSON</small></button></div></div><div class="more-section"><h3>${ux('preferences')}</h3><div class="more-grid one"><button class="more-btn" data-more="settings"><b>⚙ ${tr('settings')}</b><small>${tr('language')} · A+ · ${tr('simulator')}</small></button></div></div>`;
};

renderSettings=function(){
  const sim=state.sim||{active:false,day:0,time:'09:00'};
  return `${backMore()}<div class="section-head"><h2>${tr('settings')}</h2><span>${state.lang==='zh'?'本机':'ในเครื่อง'}</span></div><div class="card"><div class="settings-row"><b>${tr('language')}</b><select class="input" id="languageSelect"><option value="th" ${state.lang==='th'?'selected':''}>ไทย</option><option value="zh" ${state.lang==='zh'?'selected':''}>中文</option></select></div><div class="settings-row"><b>${tr('fontSize')}</b><select class="input" id="fontSizeSelect"><option value="normal" ${state.fontSize==='normal'?'selected':''}>${tr('normal')}</option><option value="large" ${state.fontSize==='large'?'selected':''}>${tr('large')}</option><option value="xlarge" ${state.fontSize==='xlarge'?'selected':''}>${tr('xlarge')}</option></select></div><div class="settings-row"><b>${tr('familyStatus')}</b><select class="input" id="familySelect"><option value="normal" ${state.family==='normal'?'selected':''}>${tr('familyNormal')}</option><option value="tired" ${state.family==='tired'?'selected':''}>${tr('familyTired')}</option><option value="rest" ${state.family==='rest'?'selected':''}>${tr('familyRest')}</option></select></div></div><div class="card"><h3>🔐 Private Travel Wallet</h3><p class="secondary">${ux('membersInWallet')}</p><button class="btn primary" data-more="wallet">${ux('openWallet')}</button></div><div class="card"><h3>${tr('simulator')}</h3><p>${tr('simulatorHint')}</p><div class="form-grid"><select id="simDay" class="input">${DATA.days.map((d,i)=>`<option value="${i}" ${Number(sim.day)===i?'selected':''}>Day ${i+1} · ${esc(loc(d.short))}</option>`).join('')}</select><input id="simTime" class="input" type="time" value="${esc(sim.time||'09:00')}"><button class="btn primary" id="startSim">${tr('startSim')}</button><button class="btn" id="stopSim">${tr('stopSim')}</button></div></div>`;
};

/* Keep the header shortcut labels in sync with language changes. */
const renderBeforeUx=render;
render=function(){renderBeforeUx();const b=document.getElementById('quickHotelBtn');if(b){b.title=ux('backHotel');b.setAttribute('aria-label',ux('backHotel'));}};
