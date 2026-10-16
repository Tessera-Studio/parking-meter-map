// POST /api/checkout → Stripe Checkout（480円・一回払い）を作って URL を返す
import { json, stripe } from '../../lib/pro-server.js';

export async function onRequestPost({ request, env }) {
  const origin = new URL(request.url).origin;
  try {
    const s = await stripe(env, 'POST', 'checkout/sessions', [
      ['mode', 'payment'],
      ['line_items[0][price]', env.STRIPE_PRICE_ID],
      ['line_items[0][quantity]', '1'],
      ['locale', 'ja'],
      // 復元に使うので、メールアドレスは Stripe 側で必ず入力してもらう（一回払いの Checkout では必須）
      ['customer_creation', 'always'],
      ['success_url', `${origin}/?pro=success&sid={CHECKOUT_SESSION_ID}`],
      ['cancel_url', `${origin}/`],
    ]);
    return json({ url: s.url });
  } catch (e) {
    return json({ error: 'checkout' }, 502);
  }
}
