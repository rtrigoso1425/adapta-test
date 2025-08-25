const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Los archivos se guardarán en la carpeta 'uploads'
    },
    filename: function (req, file, cb) {
        // Generamos un nombre único para el archivo para evitar colisiones
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `syllabus-${req.params.courseId}${path.extname(file.originalname)}`);
    }
});

// Filtro para aceptar solo archivos PDF
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('¡Solo se permiten archivos PDF!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;