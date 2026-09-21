const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 700, height: 1300 } });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.click('.side-nav-item:has-text("Productos")');
  await page.click('.btn-crear-producto');
  await page.waitForSelector('.producto-form');

  await page.fill('.field input >> nth=0', 'SyncTestConjunto');
  await page.click('.form-grid .field .custom-select-trigger');
  await page.waitForSelector('.custom-select-dropdown');
  await page.click('.custom-select-option:has-text("Conjunto")');
  await page.waitForTimeout(200);

  const triggerProductos = page.locator('.custom-select-trigger:has-text("Agregar producto")');
  await triggerProductos.click();
  await page.waitForSelector('.custom-select-dropdown');
  await page.click('.custom-select-option:has-text("SyncTestPantalon")');
  await page.waitForTimeout(150);
  await triggerProductos.click();
  await page.waitForSelector('.custom-select-dropdown');
  await page.click('.custom-select-option:has-text("SyncTestBlusa")');
  await page.waitForTimeout(300);

  await page.click('.form-actions button:has-text("Crear producto")');
  await page.waitForSelector('.status.success', { timeout: 15000 });
  await page.waitForTimeout(1000);

  // filtrar por el conjunto para aislar
  await page.click('.btn-filtrar');
  await page.waitForSelector('.filtros-panel');
  const selects = page.locator('.filtro-campo .custom-select-trigger');
  await selects.nth(1).click();
  await page.waitForSelector('.custom-select-dropdown');
  await page.click('.custom-select-option:has-text("SyncTestConjunto")');
  await page.waitForTimeout(150);
  await page.click('.btn-aplicar-filtros');
  await page.waitForTimeout(400);

  console.log('Filas (expect 1):', await page.locator('tbody tr').count());
  console.log('Stock inicial del conjunto:', await page.locator('.stock-celda span').first().innerText());

  // abrir editor de stock y RESTAR 1 (agregar -1)
  await page.click('.btn-icono-mini');
  await page.waitForSelector('.stock-popover');
  await page.fill('.stock-popover input', '-1');
  await page.click('.stock-popover .btn-agregar');
  await page.waitForTimeout(1200);

  console.log('Stock del conjunto despues de restar 1:', await page.locator('.stock-celda span').first().innerText());

  await browser.close();
})().catch((e) => { console.error('SCRIPT_ERROR', e); process.exit(1); });
