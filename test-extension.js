const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, () => { rl.close(); resolve(); });
  });
}

(async () => {
  const extensionPath = path.resolve(__dirname);
  const userDataDir = path.join(__dirname, '.test-profile');
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

  // Clean up old test profile
  if (fs.existsSync(userDataDir)) {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }

  console.log('Launching Chrome with TweetDeckX extension...');

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-first-run',
      '--disable-default-apps',
    ],
    viewport: { width: 1400, height: 900 },
  });

  // Get the extension ID from the service worker
  let extensionId;
  const serviceWorkers = context.serviceWorkers();
  if (serviceWorkers.length > 0) {
    extensionId = serviceWorkers[0].url().split('/')[2];
  } else {
    const sw = await context.waitForEvent('serviceworker');
    extensionId = sw.url().split('/')[2];
  }
  console.log('Extension ID:', extensionId);

  // --- Step 1: Manual login ---
  const loginPage = context.pages()[0] || await context.newPage();
  await loginPage.goto('https://x.com/i/flow/login', { waitUntil: 'domcontentloaded' });

  console.log('\n============================================');
  console.log('  Please log in to X.com in the browser.');
  console.log('  Press ENTER here when done.');
  console.log('============================================\n');
  await waitForEnter('> ');

  console.log('Login URL:', loginPage.url());
  await loginPage.screenshot({ path: path.join(screenshotDir, '01-logged-in.png') });

  // --- Step 2: Open the deck and test ---
  console.log('\n=== TESTING TWEETDECKX EXTENSION ===');
  const deckUrl = `chrome-extension://${extensionId}/deck.html`;
  const page = await context.newPage();

  // Track all network activity
  const errors403 = [];
  const allRequests = [];

  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    if (url.includes('x.com') || url.includes('twitter.com') || url.includes('twimg.com')) {
      allRequests.push({ url: url.substring(0, 150), status });
      if (status === 403) {
        errors403.push({ url, status });
        console.log(`  [403] ${url.substring(0, 150)}`);
      } else if (status >= 400) {
        console.log(`  [${status}] ${url.substring(0, 150)}`);
      }
    }
  });

  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url.includes('x.com') || url.includes('twitter.com')) {
      console.log(`  [FAILED] ${url.substring(0, 150)} - ${request.failure()?.errorText}`);
    }
  });

  console.log('Navigating to deck page...');
  await page.goto(deckUrl);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, '02-deck-empty.png') });

  // Add a Home column
  console.log('Adding a Home column...');
  await page.click('#btn-add-column');
  await page.waitForTimeout(500);
  await page.click('[data-type="home"]');

  // Wait for X.com to load in the iframe
  console.log('Waiting for X.com to load in iframe (25s)...');
  await page.waitForTimeout(25000);
  await page.screenshot({ path: path.join(screenshotDir, '03-deck-with-column.png') });

  // Check iframe status
  const frames = page.frames();
  console.log(`\nFrames detected: ${frames.length}`);
  for (const frame of frames) {
    const url = frame.url();
    if (url && url !== 'about:blank') {
      console.log(`  Frame: ${url.substring(0, 120)}`);
    }
  }

  // === SUMMARY ===
  console.log('\n========================================');
  console.log('           NETWORK SUMMARY');
  console.log('========================================');
  console.log(`Total tracked requests: ${allRequests.length}`);

  const byStatus = {};
  for (const r of allRequests) {
    const bucket = `${Math.floor(r.status / 100)}xx`;
    byStatus[bucket] = (byStatus[bucket] || 0) + 1;
  }
  console.log('By status:', JSON.stringify(byStatus));

  if (errors403.length > 0) {
    console.log(`\n*** ${errors403.length} REQUESTS RETURNED 403 ***`);
    const unique403 = [...new Set(errors403.map(e => {
      try { return new URL(e.url).pathname; } catch { return e.url; }
    }))];
    for (const u of unique403) {
      console.log(`  - ${u}`);
    }
  } else {
    console.log('\nNo 403 errors detected!');
  }

  // Print error responses
  const nonOk = allRequests.filter(r => r.status >= 400);
  if (nonOk.length > 0) {
    console.log(`\nAll error responses (${nonOk.length}):`);
    for (const r of nonOk.slice(0, 30)) {
      console.log(`  [${r.status}] ${r.url}`);
    }
  }

  // Print some successful requests for context
  const ok = allRequests.filter(r => r.status >= 200 && r.status < 400);
  console.log(`\nSuccessful requests: ${ok.length}`);
  for (const r of ok.slice(0, 10)) {
    console.log(`  [${r.status}] ${r.url}`);
  }

  console.log('\nClosing browser...');
  await context.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });

  if (errors403.length > 0) {
    console.log(`\nRESULT: FAILED - ${errors403.length} requests returned 403`);
    process.exit(1);
  } else {
    console.log('\nRESULT: PASSED - No 403 errors');
    process.exit(0);
  }
})().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
