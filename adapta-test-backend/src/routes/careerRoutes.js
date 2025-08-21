const express = require('express');
const router = express.Router();
const { 
    createCareer, 
    getCareers, 
    assignCoordinatorToCareer, 
    addCourseToCurriculum 
} = require('../controllers/careerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// /api/careers
router.route('/')
    .post(protect, authorize('admin'), createCareer)
    .get(protect, getCareers);

// ===============================================================
// 👇 NUEVAS RUTAS
// ===============================================================

// Ruta para que un Admin asigne un coordinador
// PUT /api/careers/:id/coordinator
router.route('/:id/coordinator')
    .put(protect, authorize('admin'), assignCoordinatorToCareer);

// Ruta para que un Coordinador añada un curso a la malla
// POST /api/careers/:id/curriculum
router.route('/:id/curriculum')
    .post(protect, authorize('coordinator'), addCourseToCurriculum);


module.exports = router;