import { test, expect } from '@playwright/test';

test.describe('CACIF - Validación Integral (E2E + UX)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Bypass el disclaimer modal
    await page.addInitScript(() => {
      sessionStorage.setItem('cacif_disclaimer_seen', 'true');
    });

    // MOCK GLOBAL: Interceptar cualquier llamada a /api/
    await page.route(/\/api\/auth\/login/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          token: 'mock-jwt-token', 
          user: { id: 'user-123', university_code: '20200001', full_name: 'Estudiante Prueba', role: 'estudiante' } 
        })
      });
    });

    await page.route(/\/api\/chat\/conversations/, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'conv-123', intent_type: 'CU00', started_at: new Date().toISOString() })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    await page.route(/\/api\/chat\/(message|conversations\/.*\/messages)/, async (route) => {
      // Si es un GET de mensajes, devolver array vacío para evitar errores de carga
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }

      const postData = route.request().postDataJSON();
      const content = postData?.content || '';
      
      let ui_type = 'general';
      let ui_data: any = {};
      let responseContent = 'Entendido, ¿en qué más puedo ayudarte?';

      if (/\bia\b/i.test(content) || content.toLowerCase().includes('grupo')) {
        ui_type = 'matchmaking_cards';
        responseContent = 'He encontrado estos grupos de investigación para ti:';
        ui_data = {
          cards_data: [{ id: 'gi1', name: 'GI04 Inteligencia Artificial', coordinator: 'David Santos Mauricio', lines: ['Inteligencia Artificial'], technical_areas: ['Machine Learning'] }]
        };
      } else if (content.toLowerCase().includes('convocatoria')) {
        ui_type = 'convocatoria_cards';
        responseContent = 'Aquí tienes las convocatorias vigentes:';
        ui_data = {
          contest_data: [{ id: 'c1', title: 'Convocatoria 2026-I', status_badge: 'ACTIVA', status_label: 'VIGENTE', contest_type: 'Investigación Estudiantil', requirements: ['Ser alumno regular'], prize: 'S/. 5000', apply_url: '#', timeline_events: [] }]
        };
      } else if (content.toLowerCase().includes('tesis')) {
        ui_type = 'stepper_cards';
        responseContent = 'Proceso de tesis:';
        ui_data = {
          stepper_data: [{ id: 's1', procedure_name: 'Registro de Plan de Tesis', estimated_time: '15 días', cost: 'S/. 150', requirements: [], steps: [{ step_number: 1, title: 'Paso 1', description: 'Solicitud' }] }]
        };
      } else if (content.toLowerCase().includes('normativa')) {
        ui_type = 'citation_cards';
        responseContent = 'Normativa:';
        ui_data = {
          citation_data: [{ id: 'cit1', document_name: 'Reglamento', article_number: 'Art. 15', exact_quote: 'Cita...', explanation: 'Explicación' }]
        };
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'msg-' + Date.now(),
          role: 'assistant',
          content: responseContent,
          ui_type: ui_type,
          sent_at: new Date().toISOString(),
          rag_confidence: 0.95,
          ...ui_data
        })
      });
    });

    // Navegar al Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'prueba@unmsm.edu.pe');
    await page.fill('input[type="password"]', 'prueba123');
    await page.click('button:has-text("Ingresar al Sistema")');
    await expect(page).toHaveURL(/.*chat/, { timeout: 10000 });
  });

  test('Validación UX: Estética Oscura', async ({ page }) => {
    const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bgColor).toMatch(/rgb\(11, 14, 20\)|rgb\(13, 17, 23\)|rgb\(13, 18, 30\)/); 
  });

  test('E2E: CU01 - Búsqueda de Grupos', async ({ page }) => {
    // Usar el placeholder exacto que vimos en el código
    const input = page.getByPlaceholder(/Escribe tu consulta/i);
    await input.fill('Quiero buscar un grupo de IA');
    await page.keyboard.press('Enter');
    await expect(page.getByText('ORIENTACIÓN Y MATCHMAKING')).toBeVisible({ timeout: 10000 });
  });

  test('E2E: CU02 - Gestión de Convocatorias', async ({ page }) => {
    const input = page.getByPlaceholder(/Escribe tu consulta/i);
    await input.fill('Muéstrame las convocatorias');
    await page.keyboard.press('Enter');
    await expect(page.getByText('GESTIÓN DE CONVOCATORIAS')).toBeVisible({ timeout: 10000 });
  });

  test('E2E: CU03 - Trámites de Tesis', async ({ page }) => {
    const input = page.getByPlaceholder(/Escribe tu consulta/i);
    await input.fill('Cómo registro mi tesis');
    await page.keyboard.press('Enter');
    await expect(page.getByText('TRÁMITES ACADÉMICOS')).toBeVisible({ timeout: 10000 });
  });

  test('E2E: CU04 - Marco Normativo', async ({ page }) => {
    const input = page.getByPlaceholder(/Escribe tu consulta/i);
    await input.fill('Qué dice la normativa');
    await page.keyboard.press('Enter');
    await expect(page.getByText(/MARCO NORMATIVO/i)).toBeVisible({ timeout: 10000 });
  });

});
