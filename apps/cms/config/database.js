module.exports = ({ env }) => {
  const client = env("DATABASE_CLIENT", "sqlite");

  if (client === "sqlite") {
    return {
      connection: {
        client: "sqlite",
        connection: {
          filename: env("DATABASE_FILENAME", ".tmp/data.db")
        },
        useNullAsDefault: true
      }
    };
  }

  return {
    connection: {
      client: "postgres",
      connection: {
        connectionString: env("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/strapi"),
        ssl: env("DATABASE_SSL", "false") === "true"
      }
    }
  };
};
