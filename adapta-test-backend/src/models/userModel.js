const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Por favor, añade un nombre."],
    },
    email: {
      type: String,
      required: [true, "Por favor, añade un email."],
      unique: true, // AÑADIDO: Email único globalmente
      match: [/.+\@.+\..+/, "Por favor, introduce un email válido."],
    },
    password: {
      type: String,
      required: [true, "Por favor, añade una contraseña."],
    },
    // CAMPO AÑADIDO: Referencia a la institución a la que pertenece el usuario
    role: {
      type: String,
      enum: [
        "student",
        "professor",
        "coordinator",
        "admin",
        "parent",
        "superadmin",
      ], // <-- AÑADIR 'superadmin'
      required: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      // Ahora es requerido solo si el rol NO es superadmin
      required: function () {
        return this.role !== "superadmin";
      },
    },
    studentGrade: {
      type: String,
    },
    parentOf: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// COMENTADO: Índice único por institución ya no es necesario
// userSchema.index({ institution: 1, email: 1 }, { unique: true });

// Middleware para encriptar la contraseña
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
