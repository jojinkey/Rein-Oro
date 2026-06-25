function cleanValue(value) {
 return typeof value === "string" ? value.trim() : "";
}

export function getEnvValueFrom(env, ...keys) {
 for (const key of keys) {
  const value = cleanValue(env?.[key]);
  if (value) return value;
 }
 return "";
}

export function getEnvValue(...keys) {
 return getEnvValueFrom(process.env, ...keys);
}

export async function resolveRazorpayCredentials({
 env = process.env,
 getGatewaySetting = async () => "",
} = {}) {
 const envKeyId = getEnvValueFrom(
  env,
  "RAZORPAY_KEY_ID",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
 );
 const envKeySecret = getEnvValueFrom(
  env,
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_SECRET",
 );

 const gatewayKeyId = envKeyId
  ? ""
  : cleanValue(await getGatewaySetting("razorpay_key_id"));
 const gatewayKeySecret = envKeySecret
  ? ""
  : cleanValue(await getGatewaySetting("razorpay_key_secret"));

 const keyId = envKeyId || gatewayKeyId;
 const keySecret = envKeySecret || gatewayKeySecret;
 const isConfigured = Boolean(keyId && keySecret);

 let source = "none";
 if (isConfigured) {
  if (envKeyId && envKeySecret) source = "env";
  else if (envKeyId || envKeySecret) source = "mixed";
  else source = "database";
 }

 return {
  keyId,
  keySecret,
  isConfigured,
  source,
 };
}
