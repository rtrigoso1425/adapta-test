// src/routes/parentRoutes.js
const express = require("express");
const router = express.Router();
const { getMyChildrenProgress } = require("../controllers/parentController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Esta ruta solo será accesible por usuarios con el rol 'parent'
router
  .route("/my-children")
  .get(protect, authorize("parent"), getMyChildrenProgress);

module.exports = router;
