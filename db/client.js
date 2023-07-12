const { Pool } = require("pg");

const DEV_MODE = true;
const DATABASE_URL = process.env.DB_URL;
const PASSWORD = process.env.DB_PW;

if (DEV_MODE) {
  const connectionString = "https://localhost:5432/dev-social-stack";

  const client = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });
  module.exports = client;
} else {
  const client = new Pool({
    user: "postgres",
    host: "db.bfmsluauzbdbzaohecte.supabase.co",
    database: DATABASE_URL,
    password: PASSWORD, // key from bit.io database page connect menu
    port: 5432,
    ssl: false,
  });
  module.exports = client;
}
