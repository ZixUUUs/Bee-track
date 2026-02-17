const express = require("express");
const app = express();

const hookRoute = require("./routes/webhookRoutes");
const ordersRoute = require("./routes/orderRoutes");

app.use("/webhook", hookRoute);
app.use(express.json());
app.use("/orders", ordersRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () =>
  console.log("Serveur Flow ready sur http://localhost:3000"),
);
