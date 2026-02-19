// scripts/smoke-db.js
require("dotenv").config();

const db = require("../src/config/db");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  try {
    const ping = await db.query(
      "select current_user, current_database(), now() as now;",
    );
    console.log("✅ Connected:", ping.rows[0]);

    const tablesRes = await db.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by table_name;
    `);
    const tableNames = tablesRes.rows.map((r) => r.table_name);
    console.log("Tables in public:", tableNames);

    assert(
      tableNames.includes("webhook_events"),
      "Missing table: webhook_events",
    );
    assert(tableNames.includes("orders"), "Missing table: orders");
    console.log("✅ Tables exist");

    // 3) Test idempotency webhook_events (webhook_id unique + ON CONFLICT DO NOTHING)
    const webhookId = "smoke-webhook-123";
    await db.query(
      `insert into webhook_events (webhook_id, topic, shop_domain)
       values ($1, $2, $3)
       on conflict (webhook_id) do nothing`,
      [webhookId, "orders/create", "smoke.myshopify.com"],
    );

    await db.query(
      `insert into webhook_events (webhook_id, topic, shop_domain)
       values ($1, $2, $3)
       on conflict (webhook_id) do nothing`,
      [webhookId, "orders/create", "smoke.myshopify.com"],
    );

    const whCountRes = await db.query(
      `select count(*)::int as c from webhook_events where webhook_id = $1`,
      [webhookId],
    );
    const whCount = whCountRes.rows[0].c;
    console.log("webhook_events count for same webhook_id:", whCount);
    assert(
      whCount === 1,
      "Idempotency failed for webhook_events (expected count=1)",
    );
    console.log("✅ webhook_events idempotency OK");

    // 4) Test idempotency orders (shopify_order_id unique + ON CONFLICT DO NOTHING)
    const shopifyOrderId = "smoke-order-999";
    const nowIso = new Date().toISOString();

    await db.query(
      `insert into orders (
        shopify_order_id,
        order_name,
        created_at_shopify,
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
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      )
      on conflict (shopify_order_id) do nothing`,
      [
        shopifyOrderId,
        "#SMOKE-999",
        nowIso,
        "Smoke Tester",
        "+213000000000",
        "Rue Smoke 1",
        "Alger",
        "Alger",
        1234.56,
        "DZD",
        2,
        "Alger (À domicile)",
        "domicile",
        400,
        webhookId,
        "orders/create",
        "smoke.myshopify.com",
      ],
    );

    // 4b) insert identique
    await db.query(
      `insert into orders (
        shopify_order_id,
        order_name,
        created_at_shopify,
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
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      )
      on conflict (shopify_order_id) do nothing`,
      [
        shopifyOrderId,
        "#SMOKE-999",
        nowIso,
        "Smoke Tester",
        "+213000000000",
        "Rue Smoke 1",
        "Alger",
        "Alger",
        1234.56,
        "DZD",
        2,
        "Alger (À domicile)",
        "domicile",
        400,
        webhookId,
        "orders/create",
        "smoke.myshopify.com",
      ],
    );

    const orderCountRes = await db.query(
      `select count(*)::int as c from orders where shopify_order_id = $1`,
      [shopifyOrderId],
    );
    const orderCount = orderCountRes.rows[0].c;
    console.log("orders count for same shopify_order_id:", orderCount);
    assert(
      orderCount === 1,
      "Idempotency failed for orders (expected count=1)",
    );
    console.log("✅ orders idempotency OK");

    console.log("🎉 ✅ SMOKE DB TEST PASSED");
    process.exit(0);
  } catch (err) {
    console.error("❌ SMOKE DB TEST FAILED:", err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await db.pool.end().catch(() => {});
  }
})();
