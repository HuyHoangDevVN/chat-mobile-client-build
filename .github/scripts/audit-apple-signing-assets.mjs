import crypto from 'node:crypto';
import fs from 'node:fs';
import https from 'node:https';

const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const header = encode({ alg: 'ES256', kid: process.env.ASC_KEY_ID, typ: 'JWT' });
const payload = encode({
  iss: process.env.ASC_ISSUER_ID,
  iat: now,
  exp: now + 600,
  aud: 'appstoreconnect-v1',
});
const unsigned = `${header}.${payload}`;
const key = fs.readFileSync(
  `${process.env.ASC_KEY_DIR}/AuthKey_${process.env.ASC_KEY_ID}.p8`,
);
const signature = crypto.sign('sha256', Buffer.from(unsigned), {
  key,
  dsaEncoding: 'ieee-p1363',
}).toString('base64url');
const token = `${unsigned}.${signature}`;

const get = url => new Promise((resolve, reject) => {
  https.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  }, response => {
    let body = '';
    response.setEncoding('utf8');
    response.on('data', chunk => { body += chunk; });
    response.on('end', () => {
      if (response.statusCode !== 200) {
        reject(new Error(`Apple signing inventory read failed with HTTP ${response.statusCode}`));
        return;
      }
      resolve(JSON.parse(body));
    });
  }).on('error', reject);
});

const readAll = async path => {
  const items = [];
  let url = `https://api.appstoreconnect.apple.com/v1/${path}?limit=200`;
  while (url) {
    const page = await get(url);
    items.push(...page.data);
    url = page.links?.next ?? null;
  }
  return items;
};

const clean = value => String(value ?? '').replace(/[\t\r\n]+/g, ' ');
const inventory = [
  ...(await readAll('certificates')).map(({ attributes }) => ({
    kind: 'certificate',
    name: clean(attributes.name),
    type: clean(attributes.certificateType),
    expires: clean(attributes.expirationDate),
  })),
  ...(await readAll('profiles')).map(({ attributes }) => ({
    kind: 'profile',
    name: clean(attributes.name),
    type: clean(attributes.profileType),
    expires: clean(attributes.expirationDate),
  })),
].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

for (const item of inventory) {
  console.log(`${item.kind}\t${item.name}\t${item.type}\t${item.expires}`);
}
fs.writeFileSync(process.argv[2], `${JSON.stringify(inventory, null, 2)}\n`, { mode: 0o600 });
