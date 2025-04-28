// src/pages/Puntos.tsx
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { PuntosUsuario, puntosUsuarioApi } from "@/lib/api";
import { Plus, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { toast } from "sonner";
import { Usuario, usuariosApi } from "@/lib/api";

const Puntos = () => {
  const [puntos, setPuntos] = useState<PuntosUsuario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPunto, setCurrentPunto] = useState<PuntosUsuario | null>(null);
  
  const [formData, setFormData] = useState<Partial<PuntosUsuario>>({
    idUsuario: 0,
    puntos: 0,
    fechaCanje: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [puntosData, usuariosData] = await Promise.all([
          puntosUsuarioApi.getAll(),
          usuariosApi.getAll()
        ]);
        setPuntos(puntosData);
        setUsuarios(usuariosData);
      } catch (error) {
        toast.error("Error cargando datos");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdd = () => {
    setCurrentPunto(null);
    setFormData({
      idUsuario: usuarios[0]?.idUsuario || 0,
      puntos: 0,
      fechaCanje: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (punto: PuntosUsuario) => {
    setCurrentPunto(punto);
    setFormData(punto);
    setIsDialogOpen(true);
  };

  const handleDelete = (punto: PuntosUsuario) => {
    setCurrentPunto(punto);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idUsuario || formData.puntos === undefined) {
      toast.error("Complete todos los campos requeridos");
      return;
    }

    try {
      if (currentPunto?.idPuntosUsuario) {
        const updated = await puntosUsuarioApi.update(currentPunto.idPuntosUsuario, formData as PuntosUsuario);
        setPuntos(puntos.map(p => p.idPuntosUsuario === updated.idPuntosUsuario ? updated : p));
      } else {
        const newPunto = await puntosUsuarioApi.create(formData as PuntosUsuario);
        setPuntos([...puntos, newPunto]);
      }
      setIsDialogOpen(false);
      toast.success("Operación exitosa");
    } catch (error) {
      toast.error("Error guardando puntos");
    }
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      cell: (p: PuntosUsuario) => p.idPuntosUsuario
    },
    {
      key: "usuario",
      header: "Usuario",
      cell: (p: PuntosUsuario) => {
        const usuario = usuarios.find(u => u.idUsuario === p.idUsuario);
        return usuario ? `${usuario.nombre} ${usuario.apellidos}` : "N/A";
      }
    },
    {
      key: "puntos",
      header: "Puntos",
      cell: (p: PuntosUsuario) => p.puntos
    },
    {
      key: "fecha",
      header: "Fecha Canje",
      cell: (p: PuntosUsuario) => new Date(p.fechaCanje).toLocaleDateString()
    }
  ];

  return (
    <Layout>
      <PageHeader
        title="Gestión de Puntos"
        description="Administre los puntos de los usuarios"
        action={{
          label: "Nuevo Registro",
          onClick: handleAdd,
          icon: <Plus size={16} />
        }}
      />

      <DataTable
        data={puntos}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        getItemId={(p) => p.idPuntosUsuario?.toString() || ""}
      />

      {/* Diálogo de formulario */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPunto ? `Editar Puntos #${currentPunto.idPuntosUsuario}` : "Nuevo Registro de Puntos"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Usuario*</Label>
                <Select
                  value={formData.idUsuario?.toString() || ""}
                  onValueChange={value => setFormData({...formData, idUsuario: Number(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map(usuario => (
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

              <div className="space-y-2">
                <Label>Puntos*</Label>
                <Input
                  type="number"
                  value={formData.puntos || 0}
                  onChange={e => setFormData({...formData, puntos: Number(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha de Canje*</Label>
                <Input
                  type="date"
                  value={formData.fechaCanje}
                  onChange={e => setFormData({...formData, fechaCanje: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {currentPunto ? "Guardar Cambios" : "Crear Registro"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={async () => {
          if (currentPunto?.idPuntosUsuario) {
            await puntosUsuarioApi.delete(currentPunto.idPuntosUsuario);
            setPuntos(puntos.filter(p => p.idPuntosUsuario !== currentPunto.idPuntosUsuario));
          }
        }}
        title="Confirmar Eliminación"
        description="¿Está seguro de eliminar este registro de puntos?"
      />
    </Layout>
  );
};

export default Puntos;