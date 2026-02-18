const { isDuplicateWebhook, addOrder } = require("../src/store/storeOrder");

function buildOrderSummary(order, meta = {}) {
  const shipping = order.shipping_address || {};
  const billing = order.billing_address || {};
  const customer = order.customer || {};
  const defaultAddr = customer.default_address || {};

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
    billing.name ||
    [customer.first_name, customer.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    order.customer_name ||
    null;

  const phone =
    shipping.phone ||
    billing.phone ||
    customer.phone ||
    defaultAddr.phone ||
    order.phone ||
    null;

  const address =
    [shipping.address1, shipping.address2].filter(Boolean).join(", ") ||
    [billing.address1, billing.address2].filter(Boolean).join(", ") ||
    null;

  const city = shipping.city || billing.city || null;

  const wilayaAddress =
    shipping.province ||
    billing.province ||
    shipping.city ||
    billing.city ||
    null;

  const wilayaFinal = wilayaFromMethod || wilayaAddress;

  const totalPrice = Number(order.total_price);
  const deliveryPrice = Number(shippingPrice);

  return {
    shopify_order_id: order.id,
    order_name: order.name || null,
    created_at: order.created_at || null,

    customer_name: customerName,
    phone,
    address,
    city,

    wilaya_method: wilayaFromMethod,
    wilaya_address: wilayaAddress,
    wilaya: wilayaFinal,

    total_price: Number.isFinite(totalPrice) ? totalPrice : null,
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
    delivery_price: Number.isFinite(deliveryPrice) ? deliveryPrice : null,
  };
}

function handleOrderWebhook(req, res) {
  const webhookId = req.get("X-Shopify-Webhook-Id");
  const topic = req.get("X-Shopify-Topic");
  const shopDomain = req.get("X-Shopify-Shop-Domain");

  res.sendStatus(200);

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
        wilaya: summary.wilaya,
        delivery_type: summary.delivery_type,
        phone: summary.phone,
        delivery_price: summary.delivery_price,
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

module.exports = { handleOrderWebhook };
