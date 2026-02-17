// src/routes/webhookRoutes.js
const express = require("express");
const router = express.Router();

const verifyShopifyHMAC = require("../middleware/verifyShopifyHMAC");
const { handleOrderWebhook } = require("../controllers/webhookController");

router.post(
  "/orders",
  express.raw({ type: "application/json" }),
  verifyShopifyHMAC,
  handleOrderWebhook,
);

module.exports = router;
