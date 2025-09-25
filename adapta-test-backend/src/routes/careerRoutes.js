const express = require('express');
const router = express.Router();
const {
    isUniversity,
    createCareer,
    getCareers,
    assignCoordinatorToCareer,
    addCourseToCurriculum,
    getMyCareer,
    getCareerById
} = require('../controllers/careerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Aplicar el middleware isUniversity a todas las rutas de este archivo
router.use(protect, isUniversity);

// Rutas
router.route('/')
    .post(authorize('admin'), createCareer)
    .get(getCareers);

router.route('/my-career')
    .get(authorize('coordinator'), getMyCareer);

router.route('/:id')
    .get(getCareerById);

router.route('/:id/coordinator')
    .put(authorize('admin'), assignCoordinatorToCareer);

router.route('/:id/curriculum')
    .post(authorize('coordinator'), addCourseToCurriculum);

router.route('/:id')
    .get(protect, getCareerById);

module.exports = router;