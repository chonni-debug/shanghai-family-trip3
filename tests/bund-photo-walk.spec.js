import { test, expect } from '@playwright/test';

async function prime(page){
  await page.addInitScript(()=>localStorage.setItem('sh-onboarding-v1','done'));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
  await page.locator('[data-tab="plan"]').click();
}

test('Day 1 exposes a bilingual seven-stop Bund photo walk with Chinese copy actions',async({page})=>{
  await prime(page);
  const walk=page.locator('.bund-photo-walk');
  await expect(walk).toBeVisible({timeout:10000});
  await expect(walk.locator('summary')).toContainText('Bund Photo Walk');
  await walk.locator('summary').click();
  const rows=walk.locator('.v3-walk-sequence > div');
  await expect(rows).toHaveCount(7);
  await expect(rows.nth(0)).toContainText('ถนนหยวนหมิงหยวน');
  await expect(rows.nth(0)).toContainText('圆明园路');
  await expect(rows.nth(1)).toContainText('苏州河');
  await expect(rows.nth(2)).toContainText('外白渡桥');
  await expect(rows.nth(3)).toContainText('黄浦公园');
  await expect(rows.nth(4)).toContainText('外滩');
  await expect(rows.nth(5)).toContainText('东方明珠广播电视塔');
  await expect(rows.nth(6)).toContainText('外滩历史建筑群');
  await expect(walk.locator('[data-copy]')).toHaveCount(7);
  const firstCopy=decodeURIComponent(await walk.locator('[data-copy]').first().getAttribute('data-copy'));
  expect(firstCopy).toBe('圆明园路 上海');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('The Bund itinerary card includes the supplied photo stops and Chinese mode keeps Thai labels',async({page})=>{
  await prime(page);
  const bundCard=page.locator('.v3-itinerary-card').filter({hasText:'เดอะบันด์'}).first();
  await expect(bundCard).toBeVisible();
  await bundCard.locator('.v3-card-summary').click();
  await expect(bundCard).toContainText('外白渡桥');
  await expect(bundCard).toContainText('黄浦公园');
  await expect(bundCard).toContainText('东方明珠广播电视塔');
  await page.locator('#langBtn').click();
  const walk=page.locator('.bund-photo-walk');
  await expect(walk).toBeVisible();
  await walk.locator('summary').click();
  const first=walk.locator('.v3-walk-sequence > div').first();
  await expect(first).toContainText('圆明园路');
  await expect(first).toContainText('ถนนหยวนหมิงหยวน');
});
