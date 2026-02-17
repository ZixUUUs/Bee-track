const { listOrders, getOrderById } = require("../src/store/storeOrder");

function getRecentOrders(req, res) {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const orders = listOrders({ limit });

  res.json({
    ok: true,
    count: orders.length,
    orders,
  });
}

function getOrder(req, res) {
  const id = req.params.id;
  const order = getOrderById(id);

  if (!order) {
    return res
      .status(404)
      .json({ ok: false, error: "Order not found in memory store" });
  }

  return res.json({ ok: true, order });
}

module.exports = {
  getRecentOrders,
  getOrder,
};
