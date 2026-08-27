const CACHE='shanghai-family-trip-v2.7';

const ESSENTIAL=[
  './',
  './index.html',
  './manifest.webmanifest',
  './v2/',
  './v2/index.html',
  './v2/app.css',
  './v2/private-wallet.css',
  './v2/content-library.css',
  './v2/photo-integrity.css',
  './v2/usability.css',
  './v2/production-readiness.css',
  './v2/app-core.js',
  './v2/app-views-main.js',
  './v2/app-views-more.js',
  './v2/app-modals.js',
  './v2/private-wallet.js',
  './v2/content-library.js',
  './v2/verified-photo-library.js',
  './v2/photo-integrity.js',
  './v2/usability.js',
  './v2/production-readiness.js',
  './v2/wallet-storage-guard.js',
  './v2/app-events.js',
  './data/app-trip.json',
  './data/app-days-1.json',
  './data/app-days-2.json',
  './data/app-days-3.json',
  './data/app-support.json',
  './data/content-places.json',
  './data/content-food.json',
  './data/day1-citywalk.json',
  './icons/trip-icon.svg',
  './icons/trip-maskable.svg',
  './images/offline-map-fallback.svg',
  './images/photo-001.png'
];

const OPTIONAL=[];
for(let i=2;i<=13;i++)OPTIONAL.push(`./images/photo-${String(i).padStart(3,'0')}.jpg`);
for(let i=14;i<=19;i++)OPTIONAL.push(`./images/photo-${String(i).padStart(3,'0')}.png`);
for(let i=20;i<=53;i++)OPTIONAL.push(`./images/photo-${String(i).padStart(3,'0')}.jpg`);
[
  'food-lai-lai-xiao-long-collage.png','food-huxi-old-alley-noodle-house-collage.png','food-shu-cai-ji-shengjian-kitchen-menu.png','food-a-niang-noodle-house-beef-noodles.png','food-ren-he-guan-storefront.png','food-park-hotel-bakery-butterfly-pastry.png','food-songhelou-suzhou-noodles-hongyi-collage.png','food-da-hu-chun-shengjian-collage.png','food-yongfeng-noodle-house-storefront-preferred.png','food-shao-wan-sheng-shanxi-south-road-storefront.png','food-shen-da-cheng-nanjing-east-road-exit-10.png','food-apoli-itabakery-bakery-counter.png','food-butterful-and-creamorous-west-nanjing-road-storefront.png','food-shanghai-grandmother-restaurant-fuzhou-road-storefront.png','food-maotou-laodie-jingan-yuyuan-road-storefront.png','food-luo-chun-ge-shanghai-friedbuns-storefront.png','food-wu-you-xian-storefront.png','food-autumn-flavor-xiaoqiu-tianjin-road-406-storefront.png','food-yaba-shengjian-suzhou-storefront.png'
].forEach(name=>OPTIONAL.push('./images/'+name));

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(ESSENTIAL);
    await Promise.allSettled(OPTIONAL.map(url=>cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(event.request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request);
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone()).catch(()=>{});
        return response;
      }catch(err){
        const fallback=url.pathname.includes('/v2/')?'./v2/index.html':'./index.html';
        return (await caches.match(event.request)) || (await caches.match(fallback)) || (await caches.match('./index.html'));
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    try{
      const response=await fetch(event.request);
      if(response&&(response.ok||response.type==='opaque')){
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone()).catch(()=>{});
      }
      return response;
    }catch(err){
      if(event.request.destination==='image')return (await caches.match('./images/offline-map-fallback.svg')) || Response.error();
      return Response.error();
    }
  })());
});