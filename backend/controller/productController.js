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

function normalizeProductPayload(body, keepId = true) {
 return {
  id: keepId ? cleanText(body.id) : undefined,
  name: cleanText(body.name),
  flavor: cleanText(body.flavor),
  title: cleanText(body.title),
  price: Number.isFinite(Number(body.price)) ? Number(body.price) : 0,
  image: cleanText(body.image),
  description: cleanText(body.description),
  weight: cleanText(body.weight),
  benefits:
   typeof body.benefits === "string"
    ? body.benefits.trim()
    : body.benefits != null
      ? JSON.stringify(body.benefits)
      : "",
  benefits_image: cleanText(body.benefits_image),
  ingredients:
   typeof body.ingredients === "string"
    ? body.ingredients.trim()
    : body.ingredients != null
      ? JSON.stringify(body.ingredients)
      : "",
  specs:
   typeof body.specs === "string"
    ? body.specs.trim()
    : body.specs != null
      ? JSON.stringify(body.specs)
      : "",
  nutrition:
   typeof body.nutrition === "string"
    ? body.nutrition.trim()
    : body.nutrition != null
      ? JSON.stringify(body.nutrition)
      : "",
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
   product[field] === ""
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
