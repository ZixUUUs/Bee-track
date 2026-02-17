// src/store/orderStore.js
// Store en mémoire (MVP) : garde les dernières commandes reçues.
// TRUTH: Sur Vercel/serverless, ce store peut être reset (cold start / scaling).
// Usage: addOrder(summary), listOrders({limit}), getOrderById(id)

const DEFAULT_MAX = 50;
const TTL_MS = 30 * 60 * 1000; // 30 min pour le dedupe webhookId

const orders = []; // newest first
const seenWebhookIds = new Map(); // webhookId -> timestamp

function cleanupSeenWebhookIds() {
  const now = Date.now();
  for (const [id, ts] of seenWebhookIds.entries()) {
    if (now - ts > TTL_MS) seenWebhookIds.delete(id);
  }
}

function isDuplicateWebhook(webhookId) {
  if (!webhookId) return false;
  cleanupSeenWebhookIds();
  if (seenWebhookIds.has(webhookId)) return true;
  seenWebhookIds.set(webhookId, Date.now());
  return false;
}

function addOrder(orderSummary, { max = DEFAULT_MAX } = {}) {
  // orderSummary doit contenir au moins: shopify_order_id (string/number)
  if (!orderSummary || orderSummary.shopify_order_id == null) return;

  const idStr = String(orderSummary.shopify_order_id);

  // Remplacer si déjà présent (ex: retry Shopify)
  const existingIdx = orders.findIndex(
    (o) => String(o.shopify_order_id) === idStr,
  );
  const normalized = {
    ...orderSummary,
    shopify_order_id: idStr,
    received_at: orderSummary.received_at || new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    orders[existingIdx] = normalized;
    // remettre en haut
    const [item] = orders.splice(existingIdx, 1);
    orders.unshift(item);
  } else {
    orders.unshift(normalized);
  }

  if (orders.length > max) orders.length = max;
}

function listOrders({ limit = 50 } = {}) {
  const n = Math.max(0, Math.min(Number(limit) || 50, DEFAULT_MAX));
  return orders.slice(0, n);
}

function getOrderById(shopifyOrderId) {
  if (shopifyOrderId == null) return null;
  const idStr = String(shopifyOrderId);
  return orders.find((o) => String(o.shopify_order_id) === idStr) || null;
}

module.exports = {
  isDuplicateWebhook,
  addOrder,
  listOrders,
  getOrderById,
};
