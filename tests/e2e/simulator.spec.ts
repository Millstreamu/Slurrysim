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

test('edits custom geometry with pointer and keyboard controls', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Edit selected geometry' }).click();
  await expect(
    page.getByRole('heading', { name: 'Custom shape editor' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Add point' }).click();
  await page.getByLabel('X coordinate').fill('0.55');
  await page.getByLabel('X coordinate').press('Enter');
  await page.getByLabel('Y coordinate').fill('0.85');
  await page.getByLabel('Y coordinate').press('Enter');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('button', { name: 'Redo' })).toBeEnabled();
  await page.getByRole('button', { name: 'Redo' }).click();
  await page.locator('#simulation').click({ position: { x: 300, y: 300 } });
  await page.getByRole('button', { name: 'Reset to preset' }).click();
  await page.getByRole('button', { name: 'Use geometry & simulate' }).click();
  await expect(
    page.getByRole('heading', { name: 'Custom shape editor' }),
  ).toBeHidden();
});
