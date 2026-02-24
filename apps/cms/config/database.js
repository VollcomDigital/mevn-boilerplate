module.exports = ({ env }) => {
  const client = env("DATABASE_CLIENT", "sqlite");
  const nodeEnvironment = env("NODE_ENV", "development");

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
  const normalizedDatabaseUrl = databaseUrl?.trim();

  if (nodeEnvironment === "production") {
    if (normalizedDatabaseUrl === undefined || normalizedDatabaseUrl === "") {
      throw new Error("DATABASE_URL must be configured in production when using Postgres.");
    }

    if (normalizedDatabaseUrl.includes("postgres:postgres@")) {
      throw new Error("DATABASE_URL contains default credentials and must be replaced.");
    }
  }

  return {
    connection: {
      client: "postgres",
      connection: {
        connectionString: normalizedDatabaseUrl ?? "postgres://localhost:5432/strapi",
        ssl: env("DATABASE_SSL", "false") === "true"
      }
    }
  };
};
