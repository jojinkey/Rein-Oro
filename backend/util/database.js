import { mirrorToFirestore, queryFirestoreCollection } from "./firestore.js";

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
 const defaultProducts = [
  {
   id: "makhana_cheese_onion",
   name: "Makhana",
   flavor: "Cheese & Onion",
   title: "Makhana Cheese & Onion",
   price: 799,
   image: "images/makhana_cheese_onion.png",
   description: "Crunchy, light and full of flavor.",
   weight: "100g",
   benefits: ["Roasted, Not Fried", "Light & Crunchy"],
   benefits_image: "images/makhana_bowl_love.png",
   ingredients: [{ name: "Makhana", img: "images/ingredient_makhana.png" }],
   specs: { Brand: "Rein Oro" },
   nutrition: { Calories: "385 Kcal" },
  },
 ];

 const categories = [
  {
   id: "makhana",
   name: "Makhana",
   description:
    "Slow-roasted premium lotus seeds flavored with exquisite spices.",
   image: "images/makhana_classic.png",
  },
 ];

 await ensureCollectionSeeded("products", defaultProducts, "id");
 await ensureCollectionSeeded("categories", categories, "id");
}
