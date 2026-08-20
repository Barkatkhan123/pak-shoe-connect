import mysql from "mysql2/promise";

const configs = [
  { host: "145.79.26.180", user: "u988207622_Anamon", database: "u988207622_Anamondb" },
  { host: "145.79.26.180", user: "u988207622_anamon", database: "u988207622_anamondb" },
  { host: "sql.anamonofficial.com", user: "u988207622_Anamon", database: "u988207622_Anamondb" },
  { host: "anamonofficial.com", user: "u988207622_Anamon", database: "u988207622_Anamondb" },
];

const password = "Anamon12&1marcH2007";

async function testNative() {
  for (const cfg of configs) {
    console.log(`Testing native connection to ${cfg.host} (user: ${cfg.user}, db: ${cfg.database})...`);
    try {
      const conn = await mysql.createConnection({
        host: cfg.host,
        port: 3306,
        user: cfg.user,
        password: password,
        database: cfg.database,
        connectTimeout: 5000,
      });

      const [rows] = await conn.execute("SELECT 1 as connected, VERSION() as ver, USER() as usr, DATABASE() as db;");
      console.log("🎉 SUCCESSFUL NATIVE MYSQL CONNECTION!");
      console.log("Raw SQL result:", rows);
      await conn.end();
      return cfg;
    } catch (err) {
      console.log(`  ❌ Failed (${cfg.host}): [${err.code}] ${err.message}`);
    }
  }
}

testNative();
