// models/orderModel.js
const db = require("../src/config/db");

/**
 * @param {Object} ORDER - order summary
 * @returns {Promise<{ inserted: boolean }>}
 */
async function insertOrder(ORDER) {
  if (!ORDER || !ORDER.shopify_order_id) {
    throw new Error("insertOrder: shopify_order_id is required");
  }

  const sql = `
    INSERT INTO orders (
      shopify_order_id,
      order_name,
      created_at,
      customer_name,
      phone,
      address,
      city,
      wilaya,
      total_price,
      currency,
      line_items_count,
      delivery_method_title,
      delivery_type,
      delivery_price,
      webhook_id,
      topic,
      shop_domain
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
    )
    ON CONFLICT (shopify_order_id) DO NOTHING
    RETURNING id;
  `;

  const params = [
    ORDER.shopify_order_id,
    ORDER.order_name ?? null,
    ORDER.created_at ?? null,
    ORDER.customer_name ?? null,
    ORDER.phone ?? null,
    ORDER.address ?? null,
    ORDER.city ?? null,
    ORDER.wilaya ?? null,
    ORDER.total_price ?? null,
    ORDER.currency ?? null,
    Number.isFinite(ORDER.line_items_count)
      ? ORDER.line_items_count
      : (ORDER.line_items_count ?? 0),
    ORDER.delivery_method_title ?? null,
    ORDER.delivery_type ?? null,
    ORDER.delivery_price ?? null,
    ORDER.webhook_id ?? null,
    ORDER.topic ?? null,
    ORDER.shop_domain ?? null,
  ];

  const res = await db.query(sql, params);

  return { inserted: res.rowCount === 1 };
}

async function findByShopifyOrderId(shopifyOrderId) {
  const res = await db.query(
    `SELECT * FROM orders WHERE shopify_order_id = $1 LIMIT 1`,
    [shopifyOrderId],
  );
  return res.rows[0] || null;
}

async function countOrders() {
  const res = await db.query(`SELECT count(*)::int AS c FROM orders`);
  return res.rows[0].c;
}

module.exports = {
  insertOrder,
  findByShopifyOrderId,
  countOrders,
};
