import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// Imports de Redux
import { getInstitutions, createInstitution } from "../institutions/institutionSlice";
import { getPlans, createPlan } from "../plans/planSlice";

// Imports UI Components
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
// CAMBIO: Importamos los componentes del Select Personalizado en lugar de SelectNative
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"; 
import { Plus, Building, CreditCard, Users } from "lucide-react";

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "institutions";
  
  // Selectores
  const { institutions } = useSelector((state) => state.institutions);
  const { plans } = useSelector((state) => state.plans);

  // Estados Locales para Formularios
  const [instData, setInstData] = useState({
    name: "", code: "", type: "university", planId: "",
    adminName: "", adminEmail: "", adminPassword: ""
  });
  
  const [planData, setPlanData] = useState({
    name: "", code: "", price: 0, billingCycle: "monthly", maxStudents: 100
  });

  const [openInstModal, setOpenInstModal] = useState(false);
  const [openPlanModal, setOpenPlanModal] = useState(false);

  // Buscador y filtros (estilo similar a AdminUsersTable)
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredInstitutions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (institutions || []).filter((inst) => {
      const matchesQuery =
        !q ||
        (inst.name && inst.name.toLowerCase().includes(q)) ||
        (inst.code && inst.code.toLowerCase().includes(q));
      const matchesType = typeFilter ? inst.type === typeFilter : true;
      const matchesStatus =
        statusFilter === ""
          ? true
          : statusFilter === "active"
          ? !!inst.isActive
          : !inst.isActive;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [institutions, search, typeFilter, statusFilter]);

  useEffect(() => {
    dispatch(getInstitutions());
    dispatch(getPlans());
  }, [dispatch]);

  // Handlers
  const submitInstitution = (e) => {
    e.preventDefault();
    // Limpiamos el planId si es "none" para que el backend lo reciba como null
    const payload = {
        ...instData,
        planId: instData.planId === "none" ? null : instData.planId
    };

    dispatch(createInstitution(payload)).unwrap()
      .then(() => {
        setOpenInstModal(false);
        setInstData({ name: "", code: "", type: "university", planId: "", adminName: "", adminEmail: "", adminPassword: "" });
        alert("Institución creada con éxito");
      })
      .catch((err) => alert(err));
  };

  const submitPlan = (e) => {
    e.preventDefault();
    dispatch(createPlan(planData)).unwrap()
      .then(() => {
        setOpenPlanModal(false);
        setPlanData({ name: "", code: "", price: 0, billingCycle: "monthly", maxStudents: 100 });
      });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Panel Super Admin</h1>
      </div>

      {/* El tab activo se controla desde la sidebar mediante la query param `?tab=institutions|plans` */}
      <Tabs value={activeTab} className="w-full">
 
        {/* --- TAB INSTITUCIONES --- */}
        <TabsContent value="institutions" className="mt-4">
          <div className="flex justify-end mb-4">
            <Dialog open={openInstModal} onOpenChange={setOpenInstModal}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus size={16}/> Nueva Institución</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader><DialogTitle>Registrar Institución</DialogTitle></DialogHeader>
                <form onSubmit={submitInstitution} className="space-y-4 pt-4">
                  {/* Sección 1: Datos Institución */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="col-span-2 font-semibold text-primary">Datos Generales</div>
                      
                      <div className="space-y-1">
                        <Label>Nombre</Label>
                        <Input value={instData.name} onChange={e => setInstData({...instData, name: e.target.value})} required placeholder="Ej: Universidad Central" />
                      </div>
                      
                      <div className="space-y-1">
                        <Label>Código</Label>
                        <Input value={instData.code} onChange={e => setInstData({...instData, code: e.target.value})} required placeholder="Ej: UCE" />
                      </div>
                      
                      <div className="space-y-1">
                        <Label>Tipo</Label>
                        {/* SELECT CUSTOM 1: Tipo de Institución */}
                        <Select 
                            value={instData.type} 
                            onValueChange={(val) => setInstData({...instData, type: val})}
                        >
                            <SelectTrigger className="bg-card">
                                <SelectValue placeholder="Selecciona tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="university">Universidad</SelectItem>
                                <SelectItem value="high_school">Colegio</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <Label>Plan Inicial</Label>
                        {/* SELECT CUSTOM 2: Planes */}
                        <Select 
                            value={instData.planId} 
                            onValueChange={(val) => setInstData({...instData, planId: val})}
                        >
                            <SelectTrigger className="bg-card">
                                <SelectValue placeholder="Selecciona un plan (Opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">-- Sin Plan --</SelectItem>
                                {plans && plans.map(p => (
                                    <SelectItem key={p._id} value={p._id}>
                                        {p.name} (${p.price})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </div>
                  </div>

                  {/* Sección 2: Datos Admin */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
                      <div className="col-span-2 font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <Users size={16}/> Administrador Inicial
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label>Nombre Completo</Label>
                        <Input value={instData.adminName} onChange={e => setInstData({...instData, adminName: e.target.value})} required placeholder="Admin Principal" />
                      </div>
                      <div className="space-y-1">
                        <Label>Email</Label>
                        <Input type="email" value={instData.adminEmail} onChange={e => setInstData({...instData, adminEmail: e.target.value})} required placeholder="admin@institucion.com" />
                      </div>
                      <div className="space-y-1">
                        <Label>Contraseña</Label>
                        <Input type="password" value={instData.adminPassword} onChange={e => setInstData({...instData, adminPassword: e.target.value})} required />
                      </div>
                  </div>
                  
                  <Button type="submit" className="w-full">Crear Todo</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              {/* Barra de búsqueda y filtros (estilo AdminUsersTable) */}
              <div className="my-4 p-4">
                <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Buscar por nombre o código..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-64"
                    />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-3 py-2.5 border rounded-lg bg-card text-foreground text-sm font-medium"
                    >
                      <option value="">Todos los tipos</option>
                      <option value="university">Universidad</option>
                      <option value="high_school">Colegio</option>
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2.5 border rounded-lg bg-card text-foreground text-sm font-medium"
                    >
                      <option value="">Todos los estados</option>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSearch(""); setTypeFilter(""); setStatusFilter(""); }}
                  >
                    Limpiar
                  </Button>
                </div>

                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[240px] text-foreground">Nombre</TableHead>
                      <TableHead className="w-[160px] text-foreground">Código</TableHead>
                      <TableHead className="w-[120px] text-foreground">Tipo</TableHead>
                      <TableHead className="w-[160px] text-foreground">Plan</TableHead>
                      <TableHead className="w-[120px] text-foreground">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(filteredInstitutions.length ? filteredInstitutions : []).map((inst) => (
                      <TableRow key={inst._id}>
                        <TableCell className="font-medium whitespace-nowrap">{inst.name}</TableCell>
                        <TableCell className="text-sm text-foreground">{inst.code}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{inst.type === 'university' ? 'Universidad' : 'Colegio'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{inst.plan?.name || <span className="text-muted-foreground text-xs">N/A</span>}</TableCell>
                        <TableCell>
                          <Badge className={inst.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800"}>
                            {inst.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!filteredInstitutions || filteredInstitutions.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No se encontraron instituciones.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB PLANES --- */}
        <TabsContent value="plans" className="mt-4">
           <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-semibold">Catálogo de Planes</h2>
               <Dialog open={openPlanModal} onOpenChange={setOpenPlanModal}>
                  <DialogTrigger asChild><Button variant="outline" className="gap-2"><Plus size={16}/> Crear Plan</Button></DialogTrigger>
                  <DialogContent>
                      <DialogHeader><DialogTitle>Nuevo Plan de Suscripción</DialogTitle></DialogHeader>
                      <form onSubmit={submitPlan} className="space-y-4">
                          <div className="space-y-1"><Label>Nombre del Plan</Label><Input value={planData.name} onChange={e => setPlanData({...planData, name: e.target.value})} required placeholder="Ej: Plan Básico" /></div>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1"><Label>Código (ID)</Label><Input value={planData.code} onChange={e => setPlanData({...planData, code: e.target.value})} required placeholder="BASIC_01" /></div>
                              <div className="space-y-1"><Label>Precio</Label><Input type="number" value={planData.price} onChange={e => setPlanData({...planData, price: e.target.value})} required /></div>
                          </div>
                          <div className="space-y-1">
                            <Label>Ciclo de Facturación</Label>
                            {/* SELECT CUSTOM 3: Ciclo */}
                            <Select 
                                value={planData.billingCycle} 
                                onValueChange={(val) => setPlanData({...planData, billingCycle: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona ciclo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Mensual</SelectItem>
                                    <SelectItem value="yearly">Anual</SelectItem>
                                </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1"><Label>Límite Estudiantes</Label><Input type="number" value={planData.maxStudents} onChange={e => setPlanData({...planData, maxStudents: e.target.value})} required /></div>
                          <Button type="submit" className="w-full">Guardar Plan</Button>
                      </form>
                  </DialogContent>
              </Dialog>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
              {plans && plans.map((plan) => (
                  <Card key={plan._id} className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                      <CardHeader>
                          <CardTitle className="flex justify-between items-start">
                              {plan.name}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-2 w-fit">{plan.code}</Badge>
                          <div className="text-3xl font-bold mt-4">${plan.price} <span className="text-sm font-normal text-muted-foreground">/ {plan.billingCycle === 'monthly' ? 'mes' : 'año'}</span></div>
                      </CardHeader>
                      <CardContent>
                          <ul className="text-sm space-y-2 text-muted-foreground">
                              <li className="flex items-center gap-2">
                                <Users size={16} className="text-primary"/> 
                                Hasta {plan.limits?.maxStudents} estudiantes
                              </li>
                          </ul>
                      </CardContent>
                  </Card>
              ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;