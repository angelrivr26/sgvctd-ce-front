import { test, expect, Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function login(page: Page) {
  const credentials = await readFile(
    resolve('../backend-comprobantes/.local/ACCESO_LOCAL.md'),
    'utf8',
  );
  const password = credentials.match(/^Clave: (.+)$/m)?.[1];
  if (!password)
    throw new Error('Ejecute setup:local para generar credenciales locales de prueba.');
  await page.goto('/ingresar');
  await page.getByLabel('Usuario', { exact: true }).fill('contador');
  await page.getByLabel('Contraseña', { exact: true }).fill(password.trim());
  await page.getByRole('button', { name: 'Ingresar al sistema' }).click();
  await expect(
    page.getByRole('heading', { name: 'Comprobantes electrónicos', exact: true }),
  ).toBeVisible();
}

test('compra express con tres boletos: consulta, documentos y reenvio del mismo comprobante', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await login(page);
  await page.getByRole('button', { name: 'Compra de prueba' }).click();
  await page.getByLabel('Modalidad', { exact: true }).first().selectOption('EXPRESS');
  await page.getByLabel('Comprobante', { exact: true }).selectOption('FACTURA');
  await page.getByLabel('Cantidad de boletos').fill('3');
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/v1/pruebas/compras') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Registrar compra' }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(202);
  const accepted = await response.json();
  await page.getByRole('link', { name: accepted.comprobante.compraId, exact: true }).click();
  await expect(page.getByRole('heading', { name: accepted.comprobante.compraId })).toBeVisible();
  await expect(page.getByText('Procesado', { exact: true })).toBeVisible();
  await expect(page.getByText('Documentos disponibles', { exact: true })).toBeVisible();
  await expect(page.getByText('Emisión simulada confirmada', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Boletos de la compra' })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: /Representación de prueba/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  await download.saveAs(testInfo.outputPath('comprobante-prueba.pdf'));
  const pdf = await readFile(testInfo.outputPath('comprobante-prueba.pdf'));
  expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
  const resend = page.getByRole('button', { name: 'Reenviar correo de prueba' });
  await expect(resend).toBeEnabled();
  await resend.click();
  await expect(page.getByRole('status').filter({ hasText: 'Reenvío registrado' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('detalle-desktop.png'), fullPage: true });
  await page.getByRole('link', { name: 'Volver a comprobantes' }).click();
  await page.screenshot({ path: testInfo.outputPath('consulta-desktop.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('pantalla movil sin desbordamiento y cierre de sesion', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await page.screenshot({ path: testInfo.outputPath('consulta-movil.png'), fullPage: true });
  await page.getByRole('button', { name: 'Salir', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bienvenido', exact: true })).toBeVisible();
});

test('el rechazo queda visible y no ofrece documentos ni reenvio', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Compra de prueba' }).click();
  await page.getByLabel('Escenario', { exact: true }).selectOption('RECHAZO');
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/v1/pruebas/compras') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Registrar compra' }).click();
  const accepted = await (await responsePromise).json();
  await page.getByRole('link', { name: accepted.comprobante.compraId, exact: true }).click();
  await expect(page.getByText('Requiere atención', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reintentar procesamiento' })).toBeVisible();
  await expect(page.getByText('Esperando resultado de emisión', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Representación de prueba/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Reenviar correo de prueba' })).toHaveCount(0);
});

test('una emision confirmada con documentos fallidos ofrece recuperarlos sin reenviar correo', async ({
  page,
}) => {
  await login(page);
  const created = await page.request.post('/api/v1/pruebas/compras', {
    headers: { Origin: 'http://localhost:4205' },
    data: { modalidad: 'NORMAL', tipoComprobante: 'BOLETA', cantidad: 1, escenarioPrueba: 'EXITO' },
  });
  expect(created.status()).toBe(202);
  const { comprobante } = await created.json();
  // Verifica la presentacion de una respuesta de recuperacion; la falla real y
  // su recuperacion sin proveedor se ejercitan en la suite persistente del backend.
  await page.route(`**/api/v1/comprobantes/${comprobante.id}`, async (route) => {
    const response = await route.fetch();
    const detail = await response.json();
    await route.fulfill({
      response,
      json: {
        ...detail,
        estado: 'REQUIERE_ATENCION',
        estadoFiscal: 'SIMULADO',
        estadoDocumentos: 'ERROR',
        serie: 'PRUEBA',
        numero: '123',
        documentos: [],
        entregas: [],
        ultimoError: 'No se pudieron preparar los documentos.',
      },
    });
  });
  await page.goto(`/comprobantes/${comprobante.id}`);
  await expect(page.getByText('Documentos por recuperar', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Recuperar documentos' })).toBeVisible();
  await expect(
    page.getByText(/La emisión simulada está confirmada. Falta recuperar/),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Representación de prueba/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Reenviar correo de prueba' })).toHaveCount(0);
});

test('si vence la sesion vuelve al acceso al consultar informacion protegida', async ({ page }) => {
  await login(page);
  await page.context().clearCookies();
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bienvenido', exact: true })).toBeVisible();
});
