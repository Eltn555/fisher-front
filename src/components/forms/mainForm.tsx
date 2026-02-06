import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { toast } from 'react-toastify'

interface MainFormProps {
  locations: string[]
  location?: string
  date?: string
  user?: any
  onLocationChange?: (location: string) => void
  onDateChange?: (date: string) => void
}

function MainForm({ locations: initialLocations, location: initialLocation, date: initialDate, user: initialUser, onLocationChange, onDateChange }: MainFormProps) {
  const [locations, setLocations] = useState<string[]>(initialLocations || [])
  const [formData, setFormData] = useState({
    location: initialLocation || '',
    oxygen: '',
    temperature: '',
    saturation: '',
    pH: '',
    feed: '',
    date: initialDate || new Date().toISOString().split('T')[0]
  })

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

    if (!formData.oxygen && !formData.temperature && !formData.saturation && !formData.pH && !formData.feed) {
      toast.error('Пожалуйста, заполните хотя бы одно поле')
      return
    }
    
    try {
      const response = await api.submitMainForm(formData)
      if (response.success) { 
        toast.success(response.message || 'Данные успешно отправлены')
        // Reset form except location and date
        setFormData({
          ...formData,
          oxygen: '',
          temperature: '',
          saturation: '',
          pH: '',
          feed: ''
        })
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
            setFormData({ ...formData, location: newLocation })
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
        <label htmlFor="oxygen" className="block mb-2 font-medium text-sm">Кислород в воде (мг/л)</label>
        <input
          type="number"
          id="oxygen"
          name="oxygen"
          step="0.1"
          inputMode="decimal"
          placeholder="0.0"
          value={formData.oxygen}
          onChange={(e) => setFormData({ ...formData, oxygen: e.target.value })}
          className="w-full p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="temperature" className="block mb-2 font-medium text-sm">Температура воды (°C)</label>
        <input
          type="number"
          id="temperature"
          name="temperature"
          step="0.1"
          inputMode="decimal"
          placeholder="0.0"
          value={formData.temperature}
          onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
          className="w-full p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="saturation" className="block mb-2 font-medium text-sm">Сатурация воды (%)</label>
        <input
          type="number"
          id="saturation"
          name="saturation"
          step="0.1"
          inputMode="decimal"
          placeholder="0.0"
          value={formData.saturation}
          onChange={(e) => setFormData({ ...formData, saturation: e.target.value })}
          className="w-full p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="pH" className="block mb-2 font-medium text-sm">pH</label>
        <input
          type="number"
          id="pH"
          name="pH"
          step="0.1"
          inputMode="decimal"
          placeholder="0.0"
          value={formData.pH}
          onChange={(e) => setFormData({ ...formData, pH: e.target.value })}
          className="w-full p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="pH" className="block mb-2 font-medium text-sm">Выдано корма (кг)</label>
        <input
          type="number"
          id="feed"
          name="feed"
          step="0.1"
          inputMode="decimal"
          placeholder="0.0"
          value={formData.feed}
          onChange={(e) => setFormData({ ...formData, feed: e.target.value })}
          className="w-full p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit"
        />
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
            setFormData({ ...formData, date: newDate })
            onDateChange?.(newDate)
          }}
          className="w-full p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit min-h-12 max-w-full date-input"
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

export default MainForm
