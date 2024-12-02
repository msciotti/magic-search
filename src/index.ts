import { getMagicCard } from './handlers/magic-card';

export default {
  async fetch(request: Request, env: any) { 
    return handleRequest(request, env);
  }
}

async function handleRequest(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  
  if (url.pathname === '/token') {
    return new Response(JSON.stringify({token: env.DISCORD_BOT_TOKEN}), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  if (url.pathname === '/search') {
    return await getMagicCard(request, env);
  }

  else return new Response('Not found', { status: 404 });
}