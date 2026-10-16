/* Pro の購入・購入証の発行（Cloudflare Pages Functions から使う。docs/pro-ads.md §15.6）
   環境変数（Pages の設定）：
     STRIPE_SECRET_KEY  Stripe のシークレットキー（sk_live_… / テストは sk_test_…）
     STRIPE_PRICE_ID    Pro（480円・一回払い）の価格 ID（price_…）
     PRO_PRIVATE_JWK    購入証に署名する秘密鍵（JWK の JSON 文字列。scripts/pro-keys.mjs で作る）
   KV（Pages の設定で紐づける）：
     PRO_KV             購入ごとの発行回数（n:<購入ID>）と、IP ごとの回数制限（rl:<IP>:<分>）
   秘密の値はここにもクライアントにも書かない。 */
export const MAX_DEVICES = 5;       // 1つの購入につき購入証を発行できる端末の数
export const RESTORE_PER_MIN = 3;   // 同じ IP から1分に復元できる回数

export const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

// Stripe の API（フォーム形式）。params はオブジェクトか [キー, 値] の配列
export async function stripe(env, method, path, params) {
  const body = params ? new URLSearchParams(params).toString() : '';
  const url = `https://api.stripe.com/v1/${path}${method === 'GET' && body ? `?${body}` : ''}`;
  const r = await fetch(url, {
    method,
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: method === 'GET' ? undefined : body,
  });
  const j = await r.json();
  if (!r.ok) throw Object.assign(new Error(j.error?.message || 'stripe'), { status: r.status });
  return j;
}

export const isPaid = s => s && s.status === 'complete' && s.payment_status === 'paid';

const b64u = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// 購入証：base64url(JSON {v, pid, iat}) + "." + base64url(ECDSA P-256 / SHA-256 の署名)
export async function sign(env, pid) {
  const key = await crypto.subtle.importKey('jwk', JSON.parse(env.PRO_PRIVATE_JWK), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const p = b64u(new TextEncoder().encode(JSON.stringify({ v: 1, pid, iat: Math.floor(Date.now() / 1000) })));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(p));
  return `${p}.${b64u(sig)}`;
}

// 発行の回数を数えて、上限内なら購入証を返す。上限なら null
export async function issue(env, pid) {
  const k = `n:${pid}`;
  const n = +(await env.PRO_KV.get(k)) || 0;
  if (n >= MAX_DEVICES) return null;
  await env.PRO_KV.put(k, String(n + 1));
  return sign(env, pid);
}

// 同じ IP からの回数制限（1分ごと）。超えていれば true
export async function limited(env, request, per = RESTORE_PER_MIN) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const k = `rl:${ip}:${Math.floor(Date.now() / 60000)}`;
  const n = +(await env.PRO_KV.get(k)) || 0;
  if (n >= per) return true;
  await env.PRO_KV.put(k, String(n + 1), { expirationTtl: 120 });
  return false;
}
