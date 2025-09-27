class InstitutionRulesService {
    static getRulesForInstitution(institution) {
        const rules = {
            university: {
                allowedRoles: ['student', 'professor', 'coordinator', 'admin'],
                hasPrerequisites: true,
                hasCareerPrograms: true,
                enrollmentType: 'selective', // Por curso individual
                maxCoursesPerStudent: 8,
                gradingSystem: {
                    scale: '0-20',
                    passingGrade: 11,
                    allowsRetakes: true,
                    maxRetakes: 2
                },
                evaluationRules: {
                    adaptiveEnabled: true,
                    maxQuestions: 15,
                    difficultyLevels: 5,
                    masteryThreshold: 75
                }
            },
            high_school: {
                allowedRoles: ['student', 'professor', 'admin', 'parent'],
                hasPrerequisites: false,
                hasCareerPrograms: false,
                enrollmentType: 'automatic', // Por grado completo
                maxCoursesPerStudent: 12,
                gradingSystem: {
                    scale: '0-20',
                    passingGrade: 11,
                    allowsRetakes: true,
                    maxRetakes: 3,
                    requiresParentNotification: true
                },
                evaluationRules: {
                    adaptiveEnabled: true,
                    maxQuestions: 10,
                    difficultyLevels: 3,
                    masteryThreshold: 65
                }
            }
        };

        if (!rules[institution.type]) {
            throw new Error(`Reglas no definidas para el tipo de institución: ${institution.type}`);
        }
        
        // Combina las reglas base con las configuraciones personalizadas de la institución
        // Nota: Esto requiere que `institution.settings` tenga la misma estructura.
        const institutionSettings = institution.settings || {};
        const finalRules = { ...rules[institution.type] };

        // Fusionamos las configuraciones anidadas
        if (institutionSettings.gradingSystem) {
            finalRules.gradingSystem = { ...finalRules.gradingSystem, ...institutionSettings.gradingSystem };
        }
        if (institutionSettings.evaluationRules) {
            finalRules.evaluationRules = { ...finalRules.evaluationRules, ...institutionSettings.evaluationRules };
        }
        
        return {
             ...finalRules,
             ...institutionSettings // Sobrescribimos las de primer nivel
            };
    }
    
    static validateUserRole(role, institution) {
        const rules = this.getRulesForInstitution(institution);
        return rules.allowedRoles.includes(role);
    }
    
    static async canEnrollInCourse(student, course, institution) {
        const rules = this.getRulesForInstitution(institution);
        
        if (rules.enrollmentType === 'automatic') {
            // Colegios: El curso debe ser para el grado del estudiante.
            // Asumimos que el modelo `Course` tiene un campo `targetGrade`.
            return course.targetGrade === student.studentGrade;
        }
        
        // Universidades: validar prerrequisitos si es necesario
        if (rules.hasPrerequisites) {
             return this.hasMetPrerequisites(student, course);
        }

        return true; // Si no hay prerrequisitos, se puede matricular.
    }

    // Placeholder para la lógica de prerrequisitos (la implementaremos en detalle después)
    static async hasMetPrerequisites(student, course) {
        // TODO: Implementar la lógica para verificar si el estudiante ha aprobado los cursos
        // que son prerrequisitos para `course`.
        console.log(`Verificando prerrequisitos para ${student.name} en el curso ${course.title}...`);
        return true; // Por ahora, siempre retorna true para no bloquear el desarrollo.
    }
}

module.exports = InstitutionRulesService;