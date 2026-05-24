import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./app/page"
import LoginPage from "./app/login/page"
import ChatPage from "./app/(chat)/page"
import { AuthProvider } from "./features/auth/context/AuthContext"
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/chat" element={<ChatPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
