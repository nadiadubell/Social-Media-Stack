const { Pool } = require("pg");
require('dotenv').config();

const DEV_MODE = false;
const DATABASE_URL = process.env.DB_URL;
const PASSWORD = process.env.DB_PW;
const PROD_PASSWORD = process.env.PROD_DB_PW;

console.log("Password type:", typeof PASSWORD);

if (DEV_MODE) {
  const connectionString = "https://localhost:5432/dev-social-stack";

  const client = new Pool({
    user: 'synergy28',
    password: PASSWORD,
    connectionString: connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });
  module.exports = client;
} else {
  const client = new Pool({
    user: "postgres.bfmsluauzbdbzaohecte",
    host: "aws-0-us-east-1.pooler.supabase.com",
    database: DATABASE_URL,
    // password: PROD_PASSWORD, // key from bit.io database page connect menu
    port: 6543,
    // connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  module.exports = client;
}
