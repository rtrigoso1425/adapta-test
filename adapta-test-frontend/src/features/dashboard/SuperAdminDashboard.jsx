import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getInstitutions, createInstitution, reset } from "../institutions/institutionSlice";
import { BlurFade } from "../../components/ui/blur-fade";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { SelectNative } from "../../components/ui/select-native";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Plus, Building2, X } from "lucide-react";
import { createPortal } from "react-dom";

// Reutilizamos el estilo de Modal que usas en otros dashboards
const ModalOverlay = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card rounded-xl shadow-xl border border-border" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  // eslint-disable-next-line no-unused-vars
  const { institutions, isLoading, isError, message } = useSelector((state) => state.institutions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "university", // Valor por defecto
    maxStudentsPerSection: 30,
    allowParentAccess: false,
    requiresPrerequisites: true
  });

  useEffect(() => {
    dispatch(getInstitutions());
    return () => { dispatch(reset()); };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Estructuramos los datos como los espera el backend (settings anidado)
    const payload = {
      name: formData.name,
      code: formData.code,
      type: formData.type,
      settings: {
        maxStudentsPerSection: Number(formData.maxStudentsPerSection),
        allowParentAccess: formData.allowParentAccess,
        requiresPrerequisites: formData.requiresPrerequisites
      }
    };

    dispatch(createInstitution(payload))
      .unwrap()
      .then(() => {
        setIsModalOpen(false);
        setFormData({ // Resetear form
          name: "", code: "", type: "university", 
          maxStudentsPerSection: 30, allowParentAccess: false, requiresPrerequisites: true 
        });
        alert("Institución creada exitosamente");
      })
      .catch((err) => alert(err));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BlurFade inView delay={0.1}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gestión de Instituciones</h1>
              <p className="text-muted-foreground">Panel de Superadministrador</p>
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus size={20} /> Nueva Institución
          </Button>
        </div>

        {/* Tabla de Instituciones */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Configuración</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24">Cargando...</TableCell></TableRow>
                ) : institutions.length > 0 ? (
                  institutions.map((inst) => (
                    <TableRow key={inst._id}>
                      <TableCell className="font-medium">{inst.name}</TableCell>
                      <TableCell><code className="bg-muted px-2 py-1 rounded">{inst.code}</code></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={inst.type === 'university' ? 'border-blue-500 text-blue-500' : 'border-green-500 text-green-500'}>
                          {inst.type === 'university' ? 'Universidad' : 'Colegio'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div>Max Alumnos: {inst.settings?.maxStudentsPerSection}</div>
                        <div>Padres: {inst.settings?.allowParentAccess ? 'Sí' : 'No'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={inst.isActive ? "bg-green-600" : "bg-red-600"}>
                          {inst.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="text-center h-24">No hay instituciones registradas.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </BlurFade>

      {/* Modal de Creación */}
      <ModalOverlay isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CardHeader>
          <CardTitle>Registrar Nueva Institución</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre de la Institución</Label>
              <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Ej. Universidad Central" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código Único</Label>
                <Input name="code" value={formData.code} onChange={handleChange} required placeholder="Ej. UCE" />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <SelectNative name="type" value={formData.type} onChange={handleChange}>
                  <option value="university">Universidad</option>
                  <option value="high_school">Colegio</option>
                </SelectNative>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Máx. Estudiantes por Sección</Label>
              <Input type="number" name="maxStudentsPerSection" value={formData.maxStudentsPerSection} onChange={handleChange} required />
            </div>

            {/* Checkboxes de Configuración */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="allowParentAccess" 
                  name="allowParentAccess" 
                  checked={formData.allowParentAccess} 
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="allowParentAccess" className="cursor-pointer">Permitir acceso a padres</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="requiresPrerequisites" 
                  name="requiresPrerequisites" 
                  checked={formData.requiresPrerequisites} 
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="requiresPrerequisites" className="cursor-pointer">Habilitar sistema de prerrequisitos</Label>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Institución"}
            </Button>
          </form>
        </CardContent>
      </ModalOverlay>
    </div>
  );
};

export default SuperAdminDashboard;