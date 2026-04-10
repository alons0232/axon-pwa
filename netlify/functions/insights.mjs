export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  try {
    const { logs } = await req.json();
    if (!logs || typeof logs !== 'string') return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
    if (logs.length > 10000) return new Response(JSON.stringify({ error: 'Input too large' }), { status: 413, headers });
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Service not configured' }), { status: 500, headers });
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: 'Eres AXON, un sistema de inteligencia personal. Analiza los registros diarios del usuario y genera exactamente 4 insights sobre patrones invisibles en sus datos. Busca correlaciones entre sueño, energía, estrés, foco, hábitos y estado de ánimo. Sé específico con los datos, no genérico. Responde SOLO con JSON válido, sin markdown ni backticks.',
        messages: [{ role: 'user', content: `Registros:\n${logs}\n\nFormato JSON exacto:\n[{"icon":"emoji","categoria":"NOMBRE_CORTO","insight":"patrón específico basado en los datos","accion":"recomendación concreta y accionable","color":"#hexcolor"}]\n\nUsa solo estos colores: #00FFB2, #3B82F6, #8B5CF6, #FF6B35, #F43F5E` }],
      }),
    });
    if (!response.ok) return new Response(JSON.stringify({ error: 'AI service unavailable' }), { status: 502, headers });
    const data = await response.json();
    const raw = data.content.map(b => b.text || '').join('');
    const insights = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return new Response(JSON.stringify({ insights }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers });
  }
};
export const config = { path: '/api/insights' };
