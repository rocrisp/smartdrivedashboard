import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('landing page should load', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/My Google Dashboard/);

    // Check that sign in button exists
    const signInButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(signInButton).toBeVisible();
  });

  test('sign in button should initiate OAuth flow', async ({ page, context }) => {
    await page.goto('/');

    // Click sign in button
    const signInButton = page.getByRole('button', { name: /sign in with google/i });

    // Listen for popup or redirect
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/auth/signin/google')),
      signInButton.click()
    ]);

    // Check that OAuth flow was initiated
    expect(response.status()).toBe(200);
  });

  test('API auth endpoints should be accessible', async ({ request }) => {
    // Test health endpoint
    const health = await request.get('/api/health');
    expect(health.ok()).toBeTruthy();

    // Test auth providers endpoint
    const providers = await request.get('/api/auth/providers');
    expect(providers.ok()).toBeTruthy();

    const providersData = await providers.json();
    expect(providersData.google).toBeDefined();
    expect(providersData.google.name).toBe('Google');
  });

  test('protected routes should redirect to sign in', async ({ page }) => {
    await page.goto('/dashboard');

    // Should be redirected to home page
    await page.waitForURL(/\//);
    expect(page.url()).toContain('callbackUrl');
  });

  test('session endpoint should return null when not authenticated', async ({ request }) => {
    const session = await request.get('/api/auth/session');
    expect(session.ok()).toBeTruthy();

    const sessionData = await session.json();
    expect(sessionData).toEqual({});
  });
});

test.describe('OAuth Callback', () => {
  test('callback URL should be configured correctly', async ({ page }) => {
    await page.goto('/');

    const signInButton = page.getByRole('button', { name: /sign in with google/i });

    // Intercept the OAuth redirect
    await page.route('https://accounts.google.com/**', route => {
      const url = route.request().url();
      console.log('OAuth URL:', url);

      // Check redirect_uri parameter
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fauth%2Fcallback%2Fgoogle');

      // Don't actually go to Google, just abort
      route.abort();
    });

    await signInButton.click();
  });
});

test.describe('Environment Configuration', () => {
  test('required environment variables should be set', async ({ request }) => {
    // Test that the app can start (which means env vars are valid)
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
  });
});
