'use strict';

let TRIP_READINESS=null;
const RD_TEXT={
  title:{th:'ความพร้อมก่อนเดินทาง',zh:'出发前准备'},
  sub:{th:'ตั๋ว · การจอง · อากาศ · เอกสาร',zh:'车票 · 预约 · 天气 · 证件'},
  last:{th:'ตรวจข้อมูลล่าสุด',zh:'最近核对'},
  verified:{th:'ยืนยันแล้ว',zh:'已确认'},
  pending:{th:'รอดำเนินการ',zh:'待处理'},
  recheck:{th:'ต้องเช็กอีกครั้ง',zh:'需再次确认'},
  live:{th:'เช็กใกล้วันจริง',zh:'临近当天确认'},
  important:{th:'สำคัญ',zh:'重要'},
  ticket:{th:'ตามตั๋วจริง',zh:'以实际票据为准'},
  source:{th:'เปิดแหล่งข้อมูล',zh:'查看来源'},
  noData:{th:'กำลังโหลดข้อมูลความพร้อม…',zh:'正在加载准备信息…'}
};
const RD_ITEM_NAMES={
  'hangzhou-train':{th:'รถไฟ Shanghai ⇄ Hangzhou · 15 ก.ย.',zh:'上海 ⇄ 杭州高铁 · 9月15日'},
  'lingyin':{th:'Lingyin / Feilai Peak · 15 ก.ย.',zh:'灵隐寺 / 飞来峰 · 9月15日'},
  'yu-garden':{th:'Yu Garden · 16 ก.ย.',zh:'豫园 · 9月16日'},
  'museum-east':{th:'Shanghai Museum East · 16 ก.ย.',zh:'上海博物馆东馆 · 9月16日'},
  'shanghai-tower':{th:'Shanghai Tower 118F · 16 ก.ย.',zh:'上海中心118层 · 9月16日'},
  '1000-trees':{th:'1000 Trees · 18 ก.ย.',zh:'天安千树 · 9月18日'},
  'weather':{th:'อากาศ Shanghai + Hangzhou',zh:'上海 + 杭州天气'},
  'passport-train':{th:'Passport / เอกสารตัวจริง',zh:'护照 / 有效证件原件'},
  'flight-outbound':{th:'เที่ยวบินขาไป HO1352',zh:'去程航班 HO1352'},
  'flight-inbound':{th:'เที่ยวบินขากลับ HO1351',zh:'返程航班 HO1351'}
};
function rdt(k){const v=RD_TEXT[k];return v?(v[state.lang]||v.th):k}
function rdField(x,k){return state.lang==='zh'?(x?.[`${k}_zh`]||x?.[k]||''):(x?.[k]||x?.[`${k}_zh`]||'')}
function rdItemName(x){const v=RD_ITEM_NAMES[x?.id];return v?(v[state.lang]||v.th):(rdField(x,'label')||x?.id||'')}
function rdStatusClass(s){return ['verified','pending','recheck','live','important','ticket'].includes(s)?s:'recheck'}
function rdStatusLabel(s){return rdt(s)||s}
function renderTripReadiness(){
  if(!TRIP_READINESS)return `${backMore()}<div class="card"><p>${rdt('noData')}</p></div>`;
  const rows=(TRIP_READINESS.checks||[]).map(x=>`<article class="readiness-item ${rdStatusClass(x.status)}"><div class="readiness-head"><span class="readiness-dot"></span><div><b>${esc(rdItemName(x))}</b><small>${esc(rdStatusLabel(x.status))} · ${esc(rdField(x,'label'))}</small></div></div><p>${esc(rdField(x,'detail'))}</p>${x.source_url?`<a class="btn ghost" href="${esc(x.source_url)}" target="_blank" rel="noopener">↗ ${rdt('source')} · ${esc(rdField(x,'source_label')||'Official')}</a>`:''}</article>`).join('');
  return `${backMore()}<div class="section-head"><h2>${rdt('title')}</h2><span>${esc(TRIP_READINESS.last_verified||'')}</span></div><div class="notice">${rdt('sub')} · ${rdt('last')} ${esc(TRIP_READINESS.last_verified||'')}</div><div class="readiness-list">${rows}</div>`;
}

const renderMoreBeforeReadiness=renderMore;
renderMore=function(){
  if(state.moreView==='readiness')return renderTripReadiness();
  let html=renderMoreBeforeReadiness();
  if(state.moreView!=='menu')return html;
  const card=`<div class="more-section readiness-entry"><h3>🧭 ${rdt('title')}</h3><button class="more-btn" data-more="readiness"><b>${rdt('title')}</b><small>${rdt('sub')}</small></button></div>`;
  return card+html;
};

async function loadTripReadiness(){
  try{
    const r=await fetch('../data/trip-readiness.json',{cache:'no-store'});if(!r.ok)throw new Error('readiness');
    TRIP_READINESS=await r.json();
    if(typeof render==='function'&&DATA)render();
  }catch(err){console.warn('Trip readiness unavailable',err)}
}
loadTripReadiness();
