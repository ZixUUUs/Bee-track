// src/controllers/webhookController.js
// Objectif MVP: ACK 200 rapide, puis parse + store + logs.

const { isDuplicateWebhook, addOrder } = require("../src/store/storeOrder");

function buildOrderSummary(order, meta = {}) {
  const shipping = order.shipping_address || {};
  const customer = order.customer || {};
  const shippingLine = Array.isArray(order.shipping_lines)
    ? order.shipping_lines[0]
    : null;

  const shippingTitle = shippingLine?.title || null;

  const shippingPrice =
    shippingLine?.price ??
    order.total_shipping_price_set?.shop_money?.amount ??
    null;

  let wilayaFromMethod = null;
  let deliveryType = null;

  if (shippingTitle) {
    const m = shippingTitle.match(/^(.+?)\s*\((.+)\)\s*$/);
    if (m) {
      wilayaFromMethod = m[1].trim();
      const inside = m[2].trim().toLowerCase();
      if (inside.includes("bureau")) deliveryType = "bureau";
      if (inside.includes("domicile")) deliveryType = "domicile";
    } else {
      wilayaFromMethod = shippingTitle.trim();
    }
  }

  const customerName =
    shipping.name ||
    [customer.first_name, customer.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    order.customer_name ||
    null;

  const phone = shipping.phone || customer.phone || order.phone || null;

  const address =
    [shipping.address1, shipping.address2].filter(Boolean).join(", ") || null;

  const wilaya = shipping.province || shipping.city || null;

  return {
    shopify_order_id: order.id,
    order_name: order.name || null,
    created_at: order.created_at || null,

    customer_name: customerName,
    phone,
    address,
    city: shipping.city || null,
    wilaya,

    total_price: order.total_price || null,
    currency: order.currency || null,
    line_items_count: Array.isArray(order.line_items)
      ? order.line_items.length
      : 0,

    webhook_id: meta.webhookId || null,
    topic: meta.topic || null,
    shop_domain: meta.shopDomain || null,
    received_at: new Date().toISOString(),

    delivery_method_title: shippingTitle,
    delivery_type: deliveryType,
    delivery_price: shippingPrice,

    // wilaya final: méthode > adresse
    wilaya: wilayaFromMethod || wilaya,
  };
}

function handleOrderWebhook(req, res) {
  // Headers utiles Shopify
  const webhookId = req.get("X-Shopify-Webhook-Id");
  const topic = req.get("X-Shopify-Topic");
  const shopDomain = req.get("X-Shopify-Shop-Domain");

  // 1) ACK FAST (HMAC a déjà été vérifié par middleware)
  res.sendStatus(200);

  // 2) Traitement après ACK
  setImmediate(() => {
    try {
      if (webhookId && isDuplicateWebhook(webhookId)) {
        console.log("[WEBHOOK] duplicate ignored", {
          webhookId,
          topic,
          shopDomain,
        });
        return;
      }
      const raw = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(String(req.body || ""), "utf8");
      const order = JSON.parse(raw.toString("utf8"));

      const summary = buildOrderSummary(order, {
        webhookId,
        topic,
        shopDomain,
      });
      addOrder(summary);

      console.log("[WEBHOOK] stored order", {
        webhookId,
        topic,
        shopDomain,
        orderId: summary.shopify_order_id,
        orderName: summary.order_name,
        orderShipping: order.shipping_lines,
        orderShippingAddress: order.shipping_address,
      });
    } catch (err) {
      console.error("[WEBHOOK] processing error", {
        webhookId,
        topic,
        shopDomain,
        error: err?.message,
      });
    }
  });
}

module.exports = {
  handleOrderWebhook,
};
