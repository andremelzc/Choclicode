# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: validation.spec.ts >> CACIF - Validación Integral (E2E + UX) >> E2E: CU02 - Gestión de Convocatorias
- Location: e2e\validation.spec.ts:114:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('GESTIÓN DE CONVOCATORIAS')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('GESTIÓN DE CONVOCATORIAS')

```

```yaml
- banner:
  - text: CA
  - heading "SISTEMA CACIF" [level=1]
  - paragraph: Asistente de Investigación · FISI - UNMSM
  - text: Sistema operativo EP Estudiante Prueba · 20200001
  - button "Cerrar sesión"
- complementary:
  - button "Crear nueva conversación": Nueva conversación
  - heading "Conversaciones" [level=3]
  - navigation "Conversaciones":
    - paragraph: No hay conversaciones previas
- main:
  - heading "Consulta General" [level=2]
  - paragraph: Resolviendo dudas generales sobre la FISI
  - text: CACIF · Asistente FISI
  - paragraph: Muéstrame las convocatorias
  - text: 02:14 PM CA
  - heading "ORIENTACIÓN Y MATCHMAKING" [level=3]
  - text: "Precisión: 95%"
  - paragraph: "He encontrado estos grupos de investigación para ti:"
  - heading "GI04 Inteligencia Artificial" [level=4]
  - paragraph: "Docente Responsable: David Santos Mauricio"
  - text: Inteligencia Artificial
  - paragraph: "Áreas técnicas:"
  - text: Machine Learning
  - button "Ver información completa"
  - text: 02:14 PM
  - textbox "Escribe tu consulta. El sistema buscará automáticamente la normativa..."
  - button [disabled]
  - text: CACIF · FISI-UNMSM · Motor RAG Activo
  - paragraph:
    - text: Esta es una versión prototipo. La información generada debe tomarse bajo su propia responsabilidad, ya que podría estar sujeta a actualizaciones. Para mayor seguridad o consultas formales, puedes escribir a
    - link "investigacion.fisi@unmsm.edu.pe":
      - /url: mailto:investigacion.fisi@unmsm.edu.pe
    - text: o acercarte directamente a la Unidad de Investigación.
```

# Test source

```ts
  18  |           user: { id: 'user-123', university_code: '20200001', full_name: 'Estudiante Prueba', role: 'estudiante' } 
  19  |         })
  20  |       });
  21  |     });
  22  | 
  23  |     await page.route(/\/api\/chat\/conversations/, async (route) => {
  24  |       if (route.request().method() === 'POST') {
  25  |         await route.fulfill({
  26  |           status: 201,
  27  |           contentType: 'application/json',
  28  |           body: JSON.stringify({ id: 'conv-123', intent_type: 'CU00', started_at: new Date().toISOString() })
  29  |         });
  30  |       } else {
  31  |         await route.fulfill({
  32  |           status: 200,
  33  |           contentType: 'application/json',
  34  |           body: JSON.stringify([])
  35  |         });
  36  |       }
  37  |     });
  38  | 
  39  |     await page.route(/\/api\/chat\/(message|conversations\/.*\/messages)/, async (route) => {
  40  |       // Si es un GET de mensajes, devolver array vacío para evitar errores de carga
  41  |       if (route.request().method() === 'GET') {
  42  |         return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  43  |       }
  44  | 
  45  |       const postData = route.request().postDataJSON();
  46  |       const content = postData?.content || '';
  47  |       
  48  |       let ui_type = 'general';
  49  |       let ui_data: any = {};
  50  |       let responseContent = 'Entendido, ¿en qué más puedo ayudarte?';
  51  | 
  52  |       if (content.toLowerCase().includes('ia') || content.toLowerCase().includes('grupo')) {
  53  |         ui_type = 'matchmaking_cards';
  54  |         responseContent = 'He encontrado estos grupos de investigación para ti:';
  55  |         ui_data = {
  56  |           cards_data: [{ id: 'gi1', name: 'GI04 Inteligencia Artificial', coordinator: 'David Santos Mauricio', lines: ['Inteligencia Artificial'], technical_areas: ['Machine Learning'] }]
  57  |         };
  58  |       } else if (content.toLowerCase().includes('convocatoria')) {
  59  |         ui_type = 'convocatoria_cards';
  60  |         responseContent = 'Aquí tienes las convocatorias vigentes:';
  61  |         ui_data = {
  62  |           contest_data: [{ id: 'c1', title: 'Convocatoria 2026-I', status_badge: 'ACTIVA', status_label: 'VIGENTE', contest_type: 'Investigación Estudiantil', requirements: ['Ser alumno regular'], prize: 'S/. 5000', apply_url: '#', timeline_events: [] }]
  63  |         };
  64  |       } else if (content.toLowerCase().includes('tesis')) {
  65  |         ui_type = 'stepper_cards';
  66  |         responseContent = 'Proceso de tesis:';
  67  |         ui_data = {
  68  |           stepper_data: [{ id: 's1', procedure_name: 'Registro de Plan de Tesis', estimated_time: '15 días', cost: 'S/. 150', requirements: [], steps: [{ step_number: 1, title: 'Paso 1', description: 'Solicitud' }] }]
  69  |         };
  70  |       } else if (content.toLowerCase().includes('normativa')) {
  71  |         ui_type = 'citation_cards';
  72  |         responseContent = 'Normativa:';
  73  |         ui_data = {
  74  |           citation_data: [{ id: 'cit1', document_name: 'Reglamento', article_number: 'Art. 15', exact_quote: 'Cita...', explanation: 'Explicación' }]
  75  |         };
  76  |       }
  77  | 
  78  |       await route.fulfill({
  79  |         status: 200,
  80  |         contentType: 'application/json',
  81  |         body: JSON.stringify({
  82  |           id: 'msg-' + Date.now(),
  83  |           role: 'assistant',
  84  |           content: responseContent,
  85  |           ui_type: ui_type,
  86  |           sent_at: new Date().toISOString(),
  87  |           rag_confidence: 0.95,
  88  |           ...ui_data
  89  |         })
  90  |       });
  91  |     });
  92  | 
  93  |     // Navegar al Login
  94  |     await page.goto('/login');
  95  |     await page.fill('input[type="email"]', 'prueba@unmsm.edu.pe');
  96  |     await page.fill('input[type="password"]', 'prueba123');
  97  |     await page.click('button:has-text("Ingresar al Sistema")');
  98  |     await expect(page).toHaveURL(/.*chat/, { timeout: 10000 });
  99  |   });
  100 | 
  101 |   test('Validación UX: Estética Oscura', async ({ page }) => {
  102 |     const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  103 |     expect(bgColor).toMatch(/rgb\(11, 14, 20\)|rgb\(13, 17, 23\)|rgb\(13, 18, 30\)/); 
  104 |   });
  105 | 
  106 |   test('E2E: CU01 - Búsqueda de Grupos', async ({ page }) => {
  107 |     // Usar el placeholder exacto que vimos en el código
  108 |     const input = page.getByPlaceholder(/Escribe tu consulta/i);
  109 |     await input.fill('Quiero buscar un grupo de IA');
  110 |     await page.keyboard.press('Enter');
  111 |     await expect(page.getByText('ORIENTACIÓN Y MATCHMAKING')).toBeVisible({ timeout: 10000 });
  112 |   });
  113 | 
  114 |   test('E2E: CU02 - Gestión de Convocatorias', async ({ page }) => {
  115 |     const input = page.getByPlaceholder(/Escribe tu consulta/i);
  116 |     await input.fill('Muéstrame las convocatorias');
  117 |     await page.keyboard.press('Enter');
> 118 |     await expect(page.getByText('GESTIÓN DE CONVOCATORIAS')).toBeVisible({ timeout: 10000 });
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  119 |   });
  120 | 
  121 |   test('E2E: CU03 - Trámites de Tesis', async ({ page }) => {
  122 |     const input = page.getByPlaceholder(/Escribe tu consulta/i);
  123 |     await input.fill('Cómo registro mi tesis');
  124 |     await page.keyboard.press('Enter');
  125 |     await expect(page.getByText('TRÁMITES ACADÉMICOS')).toBeVisible({ timeout: 10000 });
  126 |   });
  127 | 
  128 |   test('E2E: CU04 - Marco Normativo', async ({ page }) => {
  129 |     const input = page.getByPlaceholder(/Escribe tu consulta/i);
  130 |     await input.fill('Qué dice la normativa');
  131 |     await page.keyboard.press('Enter');
  132 |     await expect(page.getByText(/MARCO NORMATIVO/i)).toBeVisible({ timeout: 10000 });
  133 |   });
  134 | 
  135 | });
  136 | 
```