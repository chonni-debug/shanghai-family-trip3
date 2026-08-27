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
ok(events.length===53,'itinerary keeps all 53 activities');

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

const rootHtml=read('index.html');
const v2Html=read('v2/index.html');
ok(!/<iframe\b/i.test(rootHtml)&&!/<iframe\b/i.test(v2Html),'root and v2 contain no iframe');
ok(/<base href="\.\/v2\/">/.test(rootHtml),'root directly loads the standalone v2 application');
ok(rootHtml.includes('production-readiness.js')&&v2Html.includes('production-readiness.js'),'production readiness layer loads in root and v2');

const readiness=read('v2/production-readiness.js');
ok(readiness.includes("const SKIP_KEY='sh-skipped'"),'skip-event state is implemented');
ok(readiness.includes("const ONBOARD_KEY='sh-onboarding-v1'"),'first-run onboarding is implemented');
ok(readiness.includes('checkOfflineReadiness'),'offline readiness check is implemented');
ok(readiness.includes('adaptiveFamilyCard'),'family adaptive plan is implemented');

const publicData=['data/app-trip.json','data/app-days-1.json','data/app-days-2.json','data/app-days-3.json','data/app-support.json'].map(read).join('\n');
for(const forbidden of ['"policyNo"','"bookingReference"','"passengers"','"insuredPersons"'])ok(!publicData.includes(forbidden),`public trip data excludes private key ${forbidden}`);

const sw=read('sw.js');
ok(sw.includes("shanghai-family-trip-v2.5"),'service worker cache version is v2.5');
ok(sw.includes('./v2/production-readiness.js')&&sw.includes('./v2/production-readiness.css'),'production readiness assets are precached');

const photoLib=read('v2/verified-photo-library.js');
const verifiedKeys=[...photoLib.matchAll(/^\s*'([^']+)'\s*:\s*\{/gm)].map(m=>m[1]);
ok(new Set(verifiedKeys).size===verifiedKeys.length,'verified photo library has unique exact-place keys');
ok(verifiedKeys.length>=7,'verified photo library retains verified exact-place sources');

console.log(`\nQA complete: ${days.length} days, ${events.length} activities, ${verifiedKeys.length} exact-place remote photo mappings.`);
