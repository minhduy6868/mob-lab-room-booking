export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store',
};

export function json(data, status = 200) {
  return Response.json(data, { status, headers: cors });
}

export function preflight() {
  return new Response(null, { status: 204, headers: cors });
}
