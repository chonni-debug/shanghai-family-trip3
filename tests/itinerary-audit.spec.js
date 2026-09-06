import { test, expect } from '@playwright/test';

async function prime(page){
  await page.addInitScript(()=>localStorage.setItem('sh-onboarding-v1','done'));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('#app')).toBeVisible();
  await page.locator('[data-tab="plan"]').click();
}

test('transport legs are compact rows and do not consume numbered activity slots',async({page})=>{
  await prime(page);
  const transfer=page.locator('.v3-transfer-row').first();
  await expect(transfer).toBeVisible();
  await expect(transfer.locator('.v3-seq')).toHaveCount(0);
  await expect(transfer).toContainText('การเดินทาง');
  const seq=await page.locator('.v3-itinerary-card .v3-seq').allTextContents();
  expect(seq).toEqual(seq.map((_,i)=>String(i+1)));
});

test('Day 2 Wukang and Anfu cards do not repeat the same zone recommendations',async({page})=>{
  await prime(page);
  await page.locator('.v3-day-chip').nth(1).click();
  for(const name of ['อาคารอู่คัง','ถนนอู่คัง','ถนนอันฝู']){
    const card=page.locator('.v3-itinerary-card').filter({hasText:name}).first();
    await expect(card).toBeVisible();
    await card.locator('[data-v3-toggle]').click();
    await expect(card.locator('.context-suggestions')).toHaveCount(0);
    await expect(card).not.toContainText('SunFlour สาขา Anfu Road');
    await expect(card).not.toContainText('O’Mills Yongjia Road');
  }
});

test('Sep 17 shows one Yu Garden activity plus its compact inbound transfer',async({page})=>{
  await prime(page);
  await page.locator('.v3-day-chip').nth(4).click();
  await expect(page.locator('.v3-transfer-row').filter({hasText:'Yu Garden'})).toHaveCount(1);
  const yu=page.locator('.v3-itinerary-card').filter({hasText:'สวนอวี้หยวน'});
  await expect(yu).toHaveCount(1);
  await expect(page.locator('.v3-itinerary-card').filter({hasText:'Shanghai Museum East'})).toHaveCount(1);
  await expect(page.locator('.v3-itinerary-card').filter({hasText:'Shanghai Tower 118F'})).toHaveCount(1);
});

test('Sep 18 shows one 1000 Trees activity plus compact transfer and no duplicated destination card',async({page})=>{
  await prime(page);
  await page.locator('.v3-day-chip').nth(5).click();
  await expect(page.locator('.v3-transfer-row').filter({hasText:'1000 Trees'})).toHaveCount(1);
  await expect(page.locator('.v3-itinerary-card').filter({hasText:'1000 Trees'})).toHaveCount(1);
  await expect(page.locator('.v3-itinerary-card').filter({hasText:'Suzhou Creek'})).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
});

test('Day 5 contextual cards do not repeat destinations already in the core card',async({page})=>{
  await prime(page);
  await page.locator('.v3-day-chip').nth(4).click();
  const bazaar=page.locator('.v3-itinerary-card').filter({hasText:'Nine-Turn Bridge'}).first();
  await bazaar.locator('[data-v3-toggle]').click();
  const context=bazaar.locator('.context-suggestions');
  if(await context.count()){
    const suggestions=context.locator('.context-mini-card');
    await expect(suggestions).toContainText('豫园老街');
    await expect(suggestions).not.toContainText('上海城隍庙');
  }
  const tower=page.locator('.v3-itinerary-card').filter({hasText:'Shanghai Tower 118F'}).first();
  await tower.locator('[data-v3-toggle]').click();
  const towerContext=tower.locator('.context-suggestions');
  if(await towerContext.count())await expect(towerContext.locator('.context-mini-card')).not.toContainText('牛New寿喜烧');
});
