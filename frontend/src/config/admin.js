import { apiUrl } from "./api.js";

// Helper function for JSON fetch with error handling
export async function jsonFetch(path, options) {
 const res = await fetch(apiUrl(path), options);
 const data = await safeParseJson(res);
 return { res, data };
}

// Safe JSON parse utility
function safeParseJson(res) {
 return res
  .clone()
  .json()
  .catch(() => ({}));
}

// --- CATEGORIES ---
export async function fetchCategories() {
 try {
  const { res, data } = await jsonFetch("/api/categories");
  if (!res.ok) throw new Error(data?.error || "Failed to load categories");
  return Array.isArray(data) ? data : [];
 } catch (err) {
  console.error(err);
  return [];
 }
}

export async function addCategory(categoryData) {
 try {
  const { res, data } = await jsonFetch("/api/categories", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(categoryData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to add category");
  return { success: true, id: data.id };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function updateCategory(id, categoryData) {
 try {
  const { res, data } = await jsonFetch(`/api/categories/${id}`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(categoryData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to update category");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function deleteCategory(id) {
 try {
  const { res, data } = await jsonFetch(`/api/categories/${id}`, {
   method: "DELETE",
  });
  if (!res.ok) throw new Error(data?.error || "Failed to delete category");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- BANNERS ---
export async function fetchBanners() {
 try {
  const { res, data } = await jsonFetch("/api/banners");
  if (!res.ok) throw new Error(data?.error || "Failed to load banners");
  return Array.isArray(data) ? data : [];
 } catch (err) {
  console.error(err);
  return [];
 }
}

export async function addBanner(bannerData) {
 try {
  const { res, data } = await jsonFetch("/api/banners", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(bannerData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to add banner");
  return { success: true, id: data.id };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function updateBanner(id, bannerData) {
 try {
  const { res, data } = await jsonFetch(`/api/banners/${id}`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(bannerData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to update banner");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function deleteBanner(id) {
 try {
  const { res, data } = await jsonFetch(`/api/banners/${id}`, {
   method: "DELETE",
  });
  if (!res.ok) throw new Error(data?.error || "Failed to delete banner");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- MEDIA ---
export async function fetchMedia() {
 try {
  const { res, data } = await jsonFetch("/api/media");
  if (!res.ok) throw new Error(data?.error || "Failed to load media");
  return Array.isArray(data) ? data : [];
 } catch (err) {
  console.error(err);
  return [];
 }
}

export async function addMedia(mediaData) {
 try {
  const { res, data } = await jsonFetch("/api/media", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(mediaData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to add media");
  return { success: true, id: data.id };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function deleteMedia(id) {
 try {
  const { res, data } = await jsonFetch(`/api/media/${id}`, {
   method: "DELETE",
  });
  if (!res.ok) throw new Error(data?.error || "Failed to delete media");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- TESTIMONIALS ---
export async function fetchTestimonials() {
 try {
  const { res, data } = await jsonFetch("/api/testimonials");
  if (!res.ok) throw new Error(data?.error || "Failed to load testimonials");
  return Array.isArray(data) ? data : [];
 } catch (err) {
  console.error(err);
  return [];
 }
}

export async function addTestimonial(testimonialData) {
 try {
  const { res, data } = await jsonFetch("/api/testimonials", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(testimonialData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to add testimonial");
  return { success: true, id: data.id };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function updateTestimonial(id, testimonialData) {
 try {
  const { res, data } = await jsonFetch(`/api/testimonials/${id}`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(testimonialData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to update testimonial");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function deleteTestimonial(id) {
 try {
  const { res, data } = await jsonFetch(`/api/testimonials/${id}`, {
   method: "DELETE",
  });
  if (!res.ok) throw new Error(data?.error || "Failed to delete testimonial");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- BLOGS ---
export async function fetchBlogs() {
 try {
  const { res, data } = await jsonFetch("/api/blog");
  if (!res.ok) throw new Error(data?.error || "Failed to load blog posts");
  return Array.isArray(data) ? data : [];
 } catch (err) {
  console.error(err);
  return [];
 }
}

export async function addBlog(blogData) {
 try {
  const { res, data } = await jsonFetch("/api/blog", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(blogData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to add blog post");
  return { success: true, id: data.id };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function updateBlog(id, blogData) {
 try {
  const { res, data } = await jsonFetch(`/api/blog/${id}`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(blogData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to update blog post");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function deleteBlog(id) {
 try {
  const { res, data } = await jsonFetch(`/api/blog/${id}`, {
   method: "DELETE",
  });
  if (!res.ok) throw new Error(data?.error || "Failed to delete blog post");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- FAQs ---
export async function fetchFaqs() {
 try {
  const { res, data } = await jsonFetch("/api/faqs");
  if (!res.ok) throw new Error(data?.error || "Failed to load FAQs");
  return Array.isArray(data) ? data : [];
 } catch (err) {
  console.error(err);
  return [];
 }
}

export async function addFaq(faqData) {
 try {
  const { res, data } = await jsonFetch("/api/faqs", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(faqData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to add FAQ");
  return { success: true, id: data.id };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function updateFaq(id, faqData) {
 try {
  const { res, data } = await jsonFetch(`/api/faqs/${id}`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(faqData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to update FAQ");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function deleteFaq(id) {
 try {
  const { res, data } = await jsonFetch(`/api/faqs/${id}`, {
   method: "DELETE",
  });
  if (!res.ok) throw new Error(data?.error || "Failed to delete FAQ");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- ENQUIRIES ---
export async function fetchEnquiries() {
 try {
  const { res, data } = await jsonFetch("/api/enquiries");
  if (!res.ok) throw new Error(data?.error || "Failed to load enquiries");
  return Array.isArray(data) ? data : [];
 } catch (err) {
  console.error(err);
  return [];
 }
}

export async function updateEnquiryStatus(id, status) {
 try {
  const { res, data } = await jsonFetch(`/api/enquiries/${id}/status`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ status }),
  });
  if (!res.ok)
   throw new Error(data?.error || "Failed to update enquiry status");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function deleteEnquiry(id) {
 try {
  const { res, data } = await jsonFetch(`/api/enquiries/${id}`, {
   method: "DELETE",
  });
  if (!res.ok) throw new Error(data?.error || "Failed to delete enquiry");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- COUPONS ---
export async function fetchCoupons() {
 try {
  const { res, data } = await jsonFetch("/api/coupons");
  if (!res.ok) throw new Error(data?.error || "Failed to load coupons");
  return Array.isArray(data) ? data : [];
 } catch (err) {
  console.error(err);
  return [];
 }
}

export async function addCoupon(couponData) {
 try {
  const { res, data } = await jsonFetch("/api/coupons", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(couponData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to add coupon");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function updateCoupon(code, couponData) {
 try {
  const { res, data } = await jsonFetch(`/api/coupons/${code}`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(couponData),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to update coupon");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function deleteCoupon(code) {
 try {
  const { res, data } = await jsonFetch(`/api/coupons/${code}`, {
   method: "DELETE",
  });
  if (!res.ok) throw new Error(data?.error || "Failed to delete coupon");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- NEWSLETTER ---
export async function fetchNewsletter() {
 try {
  const { res, data } = await jsonFetch("/api/newsletter");
  if (!res.ok) throw new Error(data?.error || "Failed to load newsletter");
  return Array.isArray(data) ? data : [];
 } catch (err) {
  console.error(err);
  return [];
 }
}

export async function deleteNewsletter(id) {
 try {
  const { res, data } = await jsonFetch(`/api/newsletter/${id}`, {
   method: "DELETE",
  });
  if (!res.ok)
   throw new Error(data?.error || "Failed to delete newsletter entry");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- USERS / CUSTOMERS ---
export async function fetchUsers() {
 try {
  const { res, data } = await jsonFetch("/api/users");
  if (!res.ok) throw new Error(data?.error || "Failed to load users");
  return Array.isArray(data) ? data : [];
 } catch (err) {
  console.error(err);
  return [];
 }
}

export async function updateUserRole(id, role) {
 try {
  const { res, data } = await jsonFetch(`/api/users/${id}/role`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(data?.error || "Failed to update user role");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function deleteUser(id) {
 try {
  const { res, data } = await jsonFetch(`/api/users/${id}`, {
   method: "DELETE",
  });
  if (!res.ok) throw new Error(data?.error || "Failed to delete user");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- SETTINGS ---
export async function fetchShippingSettings() {
 try {
  const res = await fetch(apiUrl("/api/settings/shipping"));
  const data = await res.json();
  return data;
 } catch (err) {
  console.error(err);
  return {};
 }
}

export async function saveShippingSettings(settings) {
 try {
  const res = await fetch(apiUrl("/api/settings/shipping"), {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok)
   throw new Error(data?.error || "Failed to save shipping settings");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function fetchGatewaySettings() {
 try {
  const res = await fetch(apiUrl("/api/settings/gateway"));
  const data = await res.json();
  return data;
 } catch (err) {
  console.error(err);
  return {};
 }
}

export async function saveGatewaySettings(settings) {
 try {
  const res = await fetch(apiUrl("/api/settings/gateway"), {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok)
   throw new Error(data?.error || "Failed to save gateway settings");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- DASHBOARD & STATUS ---
export async function fetchOwnerDashboard() {
 try {
  const res = await fetch(apiUrl("/api/owner/dashboard"));
  const data = await res.json();
  return data;
 } catch (err) {
  console.error(err);
  return null;
 }
}

export async function fetchFirestoreStatus() {
 try {
  const res = await fetch(apiUrl("/api/firestore/status"));
  const data = await res.json();
  return data;
 } catch (err) {
  console.error(err);
  return null;
 }
}

// --- CMS CONTENT & STYLES ---
export async function saveCmsContent(page_name, selector, content_value) {
 try {
  const res = await fetch(apiUrl("/api/cms/content"), {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ page_name, selector, content_value }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to save content");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function saveCmsStyles(styles) {
 try {
  const res = await fetch(apiUrl("/api/cms/styles"), {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(styles),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to save styles");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function factoryReset() {
 try {
  const res = await fetch(apiUrl("/api/cms/reset"), {
   method: "POST",
   headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok)
   throw new Error(data?.error || "Failed to perform factory reset");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- PRODUCTS ---
export async function fetchProducts() {
 try {
  const res = await fetch(apiUrl("/api/products"));
  const data = await res.json();
  return Array.isArray(data) ? data : [];
 } catch (err) {
  console.error(err);
  return [];
 }
}

export async function addProduct(productData) {
 try {
  const res = await fetch(apiUrl("/api/products"), {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to add product");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function updateProduct(id, productData) {
 try {
  const res = await fetch(apiUrl(`/api/products/${id}`), {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to update product");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

export async function deleteProduct(id) {
 try {
  const res = await fetch(apiUrl(`/api/products/${id}`), {
   method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to delete product");
  return { success: true };
 } catch (err) {
  console.error(err);
  throw err;
 }
}

// --- ORDERS ---
export async function fetchOrders() {
 try {
  const res = await fetch(apiUrl("/api/orders"));
  const data = await res.json();
  return Array.isArray(data) ? data : [];
 } catch (err) {
  console.error(err);
  return [];
 }
}
