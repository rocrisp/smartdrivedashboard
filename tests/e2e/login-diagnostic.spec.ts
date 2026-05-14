import { test, expect } from '@playwright/test';

/**
 * DIAGNOSTIC TEST FOR LOGIN ISSUES
 * This test helps identify where the authentication flow is breaking
 */

test.describe('Login Diagnostic', () => {
  test('STEP 1: Check if app starts and landing page loads', async ({ page }) => {
    console.log('🔍 Testing: Landing page load...');

    await page.goto('/', { waitUntil: 'networkidle' });

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/01-landing-page.png', fullPage: true });

    // Check title
    const title = await page.title();
    console.log('✅ Page title:', title);
    expect(title).toContain('My Google Dashboard');

    // Check sign in button
    const signInButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(signInButton).toBeVisible();
    console.log('✅ Sign in button is visible');
  });

  test('STEP 2: Check NextAuth configuration', async ({ request }) => {
    console.log('🔍 Testing: NextAuth endpoints...');

    // Check providers endpoint
    const providersResp = await request.get('/api/auth/providers');
    const providers = await providersResp.json();
    console.log('✅ Providers:', JSON.stringify(providers, null, 2));

    expect(providers.google).toBeDefined();
    expect(providers.google.id).toBe('google');
    expect(providers.google.callbackUrl).toContain('http://localhost:3001/api/auth/callback/google');

    // Check session endpoint
    const sessionResp = await request.get('/api/auth/session');
    const session = await sessionResp.json();
    console.log('✅ Initial session:', JSON.stringify(session, null, 2));
  });

  test('STEP 3: Check OAuth redirect URL', async ({ page }) => {
    console.log('🔍 Testing: OAuth redirect configuration...');

    await page.goto('/');

    let oauthUrl = '';

    // Intercept Google OAuth request
    await page.route('https://accounts.google.com/**', route => {
      oauthUrl = route.request().url();
      console.log('✅ OAuth URL:', oauthUrl);

      // Check critical parameters
      const url = new URL(oauthUrl);
      console.log('  - client_id:', url.searchParams.get('client_id'));
      console.log('  - redirect_uri:', url.searchParams.get('redirect_uri'));
      console.log('  - scope:', url.searchParams.get('scope'));

      expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3001/api/auth/callback/google');

      route.abort(); // Don't actually go to Google
    });

    const signInButton = page.getByRole('button', { name: /sign in with google/i });
    await signInButton.click();

    await page.waitForTimeout(1000); // Wait for intercept

    expect(oauthUrl).toContain('accounts.google.com');
  });

  test('STEP 4: Simulate successful OAuth callback', async ({ page, context }) => {
    console.log('🔍 Testing: OAuth callback handling...');

    // Create a mock callback URL (this simulates what Google would redirect to)
    const mockCallbackUrl = '/api/auth/callback/google?state=test&code=mock_auth_code';

    // Try to access callback endpoint
    const response = await page.goto(mockCallbackUrl);

    console.log('✅ Callback response status:', response?.status());

    await page.screenshot({ path: 'tests/screenshots/04-callback-response.png', fullPage: true });

    // Check where we ended up
    console.log('✅ Final URL after callback:', page.url());

    // Should either show error or redirect to sign in
    const currentUrl = page.url();
    const hasError = currentUrl.includes('error') || await page.getByText(/error/i).count() > 0;

    if (hasError) {
      console.log('⚠️  Error detected in callback');
      const errorMessage = await page.locator('body').textContent();
      console.log('Error details:', errorMessage);
    }
  });

  test('STEP 5: Check middleware protection', async ({ page }) => {
    console.log('🔍 Testing: Middleware protection...');

    // Try to access dashboard without auth
    await page.goto('/dashboard');

    await page.screenshot({ path: 'tests/screenshots/05-dashboard-redirect.png', fullPage: true });

    // Should be redirected to sign in
    const url = page.url();
    console.log('✅ Redirected to:', url);

    expect(url).toContain('callbackUrl');
    expect(url).not.toContain('/dashboard');
  });

  test('STEP 6: Check database connection', async ({ request }) => {
    console.log('🔍 Testing: Database connectivity...');

    // Try to access an API endpoint that uses the database
    const statsResp = await request.get('/api/stats');

    console.log('✅ Stats endpoint status:', statsResp.status());

    if (statsResp.status() === 401) {
      console.log('✅ Correctly requires authentication');
    } else if (statsResp.ok()) {
      const stats = await statsResp.json();
      console.log('✅ Stats response:', JSON.stringify(stats, null, 2));
    } else {
      console.log('❌ Unexpected status:', statsResp.status());
    }
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    console.log(`❌ Test "${testInfo.title}" failed`);
    await page.screenshot({
      path: `tests/screenshots/FAILED-${testInfo.title.replace(/\s+/g, '-')}.png`,
      fullPage: true
    });
  }
});
