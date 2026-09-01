import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function CompanyConfigPage() {
  const { user, company, refreshCompany } = useAuth()
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    tax_id: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    country: '',
    currency: 'USD',
    tax_rate: 18,
    terms: 'Pago 50% al contado y 50% al finalizar el trabajo.'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (company) {
      setFormData({
        business_name: company.business_name || '',
        owner_name: company.owner_name || '',
        tax_id: company.tax_id || '',
        phone: company.phone || '',
        whatsapp: company.whatsapp || '',
        email: company.email || '',
        address: company.address || '',
        city: company.city || '',
        country: company.country || '',
        currency: company.currency || 'USD',
        tax_rate: company.tax_rate ?? 18,
        terms: company.terms || ''
      })
    }
  }, [company])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.business_name) {
      alert("El nombre de la empresa es obligatorio.")
      return
    }

    setLoading(true)
    try {
      if (company?.id) {
        // Actualizar empresa existente
        const { error } = await supabase
          .from('companies')
          .update(formData)
          .eq('id', company.id)
        if (error) throw error
      } else {
        // Crear registro de empresa nuevo
        const { error } = await supabase
          .from('companies')
          .insert([{ ...formData, user_id: user.id }])
        if (error) throw error
      }

      if (refreshCompany) await refreshCompany()
      alert("¡Datos de la empresa guardados con éxito!")
    } catch (err) {
      console.error("Error al guardar empresa:", err)
      alert("Hubo un error al guardar los datos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-24 max-w-xl mx-auto p-4">
      <div className="bg-slate-800 text-white p-4 rounded-xl mb-4 shadow">
        <h2 className="text-lg font-bold">⚙️ Datos de mi Empresa</h2>
        <p className="text-xs text-slate-300">Esta información aparecerá automáticamente en las cotizaciones y PDFs.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow border border-slate-200 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Nombre de la Empresa / Negocio *</label>
          <input 
            type="text" name="business_name" value={formData.business_name} onChange={handleChange} 
            className="w-full p-3 border rounded-lg text-sm" placeholder="Ej: Tecnovigilancia Marc" required 
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Propietario / Responsable</label>
            <input 
              type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} 
              className="w-full p-3 border rounded-lg text-sm" placeholder="Tu nombre" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">RUC / NIT / DNI</label>
            <input 
              type="text" name="tax_id" value={formData.tax_id} onChange={handleChange} 
              className="w-full p-3 border rounded-lg text-sm" placeholder="Identificador fiscal" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono</label>
            <input 
              type="text" name="phone" value={formData.phone} onChange={handleChange} 
              className="w-full p-3 border rounded-lg text-sm" placeholder="Teléfono de contacto" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">WhatsApp</label>
            <input 
              type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} 
              className="w-full p-3 border rounded-lg text-sm" placeholder="Número de WhatsApp" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Correo Electrónico</label>
          <input 
            type="email" name="email" value={formData.email} onChange={handleChange} 
            className="w-full p-3 border rounded-lg text-sm" placeholder="correo@empresa.com" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Dirección Física</label>
          <input 
            type="text" name="address" value={formData.address} onChange={handleChange} 
            className="w-full p-3 border rounded-lg text-sm" placeholder="Calle, número, ciudad" 
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Moneda</label>
            <select 
              name="currency" value={formData.currency} onChange={handleChange}
              className="w-full p-3 border rounded-lg text-sm bg-slate-50"
            >
              <option value="USD">Dólar (USD $)</option>
              <option value="PEN">Sol Peruano (PEN S/)</option>
              <option value="EUR">Euro (€)</option>
              <option value="COP">Peso Colombiano (COP)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Porcentaje IVA / IGV (%)</label>
            <input 
              type="number" step="0.01" name="tax_rate" value={formData.tax_rate} onChange={handleChange} 
              className="w-full p-3 border rounded-lg text-sm" placeholder="18" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Términos y Condiciones Predeterminados</label>
          <textarea 
            rows="3" name="terms" value={formData.terms} onChange={handleChange} 
            className="w-full p-3 border rounded-lg text-sm" placeholder="Garantía, formas de pago, validez..."
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700 transition"
        >
          {loading ? 'Guardando...' : '💾 Guardar Datos de la Empresa'}
        </button>
      </form>
    </div>
  )
            }
