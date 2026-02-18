const crypto = require("crypto");

function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;

  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");

  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifyShopifyHMAC(req, res, next) {
  console.log("[HMAC] content-type:", req.get("content-type"));
  console.log("[HMAC] header present:", !!req.get("x-shopify-hmac-sha256"));
  console.log(
    "[HMAC] isBuffer:",
    Buffer.isBuffer(req.body),
    "len:",
    req.body?.length,
  );

  try {
    const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
    if (!hmacHeader) return res.sendStatus(401);

    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[WEBHOOK] Missing SHOPIFY_WEBHOOK_SECRET env var");
      return res.sendStatus(500);
    }

    if (!Buffer.isBuffer(req.body)) {
      console.error(
        "[WEBHOOK] Body is not a Buffer. Use express.raw({ type: 'application/json' }) on webhook route.",
      );
      return res.sendStatus(500);
    }

    const computed = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("base64");

    console.log("[HMAC] received:", hmacHeader);
    console.log("[HMAC] expected:", computed);

    if (!safeCompare(computed, hmacHeader)) return res.sendStatus(401);

    return next();
  } catch (err) {
    console.error("[WEBHOOK] HMAC verification error:", err);
    return res.status(401).json({ error: "Missing HMAC header" });
  }
  console.log("[HMAC] all headers:", req.headers);
}

module.exports = verifyShopifyHMAC;
