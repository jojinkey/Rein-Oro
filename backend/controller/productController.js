import {
 deleteFromFirestore,
 getFirestoreDocument,
 mirrorToFirestore,
 queryFirestoreCollection,
} from "../util/firestore.js";

const PRODUCT_COLLECTION = "products";
const PRODUCT_FIELDS = [
 "id",
 "name",
 "flavor",
 "title",
 "price",
 "image",
 "description",
 "weight",
 "benefits",
 "benefits_image",
 "ingredients",
 "specs",
 "nutrition",
];

function cleanText(value) {
 return value === undefined || value === null ? "" : String(value).trim();
}

function parseJsonish(value, fallback) {
 if (value === undefined || value === null || value === "") return fallback;
 if (typeof value !== "string") return value;
 try {
  return JSON.parse(value);
 } catch {
  return value;
 }
}

function toArray(value, fallback = []) {
 const parsed = parseJsonish(value, fallback);
 if (Array.isArray(parsed)) return parsed;
 if (typeof parsed === "string") {
  return parsed
   .split(/[\n,]/)
   .map((item) => item.trim())
   .filter(Boolean);
 }
 return fallback;
}

function toObject(value, fallback = {}) {
 const parsed = parseJsonish(value, fallback);
 return parsed && typeof parsed === "object" && !Array.isArray(parsed)
  ? parsed
  : fallback;
}

function toNumber(value, fallback = 0) {
 const numeric = Number(value);
 return Number.isFinite(numeric) ? numeric : fallback;
}

function toBoolean(value) {
 return value === true || value === "true" || value === 1 || value === "1";
}

function normalizeVariant(variant, defaults = {}) {
 const weight = cleanText(variant?.weight || defaults.weight);
 if (!weight) return null;
 const salePrice = toNumber(
  variant?.sale_price ?? variant?.salePrice ?? variant?.price,
  toNumber(defaults.sale_price ?? defaults.price, 0),
 );
 const mrp = toNumber(variant?.mrp, toNumber(defaults.mrp, salePrice));
 return {
  weight,
  mrp,
  sale_price: salePrice,
  price: salePrice,
  stock: Math.max(0, Math.floor(toNumber(variant?.stock, defaults.stock ?? 0))),
  active: variant?.active === undefined ? true : toBoolean(variant.active),
 };
}

function normalizeVariants(body, base) {
 const incoming = toArray(body.variants, []);
 const variants = incoming
  .map((variant) => normalizeVariant(variant, base))
  .filter(Boolean);
 if (variants.length) return variants;
 const fallback = normalizeVariant(
  {
   weight: body.weight,
   mrp: body.mrp,
   sale_price: body.sale_price ?? body.price,
   stock: body.stock,
  },
  base,
 );
 return fallback ? [fallback] : [];
}

function slugify(value) {
 return cleanText(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
}

function normalizeProductPayload(body, keepId = true) {
 const salePrice = toNumber(body.sale_price ?? body.salePrice ?? body.price, 0);
 const mrp = toNumber(body.mrp, salePrice);
 const stock = Math.max(0, Math.floor(toNumber(body.stock, 0)));
 const base = {
  price: salePrice,
  sale_price: salePrice,
  mrp,
  stock,
  weight: cleanText(body.weight),
 };
 const variants = normalizeVariants(body, base);
 const primaryVariant = variants[0] || {};
 const images = [
  cleanText(body.image),
  ...toArray(body.images, []).map(cleanText),
 ].filter(Boolean);
 return {
  id: keepId ? cleanText(body.id) : undefined,
  name: cleanText(body.name),
  flavor: cleanText(body.flavor),
  title: cleanText(body.title),
  price: salePrice,
  mrp,
  sale_price: salePrice,
  stock,
  featured: toBoolean(body.featured),
  slug: cleanText(body.slug) || slugify(body.title || body.name || body.id),
  image: cleanText(body.image),
  images,
  description: cleanText(body.description),
  weight: cleanText(body.weight) || cleanText(primaryVariant.weight),
  variants,
  benefits: toArray(body.benefits, []),
  benefits_image: cleanText(body.benefits_image),
  ingredients: toArray(body.ingredients, []),
  specs: toObject(body.specs, {}),
  nutrition: toObject(body.nutrition, {}),
  seo_title: cleanText(body.seo_title || body.seoTitle),
  meta_description: cleanText(body.meta_description || body.metaDescription),
 };
}

function validateProductPayload(product, isUpdate = false) {
 const errors = [];
 if (!isUpdate && !product.id) {
  errors.push("id is required");
 }
 for (const field of PRODUCT_FIELDS) {
  if (field === "id" && isUpdate) continue;
  if (
   product[field] === undefined ||
   product[field] === null ||
   product[field] === "" ||
   (Array.isArray(product[field]) && product[field].length === 0) ||
   (typeof product[field] === "object" &&
    !Array.isArray(product[field]) &&
    Object.keys(product[field]).length === 0)
  ) {
   errors.push(`${field} is required`);
  }
 }
 if (Number.isNaN(product.price) || product.price < 0) {
  errors.push("price must be a valid non-negative number");
 }
 return errors;
}

export async function getProducts(req, res) {
 try {
  const products = await queryFirestoreCollection(PRODUCT_COLLECTION, {
   orderBy: [["title", "asc"]],
  });
  res.json(products);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function getProductById(req, res) {
 const productId = String(req.params.id || "").trim();
 if (!productId) {
  return res.status(400).json({ error: "Product id is required" });
 }
 try {
  const product = await getFirestoreDocument(PRODUCT_COLLECTION, productId);
  if (!product) {
   return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function addProduct(req, res) {
 try {
  const payload = normalizeProductPayload(req.body);
  const errors = validateProductPayload(payload);
  if (errors.length) {
   return res.status(400).json({ error: "Validation failed", details: errors });
  }
  const existing = await getFirestoreDocument(PRODUCT_COLLECTION, payload.id);
  if (existing) {
   return res.status(409).json({ error: "Product already exists" });
  }
  await mirrorToFirestore(PRODUCT_COLLECTION, payload.id, payload);
  res.status(201).json({ success: true, product: payload });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function updateProduct(req, res) {
 const productId = String(req.params.id || "").trim();
 if (!productId) {
  return res.status(400).json({ error: "Product id is required" });
 }
 try {
  const existing = await getFirestoreDocument(PRODUCT_COLLECTION, productId);
  if (!existing) {
   return res.status(404).json({ error: "Product not found" });
  }
  const payload = normalizeProductPayload({ ...existing, ...req.body }, false);
  payload.id = productId;
  const errors = validateProductPayload(payload, true);
  if (errors.length) {
   return res.status(400).json({ error: "Validation failed", details: errors });
  }
  await mirrorToFirestore(PRODUCT_COLLECTION, productId, payload);
  res.json({ success: true, product: payload });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function deleteProduct(req, res) {
 const productId = String(req.params.id || "").trim();
 if (!productId) {
  return res.status(400).json({ error: "Product id is required" });
 }
 try {
  const existing = await getFirestoreDocument(PRODUCT_COLLECTION, productId);
  if (!existing) {
   return res.status(404).json({ error: "Product not found" });
  }
  await deleteFromFirestore(PRODUCT_COLLECTION, productId);
  res.json({ success: true });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
