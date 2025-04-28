// src/pages/Residuos.txx
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Residuo, residuosApi } from "@/lib/api";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { toast } from "sonner";

// Asegúrate que tu tipo Residuo esté definido como:
// type Residuo = {
//   idResiduo?: number;
//   tipoResiduo: "Orgánico" | "Inorgánico Reciclable" | "Peligroso";
// };

const Residuos = () => {
  const [residuos, setResiduos] = useState<Residuo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentResiduo, setCurrentResiduo] = useState<Residuo | null>(null);
  const [formData, setFormData] = useState<Residuo>({
    tipoResiduo: "Orgánico" // Valor por defecto
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const residuosData = await residuosApi.getAll();
        setResiduos(Array.isArray(residuosData) ? residuosData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar los residuos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    setCurrentResiduo(null);
    setFormData({ tipoResiduo: "Orgánico" });
    setIsDialogOpen(true);
  };

  const handleEdit = (residuo: Residuo) => {
    setCurrentResiduo(residuo);
    setFormData({ tipoResiduo: residuo.tipoResiduo });
    setIsDialogOpen(true);
  };

  const handleDelete = (residuo: Residuo) => {
    setCurrentResiduo(residuo);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (currentResiduo?.idResiduo) {
      try {
        await residuosApi.delete(currentResiduo.idResiduo);
        setResiduos(residuos.filter(r => r.idResiduo !== currentResiduo.idResiduo));
        toast.success("Residuo eliminado exitosamente");
      } catch (error) {
        console.error("Error deleting residuo:", error);
        toast.error("Error al eliminar el residuo");
      }
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipoResiduo) {
      toast.error("Seleccione un tipo de residuo");
      return;
    }

    try {
      if (currentResiduo?.idResiduo) {
        const updatedResiduo = await residuosApi.update(currentResiduo.idResiduo, formData);
        setResiduos(residuos.map(r => 
          r.idResiduo === currentResiduo.idResiduo ? updatedResiduo : r
        ));
        toast.success("Residuo actualizado exitosamente");
      } else {
        const newResiduo = await residuosApi.create(formData);
        setResiduos([...residuos, newResiduo]);
        toast.success("Residuo creado exitosamente");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving residuo:", error);
      toast.error("Error al guardar el residuo");
    }
  };

  const handleSelectChange = (value: "Orgánico" | "Inorgánico Reciclable" | "Peligroso") => {
    setFormData({ ...formData, tipoResiduo: value });
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      cell: (residuo: Residuo) => residuo.idResiduo,
    },
    {
      key: "tipo",
      header: "Tipo de Residuo",
      cell: (residuo: Residuo) => residuo.tipoResiduo,
    },
  ];

  return (
    <Layout>
      <PageHeader 
        title="Gestión de Residuos" 
        description="Administre los tipos de residuos"
        action={{
          label: "Nuevo Residuo",
          onClick: handleAdd,
          icon: <Plus size={16} />,
        }}
      />

      {/* ... resto del componente igual ... */}

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentResiduo ? "Editar Residuo" : "Nuevo Tipo de Residuo"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="tipoResiduo">Tipo de Residuo*</Label>
                <Select
                  value={formData.tipoResiduo}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Orgánico">Orgánico</SelectItem>
                    <SelectItem value="Inorgánico Reciclable">Inorgánico Reciclable</SelectItem>
                    <SelectItem value="Peligroso">Peligroso</SelectItem>
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

      {/* ... resto del componente igual ... */}
      <DataTable
      title="Lista de Residuos"
      
  data={residuos}
  columns={columns}
  // Asegurar que estas props estén bien configuradas:
  onAdd={handleAdd}
  onEdit={handleEdit}
  onDelete={handleDelete}
  getItemId={(residuo) => residuo.idResiduo?.toString() || ""}
/>
    </Layout>
  );
};

export default Residuos;