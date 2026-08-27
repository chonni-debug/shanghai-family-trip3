(function(){
'use strict';
var frame=document.getElementById('legacy');
function markShell(){
  var nav=document.querySelector('.nav');if(nav)nav.setAttribute('data-i18n-skip','1');
  var title=document.getElementById('screenTitle');if(title)title.setAttribute('data-i18n-skip','1');
  var toggle=document.querySelector('.lang-toggle');if(toggle)toggle.setAttribute('data-i18n-skip','1');
}
function markFrame(){
  var d;try{d=frame&&frame.contentDocument}catch(e){return}
  if(!d||!d.body)return;
  d.querySelectorAll('.event-card h3,.place-card h3,.restaurant-card h3,.idea-card h3').forEach(function(h){h.setAttribute('data-i18n-skip','1')});
}
function mark(){markShell();markFrame()}
mark();
if(frame)frame.addEventListener('load',function(){setTimeout(markFrame,80);setTimeout(function(){var d;try{d=frame.contentDocument}catch(e){}if(d&&d.body)new MutationObserver(markFrame).observe(d.body,{childList:true,subtree:true})},180)});
document.addEventListener('sh-language-change',function(){setTimeout(mark,0)});

// Load the mobile overflow guard last so it can override earlier feature styles.
if(!document.querySelector('script[data-mobile-layout-fix]')){
  var s=document.createElement('script');
  s.src='mobile-layout-fix.js';
  s.defer=true;
  s.setAttribute('data-mobile-layout-fix','1');
  document.head.appendChild(s);
}
})();
