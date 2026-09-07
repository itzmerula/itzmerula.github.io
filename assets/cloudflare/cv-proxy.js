const NAMESPACE = 'jules0061-github-io';
const KEY = 'visits';
const BASE = 'https://abacus.jasoncameron.dev';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+/, '');
    const action = path === 'up' ? 'hit' : 'get';

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'no-store'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const upstream = `${BASE}/${action}/${NAMESPACE}/${KEY}`;

    try {
      const res = await fetch(upstream, { cf: { cacheTtl: 0 } });
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      void error;
      return new Response(JSON.stringify({ error: 'upstream' }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
  }
};
