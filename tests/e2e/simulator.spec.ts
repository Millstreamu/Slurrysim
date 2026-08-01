import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
  await expect(page.getByRole('spinbutton')).toHaveCount(12);
  await expect(page.getByRole('radio')).toHaveCount(6);
  await expect(
    page.getByRole('img', { name: /animated conceptual rock box/i }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('validates physical properties and distinguishes applicability warnings', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('Draft inputs · SI stored')).toBeVisible();
  await expect(page.locator('#kinematic-viscosity')).toHaveText(
    /1\.0038e-6 m²\/s/i,
  );

  const density = page.getByLabel('Liquid density');
  await density.fill('0');
  await density.press('Tab');
  await expect(density).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#fluidDensity-diagnostic')).toContainText(
    'greater than zero',
  );

  await density.fill('100');
  await density.press('Tab');
  await expect(density).not.toHaveAttribute('aria-invalid');
  await expect(page.locator('#fluidDensity-diagnostic')).toContainText(
    'draft liquid scope',
  );
  await expect(page.locator('#fluidDensity-diagnostic')).toHaveAttribute(
    'data-status',
    'outside-applicability',
  );

  await density.fill('998.2');
  await density.press('Tab');
  await expect(page.locator('#kinematic-viscosity')).toHaveText(
    /1\.0038e-6 m²\/s/i,
  );
});

test('supports shortcuts, focus restoration, and precise numeric input', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('?');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(
    page.getByRole('button', { name: 'Keyboard help' }),
  ).toBeFocused();

  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  const numeric = page.getByRole('spinbutton', { name: 'Flow rate value' });
  await numeric.fill('72');
  await numeric.press('Enter');
  await expect(
    page.getByRole('slider', { name: 'Flow rate slider' }),
  ).toHaveValue('72');
  await numeric.fill('999');
  await numeric.press('Enter');
  await expect(page.locator('#flowRate-error')).toContainText('0 to 100');
  await expect(numeric).toHaveAttribute('aria-invalid', 'true');
});

for (const viewport of [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 1000 },
]) {
  test(`is usable without horizontal overflow at ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    await expect(
      page.getByRole('heading', { name: 'Illustrative results' }),
    ).toBeVisible();
  });
}

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
