import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const fail=msg=>{throw new Error('QA: '+msg)};
const ok=(cond,msg)=>{if(!cond)fail(msg);console.log('✓',msg)};
const clone=v=>JSON.parse(JSON.stringify(v));

const parts=['data/app-days-1.json','data/app-days-2.json','data/app-days-3.json'].map(json);
const days=parts.flatMap(x=>x.days||[]);
const hz=json('data/hangzhou-sep16-plan.json').day;
const i15=days.findIndex(d=>d.date==='2026-09-15');
const i16=days.findIndex(d=>d.date==='2026-09-16');
const i17=days.findIndex(d=>d.date==='2026-09-17');
const old16=clone(days[i16]),old17=clone(days[i17]);
days[i15]={...old17,date:'2026-09-15',short:{th:'15 ก.ย.',zh:'9月15日'}};
days[i16]=clone(hz);
days[i17]={...old16,date:'2026-09-17',short:{th:'17 ก.ย.',zh:'9月17日'}};

ok(days.length===6,'runtime itinerary has exactly 6 days');
ok(days.map(d=>d.date).join(',')==='2026-09-13,2026-09-14,2026-09-15,2026-09-16,2026-09-17,2026-09-18','runtime dates remain Sep 13–18 2026');
const events=days.flatMap(d=>d.events||[]);
ok(events.length===57,'runtime itinerary retains 57 core activities');
for(const [di,day] of days.entries()){
  ok(Boolean(day.title?.th&&day.title?.zh),`day ${di+1} title is bilingual`);
  ok(Boolean(day.theme?.th&&day.theme?.zh),`day ${di+1} theme is bilingual`);
  for(const [ei,e] of (day.events||[]).entries()){
    const tag=`day ${di+1} event ${ei+1}`;
    ok(Boolean(e.time),`${tag} has time`);
    ok(Boolean(e.cn),`${tag} has Chinese destination text`);
    ok(Boolean(e.name?.th&&e.name?.zh),`${tag} name is bilingual`);
    for(const field of ['route','meal','arrival'])if(e[field])ok(Boolean(e[field].th&&e[field].zh),`${tag} ${field} is bilingual`);
  }
}
const has=(dayNo,txt)=>days[dayNo-1].events.some(e=>String(e.cn).includes(txt)||String(e.name?.th||'').includes(txt));
ok(has(1,'人民广场')&&has(1,'南京路步行街')&&has(1,'外滩'),'Day 1 remains Classic Shanghai');
ok(has(2,'武康大楼')&&has(2,'安福路')&&has(2,'新天地'),'Day 2 remains French Concession');
ok(has(3,'静安寺')&&has(3,'南京西路')&&has(3,'北外滩滨江绿地'),'Day 3 is Jing’an / Nanjing West / North Bund on Sep 15');
ok(has(4,'G7501')&&has(4,'知味观')&&has(4,'飞来峰灵隐寺')&&has(4,'飞来峰造像')&&has(4,'清河坊历史文化特色街区')&&has(4,'D3132'),'Day 4 is booked Hangzhou route with requested Feilai/Lingyin/Qinghefang order');
ok(has(5,'豫园')&&has(5,'上海博物馆东馆')&&has(5,'上海中心大厦'),'Day 5 is Yu Garden / Museum East / Shanghai Tower on Sep 17');
ok(has(6,'天安千树')&&has(6,'苏州河')&&has(6,'吉祥航空 HO1351'),'Day 6 remains 1000 Trees / Suzhou Creek / flight');

const out=days[3].events.find(e=>String(e.cn).includes('G7501'));
const ret=days[3].events.find(e=>String(e.cn).includes('D3132')&&e.time==='19:13');
ok(out?.time==='06:45'&&out.route.th.includes('07:57')&&out.route.th.includes('5B'),'G7501 booked departure/arrival/gate note is stored');
ok(ret?.route.th.includes('20:32')&&days[3].events.some(e=>e.time==='18:35'&&e.route?.th?.includes('15B')),'D3132 booked departure/arrival/gate note is stored');
const idx=txt=>days[3].events.findIndex(e=>String(e.cn).includes(txt));
ok(idx('杭州西湖')<idx('知味观'),'West Lake comes before Zhiweiguan');
ok(idx('知味观')<idx('飞来峰灵隐寺'),'Zhiweiguan comes before Feilai/Lingyin');
ok(idx('飞来峰灵隐寺')<idx('飞来峰造像'),'Feilai/Lingyin comes before Feilai carvings');
ok(idx('飞来峰造像')<idx('清河坊历史文化特色街区'),'Feilai carvings come before Qinghefang');
ok(idx('清河坊历史文化特色街区')<days[3].events.findIndex(e=>e.time==='17:15'&&e.cn==='杭州东站'),'Qinghefang comes before Hangzhou East buffer');

const master=json('data/plan-2026-09-v2.json');
ok(master.booking.train.date==='2026-09-16'&&master.booking.train.status==='booked','master plan marks Sep 16 train as booked');
ok(master.booking.train.outbound.train==='G7501'&&master.booking.train.return.train==='D3132','master plan stores both booked train numbers');
ok(master.booking.lingyin.date==='2026-09-16'&&master.booking.lingyin.target==='12:10–14:20','master plan aligns Feilai/Lingyin booking window with reordered route');
ok(master.days.find(d=>d.date==='2026-09-16')?.must?.join('>').includes('飞来峰灵隐寺>飞来峰造像>清河坊历史文化特色街区>杭州东站'),'master plan stores requested Sep 16 stop order');
ok(master.booking.museumEast.date==='2026-09-17'&&master.booking.shanghaiTower.date==='2026-09-17','Museum East and Shanghai Tower remain Sep 17');

const revised=json('data/revised-plan-content.json');
const rfind=cn=>revised.places.find(p=>p.cn===cn);
ok(rfind('知味观(湖滨店)')?.dayHint?.includes(4),'Zhiweiguan is Day 4');
ok(rfind('清河坊历史文化街区 / 河坊街')?.dayHint?.includes(4),'Qinghefang/Hefang content remains available in Explore on Day 4');
ok(rfind('上海博物馆东馆')?.dayHint?.includes(5),'Museum East content is Day 5');
ok(rfind('张园')?.dayHint?.includes(3),'Zhangyuan content is Day 3');

const overrides=json('data/revised-place-overrides.json');
const ofind=cn=>overrides.places.find(p=>p.cn===cn);
ok(ofind('静安寺')?.dayHint?.includes(3)&&ofind('北外滩滨江绿地')?.dayHint?.includes(3),'Jing’an/North Bund Explore badges move to Day 3');
ok(ofind('豫园')?.dayHint?.includes(5)&&ofind('陆家嘴')?.dayHint?.includes(5),'Yu Garden/Lujiazui Explore badges move to Day 5');

const day2=json('data/day2-user-details.json');
ok(day2.date==='2026-09-14'&&day2.lunch?.cn==='上金雀华人餐厅·麻辣茶餐厅','Day 2 overlay plans Grand Goldfinch lunch');
ok(day2.lunch?.meal?.th?.includes('¥38')&&day2.lunch?.meal?.th?.includes('¥58'),'Day 2 overlay stores requested Grand Goldfinch dishes');
ok(day2.huaihaiWest?.miniStops?.map(x=>x.cn).join('>').includes('LOOKNOW PARK>Songmont 山下有松(淮海中路店)>EMIS 中国首家旗舰店'),'Day 2 overlay stores west Huaihai shopping order');
ok(day2.huaihaiEast?.miniStops?.map(x=>x.cn).join('>')==='名创优品 MINISO Pink>FARMER BOB(上海旗舰店)','Day 2 overlay stores east Huaihai shopping order');
ok(day2.dinner?.cn==='Foodie Social 南里食集(新天地时尚Ⅰ3楼)','Day 2 overlay plans Xintiandi Style third-floor dinner');
ok(day2.dinner?.contentExtras?.miniStops?.some(x=>String(x.cn).includes('BUTTERFUL'))&&day2.dinner?.contentExtras?.miniStops?.some(x=>String(x.cn).includes('HARMAY')),'Day 2 overlay stores Butterful and Harmay stops');

const sep15=json('data/sep15-user-details.json');
ok(sep15.date==='2026-09-15'&&sep15.jinganMeal?.cn==='莱莱小笼','Sep 15 overlay plans Lai Lai lunch');
ok(sep15.westNanjing?.miniStops?.some(x=>x.cn==='AMAM Lonbakery Town'),'Sep 15 overlay adds AMAM Lonbakery Town');
ok(sep15.northBund?.miniStops?.some(x=>String(x.cn).includes('MANNER COFFEE')),'Sep 15 overlay adds Manner Coffee to North Bund');
ok(sep15.dinner?.cn==='费大厨辣椒炒肉(北外滩来福士店)'&&sep15.dinner?.meal?.th?.includes('ชามะนาว'),'Sep 15 overlay plans Fei Da Chu dinner and requested menu');

const routeMaps=json('data/day-route-maps.json');
ok(routeMaps.days.length===6,'daily Google route map covers all 6 days');
const rm14=routeMaps.days.find(d=>d.date==='2026-09-14'),rm15=routeMaps.days.find(d=>d.date==='2026-09-15'),rm16=routeMaps.days.find(d=>d.date==='2026-09-16'),rm17=routeMaps.days.find(d=>d.date==='2026-09-17');
ok(rm14?.stops?.length===13,'Sep 14 map includes expanded 13-stop route');
ok(rm14?.stops?.map(s=>s.zh).join('>').includes('上金雀华人餐厅>LOOKNOW PARK>Songmont 山下有松>EMIS 中国首家旗舰店>名创优品 MINISO Pink>FARMER BOB(上海旗舰店)>新天地>Foodie Social 南里食集>BUTTERFUL & CREAMOROUS（上海新天地）>HARMAY 上海新天地店'),'Sep 14 map follows requested Huaihai to Xintiandi order');
ok(rm15?.stops.some(s=>s.zh==='静安寺')&&rm15?.stops.some(s=>s.zh==='北外滩滨江绿地'),'Sep 15 map is Jing’an/North Bund');
ok(rm16?.city==='Hangzhou'&&rm16.stops.length===7,'Sep 16 map is Hangzhou with seven ordered main stops');
ok(rm16.stops.map(s=>s.zh).join('>')==='杭州东站>西湖>知味观(湖滨店)>飞来峰灵隐寺>飞来峰造像>清河坊历史文化特色街区>杭州东站','Hangzhou map matches requested 1–7 stop order');
ok(rm17?.stops.some(s=>s.zh==='上海博物馆东馆')&&rm17?.stops.some(s=>s.zh==='上海中心大厦'),'Sep 17 map is Yu Garden/Pudong');

const readiness=json('data/trip-readiness.json');
ok(readiness.last_verified==='2026-09-06','readiness verification date is current');
ok(readiness.checks.find(x=>x.id==='hangzhou-train')?.status==='ticket','readiness marks Hangzhou trains booked');
ok(readiness.checks.find(x=>x.id==='hangzhou-train')?.detail.includes('G7501')&&readiness.checks.find(x=>x.id==='hangzhou-train')?.detail.includes('D3132'),'readiness shows exact booked trains');
ok(readiness.checks.find(x=>x.id==='lingyin')?.label.includes('9 ก.ย.')&&readiness.checks.find(x=>x.id==='lingyin')?.detail.includes('12:10–14:20'),'Feilai reservation check uses reordered visit window');
ok(readiness.checks.find(x=>x.id==='museum-east')?.detail.includes('17 ก.ย.'),'Museum East readiness remains Sep 17');

const contextual=json('data/contextual-suggestions.json');
ok(contextual.contexts.some(c=>c.day===3&&c.anchors.includes('静安寺')),'Jing’an context moved to Day 3');
ok(contextual.contexts.some(c=>c.day===3&&c.suggestions.includes('AMAM Lonbakery Town')),'West Nanjing context includes AMAM');
ok(contextual.contexts.some(c=>c.day===5&&c.anchors.includes('豫园')),'Yu Garden context moved to Day 5');
ok(!contextual.contexts.some(c=>c.day===4),'Hangzhou day has no extra contextual detours');

const rootHtml=read('index.html'),v2Html=read('v2/index.html');
ok(rootHtml.includes('hangzhou-sep16-override.js')&&v2Html.includes('hangzhou-sep16-override.js'),'Sep 16 override loads in root and v2');
ok(rootHtml.includes('sep15-user-details.js')&&v2Html.includes('sep15-user-details.js'),'Sep 15 detail overlay loads in root and v2');
ok(rootHtml.includes('day2-user-details.js')&&v2Html.includes('day2-user-details.js'),'Day 2 detail overlay loads in root and v2');
ok(rootHtml.includes('day-route-map.js')&&v2Html.includes('day-route-map.js'),'daily Google route map remains loaded');
const appEvents=read('v2/app-events.js');
ok(appEvents.includes("await applySep16HangzhouOverride(DATA)"),'app init applies Hangzhou override before render');
const hzLayer=read('v2/hangzhou-sep16-override.js');
ok(hzLayer.includes("'2026-09-15'")&&hzLayer.includes("'2026-09-17'")&&hzLayer.includes('hangzhou-sep16-plan.json'),'override safely rotates Sep 15/17 around Sep 16 Hangzhou');
const sep15Layer=read('v2/sep15-user-details.js');
ok(sep15Layer.includes('sep15PreviousHangzhouOverride')&&sep15Layer.includes('applySep15UserDetails'),'Sep 15 overlay runs after Hangzhou date rotation');
const day2Layer=read('v2/day2-user-details.js');
ok(day2Layer.includes('day2PreviousItineraryOverride')&&day2Layer.includes('applyDay2UserDetails'),'Day 2 overlay chains after existing itinerary overrides');

const publicFiles=['data/app-trip.json','data/app-days-1.json','data/app-days-2.json','data/app-days-3.json','data/app-support.json','data/content-places.json','data/content-food.json','data/reference-itinerary-ideas.json','data/revised-plan-content.json','data/revised-place-overrides.json','data/plan-2026-09-v2.json','data/trip-readiness.json','data/day-route-maps.json','data/hangzhou-sep16-plan.json','data/sep15-user-details.json','data/day2-user-details.json','data/contextual-suggestions.json'];
const publicData=publicFiles.map(read).join('\n');
for(const forbidden of ['"policyNo"','"bookingReference"','"passengers"','"insuredPersons"'])ok(!publicData.includes(forbidden),`public data excludes private key ${forbidden}`);

const sw=read('sw.js');
ok(sw.includes("shanghai-family-trip-v2.18"),'service worker cache is v2.18');
ok(sw.includes('./v2/hangzhou-sep16-override.js')&&sw.includes('./data/hangzhou-sep16-plan.json'),'service worker precaches Sep 16 Hangzhou override/data');
ok(sw.includes('./v2/sep15-user-details.js')&&sw.includes('./data/sep15-user-details.json'),'service worker precaches Sep 15 detail overlay/data');
ok(sw.includes('./v2/day2-user-details.js')&&sw.includes('./data/day2-user-details.json'),'service worker precaches Day 2 detail overlay/data');
ok(sw.includes('./data/day-route-maps.json'),'service worker retains daily Google route map data');

const photoLib=read('v2/verified-photo-library.js');
const verifiedKeys=[...photoLib.matchAll(/^\s*'([^']+)'\s*:\s*\{/gm)].map(m=>m[1]);
ok(new Set(verifiedKeys).size===verifiedKeys.length,'verified photo library has unique exact-place keys');

console.log(`\nQA complete: ${days.length} runtime days, ${events.length} activities; Day 2 and Hangzhou route overlays are structurally ready.`);
