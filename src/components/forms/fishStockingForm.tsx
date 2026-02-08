import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { toast } from 'react-toastify'
import type { FishStockingData } from '../../types/form.types'

interface FishStockingFormProps {
  locations: string[]
  location?: string
  date?: string
  onLocationChange?: (location: string) => void
  onDateChange?: (date: string) => void
}

function FishStockingForm({ locations: initialLocations, location: initialLocation, date: initialDate, onLocationChange, onDateChange }: FishStockingFormProps) {
  const [locations, setLocations] = useState<string[]>(initialLocations || [])
  const [fishTypes, setFishTypes] = useState<string[]>([])
  const [formData, setFormData] = useState({
    location: initialLocation || '',
    type: '',
    kg: '',
    date: initialDate || new Date().toISOString().split('T')[0],
    quantity: '',
  })

  useEffect(() => {
    const fetchFishTypes = async () => {
      const result = await api.getFishTypes()

      if (result.success && result.fishTypes && result.fishTypes.length > 0) {
        setFishTypes(result.fishTypes)
      }
    }
    fetchFishTypes()
  }, [])

  useEffect(() => {
    if (initialLocations && initialLocations.length > 0) {
      setLocations(initialLocations)
    }
  }, [initialLocations])

  useEffect(() => {
    if (initialLocation) {
      setFormData(prev => ({ ...prev, location: initialLocation }))
    }
  }, [initialLocation])

  useEffect(() => {
    if (initialDate) {
      setFormData(prev => ({ ...prev, date: initialDate }))
    }
  }, [initialDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.location) {
      toast.error('Пожалуйста, выберите пруд')
      return
    }
    
    if (!formData.date) {
      toast.error('Пожалуйста, выберите дату')
      return
    }

    if (!formData.type) {
      toast.error('Пожалуйста, выберите тип рыбы')
      return
    }

    if (!formData.kg || formData.kg.trim() === '') {
      toast.error('Пожалуйста, введите вес (кг)')
      return
    }

    if (!formData.quantity || formData.quantity.trim() === '') {
      toast.error('Пожалуйста, введите количество')
      return
    }

    const kgValue = parseFloat(formData.kg.replace(',', '.'))
    if (isNaN(kgValue) || kgValue <= 0) {
      toast.error('Пожалуйста, введите корректный вес')
      return
    }

    const quantityValue = parseFloat(formData.quantity.replace(',', '.'))
    if (isNaN(quantityValue) || quantityValue <= 0) {
      toast.error('Пожалуйста, введите корректное количество')
      return
    }
    
    try {
      const data: FishStockingData = {
        date: formData.date,
        location: formData.location,
        type: formData.type,
        kg: kgValue,
        quantity: quantityValue
      }

      const response = await api.submitFishStocking(data)
      if (response.success) {
        toast.success(response.message || 'Данные успешно отправлены')
        // Reset form except location and date
        setFormData(prev => ({
          ...prev,
          type: '',
          kg: '',
          quantity: ''
        }))
      } else {
        toast.error(response.message || 'Не удалось отправить данные')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка сети. Пожалуйста, попробуйте снова.')
    }
  }

  return (
    <form className="pt-4" onSubmit={handleSubmit}>
      <div className="mb-5">
        <label htmlFor="location" className="block mb-2 font-medium text-sm">Пруд</label>
        <select
          id="location"
          name="location"
          value={formData.location}
          onChange={(e) => {
            const newLocation = e.target.value
            setFormData(prev => ({ ...prev, location: newLocation }))
            onLocationChange?.(newLocation)
          }}
          className="w-full p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit cursor-pointer select-custom"
        >
          <option value="">{locations.length > 0 ? 'Выберите пруд...' : 'Загрузка прудов...'}</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label htmlFor="date" className="block mb-2 font-medium text-sm">Дата</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={(e) => {
            const newDate = e.target.value
            setFormData(prev => ({ ...prev, date: newDate }))
            onDateChange?.(newDate)
          }}
          className="w-full p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit min-h-12 max-w-full date-input"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="type" className="block mb-2 font-medium text-sm">Тип рыбы</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={(e) => {
            const newType = e.target.value
            setFormData(prev => ({ ...prev, type: newType }))
          }}
          className="w-full p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit cursor-pointer select-custom"
        >
          <option value="">{fishTypes.length > 0 ? 'Выберите тип рыбы...' : 'Загрузка типов рыбы...'}</option>
          {fishTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label htmlFor="quantity" className="block mb-2 font-medium text-sm">Количество</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          step="1"
          inputMode="numeric"
          placeholder="0"
          value={formData.quantity}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
          className="w-full p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="kg" className="block mb-2 font-medium text-sm">Общий вес (кг)</label>
        <input
          type="text"
          id="kg"
          name="kg"
          inputMode="decimal"
          pattern="[0-9]+([.,][0-9]+)?"
          placeholder="0,0"
          value={formData.kg}
          onChange={(e) => {
            const value = e.target.value
            if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
              setFormData(prev => ({ ...prev, kg: value }))
            }
          }}
          className="w-full p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit"
        />
      </div>

      <button
        type="submit"
        className="w-full px-6 py-3 bg-[var(--tg-theme-button-color,#0088cc)] text-[var(--tg-theme-button-text-color,#ffffff)] border-none rounded-lg cursor-pointer text-sm font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Отправить
      </button>
    </form>
  )
}

export default FishStockingForm
