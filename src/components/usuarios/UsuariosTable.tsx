
import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Usuario, Localidad } from "@/lib/api";

interface UsuariosTableProps {
  usuarios: Usuario[];
  localidades: Localidad[];
  onAdd: () => void;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  isLoading: boolean;
  error: string | null;
}


const UsuariosTable = ({ 
  usuarios, 
  localidades, 
  onAdd, 
  onEdit, 
  onDelete, 
  isLoading, 
  error 
}: UsuariosTableProps) => {
  
  // Define columns for data table
  const columns = [
    {
      key: "idUsuario",
      header: "ID",
      cell: (usuario: Usuario) => usuario.idUsuario || "N/A",
    },
    {
      key: "nombre",
      header: "Nombre",
      cell: (usuario: Usuario) => `${usuario.nombre} ${usuario.apellidos}`,
    },
    {
      key: "telefono",
      header: "Teléfono",
      cell: (usuario: Usuario) => usuario.telefono,
    },
    {
      key: "email",
      header: "Email",
      cell: (usuario: Usuario) => usuario.email || "N/A",
    },
    {
      key: "localidad",
      header: "Localidad",
      cell: (usuario: Usuario) => {
        const localidad = localidades.find(l => l.idLocalidad === usuario.idLocalidad);
        return localidad?.nombre || "N/A";
      },
    },
    {
      key: "rol",
      header: "Rol",
      cell: (usuario: Usuario) => usuario.rol,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <DataTable
      data={usuarios || []}
      columns={columns}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      getItemId={(usuario) => usuario.idUsuario?.toString() || Math.random().toString()}
      title="Usuarios"
      addButtonText="Nuevo Usuario"
    />
  );
};

export default UsuariosTable;
