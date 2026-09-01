import React, { useState } from 'react'

export default function NewQuotationWizard() {
  const [clientName, setClientName] = useState('')
  const [items, setItems] = useState([{ description: '', qty: 1, price: 0 }])

  const addItem = () => {
    setItems([...items, { description: '', qty: 1, price: 0 }])
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const total = items.reduce((acc, item) => acc + (item.qty * item.price), 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Cotización generada con éxito para ${clientName}. Total: $${total}`)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-6 mb-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nueva Cotización</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Cliente</label>
          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Ej. Juan Pérez"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700">Artículos o Servicios</label>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
              + Agregar otro
            </button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Descripción"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                className="flex-grow px-3 py-2 border border-slate-300 rounded-lg text-sm"
                required
              />
              <input
                type="number"
                placeholder="Cant"
                value={item.qty}
                onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                className="w-16 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                min="1"
                required
              />
              <input
                type="number"
                placeholder="Precio"
                value={item.price}
                onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                min="0"
                step="0.01"
                required
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-lg font-bold text-slate-900 border-t pt-4">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md"
        >
          Generar Cotización
        </button>
      </form>
    </div>
  )
}
