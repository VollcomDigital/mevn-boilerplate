import process from "node:process";

/**
 * Validates that critical environment variables are set and not using default placeholder values.
 * 
 * Args:
 *   nodeEnvironment: Current NODE_ENV value.
 * 
 * Raises:
 *   Error if required environment variables are missing or contain unsafe default values.
 * 
 * Time Complexity: O(1)
 */
export function validateEnvironmentSecrets(nodeEnvironment: string): void {
  const errors: string[] = [];

  // CRITICAL: SESSION_SECRET validation
  const sessionSecret = process.env.SESSION_SECRET;
  if (nodeEnvironment === "production") {
    if (sessionSecret === undefined || sessionSecret.trim() === "") {
      errors.push("SESSION_SECRET must be defined in production");
    } else if (sessionSecret.length < 32) {
      errors.push("SESSION_SECRET must be at least 32 characters for cryptographic security");
    } else if (
      sessionSecret.includes("replace") ||
      sessionSecret.includes("change") ||
      sessionSecret.includes("secret") ||
      sessionSecret.includes("example")
    ) {
      errors.push(
        "SESSION_SECRET contains unsafe placeholder text. Generate a secure secret: openssl rand -base64 32"
      );
    }
  }

  // STRAPI secrets validation (if CMS is running in same process or env is shared)
  const strapiAppKeys = process.env.STRAPI_APP_KEYS;
  if (strapiAppKeys !== undefined && strapiAppKeys.includes("changeMe")) {
    errors.push("STRAPI_APP_KEYS contains default 'changeMe' values - generate secure keys");
  }

  const strapiJwtSecret = process.env.STRAPI_JWT_SECRET;
  if (strapiJwtSecret !== undefined && strapiJwtSecret === "changeMe") {
    errors.push("STRAPI_JWT_SECRET is set to default 'changeMe' - generate a secure secret");
  }

  const strapiAdminJwt = process.env.STRAPI_ADMIN_JWT_SECRET;
  if (strapiAdminJwt !== undefined && strapiAdminJwt === "changeMe") {
    errors.push("STRAPI_ADMIN_JWT_SECRET is set to default 'changeMe' - generate a secure secret");
  }

  const strapiApiTokenSalt = process.env.STRAPI_API_TOKEN_SALT;
  if (strapiApiTokenSalt !== undefined && strapiApiTokenSalt === "changeMe") {
    errors.push("STRAPI_API_TOKEN_SALT is set to default 'changeMe' - generate a secure secret");
  }

  const strapiTransferTokenSalt = process.env.STRAPI_TRANSFER_TOKEN_SALT;
  if (strapiTransferTokenSalt !== undefined && strapiTransferTokenSalt === "changeMe") {
    errors.push(
      "STRAPI_TRANSFER_TOKEN_SALT is set to default 'changeMe' - generate a secure secret"
    );
  }

  if (errors.length > 0) {
    const errorMessage = [
      "❌ SECURITY VALIDATION FAILED",
      "",
      ...errors.map((err) => `  • ${err}`),
      "",
      "🔐 Generate secure secrets:",
      "  SESSION_SECRET=$(openssl rand -base64 32)",
      "  STRAPI_JWT_SECRET=$(openssl rand -base64 32)",
      "",
      "🚫 Startup aborted to prevent security vulnerabilities"
    ].join("\n");

    throw new Error(errorMessage);
  }
}
