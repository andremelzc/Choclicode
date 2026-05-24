export interface User {
  id: string;
  codigo: string;
  nombre: string;
  rol: "estudiante" | "profesor" | "admin" | "invitado";
}
