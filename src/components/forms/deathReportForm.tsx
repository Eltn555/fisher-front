import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { toast } from 'react-toastify'
import type { DeathReportData } from '../../types/form.types'

interface DeathReportFormProps {
  locations: string[]
  location?: string
  date?: string
  onLocationChange?: (location: string) => void
  onDateChange?: (date: string) => void
}

interface DataRow {
  id: number
  type: string
  kg: string
}

function DeathReportForm({ locations: initialLocations, location: initialLocation, date: initialDate, onLocationChange, onDateChange }: DeathReportFormProps) {
  const [locations, setLocations] = useState<string[]>(initialLocations || [])
  const [fishTypes, setFishTypes] = useState<string[]>([])
  const [location, setLocation] = useState(initialLocation || '')
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0])
  const [dataRows, setDataRows] = useState<DataRow[]>([{ id: 1, type: '', kg: '' }])

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
      setLocation(initialLocation)
    }
  }, [initialLocation])

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate)
    }
  }, [initialDate])

  const updateDataRow = (id: number, field: 'type' | 'kg', value: string) => {
    setDataRows(prev => {
      const updated = prev.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
      
      // If the current row is the last one and both fields have values, add a new empty row
      const currentRow = updated.find(row => row.id === id)
      const lastRow = updated[updated.length - 1]
      
      if (currentRow && id === lastRow.id) {
        const hasType = currentRow.type.trim() !== ''
        const hasKg = currentRow.kg.trim() !== ''
        
        // If both fields are filled in the last row, add a new empty row
        if (hasType && hasKg) {
          const newId = Math.max(...updated.map(r => r.id), 0) + 1
          return [...updated, { id: newId, type: '', kg: '' }]
        }
      }
      
      return updated
    })
  }

  const removeDataRow = (id: number) => {
    if (dataRows.length > 1) {
      setDataRows(prev => prev.filter(row => row.id !== id))
    } else {
      // Clear the values instead of removing
      setDataRows([{ id: 1, type: '', kg: '' }])
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

    // Get all data rows with both type and kg
    const validRows = dataRows
      .filter(row => row.type.trim() !== '' && row.kg.trim() !== '')
      .map(row => {
        const kgValue = parseFloat(row.kg.replace(',', '.'))
        if (isNaN(kgValue) || kgValue <= 0) {
          return null
        }
        return {
          type: row.type.trim(),
          kg: kgValue
        }
      })
      .filter((row): row is { type: string; kg: number } => row !== null)
    
    if (validRows.length === 0) {
      toast.error('Пожалуйста, введите хотя бы одну запись с типом и весом')
      return
    }
    
    try {
      const data: DeathReportData = {
        date,
        location,
        data: validRows
      }

      const response = await api.submitDeathReport(data)
      if (response.success) {
        toast.success(response.message || 'Данные успешно отправлены')
        // Reset form except location and date
        setDataRows([{ id: 1, type: '', kg: '' }])
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
        <label className="block mb-2 font-medium text-sm">Данные об убыли</label>
        <div className="space-y-2">
          {dataRows.map((row) => (
            <div key={row.id} className="flex gap-2 items-center">
              <select
                value={row.type}
                onChange={(e) => updateDataRow(row.id, 'type', e.target.value)}
                onBlur={() => {
                  const emptyRowsCount = dataRows.filter(r => !r.type.trim() && !r.kg.trim()).length
                  if (dataRows.length > 1 && !row.type.trim() && !row.kg.trim() && emptyRowsCount > 1) {
                    removeDataRow(row.id)
                  }
                }}
                className="flex-1 p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit cursor-pointer select-custom"
              >
                <option value="">{fishTypes.length > 0 ? 'Тип рыбы...' : 'Загрузка...'}</option>
                {fishTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]+([.,][0-9]+)?"
                placeholder="Вес (кг)"
                value={row.kg}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value)) {
                    updateDataRow(row.id, 'kg', value)
                  }
                }}
                onBlur={() => {
                  const emptyRowsCount = dataRows.filter(r => !r.type.trim() && !r.kg.trim()).length
                  if (dataRows.length > 1 && !row.type.trim() && !row.kg.trim() && emptyRowsCount > 1) {
                    removeDataRow(row.id)
                  }
                }}
                className="flex-1 p-3 border border-[var(--tg-theme-hint-color,#999999)] rounded-lg text-base bg-[var(--tg-theme-bg-color,#ffffff)] text-[var(--tg-theme-text-color,#000000)] font-inherit"
              />
              {dataRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const CountEmptyRows = dataRows.filter(r => !r.type.trim() && !r.kg.trim()).length
                    const isEmpty = !row.type.trim() && !row.kg.trim()
                    if (CountEmptyRows > 0 && !isEmpty) {
                      removeDataRow(row.id)
                    }
                  }}
                  className="px-4 py-3 bg-[#dc3545] text-white rounded-lg cursor-pointer text-sm font-medium hover:opacity-90 min-w-[50px]"
                >
                  ✕
                </button>
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

export default DeathReportForm
