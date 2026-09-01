import React, { useState } from 'react'

export default function CompanyConfigPage() {
  const [companyName, setCompanyName] = useState('')
  const [companyRuc, setCompanyRuc] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    alert('Datos de la empresa guardados correctamente.')
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md mt-6 mb-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Configurar Empresa</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Empresa</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Ej. Tecnovigilancia"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">RUC / Identificación</label>
          <input
            type="text"
            value={companyRuc}
            onChange={(e) => setCompanyRuc(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Ej. 10456789001"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono de Contacto</label>
          <input
            type="text"
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Ej. +51 999 999 999"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md mt-4"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  )
}
