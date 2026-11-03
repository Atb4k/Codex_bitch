import { test, expect } from '@playwright/test';

test('renders the interactive scene and picks a part from the car', async ({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('.webgl-error')).toBeHidden();
  await expect(page.locator('.part-card')).toHaveCount(75);
  await page.locator('#assemble').click();
  await page.waitForTimeout(900);
  const canvas=page.locator('canvas');const bounds=await canvas.boundingBox();
  // The hood is in the lower-left quadrant of the projected car.
  await canvas.click({position:{x:bounds.width*.44,y:bounds.height*.54}});
  await expect(page.locator('.part-detail h3')).toBeVisible();
  expect(errors).toEqual([]);
});

test('search, inspect, isolate, hide, and reset parts',async({page})=>{
  await page.goto('/');
  await page.getByRole('searchbox').fill('engine block');
  await expect(page.locator('.part-card')).toHaveCount(1);
  await page.locator('.part-card').click();
  await expect(page.locator('.part-detail h3')).toHaveText('Engine block');
  await page.getByRole('button',{name:'Isolate part',exact:true}).click();
  await expect(page.locator('#visible-count')).toHaveText('1 / 75 parts visible');
  await page.getByRole('button',{name:'Show assembly',exact:true}).click();
  await expect(page.locator('#visible-count')).toHaveText('75 / 75 parts visible');
  await page.getByRole('button',{name:'Hide part',exact:true}).click();
  await expect(page.locator('#visible-count')).toHaveText('74 / 75 parts visible');
  await page.getByRole('button',{name:'Reset view',exact:true}).click();
  await expect(page.locator('#visible-count')).toHaveText('75 / 75 parts visible');
  await expect(page.locator('.part-card')).toHaveCount(75);
  await expect(page.locator('#explode-range')).toHaveValue('0');
});

test('filters to individual bolts and controls the explosion and X-ray',async({page})=>{
  await page.goto('/');
  await page.locator('[data-system="fasteners"]').click();
  await expect(page.locator('.part-card')).toHaveCount(20);
  await expect(page.locator('#visible-count')).toHaveText('20 / 75 parts visible');
  await page.locator('.part-card').first().click();
  await expect(page.locator('.part-detail h3')).toContainText('wheel bolt');
  await page.locator('#disassemble').click();
  await expect(page.locator('#explode-range')).toHaveValue('100');
  await page.locator('#explode-range').focus();await page.keyboard.press('Home');
  await expect(page.locator('#explode-range')).toHaveValue('0');
  await page.getByRole('button',{name:'Toggle X-ray'}).click();
  await expect(page.getByRole('button',{name:'Toggle X-ray'})).toHaveAttribute('aria-pressed','true');
  await page.locator('#play').click();await page.waitForTimeout(600);
  expect(Number(await page.locator('#explode-range').inputValue())).toBeGreaterThan(0);
  await page.locator('#play').click();
});

test('mobile layout stays within the screen and supports touch controls',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.locator('[data-system="brakes"]').click();
  await expect(page.locator('.part-card')).toHaveCount(12);
  await page.locator('.part-card').first().click();
  await expect(page.locator('.part-detail h3')).toContainText('wheel & tire');
  await page.getByRole('button',{name:'How it works'}).click();
  await expect(page.locator('dialog')).toBeVisible();
  await page.getByRole('button',{name:'Start exploring'}).click();
  await expect(page.locator('dialog')).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({path:'/tmp/torque-mobile.png',fullPage:true});
});
