// POST /api/restore {email} → そのメールで支払い済みの購入があれば購入証を返す
// ※ メールアドレスの本人確認はしない（480円の買い切りなので手軽さを優先。悪用が目立ったら確認コード方式に）
import { json, stripe, isPaid, issue, limited } from '../../lib/pro-server.js';

export async function onRequestPost({ request, env }) {
  if (await limited(env, request)) return json({ error: 'rate' }, 429);
  let email = '';
  try { email = String((await request.json()).email || '').trim().toLowerCase(); } catch (e) {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return json({ error: 'bad' }, 400);
  try {
    const list = await stripe(env, 'GET', 'checkout/sessions', [['customer_details[email]', email], ['status', 'complete'], ['limit', '20']]);
    const s = (list.data || []).find(isPaid);
    if (!s) return json({ error: 'notfound' }, 404);
    const license = await issue(env, s.id);
    return license ? json({ license }) : json({ error: 'limit' }, 403);
  } catch (e) {
    return json({ error: 'restore' }, 502);
  }
}
