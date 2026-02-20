// models/webhookEventsModel.js
const db = require("../src/config/db");

/**
 * Vérifie si un webhook_id existe déjà (déjà reçu/traité).
 * @param {string} webhookId
 * @returns {Promise<boolean>}
 */
async function isDuplicateWebhook(webhookId) {
  if (!webhookId) throw new Error("isDuplicateWebhook: webhookId is required");

  const res = await db.query(
    `SELECT 1 FROM webhook_events WHERE webhook_id = $1 LIMIT 1`,
    [webhookId],
  );

  return res.rowCount === 1;
}

/**
 * Marque un webhook comme reçu.
 * Idempotent via UNIQUE(webhook_id) + ON CONFLICT DO NOTHING.
 *
 * @param {Object} e
 * @param {string} e.webhook_id
 * @param {string} [e.topic]
 * @param {string} [e.shop_domain]
 * @returns {Promise<{ inserted: boolean }>}
 */
async function markWebhookReceived(e) {
  if (!e || !e.webhook_id) {
    throw new Error("markWebhookReceived: webhook_id is required");
  }

  const sql = `
    INSERT INTO webhook_events (webhook_id, topic, shop_domain)
    VALUES ($1, $2, $3)
    ON CONFLICT (webhook_id) DO NOTHING
    RETURNING id;
  `;

  const params = [e.webhook_id, e.topic ?? null, e.shop_domain ?? null];

  const res = await db.query(sql, params);

  return { inserted: res.rowCount === 1 };
}

/**
 * (Optionnel) Compter les webhooks reçus (debug)
 * @returns {Promise<number>}
 */
async function countWebhookEvents() {
  const res = await db.query(`SELECT count(*)::int AS c FROM webhook_events`);
  return res.rows[0].c;
}

module.exports = {
  markWebhookReceived,
  countWebhookEvents,
};
