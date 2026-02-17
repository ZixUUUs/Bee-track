const express = require("express");
const router = express.Router();
const verifyShopifyHMAC = require("../middleware/verifyShopifyHMAC");

router.post(
  "/orders",
  express.raw({ type: "application/json" }),
  verifyShopifyHMAC,
  (req, res) => {
    const webhookId = req.get("X-Shopify-Webhook-Id");
    const topic = req.get("X-Shopify-Topic");
    const shopDomain = req.get("X-Shopify-Shop-Domain");

    res.sendStatus(200);

    setImmediate(() => {
      try {
        const order = JSON.parse(req.body.toString("utf8"));
        console.log("[WEBHOOK]", {
          webhookId,
          topic,
          shopDomain,
          orderId: order.id,
          name: order.name,
        });
      } catch (e) {
        console.error("[WEBHOOK] JSON parse error", {
          webhookId,
          topic,
          shopDomain,
          err: e?.message,
        });
      }
    });
  },
);

module.exports = router;
