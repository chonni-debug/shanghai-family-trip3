'use strict';

let MOBILE_DETAIL_PRESERVE_SCROLL=false;
let MOBILE_DETAIL_SCROLL_Y=0;

function hotfixStopData(raw){
  if(raw&&typeof raw==='object'){
    const cn=raw.cn||raw.copyText||'';
    const th=raw.th||raw.name?.th||'';
    return {th,cn,copyText:raw.copyText||cn,city:raw.city||''};
  }
  const key=String(raw||'').trim();
  let match=null;
  try{
    if(typeof BUND_PHOTO_WALK!=='undefined'&&BUND_PHOTO_WALK?.sequence){
      match=BUND_PHOTO_WALK.sequence.find(x=>x.cn===key||x.cn.startsWith(key)||key.startsWith(x.cn));
    }
  }catch{}
  if(!match&&DATA?.places){
    const p=DATA.places.find(x=>x.cn===key||String(x.cn||'').startsWith(key)||key.startsWith(String(x.cn||'')));
    if(p)match={th:p.name?.th||'',cn:p.cn||key,copyText:p.copyText||p.addr||p.cn,city:p.city||''};
  }
  return match?{th:match.th||match.name?.th||'',cn:match.cn||key,copyText:match.copyText||match.cn||key,city:match.city||''}:{th:'',cn:key,copyText:key,city:''};
}

if(typeof v3MiniStops==='function'){
  v3MiniStops=function(e){
    const stops=e?.contentExtras?.miniStops||[];
    if(!stops.length)return '';
    const rows=stops.map(raw=>{
      const s=hotfixStopData(raw),primary=state.lang==='zh'?(s.cn||s.th):(s.th||s.cn),secondary=state.lang==='zh'?(s.th||''):(s.cn||'');
      const query=s.copyText||s.cn||s.th;
      const mapObj={cn:query,name:{th:s.th||query,zh:s.cn||query},city:s.city||(/杭州|西湖|灵隐|飞来峰|清河坊/.test(query)?'杭州':'上海')};
      return `<div class="v3-mini-stop-item"><span><b>${esc(primary)}</b>${secondary?`<small>${esc(secondary)}</small>`:''}</span><span class="v3-mini-stop-actions"><button class="mini-action" type="button" data-copy="${encodeURIComponent(query)}">${state.lang==='zh'?'复制':'Copy 中文'}</button><a class="mini-action amap-mini-link" href="${amapUrl(mapObj)}">AMap</a></span></div>`;
    }).join('');
    return `<div class="v3-detail-block"><b>${state.lang==='zh'?'沿途停留点':'จุดแวะระหว่างทาง'}</b><div class="v3-mini-stop-list">${rows}</div></div>`;
  };
}

amapUrl=function(obj){
  const q=obj?.copyText||obj?.addr||obj?.cn||obj?.en||loc(obj?.name)||'';
  const inferredCity=obj?.city||(/杭州|西湖|灵隐|飞来峰|清河坊|知味观/.test(q)?'杭州':'上海');
  return `https://uri.amap.com/search?keyword=${encodeURIComponent(q)}&city=${encodeURIComponent(inferredCity)}&view=map&src=ShanghaiFamilyTrip&callnative=1`;
};

render=function(options={}){
  const preserve=Boolean(options?.preserveScroll||MOBILE_DETAIL_PRESERVE_SCROLL);
  const y=preserve?MOBILE_DETAIL_SCROLL_Y:0;
  updateChrome();
  state.moreView=state.tab==='more'?state.moreView:'menu';
  app.innerHTML=({home:renderHome,plan:renderPlan,explore:renderExplore,budget:renderBudget,more:renderMore}[state.tab]||renderHome)();
  MOBILE_DETAIL_PRESERVE_SCROLL=false;
  if(preserve){
    requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}));
  }else{
    window.scrollTo({top:0,behavior:'instant'});
  }
};

document.addEventListener('click',e=>{
  const toggle=e.target.closest('[data-v3-toggle]');
  if(toggle){
    MOBILE_DETAIL_PRESERVE_SCROLL=true;
    MOBILE_DETAIL_SCROLL_Y=window.scrollY;
  }
  const amap=e.target.closest('a[href^="https://uri.amap.com/"]');
  if(amap){
    amap.removeAttribute('target');
    amap.setAttribute('rel','noopener');
  }
},true);
