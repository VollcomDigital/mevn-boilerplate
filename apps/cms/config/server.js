module.exports = ({ env }) => ({
  host: env("STRAPI_HOST", "0.0.0.0"),
  port: env.int("STRAPI_PORT", 1337),
  app: {
    keys: env("STRAPI_APP_KEYS", "changeMe1,changeMe2,changeMe3,changeMe4").split(",")
  }
});
