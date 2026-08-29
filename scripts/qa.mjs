import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const fail=msg=>{throw new Error('QA: '+msg)};
const ok=(cond,msg)=>{if(!cond)fail(msg);console.log('✓',msg)};

const parts=['data/app-days-1.json','data/app-days-2.json','data/app-days-3.json'].map(json);
const days=parts.flatMap(x=>x.days||[]);
const events=days.flatMap(d=>d.events||[]);
ok(days.length===6,'revised itinerary has exactly 6 days');
ok(events.length===57,'revised itinerary has 57 intentional core activities');
ok(days.map(d=>d.date).join(',')==='2026-09-13,2026-09-14,2026-09-15,2026-09-16,2026-09-17,2026-09-18','trip dates remain Sep 13–18 2026');

for(const [di,day] of days.entries()){
  ok(Boolean(day.date),`day ${di+1} has date`);
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

const has=(dayNo,cn)=>days[dayNo-1].events.some(e=>e.cn===cn||String(e.cn).includes(cn));
ok(has(1,'人民广场')&&has(1,'南京路步行街')&&has(1,'外滩'),'Day 1 is Classic Shanghai with People’s Square, Nanjing Road and Bund');
ok(has(2,'武康大楼')&&has(2,'安福路')&&has(2,'淮海中路')&&has(2,'新天地'),'Day 2 is French Concession core route');
ok(has(3,'上海虹桥 → 杭州东')&&has(3,'灵隐寺 / 飞来峰')&&has(3,'龙井村'),'Day 3 is Hangzhou on Sep 15 with Lingyin and Longjing');
ok(has(4,'豫园')&&has(4,'上海博物馆东馆')&&has(4,'上海中心大厦'),'Day 4 is Yu Garden, Museum East and Shanghai Tower');
ok(has(5,'静安寺')&&has(5,'南京西路 / 张园')&&has(5,'北外滩滨江绿地'),'Day 5 is Jing’an, Zhangyuan and North Bund');
ok(has(6,'天安千树')&&has(6,'苏州河')&&has(6,'吉祥航空 HO1351'),'Day 6 is 1000 Trees, Suzhou Creek and airport return');

const trip=json('data/app-trip.json');
ok(trip.trip.flights[0].flight==='HO1352'&&trip.trip.flights[0].from==='BKK 01:25'&&trip.trip.flights[0].to==='PVG T2 06:45','outbound e-ticket time is preserved');
ok(trip.trip.flights[1].flight==='HO1351'&&trip.trip.flights[1].from==='PVG T2 20:50'&&trip.trip.flights[1].to==='BKK 00:25 (+1)','return e-ticket time is preserved');
ok(days[0].events[0].time==='06:45'&&days[5].events.at(-1).time==='20:50','timeline uses e-ticket airport/flight times instead of conflicting prose times');

const extraPlaces=json('data/content-places.json');
const extraFood=json('data/content-food.json');
const reference=json('data/reference-itinerary-ideas.json');
const revised=json('data/revised-plan-content.json');
const master=json('data/plan-2026-09-v2.json');
const walk=json('data/day1-citywalk.json');
const contextual=json('data/contextual-suggestions.json');
const readiness=json('data/trip-readiness.json');

ok((extraPlaces.places||[]).length>=40,'extended place library still preserves at least 40 places');
ok((extraFood.places||[]).length>=5,'researched food library is retained');
ok((reference.places||[]).length>=14,'screenshot-derived reference library is retained');
ok((revised.places||[]).length>=10,'revised plan adds at least 10 verified/practical places');
for(const p of [...extraPlaces.places,...extraFood.places,...reference.places,...revised.places])ok(Boolean(p.cn&&p.name?.th&&p.name?.zh),`content item ${p.id||p.cn} is bilingual with Chinese text`);
for(const key of ['佳家汤包(黄河路店)','Sunflour(安福路店)','绿茶餐厅(龙井船宴·品牌总店)','知味观(湖滨店)','上海博物馆东馆','天安千树']){
  const p=revised.places.find(x=>x.cn===key);ok(Boolean(p),`revised content contains ${key}`);ok(Boolean(p.copyText||key==='张园'),`${key} retains Chinese copy/search text`);
}
ok(master.booking?.train?.date==='2026-09-15','master audit plan moves Hangzhou train to Sep 15');
ok(master.booking?.lingyin?.date==='2026-09-15','master audit plan tracks Lingyin on Sep 15');

ok(walk.date==='2026-09-14','detailed French Concession route moved to Day 2');
ok(walk.sequence?.length===9,'Day 2 detailed route contains 9 focused stops');
ok(walk.sequence?.[0]?.cn==='武康大楼'&&walk.sequence.some(x=>x.cn==='安福路')&&walk.sequence.some(x=>x.cn.includes('TEENIE WEENIE')),'Day 2 route follows Wukang → Anfu → Huaihai focus');
ok((walk.preservedInExplore||[]).includes('五原路')&&(walk.preservedInExplore||[]).includes('延庆路'),'removed core City Walk locations are explicitly preserved in Explore');

const allContent=new Set([...extraPlaces.places,...extraFood.places,...reference.places,...revised.places].map(p=>p.cn));
ok((contextual.contexts||[]).length>=9,'revised contextual guide covers key zones');
for(const [i,c] of contextual.contexts.entries()){
  ok(c.day>=1&&c.day<=6,`context ${i+1} targets valid day`);
  ok(Boolean(c.reason?.th&&c.reason?.zh),`context ${i+1} reason is bilingual`);
  for(const cn of c.suggestions)ok(allContent.has(cn),`context ${i+1} suggestion resolves: ${cn}`);
}
ok(contextual.contexts.some(c=>c.day===1&&c.anchors.includes('人民广场')),'People’s Square context moved to Day 1');
ok(contextual.contexts.some(c=>c.day===3&&c.suggestions.includes('绿茶餐厅(龙井船宴·品牌总店)')),'Hangzhou context contains Green Tea Restaurant');
ok(contextual.contexts.some(c=>c.day===4&&c.anchors.includes('陆家嘴')&&c.suggestions.includes('牛New寿喜烧(上海中心店)')),'Day 4 Lujiazui keeps dinner backup');
ok(contextual.contexts.some(c=>c.day===5&&c.anchors.includes('南京西路 / 张园')),'Day 5 West Nanjing/Zhangyuan context is aligned');
ok(!contextual.contexts.some(c=>c.day===6),'Day 6 has no optional contextual detours before flight');

ok(readiness.last_verified==='2026-08-29','trip readiness has current verification date');
for(const id of ['hangzhou-train','lingyin','yu-garden','museum-east','shanghai-tower','1000-trees','weather','passport-train'])ok(readiness.checks.some(x=>x.id===id),`readiness tracks ${id}`);
ok(readiness.checks.find(x=>x.id==='hangzhou-train')?.detail.includes('15 ก.ย.'),'train readiness uses revised Sep 15 date');
ok(readiness.checks.find(x=>x.id==='lingyin')?.detail.includes('杭州灵隐飞来峰'),'Lingyin readiness includes official mini-program');
ok(readiness.checks.find(x=>x.id==='museum-east')?.status==='verified','Museum East is marked verified in readiness data');
ok(readiness.checks.find(x=>x.id==='weather')?.status==='live','weather remains a live/recheck item rather than a fixed forecast');

const rootHtml=read('index.html'),v2Html=read('v2/index.html');
ok(!/<iframe\b/i.test(rootHtml)&&!/<iframe\b/i.test(v2Html),'root and v2 remain standalone with no iframe');
ok(rootHtml.includes('trip-readiness-ui.js')&&v2Html.includes('trip-readiness-ui.js'),'trip readiness UI loads in root and v2');
ok(rootHtml.includes('trip-readiness-ui.css')&&v2Html.includes('trip-readiness-ui.css'),'trip readiness styles load in root and v2');

const contentLayer=read('v2/content-library.js');
ok(contentLayer.includes('revised-plan-content.json'),'content library loads revised plan content');
ok(contentLayer.includes('DAY ${dayNo}'),'detailed route header is day-aware instead of hardcoded Day 1');
const readinessUi=read('v2/trip-readiness-ui.js');
ok(readinessUi.includes("state.moreView==='readiness'")&&readinessUi.includes('trip-readiness.json'),'More menu exposes trip readiness view');

const itineraryV3=read('v2/itinerary-v3.js');
ok(itineraryV3.includes('v3DayChips')&&itineraryV3.includes('v3-itinerary-card'),'Plan v3 remains enabled');
ok(itineraryV3.includes('v3-cn-name')&&itineraryV3.includes('data-copy'),'Plan v3 retains bilingual names and Copy Chinese');
ok(itineraryV3.includes('data-skip-event')&&itineraryV3.includes('data-done'),'Plan v3 retains skip and arrival actions');

const publicFiles=['data/app-trip.json','data/app-days-1.json','data/app-days-2.json','data/app-days-3.json','data/app-support.json','data/content-places.json','data/content-food.json','data/reference-itinerary-ideas.json','data/revised-plan-content.json','data/plan-2026-09-v2.json','data/trip-readiness.json','data/day1-citywalk.json','data/contextual-suggestions.json'];
const publicData=publicFiles.map(read).join('\n');
for(const forbidden of ['"policyNo"','"bookingReference"','"passengers"','"insuredPersons"'])ok(!publicData.includes(forbidden),`public data excludes private key ${forbidden}`);

const sw=read('sw.js');
ok(sw.includes("shanghai-family-trip-v2.11"),'service worker cache is v2.11');
for(const asset of ['./data/revised-plan-content.json','./data/plan-2026-09-v2.json','./data/trip-readiness.json','./v2/trip-readiness-ui.js','./v2/trip-readiness-ui.css'])ok(sw.includes(asset),`service worker precaches ${asset}`);

const photoLib=read('v2/verified-photo-library.js');
const verifiedKeys=[...photoLib.matchAll(/^\s*'([^']+)'\s*:\s*\{/gm)].map(m=>m[1]);
ok(new Set(verifiedKeys).size===verifiedKeys.length,'verified photo library has unique exact-place keys');
ok(verifiedKeys.length>=7,'verified photo library is retained');

console.log(`\nQA complete: ${days.length} days, ${events.length} revised core activities, ${revised.places.length} revised-plan content items, ${contextual.contexts.length} contextual zones, readiness enabled.`);
