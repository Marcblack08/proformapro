import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/login') return null

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg px-6 py-3 flex justify-around items-center max-w-md mx-auto rounded-t-2xl z-50">
      <button
        onClick={() => navigate('/new')}
        className={`flex flex-col items-center text-xs font-medium transition-colors ${location.pathname === '/new' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
      >
        <span>📄 Cotizar</span>
      </button>
      <button
        onClick={() => navigate('/company')}
        className={`flex flex-col items-center text-xs font-medium transition-colors ${location.pathname === '/company' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
      >
        <span>🏢 Empresa</span>
      </button>
      <button
        onClick={handleLogout}
        className="flex flex-col items-center text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
      >
        <span>🚪 Salir</span>
      </button>
    </div>
  )
}
