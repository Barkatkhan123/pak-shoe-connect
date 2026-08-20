import net from "net";

const hosts = ["145.79.26.180", "anamonofficial.com", "srv123.hstgr.io"];
const port = 3306;

async function checkPort(host) {
  return new Promise((resolve) => {
    console.log(`Pinging MySQL port 3306 on ${host}...`);
    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on("connect", () => {
      console.log(`✅ Port 3306 is OPEN on ${host}! Remote MySQL traffic is accepted.`);
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      console.log(`⏱️ Timeout connecting to ${host}:3306. Port might be filtered or remote MySQL not enabled.`);
      socket.destroy();
      resolve(false);
    });

    socket.on("error", (err) => {
      console.log(`❌ Error connecting to ${host}:3306 - ${err.message}`);
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function run() {
  for (const host of hosts) {
    await checkPort(host);
  }
}

run();
