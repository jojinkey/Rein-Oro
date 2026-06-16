import { seedDatabase } from "../util/database.js";
import {
 mirrorToFirestore,
 queryFirestoreCollection,
 deleteFromFirestore,
} from "../util/firestore.js";

function makeId(prefix = "") {
 return (
  prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
 );
}

export async function getCmsContent(req, res) {
 try {
  const rows = await queryFirestoreCollection("cms_content");
  const formatted = {};
  for (const row of rows) {
   if (!formatted[row.page_name]) formatted[row.page_name] = {};
   formatted[row.page_name][row.selector] = row.content_value;
  }
  res.json(formatted);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function upsertCmsContent(req, res) {
 const { page_name, selector, content_value } = req.body;
 try {
  const id = `${page_name}::${selector}`;
  await mirrorToFirestore("cms_content", id, {
   page_name,
   selector,
   content_value,
  });
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

export async function getCmsStyles(req, res) {
 try {
  const rows = await queryFirestoreCollection("cms_styles");
  const styles = {};
  for (const row of rows) styles[row.key] = row.value;
  res.json(styles);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function upsertCmsStyles(req, res) {
 const styles = req.body;
 try {
  for (const [key, value] of Object.entries(styles)) {
   await mirrorToFirestore("cms_styles", key, { key, value });
  }
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

export async function factoryReset(req, res) {
 try {
  // Remove documents from a set of collections then seed defaults
  const collections = [
   "products",
   "cms_content",
   "cms_styles",
   "categories",
   "banners",
   "media",
   "testimonials",
   "blog",
   "faqs",
   "enquiries",
   "coupons",
   "newsletter",
   "seo_settings",
   "payment_settings",
   "shipping_settings",
   "gateway_settings",
  ];
  for (const c of collections) {
   const rows = await queryFirestoreCollection(c);
   for (const r of rows) {
    try {
     await deleteFromFirestore(c, r.id);
    } catch (e) {}
   }
  }
  await seedDatabase();
  res.json({ success: true });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

// Categories
export async function getCategories(req, res) {
 try {
  const rows = await queryFirestoreCollection("categories");
  res.json(rows);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
export async function addCategory(req, res) {
 const { name, description, image } = req.body;
 try {
  const id = makeId("cat_");
  await mirrorToFirestore("categories", id, { id, name, description, image });
  res.json({ success: true, id });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function updateCategory(req, res) {
 const { id } = req.params;
 const { name, description, image } = req.body;
 try {
  await mirrorToFirestore("categories", id, { id, name, description, image });
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function deleteCategory(req, res) {
 const { id } = req.params;
 try {
  await deleteFromFirestore("categories", id);
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

// Banners
export async function getBanners(req, res) {
 try {
  const rows = await queryFirestoreCollection("banners");
  res.json(rows);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
export async function addBanner(req, res) {
 const { title, subtitle, image, link } = req.body;
 try {
  const id = makeId("bn_");
  await mirrorToFirestore("banners", id, { id, title, subtitle, image, link });
  res.json({ success: true, id });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function updateBanner(req, res) {
 const { id } = req.params;
 const { title, subtitle, image, link } = req.body;
 try {
  await mirrorToFirestore("banners", id, { id, title, subtitle, image, link });
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function deleteBanner(req, res) {
 const { id } = req.params;
 try {
  await deleteFromFirestore("banners", id);
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

// Media
export async function getMedia(req, res) {
 try {
  const rows = await queryFirestoreCollection("media");
  res.json(rows);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
export async function addMedia(req, res) {
 const { name, url } = req.body;
 try {
  const id = makeId("med_");
  await mirrorToFirestore("media", id, { id, name, url });
  res.json({ success: true, id });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function deleteMedia(req, res) {
 const { id } = req.params;
 try {
  await deleteFromFirestore("media", id);
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

// Testimonials
export async function getTestimonials(req, res) {
 try {
  const rows = await queryFirestoreCollection("testimonials");
  res.json(rows);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
export async function addTestimonial(req, res) {
 const { name, quote, rating, avatar } = req.body;
 try {
  const id = makeId("tm_");
  await mirrorToFirestore("testimonials", id, {
   id,
   name,
   quote,
   rating: parseInt(rating || 5),
   avatar,
  });
  res.json({ success: true, id });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function updateTestimonial(req, res) {
 const { id } = req.params;
 const { name, quote, rating, avatar } = req.body;
 try {
  await mirrorToFirestore("testimonials", id, {
   id,
   name,
   quote,
   rating: parseInt(rating || 5),
   avatar,
  });
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function deleteTestimonial(req, res) {
 const { id } = req.params;
 try {
  await deleteFromFirestore("testimonials", id);
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

// Blog
export async function getBlog(req, res) {
 try {
  const rows = await queryFirestoreCollection("blog", {
   orderBy: [["date", "desc"]],
  });
  res.json(rows);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
export async function addBlog(req, res) {
 const { title, content, image } = req.body;
 try {
  const id = makeId("bl_");
  await mirrorToFirestore("blog", id, {
   id,
   title,
   content,
   image,
   date: new Date().toISOString(),
  });
  res.json({ success: true, id });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function updateBlog(req, res) {
 const { id } = req.params;
 const { title, content, image } = req.body;
 try {
  await mirrorToFirestore("blog", id, { id, title, content, image });
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function deleteBlog(req, res) {
 const { id } = req.params;
 try {
  await deleteFromFirestore("blog", id);
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

// FAQs
export async function getFaqs(req, res) {
 try {
  const rows = await queryFirestoreCollection("faqs");
  res.json(rows);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
export async function addFaq(req, res) {
 const { question, answer } = req.body;
 try {
  const id = makeId("faq_");
  await mirrorToFirestore("faqs", id, { id, question, answer });
  res.json({ success: true, id });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function updateFaq(req, res) {
 const { id } = req.params;
 const { question, answer } = req.body;
 try {
  await mirrorToFirestore("faqs", id, { id, question, answer });
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function deleteFaq(req, res) {
 const { id } = req.params;
 try {
  await deleteFromFirestore("faqs", id);
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

// Enquiries
export async function getEnquiries(req, res) {
 try {
  const rows = await queryFirestoreCollection("enquiries", {
   orderBy: [["date", "desc"]],
  });
  res.json(rows);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
export async function addEnquiry(req, res) {
 const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "wecare.reinoro@gmail.com";
 const name = String(req.body.name || "").trim();
 const email = String(req.body.email || "").trim().toLowerCase();
 const phone = String(req.body.phone || "").trim();
 const subject = String(req.body.subject || "").trim();
 const message = String(req.body.message || "").trim();
 const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 try {
  if (name.length < 2) {
   return res.status(400).json({ error: "Name is required" });
  }
  if (!emailPattern.test(email)) {
   return res.status(400).json({ error: "Valid email is required" });
  }
  if (subject.length < 3) {
   return res.status(400).json({ error: "Subject is required" });
  }
  if (message.length < 10) {
   return res.status(400).json({ error: "Message must be at least 10 characters" });
  }

  const id = makeId("enq_");
  await mirrorToFirestore("enquiries", id, {
   id,
   name,
   email,
   phone,
   subject,
   message,
   recipient_email: SUPPORT_EMAIL,
   source: req.body.source || "website_contact_form",
   date: new Date().toISOString(),
   status: "New",
  });
  res.json({ success: true, id });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function updateEnquiryStatus(req, res) {
 const { id } = req.params;
 const { status } = req.body;
 try {
  const doc = await queryFirestoreCollection("enquiries", {
   where: [["id", "==", id]],
  });
  await mirrorToFirestore("enquiries", id, { ...(doc[0] || {}), status });
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
export async function deleteEnquiry(req, res) {
 const { id } = req.params;
 try {
  await deleteFromFirestore("enquiries", id);
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

// Coupons are handled in couponController

// Newsletter
export async function getNewsletter(req, res) {
 try {
  const rows = await queryFirestoreCollection("newsletter", {
   orderBy: [["subscribed_at", "desc"]],
  });
  res.json(rows);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
export async function addNewsletter(req, res) {
 const { email } = req.body;
 try {
  const id = makeId("nw_");
  await mirrorToFirestore("newsletter", id, {
   id,
   email: email.trim(),
   subscribed_at: new Date().toISOString(),
  });
  res.json({ success: true, id });
 } catch (err) {
  res.status(400).json({ error: "Already subscribed" });
 }
}
export async function deleteNewsletter(req, res) {
 const { id } = req.params;
 try {
  await deleteFromFirestore("newsletter", id);
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
