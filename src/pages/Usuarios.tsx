
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { Usuario, usuariosApi, localidadesApi, Localidad } from "@/lib/api";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { UsuariosForm } from "@/components/usuarios/UsuariosForm";
import { DeleteUsuarioDialog } from "@/components/usuarios/DeleteUsuarioDialog";
import UsuariosTable from "@/components/usuarios/UsuariosTable";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching usuarios data...");
        const usuariosData = await usuariosApi.getAll();
        console.log("Usuarios RAW desde API:", usuariosData);

        const usuariosNormalizados = usuariosData.map((u: any) => ({
          idUsuario: u.idusuario,     // minúscula → camelCase
          idLocalidad: u.idlocalidad, // minúscula → camelCase
          nombre: u.nombre,
          apellidos: u.apellidos,
          telefono: u.telefono,
          email: u.email,
          direccion: u.direccion,
          rol: u.rol,
        }));
        setUsuarios(usuariosNormalizados);
  
        console.log("Fetching localidades data...");
        const localidadesData = await localidadesApi.getAll();
        console.log("Localidades RAW desde API:", localidadesData);
        
        const normalizedLocalidades = localidadesData.map((l: any) => ({
          idLocalidad: Number(l.idLocalidad ?? l.idlocalidad ?? 0), // Conversión a número
          nombre: l.nombre,
        }));
        
        console.log("Localidades Normalizadas:", normalizedLocalidades);
        setLocalidades(normalizedLocalidades);
  
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Error al cargar datos: ${(err as Error).message}`);
        toast.error(`Error al cargar datos: ${(err as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleAdd = () => {
    setCurrentUsuario(null);
    setIsFormDialogOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setCurrentUsuario(usuario);
    setIsFormDialogOpen(true);
  };

  const handleDelete = (usuario: Usuario) => {
    if (!usuario || usuario.idUsuario === undefined || usuario.idUsuario === null) {
      toast.error("No se puede eliminar: Usuario sin identificador");
      return;
    }
    
    setCurrentUsuario(usuario);
    setIsDeleteDialogOpen(true);
  };

  const handleUsuarioSaved = (usuario: Usuario) => {
    if (currentUsuario?.idUsuario) {
      setUsuarios(prev => prev.map(u => 
        u.idUsuario === usuario.idUsuario ? usuario : u
      ));
    } else {
      setUsuarios(prev => [...prev, usuario]);
    }
    setIsFormDialogOpen(false);
  };

  const handleUsuarioDeleted = (deletedId: number) => {
    setUsuarios(prev => prev.filter(u => u.idUsuario !== deletedId));
  };

  const columns = [
    {
      key: "idUsuario",
      header: "ID",
      // Asegúrate de que usuario.idUsuario no sea undefined
      cell: (usuario: Usuario) => usuario.idUsuario ?? "N/A",
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
        const localidadId = Number(usuario.idLocalidad); // Convertir a número
        const localidad = localidades.find(l => l.idLocalidad === localidadId);
        return localidad?.nombre || "N/A";
      },
    },
    {
      key: "rol",
      header: "Rol",
      cell: (usuario: Usuario) => usuario.rol,
    },
  ];
  

  return (
    <Layout>
      <PageHeader 
        title="Gestión de Usuarios" 
        description="Administre los usuarios del sistema"
        action={{
          label: "Nuevo Usuario",
          onClick: handleAdd,
          icon: <Plus size={16} />,
        }}
      />

      <UsuariosTable
        usuarios={usuarios}
        localidades={localidades}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        error={error}
      />

      <UsuariosForm
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        currentUsuario={currentUsuario}
        localidades={localidades}
        onSuccess={handleUsuarioSaved}
      />

      <DeleteUsuarioDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        usuario={currentUsuario}
        onSuccess={handleUsuarioDeleted}
      />
    </Layout>
  );
};


export default Usuarios;
