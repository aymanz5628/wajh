// Import data from Strapi Cloud to local Strapi
const CLOUD_URL = 'https://proud-desk-b932ce8e9e.strapiapp.com';
const LOCAL_URL = 'http://localhost:1337';

async function getLocalToken() {
  const res = await fetch(`${LOCAL_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dr.aymanalenezi@gmail.com', password: 'Admin1234' }),
  });
  const data = await res.json();
  return data.data.token;
}

async function fetchAllFromCloud(endpoint) {
  const items = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${CLOUD_URL}/api/${endpoint}?populate=*&pagination[page]=${page}&pagination[pageSize]=100`);
    const data = await res.json();
    if (!data.data || data.data.length === 0) break;
    items.push(...data.data);
    if (page >= (data.meta?.pagination?.pageCount || 1)) break;
    page++;
  }
  return items;
}

async function createAndPublish(token, contentType, payload) {
  // Create via content-manager (admin API)
  const res = await fetch(`${LOCAL_URL}/content-manager/collection-types/${contentType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const result = await res.json();
  
  if (result.data?.documentId) {
    // Publish it
    await fetch(`${LOCAL_URL}/content-manager/collection-types/${contentType}/${result.data.documentId}/actions/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
  }
  return result;
}

async function main() {
  console.log('🔑 Getting local admin token...');
  const token = await getLocalToken();
  console.log('✅ Token obtained');

  // 1. Import Categories
  console.log('\n📂 Importing categories...');
  const categories = await fetchAllFromCloud('categories');
  const catMap = {};
  for (const cat of categories) {
    const result = await createAndPublish(token, 'api::category.category', {
      name: cat.name,
      slug: cat.slug,
    });
    if (result.data) {
      catMap[cat.documentId] = result.data.documentId;
      console.log(`  ✅ ${cat.name}`);
    } else {
      console.log(`  ❌ ${cat.name}: ${JSON.stringify(result.error?.message || result).substring(0,100)}`);
    }
  }

  // 2. Import Authors
  console.log('\n👤 Importing authors...');
  const authors = await fetchAllFromCloud('authors');
  const authorMap = {};
  for (const author of authors) {
    const result = await createAndPublish(token, 'api::author.author', {
      name: author.name,
      bio: author.bio,
    });
    if (result.data) {
      authorMap[author.documentId] = result.data.documentId;
      console.log(`  ✅ ${author.name}`);
    } else {
      console.log(`  ❌ ${author.name}: ${JSON.stringify(result.error?.message || result).substring(0,100)}`);
    }
  }

  // 3. Import Articles
  console.log('\n📝 Importing articles...');
  const articles = await fetchAllFromCloud('articles');
  for (const article of articles) {
    const payload = {
      title: article.title,
      slug: article.slug,
      description: article.description,
      content: article.content,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      keywords: article.keywords,
      canonicalUrl: article.canonicalUrl,
      rawHtml: article.rawHtml,
      useRawHtml: article.useRawHtml || false,
    };
    if (article.category?.documentId && catMap[article.category.documentId]) {
      payload.category = catMap[article.category.documentId];
    }
    if (article.author?.documentId && authorMap[article.author.documentId]) {
      payload.author = authorMap[article.author.documentId];
    }
    const result = await createAndPublish(token, 'api::article.article', payload);
    if (result.data) {
      console.log(`  ✅ ${article.title}`);
    } else {
      console.log(`  ❌ ${article.title}: ${JSON.stringify(result.error?.message || result).substring(0,200)}`);
    }
  }

  console.log('\n🎉 Import complete!');
  
  const verify = await fetch(`${LOCAL_URL}/api/articles`);
  const vData = await verify.json();
  console.log(`📊 Local articles: ${vData.meta?.pagination?.total || 0}`);
  
  const verifyCat = await fetch(`${LOCAL_URL}/api/categories`);
  const vcData = await verifyCat.json();
  console.log(`📊 Local categories: ${vcData.meta?.pagination?.total || 0}`);
}

main().catch(console.error);
