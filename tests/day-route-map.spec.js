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
  const routeHref=await map.locator('.drm-actions a').getAttribute('href');
  expect(routeHref).toContain('google.com/maps/dir/?api=1');
  const order=await page.evaluate(()=>{
    const m=document.querySelector('.day-route-map'),o=document.querySelector('.v3-overview-label');
    return m&&o?Boolean(m.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_FOLLOWING):false;
  });
  expect(order).toBeTruthy();
});

test('Sep 16 Hangzhou Google route uses the requested seven-stop sequence',async({page})=>{
  await prime(page);
  await page.locator('.v3-day-chip').nth(3).click();
  const map=page.locator('.day-route-map');
  await expect(map.locator('.drm-stop')).toHaveCount(7);
  await expect(map.locator('[data-drm-segment]')).toHaveCount(2);
  await expect(map.locator('.drm-stop').nth(0)).toContainText('杭州东站');
  await expect(map.locator('.drm-stop').nth(1)).toContainText('西湖');
  await expect(map.locator('.drm-stop').nth(2)).toContainText('知味观');
  await expect(map.locator('.drm-stop').nth(3)).toContainText('飞来峰灵隐寺');
  await expect(map.locator('.drm-stop').nth(4)).toContainText('飞来峰造像');
  await expect(map.locator('.drm-stop').nth(5)).toContainText('清河坊历史文化特色街区');
  await expect(map.locator('.drm-stop').nth(6)).toContainText('杭州东站');
  await map.locator('[data-drm-segment]').nth(1).click();
  const href=await page.locator('.day-route-map .drm-actions a').getAttribute('href');
  expect(decodeURIComponent(href)).toContain('飞来峰造像');
  expect(decodeURIComponent(href)).toContain('清河坊历史文化特色街区');
  expect(decodeURIComponent(href)).toContain('杭州东站');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('Sep 15 and Sep 17 maps rotate with their itinerary days',async({page})=>{
  await prime(page);
  await page.locator('.v3-day-chip').nth(2).click();
  await expect(page.locator('.day-route-map')).toContainText('静安寺');
  await expect(page.locator('.day-route-map')).toContainText('北外滩滨江绿地');
  await page.locator('.v3-day-chip').nth(4).click();
  await expect(page.locator('.day-route-map')).toContainText('豫园');
  await expect(page.locator('.day-route-map')).toContainText('上海博物馆东馆');
  await expect(page.locator('.day-route-map')).toContainText('上海中心大厦');
});

test('Daily Google route map keeps Thai and Chinese names after UI language switch',async({page})=>{
  await prime(page);
  await page.locator('#langBtn').click();
  const first=page.locator('.day-route-map .drm-stop').first();
  await expect(first).toContainText('人民广场');
  await expect(first).toContainText('จัตุรัสประชาชน');
  await expect(page.locator('.day-route-map')).toContainText('今日路线');
});
