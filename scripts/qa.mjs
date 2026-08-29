import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const fail=msg=>{throw new Error('QA: '+msg)};
const ok=(cond,msg)=>{if(!cond)fail(msg);console.log('✓',msg)};

const dayParts=['data/app-days-1.json','data/app-days-2.json','data/app-days-3.json'].map(json);
const days=dayParts.flatMap(x=>x.days||[]);
ok(days.length===6,'itinerary has exactly 6 days');
const events=days.flatMap(d=>d.events||[]);
ok(events.length===53,'itinerary keeps all 53 core activities');

for(const [di,day] of days.entries()){
  ok(Boolean(day.date),`day ${di+1} has a date`);
  ok(Boolean(day.title?.th&&day.title?.zh),`day ${di+1} title is bilingual`);
  for(const [ei,e] of (day.events||[]).entries()){
    const tag=`day ${di+1} event ${ei+1}`;
    ok(Boolean(e.time),`${tag} has time`);
    ok(Boolean(e.cn),`${tag} has Chinese destination text`);
    ok(Boolean(e.name?.th&&e.name?.zh),`${tag} name is bilingual`);
    for(const field of ['route','meal','arrival'])if(e[field])ok(Boolean(e[field].th&&e[field].zh),`${tag} ${field} is bilingual`);
  }
}

const extraPlaces=json('data/content-places.json');
const extraFood=json('data/content-food.json');
const day1Walk=json('data/day1-citywalk.json');
const contextual=json('data/contextual-suggestions.json');
ok((extraPlaces.places||[]).length>=40,'extended place library restores at least 40 places and route stops');
ok((extraFood.places||[]).length>=5,'food guide restores researched restaurant entries');
for(const p of [...extraPlaces.places,...extraFood.places])ok(Boolean(p.cn&&p.name?.th&&p.name?.zh),`extended place ${p.id||p.cn} is bilingual and has Chinese copy text`);
for(const key of ['五原路','乌鲁木齐中路','安福路','延庆坊','武康大楼','上海博物馆','思南公馆','北外滩滨江绿地','上海自然博物馆','豫园老街','正大广场'])ok(extraPlaces.places.some(p=>p.cn===key),`extended place library contains ${key}`);
for(const key of ['莱莱小笼·乔艾','味香斋(雁荡路店)','沪西老弄堂面馆(静安寺店)','舒蔡记生煎菜饭(浙江中路店)','阿娘面馆(锡荣别墅店)'])ok(extraFood.places.some(p=>p.cn===key),`food guide contains ${key}`);
ok(new Set(extraFood.places.map(p=>p.foodStatus)).has('planned')&&new Set(extraFood.places.map(p=>p.foodStatus)).has('must_try')&&new Set(extraFood.places.map(p=>p.foodStatus)).has('backup'),'food guide uses Planned / Must Try / Backup roles');
ok(day1Walk.sequence?.length===11,'Day 1 detailed city walk keeps 11 ordered stops');
ok(day1Walk.sequence?.some(x=>x.cn.includes('LOOKNOW&FLOW 安福路168号'))&&day1Walk.sequence?.some(x=>x.cn.includes('TEENIE WEENIE武康路概念店 淮海中路1946号')),'Day 1 detailed route contains Anfu and Wukang shopping stops');

const contextPlaces=new Set([...extraPlaces.places,...extraFood.places].map(p=>p.cn));
ok((contextual.contexts||[]).length>=8,'contextual guide covers at least eight day/zone contexts');
for(const [i,c] of (contextual.contexts||[]).entries()){
  ok(Number(c.day)>=1&&Number(c.day)<=6,`context ${i+1} targets a valid trip day`);
  ok(Boolean(c.reason?.th&&c.reason?.zh),`context ${i+1} reason is bilingual`);
  ok(Array.isArray(c.anchors)&&c.anchors.length>0,`context ${i+1} has itinerary anchors`);
  ok(Array.isArray(c.suggestions)&&c.suggestions.length>0,`context ${i+1} has suggestions`);
  for(const cn of c.suggestions)ok(contextPlaces.has(cn),`context ${i+1} suggestion resolves to content place ${cn}`);
}
ok(contextual.contexts.some(c=>c.day===2&&c.anchors.includes('静安寺')&&c.suggestions.includes('沪西老弄堂面馆(静安寺店)')),'Jing’an context suggests Huxi noodle house');
ok(contextual.contexts.some(c=>c.day===3&&c.anchors.includes('人民广场')&&c.suggestions.includes('莱莱小笼·乔艾')&&c.suggestions.includes('舒蔡记生煎菜饭(浙江中路店)')),'People’s Square context includes nearby food choices');
ok(contextual.contexts.some(c=>c.day===6&&c.anchors.includes('淮海中路')&&c.suggestions.includes('思南公馆')),'Huaihai context includes Sinan options');

const rootHtml=read('index.html');
const v2Html=read('v2/index.html');
ok(!/<iframe\b/i.test(rootHtml)&&!/<iframe\b/i.test(v2Html),'root and v2 contain no iframe');
ok(/<base href="\.\/v2\/">/.test(rootHtml),'root directly loads the standalone v2 application');
ok(rootHtml.includes('production-readiness.js')&&v2Html.includes('production-readiness.js'),'production readiness layer loads in root and v2');
ok(rootHtml.includes('wallet-storage-guard.js')&&v2Html.includes('wallet-storage-guard.js'),'wallet storage guard loads in root and v2');
ok(rootHtml.includes('content-library.js')&&v2Html.includes('content-library.js'),'extended content library loads in root and v2');
ok(rootHtml.includes('contextual-suggestions.js')&&v2Html.includes('contextual-suggestions.js'),'contextual Today suggestions load in root and v2');
ok(rootHtml.includes('itinerary-v3.js')&&v2Html.includes('itinerary-v3.js'),'itinerary card UI v3 loads in root and v2');
ok(rootHtml.includes('itinerary-v3.css')&&v2Html.includes('itinerary-v3.css'),'itinerary card UI v3 styles load in root and v2');

const readiness=read('v2/production-readiness.js');
ok(readiness.includes("const SKIP_KEY='sh-skipped'"),'skip-event state is implemented');
ok(readiness.includes("const ONBOARD_KEY='sh-onboarding-v1'"),'first-run onboarding is implemented');
ok(readiness.includes('checkOfflineReadiness'),'offline readiness check is implemented');
ok(readiness.includes('adaptiveFamilyCard'),'family adaptive plan is implemented');

const walletGuard=read('v2/wallet-storage-guard.js');
ok(walletGuard.includes('probeWalletStorage'),'wallet storage capability probe is implemented');
ok(walletGuard.includes('Private')&&walletGuard.includes('QuotaExceededError'),'wallet storage guard distinguishes restricted/private and quota failures');
ok(walletGuard.includes('showWalletStorageHelp'),'wallet storage failure has an actionable recovery flow');

const contentLayer=read('v2/content-library.js');
ok(contentLayer.includes('foodStatus')&&contentLayer.includes('data-food-role'),'Explore food guide exposes role filtering');
ok(contentLayer.includes('contentRoute')&&contentLayer.includes('content-mini-stops'),'Plan data layer can carry detailed route without adding core activities');

const contextLayer=read('v2/contextual-suggestions.js');
ok(contextLayer.includes('ctContext')&&contextLayer.includes('contextualCard'),'Today has plan-context suggestion logic');
ok(contextLayer.includes("state.family==='rest'")&&contextLayer.includes("state.family==='tired'"),'context suggestions respect tired/rest family modes');
ok(contextLayer.includes('ไม่ใช้ GPS')&&contextLayer.includes('不使用 GPS'),'context UI does not claim live GPS proximity');

const itineraryV3=read('v2/itinerary-v3.js');
ok(itineraryV3.includes('v3DayChips')&&itineraryV3.includes('v3-itinerary-card'),'Plan v3 uses scrollable day chips and compact itinerary cards');
ok(itineraryV3.includes('v3Names')&&itineraryV3.includes('v3-cn-name'),'Plan v3 always keeps Thai and Chinese place names available');
ok(itineraryV3.includes('data-copy')&&itineraryV3.includes('data-show-cn-day')&&itineraryV3.includes('data-speak'),'expanded Plan cards retain Copy Chinese, Show Chinese and speech actions');
ok(itineraryV3.includes('data-skip-event')&&itineraryV3.includes('data-done'),'expanded Plan cards retain skip and arrival state actions');
ok(itineraryV3.includes('v3Transport')&&!itineraryV3.includes('durationMinutes'),'route connectors classify transport without inventing transit duration');
ok(itineraryV3.includes('contextualCard'),'expanded Plan cards can expose existing contextual suggestions');

const publicData=['data/app-trip.json','data/app-days-1.json','data/app-days-2.json','data/app-days-3.json','data/app-support.json','data/content-places.json','data/content-food.json','data/day1-citywalk.json','data/contextual-suggestions.json'].map(read).join('\n');
for(const forbidden of ['"policyNo"','"bookingReference"','"passengers"','"insuredPersons"'])ok(!publicData.includes(forbidden),`public trip data excludes private key ${forbidden}`);

const sw=read('sw.js');
ok(sw.includes("shanghai-family-trip-v2.9"),'service worker cache version is v2.9');
ok(sw.includes('./v2/production-readiness.js')&&sw.includes('./v2/production-readiness.css'),'production readiness assets are precached');
ok(sw.includes('./v2/wallet-storage-guard.js'),'wallet storage guard is precached');
ok(sw.includes('./v2/content-library.js')&&sw.includes('./data/content-food.json')&&sw.includes('./data/day1-citywalk.json'),'extended content library and data are precached');
ok(sw.includes('./v2/contextual-suggestions.js')&&sw.includes('./v2/contextual-suggestions.css')&&sw.includes('./data/contextual-suggestions.json'),'contextual suggestion assets and data are precached');
ok(sw.includes('./v2/itinerary-v3.js')&&sw.includes('./v2/itinerary-v3.css'),'itinerary card UI v3 assets are precached');

const photoLib=read('v2/verified-photo-library.js');
const verifiedKeys=[...photoLib.matchAll(/^\s*'([^']+)'\s*:\s*\{/gm)].map(m=>m[1]);
ok(new Set(verifiedKeys).size===verifiedKeys.length,'verified photo library has unique exact-place keys');
ok(verifiedKeys.length>=7,'verified photo library retains verified exact-place sources');

console.log(`\nQA complete: ${days.length} days, ${events.length} core activities, ${extraPlaces.places.length} extended places, ${extraFood.places.length} researched food entries, ${contextual.contexts.length} contextual zones, Plan UI v3 enabled.`);
