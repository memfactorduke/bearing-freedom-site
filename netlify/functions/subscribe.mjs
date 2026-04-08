// Newsletter subscribe function — proxies to Beehiiv API
// Set these in Netlify environment variables:
//   BEEHIIV_API_KEY    — from beehiiv.com Settings > API
//   BEEHIIV_PUB_ID     — from beehiiv.com Settings > API > Publication ID

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUB_ID;

  if (!apiKey || !pubId) {
    return new Response(JSON.stringify({ error: 'Newsletter not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const email = body.email?.trim();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const resp = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
          utm_source: 'bearingfreedom.com',
          utm_medium: 'website',
        }),
      }
    );

    if (resp.ok || resp.status === 201) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 409 = already subscribed — treat as success
    if (resp.status === 409) {
      return new Response(JSON.stringify({ ok: true, already: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const errText = await resp.text();
    console.error('Beehiiv error:', resp.status, errText);
    return new Response(JSON.stringify({ error: 'Subscription failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Subscribe error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  path: '/api/subscribe',
};
