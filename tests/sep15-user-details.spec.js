import { test, expect } from '@playwright/test';

async function prime(page){
  await page.addInitScript(()=>localStorage.setItem('sh-onboarding-v1','done'));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
}

test('Day 3 uses exact Lai Lai, compact North Bund transfer and verified Fei Da Chu floor',async({page})=>{
  await prime(page);
  await page.locator('[data-tab="plan"]').click();
  await page.locator('.v3-day-chip').nth(2).click();

  const timeline=page.locator('.v3-timeline');
  await expect(timeline).toContainText('Lai Lai Xiao Long (Fengshengli)');
  await expect(timeline).toContainText('莱莱小笼(丰盛里店)');
  await expect(timeline).toContainText('Fei Da Chu');
  await expect(page.locator('.v3-transfer-row').filter({hasText:'North Bund'})).toHaveCount(1);
  await expect(page.locator('.v3-itinerary-card').filter({hasText:'North Bund — skyline'})).toHaveCount(1);

  const west=page.locator('.v3-itinerary-card').filter({hasText:'Nanjing West'}).first();
  await west.locator('[data-v3-toggle]').click();
  await expect(west).toContainText('AMAM Lonbakery Town');
  const westContext=west.locator('.context-suggestions');
  if(await westContext.count())await expect(westContext).not.toContainText('AMAM Lonbakery Town');

  const north=page.locator('.v3-itinerary-card').filter({hasText:'16:00'}).filter({hasText:'North Bund'}).first();
  await north.locator('[data-v3-toggle]').click();
  await expect(north).toContainText('Sinar Mas Plaza');
  await expect(north).toContainText('Starbucks');
  await expect(north).toContainText('MANNER COFFEE(国客滨江店)');
  const mini= north.locator('.v3-mini-stop-list');
  await expect(mini.locator('.v3-mini-stop-item')).toHaveCount(3);
  await expect(mini).not.toContainText('North Bund Greenland');

  const dinner=page.locator('.v3-itinerary-card').filter({hasText:'Fei Da Chu'}).first();
  await dinner.locator('[data-v3-toggle]').click();
  await expect(dinner).toContainText('B2');
  await expect(dinner).not.toContainText('ชั้น 2');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('Sep 15 exact additions remain searchable with Chinese copy and AMap',async({page})=>{
  await prime(page);
  await page.locator('[data-tab="explore"]').click();
  const search=page.locator('#placeSearch');
  await search.fill('国客滨江');
  const manner=page.locator('.content-place-card').filter({hasText:'MANNER COFFEE(国客滨江店)'}).first();
  await expect(manner).toBeVisible();
  await expect(manner).toContainText('07:30–22:00');
  await expect(manner).toContainText('太平路');
  await expect(manner.locator('[data-copy]')).toBeVisible();
  await expect(manner.locator('a[href^="https://uri.amap.com/"]')).toBeVisible();
  await search.fill('丰盛里');
  const lai=page.locator('.content-place-card').filter({hasText:'莱莱小笼(丰盛里店)'}).first();
  await expect(lai).toContainText('茂名北路277号');
});
