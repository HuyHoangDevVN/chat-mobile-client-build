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
const key = fs.readFileSync(`${process.env.ASC_KEY_DIR}/AuthKey_${process.env.ASC_KEY_ID}.p8`);
const signature = crypto.sign('sha256', Buffer.from(unsigned), {
  key,
  dsaEncoding: 'ieee-p1363',
}).toString('base64url');
const token = `${unsigned}.${signature}`;

const get = path => new Promise((resolve, reject) => {
  https.get(`https://api.appstoreconnect.apple.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  }, response => {
    let body = '';
    response.setEncoding('utf8');
    response.on('data', chunk => { body += chunk; });
    response.on('end', () => {
      if (response.statusCode !== 200) {
        reject(new Error(`Apple signing asset read failed with HTTP ${response.statusCode}`));
        return;
      }
      resolve(JSON.parse(body).data);
    });
  }).on('error', reject);
});

const exactlyOne = (items, label) => {
  if (items.length !== 1) throw new Error(`Expected exactly one ${label}; found ${items.length}`);
  return items[0];
};

const certificates = await get('certificates?limit=200&fields[certificates]=name,certificateType,expirationDate,certificateContent');
const profiles = await get('profiles?limit=200&fields[profiles]=name,profileType,expirationDate,profileContent');
const certificate = exactlyOne(
  certificates.filter(({ attributes }) => attributes.certificateType === 'DISTRIBUTION'),
  'Apple Distribution certificate',
);
const appProfile = exactlyOne(
  profiles.filter(({ attributes }) => attributes.name === 'Hacom Chat App Store 2026' && attributes.profileType === 'IOS_APP_STORE'),
  'main App Store profile',
);
const shareProfile = exactlyOne(
  profiles.filter(({ attributes }) => attributes.name === 'Hacom Chat Share App Store 2026' && attributes.profileType === 'IOS_APP_STORE'),
  'Share Extension App Store profile',
);

const output = process.env.SIGNING_ASSET_OUTPUT;
fs.mkdirSync(output, { recursive: true, mode: 0o700 });
fs.writeFileSync(`${output}/distribution.cer`, Buffer.from(certificate.attributes.certificateContent, 'base64'), { mode: 0o600 });
fs.writeFileSync(`${output}/app.mobileprovision`, Buffer.from(appProfile.attributes.profileContent, 'base64'), { mode: 0o600 });
fs.writeFileSync(`${output}/share.mobileprovision`, Buffer.from(shareProfile.attributes.profileContent, 'base64'), { mode: 0o600 });

for (const [kind, asset] of [['certificate', certificate], ['profile', appProfile], ['profile', shareProfile]]) {
  const { name, certificateType, profileType, expirationDate } = asset.attributes;
  console.log(`${kind}\t${name}\t${certificateType ?? profileType}\t${expirationDate}`);
}
