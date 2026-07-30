import { expect, test } from '@playwright/test';

test('loads and operates the simulator', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Rock Box Simulator' }),
  ).toBeVisible();
  await expect(page.getByText('Concept model', { exact: true })).toBeVisible();
  await expect(page.locator('#metric-active')).not.toHaveText('0');

  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('button', { name: 'Resume' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText('Paused', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Release batch' }).click();
  await page.getByLabel(/Deep symmetric/).check();
  await expect(page.getByLabel(/Deep symmetric/)).toBeChecked();
  await expect(page.locator('#metric-active')).toHaveText('34');
});

test('has no obvious accessibility violations in control semantics', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('slider')).toHaveCount(5);
  await expect(page.getByRole('radio')).toHaveCount(6);
  await expect(
    page.getByRole('img', { name: /animated conceptual rock box/i }),
  ).toBeVisible();
});
