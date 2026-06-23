import test from "node:test";
import assert from "node:assert/strict";
import { resolveRazorpayCredentials } from "../util/razorpayCredentials.js";

test("uses live Razorpay credentials from env as configured", async () => {
 const credentials = await resolveRazorpayCredentials({
  env: {
   RAZORPAY_KEY_ID: "rzp_live_liveKey",
   RAZORPAY_KEY_SECRET: "liveSecret",
  },
 });

 assert.equal(credentials.keyId, "rzp_live_liveKey");
 assert.equal(credentials.keySecret, "liveSecret");
 assert.equal(credentials.isConfigured, true);
 assert.equal(credentials.source, "env");
});

test("uses gateway settings when env credentials are not present", async () => {
 const settings = {
  razorpay_key_id: "rzp_live_databaseKey",
  razorpay_key_secret: "databaseSecret",
 };
 const credentials = await resolveRazorpayCredentials({
  env: {},
  getGatewaySetting: async (key) => settings[key],
 });

 assert.equal(credentials.keyId, "rzp_live_databaseKey");
 assert.equal(credentials.keySecret, "databaseSecret");
 assert.equal(credentials.isConfigured, true);
 assert.equal(credentials.source, "database");
});

test("falls back to mock mode only when credentials are missing", async () => {
 const credentials = await resolveRazorpayCredentials({
  env: {},
  getGatewaySetting: async () => "",
 });

 assert.equal(credentials.keyId, "");
 assert.equal(credentials.keySecret, "");
 assert.equal(credentials.isConfigured, false);
 assert.equal(credentials.source, "none");
});
