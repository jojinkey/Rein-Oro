import { mirrorToFirestore, queryFirestoreCollection } from "./firestore.js";
import { defaultCategories, defaultProducts } from "./defaultCatalog.js";

// This file no longer opens or connects to the local SQLite database.
// The rein_oro.db file remains in the repo for reference but is not used.

async function ensureCollectionSeeded(collectionName, items, idField = "id") {
 const existing = await queryFirestoreCollection(collectionName, { limit: 1 });
 if (existing && existing.length > 0) return;
 for (const item of items) {
  const docId = item[idField]
   ? String(item[idField])
   : String(Date.now()) + Math.random().toString(36).slice(2, 8);
  await mirrorToFirestore(collectionName, docId, item);
 }
}

export async function seedDatabase() {
 await ensureCollectionSeeded("products", defaultProducts, "id");
 await ensureCollectionSeeded("categories", defaultCategories, "id");
}
