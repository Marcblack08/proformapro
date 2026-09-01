import React from 'react'
import { supabase } from '../services/supabaseClient'

export default function LoginGoogle() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/new'
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">ProformaPro</h1>
        <p className="text-slate-600 mb-8">Inicia sesión con cualquier cuenta de Google</p>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl border border-slate-300 transition duration-200 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c-.07-.8-.63-1.54-1.445-1.77H12v4.8h6.615c-.3 1.5-1.575 3.9-4.815 3.9-2.91 0-5.28-2.4-5.28-5.33s2.37-5.33 5.28-5.33c1.65 0 3.105.63 4.215 1.66l3.6-3.6C19.98 5.73 17.22 4.8 14.4 4.8 8.76 4.8 4.2 9.36 4.2 15s4.56 10.2 10.2 10.2c5.88 0 9.78-4.14 9.78-9.93 0-.6-.05-1.2-.24-1.8z"/>
          </svg>
          Continuar con Google
        </button>
      </div>
    </div>
  )
}
