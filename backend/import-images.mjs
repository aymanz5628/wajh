// Download images from Strapi Cloud and upload to local Strapi
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLOUD_URL = 'https://proud-desk-b932ce8e9e.strapiapp.com';
const CLOUD_MEDIA = 'https://proud-desk-b932ce8e9e.media.strapiapp.com';
const LOCAL_URL = 'http://localhost:1337';
const TMP_DIR = path.join(__dirname, '.tmp', 'downloads');
const API_TOKEN = '2c3698fdaf5f9cf55533efe70e12fa7532bcc24ef78efaf1a3360cf579f28f6ee1cc96c20b9106cb25b22e5429c4352da2f8f9dfd997e925f482e7d96e10594f4903dffeea46e108e87fc2d1bd29bc568e7387fe8bd89eb1c7c59037138bc263dd5149da743f2cf0ed882b0654a032f9de705277162ab756e3d83cf635c1e747';

fs.mkdirSync(TMP_DIR, { recursive: true });

async function getAdminToken() {
  const res = await fetch(`${LOCAL_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dr.aymanalenezi@gmail.com', password: 'Admin1234' }),
  });
  return (await res.json()).data.token;
}

async function downloadImage(url) {
  const urls = [url];
  if (url.includes('/uploads/')) {
    const fn = url.split('/uploads/').pop();
    urls.push(`${CLOUD_MEDIA}/uploads/${fn}`);
    urls.push(`${CLOUD_URL}/uploads/${fn}`);
  }
  for (const u of urls) {
    try {
      const r = await fetch(u);
      if (r.ok) return Buffer.from(await r.arrayBuffer());
    } catch (e) {}
  }
  throw new Error('Download failed');
}

function uploadFile(filePath) {
  const cmd = `curl -sg -X POST "${LOCAL_URL}/api/upload" -H "Authorization: Bearer ${API_TOKEN}" -F "files=@${filePath}"`;
  const result = execSync(cmd, { encoding: 'utf-8' });
  const data = JSON.parse(result);
  return Array.isArray(data) ? data[0] : null;
}

async function linkImage(adminToken, documentId, fileId) {
  const res = await fetch(`${LOCAL_URL}/content-manager/collection-types/api::article.article/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ image: fileId }),
  });
  return res.json();
}

async function main() {
  const adminToken = await getAdminToken();
  console.log('✅ Tokens ready\n');

  const cloudRes = await fetch(`${CLOUD_URL}/api/articles?populate=image&pagination[limit]=50`);
  const cloudArticles = (await cloudRes.json()).data || [];

  const localRes = await fetch(`${LOCAL_URL}/api/articles?locale=*&pagination[limit]=50`);
  const localArticles = (await localRes.json()).data || [];
  const localBySlug = Object.fromEntries(localArticles.map(a => [a.slug, a]));

  let ok = 0, fail = 0;

  for (const ca of cloudArticles) {
    const la = localBySlug[ca.slug];
    if (!la) { continue; }
    if (!ca.image) { console.log(`⏭️  ${ca.slug} — no image`); continue; }

    let url = ca.image.url;
    if (url.startsWith('/')) url = CLOUD_MEDIA + url;
    const fn = path.basename(url.split('?')[0]);
    const fp = path.join(TMP_DIR, fn);

    try {
      process.stdout.write(`📷 ${ca.slug}... `);
      const buf = await downloadImage(url);
      fs.writeFileSync(fp, buf);

      const uploaded = uploadFile(fp);
      if (!uploaded?.id) { console.log('❌ upload fail'); fail++; continue; }

      await linkImage(adminToken, la.documentId, uploaded.id);
      console.log(`✅ (${(buf.length/1024).toFixed(0)}KB)`);
      ok++;
      fs.unlinkSync(fp);
    } catch (e) {
      console.log(`❌ ${e.message}`);
      fail++;
    }
  }

  console.log(`\n🎉 Done! ✅ ${ok} | ❌ ${fail}`);
}

main().catch(console.error);
