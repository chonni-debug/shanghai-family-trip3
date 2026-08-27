nav.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;state.tab=b.dataset.tab;if(state.tab==='more')state.moreView='menu';render()});
langBtn.addEventListener('click',()=>{state.lang=state.lang==='th'?'zh':'th';localStorage.setItem('sh-ui-language',state.lang);render()});
document.getElementById('helpBtn').addEventListener('click',openHelp);document.getElementById('emergencyBtn').addEventListener('click',openEmergency);document.getElementById('modalClose').addEventListener('click',closeModal);backdrop.addEventListener('click',closeModal);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

document.addEventListener('click',e=>{
  let b=e.target.closest('[data-tab-go]');if(b){state.tab=b.dataset.tabGo;render();return}
  b=e.target.closest('[data-more-go]');if(b){state.tab='more';state.moreView=b.dataset.moreGo;render();return}
  b=e.target.closest('[data-day]');if(b){state.selectedDay=Number(b.dataset.day);render();return}
  b=e.target.closest('[data-filter]');if(b){state.placeFilter=b.dataset.filter;render();return}
  b=e.target.closest('[data-done]');if(b){const yes=toggleSet('sh-done',b.dataset.done);toast(yes?tr('doneSaved'):tr('doneRemoved'));render();return}
  b=e.target.closest('[data-fav]');if(b){const yes=toggleSet('sh-favorites',b.dataset.fav);toast(yes?tr('addedFav'):tr('removedFav'));render();return}
  b=e.target.closest('[data-copy]');if(b){copyText(decodeURIComponent(b.dataset.copy));return}
  b=e.target.closest('[data-speak]');if(b){speak(decodeURIComponent(b.dataset.speak));return}
  b=e.target.closest('[data-show-cn-day]');if(b){const di=Number(b.dataset.showCnDay),ei=Number(b.dataset.showCnEvent);openChinese(DATA.days[di].events[ei]);return}
  b=e.target.closest('[data-show-place]');if(b){const p=uniqueExplorePlaces().find(x=>x.cn===b.dataset.showPlace);if(p)openChinese({name:p.name,cn:p.cn,route:p.note,en:p.en,city:p.city});return}
  b=e.target.closest('[data-more]');if(b){state.moreView=b.dataset.more;render();return}
  b=e.target.closest('[data-emergency]');if(b){openEmergency();return}
  b=e.target.closest('[data-driver]');if(b){openDriver();return}
  b=e.target.closest('[data-help]');if(b){openHelp();return}
  b=e.target.closest('[data-help-action]');if(b){const k=b.dataset.helpAction;if(k==='lost')showPhrase(DATA.phrases[0]);else if(k==='hotel')openDriver();else if(k==='toilet')showPhrase(DATA.phrases[2]);else if(['didi','metro','train','alipay'].includes(k))showGuide(k);else if(k==='signs'){closeModal();state.tab='more';state.moreView='signs';render()}else if(k==='food'){closeModal();state.tab='more';state.moreView='restaurant';render()}return}
  b=e.target.closest('[data-del-expense]');if(b){const ex=getExpenses();ex.splice(Number(b.dataset.delExpense),1);saveExpenses(ex);render();return}
  if(e.target.id==='resetChecklist'){if(confirm(tr('confirmReset'))){localStorage.removeItem('sh-checklist');render()}return}
  if(e.target.id==='exportData'){exportData();return}
  if(e.target.id==='startSim'){state.sim={active:true,day:Number(document.getElementById('simDay').value),time:document.getElementById('simTime').value||'09:00'};saveJSON('sh-sim-v3',state.sim);state.tab='home';render();return}
  if(e.target.id==='stopSim'){state.sim={active:false,day:0,time:'09:00'};saveJSON('sh-sim-v3',state.sim);state.tab='home';render();return}
});

document.addEventListener('input',e=>{if(e.target.id==='placeSearch'){state.placeQuery=e.target.value;const pos=e.target.selectionStart;app.innerHTML=renderExplore();const n=document.getElementById('placeSearch');n.focus();n.setSelectionRange(pos,pos)}});
document.addEventListener('change',e=>{
  if(e.target.matches('[data-check]')){const st=getChecklistState();st[e.target.dataset.check]=e.target.checked;saveJSON('sh-checklist',st);render()}
  if(e.target.id==='importData')importData(e.target.files?.[0]);
  if(e.target.id==='languageSelect'){state.lang=e.target.value;localStorage.setItem('sh-ui-language',state.lang);render()}
  if(e.target.id==='fontSizeSelect'){state.fontSize=e.target.value;localStorage.setItem('sh-text-size',state.fontSize);render()}
  if(e.target.id==='familySelect'){state.family=e.target.value;localStorage.setItem('sh-family-status',state.family);render()}
});
document.addEventListener('submit',e=>{
  if(e.target.id==='expenseForm'){e.preventDefault();const fd=new FormData(e.target),split=fd.getAll('split');if(!split.length)return;const ex=getExpenses();ex.push({title:fd.get('title'),amount:Number(fd.get('amount')),payer:fd.get('payer'),category:fd.get('category'),date:fd.get('date'),split});saveExpenses(ex);toast(tr('saved'));render()}
  if(e.target.id==='memberForm'){e.preventDefault();const m=new FormData(e.target).getAll('member').map(x=>String(x).trim()).filter(Boolean);saveJSON('sh-private-members',m);toast(tr('saved'));render()}
});

async function init(){
  try{const r=await fetch(DATA_URL,{cache:'no-store'});if(!r.ok)throw new Error('data');DATA=await r.json();state.selectedDay=Math.max(0,Math.min(DATA.days.length-1,tripStatus().day));render();if('serviceWorker' in navigator)navigator.serviceWorker.register('../sw.js').catch(()=>{})}
  catch(err){app.innerHTML=`<div class="card"><h2>${state.lang==='zh'?'无法加载数据':'โหลดข้อมูลไม่สำเร็จ'}</h2><p>${esc(err.message)}</p></div>`}
}
init();
