import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '../docs/screenshots');
const BASE_URL = 'http://localhost:3000';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Navigating to app...');
  await page.goto(BASE_URL);

  // Login
  console.log('Logging in...');
  await page.waitForSelector('[data-testid="login-form"]');
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/00-login.png`, fullPage: false });
  await page.fill('[data-testid="username-input"]', 'admin');
  await page.fill('[data-testid="password-input"]', 'admin');
  await page.click('[data-testid="login-submit-btn"]');

  await page.waitForSelector('[data-testid="rate-tiles-panel"]');
  await wait(2500); // let prices tick in

  // ── 1. Full app overview ──────────────────────────────────────────
  console.log('Screenshot 1: Full app overview');
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-overview.png`, fullPage: false });

  // ── 2. Rate tiles close-up ────────────────────────────────────────
  console.log('Screenshot 2: Rate tiles');
  const tilesPanel = page.locator('[data-testid="rate-tiles-panel"]');
  await tilesPanel.screenshot({ path: `${SCREENSHOTS_DIR}/02-rate-tiles.png` });

  // ── 3. Click-to-trade: click BUY on EUR/USD ───────────────────────
  console.log('Screenshot 3: Click-to-trade');
  await page.click('[data-testid="buy-btn-EURUSD"]');
  await wait(400);
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-click-to-trade.png` });

  // ── 4. Trade blotter with seed + ESP trades ───────────────────────
  console.log('Screenshot 4: Trade blotter');
  await page.click('[data-testid="sell-btn-GBPUSD"]');
  await wait(400);
  const blotter = page.locator('[data-testid="trade-blotter"]');
  await blotter.screenshot({ path: `${SCREENSHOTS_DIR}/04-trade-blotter.png` });

  // ── 5. RFQ Form (idle state) ──────────────────────────────────────
  console.log('Screenshot 5: RFQ form idle');
  const rfqPanel = page.locator('[data-testid="rfq-panel"]');
  await rfqPanel.screenshot({ path: `${SCREENSHOTS_DIR}/05-rfq-idle.png` });

  // ── 6. Submit RFQ → pending ───────────────────────────────────────
  console.log('Screenshot 6: RFQ pending');
  await page.selectOption('[data-testid="rfq-pair-select"]', 'USD/JPY');
  await page.fill('[data-testid="rfq-notional-input"]', '5,000,000');
  await page.click('[data-testid="tenor-1W"]');
  await page.click('[data-testid="rfq-submit-btn"]');
  await wait(800);
  await rfqPanel.screenshot({ path: `${SCREENSHOTS_DIR}/06-rfq-pending.png` });

  // ── 7. All 4 quotes received ──────────────────────────────────────
  console.log('Screenshot 7: All quotes received');
  await page.waitForFunction(() => {
    const text = document.querySelector('[data-testid="rfq-quotes"]')?.textContent ?? '';
    return text.includes('4/4');
  }, { timeout: 10000 });
  await wait(300);
  await rfqPanel.screenshot({ path: `${SCREENSHOTS_DIR}/07-rfq-all-quotes.png` });
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/07b-rfq-full-view.png` });

  // ── 8. Accept a quote ─────────────────────────────────────────────
  console.log('Screenshot 8: Accept quote');
  const bestCard = page.locator('[data-testid^="dealer-quote-"]').filter({ hasText: 'BEST' }).first();
  const dealerName = await bestCard.locator('span').first().textContent();
  const cleanDealer = dealerName?.trim().replace(/\s/g, '') ?? '';
  await page.click(`[data-testid="accept-buy-${cleanDealer}"]`);
  await wait(400);
  await rfqPanel.screenshot({ path: `${SCREENSHOTS_DIR}/08-rfq-accepted.png` });

  // ── 9. New RFQ → reject flow ──────────────────────────────────────
  console.log('Screenshot 9: RFQ reject flow');
  await page.click('[data-testid="rfq-new-btn"]');
  await wait(200);
  await page.selectOption('[data-testid="rfq-pair-select"]', 'EUR/GBP');
  await page.fill('[data-testid="rfq-notional-input"]', '2,000,000');
  await page.click('[data-testid="tenor-3M"]');
  await page.click('[data-testid="rfq-submit-btn"]');
  // Wait for quotes then screenshot live state
  await page.waitForSelector('[data-testid="rfq-reject-btn"]');
  await wait(300);
  await rfqPanel.screenshot({ path: `${SCREENSHOTS_DIR}/09-rfq-live-quotes.png` });
  // Reject
  await page.click('[data-testid="rfq-reject-btn"]');
  await wait(300);
  await rfqPanel.screenshot({ path: `${SCREENSHOTS_DIR}/09b-rfq-rejected.png` });

  // ── 10. Final full overview ───────────────────────────────────────
  console.log('Screenshot 10: Final full overview');
  await page.click('[data-testid="rfq-new-btn"]');
  await wait(200);
  // Add a few more trades for a busy blotter
  await page.click('[data-testid="buy-btn-USDJPY"]');
  await wait(200);
  await page.click('[data-testid="sell-btn-EURUSD"]');
  await wait(200);
  await page.click('[data-testid="sell-btn-USDCAD"]');
  await wait(600);
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/10-final-overview.png` });

  await browser.close();
  console.log('Done! Screenshots saved to docs/screenshots/');
})();
