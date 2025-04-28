
import { Recoleccion } from "./types";
import { fetchData, fetchById, createData, updateData, deleteData } from "./api-utils";

export const recoleccionesApi = {
  getAll: async () => {
    try {
      console.log("Calling getAll in recoleccionesApi");
      const result = await fetchData<Recoleccion>("Recolectar/Lista");
      console.log("Recolecciones API result:", result);
      return result || [];
    } catch (error) {
      console.error("Error in recolecciones getAll:", error);
      return [];
    }
  },
  getById: (id: number) => fetchById<Recoleccion>("Recolectar", id),
  getByUsuario: (idUsuario: number) => fetchData<Recoleccion>(`Recolectar/Usuario/${idUsuario}`),
  create: async (recoleccion: Recoleccion) => {
    try {
      console.log("Creating new recoleccion:", recoleccion);
      const result = await createData<Recoleccion>("Recolectar/Nuevo", recoleccion);
      console.log("Create recoleccion result:", result);
      return result;
    } catch (error) {
      console.error("Error creating recoleccion:", error);
      return null;
    }
  },
  update: (id: number, recoleccion: Recoleccion) => {
    const recoleccionWithId = {
      ...recoleccion,
      idRecoleccion: id
    };
    return updateData<Recoleccion>("Recolectar/Editar", recoleccionWithId);
  },
  delete: (id: number) => deleteData("Recolectar/Eliminar", id),
};
