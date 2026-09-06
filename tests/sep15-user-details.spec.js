import { test, expect } from '@playwright/test';

async function prime(page){
  await page.addInitScript(()=>localStorage.setItem('sh-onboarding-v1','done'));
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
}

test('Day 3 includes Lai Lai, AMAM, North Bund route and Fei Da Chu',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="plan"]').click();
  await page.locator('.v3-day-chip').nth(2).click();

  const timeline=page.locator('.v3-timeline');
  await expect(timeline).toContainText('Lai Lai Xiao Long');
  await expect(timeline).toContainText('Fei Da Chu');

  const west=page.locator('.v3-itinerary-card').filter({hasText:'Nanjing West'}).first();
  await west.locator('[data-v3-toggle]').click();
  await expect(west).toContainText('AMAM Lonbakery Town');

  const north=page.locator('.v3-itinerary-card').filter({hasText:'North Bund'}).first();
  await north.locator('[data-v3-toggle]').click();
  await expect(north).toContainText('Sinar Mas Plaza');
  await expect(north).toContainText('Starbucks');
  await expect(north).toContainText('Manner Coffee');
  await expect(north).toContainText('07:30');

  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('Sep 15 additions remain searchable with Chinese copy and AMap',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="explore"]').click();
  const search=page.locator('#placeSearch');
  await search.fill('MANNER COFFEE');
  const manner=page.locator('.content-place-card').filter({hasText:'MANNER COFFEE'}).first();
  await expect(manner).toBeVisible();
  await expect(manner).toContainText('07:30–22:00');
  await expect(manner.locator('[data-copy]')).toBeVisible();
  await expect(manner.locator('a[href^="https://uri.amap.com/"]')).toBeVisible();
});
