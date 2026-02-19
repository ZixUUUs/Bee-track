
CREATE TABLE IF NOT EXISTS webhook_events (
  id           BIGSERIAL PRIMARY KEY,
  webhook_id   TEXT UNIQUE NOT NULL,
  topic        TEXT,
  shop_domain  TEXT,
  received_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id                    BIGSERIAL PRIMARY KEY,
  shopify_order_id      TEXT UNIQUE NOT NULL,
  order_name            TEXT,
  created_at_shopify    TIMESTAMPTZ,
  customer_name         TEXT,
  phone                 TEXT,
  address               TEXT,
  city                  TEXT,
  wilaya                TEXT,
  total_price           NUMERIC,
  currency              TEXT,
  line_items_count      INT DEFAULT 0,
  delivery_method_title TEXT,
  delivery_type         TEXT,
  delivery_price        NUMERIC,
  webhook_id            TEXT,
  topic                 TEXT,
  shop_domain           TEXT,
  received_at           TIMESTAMPTZ DEFAULT now()
);


CREATE INDEX IF NOT EXISTS idx_orders_received_at ON orders (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_shop_domain ON orders (shop_domain);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON webhook_events (received_at DESC);
