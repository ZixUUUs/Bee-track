const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  res.send("Succseful");
});

module.exports = router;
