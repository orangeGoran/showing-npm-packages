import { expect, test, type Page } from '@playwright/test';
import type { ApiTypes } from '../src/types/api.types';

// HELPERS
const getCard = (page: Page, id: string) => page.getByTestId(`item-${id}`);

// MOCKUPS
const packagesResponse: ApiTypes['getPackages'] = [
  {
    id: '@fastify/cookie',
    weeklyDownloads: 131111,
    dependencyCount: 2,
  },
  {
    id: 'fastify',
    weeklyDownloads: 964454,
    dependencyCount: 2,
  },
  {
    id: 'semver',
    weeklyDownloads: 212245384,
    dependencyCount: 1,
  },
  {
    id: '@fastify/error',
    weeklyDownloads: 880000,
    dependencyCount: 0,
  },
  {
    id: '@angular/cdk',
    weeklyDownloads: 1251566,
    dependencyCount: 1,
  },
  {
    id: 'colors',
    weeklyDownloads: 15605716,
    dependencyCount: 0,
  },
];

const dependenciesResponse: ApiTypes['getPackageDependencies'] = ['@fastify/error', 'semver'];

// TESTS
test.beforeEach(async ({ page }) => {
  await page.route('*/**/packages', (route) => route.fulfill({ json: packagesResponse }));

  // e.g. /packages/fastify/dependencies
  await page.route('*/**/dependencies', (route) => route.fulfill({ json: dependenciesResponse }));

  await page.goto('/');

  // expect that all packages are showing up
  for (const pkg of packagesResponse) {
    await expect(getCard(page, pkg.id)).toBeVisible();
  }
});

test('search must filter entries correctly', async ({ page }) => {
  // search input
  const id = 'fastify';

  await page.getByPlaceholder('Search').fill(id);

  for (const pkg of packagesResponse) {
    if (pkg.id === 'fastify' || pkg.id.toLowerCase().trim().includes(id)) {
      await expect(getCard(page, pkg.id)).toBeVisible();
    } else {
      await expect(getCard(page, pkg.id)).toBeHidden();
    }
  }
});

test('hovering a card highlights it and its dependencies', async ({ page }) => {
  const hoverId = 'fastify';

  await expect(getCard(page, hoverId)).toBeVisible();

  // Nothing is highlighted until the pointer touches a card.
  await expect(page.locator('.active')).toHaveCount(0);
  await expect(page.locator('.active-dependency')).toHaveCount(0);

  await getCard(page, hoverId).hover();

  // The hovered card gets the red header.
  await expect(getCard(page, hoverId).locator('.active')).toBeVisible();

  // Every dependency gets the blue one.
  for (const dependencyId of dependenciesResponse) {
    await expect(getCard(page, dependencyId).locator('.active-dependency')).toBeVisible();
  }

  // Nothing else on the page is highlighted.
  await expect(page.locator('.active')).toHaveCount(1);
  await expect(page.locator('.active-dependency')).toHaveCount(dependenciesResponse.length);

  // Moving the pointer off the grid clears every highlight again.
  await page.mouse.move(0, 0);

  await expect(page.locator('.active')).toHaveCount(0);
  await expect(page.locator('.active-dependency')).toHaveCount(0);
});
