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

test('Plan v3 Day 1 separates airport transfer from numbered activities',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="plan"]').click();
  await expect(page.locator('.v3-day-chip')).toHaveCount(6);
  await expect(page.locator('.v3-itinerary-card')).toHaveCount(8);
  await expect(page.locator('.v3-transfer-row')).toHaveCount(1);
  await expect(page.locator('.v3-transfer-row')).toContainText('ถึงสนามบินผู่ตง T2');
  await expect(page.locator('.v3-transfer-row')).toContainText('抵达浦东机场 T2');
  await expect(page.locator('.v3-day-header')).toContainText('Classic Shanghai');
  await expect(page.locator('.v3-timeline')).toContainText('จัตุรัสประชาชน');
  await expect(page.locator('.v3-timeline')).toContainText('ถนนคนเดินหนานจิง');
  await expect(page.locator('.v3-timeline')).toContainText('เดอะบันด์');
  const first=page.locator('.v3-itinerary-card').first();
  await expect(first).toContainText('ถึงโรงแรม / ฝากกระเป๋า / พัก');
  await first.locator('.v3-card-summary').click();
  await expect(first.locator('.v3-card-detail')).toBeVisible();
  await expect(first.locator('[data-copy]')).toBeVisible();
  await expect(first.locator('[data-show-cn-day]')).toBeVisible();
  await expect(first.locator('[data-speak]')).toBeVisible();
  await first.locator('[data-skip-event]').click();
  await expect(page.locator('.v3-itinerary-card.skipped').first()).toBeVisible();
  await page.locator('.v3-itinerary-card.skipped [data-skip-event]').first().click();
  await expect(page.locator('.v3-itinerary-card.skipped')).toHaveCount(0);
});

test('Plan v3 Day 2 exposes the current French Concession detail route without stale duplicates',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="plan"]').click();
  await page.locator('.v3-day-chip').nth(1).click();
  await expect(page.locator('.v3-day-header')).toContainText('French Concession');
  const walk=page.locator('.v3-walk-detail');
  await expect(walk).toBeVisible();
  await expect(walk.locator('.v3-walk-sequence > div')).toHaveCount(17);
  await expect(walk).toContainText('Grand Goldfinch');
  await expect(walk).toContainText('FARMER BOB');
  await expect(walk).toContainText('Foodie Social');
});

test('Plan v3 rotates Sep 15-17 and uses booked Hangzhou trains on Sep 16',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="plan"]').click();

  await page.locator('.v3-day-chip').nth(2).click();
  await expect(page.locator('.v3-day-header')).toContainText('Jing');
  await expect(page.locator('.v3-timeline')).toContainText('วัดจิ้งอัน');
  await expect(page.locator('.v3-timeline')).toContainText('North Bund');

  await page.locator('.v3-day-chip').nth(3).click();
  await expect(page.locator('.v3-day-header')).toContainText('Hangzhou One Day Trip');
  await expect(page.locator('.v3-itinerary-card')).toHaveCount(9);
  await expect(page.locator('.v3-transfer-row')).toHaveCount(4);
  await expect(page.locator('.v3-timeline')).toContainText('G7501');
  await expect(page.locator('.v3-timeline')).toContainText('06:45');
  await expect(page.locator('.v3-timeline')).toContainText('จือเว่ยก่วน Hubin');
  await expect(page.locator('.v3-timeline')).toContainText('เฟยไหลเฟิง + วัดหลิงอิ่น');
  await expect(page.locator('.v3-timeline')).toContainText('ประติมากรรมเฟยไหลเฟิง');
  await expect(page.locator('.v3-timeline')).toContainText('ชิงเหอฟาง — ย่านประวัติศาสตร์');
  await expect(page.locator('.v3-timeline')).toContainText('D3132');
  await expect(page.locator('.v3-timeline')).toContainText('19:13');

  await page.locator('.v3-day-chip').nth(4).click();
  await expect(page.locator('.v3-timeline')).toContainText('Shanghai Museum East');
  await expect(page.locator('.v3-timeline')).toContainText('Shanghai Tower 118F');
  await expect(page.locator('.v3-itinerary-card')).toHaveCount(8);
  await expect(page.locator('.v3-transfer-row')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('Plan v3 keeps Thai visible when UI switches to Chinese',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('#langBtn').click();
  await page.locator('[data-tab="plan"]').click();
  const transfer=page.locator('.v3-transfer-row').first();
  await expect(transfer).toContainText('抵达浦东机场 T2');
  await expect(transfer).toContainText('ถึงสนามบินผู่ตง T2');
  const first=page.locator('.v3-itinerary-card').first();
  await expect(first).toContainText('到酒店 / 寄存行李 / 休息');
  await expect(first).toContainText('ไทย · ถึงโรงแรม / ฝากกระเป๋า / พัก');
});

test('Explore retains old content and adds Qinghefang and Zhiweiguan with Chinese copy',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="explore"]').click();
  const search=page.locator('#placeSearch');
  await search.fill('知味观');
  const zhi=page.locator('.content-place-card').filter({hasText:'仁和路83号'}).first();
  await expect(zhi).toBeVisible();
  await expect(zhi).toContainText('知味观(湖滨店)');
  await expect(zhi.locator('[data-copy]')).toBeVisible();
  await search.fill('清河坊');
  const old=page.locator('.content-place-card').filter({hasText:'清河坊历史文化街区'}).first();
  await expect(old).toBeVisible();
  await expect(old).toContainText('Day 4');
});

test('Today shows revised People’s Square contextual choices on Day 1',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>localStorage.setItem('sh-sim-v3',JSON.stringify({active:true,day:0,time:'11:05'})));
  await prime(page);
  const context=page.locator('.context-suggestions');
  await expect(context).toBeVisible();
  await expect(context).toContainText('อิงจากจุดในแผน');
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

test('More readiness shows booked trains and revised Sep 16-17 dates',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="more"]').click();
  await page.locator('[data-more="readiness"]').click();
  const list=page.locator('.readiness-list');
  await expect(list).toBeVisible();
  await expect(list).toContainText('G7501');
  await expect(list).toContainText('D3132');
  await expect(list).toContainText('16 ก.ย.');
  await expect(list).toContainText('12:10–14:20');
  await expect(list).toContainText('17 ก.ย.');
  await expect(list).toContainText('Shanghai Museum East');
  await expect(list).toContainText('Shanghai Tower');
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
