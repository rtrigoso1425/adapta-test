const Plan = require("../models/planModel");

// Obtener todos los planes
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo plan
const createPlan = async (req, res) => {
  try {
    const { name, code, price, billingCycle, maxStudents } = req.body;
    
    // Validación básica
    if (!name || !code) {
      return res.status(400).json({ message: "Nombre y Código son requeridos" });
    }

    const plan = await Plan.create({
      name,
      code,
      price,
      billingCycle,
      limits: { maxStudents: maxStudents || 100 }
    });
    
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getPlans, createPlan };