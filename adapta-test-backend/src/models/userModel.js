
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
      match: [/.+\@.+\..+/, "Por favor, introduce un email válido."],
    },
    password: {
      type: String,
      required: [true, "Por favor, añade una contraseña."],
    },
    // CAMPO AÑADIDO: Referencia a la institución a la que pertenece el usuario
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    // CAMBIO: 'role' ahora es el rol específico dentro de la institución
    role: {
      type: String,
      enum: ["student", "professor", "coordinator", "admin", "parent"],
      required: true,
    },
    // CAMPO AÑADIDO: Para estudiantes de colegio
    studentGrade: {
      type: String, // "1ro", "2do", "3ro", "4to", "5to"
    },
    // CAMPO AÑADIDO: Para padres, los IDs de los estudiantes que supervisa
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

// ÍNDICE AÑADIDO: Asegura que un email sea único por institución
userSchema.index({ institution: 1, email: 1 }, { unique: true });

// Middleware para encriptar la contraseña (se mantiene igual)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas (se mantiene igual)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
