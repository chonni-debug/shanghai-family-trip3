'use strict';

/*
 * Private Travel Wallet storage guard
 * -----------------------------------
 * Safari Private Browsing and some restricted browser contexts can expose
 * IndexedDB but reject database opens/writes. Never pretend a PDF was saved
 * when persistent document storage is unavailable. Instead, show a clear
 * device-local recovery path and keep the original file picker disabled once
 * the failure is known.
 */
const walletStorageGuardState={checked:false,available:null,reason:'',detail:''};

Object.assign(WALLET_I18N,{
  storageUnavailable:{
    th:'พื้นที่เก็บเอกสารแบบถาวรใช้ไม่ได้ในแท็บนี้',
    zh:'当前标签页无法使用持久文档存储'
  },
  privateModeLikely:{
    th:'มักเกิดเมื่อเปิด Safari แบบ Private หรือเมื่อเบราว์เซอร์จำกัดพื้นที่เก็บข้อมูล',
    zh:'这通常发生在 Safari 无痕浏览或浏览器限制存储时'
  },
  privateModeSteps:{
    th:'วิธีแก้: ออกจาก Private → เปิด Safari แท็บปกติ → เปิดเว็บหลักอีกครั้ง แล้วค่อยเลือก Flight Ticket PDF',
    zh:'解决方法：退出无痕浏览 → 使用普通 Safari 标签页 → 重新打开主网站，再选择机票 PDF'
  },
  privateDataWarning:{
    th:'ข้อมูล Private Wallet ที่กรอกใน Private tab อาจหายเมื่อปิดแท็บ จึงควรบันทึกใหม่ใน Safari ปกติ',
    zh:'在无痕标签页填写的私人钱包资料可能在关闭后消失，请在普通 Safari 中重新保存'
  },
  quotaFail:{
    th:'พื้นที่เก็บข้อมูลของเว็บไซต์ไม่พอสำหรับ PDF นี้ กรุณาเพิ่มพื้นที่ว่างหรือลองไฟล์ที่เล็กลง',
    zh:'网站存储空间不足以保存此 PDF，请释放设备空间或使用更小的文件'
  },
  storageTryNormal:{
    th:'เปิดใน Safari ปกติ',
    zh:'请使用普通 Safari'
  }
});

function walletStorageErrorKind(err){
  const name=String(err?.name||'');
  const msg=String(err?.message||'');
  if(name==='QuotaExceededError'||/quota|space|storage full/i.test(msg))return 'quota';
  if(name==='SecurityError'||name==='InvalidStateError'||name==='UnknownError'||/private|security|denied|not allowed|database/i.test(msg))return 'restricted';
  return 'restricted';
}
function walletStorageMessage(kind){return kind==='quota'?wt('quotaFail'):`${wt('storageUnavailable')} — ${wt('privateModeLikely')}`}
function walletStorageHelpHtml(kind){
  if(kind==='quota')return `<div class="wallet-storage-help"><b>⚠️ ${esc(wt('quotaFail'))}</b><p>${state.lang==='zh'?'请确认 iPhone 有足够可用空间，然后重新打开本页再试。':'ตรวจพื้นที่ว่างของ iPhone แล้วเปิดหน้านี้ใหม่ก่อนลองอีกครั้ง'}</p></div>`;
  return `<div class="wallet-storage-help"><b>🔒 ${esc(wt('storageUnavailable'))}</b><p>${esc(wt('privateModeLikely'))}</p><ol><li>${state.lang==='zh'?'切换到 Safari 普通标签页':'สลับจาก Private ไป Safari แท็บปกติ'}</li><li>${state.lang==='zh'?'重新打开旅行网站主页':'เปิดเว็บไซต์ทริป URL หลักใหม่'}</li><li>${state.lang==='zh'?'回到私人旅行钱包并再次选择 PDF':'เข้า Private Travel Wallet แล้วเลือก PDF อีกครั้ง'}</li></ol><p class="wallet-storage-warning">⚠️ ${esc(wt('privateDataWarning'))}</p></div>`;
}
function showWalletStorageHelp(kind=walletStorageGuardState.reason||'restricted'){
  openModal(state.lang==='zh'?'无法保存机票 PDF':'บันทึก Flight Ticket PDF ไม่ได้',wt('storageTryNormal'),walletStorageHelpHtml(kind));
}
async function probeWalletStorage(force=false){
  if(walletStorageGuardState.checked&&!force)return walletStorageGuardState.available;
  walletStorageGuardState.checked=true;
  try{
    const db=await openWalletDb();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(WALLET_STORE,'readwrite');
      const store=tx.objectStore(WALLET_STORE);
      store.put({id:'__wallet-storage-probe__',updatedAt:Date.now()});
      store.delete('__wallet-storage-probe__');
      tx.oncomplete=resolve;
      tx.onerror=()=>reject(tx.error||new Error('IndexedDB transaction failed'));
      tx.onabort=()=>reject(tx.error||new Error('IndexedDB transaction aborted'));
    });
    db.close();
    walletStorageGuardState.available=true;
    walletStorageGuardState.reason='';
    walletStorageGuardState.detail='';
    return true;
  }catch(err){
    walletStorageGuardState.available=false;
    walletStorageGuardState.reason=walletStorageErrorKind(err);
    walletStorageGuardState.detail=String(err?.name||err?.message||'storage unavailable');
    return false;
  }
}

const refreshWalletDocMetaBeforeGuard=refreshWalletDocMeta;
refreshWalletDocMeta=async function(rerender=false){
  if(walletDocState.loading)return;
  walletDocState.loading=true;
  try{
    const ready=await probeWalletStorage();
    if(!ready){
      walletDocState.meta=null;
      walletDocState.error=walletStorageMessage(walletStorageGuardState.reason);
      return;
    }
    const d=await walletDocGet();
    walletDocState.meta=d?{name:d.name,size:d.size,updatedAt:d.updatedAt}:null;
    walletDocState.error='';
  }catch(err){
    walletStorageGuardState.available=false;
    walletStorageGuardState.reason=walletStorageErrorKind(err);
    walletDocState.meta=null;
    walletDocState.error=walletStorageMessage(walletStorageGuardState.reason);
  }finally{
    walletDocState.loaded=true;
    walletDocState.loading=false;
    if(rerender&&state.tab==='more'&&state.moreView==='wallet')render();
  }
};

saveWalletPdf=async function(file){
  if(!file)return;
  if(file.type&&file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name||'')){toast(wt('pdfOnly'));return;}
  const ready=await probeWalletStorage(true);
  if(!ready){
    walletDocState.loaded=true;
    walletDocState.meta=null;
    walletDocState.error=walletStorageMessage(walletStorageGuardState.reason);
    if(state.tab==='more'&&state.moreView==='wallet')render();
    showWalletStorageHelp(walletStorageGuardState.reason);
    return;
  }
  try{
    await walletDocPut(file);
    walletDocState.loaded=false;
    await refreshWalletDocMeta(false);
    toast(wt('pdfSaved'));
    if(state.tab==='more'&&state.moreView==='wallet')render();
  }catch(err){
    walletStorageGuardState.available=false;
    walletStorageGuardState.reason=walletStorageErrorKind(err);
    walletDocState.loaded=true;
    walletDocState.meta=null;
    walletDocState.error=walletStorageMessage(walletStorageGuardState.reason);
    if(state.tab==='more'&&state.moreView==='wallet')render();
    showWalletStorageHelp(walletStorageGuardState.reason);
  }
};

const renderPrivateWalletBeforeStorageGuard=renderPrivateWallet;
renderPrivateWallet=function(){
  let html=renderPrivateWalletBeforeStorageGuard();
  if(walletStorageGuardState.available===false){
    const alert=`<div class="wallet-storage-alert"><b>⚠️ ${esc(walletStorageMessage(walletStorageGuardState.reason))}</b><small>${walletStorageGuardState.reason==='quota'?esc(wt('quotaFail')):esc(wt('privateModeSteps'))}</small><button class="btn" type="button" data-wallet-storage-help="1">${esc(wt('storageTryNormal'))}</button></div>`;
    html=html.replace('<div class="wallet-local-banner">',alert+'<div class="wallet-local-banner">');
  }
  return html;
};

document.addEventListener('click',e=>{
  if(e.target.closest('[data-wallet-storage-help]')){showWalletStorageHelp();return;}
  if(e.target.closest('.wallet-file')&&walletStorageGuardState.available===false){
    e.preventDefault();
    e.stopPropagation();
    showWalletStorageHelp();
  }
},true);

const style=document.createElement('style');
style.textContent=`.wallet-storage-alert{margin:9px 0;padding:12px;border:1px solid #e7a7bd;border-radius:16px;background:#fff2f6;color:#633647}.wallet-storage-alert b,.wallet-storage-alert small{display:block}.wallet-storage-alert small{margin:5px 0 9px}.wallet-storage-help{line-height:1.55}.wallet-storage-help b{display:block;font-size:18px}.wallet-storage-help ol{padding-left:22px}.wallet-storage-help li{margin:8px 0}.wallet-storage-warning{padding:10px;border-radius:12px;background:#fff2c9;color:#684e16}`;
document.head.appendChild(style);
