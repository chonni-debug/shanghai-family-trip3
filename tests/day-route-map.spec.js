import { test, expect } from '@playwright/test';

async function prime(page){
  await page.addInitScript(()=>localStorage.setItem('sh-onboarding-v1','done'));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
  await page.locator('[data-tab="plan"]').click();
  await expect(page.locator('.day-route-map')).toBeVisible();
}

test('Day 1 shows Google map before itinerary with numbered ordered stops',async({page})=>{
  await prime(page);
  const map=page.locator('.day-route-map');
  await expect(map.locator('.drm-stop')).toHaveCount(4);
  await expect(map.locator('.drm-stop').nth(0)).toContainText('จัตุรัสประชาชน');
  await expect(map.locator('.drm-stop').nth(0)).toContainText('人民广场');
  await expect(map.locator('.drm-stop').nth(1)).toContainText('佳家汤包');
  await expect(map.locator('.drm-stop').nth(2)).toContainText('南京路步行街');
  await expect(map.locator('.drm-stop').nth(3)).toContainText('外滩');
  const iframeSrc=await map.locator('iframe').getAttribute('src');
  expect(iframeSrc).toContain('google.com/maps');
  expect(iframeSrc).toContain('saddr=');
  const routeHref=await map.locator('.drm-actions a').getAttribute('href');
  expect(routeHref).toContain('google.com/maps/dir/?api=1');
  expect(routeHref).toContain('origin=');
  expect(routeHref).toContain('destination=');
  const order=await page.evaluate(()=>{
    const m=document.querySelector('.day-route-map'),o=document.querySelector('.v3-overview-label');
    return m&&o?Boolean(m.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_FOLLOWING):false;
  });
  expect(order).toBeTruthy();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('Hangzhou route is split into mobile-safe ordered Google Maps segments',async({page})=>{
  await prime(page);
  await page.locator('.v3-day-chip').nth(2).click();
  const map=page.locator('.day-route-map');
  await expect(map.locator('.drm-stop')).toHaveCount(10);
  await expect(map.locator('[data-drm-segment]')).toHaveCount(3);
  await expect(map).toContainText('灵隐寺 / 飞来峰');
  await expect(map).toContainText('龙井村');
  await expect(map).toContainText('河坊街（可选）');
  await map.locator('[data-drm-segment]').nth(1).click();
  const href=await page.locator('.day-route-map .drm-actions a').getAttribute('href');
  expect(href).toContain('waypoints=');
  expect(decodeURIComponent(href)).toContain('龙井村');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('Daily Google route map keeps Thai and Chinese names after UI language switch',async({page})=>{
  await prime(page);
  await page.locator('#langBtn').click();
  const first=page.locator('.day-route-map .drm-stop').first();
  await expect(first).toContainText('人民广场');
  await expect(first).toContainText('จัตุรัสประชาชน');
  await expect(page.locator('.day-route-map')).toContainText('今日路线');
});
