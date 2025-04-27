
export interface Usuario {
  idUsuario?: number;
  idLocalidad?: number; // <-- Asegúrate que sea number
  // ... resto de propiedades
}

export interface Localidad {
  idLocalidad: number; // <-- Quita el '?' si siempre existe
  nombre: string;
}
