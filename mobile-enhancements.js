(function(){
  'use strict';
  document.title='Shanghai Family Trip 2026 · Pink Edition v1.12';
  var theme=document.querySelector('meta[name="theme-color"]');
  if(theme) theme.content='#e84887';
  var app=document.getElementById('app');
  var insurance={provider:'MSIG Insurance (Thailand) PCL.',product:'MSIG Worldwide Plus',plan:'Easy 3',journey:'Thailand - China',policyNo:'26-43239988',effective:'13/09/2026',expiry:'19/09/2026',insured:['Chonnikarn Chukhajorn','Chutimon Chukhajorn','Punyawat Chukajon','Wantanee Karoonakorn'],assistance:'+66 2 039 5704',customerService:'+66 2 825 8888',coverage:[['เสียชีวิต/สูญเสียอวัยวะ/ทุพพลภาพถาวรจากอุบัติเหตุ','สูงสุด 3,000,000 บาท'],['ค่ารักษาพยาบาลจากอุบัติเหตุหรือเจ็บป่วย','สูงสุด 2,000,000 บาท'],['เคลื่อนย้ายฉุกเฉินหรือส่งกลับประเทศไทย','สูงสุด 2,000,000 บาท'],['ส่งศพกลับประเทศไทย','สูงสุด 2,000,000 บาท'],['ความรับผิดต่อบุคคลภายนอก','สูงสุด 1,000,000 บาท'],['ยกเลิกหรือเลื่อนการเดินทาง','สูงสุด 200,000 บาท'],['ลดจำนวนวันเดินทาง','สูงสุด 200,000 บาท'],['เที่ยวบินล่าช้า','สูงสุด 15,000 บาท (3,000 บาท/ทุก 6 ชม.)'],['สัมภาระ/ทรัพย์สินสูญหายหรือเสียหาย','สูงสุด 30,000 บาท'],['สัมภาระล่าช้า','สูงสุด 15,000 บาท'],['เอกสารเดินทางสูญหายหรือเสียหาย','สูงสุด 10,000 บาท'],['Telemedicine ผ่านแอป MorDee','ตามเงื่อนไขกรมธรรม์']]};
  var travelDocs={airline:'Juneyao Airlines',airlineReference:'MZXMN8',passengers:['Chonnikarn Chukhajorn','Chutimon Chukhajorn','Punyawat Chukajon','Wantanee Karoonakorn'],outbound:{flight:'HO1352',from:'BKK Suvarnabhumi Airport',depart:'13 Sep 2026 · 01:25',to:'PVG Shanghai Pudong T2',arrive:'13 Sep 2026 · 06:45'},inbound:{flight:'HO1351',from:'PVG Shanghai Pudong T2',depart:'18 Sep 2026 · 20:50',to:'BKK Suvarnabhumi Airport',arrive:'19 Sep 2026 · 00:25'},baggage:{carryOn:'1 ชิ้น/คน · 5 กก. · รวมขนาดไม่เกิน 115 ซม. (20×40×55 ซม.)',checked:'1 ชิ้น/คน · 23 กก. · รวมขนาดไม่เกิน 158 ซม.'},hotel:{name:'Yitel Collection (Shanghai Train Station)',cn:'和颐至尚酒店(上海火车站南广场店)',address:'No. 511 Tianmu West Road, Jing’an District, Shanghai',addressCn:'上海市静安区天目西路511号',phone:'+86-21-52711555-0',checkIn:'13 Sep 2026 · หลัง 15:00',checkOut:'18 Sep 2026 · ก่อน 12:00',rooms:'Queen Room · 2 ห้อง · 5 คืน',meals:'ไม่รวมอาหารเช้า',occupancy:'ห้องละไม่เกิน 2 คน / ผู้ใหญ่สูงสุด 2 คน',note:'โรงแรมใน Shanghai อาจไม่จัดแปรงสีฟัน หวี มีดโกน ตะไบเล็บ และอุปกรณ์ใช้แล้วทิ้งไว้ในห้อง ควรเตรียมไปเอง'}};
  var curatedPhotos=[
    {keys:['Starbucks Reserve Roastery','上海星巴克臻选烘焙工坊'],url:'https://about.starbucks.com/wp-content/uploads/2019/01/Starbucks_Roastery_Shanghai_G.jpeg',source:'Starbucks Stories · Shanghai Roastery'},
    {keys:['Park Hotel Bakery','国际饭店西饼屋'],url:'https://ak-d.tripcdn.com/images/1mk20224x90jekl5hF7C3.jpg',source:'Trip.com · Park Hotel Deli storefront'},
    {keys:['ถนนหวงเหอ','黄河路'],url:'https://upload.wikimedia.org/wikipedia/commons/8/80/20240120_Night_view_of_Huanghe_Road%2C_Shanghai_03.jpg',source:'Wikimedia Commons · Huanghe Road 2024'},
    {keys:['จัตุรัสประชาชน',"People's Square",'人民广场'],url:'https://obj.shine.cn/files/2024/01/05/a90d854e-49b1-4289-9518-09c84148bb39_0.jpg',source:'City News Service · People’s Square'},
    {keys:['หมู่บ้านหลงจิ่ง','Longjing Village','龙井村'],url:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Tea%20plantations%20in%20Longjing%2C%20Hangzhou.jpg?width=1280',source:'Wikimedia Commons · Wishva de Silva · CC BY-SA 3.0'},
    {keys:['โหลวไว่โหลว','Louwailou','楼外楼'],url:'https://hznews.hangzhou.com.cn/wghz/images/2019-05/09/6eedd313-a4c6-45cb-a64a-46ff7a833669.jpeg',source:'Hangzhou News · Louwailou'},
    {keys:['เรือเฟอร์รีข้ามแม่น้ำ','Shanghai Ferry','金陵东路渡口'],url:'https://ak-d.tripcdn.com/images/1mi19224x92dugw9o0FD9.jpg?proc=source%2Ftrip',source:'Trip.com · Dongchang Road Shanghai Ferry'},
    {keys:['Shanghai IFC Mall','上海国金中心商场'],url:'https://benoycdn.azureedge.net/files/projects/shanghai-ifc/_largeImage/L2143_N93_medium.jpg',source:'Benoy · Shanghai IFC architecture'}
  ];
  function text(el,selectors){for(var i=0;i<selectors.length;i++){var n=el.querySelector(selectors[i]);if(n&&n.textContent.trim())return n.textContent.trim()}return ''}
  function enhance(){
    enhancePhotos();
    enhanceDay5();
    enhanceTrip();
    if(!app||app.querySelector('.day-glance')) return;
    var timeline=app.querySelector('.timeline');
    var hero=app.querySelector('.hero');
    if(!timeline||!hero) return;
    timeline.id='daily-timeline';
    var cards=Array.from(timeline.querySelectorAll('.event-card')).slice(0,12);
    if(!cards.length) return;
    cards.forEach(function(card,i){card.id='daily-stop-'+(i+1)});
    var rows=cards.map(function(card){
      var time=text(card,['.time-badge','.event-time','time'])||'—';
      var name=text(card,['.event-head h3','h3']);
      var cn=text(card,['.cn']);
      return '<div class="day-glance-row"><time>'+escapeHtml(time)+'</time><div><b>'+escapeHtml(name)+'</b>'+(cn?'<small>'+escapeHtml(cn)+'</small>':'')+'</div></div>';
    }).join('');
    var box=document.createElement('section');
    box.className='day-glance';
    box.setAttribute('aria-label','สรุปแผนการเดินทางวันนี้');
    box.innerHTML='<div class="day-glance-head"><h2>แผนวันนี้แบบย่อ</h2><span>'+cards.length+' จุด · เรียงตามเวลา</span></div><div class="day-glance-list">'+rows+'</div><button class="btn primary day-glance-action" type="button">ดูรายละเอียดและวิธีเดินทาง ↓</button>';
    hero.insertAdjacentElement('afterend',box);
    box.querySelector('button').addEventListener('click',function(){timeline.scrollIntoView({behavior:'smooth',block:'start'})});
  }
  function escapeHtml(value){return String(value||'').replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]})}
  function enhancePhotos(){
    if(!app)return;
    Array.from(app.querySelectorAll('img[alt]:not([data-curated-photo])')).forEach(function(img){var alt=img.getAttribute('alt')||'';var hit=curatedPhotos.find(function(p){return p.keys.some(function(k){return alt.indexOf(k)>-1})});if(!hit)return;var fallback=img.currentSrc||img.src;img.dataset.curatedPhoto='1';img.dataset.photoSource=hit.source;img.addEventListener('error',function(){if(img.src!==fallback){img.src=fallback;img.classList.add('photo-offline-fallback')}},{once:true});img.src=hit.url;var card=img.closest('.event-card,.place-card,.hero');var badge=card&&card.querySelector('.real-photo-badge,.photo-pill');if(badge)badge.textContent='📷 '+hit.source});
  }
  function enhanceDay5(){
    if(!app||app.querySelector('.day5-clarity'))return;
    var hero=app.querySelector('.hero');var heading=hero&&hero.querySelector('h2');
    if(!heading||heading.textContent.indexOf('Suzhou Creek')===-1)return;
    heading.textContent='Shanghai Waterfront: คลอง Suzhou Creek → Lujiazui';
    var theme=hero.querySelector('.hero-overlay p');if(theme)theme.textContent='คลองประวัติศาสตร์ใน Shanghai · Postal Museum · สะพาน · Ferry · Pudong Skyline';
    var note=document.createElement('div');note.className='notice day5-clarity';note.innerHTML='<b>📍 Suzhou Creek / 苏州河 อยู่ใน Shanghai</b><br>ไม่ใช่ Day Trip ไปเมือง Suzhou เส้นที่ตรวจแล้ว: Shanghai Postal Museum → ข้าม Sichuan Road Bridge → เดินริมฝั่งใต้ → Zhapu Road Bridge → Waibaidu Bridge → เรียก DiDi ไปร้านอาหาร → ไปท่าเรือ Jinling East Road → Ferry ข้ามไป Dongchang Road → Lujiazui';
    hero.insertAdjacentElement('afterend',note);
  }
  function routeCard(label,f){return '<div class="travel-doc-route"><div class="flight-line"><span>'+escapeHtml(label)+'</span><b>'+escapeHtml(f.flight)+'</b></div><div class="airport-row"><div><small>ออกจาก</small><b>'+escapeHtml(f.from)+'</b><time>'+escapeHtml(f.depart)+'</time></div><i>→</i><div><small>ถึง</small><b>'+escapeHtml(f.to)+'</b><time>'+escapeHtml(f.arrive)+'</time></div></div></div>'}
  function enhanceTrip(){
    if(!app||app.querySelector('.trip-document-details'))return;
    var active=document.querySelector('.nav-btn.active');
    if(!active||active.dataset.tab!=='trip')return;
    var title=app.querySelector('.section-title');
    if(!title)return;
    Array.from(app.querySelectorAll('.card')).forEach(function(card){var heading=card.querySelector('h3');var label=heading?heading.textContent.trim():'';if(label.indexOf('✈️ เที่ยวบิน')===0||label.indexOf('🏨 โรงแรม')===0)card.remove()});
    var h=travelDocs.hotel;
    var box=document.createElement('div');box.className='trip-document-details';
    box.innerHTML='<div class="travel-doc-banner"><span>ยืนยันจาก Flight Ticket + Hotel Voucher</span><h2>ข้อมูลการจองพร้อมใช้</h2><p>ผู้เดินทาง 4 คน · Economy · Airline reference <b>'+escapeHtml(travelDocs.airlineReference)+'</b></p></div><div class="section-title"><h2>เที่ยวบิน</h2><span>'+escapeHtml(travelDocs.airline)+'</span></div>'+routeCard('ขาไป',travelDocs.outbound)+routeCard('ขากลับ',travelDocs.inbound)+'<div class="card"><h3>🧳 สัมภาระต่อคน — ทั้งขาไปและกลับ</h3><div class="baggage-grid"><div><small>ถือขึ้นเครื่อง</small><b>'+escapeHtml(travelDocs.baggage.carryOn)+'</b></div><div><small>โหลดใต้เครื่อง</small><b>'+escapeHtml(travelDocs.baggage.checked)+'</b></div></div><div class="notice">แนะนำถึงสนามบินอย่างน้อย 3 ชั่วโมงก่อนเวลาออก และต้องใช้บัตรโดยสารตามลำดับเที่ยวบิน</div></div><div class="section-title"><h2>โรงแรม</h2><span>2 ห้อง · 5 คืน</span></div><div class="card hotel-detail-card"><h3>'+escapeHtml(h.name)+'</h3><div class="cn">'+escapeHtml(h.cn)+'</div><div class="policy-facts"><div><small>เช็กอิน</small><b>'+escapeHtml(h.checkIn)+'</b></div><div><small>เช็กเอาต์</small><b>'+escapeHtml(h.checkOut)+'</b></div><div><small>ห้องพัก</small><b>'+escapeHtml(h.rooms)+'</b></div><div><small>อาหาร</small><b>'+escapeHtml(h.meals)+'</b></div></div><p><b>📍 '+escapeHtml(h.address)+'</b><br><span class="cn">'+escapeHtml(h.addressCn)+'</span></p><p>☎ <a href="tel:+8621527115550">'+escapeHtml(h.phone)+'</a></p><p>'+escapeHtml(h.occupancy)+'</p><div class="notice">🪥 '+escapeHtml(h.note)+'</div><div class="actions"><a class="btn primary" href="tel:+8621527115550">โทรโรงแรม</a><button class="btn" data-copy="'+escapeHtml(h.addressCn)+'">Copy ที่อยู่จีน</button><a class="btn ghost" target="_blank" rel="noopener" href="https://uri.amap.com/search?keyword='+encodeURIComponent(h.cn)+'&city=上海">เปิด AMap</a></div></div><div class="card"><h3>Export ข้อมูลเที่ยวบินและโรงแรม</h3><p class="muted">สรุปสำหรับส่งให้ครอบครัว โดยไม่รวม E-ticket number, เลขหนังสือเดินทาง และหมายเลขยืนยันโรงแรมเต็มชุด</p><div class="actions"><button class="btn primary" data-travel-export="txt">Export TXT</button><button class="btn" data-travel-export="json">Export JSON</button><button class="btn ghost" data-travel-print>พิมพ์ / บันทึก PDF</button></div></div>';
    title.insertAdjacentElement('afterend',box);
  }
  function exportTravel(kind){var payload={exportedAt:new Date().toISOString(),travel:travelDocs,privacyNote:'Excluded: e-ticket numbers, passport numbers, full hotel confirmation and Trip.com booking numbers.'},body,type,name;if(kind==='json'){body=JSON.stringify(payload,null,2);type='application/json';name='Shanghai_Trip_Flight_Hotel_Summary.json'}else{var h=travelDocs.hotel;body=['SHANGHAI FAMILY TRIP - FLIGHT & HOTEL','Airline: '+travelDocs.airline,'Airline reference: '+travelDocs.airlineReference,'','OUTBOUND '+travelDocs.outbound.flight,travelDocs.outbound.from+' | '+travelDocs.outbound.depart,'To '+travelDocs.outbound.to+' | '+travelDocs.outbound.arrive,'','RETURN '+travelDocs.inbound.flight,travelDocs.inbound.from+' | '+travelDocs.inbound.depart,'To '+travelDocs.inbound.to+' | '+travelDocs.inbound.arrive,'','BAGGAGE','Carry-on: '+travelDocs.baggage.carryOn,'Checked: '+travelDocs.baggage.checked,'','HOTEL',h.name,h.cn,h.address,h.addressCn,'Phone: '+h.phone,'Check-in: '+h.checkIn,'Check-out: '+h.checkOut,h.rooms,h.meals,'','Private booking and identity numbers are excluded.'].join('\r\n');type='text/plain;charset=utf-8';name='Shanghai_Trip_Flight_Hotel_Summary.txt'}var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type:type}));a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)}
  function renderInsurance(){
    document.querySelectorAll('.nav-btn').forEach(function(b){b.classList.toggle('active',b.dataset.tab==='insurance')});
    var people=insurance.insured.map(function(name){return '<div class="insured-person"><span>✓</span><b>'+escapeHtml(name)+'</b></div>'}).join('');
    var benefits=insurance.coverage.map(function(x){return '<div class="coverage-row"><span>'+escapeHtml(x[0])+'</span><b>'+escapeHtml(x[1])+'</b></div>'}).join('');
    app.innerHTML='<section class="insurance-hero"><div class="insurance-logo">MSIG</div><span>TRAVEL INSURANCE</span><h2>ประกันเดินทางของครอบครัว</h2><p>'+escapeHtml(insurance.product)+' · แผน '+escapeHtml(insurance.plan)+'</p></section><div class="emergency-card"><small>กรณีฉุกเฉินระหว่างอยู่ต่างประเทศ</small><a href="tel:+6620395704">☎ '+escapeHtml(insurance.assistance)+'</a><span>MSIG Assist Overseas Emergency Assistance</span></div><div class="insurance-grid"><div class="card"><h3>รายละเอียดกรมธรรม์</h3><div class="policy-facts"><div><small>เลขกรมธรรม์</small><b>'+escapeHtml(insurance.policyNo)+'</b></div><div><small>เส้นทาง</small><b>'+escapeHtml(insurance.journey)+'</b></div><div><small>เริ่มคุ้มครอง</small><b>'+escapeHtml(insurance.effective)+'</b></div><div><small>สิ้นสุด</small><b>'+escapeHtml(insurance.expiry)+'</b></div></div></div><div class="card"><h3>ผู้เอาประกัน 4 คน</h3>'+people+'</div></div><div class="section-title"><h2>วงเงินสำคัญ</h2><span>ต่อคน · ตามเงื่อนไขกรมธรรม์</span></div><div class="coverage-list">'+benefits+'</div><div class="card claim-guide"><h3>เมื่อเจ็บป่วยหรือเกิดเหตุ</h3><ol><li>หากฉุกเฉิน โทร MSIG Assist ก่อนเข้ารับการรักษาเมื่อทำได้</li><li>เก็บใบรับรองแพทย์ ใบเสร็จ รายงานเหตุ และหลักฐานการเดินทางทั้งหมด</li><li>กรณีเที่ยวบินหรือสัมภาระล่าช้า ขอหนังสือรับรองจากสายการบิน</li><li>Telemedicine ใช้ผ่านแอป MorDee และไม่ใช่บริการช่วยเหลือฉุกเฉิน</li></ol><div class="actions"><a class="btn primary" href="tel:+6620395704">โทรฉุกเฉิน</a><a class="btn" href="tel:+6628258888">บริการลูกค้า</a></div></div><div class="card"><h3>Export ข้อมูลประกัน</h3><p class="muted">ไฟล์ Export ไม่มีเลขบัตรประชาชน หนังสือเดินทาง ที่อยู่ หรือวันเกิด</p><div class="actions"><button class="btn primary" data-insurance-export="txt">Export TXT</button><button class="btn" data-insurance-export="json">Export JSON</button><button class="btn ghost" data-insurance-print>พิมพ์ / บันทึก PDF</button><button class="btn ghost" data-insurance-copy>Copy เบอร์ฉุกเฉิน</button></div></div><div class="notice">ข้อมูลนี้เป็นสรุปเพื่อใช้ระหว่างเดินทาง หากมีความแตกต่าง ให้ยึดใบรับรองประกันภัย ตารางผลประโยชน์ และเงื่อนไขฉบับเต็มเป็นหลัก</div>';
    window.scrollTo({top:0,behavior:'instant'});
  }
  function exportInsurance(kind){var payload={exportedAt:new Date().toISOString(),insurance:insurance,privacyNote:'Excluded: ID/passport numbers, addresses and dates of birth.'},body,type,name;if(kind==='json'){body=JSON.stringify(payload,null,2);type='application/json';name='Shanghai_Trip_Insurance_Summary.json'}else{body=['SHANGHAI FAMILY TRIP - TRAVEL INSURANCE','Provider: '+insurance.provider,'Product: '+insurance.product+' / '+insurance.plan,'Policy: '+insurance.policyNo,'Period: '+insurance.effective+' - '+insurance.expiry,'Emergency Assistance: '+insurance.assistance,'Customer Service: '+insurance.customerService,'','INSURED'].concat(insurance.insured.map(function(x){return '- '+x}),['','KEY COVERAGE']).concat(insurance.coverage.map(function(x){return '- '+x[0]+': '+x[1]}),['','This summary excludes ID/passport numbers, addresses and dates of birth.']).join('\r\n');type='text/plain;charset=utf-8';name='Shanghai_Trip_Insurance_Summary.txt'}var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type:type}));a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)}
  document.addEventListener('click',function(e){var nav=e.target.closest&&e.target.closest('.nav-btn[data-tab="insurance"]');if(nav){e.preventDefault();e.stopImmediatePropagation();renderInsurance();return}var ex=e.target.closest&&e.target.closest('[data-insurance-export]');if(ex){exportInsurance(ex.dataset.insuranceExport);return}var travelEx=e.target.closest&&e.target.closest('[data-travel-export]');if(travelEx){exportTravel(travelEx.dataset.travelExport);return}if(e.target.closest&&e.target.closest('[data-insurance-print],[data-travel-print]')){window.print();return}if(e.target.closest&&e.target.closest('[data-insurance-copy]')){navigator.clipboard&&navigator.clipboard.writeText('MSIG Assist: '+insurance.assistance+' | Customer Service: '+insurance.customerService)}} ,true);
  new MutationObserver(function(){requestAnimationFrame(enhance)}).observe(app,{childList:true,subtree:false});
  enhance();
})();
