// GET /api/verify?sid=… → その Checkout が支払い済みなら購入証を返す
import { json, stripe, isPaid, issue } from '../../lib/pro-server.js';

export async function onRequestGet({ request, env }) {
  const sid = new URL(request.url).searchParams.get('sid') || '';
  if (!/^cs_[A-Za-z0-9_]+$/.test(sid)) return json({ error: 'bad' }, 400);
  try {
    const s = await stripe(env, 'GET', `checkout/sessions/${sid}`);
    if (!isPaid(s)) return json({ error: 'unpaid' }, 402);
    const license = await issue(env, s.id);
    return license ? json({ license }) : json({ error: 'limit' }, 403);
  } catch (e) {
    return json({ error: 'verify' }, e.status === 404 ? 404 : 502);
  }
}
