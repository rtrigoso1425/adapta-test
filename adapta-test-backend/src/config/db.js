const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // mongoose.connect retorna una promesa, por eso usamos await
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Si la conexión falla, cerramos el proceso de la aplicación
        process.exit(1);
    }
};

module.exports = connectDB;