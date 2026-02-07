import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { toast } from 'react-toastify'
import type { ControlCatchData } from '../../types/form.types'

interface ControlCatchFormProps {
  locations: string[]
  location?: string
  date?: string
  onLocationChange?: (location: string) => void
  onDateChange?: (date: string) => void
}

interface KgsInput {
  id: number
  value: string
}

function ControlCatchForm({ locations: initialLocations, location: initialLocation, date: initialDate, onLocationChange, onDateChange }: ControlCatchFormProps) {
  const [locations, setLocations] = useState<string[]>(initialLocations || [])
  const [location, setLocation] = useState(initialLocation || '')
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0])
  const [kgsInputs, setKgsInputs] = useState<KgsInput[]>([{ id: 1, value: '' }])

  useEffect(() => {
    if (initialLocations && initialLocations.length > 0) {
      setLocations(initialLocations)
    }
  }, [initialLocations])

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation)
    }
  }, [initialLocation])

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate)
    }
  }, [initialDate])

  const updateKgsInput = (id: number, value: string) => {
    setKgsInputs(prev => {
      const updated = prev.map(input => 
        input.id === id ? { ...input, value } : input
      )
      
      // If the current input has a value and it's the last one, add a new empty input
      const currentInput = updated.find(input => input.id === id)
      if (currentInput && currentInput.value.trim() !== '' && id === updated[updated.length - 1].id) {
        const newId = Math.max(...updated.map(i => i.id), 0) + 1
        return [...updated, { id: newId, value: '' }]
      }
      
      return updated
    })
  }

  const removeKgsInput = (id: number) => {
    if (kgsInputs.length > 1) {
      setKgsInputs(prev => prev.filter(input => input.id !== id))
    } else {
      // Clear the value instead of removing
      setKgsInputs([{ id: 1, value: '' }])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!location) {
      toast.error('Пожалуйста, выберите пруд')
      return
    }
    
    if (!date) {
      toast.error('Пожалуйста, выберите дату')
      return
    }

    // Get all kgs values
    const kgsValues = kgsInputs
      .map(input => {
        let val = input.value.trim()
        val = val.replace(',', '.')
        return val
      })
      .filter(val => val !== '')
    
    if (kgsValues.length === 0) {
      toast.error('Пожалуйста, введите хотя бы одно значение веса рыбы')
      return
    }
    
    // Validate all values are numbers
    const catchKGs: number[] = []
    for (const val of kgsValues) {
      const numValue = parseFloat(val)
      if (isNaN(numValue)) {
        toast.error('Пожалуйста, введите корректные числа')
        return
      }
      catchKGs.push(numValue)
    }
    
    try {
      const data: ControlCatchData = {
        date,
        location,
        catchKGs
      }

      const response = await api.submitControlCatch(data)
      if (response.success) {
        toast.success(response.message || 'Данные успешно отправлены')
        // Reset form except location and date
        setKgsInputs([{ id: 1, value: '' }])
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
          value={location}
          onChange={(e) => {
            const newLocation = e.target.value
            setLocation(newLocation)
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
          value={date}
          onChange={(e) => {
            const newDate = e.target.value
            setDate(newDate)
            onDateChange?.(newDate)
          }}
          className="w-full p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit min-h-12 max-w-full date-input"
        />
      </div>

      <div className="mb-5">
        <label className="block mb-2 font-medium text-sm">Вес рыбы (кг)</label>
        <div className="space-y-2">
          {kgsInputs.map((input) => (
            <div key={input.id} className="flex gap-2 items-center">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]+([.,][0-9]+)?"
                placeholder="Вес рыбы (кг)"
                value={input.value}
                onChange={(e) => updateKgsInput(input.id, e.target.value)}
                onBlur={(e) => {
                  // Only remove if there are multiple inputs, this one is empty, and there's at least one other input
                  const isEmpty = !e.target.value.trim()
                  const emptyInputsCount = kgsInputs.filter(inp => !inp.value.trim()).length
                  
                  if (kgsInputs.length > 1 && isEmpty && emptyInputsCount > 1) {
                    removeKgsInput(input.id)
                  }
                }}
                className="flex-1 p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit"
              />
              {kgsInputs.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const emptyInputsCount = kgsInputs.filter(inp => !inp.value.trim()).length
                    if (emptyInputsCount > 1) {
                      removeKgsInput(input.id)
                    }
                  }}
                  className="px-4 py-3 bg-[#dc3545] text-white rounded-lg cursor-pointer text-sm font-medium hover:opacity-90 min-w-[50px]"
                >
                  ✕</button>
              )}
            </div>
          ))}
        </div>
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

export default ControlCatchForm
