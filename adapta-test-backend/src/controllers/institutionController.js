// src/controllers/institutionController.js
const Institution = require("../models/institutionModel");

const createInstitution = async (req, res) => {
  const { name, code, type, settings } = req.body;
  const institutionExists = await Institution.findOne({ code });
  if (institutionExists) {
    return res
      .status(400)
      .json({ message: "Una institución con este código ya existe." });
  }
  const institution = await Institution.create({ name, code, type, settings });
  res.status(201).json(institution);
};

const getInstitutions = async (req, res) => {
  const institutions = await Institution.find({});
  res.json(institutions);
};

module.exports = { createInstitution, getInstitutions };
