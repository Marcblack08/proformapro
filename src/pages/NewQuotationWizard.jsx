import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { generateQuotationPDF } from '../utils/pdfGenerator'

export default function NewQuotationWizard() {
  const { user, company } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Datos del formulario
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [newClient, setNewClient] = useState({ name: '', company: '', document: '', phone: '', whatsapp: '', email: '', address: '', notes: '' })
  
  // Descripción y mejora con IA
  const [workDescription, setWorkDescription] = useState('')
  const [improvingAI, setImprovingAI] = useState(false)

  // Catálogos para selección rápida
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [quotationItems, setQuotationItems] = useState([])

  // Totales y estado
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchClients()
      fetchProductsAndServices()
    }
  }, [user])

  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('*').eq('user_id', user.id).order('name')
    if (data) setClients(data)
  }

  const fetchProductsAndServices = async () => {
    const { data: prodData } = await supabase.from('products').select('*').eq('user_id', user.id)
    const { data: servData } = await supabase.from('services').select('*').eq('user_id', user.id)
    if (prodData) setProducts(prodData)
    if (servData) setServices(servData)
  }

  // IA para mejorar la descripción del trabajo
  const handleImproveWithAI = async () => {
    if (!workDescription.trim()) return
    setImprovingAI(true)
    try {
      const response = await fetch('https://nzhwryjgyiwflvnaygsq.supabase.co/functions/v1/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: workDescription, type: 'enhance' })
      })
      const data = await response.json()
      if (data.result) {
        setWorkDescription(data.result.trim())
      }
    } catch (err) {
      console.error("Error al mejorar con IA:", err)
      alert("No se pudo conectar con el servicio de IA. Puedes editar el texto manualmente.")
    } finally {
      setImprovingAI(false)
    }
  }

  // Guardar nuevo cliente si aplica
  const handleSaveClientAndContinue = async () => {
    if (selectedClient === 'new') {
      if (!newClient.name) {
        alert("El nombre del cliente es obligatorio.")
        return
      }
      setLoading(true)
      const { data, error } = await supabase.from('clients').insert([{ ...newClient, user_id: user.id }]).select().single()
      setLoading(false)
      if (error) {
        alert("Error al guardar cliente: " + error.message)
        return
      }
      setSelectedClient(data.id)
    }
    if (!selectedClient && selectedClient !== 'new') {
      alert("Selecciona o crea un cliente para continuar.")
      return
    }
    setStep(2)
  }

  // Añadir ítem a la cotización
  const addItem = (item, type) => {
    const newItem = {
      item_type: type, // 'producto' o 'servicio'
      description: item.name + (item.description ? ` - ${item.description}` : ''),
      quantity: 1,
      unit: item.unit || 'unidad',
      unit_price: item.sale_price || item.price || 0,
      subtotal: item.sale_price || item.price || 0
    }
    setQuotationItems([...quotationItems, newItem])
  }

  const updateItemQuantity = (index, qty) => {
    const updated = [...quotationItems]
    const q = parseFloat(qty) || 0
    updated[index].quantity = q
    updated[index].subtotal = q * updated[index].unit_price
    setQuotationItems(updated)
  }

  const removeItem = (index) => {
    setQuotationItems(quotationItems.filter((_, i) => i !== index))
  }

  // Cálculos financieros
  const subtotal = quotationItems.reduce((acc, item) => acc + item.subtotal, 0)
  const taxRate = company?.tax_rate || 18
  const taxAmount = ((subtotal - Number(discount)) * taxRate) / 100
  const total = Math.max(0, (subtotal - Number(discount)) + taxAmount)

  // Guardar y Generar PDF final
  const handleFinishAndSave = async () => {
    setLoading(true)
    try {
      const quotationNumber = 'COT-' + Math.floor(100000 + Math.random() * 900000)
      
      const clientObj = selectedClient === 'new' 
        ? newClient 
        : clients.find(c => c.id === selectedClient)

      // 1. Guardar cabecera de cotización
      const { data: quotData, error: quotError } = await supabase.from('quotations').insert([{
        user_id: user.id,
        client_id: selectedClient !== 'new' ? selectedClient : null,
        quotation_number: quotationNumber,
        type: 'cotizacion',
        status: 'enviada',
        work_description: workDescription,
        subtotal,
        discount: Number(discount),
        tax_amount: taxAmount,
        total,
        valid_until: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0]
      }]).select().single()

      if (quotError) throw quotError

      // 2. Guardar ítems de la cotización
      if (quotationItems.length > 0) {
        const itemsToInsert = quotationItems.map(item => ({
          quotation_id: quotData.id,
          ...item
        }))
        await supabase.from('quotation_items').insert(itemsToInsert)
      }

      // 3. Generar PDF Profesional automáticamente
      generateQuotationPDF({ ...quotData, items: quotationItems }, clientObj, company)

      alert("¡Cotización creada y PDF generado con éxito!")
      navigate('/')
    } catch (err) {
      console.error("Error al guardar cotización:", err)
      alert("Hubo un error al guardar la cotización.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-24 max-w-xl mx-auto p-4">
      {/* Barra de Progreso */}
      <div className="flex items-center justify-between mb-6 bg-slate-800 p-4 rounded-xl text-white">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">Paso {step} de 3</span>
          <h2 className="text-lg font-bold">
            {step === 1 && '1. Seleccionar Cliente'}
            {step === 2 && '2. Trabajo y Materiales'}
            {step === 3 && '3. Revisión y Totales'}
          </h2>
        </div>
        <div className="text-2xl">⚡</div>
      </div>

      {/* PASO 1: CLIENTE */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cliente Existente</label>
            <select 
              className="w-full p-3 border rounded-lg bg-slate-50 text-slate-800"
              onChange={(e) => setSelectedClient(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Seleccione un cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="text-center text-slate-400 text-sm font-medium">O bien, registra uno nuevo:</div>

          <div className="bg-white p-4 rounded-xl shadow border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800">Nuevo Cliente</h3>
            <input 
              type="text" placeholder="Nombre completo *" 
              className="w-full p-3 border rounded-lg"
              value={newClient.name} onChange={e => { setNewClient({...newClient, name: e.target.value}); setSelectedClient('new'); }}
            />
            <input 
              type="text" placeholder="Empresa (Opcional)" 
              className="w-full p-3 border rounded-lg"
              value={newClient.company} onChange={e => setNewClient({...newClient, company: e.target.value})}
            />
            <input 
              type="text" placeholder="Teléfono / WhatsApp" 
              className="w-full p-3 border rounded-lg"
              value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})}
            />
            <input 
              type="text" placeholder="Dirección del trabajo" 
              className="w-full p-3 border rounded-lg"
              value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})}
            />
          </div>

          <button 
            onClick={handleSaveClientAndContinue}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            Siguiente: Describir Trabajo ➔
          </button>
        </div>
      )}

      {/* PASO 2: DESCRIPCIÓN DEL TRABAJO Y MATERIALES */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2">¿Qué trabajo se realizará?</label>
            <textarea 
              rows="3" 
              placeholder="Ej: Instalar cámaras de seguridad en local comercial..."
              className="w-full p-3 border rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              value={workDescription}
              onChange={e => setWorkDescription(e.target.value)}
            />
            <button 
              onClick={handleImproveWithAI}
              disabled={improvingAI}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-purple-50 text-purple-700 font-semibold py-2.5 rounded-lg border border-purple-200 hover:bg-purple-100 transition text-sm"
            >
              {improvingAI ? '✨ Mejorando con IA...' : '✨ Mejorar descripción con IA'}
            </button>
          </div>

          {/* Selección Rápida de Mano de Obra y Materiales */}
          <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-2">Añadir Servicios / Materiales</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <select 
                onChange={(e) => { const s = services.find(x => x.id === e.target.value); if(s) addItem(s, 'servicio'); e.target.value = ""; }}
                defaultValue=""
                className="p-2.5 border rounded-lg text-xs bg-slate-50"
              >
                <option value="" disabled>+ Mano de Obra...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.price})</option>)}
              </select>

              <select 
                onChange={(e) => { const p = products.find(x => x.id === e.target.value); if(p) addItem(p, 'producto'); e.target.value = ""; }}
                defaultValue=""
                className="p-2.5 border rounded-lg text-xs bg-slate-50"
              >
                <option value="" disabled>+ Material / Producto...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sale_price})</option>)}
              </select>
            </div>

            {/* Lista de Ítems añadidos */}
            <div className="space-y-2">
              {quotationItems.length === 0 ? (
                <p className="text-slate-400 text-center py-4 text-sm">No has agregado materiales o servicios todavía.</p>
              ) : (
                quotationItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
                    <div className="flex-1 pr-2">
                      <p className="text-xs font-bold text-slate-800">{item.description}</p>
                      <p className="text-xs text-slate-500">{item.unit_price} c/u</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" min="1" 
                        value={item.quantity} 
                        onChange={e => updateItemQuantity(index, e.target.value)}
                        className="w-14 p-1 text-center border rounded text-xs font-bold"
                      />
                      <button onClick={() => removeItem(index)} className="text-red-500 font-bold px-2">✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="w-1/3 bg-slate-200 text-slate-700 font-bold py-3 rounded-xl">Atrás</button>
            <button onClick={() => setStep(3)} className="w-2/3 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg">Revisar Totales ➔</button>
          </div>
        </div>
      )}

      {/* PASO 3: REVISIÓN Y TOTALES */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 border-b pb-2">Resumen Financiero</h3>
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Descuento ($):</span>
              <input 
                type="number" min="0" value={discount} 
                onChange={e => setDiscount(e.target.value)}
                className="w-24 p-1.5 border rounded text-right font-bold text-sm"
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-600">IVA / IGV ({taxRate}%):</span>
              <span className="font-bold">${taxAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg font-extrabold text-blue-600 border-t pt-2">
              <span>TOTAL A PAGAR:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="w-1/3 bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl">Atrás</button>
            <button 
              onClick={handleFinishAndSave} 
              disabled={loading}
              className="w-2/3 bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-emerald-700 transition"
            >
              {loading ? 'Generando...' : '💾 Guardar y Generar PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
      }
              
