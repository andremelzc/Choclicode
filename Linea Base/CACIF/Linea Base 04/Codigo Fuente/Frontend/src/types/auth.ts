export interface User {
  id: string;
  university_code: string;
  full_name: string;
  rol: "estudiante" | "profesor" | "admin" | "invitado";
}
