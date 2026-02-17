// src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const { getRecentOrders, getOrder } = require("../controllers/orderController");

console.log("getRecentOrders:", typeof getRecentOrders);
console.log("getOrder:", typeof getOrder);

// GET /orders?limit=20
router.get("/", getRecentOrders);

// GET /orders/:id
router.get("/:id", getOrder);

module.exports = router;
