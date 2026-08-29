import { test, expect } from '@playwright/test';

const widths=[375,390,430];

async function prime(page){
  await page.addInitScript(()=>localStorage.setItem('sh-onboarding-v1','done'));
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#bottomNav button')).toHaveCount(5);
}

for(const width of widths){
  test(`root app fits ${width}px without horizontal overflow`,async({page})=>{
    await page.setViewportSize({width,height:844});
    await prime(page);
    expect(new URL(page.url()).pathname).toBe('/');
    await expect(page.locator('iframe')).toHaveCount(0);
    const overflow=await page.evaluate(()=>({html:document.documentElement.scrollWidth-window.innerWidth,body:document.body.scrollWidth-window.innerWidth}));
    expect(overflow.html).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);
  });
}

test('Thai and Chinese navigation both render',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await expect(page.locator('#bottomNav button').first()).toContainText('วันนี้');
  await page.locator('#langBtn').click();
  await expect(page.locator('#bottomNav button').first()).toContainText('今天');
});

test('Plan v3 Day 1 is the revised Classic Shanghai itinerary and retains detail actions',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="plan"]').click();
  await expect(page.locator('.v3-day-chip')).toHaveCount(6);
  await expect(page.locator('.v3-itinerary-card')).toHaveCount(9);
  await expect(page.locator('.v3-day-header')).toContainText('Classic Shanghai');
  await expect(page.locator('.v3-timeline')).toContainText('จัตุรัสประชาชน');
  await expect(page.locator('.v3-timeline')).toContainText('ถนนคนเดินหนานจิง');
  await expect(page.locator('.v3-timeline')).toContainText('เดอะบันด์');
  const first=page.locator('.v3-itinerary-card').first();
  await expect(first).toContainText('ถึงสนามบินผู่ตง T2');
  await expect(first).toContainText('抵达浦东机场 T2');
  await expect(first.locator('.v3-thumb')).toBeVisible();
  await first.locator('.v3-card-summary').click();
  await expect(first.locator('.v3-card-detail')).toBeVisible();
  await expect(first.locator('.v3-cn-copy')).toContainText('上海浦东国际机场T2');
  await expect(first.locator('[data-copy]')).toBeVisible();
  await expect(first.locator('[data-show-cn-day]')).toBeVisible();
  await expect(first.locator('[data-speak]')).toBeVisible();
  await first.locator('[data-skip-event]').click();
  await expect(page.locator('.v3-itinerary-card.skipped').first()).toBeVisible();
  await page.locator('.v3-itinerary-card.skipped [data-skip-event]').first().click();
  await expect(page.locator('.v3-itinerary-card.skipped')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('Plan v3 Day 2 exposes the focused 9-stop French Concession detail route',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="plan"]').click();
  await page.locator('.v3-day-chip').nth(1).click();
  await expect(page.locator('.v3-day-header')).toContainText('French Concession');
  const walk=page.locator('.v3-walk-detail');
  await expect(walk).toBeVisible();
  await expect(walk.locator('.v3-walk-sequence > div')).toHaveCount(9);
  await walk.locator('summary').click();
  await expect(walk).toContainText('อาคารอู่คัง');
  await expect(walk).toContainText('LOOKNOW&FLOW');
  await expect(walk).toContainText('TEENIE WEENIE');
  await expect(walk).toContainText('ถนนหวยไห่กลาง');
});

test('Plan v3 revised days place Hangzhou on Sep 15 and Museum East on Sep 16',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="plan"]').click();
  await page.locator('.v3-day-chip').nth(2).click();
  await expect(page.locator('.v3-day-header')).toContainText('Hangzhou One Day Trip');
  await expect(page.locator('.v3-timeline')).toContainText('วัดหลิงอิ่น + เฟยไหลเฟิง');
  await expect(page.locator('.v3-timeline')).toContainText('หมู่บ้านหลงจิ่ง');
  await expect(page.locator('.v3-itinerary-card')).toHaveCount(13);
  await page.locator('.v3-day-chip').nth(3).click();
  await expect(page.locator('.v3-timeline')).toContainText('Shanghai Museum East');
  await expect(page.locator('.v3-timeline')).toContainText('Shanghai Tower 118F');
  await expect(page.locator('.v3-itinerary-card')).toHaveCount(9);
});

test('Plan v3 keeps Thai visible when UI switches to Chinese',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('#langBtn').click();
  await page.locator('[data-tab="plan"]').click();
  const first=page.locator('.v3-itinerary-card').first();
  await expect(first).toContainText('抵达浦东机场 T2');
  await expect(first).toContainText('ไทย · ถึงสนามบินผู่ตง T2');
});

test('Explore retains old content and adds revised-plan restaurants with Chinese copy',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="explore"]').click();
  await expect(page.getByText('พิพิธภัณฑ์เซี่ยงไฮ้',{exact:true})).toBeVisible();
  const search=page.locator('#placeSearch');
  await search.fill('佳家汤包');
  const jia=page.locator('.content-place-card').filter({hasText:'佳家汤包(黄河路店)'}).first();
  await expect(jia).toBeVisible();
  await expect(jia).toContainText('黄河路127号');
  await expect(jia.locator('[data-copy]')).toBeVisible();
  await search.fill('绿茶餐厅');
  const green=page.locator('.content-place-card').filter({hasText:'绿茶餐厅(龙井船宴·品牌总店)'}).first();
  await expect(green).toBeVisible();
  await expect(green).toContainText('龙井路83号');
});

test('Today shows revised People’s Square contextual choices on Day 1',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>localStorage.setItem('sh-sim-v3',JSON.stringify({active:true,day:0,time:'11:05'})));
  await prime(page);
  const context=page.locator('.context-suggestions');
  await expect(context).toBeVisible();
  await expect(context).toContainText('อิงจากจุดในแผน');
  await expect(context.locator('.context-mini-card')).toHaveCount(2);
  await expect(context).toContainText('ไลไลเสี่ยวหลง');
  await expect(context).toContainText('ซูไช่จี้เซิงเจียน');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('rest family mode does not encourage extra contextual stops',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>{
    localStorage.setItem('sh-sim-v3',JSON.stringify({active:true,day:0,time:'11:05'}));
    localStorage.setItem('sh-family-status','rest');
  });
  await prime(page);
  await expect(page.locator('.context-suggestions')).toHaveCount(0);
});

test('More exposes trip readiness with train, Lingyin, Museum East and weather checks',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="more"]').click();
  const entry=page.getByText('ความพร้อมก่อนเดินทาง',{exact:true}).last();
  await expect(entry).toBeVisible();
  await page.locator('[data-more="readiness"]').click();
  await expect(page.locator('.readiness-list')).toBeVisible();
  await expect(page.locator('.readiness-list')).toContainText('15 ก.ย.');
  await expect(page.locator('.readiness-list')).toContainText('Lingyin');
  await expect(page.locator('.readiness-list')).toContainText('Shanghai Museum East');
  await expect(page.locator('.readiness-list')).toContainText('Shanghai Tower');
  await expect(page.locator('.readiness-list')).toContainText('อากาศ');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('offline reload keeps revised root app usable after cache warmup',async({page,context})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.evaluate(async()=>{if('serviceWorker' in navigator)await navigator.serviceWorker.ready;});
  await page.reload();
  await expect(page.locator('#app')).toBeVisible();
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#bottomNav button')).toHaveCount(5);
  await context.setOffline(false);
});
