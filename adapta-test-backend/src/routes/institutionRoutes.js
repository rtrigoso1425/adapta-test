// src/routes/institutionRoutes.js
const express = require("express");
const router = express.Router();
const {
  createInstitution,
  getInstitutions,
} = require("../controllers/institutionController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Solo el 'superadmin' puede gestionar instituciones
router
  .route("/")
  .post(protect, authorize("superadmin"), createInstitution)
  .get(protect, authorize("superadmin"), getInstitutions);

module.exports = router;
