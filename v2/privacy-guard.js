(function(){
'use strict';
var frame=document.getElementById('legacy');
function guard(){var d;try{d=frame.contentDocument}catch(e){return}if(!d||!d.body)return;
  d.querySelectorAll('.insured-person').forEach(function(el){el.hidden=true});
  d.querySelectorAll('.card,.policy-facts,.travel-doc-banner,.trip-document-details').forEach(function(scope){
    Array.from(scope.querySelectorAll('div,p,b,span,small')).forEach(function(el){
      var t=(el.textContent||'').trim();
      if(/Airline reference/i.test(t)&&el.children.length===0)el.textContent='Airline reference · เก็บข้อมูลจริงไว้แบบ private';
      if(/เลขกรมธรรม์|Policy\s*(No|Number)/i.test(t)){
        var b=el.querySelector&&el.querySelector('b');if(b)b.textContent='เก็บข้อมูลจริงไว้แบบ private';
      }
    });
  });
  var insured=d.querySelector('.insurance-hero,.emergency-card');
  if(insured&&!d.getElementById('privacy-runtime-note')){var n=d.createElement('div');n.id='privacy-runtime-note';n.className='notice';n.innerHTML='<b>🔒 Privacy mode</b><br>หน้า v2 ซ่อนรายชื่อผู้เอาประกันและเลขอ้างอิงจากหน้าจอ ใช้เอกสารต้นฉบับที่เก็บแบบ private เป็นข้อมูลจริง';insured.insertAdjacentElement('afterend',n)}
}
frame.addEventListener('load',function(){setTimeout(guard,100);setTimeout(guard,500);var d;try{d=frame.contentDocument}catch(e){}if(d){var app=d.getElementById('app');if(app)new MutationObserver(function(){requestAnimationFrame(guard)}).observe(app,{childList:true,subtree:true})}});
setTimeout(guard,250);
})();
