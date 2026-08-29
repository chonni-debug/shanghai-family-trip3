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

test('Plan v3 shows six days, bilingual compact cards, detail actions and skip state',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="plan"]').click();
  await expect(page.locator('.v3-day-chip')).toHaveCount(6);
  await expect(page.locator('.v3-itinerary-card')).toHaveCount(10);
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
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('Plan v3 preserves the 11-stop detailed Day 1 City Walk',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="plan"]').click();
  const walk=page.locator('.v3-walk-detail');
  await expect(walk).toBeVisible();
  await expect(walk.locator('.v3-walk-sequence > div')).toHaveCount(11);
  await walk.locator('summary').click();
  await expect(walk).toContainText('LOOKNOW&FLOW');
  await expect(walk).toContainText('TEENIE WEENIE');
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

test('Explore restores extended places and food roles',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="explore"]').click();
  await expect(page.getByText('พิพิธภัณฑ์เซี่ยงไฮ้',{exact:true})).toBeVisible();
  await expect(page.getByText('ซือหนานแมนชั่นส์',{exact:true})).toBeVisible();
  await page.locator('[data-filter="food"]').click();
  await expect(page.locator('[data-food-role]')).toHaveCount(4);
  await expect(page.getByText('ไลไลเสี่ยวหลง',{exact:true})).toBeVisible();
  await page.locator('[data-food-role="must_try"]').click();
  await expect(page.getByText('ซูไช่จี้เซิงเจียน',{exact:true})).toBeVisible();
  await expect(page.getByText('หู่ซีเหล่า弄堂เมี่ยนก่วน',{exact:true})).toHaveCount(0);
  await page.locator('[data-food-role="backup"]').click();
  await expect(page.getByText('เว่ยเซียงไจ',{exact:true})).toBeVisible();
});

test('Today shows plan-context suggestions for People’s Square',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>localStorage.setItem('sh-sim-v3',JSON.stringify({active:true,day:2,time:'13:20'})));
  await prime(page);
  const context=page.locator('.context-suggestions');
  await expect(context).toBeVisible();
  await expect(context).toContainText('อิงจากจุดในแผน');
  await expect(context.locator('.context-mini-card')).toHaveCount(3);
  await expect(context).toContainText('ไลไลเสี่ยวหลง');
  await expect(context).toContainText('ซูไช่จี้เซิงเจียน');
  await expect(context).toContainText('พิพิธภัณฑ์เซี่ยงไฮ้');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await context.locator('[data-context-detail]').first().click();
  await expect(page.locator('#modal')).toBeVisible();
  await expect(page.locator('#modalBody')).toContainText('天津路506号');
});

test('rest family mode does not encourage extra contextual stops',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>{
    localStorage.setItem('sh-sim-v3',JSON.stringify({active:true,day:2,time:'13:20'}));
    localStorage.setItem('sh-family-status','rest');
  });
  await prime(page);
  await expect(page.locator('.context-suggestions')).toHaveCount(0);
});

test('offline reload keeps the root app usable after cache warmup',async({page,context})=>{
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
