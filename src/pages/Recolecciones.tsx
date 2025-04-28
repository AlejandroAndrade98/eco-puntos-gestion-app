
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { 
  Recoleccion, 
  recoleccionesApi, 
  usuariosApi, 
  empresasApi, 
  residuosApi,
  Usuario,
  Empresa,
  Residuo
} from "@/lib/api";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Recolecciones = () => {
  const [recolecciones, setRecolecciones] = useState<Recoleccion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [residuos, setResiduos] = useState<Residuo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRecoleccion, setCurrentRecoleccion] = useState<Recoleccion | null>(null);
  const [formData, setFormData] = useState<Recoleccion>({
    idUsuario: 0,
    idEmpresa: 0,
    idResiduo: 0,
    fechaRecoleccion: new Date().toISOString().split("T")[0],
    pesoKg: 0,
    estado: "Programada",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching recolecciones data...");
        const [recoleccionesData, usuariosData, empresasData, residuosData] = await Promise.all([
          recoleccionesApi.getAll(),
          usuariosApi.getAll(),
          empresasApi.getAll(),
          residuosApi.getAll()
        ]);
        
        console.log("Recolecciones data:", recoleccionesData);
        console.log("Usuarios data:", usuariosData);
        console.log("Empresas data:", empresasData);
        console.log("Residuos data:", residuosData);
        
        setRecolecciones(Array.isArray(recoleccionesData) ? recoleccionesData : []);
        setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
        setEmpresas(Array.isArray(empresasData) ? empresasData : []);
        setResiduos(Array.isArray(residuosData) ? residuosData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    // Initialize with defaults
    const defaultForm: Recoleccion = {
      idUsuario: usuarios.length > 0 ? Number(usuarios[0].idUsuario) : 0,
      idEmpresa: empresas.length > 0 ? Number(empresas[0].idEmpresa) : 0,
      idResiduo: residuos.length > 0 ? Number(residuos[0].idResiduo) : 0,
      fechaRecoleccion: new Date().toISOString().split("T")[0],
      pesoKg: 0,
      estado: "Programada",
    };
    
    console.log("Default form for new recoleccion:", defaultForm);
    setCurrentRecoleccion(null);
    setFormData(defaultForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (recoleccion: Recoleccion) => {
    console.log("Editing recoleccion:", recoleccion);
    setCurrentRecoleccion(recoleccion);
    setFormData({
      idUsuario: recoleccion.idUsuario,
      idEmpresa: recoleccion.idEmpresa,
      idResiduo: recoleccion.idResiduo,
      fechaRecoleccion: new Date(recoleccion.fechaRecoleccion).toISOString().split("T")[0],
      pesoKg: recoleccion.pesoKg,
      estado: recoleccion.estado,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (recoleccion: Recoleccion) => {
    console.log("Preparing to delete recoleccion:", recoleccion);
    setCurrentRecoleccion(recoleccion);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (currentRecoleccion?.idRecoleccion) {
      try {
        console.log("Deleting recoleccion with ID:", currentRecoleccion.idRecoleccion);
        const success = await recoleccionesApi.delete(currentRecoleccion.idRecoleccion);
        if (success) {
          setRecolecciones(recolecciones.filter(r => r.idRecoleccion !== currentRecoleccion.idRecoleccion));
          toast.success("Recolección eliminada exitosamente");
        }
      } catch (error) {
        console.error("Error deleting recoleccion:", error);
        toast.error("Error al eliminar la recolección");
      }
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Submitting form data:", formData);
    
    if (!formData.idUsuario || !formData.idEmpresa || !formData.idResiduo || !formData.fechaRecoleccion || formData.pesoKg <= 0) {
      toast.error("Por favor complete todos los campos obligatorios correctamente.");
      return;
    }

    try {
      let result;
      if (currentRecoleccion?.idRecoleccion) {
        console.log("Updating recoleccion with ID:", currentRecoleccion.idRecoleccion);
        result = await recoleccionesApi.update(currentRecoleccion.idRecoleccion, formData);
        if (result) {
          setRecolecciones(
            recolecciones.map(r => 
              r.idRecoleccion === currentRecoleccion.idRecoleccion ? { ...r, ...result } : r
            )
          );
          toast.success("Recolección actualizada exitosamente");
        }
      } else {
        console.log("Creating new recoleccion");
        result = await recoleccionesApi.create(formData);
        console.log("Create result:", result);
        if (result) {
          setRecolecciones([...recolecciones, result]);
          toast.success("Recolección creada exitosamente");
        }
      }

      if (result) {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving recoleccion:", error);
      toast.error("Error al guardar la recolección");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "pesoKg") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "idUsuario" || name === "idEmpresa" || name === "idResiduo") {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Define columns for data table
  const columns = [
    {
      key: "fecha",
      header: "Fecha",
      cell: (recoleccion: Recoleccion) => {
        try {
          return format(new Date(recoleccion.fechaRecoleccion), "dd/MM/yyyy");
        } catch (e) {
          return "Fecha inválida";
        }
      },
    },
    {
      key: "usuario",
      header: "Usuario",
      cell: (recoleccion: Recoleccion) => {
        const usuario = usuarios.find(u => u.idUsuario === recoleccion.idUsuario);
        return usuario ? `${usuario.nombre} ${usuario.apellidos}` : "N/A";
      },
    },
    {
      key: "empresa",
      header: "Empresa",
      cell: (recoleccion: Recoleccion) => {
        const empresa = empresas.find(e => e.idEmpresa === recoleccion.idEmpresa);
        return empresa ? empresa.nombre : "N/A";
      },
    },
    {
      key: "residuo",
      header: "Tipo de Residuo",
      cell: (recoleccion: Recoleccion) => {
        const residuo = residuos.find(r => r.idResiduo === recoleccion.idResiduo);
        return residuo ? residuo.tipoResiduo : "N/A";
      },
    },
    {
      key: "peso",
      header: "Peso (Kg)",
      cell: (recoleccion: Recoleccion) => recoleccion.pesoKg.toFixed(2),
    },
    {
      key: "estado",
      header: "Estado",
      cell: (recoleccion: Recoleccion) => {
        let color;
        switch (recoleccion.estado) {
          case "Programada":
            color = "bg-blue-100 text-blue-800";
            break;
          case "Completada":
            color = "bg-green-100 text-green-800";
            break;
          case "Cancelada":
            color = "bg-red-100 text-red-800";
            break;
          default:
            color = "bg-gray-100 text-gray-800";
        }
        return (
          <Badge className={`${color} font-medium`}>
            {recoleccion.estado}
          </Badge>
        );
      },
    },
  ];

  return (
    <Layout>
      <PageHeader 
        title="Gestión de Recolecciones" 
        description="Administre las recolecciones de residuos"
        action={{
          label: "Nueva Recolección",
          onClick: handleAdd,
          icon: <Plus size={16} />,
        }}
      />

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando datos...</span>
        </div>
      ) : (
        <DataTable
          data={recolecciones}
          columns={columns}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getItemId={(recoleccion) => recoleccion.idRecoleccion?.toString() || "0"}
          title="Recolecciones"
          addButtonText="Nueva Recolección"
        />
      )}

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentRecoleccion ? "Editar Recolección" : "Programar Nueva Recolección"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="idUsuario">Usuario*</Label>
                <Select
                  value={formData.idUsuario?.toString() || ""}
                  onValueChange={(value) => handleSelectChange("idUsuario", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((usuario) => (
                      <SelectItem
                        key={usuario.idUsuario}
                        value={usuario.idUsuario?.toString() || ""}
                      >
                        {usuario.nombre} {usuario.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="idEmpresa">Empresa Recolectora*</Label>
                <Select
                  value={formData.idEmpresa?.toString() || ""}
                  onValueChange={(value) => handleSelectChange("idEmpresa", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem
                        key={empresa.idEmpresa}
                        value={empresa.idEmpresa?.toString() || ""}
                      >
                        {empresa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="idResiduo">Tipo de Residuo*</Label>
                <Select
                  value={formData.idResiduo?.toString() || ""}
                  onValueChange={(value) => handleSelectChange("idResiduo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo de residuo" />
                  </SelectTrigger>
                  <SelectContent>
                    {residuos.map((residuo) => (
                      <SelectItem
                        key={residuo.idResiduo}
                        value={residuo.idResiduo?.toString() || ""}
                      >
                        {residuo.tipoResiduo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="fechaRecoleccion">Fecha de Recolección*</Label>
                  <Input
                    id="fechaRecoleccion"
                    name="fechaRecoleccion"
                    type="date"
                    value={formData.fechaRecoleccion}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="pesoKg">Peso (Kg)*</Label>
                  <Input
                    id="pesoKg"
                    name="pesoKg"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.pesoKg}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="estado">Estado*</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleSelectChange("estado", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Programada">Programada</SelectItem>
                    <SelectItem value="Completada">Completada</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación"
        description="¿Está seguro que desea eliminar esta recolección?"
      />
    </Layout>
  );
};

export default Recolecciones;
