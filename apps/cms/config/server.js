const { randomBytes } = require("node:crypto");

function parseAppKeys(rawAppKeys) {
  if (rawAppKeys === undefined) {
    return [];
  }

  return rawAppKeys
    .split(",")
    .map((key) => key.trim())
    .filter((key) => key.length > 0);
}

function createDevelopmentAppKeys() {
  return Array.from({ length: 4 }, () => randomBytes(32).toString("hex"));
}

module.exports = ({ env }) => {
  const nodeEnvironment = env("NODE_ENV", "development");
  const appKeys = parseAppKeys(env("STRAPI_APP_KEYS"));
  const hasPlaceholderKey = appKeys.some((key) => {
    const normalized = key.toLowerCase();
    return normalized.includes("changeme") || normalized.includes("replace");
  });

  if (nodeEnvironment === "production") {
    if (appKeys.length === 0) {
      throw new Error("STRAPI_APP_KEYS must be configured in production.");
    }

    if (hasPlaceholderKey) {
      throw new Error("STRAPI_APP_KEYS contains placeholder values and must be replaced.");
    }
  }

  return {
    host: env("STRAPI_HOST", "0.0.0.0"),
    port: env.int("STRAPI_PORT", 1337),
    app: {
      keys: appKeys.length > 0 ? appKeys : createDevelopmentAppKeys()
    }
  };
};
