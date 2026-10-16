// Pro の購入証に使う鍵（ECDSA P-256）を作る。  node scripts/pro-keys.mjs
// 秘密鍵は Cloudflare Pages の環境変数（シークレット）PRO_PRIVATE_JWK にだけ入れる（ファイルに保存しない・コミットしない）。
// 公開鍵は config.js の proPublicKey に貼る。
const { privateKey, publicKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const priv = await crypto.subtle.exportKey('jwk', privateKey);
const pub = await crypto.subtle.exportKey('jwk', publicKey);
delete pub.key_ops; delete pub.ext;
console.log('▼ PRO_PRIVATE_JWK（Cloudflare Pages のシークレットに）\n' + JSON.stringify(priv));
console.log('\n▼ proPublicKey（config.js に）\n' + JSON.stringify(pub));
