/** Cloudflare Pages — same pattern as btmob/Trovey */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname.startsWith('/api/') && context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  return context.next();
}
