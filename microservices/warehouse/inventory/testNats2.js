const { connect } = require("nats");
(async () => {
  try {
    const nc = await connect({ servers: "nats://172.25.0.4:4222" });
    console.log("Connesso a NATS!");
    await nc.close();
  } catch (err) {
    console.error("Errore di connessione:", err);
  }
})();

