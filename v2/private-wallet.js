'use strict';

const WALLET_KEY='sh-private-wallet-v1';
const WALLET_DB='shanghai-private-travel-wallet';
const WALLET_STORE='documents';
let walletPolicyVisible=false;
const walletDocState={loaded:false,loading:false,meta:null,error:''};

const WALLET_I18N={
  title:{th:'Private Travel Wallet',zh:'私人旅行钱包'},
  menu:{th:'🔐 ข้อมูลส่วนตัวในเครื่อง',zh:'🔐 本机私人资料'},
  menuHint:{th:'สมาชิก · กรมธรรม์ · Flight Ticket',zh:'成员 · 保单 · 机票文件'},
  onlyDevice:{th:'ข้อมูลส่วนนี้บันทึกเฉพาะในเบราว์เซอร์/แอปบนเครื่องนี้ ไม่ถูกส่งเข้า GitHub หรือ data model สาธารณะ',zh:'此处资料仅保存在本机浏览器/应用中，不会写入 GitHub 或公共数据模型'},
  notCloud:{th:'ไม่ใช่ Cloud backup — หากล้างข้อมูลเว็บไซต์/เปลี่ยนเครื่อง ข้อมูลอาจหาย ควรเก็บเอกสารต้นฉบับไว้อีกที่หนึ่ง',zh:'这不是云备份。清除网站数据或更换设备后资料可能丢失，请另行保留原始文件'},
  members:{th:'สมาชิกสำหรับหารค่าใช้จ่าย',zh:'费用分摊成员'},
  member:{th:'สมาชิก',zh:'成员'},
  insurance:{th:'ข้อมูลประกัน',zh:'保险资料'},
  provider:{th:'บริษัทประกัน',zh:'保险公司'},
  policy:{th:'เลขกรมธรรม์',zh:'保单号'},
  overseas:{th:'เบอร์ช่วยเหลือต่างประเทศ',zh:'海外援助电话'},
  service:{th:'เบอร์บริการลูกค้า',zh:'客服电话'},
  show:{th:'แสดง',zh:'显示'},hide:{th:'ซ่อน',zh:'隐藏'},
  save:{th:'บันทึกในเครื่องนี้',zh:'保存到本机'},saved:{th:'บันทึก Private Wallet แล้ว',zh:'私人钱包已保存'},
  document:{th:'Flight Ticket PDF',zh:'机票 PDF'},
  choosePdf:{th:'เลือก Flight Ticket PDF',zh:'选择机票 PDF'},
  noPdf:{th:'ยังไม่ได้เก็บ PDF ในเครื่องนี้',zh:'本机尚未保存 PDF'},
  localPdf:{th:'เก็บใน IndexedDB ของเครื่องนี้',zh:'保存在本机 IndexedDB'},
  open:{th:'เปิด PDF',zh:'打开 PDF'},download:{th:'บันทึกสำเนา',zh:'保存副本'},remove:{th:'ลบจากเครื่อง',zh:'从本机删除'},
  pdfSaved:{th:'เก็บ Flight Ticket ในเครื่องแล้ว',zh:'机票文件已保存到本机'},
  pdfRemoved:{th:'ลบ Flight Ticket จากเครื่องแล้ว',zh:'已从本机删除机票文件'},
  pdfOnly:{th:'กรุณาเลือกไฟล์ PDF',zh:'请选择 PDF 文件'},
  storageFail:{th:'เครื่องนี้ไม่สามารถเปิดพื้นที่เก็บเอกสารได้',zh:'本机无法打开文档存储空间'},
  privateBackup:{th:'สำรอง Private Profile',zh:'备份私人资料'},
  privateBackupHint:{th:'Export เฉพาะชื่อสมาชิกและข้อมูลประกันเป็น JSON ที่ไม่ได้เข้ารหัส ไม่รวม PDF โปรดเก็บไฟล์นี้ในที่ปลอดภัย',zh:'仅导出成员和保险资料为未加密 JSON，不包含 PDF，请妥善保管'},
  export:{th:'Export Private JSON',zh:'导出私人 JSON'},import:{th:'Import Private JSON',zh:'导入私人 JSON'},
  clear:{th:'ล้าง Private Wallet',zh:'清空私人钱包'},confirmClear:{th:'ลบข้อมูล Private Wallet และ Flight Ticket ที่เก็บในเครื่องนี้ทั้งหมด?',zh:'确定删除本机保存的私人钱包资料和机票文件吗？'},
  cleared:{th:'ล้าง Private Wallet แล้ว',zh:'私人钱包已清空'},
  policyLocal:{th:'กรมธรรม์ในเครื่อง',zh:'本机保单'},viewPolicy:{th:'เปิดเลขเต็ม',zh:'查看完整保单号'},
  walletNotInBackup:{th:'Backup ปกติของทริปจะไม่รวม Private Wallet หรือ Flight Ticket',zh:'普通行程备份不包含私人钱包或机票文件'},
  openWallet:{th:'เปิด Private Wallet',zh:'打开私人钱包'}
};
function wt(k){const v=WALLET_I18N[k];return v?(v[state.lang]||v.th):k}
function getWallet(){const p=loadJSON(WALLET_KEY,{});const members=Array.isArray(p.members)&&p.members.length?p.members:loadJSON('sh-private-members',[]);return {members,policyNo:p.policyNo||'',provider:p.provider||'',overseas:p.overseas||'',service:p.service||''}}
function saveWallet(p){saveJSON(WALLET_KEY,p);saveJSON('sh-private-members',(p.members||[]).filter(Boolean))}
function maskPolicy(v){const s=String(v||'').trim();if(!s)return '—';const tail=s.slice(-4);return '••••••'+tail}
function walletInsurance(){const p=getWallet(),pub=DATA?.trip?.insurance||{};return {provider:p.provider||pub.provider||'',overseas:p.overseas||pub.overseas||'',service:p.service||pub.service||'',policyNo:p.policyNo||''}}
function walletField(v){return esc(v||'')}
function formatBytes(n){n=Number(n)||0;if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(1)+' KB';return (n/1048576).toFixed(1)+' MB'}

function openWalletDb(){return new Promise((resolve,reject)=>{if(!('indexedDB' in window))return reject(new Error('IndexedDB unavailable'));const req=indexedDB.open(WALLET_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(WALLET_STORE))db.createObjectStore(WALLET_STORE,{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('IndexedDB'))})}
async function walletDocGet(){const db=await openWalletDb();return new Promise((resolve,reject)=>{const tx=db.transaction(WALLET_STORE,'readonly'),req=tx.objectStore(WALLET_STORE).get('flight-ticket');req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})}
async function walletDocPut(file){const db=await openWalletDb();return new Promise((resolve,reject)=>{const tx=db.transaction(WALLET_STORE,'readwrite');tx.objectStore(WALLET_STORE).put({id:'flight-ticket',name:file.name||'Flight Ticket.pdf',type:file.type||'application/pdf',size:file.size||0,updatedAt:Date.now(),blob:file});tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function walletDocDelete(){const db=await openWalletDb();return new Promise((resolve,reject)=>{const tx=db.transaction(WALLET_STORE,'readwrite');tx.objectStore(WALLET_STORE).delete('flight-ticket');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function refreshWalletDocMeta(rerender=false){if(walletDocState.loading)return;walletDocState.loading=true;try{const d=await walletDocGet();walletDocState.meta=d?{name:d.name,size:d.size,updatedAt:d.updatedAt}:null;walletDocState.error=''}catch(e){walletDocState.error=wt('storageFail');walletDocState.meta=null}finally{walletDocState.loaded=true;walletDocState.loading=false;if(rerender&&state.tab==='more'&&state.moreView==='wallet')render()}}
async function saveWalletPdf(file){if(!file)return;if(file.type&&file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name||'')){toast(wt('pdfOnly'));return}try{await walletDocPut(file);walletDocState.loaded=false;await refreshWalletDocMeta(false);toast(wt('pdfSaved'));if(state.tab==='more'&&state.moreView==='wallet')render()}catch(e){toast(wt('storageFail'))}}
async function removeWalletPdf(){try{await walletDocDelete();walletDocState.meta=null;walletDocState.loaded=true;toast(wt('pdfRemoved'));render()}catch(e){toast(wt('storageFail'))}}
async function openWalletPdf(download=false){let win=null;if(!download)try{win=window.open('about:blank','_blank')}catch{}try{const d=await walletDocGet();if(!d?.blob){if(win)win.close();toast(wt('noPdf'));return}const url=URL.createObjectURL(d.blob);if(download){const a=document.createElement('a');a.href=url;a.download=d.name||'Flight Ticket.pdf';document.body.appendChild(a);a.click();a.remove()}else if(win){win.location=url}else{const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove()}setTimeout(()=>URL.revokeObjectURL(url),60000)}catch(e){if(win)win.close();toast(wt('storageFail'))}}

function renderPrivateWallet(){const p=getWallet(),ins=walletInsurance(),meta=walletDocState.meta;const policyType=walletPolicyVisible?'text':'password';if(!walletDocState.loaded&&!walletDocState.loading)setTimeout(()=>refreshWalletDocMeta(true),0);return `${backMore()}<div class="section-head"><h2>🔐 ${wt('title')}</h2><span>${state.lang==='zh'?'LOCAL ONLY':'LOCAL ONLY'}</span></div><div class="wallet-local-banner"><b>🔒 ${wt('onlyDevice')}</b><small>${wt('notCloud')}</small></div><form id="privateWalletForm"><div class="card"><h3>${wt('members')}</h3><div class="form-grid">${[0,1,2,3].map(i=>`<input class="input" name="member" value="${walletField(p.members[i]||'')}" placeholder="${wt('member')} ${i+1}" autocomplete="off">`).join('')}</div></div><div class="card"><h3>${wt('insurance')}</h3><label class="wallet-label">${wt('provider')}<input class="input" name="provider" value="${walletField(ins.provider)}" autocomplete="organization"></label><label class="wallet-label">${wt('policy')}<div class="wallet-policy-row"><input class="input" name="policyNo" type="${policyType}" value="${walletField(p.policyNo)}" autocomplete="off" spellcheck="false"><button class="btn" type="button" id="walletTogglePolicy">${walletPolicyVisible?wt('hide'):wt('show')}</button></div></label><div class="form-grid"><label class="wallet-label">${wt('overseas')}<input class="input" name="overseas" value="${walletField(ins.overseas)}" inputmode="tel" autocomplete="tel"></label><label class="wallet-label">${wt('service')}<input class="input" name="service" value="${walletField(ins.service)}" inputmode="tel" autocomplete="tel"></label></div><button class="btn primary wallet-save" type="submit">${wt('save')}</button></div></form><div class="card"><h3>📄 ${wt('document')}</h3><p class="secondary">${wt('localPdf')}</p>${walletDocState.error?`<div class="notice">${esc(walletDocState.error)}</div>`:meta?`<div class="wallet-doc"><div><b>${esc(meta.name)}</b><small>${formatBytes(meta.size)} · ${new Date(meta.updatedAt).toLocaleString()}</small></div><span>✓ Local</span></div><div class="actions"><button class="btn primary" type="button" id="walletOpenPdf">${wt('open')}</button><button class="btn" type="button" id="walletDownloadPdf">${wt('download')}</button><button class="btn danger" type="button" id="walletDeletePdf">${wt('remove')}</button></div>`:`<p>${walletDocState.loaded?wt('noPdf'):'…'}</p>`}<label class="btn ghost wallet-file">${wt('choosePdf')}<input id="walletPdfInput" type="file" accept="application/pdf,.pdf" hidden></label></div><div class="card"><h3>💾 ${wt('privateBackup')}</h3><p>${wt('privateBackupHint')}</p><div class="actions"><button class="btn" type="button" id="walletExportPrivate">${wt('export')}</button><label class="btn">${wt('import')}<input id="walletImportPrivate" type="file" accept="application/json" hidden></label></div><p class="secondary">${wt('walletNotInBackup')}</p></div><button class="btn danger" type="button" id="walletClear">${wt('clear')}</button>`}

function exportPrivateWallet(){const payload={version:1,type:'shanghai-private-travel-wallet',exportedAt:new Date().toISOString(),profile:getWallet()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='shanghai-private-wallet.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function importPrivateWallet(file){if(!file)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result),p=d.profile||d;if(!p||typeof p!=='object')throw new Error('profile');saveWallet({members:Array.isArray(p.members)?p.members.map(x=>String(x).trim()).filter(Boolean).slice(0,4):[],policyNo:String(p.policyNo||''),provider:String(p.provider||''),overseas:String(p.overseas||''),service:String(p.service||'')});toast(tr('importOk'));render()}catch{toast(tr('invalidFile'))}};r.readAsText(file)}

const renderMoreBeforeWallet=renderMore;
renderMore=function(){if(state.moreView==='wallet')return renderPrivateWallet();const html=renderMoreBeforeWallet();if(state.moreView!=='menu')return html;const needle='<button class="more-btn" data-more="backup">';const wallet=`<button class="more-btn" data-more="wallet"><b>${wt('menu')}</b><small>${wt('menuHint')}</small></button>`;return html.includes(needle)?html.replace(needle,wallet+needle):html+wallet};

const renderTripBeforeWallet=renderTrip;
renderTrip=function(){const html=renderTripBeforeWallet(),p=getWallet();if(!p.policyNo)return html;return html+`<div class="card wallet-private-summary"><h3>🔐 ${wt('policyLocal')}</h3><p><b>${esc(maskPolicy(p.policyNo))}</b></p><button class="btn" data-wallet-policy-modal="1">${wt('viewPolicy')}</button></div>`};

const openEmergencyBeforeWallet=openEmergency;
openEmergency=function(){const t=DATA.trip,ins=walletInsurance(),policy=ins.policyNo;openModal(tr('sos'),'110 · 119 · 120',`<div class="sos-grid">${t.emergency.map(x=>`<a class="sos" href="tel:${esc(x.number)}"><b>${esc(loc(x.label))}</b><strong>${esc(x.number)}</strong></a>`).join('')}</div><div class="card"><h3>🏨 ${tr('backHotel')}</h3><div class="driver-cn" style="font-size:28px">${esc(t.hotel.cn)}</div><div class="driver-address">${esc(t.hotel.address)}</div><div class="actions"><button class="btn primary" data-driver="hotel">${tr('driverTitle')}</button><a class="btn" href="tel:${esc(t.hotel.phone.replace(/[^+\d]/g,''))}">${tr('call')}</a></div></div><div class="card"><h3>✚ ${tr('insurance')}</h3>${ins.provider?`<p><b>${esc(ins.provider)}</b></p>`:''}${policy?`<p>${wt('policy')}: <b>${esc(maskPolicy(policy))}</b></p><button class="btn" data-wallet-policy-modal="1">${wt('viewPolicy')}</button>`:''}${ins.overseas?`<a class="btn primary" href="tel:${esc(ins.overseas.replace(/\s/g,''))}">${tr('call')} ${esc(ins.overseas)}</a>`:''}<button class="btn ghost" data-wallet-open="1">${wt('openWallet')}</button></div>`)};

exportData=function(){const data={version:4,exportedAt:new Date().toISOString(),checklist:getChecklistState(),expenses:getExpenses(),done:[...getSet('sh-done')],favorites:[...getSet('sh-favorites')],settings:{language:state.lang,fontSize:state.fontSize,family:state.family},privateWalletExcluded:true};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='shanghai-trip-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};

document.addEventListener('submit',e=>{if(e.target.id!=='privateWalletForm')return;e.preventDefault();const fd=new FormData(e.target);saveWallet({members:fd.getAll('member').map(x=>String(x).trim()).filter(Boolean).slice(0,4),policyNo:String(fd.get('policyNo')||'').trim(),provider:String(fd.get('provider')||'').trim(),overseas:String(fd.get('overseas')||'').trim(),service:String(fd.get('service')||'').trim()});toast(wt('saved'));render()});
document.addEventListener('change',e=>{if(e.target.id==='walletPdfInput')saveWalletPdf(e.target.files?.[0]);if(e.target.id==='walletImportPrivate')importPrivateWallet(e.target.files?.[0])});
document.addEventListener('click',async e=>{if(e.target.closest('#walletTogglePolicy')){walletPolicyVisible=!walletPolicyVisible;render();return}if(e.target.closest('#walletOpenPdf')){openWalletPdf(false);return}if(e.target.closest('#walletDownloadPdf')){openWalletPdf(true);return}if(e.target.closest('#walletDeletePdf')){if(confirm(wt('remove')+'?'))await removeWalletPdf();return}if(e.target.closest('#walletExportPrivate')){exportPrivateWallet();return}if(e.target.closest('#walletClear')){if(!confirm(wt('confirmClear')))return;localStorage.removeItem(WALLET_KEY);localStorage.removeItem('sh-private-members');try{await walletDocDelete()}catch{}walletDocState.meta=null;walletDocState.loaded=true;walletPolicyVisible=false;toast(wt('cleared'));render();return}if(e.target.closest('[data-wallet-open]')){closeModal();state.tab='more';state.moreView='wallet';render();return}if(e.target.closest('[data-wallet-policy-modal]')){const p=getWallet();if(!p.policyNo)return;openModal(wt('policy'),wt('onlyDevice'),`<div class="driver-cn" style="font-size:30px">${esc(p.policyNo)}</div><div class="actions"><button class="btn primary" data-copy="${encodeURIComponent(p.policyNo)}">${tr('copyChinese').replace('中文','')}</button></div>`);return}});
