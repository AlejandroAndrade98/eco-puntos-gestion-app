
import { PuntosUsuario } from "./types";
import { fetchData, fetchById, createData, updateData, deleteData } from "./api-utils";

export const puntosUsuarioApi = {
  getAll: () => fetchData<PuntosUsuario>("PuntosUsuario/Lista"),
  getById: (id: number) => fetchById<PuntosUsuario>("PuntosUsuario", id),
  create: (puntos: PuntosUsuario) => createData<PuntosUsuario>("PuntosUsuario/Nuevo", puntos),
  update: (id: number, puntos: PuntosUsuario) => updateData<PuntosUsuario>("PuntosUsuario/Editar", puntos),
  delete: (id: number) => deleteData("PuntosUsuario", id)
};
