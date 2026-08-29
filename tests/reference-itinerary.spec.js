import { test, expect } from '@playwright/test';

async function prime(page){
  await page.addInitScript(()=>localStorage.setItem('sh-onboarding-v1','done'));
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
}

test('Explore exposes verified screenshot-derived Huaihai food data with Chinese copy',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prime(page);
  await page.locator('[data-tab="explore"]').click();
  const search=page.locator('#placeSearch');
  await search.fill('鲍师傅糕点');
  const card=page.locator('.content-place-card').filter({hasText:'鲍师傅糕点(淮海中路店)'}).first();
  await expect(card).toBeVisible();
  await expect(card).toContainText('淮海中路576号');
  await expect(card.locator('[data-copy]')).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('Day 5 Postal Museum context uses reference itinerary ideas without changing the core timeline',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>localStorage.setItem('sh-sim-v3',JSON.stringify({active:true,day:4,time:'09:05'})));
  await prime(page);
  const context=page.locator('.context-suggestions');
  await expect(context).toBeVisible();
  await expect(context.locator('.context-mini-card')).toHaveCount(3);
  await expect(context).toContainText('Luneurs Rock Bund');
  await expect(context).toContainText('REi·FLOWER COFFEE BAR');
  await expect(context).toContainText('นอร์ทบันด์ริเวอร์ฟรอนต์');
  await page.locator('[data-tab="plan"]').click();
  await page.locator('.v3-day-chip').nth(4).click();
  await expect(page.locator('.v3-itinerary-card')).toHaveCount(8);
});
