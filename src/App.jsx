import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginGoogle from './pages/LoginGoogle'
import NewQuotationWizard from './pages/NewQuotationWizard'
import CompanyConfigPage from './pages/CompanyConfigPage'
import BottomNav from './components/BottomNav'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Cargando ProformaPro...</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
          <Routes>
            <Route path="/login" element={<LoginGoogle />} />
            <Route path="/new" element={
              <PrivateRoute>
                <NewQuotationWizard />
              </PrivateRoute>
            } />
            <Route path="/company" element={
              <PrivateRoute>
                <CompanyConfigPage />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/new" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
