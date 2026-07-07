import test from "node:test";
import assert from "node:assert/strict";
import {
 buildShiprocketOrderPayload,
 clearShiprocketTokenCache,
 getShiprocketStatus,
} from "../util/shiprocket.js";

const ENV_KEYS = [
 "SHIPROCKET_EMAIL",
 "SHIPROCKET_PASSWORD",
 "SHIPROCKET_PICKUP_LOCATION",
 "SHIPROCKET_PACKAGE_LENGTH_CM",
 "SHIPROCKET_PACKAGE_BREADTH_CM",
 "SHIPROCKET_PACKAGE_HEIGHT_CM",
 "SHIPROCKET_PACKAGE_WEIGHT_KG",
 "SHIPROCKET_CHANNEL_ID",
];

function withEnv(values, fn) {
 const previous = {};
 for (const key of ENV_KEYS) {
  previous[key] = process.env[key];
  delete process.env[key];
 }
 Object.assign(process.env, values);
 clearShiprocketTokenCache();
 try {
  return fn();
 } finally {
  for (const key of ENV_KEYS) {
   if (previous[key] === undefined) {
    delete process.env[key];
   } else {
    process.env[key] = previous[key];
   }
  }
  clearShiprocketTokenCache();
 }
}

test("Shiprocket status reports configuration without leaking credentials", () => {
 withEnv(
  {
   SHIPROCKET_EMAIL: "api@example.com",
   SHIPROCKET_PASSWORD: "super-secret",
   SHIPROCKET_PICKUP_LOCATION: "Primary Warehouse",
  },
  () => {
   const status = getShiprocketStatus();
   assert.equal(status.configured, true);
   assert.equal(status.emailConfigured, true);
   assert.equal(status.pickupLocationConfigured, true);
   assert.equal("email" in status, false);
   assert.equal("password" in status, false);
  },
 );
});

test("buildShiprocketOrderPayload converts a Rein Oro order to Shiprocket fields", () => {
 withEnv(
  {
   SHIPROCKET_EMAIL: "api@example.com",
   SHIPROCKET_PASSWORD: "super-secret",
   SHIPROCKET_PICKUP_LOCATION: "Primary Warehouse",
   SHIPROCKET_PACKAGE_LENGTH_CM: "12",
   SHIPROCKET_PACKAGE_BREADTH_CM: "10",
   SHIPROCKET_PACKAGE_HEIGHT_CM: "8",
  },
  () => {
   const payload = buildShiprocketOrderPayload({
    id: "RO-123456",
    date: "06 Jul 2026 at 12:30",
    user_email: "buyer@example.com",
    customer_email: "buyer@example.com",
    customer_phone: "+91 98765 43210",
    subtotal: 598,
    discount: 25,
    shipping: 99,
    payment_method: "Paid via Razorpay Online",
    shipping_address: {
     fullName: "Asha Sharma",
     phone: "+91 98765 43210",
     street: "221, Main Road",
     apartment: "Floor 2",
     city: "Delhi",
     state: "Delhi",
     pincode: "110001",
     country: "India",
    },
    items: [
     {
      id: "makhana-250",
      name: "Premium Makhana",
      weight: "250g",
      qty: 2,
      price: 299,
     },
    ],
   });

   assert.equal(payload.order_id, "RO-123456");
   assert.equal(payload.pickup_location, "Primary Warehouse");
   assert.equal(payload.billing_customer_name, "Asha");
   assert.equal(payload.billing_last_name, "Sharma");
   assert.equal(payload.billing_phone, "9876543210");
   assert.equal(payload.payment_method, "Prepaid");
   assert.equal(payload.order_items[0].sku, "makhana-250");
   assert.equal(payload.order_items[0].units, 2);
   assert.equal(payload.sub_total, 598);
   assert.equal(payload.total_discount, 25);
   assert.equal(payload.weight, 0.5);
   assert.equal(payload.length, 12);
   assert.equal(payload.breadth, 10);
   assert.equal(payload.height, 8);
  },
 );
});
