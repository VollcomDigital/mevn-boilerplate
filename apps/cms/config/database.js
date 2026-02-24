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

  const databaseUrl = env("DATABASE_URL");
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL must be set when DATABASE_CLIENT=postgres. " +
      "Example: postgres://user:password@host:5432/strapi"
    );
  }

  return {
    connection: {
      client: "postgres",
      connection: {
        connectionString: databaseUrl,
        ssl: env("DATABASE_SSL", "false") === "true"
      }
    }
  };
};
