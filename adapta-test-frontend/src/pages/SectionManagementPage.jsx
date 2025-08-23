import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

// --- Redux Actions ---
import {
  getSectionDetails,
  reset as resetLearning,
} from "../features/learning/learningSlice";
import { updateApprovalCriteria } from "../features/sections/sectionSlice";

import {
  getModulesForSection,
  reset as resetContent,
} from "../features/content/contentSlice";

import AssignmentsTab from "../features/assignments/components/AssignmentsTab";
import AddModuleForm from "../features/content/AddModuleForm";
import ModuleItem from "../features/content/ModuleItem";

// --- Componentes de Pestañas (los definiremos aquí por claridad) ---

const ApprovalCriteriaTab = ({ section }) => {
  const dispatch = useDispatch(); // <-- AHORA SÍ SE USARÁ
  const [criteria, setCriteria] = useState(
    section.approvalCriteria || {
      mastery: { required: false, minPercentage: 85 },
      completion: {
        requiredLessonsPercentage: 95,
        allAssignmentsRequired: false,
      },
    }
  );

  const handleMasteryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCriteria((prev) => ({
      ...prev,
      mastery: {
        ...prev.mastery,
        [name]: type === "checkbox" ? checked : Number(value),
      },
    }));
  };

  const handleCompletionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCriteria((prev) => ({
      ...prev,
      completion: {
        ...prev.completion,
        [name]: type === "checkbox" ? checked : Number(value),
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const action = updateApprovalCriteria({
      sectionId: section._id,
      criteriaData: criteria,
    });
    dispatch(action)
      .unwrap()
      .then(() => {
        alert("Criterios de aprobación guardados exitosamente.");
      })
      .catch((error) => {
        alert("Error al guardar los criterios: " + error.message);
      });
  };

  return (
    <div>
      <h2>Configurar Criterios de Aprobación</h2>
      <form onSubmit={handleSubmit}>
        {/* Pilar 1: Maestría por Tema */}
        <fieldset style={{ marginTop: "20px" }}>
          <legend>
            <strong>Pilar 1: Nivel de Maestría</strong>
          </legend>
          <input
            type="checkbox"
            id="masteryRequired"
            name="required"
            checked={criteria.mastery?.required || false}
            onChange={handleMasteryChange}
          />
          <label htmlFor="masteryRequired">
            {" "}
            Requerir un nivel de maestría mínimo en todos los temas.
          </label>

          {criteria.mastery?.required && (
            <div style={{ marginTop: "10px", marginLeft: "25px" }}>
              <label htmlFor="minPercentage">
                Porcentaje mínimo de maestría (%):{" "}
              </label>
              <input
                type="number"
                id="minPercentage"
                name="minPercentage"
                min="1"
                max="100"
                value={criteria.mastery?.minPercentage || 85}
                onChange={handleMasteryChange}
              />
            </div>
          )}
        </fieldset>

        {/* Pilar 3: Completitud y Participación */}
        <fieldset style={{ marginTop: "20px" }}>
          <legend>
            <strong>Pilar 2: Completitud y Participación</strong>
          </legend>
          <input
            type="checkbox"
            id="allAssignmentsRequired"
            name="allAssignmentsRequired"
            checked={criteria.completion?.allAssignmentsRequired || false}
            onChange={handleCompletionChange}
          />
          <label htmlFor="allAssignmentsRequired">
            {" "}
            Requerir la entrega de TODAS las tareas.
          </label>
        </fieldset>

        <button type="submit" style={{ marginTop: "20px" }}>
          Guardar Criterios
        </button>
      </form>
    </div>
  );
};

const ModulesTab = ({ sectionId }) => {
  const dispatch = useDispatch();
  const { modules, isLoading } = useSelector((state) => state.content);

  useEffect(() => {
    if (sectionId) {
      dispatch(getModulesForSection(sectionId));
    }
    return () => {
      dispatch(resetContent());
    };
  }, [dispatch, sectionId]);

  if (isLoading) {
    return <p>Cargando módulos...</p>;
  }

  return (
    <div>
      <section>
        <h2>Módulos del Curso</h2>
        {modules.length > 0 ? (
          modules.map((module) => (
            <ModuleItem key={module._id} module={module} />
          ))
        ) : (
          <p>Este curso aún no tiene módulos.</p>
        )}
      </section>
      <AddModuleForm sectionId={sectionId} />
    </div>
  );
};

// --- COMPONENTE PRINCIPAL CORREGIDO Y AUTOSUFICIENTE ---
const SectionManagementPage = () => {
  const { id: sectionId } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("modules");

  // Leemos la sección activa desde el nuevo 'learningSlice'
  const { section, isLoading: isLoadingSection } = useSelector(
    (state) => state.learning
  );

  // Este useEffect ahora solo se encarga de cargar los datos de la sección
  useEffect(() => {
    dispatch(getSectionDetails(sectionId));

    // La limpieza se ejecuta cuando sales de la página
    return () => {
      dispatch(resetLearning());
    };
  }, [dispatch, sectionId]);

  if (isLoadingSection || !section) {
    return <h1>Cargando datos de la sección...</h1>;
  }

  return (
    <div>
      <h1>Gestionando: {section.course.title}</h1>
      <h3>Sección: {section.sectionCode}</h3>
      <hr />

      <nav style={{ marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("modules")}>Módulos</button>
        <button onClick={() => setActiveTab("assignments")}>Tareas</button>
        <button
          onClick={() => setActiveTab("criteria")}
          style={{ marginLeft: "10px" }}
        >
          Criterios de Aprobación
        </button>
      </nav>

      <div>
        {/* Pasamos los IDs necesarios a cada pestaña */}
        {activeTab === "modules" && <ModulesTab sectionId={section._id} />}
        {activeTab === "assignments" && (
          <AssignmentsTab sectionId={section._id} />
        )}
        {activeTab === "criteria" && <ApprovalCriteriaTab section={section} />}
      </div>
    </div>
  );
};

export default SectionManagementPage;
