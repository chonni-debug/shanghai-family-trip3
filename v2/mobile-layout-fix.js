(function(){
'use strict';
var frame=document.getElementById('legacy');

var css=document.createElement('style');
css.id='mobile-layout-fix-shell';
css.textContent=`
html,body{width:100%;max-width:100vw;overflow-x:hidden!important}
.shell,.header,.frame-wrap,.nav{width:100%;max-width:100vw;min-width:0}
.header{overflow:hidden}
.header>*{min-width:0}
.brand{min-width:0;overflow:hidden}
.frame-wrap{overflow:hidden}
iframe{display:block;max-width:100%;min-width:0}
.nav{overflow:hidden}
.nav button{min-width:0;max-width:100%;overflow:hidden}
.nav button span{max-width:100%;overflow:hidden;text-overflow:ellipsis}
@media(max-width:540px){
  .header{gap:5px;padding-left:max(9px,env(safe-area-inset-left));padding-right:max(9px,env(safe-area-inset-right))}
  .brand small{font-size:8px;letter-spacing:.055em}
  .brand b{font-size:16px}
  .pr-status-btn{font-size:0!important;width:36px!important;min-width:36px!important;padding:0!important;flex:0 0 36px!important}
  .pr-status-btn:before{content:'✓';font-size:15px}
  .jc-toolbar{gap:4px!important;flex:0 0 auto}
  .jc-tool{width:36px!important;min-width:36px!important;padding:0!important;display:grid!important;place-items:center!important}
  .jc-tool span{display:none!important}
  .lang-toggle{width:40px!important;min-width:40px!important;padding:0!important;flex:0 0 40px!important}
  .lang-toggle span{display:none!important}
  .emergency{width:40px!important;height:40px!important;flex:0 0 40px!important;margin-left:0!important}
  .nav{gap:0!important;padding-left:max(2px,env(safe-area-inset-left))!important;padding-right:max(2px,env(safe-area-inset-right))!important}
  .nav button{padding-left:1px!important;padding-right:1px!important;border-radius:13px!important}
  .nav button i{font-size:19px!important}
  .nav button span{font-size:10px!important}
}
@media(max-width:390px){
  .brand small{font-size:7.5px}
  .brand b{font-size:15px}
  .pr-status-btn,.jc-tool{width:34px!important;min-width:34px!important;flex-basis:34px!important}
  .lang-toggle{width:36px!important;min-width:36px!important;flex-basis:36px!important}
  .emergency{width:38px!important;height:38px!important;flex-basis:38px!important}
  .nav button span{font-size:9px!important}
}
`;
document.head.appendChild(css);

function injectFrameFix(){
  var d;try{d=frame&&frame.contentDocument}catch(e){return}
  if(!d||!d.head||!d.body)return;
  if(d.getElementById('mobile-layout-fix-frame'))return;
  var st=d.createElement('style');
  st.id='mobile-layout-fix-frame';
  st.textContent=`
  html,body{width:100%!important;max-width:100%!important;overflow-x:hidden!important}
  body{position:relative}
  .app-shell{width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important}
  .hero,.day-glance,.timeline,.event-card,.card,.geo-card,.idea-card,.check-group,.city-walk-guide,.section-title,.notice,.insurance-hero,.coverage-list{max-width:100%!important;min-width:0!important}
  .hero-overlay,.event-body,.event-head,.day-glance-row,.day-glance-row>div,.section-title>*{min-width:0!important}
  .hero-overlay h2,.hero-overlay p,.event-head h3,.day-glance-row b,.day-glance-row small,.section-title h2,.section-title span,.route,.notice{overflow-wrap:anywhere!important;word-break:break-word!important}
  .day-glance-row{grid-template-columns:minmax(42px,54px) minmax(0,1fr)!important}
  img,svg,canvas,video{max-width:100%!important}
  .actions,.filter-row{max-width:100%!important}
  .btn,.filter{min-width:0!important;max-width:100%!important;overflow-wrap:anywhere!important}
  @media(max-width:540px){
    .app-shell{padding-left:10px!important;padding-right:10px!important}
    .hero-overlay h2{font-size:clamp(23px,7vw,30px)!important;line-height:1.1!important}
    .day-glance{padding:12px!important}
    .day-glance-row{padding-left:8px!important;padding-right:8px!important;gap:8px!important}
    .day-glance-row b{font-size:13px!important}
    .day-glance-row small{font-size:12px!important}
    .event-head{gap:6px!important}
    .event-head h3{font-size:17px!important}
    .travel-grid,.idea-grid,.walk-amenities{grid-template-columns:minmax(0,1fr)!important}
  }
  `;
  d.head.appendChild(st);
}

if(frame){
  frame.addEventListener('load',function(){setTimeout(injectFrameFix,0);setTimeout(injectFrameFix,250)});
  setTimeout(injectFrameFix,100);
}
window.addEventListener('resize',injectFrameFix);
})();
