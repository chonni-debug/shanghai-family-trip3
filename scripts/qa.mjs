import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const fail=msg=>{throw new Error('QA: '+msg)};
const ok=(cond,msg)=>{if(!cond)fail(msg);console.log('✓',msg)};
const clone=v=>JSON.parse(JSON.stringify(v));

// Reconstruct the same effective itinerary that the browser receives after runtime overlays.
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

const sep15=json('data/sep15-user-details.json');
const d15=days.find(d=>d.date===sep15.date);
const d15Lunch=d15.events.find(e=>e.cn==='南京西路附近餐厅');
Object.assign(d15Lunch,clone(sep15.jinganMeal));
const d15West=d15.events.find(e=>String(e.cn).includes('南京西路'));
d15West.contentExtras=d15West.contentExtras||{};
d15West.contentExtras.miniStops=clone(sep15.westNanjing.miniStops||[]);
const d15North=d15.events.find(e=>e.cn===sep15.northBund.anchor&&e.type==='sight');
d15North.route=clone(sep15.northBund.route);
d15North.contentExtras={...(d15North.contentExtras||{}),miniStops:clone(sep15.northBund.miniStops||[])};
const d15Dinner=d15.events.find(e=>e.time==='19:00'&&e.type==='food');
Object.assign(d15Dinner,clone(sep15.dinner));

const day2=json('data/day2-user-details.json');
const d14=days.find(d=>d.date===day2.date);
const d14Lunch=d14.events.find(e=>e.time==='12:30'&&e.type==='food');
Object.assign(d14Lunch,clone(day2.lunch));
const d14West=d14.events.find(e=>e.time===day2.huaihaiWest.anchorTime);
const d14East=d14.events.find(e=>e!==d14West&&((e.cn===day2.huaihaiEast.anchor&&e.type==='shopping')||e.time==='15:15'));
d14West.time=day2.huaihaiWest.anchorTime;
d14West.name=clone(day2.huaihaiWest.name);
d14West.en='Huaihai Middle Road shopping walk';
d14West.cn='淮海中路';
d14West.type='shopping';
d14West.route={
  th:[day2.huaihaiWest.route?.th,day2.huaihaiEast.route?.th].filter(Boolean).join(' • '),
  zh:[day2.huaihaiWest.route?.zh,day2.huaihaiEast.route?.zh].filter(Boolean).join(' • ')
};
d14West.contentExtras={miniStops:[...(day2.huaihaiWest.miniStops||[]),...(day2.huaihaiEast.miniStops||[])]};
if(d14East)d14.events.splice(d14.events.indexOf(d14East),1);
const d14X=d14.events.find(e=>e.cn==='新天地');
d14X.time=day2.xintiandi.time;
const d14Dinner=d14.events.find(e=>e.time==='18:00'&&e.type==='food');
Object.assign(d14Dinner,clone(day2.dinner));

ok(days.length===6,'runtime itinerary has exactly 6 days');
ok(days.map(d=>d.date).join(',')==='2026-09-13,2026-09-14,2026-09-15,2026-09-16,2026-09-17,2026-09-18','runtime dates remain Sep 13–18 2026');
const events=days.flatMap(d=>d.events||[]);
ok(events.length===56,'audited runtime itinerary has 56 core events after removing duplicate Huaihai card');
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
ok(has(1,'人民广场')&&has(1,'南京路步行街')&&has(1,'外滩'),'Day 1 remains People’s Square / Nanjing / Bund');
ok(has(2,'武康大楼')&&has(2,'安福路')&&has(2,'上金雀')&&has(2,'淮海中路')&&has(2,'新天地'),'Day 2 remains Wukang / Anfu / Grand Goldfinch / Huaihai / Xintiandi');
ok(has(3,'静安寺')&&has(3,'莱莱小笼(丰盛里店)')&&has(3,'北外滩滨江绿地')&&has(3,'费大厨'),'Day 3 remains Jing’an / Lai Lai / North Bund / Fei Da Chu');
ok(has(4,'G7501')&&has(4,'知味观')&&has(4,'飞来峰灵隐寺')&&has(4,'飞来峰造像')&&has(4,'清河坊历史文化特色街区')&&has(4,'D3132'),'Day 4 remains booked Hangzhou route');
ok(has(5,'豫园')&&has(5,'上海博物馆东馆')&&has(5,'上海中心大厦'),'Day 5 remains Yu Garden / Museum East / Shanghai Tower');
ok(has(6,'天安千树')&&has(6,'苏州河')&&has(6,'吉祥航空 HO1351'),'Day 6 remains 1000 Trees / Suzhou Creek / flight');

// Duplicate audit: one actual activity card per main destination; transport is retained separately.
const d14Huaihai=d14.events.filter(e=>e.type==='shopping'&&e.cn==='淮海中路');
ok(d14Huaihai.length===1,'Day 2 has one Huaihai shopping activity card');
ok(d14Huaihai[0].contentExtras.miniStops.length===5,'Day 2 Huaihai card contains exactly five current shopping stops');
ok(d14Huaihai[0].contentExtras.miniStops.map(x=>x.cn).join('>')==='LOOKNOW PARK>Songmont 山下有松(淮海中路店)>EMIS 中国首家旗舰店>名创优品 MINISO Pink>FARMER BOB(上海旗舰店)','Day 2 Huaihai shopping order is canonical');

const walk=json('data/day1-citywalk.json');
ok(walk.version===3&&walk.date==='2026-09-14','Day 2 detailed walk is current version');
ok(walk.sequence.some(x=>String(x.cn).includes('上金雀'))&&walk.sequence.some(x=>String(x.cn).includes('FARMER BOB'))&&walk.sequence.some(x=>String(x.cn).includes('Foodie Social')),'Day 2 detailed walk contains current lunch, shopping and dinner route');
ok(!(walk.eventExtras?.['淮海中路']?.miniStops||[]).some(x=>String(x).includes('TEENIE WEENIE')),'stale TEENIE WEENIE is not duplicated in current Huaihai mini-stops');

ok(sep15.jinganMeal.cn==='莱莱小笼(丰盛里店)'&&sep15.jinganMeal.route.th.includes('茂名北路277号'),'Sep 15 uses exact route-efficient Lai Lai Fengshengli branch');
ok(sep15.northBund.miniStops.some(x=>x.cn==='MANNER COFFEE(国客滨江店)'),'Sep 15 uses exact North Bund Manner branch');
ok(!sep15.northBund.miniStops.some(x=>x.cn==='北外滩滨江绿地'),'North Bund main destination is not repeated as its own mini-stop');
ok(sep15.dinner.route.th.includes('B2')&&!sep15.dinner.route.th.includes('ชั้น 2'),'Fei Da Chu floor conflict is resolved to B2');

const out=days[3].events.find(e=>String(e.cn).includes('G7501'));
const ret=days[3].events.find(e=>String(e.cn).includes('D3132')&&e.time==='19:13');
ok(out?.time==='06:45'&&out.route.th.includes('07:57')&&out.route.th.includes('5B'),'G7501 booked departure/arrival/gate note is stored');
ok(ret?.route.th.includes('20:32')&&days[3].events.some(e=>e.time==='18:35'&&e.route?.th?.includes('15B')),'D3132 booked departure/arrival/gate note is stored');
const idx=txt=>days[3].events.findIndex(e=>String(e.cn).includes(txt));
ok(idx('杭州西湖')<idx('知味观')&&idx('知味观')<idx('飞来峰灵隐寺')&&idx('飞来峰灵隐寺')<idx('飞来峰造像')&&idx('飞来峰造像')<idx('清河坊历史文化特色街区'),'Hangzhou core sightseeing order is correct');

const master=json('data/plan-2026-09-v2.json');
ok(master.booking.train.date==='2026-09-16'&&master.booking.train.status==='booked','master plan marks Sep 16 train as booked');
ok(master.booking.train.outbound.train==='G7501'&&master.booking.train.return.train==='D3132','master plan stores both booked train numbers');
ok(master.booking.museumEast.date==='2026-09-17'&&master.booking.shanghaiTower.date==='2026-09-17','Museum East and Shanghai Tower remain Sep 17');

const contextual=json('data/contextual-suggestions.json');
const c1=contextual.contexts.find(c=>c.day===1),c3west=contextual.contexts.find(c=>c.day===3&&c.anchors.includes('张园'));
const c5yu=contextual.contexts.find(c=>c.day===5&&c.anchors.includes('豫园'));
const c5lu=contextual.contexts.find(c=>c.day===5&&c.anchors.includes('陆家嘴'));
ok(!c1.suggestions.some(x=>String(x).includes('海底捞')),'Day 1 context does not repeat planned Haidilao dinner');
ok(!c3west.suggestions.includes('AMAM Lonbakery Town'),'Day 3 context does not repeat AMAM mini-stop');
ok(!c5yu.suggestions.includes('上海城隍庙'),'Day 5 context does not repeat City God Temple already bundled with Bazaar');
ok(!c5lu.suggestions.some(x=>String(x).includes('牛New寿喜烧')),'Day 5 context does not repeat New Sukiyaki already named in dinner card');
ok(!contextual.contexts.some(c=>c.day===4),'Hangzhou day has no contextual detours');

const routeMaps=json('data/day-route-maps.json');
ok(routeMaps.days.length===6,'daily Google route map covers all 6 days');
const rm14=routeMaps.days.find(d=>d.date==='2026-09-14'),rm16=routeMaps.days.find(d=>d.date==='2026-09-16');
ok(rm14?.stops?.length===13,'Sep 14 Google route keeps 13 ordered destination stops');
ok(rm16?.stops?.map(s=>s.zh).join('>')==='杭州东站>西湖>知味观(湖滨店)>飞来峰灵隐寺>飞来峰造像>清河坊历史文化特色街区>杭州东站','Hangzhou Google route matches requested 1–7 sequence');

const rootHtml=read('index.html'),v2Html=read('v2/index.html');
ok(rootHtml.includes('itinerary-audit.css')&&v2Html.includes('itinerary-audit.css'),'root and v2 load audit UI styles');
ok(rootHtml.includes('day2-user-details.js')&&v2Html.includes('day2-user-details.js'),'Day 2 overlay remains loaded');
const itinerary=read('v2/itinerary-v3.js');
ok(itinerary.includes('function v3TransferRow')&&itinerary.includes("e.type==='transport'"),'Plan renders transport events as compact transfer rows');
ok(itinerary.includes('activityEvents=d.events.filter'),'Plan statistics count activities separately from travel segments');
const day2Layer=read('v2/day2-user-details.js');
ok(day2Layer.includes('Consolidate the two historical Huaihai cards')&&day2Layer.includes('day.events.splice'),'Day 2 runtime overlay removes duplicate Huaihai card');

const publicFiles=['data/app-trip.json','data/app-days-1.json','data/app-days-2.json','data/app-days-3.json','data/app-support.json','data/content-places.json','data/content-food.json','data/reference-itinerary-ideas.json','data/revised-plan-content.json','data/revised-place-overrides.json','data/plan-2026-09-v2.json','data/trip-readiness.json','data/day-route-maps.json','data/hangzhou-sep16-plan.json','data/sep15-user-details.json','data/day2-user-details.json','data/day1-citywalk.json','data/day1-bund-photo-walk.json','data/contextual-suggestions.json'];
const publicData=publicFiles.map(read).join('\n');
for(const forbidden of ['"policyNo"','"bookingReference"','"passengers"','"insuredPersons"'])ok(!publicData.includes(forbidden),`public data excludes private key ${forbidden}`);

const sw=read('sw.js');
ok(sw.includes("shanghai-family-trip-v2.19"),'service worker cache is v2.19');
ok(sw.includes("'./v2/itinerary-audit.css'"),'service worker precaches audit UI styles');
ok(sw.includes('./v2/day2-user-details.js')&&sw.includes('./data/day2-user-details.json'),'service worker retains Day 2 overlay/data');

const photoLib=read('v2/verified-photo-library.js');
const verifiedKeys=[...photoLib.matchAll(/^\s*'([^']+)'\s*:\s*\{/gm)].map(m=>m[1]);
ok(new Set(verifiedKeys).size===verifiedKeys.length,'verified photo library has unique exact-place keys');

console.log(`\nQA complete: ${days.length} runtime days, ${events.length} core events after deduplication.`);
