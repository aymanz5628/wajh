import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Helper function to download and upload image URLs programmatically
async function downloadAndUploadImage(strapi: Core.Strapi, url: string, name: string): Promise<any> {
  try {
    // 1. Check if the file is already uploaded to prevent duplicates
    const existingFiles = await strapi.db.query('plugin::upload.file').findMany({
      where: { name }
    });
    if (existingFiles && existingFiles.length > 0) {
      console.log(`📷 Image ${name} already exists in Media Library`);
      return existingFiles[0];
    }

    console.log(`📷 Downloading image from ${url}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Write to a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `${Date.now()}-${name}`);
    fs.writeFileSync(tempFilePath, buffer);

    const stats = fs.statSync(tempFilePath);

    console.log(`📷 Uploading ${name} to Strapi Media Library...`);
    const uploadService = strapi.plugin('upload').service('upload');
    const uploadedFiles = await uploadService.upload({
      data: {
        fileInfo: {
          name: name,
          caption: name,
          alternativeText: name,
        }
      },
      files: {
        filepath: tempFilePath,
        originalFilename: name,
        mimetype: 'image/jpeg',
        size: stats.size,
      }
    });

    // Clean up temp file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {}

    if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
      console.log(`✅ Image ${name} uploaded successfully, ID: ${uploadedFiles[0].id}`);
      return uploadedFiles[0];
    }
    return null;
  } catch (error) {
    console.error(`❌ Error uploading image ${name}:`, error);
    return null;
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Set public permissions for API access
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    if (publicRole) {
      const contentTypes = ['article', 'category', 'program', 'documentary', 'author', 'gallery-image'];
      for (const ct of contentTypes) {
        try {
          const findPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: {
              role: publicRole.id,
              action: `api::${ct}.${ct}.find`,
            },
          });

          if (!findPermission) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action: `api::${ct}.${ct}.find`,
                role: publicRole.id,
              },
            });
          }

          const findOnePermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: {
              role: publicRole.id,
              action: `api::${ct}.${ct}.findOne`,
            },
          });

          if (!findOnePermission) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action: `api::${ct}.${ct}.findOne`,
                role: publicRole.id,
              },
            });
          }
        } catch (err) {
          // Skip content types that don't exist
        }
      }
      console.log('✅ Public API permissions set');
    }

    // 1. Ensure Arabic locale is created/active and set as default
    try {
      const localeService = strapi.plugin('i18n')?.service('locales');
      if (localeService) {
        const locales = await localeService.find();
        if (!locales.some((l: any) => l.code === 'ar')) {
          console.log('🌐 Creating Arabic locale...');
          await localeService.create({ code: 'ar', name: 'Arabic (ar)' });
        }

        // Set Arabic as default locale in core store settings
        const coreStore = strapi.db.query('strapi::core-store');
        if (coreStore) {
          const i18nDefault = await coreStore.findOne({
            where: { key: 'plugin_i18n_default_locale' }
          });

          if (i18nDefault && i18nDefault.value !== JSON.stringify('ar')) {
            console.log('🌐 Setting default i18n locale in core store to Arabic (ar)...');
            await coreStore.update({
              where: { key: 'plugin_i18n_default_locale' },
              data: { value: JSON.stringify('ar') }
            });
          }
        }
      }
    } catch (e) {
      console.error('❌ Error initializing Arabic locale:', e);
    }

    // 2. Seed Wajh Author
    const authorUid = 'api::author.author';
    let authorDocId = '';
    try {
      const existingAuthors = await strapi.db.query(authorUid).findMany({
        where: { name: 'فريق تحرير وجه / Wajh Editorial Team' }
      });
      if (existingAuthors.length === 0) {
        console.log('👤 Seeding Wajh Author...');
        const avatarUrl = 'https://ui-avatars.com/api/?name=Wajh&background=1A2744&color=fff';
        const avatarFile = await downloadAndUploadImage(strapi, avatarUrl, 'wajh-author-avatar.jpg');

        const author = await strapi.documents(authorUid).create({
          data: {
            name: 'فريق تحرير وجه / Wajh Editorial Team',
            bio: 'المكتب الاتصالي لمنصة وجه المتخصصة بالعلاقات العامة والاتصال المؤسسي.',
            avatar: avatarFile ? avatarFile.id : null,
          },
          status: 'published'
        });
        authorDocId = author.documentId;
      } else {
        authorDocId = existingAuthors[0].documentId;
      }
    } catch (e) {
      console.error('❌ Error seeding author:', e);
    }

    // 3. Seed Wajh Categories (Arabic & English)
    const categoryUid = 'api::category.category';
    const categoriesToSeed = [
      { slug: 'pr', ar: 'علاقات عامة', en: 'Public Relations' },
      { slug: 'crisis', ar: 'إدارة الأزمات', en: 'Crisis Management' },
      { slug: 'media', ar: 'إعلام', en: 'Media' },
      { slug: 'digital', ar: 'رقمي', en: 'Digital' },
      { slug: 'corporate', ar: 'مؤسسي', en: 'Corporate' },
    ];
    const catMap: Record<string, string> = {};

    try {
      for (const cat of categoriesToSeed) {
        const existingCats = await strapi.db.query(categoryUid).findMany({
          where: { slug: cat.slug }
        });

        let catDocId = '';
        const hasAr = existingCats.some((c: any) => c.locale === 'ar');
        const hasEn = existingCats.some((c: any) => c.locale === 'en');

        if (existingCats.length > 0) {
          catDocId = existingCats[0].documentId;
        }

        if (!hasAr) {
          console.log(`📂 Seeding category '${cat.slug}' in Arabic...`);
          const docAr = await strapi.documents(categoryUid).create({
            documentId: catDocId || undefined,
            data: {
              name: cat.ar,
              slug: cat.slug
            },
            locale: 'ar',
            status: 'published'
          });
          if (!catDocId) {
            catDocId = docAr.documentId;
          }
        }

        catMap[cat.slug] = catDocId;

        if (!hasEn) {
          console.log(`📂 Seeding category '${cat.slug}' in English...`);
          await strapi.documents(categoryUid).update({
            documentId: catDocId,
            locale: 'en',
            data: {
              name: cat.en,
              slug: cat.slug
            },
            status: 'published'
          });
        }
      }
    } catch (e) {
      console.error('❌ Error seeding categories:', e);
    }

    // 4. Seed Wajh Articles (Arabic & English)
    const articleUid = 'api::article.article';
    const articlesToSeed = [
      {
        slug: 'pr-strategy-digital-transformation',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
        categorySlug: 'pr',
        ar: {
          title: 'استراتيجية العلاقات العامة في عصر التحول الرقمي',
          description: 'كيف تبني حضوراً رقمياً قوياً يدعم سمعة مؤسستك ويعزز الثقة.',
          content: 'في عصر الاتصال الفائق والتحول الرقمي المتسارع، لم تعد العلاقات العامة تقتصر على كتابة البيانات الصحفية التقليدية وإرسالها لوسائل الإعلام. اليوم، تدور العلاقات العامة حول بناء حوار تفاعلي مستمر مع الجمهور عبر قنوات اتصالية متعددة. تحتاج المؤسسات إلى تطوير استراتيجيات مرنة تعتمد على البيانات، وتفهم طبيعة سلوك الجمهور الرقمي، وتستغل أدوات النشر المبتكرة لتعزيز سمعتها ومواجهة التحديات الإعلامية فور ظهورها.'
        },
        en: {
          title: 'PR Strategy in the Age of Digital Transformation',
          description: 'How to build a strong digital presence that supports your institution\'s reputation.',
          content: 'In the era of hyper-connectivity and rapid digital transformation, public relations is no longer limited to writing traditional press releases and sending them to the media. Today, PR revolves around building a continuous, interactive dialogue with the audience across multiple communication channels. Organizations need to develop agile, data-driven strategies that understand digital audience behavior and leverage innovative publishing tools to protect reputation and address media challenges in real-time.'
        }
      },
      {
        slug: 'media-crisis-management-guide',
        imageUrl: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&q=80&w=800',
        categorySlug: 'crisis',
        ar: {
          title: 'إدارة الأزمات الإعلامية: دليل عملي',
          description: 'خطوات حاسمة للتعامل مع الأزمات الإعلامية والحفاظ على صورة العلامة.',
          content: 'تحدث الأزمات فجأة، ولكن سرعة وذكاء الاستجابة هما ما يحددان ما إذا كانت الأزمة ستدمر السمعة المؤسسية أم ستمر بأقل الخسائر الممكنة. يتطلب النجاح في إدارة الأزمات إعداد سيناريوهات استباقية وتدريب المتحدثين الرسميين وتفعيل خلية اتصال طارئة تعمل على مدار الساعة لتقديم معلومات شفافة ودقيقة تمنع انتشار الإشاعات وتستعيد ثقة الجمهور في أسرع وقت.'
        },
        en: {
          title: 'Media Crisis Management: A Practical Guide',
          description: 'Critical steps for handling media crises and preserving brand image.',
          content: 'Crises happen suddenly, but the speed and intelligence of the response determine whether the crisis will destroy corporate reputation or pass with minimal damage. Success in crisis management requires preparing proactive scenarios, training official spokespeople, and activating a 24/7 crisis communication cell to provide transparent and accurate information that prevents the spread of rumors and restores public trust quickly.'
        }
      },
      {
        slug: 'content-marketing-trust',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
        categorySlug: 'media',
        ar: {
          title: 'التسويق بالمحتوى لتعزيز ثقة الجمهور',
          description: 'استراتيجيات المحتوى التي تبني جسور الثقة بين المؤسسة وجمهورها.',
          content: 'الجمهور الحديث يبحث عن القيمة والمصداقية. لم يعد الإعلان التقليدي كافياً لإقناع المستهلكين أو كسب ولائهم. يمثل التسويق بالمحتوى النافع والقصص الملهمة والبيانات الدقيقة الأداة الأكثر فعالية لبناء جسور قوية من الثقة الطويلة الأمد. عندما تقدم المؤسسة محتوى يحل مشاكل جمهورها أو يثري معارفهم، فإنها تضع نفسها كمرجعية موثوقة في قطاعها.'
        },
        en: {
          title: 'Content Marketing to Build Public Trust',
          description: 'Content strategies that build bridges of trust between organizations and their audiences.',
          content: 'Modern audiences look for value and credibility. Traditional advertising is no longer enough to persuade consumers or earn their loyalty. Content marketing using useful resources, inspiring stories, and accurate data represents the most effective tool to build strong, long-term bridges of trust. When an organization provides content that solves its audience\'s problems or enriches their knowledge, it establishes itself as a trusted authority in its field.'
        }
      },
      {
        slug: 'measuring-pr-campaigns',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
        categorySlug: 'digital',
        ar: {
          title: 'قياس أثر حملات العلاقات العامة',
          description: 'مؤشرات الأداء الرئيسية لتقييم نجاح استراتيجيتك الإعلامية.',
          content: 'ما لا يمكن قياسه لا يمكن إدارته أو تحسينه. في الماضي، كان قياس العلاقات العامة يعتمد على مساحات النشر ومكافئات القيمة الإعلانية وهي مقاييس غير دقيقة. اليوم، تتيح الأدوات الرقمية قياس النبرة العامة للمحادثات، ومستوى التفاعل والارتباط بالهوية، والتغيير في وعي الجمهور وسلوكهم، بالإضافة إلى قياس تأثير الحملات الاتصالية على الأهداف العامة للمؤسسة.'
        },
        en: {
          title: 'Measuring the Impact of PR Campaigns',
          description: 'Key performance indicators to evaluate your media strategy\'s success.',
          content: 'What cannot be measured cannot be managed or improved. In the past, PR measurement relied on clipping books and advertising value equivalents (AVEs), which are inaccurate. Today, digital tools allow for measuring the sentiment of conversations, engagement levels, brand affinity, and shifts in audience awareness and behavior, as well as the direct impact of communication campaigns on overall corporate objectives.'
        }
      },
      {
        slug: 'government-pr-institutional-trust',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
        categorySlug: 'corporate',
        ar: {
          title: 'العلاقات العامة الحكومية: بناء الثقة المؤسسية',
          description: 'كيف تبني الجهات الحكومية علاقة قوية وشفافة مع المواطنين والإعلام.',
          content: 'الاتصال الحكومي الفعال هو الركيزة الأساسية لنجاح السياسات العامة وتعزيز المشاركة الوطنية. يجب أن يعتمد الاتصال الحكومي على الوضوح التام والوصول السريع للمعلومات وتفنيد الشائعات بشكل موضوعي. من خلال تبني مبادئ الشفافية والشراكة مع وسائل الإعلام، تستطيع المؤسسات الحكومية بناء حوار بناء يسهم في تحقيق التنمية المستدامة واستقرار الثقة العامة.'
        },
        en: {
          title: 'Government PR: Building Institutional Trust',
          description: 'How government entities build strong, transparent relationships with citizens and media.',
          content: 'Effective government communication is the cornerstone of successful public policies and national engagement. Government communication must rely on complete clarity, rapid access to information, and objective refutation of rumors. By adopting principles of transparency and partnership with the media, government institutions can build a constructive dialogue that contributes to sustainable development and public trust stability.'
        }
      }
    ];

    try {
      for (const art of articlesToSeed) {
        const existingArts = await strapi.db.query(articleUid).findMany({
          where: { slug: art.slug }
        });

        let artDocId = '';
        const hasAr = existingArts.some((a: any) => a.locale === 'ar');
        const hasEn = existingArts.some((a: any) => a.locale === 'en');

        if (existingArts.length > 0) {
          artDocId = existingArts[0].documentId;
        }

        if (!hasAr) {
          console.log(`📝 Seeding article '${art.slug}' in Arabic...`);
          const imgName = `article-${art.slug}.jpg`;
          const imgFile = await downloadAndUploadImage(strapi, art.imageUrl, imgName);

          const docAr = await strapi.documents(articleUid).create({
            documentId: artDocId || undefined,
            data: {
              title: art.ar.title,
              slug: art.slug,
              description: art.ar.description,
              content: art.ar.content,
              image: imgFile ? imgFile.id : null,
              category: catMap[art.categorySlug] || null,
              author: authorDocId || null
            },
            locale: 'ar',
            status: 'published'
          });
          if (!artDocId) {
            artDocId = docAr.documentId;
          }
        }

        if (!hasEn) {
          console.log(`📝 Seeding article '${art.slug}' in English...`);
          let imageId: any = null;
          const arArticle = existingArts.find((a: any) => a.locale === 'ar');
          if (arArticle) {
            const populatedAr = await strapi.documents(articleUid).findFirst({
              filters: { slug: { $eq: art.slug } },
              locale: 'ar',
              populate: ['image']
            });
            imageId = populatedAr?.image?.id || null;
          }

          if (!imageId) {
            const imgName = `article-${art.slug}.jpg`;
            const imgFile = await downloadAndUploadImage(strapi, art.imageUrl, imgName);
            imageId = imgFile ? imgFile.id : null;
          }

          await strapi.documents(articleUid).update({
            documentId: artDocId,
            locale: 'en',
            data: {
              title: art.en.title,
              slug: art.slug,
              description: art.en.description,
              content: art.en.content,
              image: imageId,
              category: catMap[art.categorySlug] || null,
              author: authorDocId || null
            },
            status: 'published'
          });
        }
      }
    } catch (e) {
      console.error('❌ Error seeding articles:', e);
    }

    // 5. Seed Wajh Gallery Images
    const galleryUid = 'api::gallery-image.gallery-image';
    const galleryImages = [
      {
        url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
        caption_ar: 'مؤتمر صحفي لإطلاق مبادرة الاتصال الرقمي الجديدة',
        caption_en: 'Press conference launching the new digital communication initiative',
        order: 1
      },
      {
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
        caption_ar: 'ورشة عمل استراتيجية لبناء الهوية المؤسسية',
        caption_en: 'Strategic workshop for building corporate identity',
        order: 2
      },
      {
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
        caption_ar: 'القمة السنوية للعلاقات العامة والتأثير الإعلامي',
        caption_en: 'Annual Public Relations and Media Influence Summit',
        order: 3
      },
      {
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
        caption_ar: 'تحليل البيانات وقياس أثر الحملات الاتصالية',
        caption_en: 'Data analytics and measuring the impact of communication campaigns',
        order: 4
      },
      {
        url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800',
        caption_ar: 'تغطية إعلامية مباشرة ولقاءات تلفزيونية حصرية',
        caption_en: 'Live media coverage and exclusive television interviews',
        order: 5
      },
      {
        url: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&q=80&w=800',
        caption_ar: 'اجتماع فريق العلاقات العامة لتطوير خطة إدارة الأزمات',
        caption_en: 'PR team meeting to develop crisis management plans',
        order: 6
      }
    ];

    try {
      for (const img of galleryImages) {
        const existing = await strapi.db.query(galleryUid).findMany({
          where: { caption_en: img.caption_en }
        });

        if (existing.length === 0) {
          console.log(`🖼️ Seeding gallery image: ${img.caption_en}`);
          const imgName = `gallery-${img.order}.jpg`;
          const uploaded = await downloadAndUploadImage(strapi, img.url, imgName);
          if (uploaded) {
            await strapi.documents(galleryUid).create({
              data: {
                image: uploaded.id,
                caption_ar: img.caption_ar,
                caption_en: img.caption_en,
                order: img.order
              },
              status: 'published'
            });
          }
        }
      }
    } catch (e) {
      console.error('❌ Error seeding gallery images:', e);
    }

    console.log('📢 Wajh PR backend bootstrap complete!');
  },
};
