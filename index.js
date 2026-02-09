const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!"); // Send a response back to the client
});

app.post("/new-order", async (req, res) => {
  try {
    const order = req.body;
    console.log("Commande reçue de Shopify Flow :", order);

    // Préparer les données pour ton API livraison
    const payload = {
      customer_name: order.customer_name,
      address: order.address,
      city: order.city,
      wilaya: order.wilaya,
      payment_method: order.payment_method,
      items: order.items,
    };

    // Appel à ton API livraison
    const response = await fetch("https://ton-api-livraison.com/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer TON_API_KEY",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Réponse API livraison :", data);

    res.status(200).send("OK");
  } catch (error) {
    console.error("Erreur traitement commande :", error);
    res.status(500).send("Erreur serveur");
  }
});

app.listen(3000, () =>
  console.log("Serveur Flow ready sur http://localhost:3000"),
);
