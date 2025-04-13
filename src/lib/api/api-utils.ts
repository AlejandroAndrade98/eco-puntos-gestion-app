import { toast } from "sonner";
import { API_URL } from "./types";

// Función de fetch con logging para ver el proceso
export const fetchWithLogging = async (url: string, options?: RequestInit) => {
  console.log(`Fetching: ${url}`);
  try {
    const response = await fetch(url, options);
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${errorText}`);
      throw new Error(`Error: ${response.statusText} - ${errorText}`);
    }
    
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      data = await response.text();
      try {
        // Try to parse as JSON anyway in case the content-type header is wrong
        data = JSON.parse(data);
      } catch (e) {
        // It's not JSON, keep as text
      }
    }
    
    console.log("Response data:", data);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// Funciones genéricas para el manejo de la API
export async function fetchData<T>(endpoint: string): Promise<T[]> {
  try {
    console.log(`Fetching data from ${API_URL}${endpoint}`);
    const data = await fetchWithLogging(`${API_URL}${endpoint}`);
    
    if (!data) {
      console.warn(`No data returned from ${endpoint}`);
      return [];
    }
    
    // Make sure we return an array even if the API returns a single object
    if (Array.isArray(data)) {
      return data;
    } else if (typeof data === 'object') {
      return [data as T];
    }
    
    return [];
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    toast.error(`Error al cargar datos: ${(error as Error).message}`);
    throw error; // Let the caller handle the error
  }
}

export async function fetchById<T>(endpoint: string, id: number): Promise<T | null> {
  try {
    const data = await fetchWithLogging(`${API_URL}${endpoint}/${id}`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}/${id}:`, error);
    toast.error(`Error al cargar datos: ${(error as Error).message}`);
    return null;
  }
}

export async function createData<T>(endpoint: string, data: T): Promise<T | null> {
  try {
    console.log(`Creating data in ${endpoint}:`, data);
    const responseData = await fetchWithLogging(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    toast.success("Registro creado exitosamente");
    return responseData;
  } catch (error) {
    console.error(`Failed to create ${endpoint}:`, error);
    toast.error(`Error al crear registro: ${(error as Error).message}`);
    return null;
  }
}

export async function updateData<T>(endpoint: string, id: number, data: T): Promise<T | null> {
  try {
    const response = await fetchWithLogging(`${API_URL}${endpoint}/${id}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({...data, idUsuario: id}), // Asegurar envío de ID
    });
    
    // Manejar diferentes códigos de estado
    if (response.status === 409) {
      throw new Error("El correo electrónico ya está registrado");
    }
    
    const responseData = response.status === 204 ? data : await response.json();
    toast.success("Registro actualizado exitosamente");
    return responseData as T;
  } catch (error) {
    console.error(`Update error for ID ${id}:`, error);
    toast.error(`Error al actualizar: ${(error as Error).message}`);
    return null;
  }
}

export async function deleteData(endpoint: string, id: number): Promise<boolean> {
  try {
    const response = await fetchWithLogging(`${API_URL}${endpoint}`, { // Eliminamos /${id} de la URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Id: id }) // Envía el ID en el cuerpo con mayúscula
    });

    // Verificar estado de la respuesta
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    toast.success("Registro eliminado exitosamente");
    return true;
  } catch (error) {
    console.error(`Failed to delete ${endpoint}:`, error);
    toast.error(`Error al eliminar registro: ${(error as Error).message}`);
    return false;
  }
}