import { test, expect } from '@playwright/test';

async function prime(page){
  await page.addInitScript(()=>localStorage.setItem('sh-onboarding-v1','done'));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
}

test('Day 2 uses one Huaihai shopping card with all current stops',async({page})=>{
  await prime(page);
  await page.locator('[data-tab="plan"]').click();
  await page.locator('.v3-day-chip').nth(1).click();

  const timeline=page.locator('.v3-timeline');
  await expect(timeline).toContainText('Grand Goldfinch');
  await expect(timeline).toContainText('Food Court');
  await expect(page.locator('.v3-itinerary-card')).toHaveCount(7);
  await expect(page.locator('.v3-transfer-row')).toHaveCount(1);

  const huaihai=page.locator('.v3-itinerary-card').filter({hasText:'Middle Huaihai Road'});
  await expect(huaihai).toHaveCount(1);
  await huaihai.locator('[data-v3-toggle]').click();
  for(const text of ['LOOKNOW PARK','Songmont','EMIS','MINISO Pink','FARMER BOB'])await expect(huaihai).toContainText(text);

  const dinner=page.locator('.v3-itinerary-card').filter({hasText:'Food Court'}).first();
  await dinner.locator('[data-v3-toggle]').click();
  await expect(dinner).toContainText('BUTTERFUL & CREAMOROUS');
  await expect(dinner).toContainText('HARMAY');

  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('Day 2 Google map lists the expanded shopping sequence in order',async({page})=>{
  await prime(page);
  await page.locator('[data-tab="plan"]').click();
  await page.locator('.v3-day-chip').nth(1).click();
  const map=page.locator('.day-route-map');
  await expect(map.locator('.drm-stop')).toHaveCount(13);
  await expect(map.locator('[data-drm-segment]')).toHaveCount(3);
  await expect(map.locator('.drm-stop').nth(3)).toContainText('上金雀华人餐厅');
  await expect(map.locator('.drm-stop').nth(4)).toContainText('LOOKNOW PARK');
  await expect(map.locator('.drm-stop').nth(5)).toContainText('Songmont');
  await expect(map.locator('.drm-stop').nth(6)).toContainText('EMIS');
  await expect(map.locator('.drm-stop').nth(7)).toContainText('MINISO Pink');
  await expect(map.locator('.drm-stop').nth(8)).toContainText('FARMER BOB');
  await expect(map.locator('.drm-stop').nth(10)).toContainText('Foodie Social');
  await expect(map.locator('.drm-stop').nth(11)).toContainText('BUTTERFUL');
  await expect(map.locator('.drm-stop').nth(12)).toContainText('HARMAY');
});

test('Day 2 new places remain searchable with AMap actions',async({page})=>{
  await prime(page);
  await page.locator('[data-tab="explore"]').click();
  const search=page.locator('#placeSearch');
  await search.fill('EMIS');
  const emis=page.locator('.content-place-card').filter({hasText:'EMIS'}).first();
  await expect(emis).toBeVisible();
  await expect(emis).toContainText('淮海中路795-2号');
  await expect(emis.locator('[data-copy]')).toBeVisible();
  await expect(emis.locator('a[href^="https://uri.amap.com/"]')).toBeVisible();
});
