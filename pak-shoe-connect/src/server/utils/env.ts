export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === "test") {
      switch (name) {
        case "EASYPAISA_STORE_ID":
          return "EP_SHERSHA_STORE_10029";
        case "EASYPAISA_HASH_KEY":
          return "ep_secret_b2b_hash_key_9921";
        case "JAZZCASH_MERCHANT_ID":
          return "JC_SHERSHA_MCH_88192";
        case "JAZZCASH_SALT":
          return "jc_secure_salt_b2b_wholesale_2026";
        case "PAYFAST_MERCHANT_ID":
          return "PF_SHERSHA_CORP_10928";
        case "PAYFAST_SECURED_KEY":
          return "pf_secure_key_b2b_wholesale_1link";
        default:
          return `mock_test_value_for_${name.toLowerCase()}`;
      }
    }
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
