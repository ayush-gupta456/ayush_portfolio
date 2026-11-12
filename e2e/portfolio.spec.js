import { test, expect } from '@playwright/test';
import { profile } from '../src/data/profile.js';

async function mockApi(page, body) {
  await page.route('**/api/**', route => route.fulfill({
    status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Offline fixture' }),
  }));
  await page.route('**/api/public/profile', route => route.fulfill({
    contentType: 'application/json', body: JSON.stringify(body),
  }));
}

test('legacy API projects refresh and project links point to the current apps', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const legacy = structuredClone(profile);
  legacy.name = "API-loaded Ayush";
  legacy.projects = legacy.projects.filter(project => project.visual !== 'raaga');
  legacy.projects[0].description = 'Old code snippet reviewer';
  await mockApi(page, { profile: legacy });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'API-loaded Ayush, back to home' })).toBeVisible();
  await expect(page.locator('#projects h3')).toHaveText(['Raaga', 'InsightCode', 'PassOp']);
  await expect(page.getByRole('link', { name: 'Open Raaga live site (new tab)' })).toHaveAttribute('href', 'https://raaga-studio.vercel.app/');
  await expect(page.getByRole('link', { name: 'Open InsightCode live site (new tab)' })).toHaveAttribute('href', 'https://insightcode.vercel.app/');
  await expect(page.locator('#projects')).toContainText('isolated snapshot');
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1440]) {
  test(`layout stays within the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockApi(page, { profile, projectCatalogVersion: 1 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#projects').scrollIntoViewIfNeeded();
    await expect(page.locator('.project-card').first()).toHaveCSS('opacity', '1');
    const box = await page.locator('.project-card').first().boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    if (width === 390) {
      await page.getByRole('button', { name: 'Open menu' }).click();
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link').first()).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
      await page.getByRole('button', { name: 'Open menu' }).click();
      await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Work', exact: true }).click();
      await expect(page.locator('#projects')).toBeFocused();
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
    }
  });
}

test('reduced motion keeps project content visible and future admin removals authoritative', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const edited = structuredClone(profile);
  edited.projects = [{ ...edited.projects[1], description: 'A fresh admin-written description.' }];
  await mockApi(page, { profile: edited, projectCatalogVersion: 1 });
  await page.goto('/');
  await expect(page.locator('#projects h3')).toHaveText(['InsightCode']);
  await expect(page.locator('#projects')).toContainText('A fresh admin-written description.');
  await expect(page.locator('.project-card')).toHaveCSS('transform', 'none');
  await expect(page.locator('.project-card')).toHaveCSS('opacity', '1');
});

test('both themes, toolkit selection and project previews render', async ({ page }) => {
  await mockApi(page, { profile, projectCatalogVersion: 1 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await page.screenshot({ path: 'test-results/portfolio-hero-dark.png' });
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.locator('#projects').screenshot({ path: 'test-results/portfolio-projects-dark.png' });
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('.site-root')).toHaveClass(/light/);
  await expect(page.locator('.studio-window')).toBeVisible();
  await expect(page.locator('.review-window')).toBeVisible();
  await page.locator('.project-card').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/portfolio-projects-light.png', animations: 'disabled' });
  await page.getByRole('button', { name: /Frontend/ }).click();
  await expect(page.getByRole('region', { name: 'Frontend skills' })).toContainText('React');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/portfolio-mobile.png' });
});
