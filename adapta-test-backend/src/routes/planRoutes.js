const express = require("express");
const router = express.Router();
const { getPlans, createPlan } = require("../controllers/planController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Rutas protegidas solo para Superadmin
router.route("/")
  .get(protect, authorize("superadmin"), getPlans)
  .post(protect, authorize("superadmin"), createPlan);

module.exports = router;