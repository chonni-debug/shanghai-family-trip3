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

test('plan exposes six days and skip can be toggled',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="plan"]').click();
  await expect(page.locator('.day-chip')).toHaveCount(6);
  const firstCard=page.locator('.event-card').first();
  await firstCard.locator('[data-event-more]').click();
  await expect(page.locator('[data-skip-event]')).toBeVisible();
  await page.locator('[data-skip-event]').click();
  await expect(page.locator('.event-card.skipped').first()).toBeVisible();
  await page.locator('.event-card.skipped [data-skip-event]').first().click();
  await expect(page.locator('.event-card.skipped')).toHaveCount(0);
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
