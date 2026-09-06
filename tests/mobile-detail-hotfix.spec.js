import { test, expect } from '@playwright/test';

async function prime(page){
  await page.addInitScript(()=>localStorage.setItem('sh-onboarding-v1','done'));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
  await page.locator('[data-tab="plan"]').click();
  await expect(page.locator('.bund-photo-walk')).toBeVisible();
}

test('Bund expanded mini stops show Thai and Chinese with copy + AMap',async({page})=>{
  await prime(page);
  const bund=page.locator('.v3-itinerary-card').filter({hasText:'เดอะบันด์'}).first();
  await bund.locator('.v3-card-summary').click();
  const stops=bund.locator('.v3-mini-stop-item');
  await expect(stops).toHaveCount(6);
  await expect(stops.first()).toContainText('ถนนหยวนหมิงหยวน');
  await expect(stops.first()).toContainText('圆明园路');
  await expect(stops.first().locator('[data-copy]')).toBeVisible();
  const amap=stops.first().locator('.amap-mini-link');
  await expect(amap).toHaveAttribute('href',/uri\.amap\.com\/search/);
  await expect(amap).toHaveAttribute('href',/callnative=1/);
  await expect(amap).toHaveAttribute('href',/view=map/);
});

test('expanding a Plan card preserves the current scroll position',async({page})=>{
  await prime(page);
  const bund=page.locator('.v3-itinerary-card').filter({hasText:'เดอะบันด์'}).first();
  await bund.scrollIntoViewIfNeeded();
  await page.evaluate(()=>window.scrollBy(0,-120));
  const before=await page.evaluate(()=>window.scrollY);
  expect(before).toBeGreaterThan(200);
  await bund.locator('.v3-card-summary').click();
  await expect(bund.locator('.v3-card-detail')).toBeVisible();
  await page.waitForTimeout(80);
  const after=await page.evaluate(()=>window.scrollY);
  expect(Math.abs(after-before)).toBeLessThanOrEqual(4);
});

test('AMap links use map view and switch away from extra-tab navigation on tap',async({page})=>{
  await prime(page);
  const bund=page.locator('.v3-itinerary-card').filter({hasText:'เดอะบันด์'}).first();
  await bund.locator('.v3-card-summary').click();
  const amap=bund.locator('.v3-detail-actions a').first();
  await expect(amap).toHaveAttribute('href',/callnative=1/);
  await expect(amap).toHaveAttribute('href',/src=ShanghaiFamilyTrip/);
  await expect(amap).toHaveAttribute('href',/view=map/);
  const targetAfterCapture=await amap.evaluate(el=>{
    el.addEventListener('click',e=>e.preventDefault(),{once:true});
    el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    return el.getAttribute('target');
  });
  expect(targetAfterCapture).toBeNull();
});
